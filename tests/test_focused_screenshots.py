"""Synthetic image-validator fixtures, never gameplay evidence."""
import importlib.util
from pathlib import Path
import struct
import tempfile
import unittest
import zlib

spec = importlib.util.spec_from_file_location('screenshots', Path(__file__).resolve().parents[1] / 'scripts/validate_simulator_screenshots.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)

NAMES = ('exit-beacon', 'upgrade-cards', 'reactor', 'victory', 'combat-hud', 'reactor-secured', 'reactor-lost')


def png(path, code):
    width, height = 320, 568
    rows = [bytearray(v for x in range(width) for v in (x % 160, y % 160, (x + y) % 160)) for y in range(height)]
    def pixel(x, y, color):
        rows[y][x * 3:x * 3 + 3] = bytes(color)
    if code:
        pixel(round(width * .94), round(height * .54), [255 if code & (1 << c) else 0 for c in range(3)])
    channel = {'reactor': 0, 'reactor-secured': 1, 'reactor-lost': 2}.get(path.stem.removeprefix('phase4-'))
    if channel is not None:
        pixel(round(width * .9), round(height * .4), [255 if c == channel else 0 for c in range(3)])
    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data))
    path.write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(b''.join(b'\0' + r for r in rows))) + chunk(b'IEND', b''))


class IdentityTests(unittest.TestCase):
    def test_each_scene_requires_its_own_identity(self):
        with tempfile.TemporaryDirectory() as temp:
            for code, name in enumerate(NAMES, 1):
                with self.subTest(name=name):
                    path = Path(temp) / f'phase4-{name}.png'
                    png(path, code)
                    validator.verify(path)
                    png(path, code % 7 + 1)
                    with self.assertRaisesRegex(ValueError, 'focused scene identity'):
                        validator.verify(path)

    def test_colorful_home_screen_without_identity_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'phase4-victory.png'
            png(path, None)
            with self.assertRaisesRegex(ValueError, 'focused scene identity'):
                validator.verify(path)
