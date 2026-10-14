#!/usr/bin/env python3
"""Render the illustrated 128px pilot sprite using the stdlib PNG renderer."""
import importlib.util
import pathlib
import struct
import zlib

# Reuse the project's scanline renderer; no Pillow or external dependencies.
spec = importlib.util.spec_from_file_location("forest_renderer", "scripts/generate_forest_art.py")
art = importlib.util.module_from_spec(spec)
spec.loader.exec_module(art)
art.W = art.H = 128
art.pixels = bytearray(128 * 128 * 4)
P = art.polygon
E = art.ellipse

navy=(16,35,51,255)
shadow=(30,65,87,255)
blue=(54,124,171,255)
light=(111,190,220,255)
white=(213,232,232,255)
steel=(139,166,181,255)
orange=(249,151,65,255)
gold=(255,207,113,255)

# Legs, boots and separate armored shin plates.
P([(45,85),(61,86),(59,113),(54,122),(37,122),(36,113)],navy)
P([(68,85),(84,84),(91,113),(89,122),(72,122),(68,113)],navy)
P([(43,94),(58,94),(55,112),(41,114)],blue)
P([(70,94),(84,93),(88,113),(74,112)],blue)
P([(37,115),(55,115),(55,123),(32,123),(31,120)],shadow)
P([(73,115),(90,115),(96,122),(96,124),(72,124)],shadow)
P([(42,97),(48,96),(46,111),(41,112)],light)
P([(73,97),(78,96),(81,112),(75,111)],light)

# Heavy backpack, broad shoulders and articulated gauntlets.
P([(37,43),(91,43),(96,87),(31,87)],navy)
P([(33,47),(48,42),(53,61),(47,79),(28,76),(23,65)],navy)
P([(80,42),(96,47),(105,65),(99,77),(82,79),(75,61)],navy)
P([(29,52),(43,47),(48,61),(41,72),(27,69)],blue)
P([(85,47),(99,53),(102,69),(88,72),(80,61)],blue)
P([(28,71),(42,73),(43,95),(33,99),(25,89)],shadow)
P([(87,73),(101,71),(105,89),(95,99),(85,95)],shadow)
P([(29,77),(39,79),(39,92),(32,94)],white)
P([(90,79),(100,77),(99,94),(91,92)],white)
P([(30,53),(36,51),(34,66),(28,65)],light)
P([(94,51),(100,57),(101,65),(95,66)],light)

# Torso with layered breastplate, chest lamp and waist.
P([(45,46),(82,46),(88,79),(80,97),(47,97),(39,79)],navy)
P([(48,49),(80,49),(84,76),(76,87),(50,87),(44,76)],white)
P([(49,52),(61,56),(60,77),(49,75),(45,65)],steel)
P([(68,56),(79,52),(82,65),(78,75),(68,77)],steel)
P([(58,78),(70,78),(76,90),(52,90)],blue)
P([(53,88),(75,88),(79,96),(49,96)],navy)
P([(56,90),(72,90),(73,95),(55,95)],orange)
E(64,69,9,10,navy)
E(64,68,6,7,orange)
E(62,66,2,3,gold)
P([(49,50),(59,54),(59,58),(48,56)],light)

# Oversized helmet, hard outline, side ear pieces, visor and specular gleam.
P([(45,11),(80,11),(91,25),(91,47),(82,56),(45,56),(36,47),(36,25)],navy)
P([(46,15),(79,15),(86,27),(86,45),(78,51),(47,51),(41,45),(41,27)],white)
P([(44,19),(52,15),(52,32),(42,34)],light)
P([(77,16),(84,23),(84,34),(77,31)],steel)
P([(39,31),(46,31),(47,46),(39,48),(34,42)],blue)
P([(82,31),(90,31),(94,42),(88,48),(81,46)],blue)
P([(46,29),(82,29),(85,35),(80,44),(47,44),(43,35)],navy)
P([(49,32),(79,32),(81,36),(76,41),(49,41),(46,36)],(29,112,148,255))
P([(49,33),(70,33),(60,36),(47,36)],(113,218,235,255))
P([(73,46),(82,46),(77,50),(69,50)],orange)
P([(51,18),(70,17),(64,20),(49,23)],(255,255,255,150))

def chunk(tag,data):
    return struct.pack('>I',len(data))+tag+data+struct.pack('>I',zlib.crc32(tag+data)&0xffffffff)
raw=b''.join(b'\x00'+art.pixels[y*128*4:(y+1)*128*4] for y in range(128))
png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',128,128,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b'')
out=pathlib.Path('OutpostZero/ArtAssets/pilot_idle.png')
out.write_bytes(png)
print('Generated detailed pilot',out)
