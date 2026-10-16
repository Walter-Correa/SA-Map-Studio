import struct
from build_cj_ped import parse_rw

player_img = r'C:\Program Files (x86)\Rockstar Games\GTA San Andreas\models\player.img'
with open(player_img, 'rb') as f:
    ver, count = struct.unpack('<4sI', f.read(8))
    entries = {name.split(b'\x00')[0].decode('latin1').lower(): (off*2048, sz*2048) for off, sz, name in [struct.unpack('<II24s', f.read(32)) for _ in range(count)]}
    
    def get_tex(txd_name, target):
        f.seek(entries[txd_name][0])
        data = f.read(entries[txd_name][1])
        for c in parse_rw(data):
            if c['id'] == 0x16:
                for s in parse_rw(c['data']):
                    if s['id'] == 0x15:
                        for sc in parse_rw(s['data']):
                            if sc['id'] == 0x01:
                                st = sc['data']
                                name = st[8:40].split(b'\x00')[0].decode('latin1')
                                if name == target:
                                    return st
        return None

    vest_st = get_tex('vest.txd', 'vest')
    torso_st = get_tex('player_torso.txd', 'torso')

print('Found vest_st:', len(vest_st), 'torso_st:', len(torso_st))
vest_pixels = vest_st[92:92+262144]
torso_pixels = torso_st[92:92+262144]

# Check alpha distribution in vest
alphas = [vest_pixels[i*4+3] for i in range(65536)]
print('Vest alphas min/max:', min(alphas), max(alphas))
opaque = sum(1 for a in alphas if a > 200)
trans = sum(1 for a in alphas if a == 0)
blend = sum(1 for a in alphas if 0 < a <= 200)
print(f'Vest alpha counts: opaque={opaque}, transparent={trans}, blend={blend}')
