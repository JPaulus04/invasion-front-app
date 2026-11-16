"""Compare approved PNG appearance through Xcode's CgBI optimization."""
import io
from pathlib import Path
import struct
import zlib
from PIL import Image, ImageChops


def premultiplied_pixels(path):
    data=Path(path).read_bytes()
    if not data.startswith(b'\x89PNG\r\n\x1a\n'):
        raise ValueError('Not a PNG')
    chunks=[];offset=8
    while offset < len(data):
        length=struct.unpack_from('>I',data,offset)[0]
        kind=data[offset+4:offset+8];payload=data[offset+8:offset+8+length]
        crc=struct.unpack_from('>I',data,offset+8+length)[0]
        if zlib.crc32(kind+payload)&0xffffffff != crc: raise ValueError('Invalid PNG CRC')
        chunks.append((kind,payload));offset+=length+12
    optimized=any(kind==b'CgBI' for kind,_ in chunks)
    if not optimized:
        image=Image.open(io.BytesIO(data)).convert('RGBA')
        return Image.frombytes('RGBA',image.size,image.convert('RGBa').tobytes()),False
    header=next(payload for kind,payload in chunks if kind==b'IHDR')
    if header[8:] != bytes([8,6,0,0,0]): raise ValueError('Unsupported optimized PNG format')
    # CgBI uses raw DEFLATE and premultiplied BGRA scanlines. Rewrap the
    # scanlines as standard PNG so Pillow applies the actual PNG filters;
    # retain premultiplication for a display-relevant comparison.
    scanlines=zlib.decompress(b''.join(payload for kind,payload in chunks if kind==b'IDAT'),-15)
    def chunk(kind,payload):
        return struct.pack('>I',len(payload))+kind+payload+struct.pack('>I',zlib.crc32(kind+payload)&0xffffffff)
    normalized=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',header)+chunk(b'IDAT',zlib.compress(scanlines))+chunk(b'IEND',b'')
    bgra=Image.open(io.BytesIO(normalized)).convert('RGBA')
    b,g,r,a=bgra.split()
    return Image.merge('RGBA',(r,g,b,a)),True


def compare_portal_pixels(source,bundled):
    expected,_=premultiplied_pixels(source)
    actual,optimized=premultiplied_pixels(bundled)
    if actual.size != expected.size: raise ValueError('Bundled portal dimensions changed')
    difference=ImageChops.difference(expected,actual)
    extremes=difference.getextrema()
    if extremes[3][1] != 0: raise ValueError('Bundled portal alpha changed')
    maximum=max(channel[1] for channel in extremes[:3])
    # CgBI's integer premultiplication can round a channel by one byte.
    if maximum > 1: raise ValueError(f'Bundled portal visible colors changed: {maximum}')
    return {'dimensions':list(actual.size),'alpha_exact':True,
            'maximum_premultiplied_channel_error':maximum,'xcode_cgbi_optimized':optimized}
