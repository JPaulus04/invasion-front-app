"""Failure injection for real recorder control; these are not capture evidence."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import simulator_video as video
import simulator_startup as startup


class VideoTests(unittest.TestCase):
    def test_traversal_waits_for_real_endpoint_and_retains_final_view(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp); log=root/'app.log'; errors=root/'stderr.log'; report=root/'traversal.json'
            log.write_text('[CAMERA REVIEW] pilot=(195.0, -131.5) offset=(0,0) gate=(195.0, 862.5)\n'
                '[FOCUSED REVIEW] ready code=1 flag=-captureGateScreenshot\n'
                '[CAMERA MOTION] pilotY=-131.5 cameraY=200\n'
                '[CAMERA MOTION] pilotY=811.2 cameraY=-212\n'
                '[CAMERA MOTION] pilotY=811.2 cameraY=-212\n')
            process=Mock();process.poll.return_value=None
            with patch.object(video.time,'monotonic',side_effect=[0,0]), \
                 patch.object(video.time,'sleep') as sleep:
                video.wait_for_traversal(log,errors,process,report)
            self.assertTrue(json.loads(report.read_text())['completed'])
            sleep.assert_called_once_with(2)

    def test_pid_or_ready_marker_without_traversal_never_completes(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);log=root/'app.log';log.write_text('[FOCUSED REVIEW] ready code=1 flag=camera\n')
            with patch.object(video.time,'monotonic',side_effect=[0,121]):
                with self.assertRaisesRegex(TimeoutError,'real traversal endpoint'):
                    video.wait_for_traversal(log,root/'stderr',Mock(),root/'result')
            self.assertFalse((root/'result').exists())

    def test_fixture_assertion_is_not_retried_as_recorder_failure(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);errors=root/'stderr';errors.write_text('Precondition failed: bad camera')
            with patch.object(video.time,'monotonic',side_effect=[0,0]):
                with self.assertRaisesRegex(RuntimeError,'fixture assertion'):
                    video.wait_for_traversal(root/'app.log',errors,Mock(),root/'result')

    def test_changing_launch_screens_do_not_count_as_gameplay_coverage(self):
        width,height=40,70; frames=[]
        for index in range(20):
            frame=bytearray((value+index)%256 for value in range(width*height*3))
            marker=(round(height*.54)*width+round(width*.94))*3
            frame[marker:marker+3]=bytes((240,0,0) if index>=16 else (20,200,30))
            progress=(round(height*.54)*width+round(width*.90))*3
            frame[progress:progress+3]=bytes((240,0,0) if index<=16 else ((0,240,0) if index<19 else (0,0,240)))
            frames.append(frame)
        samples=video.scene_coverage(b''.join(frames),width,height)
        self.assertEqual(len(samples),4)
        self.assertEqual(samples[0]['second'],8)
        self.assertEqual([s['stage'] for s in samples],[1,2,2,4])

    def test_scene_waits_for_recording_handshake_and_recorder_is_finalized(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'camera.mov'
            process = Mock(returncode=0)
            process.poll.return_value = None
            def begin(*args, **kwargs):
                kwargs['stdout'].write('Recording started\n')
                kwargs['stdout'].flush()
                return process
            with patch.object(video.subprocess, 'Popen', side_effect=begin), \
                 patch.object(video, 'validate_video') as validate:
                with video.recording('device', path):
                    process.send_signal.assert_not_called()
                process.send_signal.assert_called_once_with(video.signal.SIGINT)
                process.wait.assert_called_once_with(timeout=30)
                validate.assert_called_once_with(path)

    def test_dead_recorder_never_launches_scene_and_retains_diagnostic(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'camera.mov'
            process = Mock(returncode=1)
            process.poll.return_value = 1
            def begin(*args, **kwargs):
                kwargs['stdout'].write('No display available\n')
                kwargs['stdout'].flush()
                return process
            with patch.object(video.subprocess, 'Popen', side_effect=begin):
                with self.assertRaisesRegex(RuntimeError, 'No display available'):
                    with video.recording('device', path):
                        self.fail('Scene must not start without ready recorder')
            self.assertIn('No display', path.with_suffix('.recorder.log').read_text())

    def test_never_ready_recorder_times_out_before_scene_and_is_stopped(self):
        with tempfile.TemporaryDirectory() as temp:
            process = Mock(returncode=0)
            process.poll.return_value = None
            with patch.object(video.subprocess, 'Popen', return_value=process), \
                 patch.object(video.time, 'monotonic', side_effect=[0,61]):
                with self.assertRaisesRegex(TimeoutError, 'never became ready'):
                    with video.recording('device', Path(temp)/'camera.mov'):
                        self.fail('Scene must not start')
            process.send_signal.assert_called_once()

    def test_missing_or_undecodable_video_fails_closed(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp)/'camera.mov'
            with self.assertRaisesRegex(RuntimeError, 'missing'):
                video.validate_video(path)
            path.write_bytes(b'x'*5000)
            with patch.object(video.subprocess, 'run', side_effect=subprocess.CalledProcessError(1,'ffprobe')):
                with self.assertRaises(subprocess.CalledProcessError):
                    video.validate_video(path)
            for stream in [{}, {'width':1206,'height':2622,'nb_read_frames':'1','duration':'0.1'}]:
                with patch.object(video.subprocess, 'run', return_value=Mock(stdout=json.dumps({'streams':[stream]}))):
                    with self.assertRaisesRegex(RuntimeError, 'insufficient decoded'):
                        video.validate_video(path)

    def test_render_probe_never_launches_and_fails_closed(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            calls = []
            def command(*args, **kwargs):
                calls.append(args)
                (root/'startup-surface.png').write_bytes(b'\x89PNG\r\n\x1a\n'+b'x'*5000)
                return Mock(stdout='captured',stderr='')
            startup.wait_for_render_surface(command,'device',root)
            self.assertEqual(calls[0][2:5],('io','device','screenshot'))
            with self.assertRaises(startup.RecoverableStartupError):
                startup.wait_for_render_surface(Mock(side_effect=subprocess.TimeoutExpired('screenshot',45)), 'device',root)


if __name__ == '__main__':
    unittest.main()
