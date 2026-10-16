import struct
from build_cj_ped import parse_rw

player_img = r'C:\Program Files (x86)\Rockstar Games\GTA San Andreas\models\player.img'
with open(player_img, 'rb') as f:
    ver, count = struct.unpack('<4sI', f.read(8))
    entries = {name.split(b'\x00')[0].decode('latin1').lower(): (off*2048, sz*2048) for off, sz, name in [struct.unpack('<II24s', f.read(32)) for _ in range(count)]}
    f.seek(entries['vest.dff'][0])
    vest_data = f.read(entries['vest.dff'][1])

for c in parse_rw(vest_data):
    print('Top chunk', hex(c['id']), 'sz=', c['size'])
    if c['id'] == 0x10:
        for s in parse_rw(c['data']):
            print('  Clump subchunk', hex(s['id']), 'sz=', s['size'])
            if s['id'] == 0x1A:
                for g in parse_rw(s['data']):
                    print('    GeomList subchunk', hex(g['id']), 'sz=', g['size'])
                    if g['id'] == 0x0F:
                        for gs in parse_rw(g['data']):
                            print('      Geometry subchunk', hex(gs['id']), 'sz=', gs['size'])
                            if gs['id'] == 0x08: # MatList
                                for mc in parse_rw(gs['data']):
                                    print('        MatList subchunk', hex(mc['id']), 'sz=', mc['size'])
