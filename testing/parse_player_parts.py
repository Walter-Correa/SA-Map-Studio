import struct

def parse_rw(data, offset=0):
    chunks = []
    pos = offset
    while pos + 12 <= len(data):
        cid, csz, cver = struct.unpack('<III', data[pos:pos+12])
        chunks.append({
            'id': cid,
            'size': csz,
            'version': cver,
            'pos': pos,
            'data_pos': pos + 12,
            'data': data[pos+12:pos+12+csz]
        })
        pos += 12 + csz
    return chunks

def get_geometry_data(data):
    # Find Clump -> GeometryList -> Geometry
    for c in parse_rw(data):
        if c['id'] == 0x10: # Clump
            for sub in parse_rw(c['data']):
                if sub['id'] == 0x1A: # Geometry List
                    glist_chunks = parse_rw(sub['data'])
                    # first is Struct with numGeometries
                    for g in glist_chunks:
                        if g['id'] == 0x0F: # Geometry
                            # Inside Geometry
                            for gsub in parse_rw(g['data']):
                                if gsub['id'] == 0x01: # Struct
                                    st = gsub['data']
                                    flags, num_tri, num_v = struct.unpack('<HHI', st[:8])
                                    p = 8
                                    colors = None
                                    if flags & 0x08:
                                        p += num_v * 4
                                    if flags & 0x04:
                                        colors = [st[p+i*4:p+(i+1)*4] for i in range(num_v)]
                                        p += num_v * 4
                                    texcoords = None
                                    if flags & 0x02:
                                        texcoords = [struct.unpack('<ff', st[p+i*8:p+(i+1)*8]) for i in range(num_v)]
                                        p += num_v * 8
                                    triangles = [struct.unpack('<HHHH', st[p+i*8:p+(i+1)*8]) for i in range(num_tri)]
                                    p += num_tri * 8
                                    sphere = struct.unpack('<ffff', st[p:p+16])
                                    p += 16
                                    has_verts, has_normals = struct.unpack('<II', st[p:p+8])
                                    p += 8
                                    vertices = None
                                    if has_verts:
                                        vertices = [struct.unpack('<fff', st[p+i*12:p+(i+1)*12]) for i in range(num_v)]
                                        p += num_v * 12
                                    normals = None
                                    if has_normals:
                                        normals = [struct.unpack('<fff', st[p+i*12:p+(i+1)*12]) for i in range(num_v)]
                                        p += num_v * 12
                                    return {
                                        'flags': flags,
                                        'vertices': vertices,
                                        'normals': normals,
                                        'texcoords': texcoords,
                                        'triangles': triangles,
                                        'sphere': sphere
                                    }
    return None

if __name__ == '__main__':
    player_img = r'C:\Program Files (x86)\Rockstar Games\GTA San Andreas\models\player.img'
    with open(player_img, 'rb') as f:
        ver, num = struct.unpack('<4sI', f.read(8))
        entries = {}
        for _ in range(num):
            off, size, name = struct.unpack('<II24s', f.read(32))
            clean_name = name.split(b'\x00')[0].decode('latin1').lower()
            entries[clean_name] = (off * 2048, size * 2048)

        for part in ('head.dff', 'vest.dff', 'jeans.dff', 'feet.dff', 'hands.dff'):
            off, sz = entries[part]
            f.seek(off)
            dff_data = f.read(sz)
            g = get_geometry_data(dff_data)
            print(f'{part}: verts={len(g["vertices"])}, normals={len(g["normals"]) if g["normals"] else 0}, flags=0x{g["flags"]:X}')
            xs = [v[0] for v in g['vertices']]
            ys = [v[1] for v in g['vertices']]
            zs = [v[2] for v in g['vertices']]
            print(f'   X:[{min(xs):.3f}, {max(xs):.3f}], Y:[{min(ys):.3f}, {max(ys):.3f}], Z:[{min(zs):.3f}, {max(zs):.3f}]')
