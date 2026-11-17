"""Real simctl recording with a readiness handshake and retained diagnostics."""
from contextlib import contextmanager
import json
import hashlib
from pathlib import Path
import re
import signal
import subprocess
import time


def wait_for_traversal(log, errors, process, report):
    """Observe the real fixture reaching its authored stop, not a PID or sleep."""
    deadline = time.monotonic() + 120
    while time.monotonic() < deadline:
        text = log.read_text(errors='replace') if log.exists() else ''
        diagnostic = errors.read_text(errors='replace') if errors.exists() else ''
        if 'Precondition failed' in diagnostic or 'Fatal error:' in diagnostic:
            raise RuntimeError(f'Camera fixture assertion failed: {diagnostic[-2000:]}')
        if process.poll() is not None:
            raise RuntimeError('Recorder exited before camera traversal completed')
        gate = re.search(r'\[CAMERA REVIEW\].*gate=\([^,]+,\s*([-\d.]+)\)', text)
        samples = re.findall(r'\[CAMERA MOTION\] pilotY=([-\d.]+) cameraY=([-\d.]+)', text)
        if gate and '[FOCUSED REVIEW] ready code=1 ' in text and len(samples) >= 3:
            positions = [float(row[0]) for row in samples]
            # Fixture stops 51 world points south of the authored portal.
            stop = float(gate[1]) - 54
            if max(positions)-min(positions) >= 40 and min(positions[-2:]) >= stop:
                report.write_text(json.dumps({'completed': True, 'samples': len(samples),
                    'pilot_start': positions[0], 'pilot_end': positions[-1],
                    'gate_y': float(gate[1])}, indent=2))
                time.sleep(2)  # retain the rendered final approach before SIGINT
                return
        time.sleep(.2)
    raise TimeoutError('Camera did not reach its real traversal endpoint within 120s; video retained')


def scene_coverage(raw, width, height):
    """Exclude SpringBoard/launch screens using the actual focused-scene marker."""
    frame_size = width * height * 3
    if len(raw) % frame_size:
        raise RuntimeError('Truncated decoded camera frame stream')
    samples = []
    for index in range(len(raw)//frame_size):
        frame = raw[index*frame_size:(index+1)*frame_size]
        marker = (round(height*.54)*width + round(width*.94))*3
        red, green, blue = frame[marker:marker+3]
        colors = {frame[(y*width+x)*3:(y*width+x)*3+3]
                  for y in range(height//7,height*13//14,max(1,height//35))
                  for x in range(width//8,width*7//8,max(1,width//40))}
        if red >= 170 and green <= 90 and blue <= 90 and len(colors) >= 15:
            progress = (round(height*.54)*width+round(width*.90))*3
            rgb = frame[progress:progress+3]
            stage = next((code for code,channel in [(1,0),(2,1),(4,2)]
                          if rgb[channel] >= 170 and all(rgb[c] <= 90 for c in range(3) if c!=channel)),0)
            samples.append({'second': index/2, 'stage': stage,
                            'sha256': hashlib.sha256(frame).hexdigest()})
    return samples


def validate_video(video):
    video = Path(video)
    if not video.is_file() or video.stat().st_size < 4096:
        raise RuntimeError('Camera traversal video missing or empty; see recorder log')
    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-count_frames', '-show_entries', 'stream=width,height,nb_read_frames,duration',
        '-of', 'json', str(video)], capture_output=True, text=True, timeout=45, check=True)
    metadata = json.loads(probe.stdout)
    video.with_suffix('.probe.json').write_text(json.dumps(metadata, indent=2))
    streams = metadata.get('streams', [])
    if len(streams) != 1 or int(streams[0].get('nb_read_frames', 0)) < 30 or \
            float(streams[0].get('duration', 0)) < 3 or \
            min(int(streams[0].get('width', 0)), int(streams[0].get('height', 0))) < 300:
        raise RuntimeError('Camera traversal video has insufficient decoded frames/duration; see probe JSON')
    height = round(int(streams[0]['height'])*300/int(streams[0]['width']))
    decoded = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(video),
        '-vf', f'fps=2,scale=300:{height}', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'],
        capture_output=True, timeout=60, check=True)
    samples = scene_coverage(decoded.stdout,300,height)
    video.with_suffix('.scene-coverage.json').write_text(json.dumps(samples,indent=2))
    if len(samples) < 16 or samples[-1]['second']-samples[0]['second'] < 8 or \
            len({s['sha256'] for s in samples}) < 8:
        raise RuntimeError('Camera video lacks 8s of changing identified game-scene footage; launch screens do not count; see scene-coverage JSON')
    stages=[]
    for sample in samples:
        if sample['stage'] in (1,2,4) and (not stages or stages[-1]!=sample['stage']):
            stages.append(sample['stage'])
    if stages != [1,2,4]:
        raise RuntimeError(f'Video lacks rendered entry -> middle -> approach traversal: {stages}; see scene-coverage JSON')
    return metadata


@contextmanager
def recording(device, video):
    video = Path(video)
    if video.exists():
        raise FileExistsError(f'Refusing to overwrite video evidence: {video}')
    log = video.with_suffix('.recorder.log')
    process = None
    failed = False
    with log.open('w') as stream:
        try:
            process = subprocess.Popen(['xcrun', 'simctl', 'io', device, 'recordVideo',
                '--codec=h264', str(video)], stdout=stream, stderr=subprocess.STDOUT)
            deadline = time.monotonic() + 60
            while time.monotonic() < deadline:
                if process.poll() is not None:
                    raise RuntimeError(f'Camera recorder exited before ready: {log.read_text()}')
                if 'Recording started' in log.read_text():
                    break
                time.sleep(.2)
            else:
                raise TimeoutError(f'Camera recorder never became ready; scene not launched; see {log}')
            yield process
        except BaseException:
            failed = True
            raise
        finally:
            if process is not None and process.poll() is None:
                process.send_signal(signal.SIGINT)
                try:
                    process.wait(timeout=30)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait(timeout=10)
                    if not failed:
                        raise RuntimeError(f'Camera recorder failed to finalize; see {log}')
    if process.returncode != 0:
        raise RuntimeError(f'Camera recorder failed ({process.returncode}); see {log}')
    validate_video(video)
