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
