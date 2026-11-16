"""Real simctl recording with a readiness handshake and retained diagnostics."""
from contextlib import contextmanager
import json
from pathlib import Path
import signal
import subprocess
import time


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
    decoded = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(video),
        '-vf', 'fps=2,scale=300:-1', '-f', 'framemd5', '-'],
        capture_output=True, text=True, timeout=60, check=True)
    video.with_suffix('.frames.md5').write_text(decoded.stdout)
    hashes = {line.rsplit(',', 1)[-1].strip() for line in decoded.stdout.splitlines()
              if line and not line.startswith('#')}
    if len(hashes) < 4:
        raise RuntimeError('Camera video is frozen or lacks traversal; see decoded frame hashes')
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
