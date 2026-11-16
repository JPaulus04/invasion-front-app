import struct
import tempfile
from pathlib import Path
import unittest
import zlib
from PIL import Image
from scripts.approved_bundle_pixels import compare_portal_pixels


class BundlePixelsTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.source=Path(self.temp.name)/'source.png';self.bundle=Path(self.temp.name)/'bundle.png'
        image=Image.new('RGBA',(3,1))
        image.putdata([(80,160,240,128),(255,90,0,255),(140,50,190,0)])
        image.save(self.source)

    def cgbi(self,alpha_change=False,color_change=False):
        image=Image.open(self.source).convert('RGBa')
        pixels=[]
        for index,(r,g,b,a) in enumerate(image.getdata()):
            if index==0 and alpha_change: a+=1
            if index==1 and color_change: g+=20
            pixels.extend([b,g,r,a])
        def chunk(kind,data):
            return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)
        compressor=zlib.compressobj(wbits=-15)
        compressed=compressor.compress(b'\x00'+bytes(pixels))+compressor.flush()
        self.bundle.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'CgBI',b'\x50\x00\x20\x02')+
            chunk(b'IHDR',struct.pack('>IIBBBBB',3,1,8,6,0,0,0))+chunk(b'IDAT',compressed)+chunk(b'IEND',b''))

    def test_normal_png_appearance(self):
        self.bundle.write_bytes(self.source.read_bytes())
        self.assertEqual(compare_portal_pixels(self.source,self.bundle)['maximum_premultiplied_channel_error'],0)

    def test_xcode_optimization_preserves_appearance(self):
        self.cgbi()
        self.assertTrue(compare_portal_pixels(self.source,self.bundle)['xcode_cgbi_optimized'])

    def test_changed_alpha_is_rejected(self):
        self.cgbi(alpha_change=True)
        with self.assertRaisesRegex(ValueError,'alpha'): compare_portal_pixels(self.source,self.bundle)

    def test_changed_visible_color_is_rejected(self):
        self.cgbi(color_change=True)
        with self.assertRaisesRegex(ValueError,'visible colors'): compare_portal_pixels(self.source,self.bundle)
