#!/usr/bin/env python3
import pathlib, struct, zlib
W,H=128,176
pixels=bytearray(W*H*4)
def put(x,y,c):
    if 0<=x<W and 0<=y<H:
        i=(y*W+x)*4
        pixels[i:i+4]=bytes(c)
def triangle(cx,top,width,bottom,color):
    for y in range(top,bottom):
        half=width*(y-top)/(bottom-top)/2
        for x in range(max(0,int(cx-half)),min(W,int(cx+half+1))):
            put(x,y,color)
for y in range(111,160):
    for x in range(58,70): put(x,y,(89,65,45,255) if x<66 else (142,102,62,255))
for top,bottom,width in [(7,89,64),(30,116,91),(61,147,116)]:
    triangle(64,top+5,width+9,bottom+3,(21,65,62,255))
    triangle(64,top,width,bottom,(38,116,91,255))
    triangle(56,top+8,width//2,bottom-10,(70,155,119,255))
    triangle(48,top+19,width//5,bottom-19,(115,183,139,255))
def chunk(t,data):
    return struct.pack('>I',len(data))+t+data+struct.pack('>I',zlib.crc32(t+data)&0xffffffff)
raw=b''.join(b'\x00'+pixels[y*W*4:(y+1)*W*4] for y in range(H))
png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',W,H,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b'')
out=pathlib.Path('OutpostZero/ArtAssets/forest_pine.png')
out.parent.mkdir(parents=True,exist_ok=True)
out.write_bytes(png)
print('Generated',out)
