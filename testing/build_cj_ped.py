import os
import struct
import math

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

def make_chunk(cid, data, version=0x1803FFFF):
    return struct.pack('<III', cid, len(data), version) + data

def make_string_chunk(s, version=0x1803FFFF):
    b = s.encode('latin1') + b'\x00'
    # padded to 4 bytes
    pad = (4 - (len(b) % 4)) % 4
    b += b'\x00' * pad
    return make_chunk(0x02, b, version)

def make_material_chunk(texture_name, version=0x1803FFFF):
    # Material Struct (28 bytes exact RW format)
    # flags(4), color(4: rgba 255,255,255,255), unused(4: 4), isTextured(4: 1), ambient(4: 1.0f), specular(4: 0.0f), diffuse(4: 1.0f)
    mat_struct = struct.pack('<IBBBBIIfff', 0, 255, 255, 255, 255, 4, 1, 1.0, 0.0, 1.0)
    mat_struct_chunk = make_chunk(0x01, mat_struct, version)
    
    # Texture chunk
    # Texture struct (filter flags = 0x1106)
    tex_struct = struct.pack('<HH', 0x1106, 0)
    tex_struct_chunk = make_chunk(0x01, tex_struct, version)
    tex_name_chunk = make_string_chunk(texture_name, version)
    tex_mask_chunk = make_string_chunk('', version)
    tex_ext_chunk = make_chunk(0x03, b'', version)
    
    texture_chunk = make_chunk(0x06, tex_struct_chunk + tex_name_chunk + tex_mask_chunk + tex_ext_chunk, version)
    mat_ext_chunk = make_chunk(0x03, b'', version)
    
    return make_chunk(0x07, mat_struct_chunk + texture_chunk + mat_ext_chunk, version)

def rotate_pt(y, z, sy, sz, angle_rad):
    dy = y - sy
    dz = z - sz
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    new_dy = dy * cos_a + dz * sin_a
    new_dz = -dy * sin_a + dz * cos_a
    return sy + new_dy, sz + new_dz

def rotate_vec(ny, nz, angle_rad):
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    return ny * cos_a + nz * sin_a, -ny * sin_a + nz * cos_a

def extract_part(data):
    for c in parse_rw(data):
        if c['id'] == 0x10: # Clump (take first clump, Normal CJ)
            for sub in parse_rw(c['data']):
                if sub['id'] == 0x1A: # GeomList
                    for g in parse_rw(sub['data']):
                        if g['id'] == 0x0F: # Geometry
                            for gsub in parse_rw(g['data']):
                                if gsub['id'] == 0x01: # Struct
                                    st = gsub['data']
                                    flags, num_tri, num_v = struct.unpack('<III', st[:12])
                                    p = 16
                                    uvs = [struct.unpack('<ff', st[p+j*8:p+(j+1)*8]) for j in range(num_v)]
                                    p += num_v * 8
                                    tris = [struct.unpack('<HHHH', st[p+j*8:p+(j+1)*8]) for j in range(num_tri)]
                                    p += num_tri * 8
                                    p += 16 # sphere
                                    has_v, has_n = struct.unpack('<II', st[p:p+8])
                                    p += 8
                                    verts = [struct.unpack('<fff', st[p+j*12:p+(j+1)*12]) for j in range(num_v)]
                                    p += num_v * 12
                                    normals = [struct.unpack('<fff', st[p+j*12:p+(j+1)*12]) for j in range(num_v)] if has_n else []
                                    return {
                                        'verts': verts,
                                        'normals': normals,
                                        'uvs': uvs,
                                        'tris': tris
                                    }
    return None

def main():
    player_img = r'C:\Program Files (x86)\Rockstar Games\GTA San Andreas\models\player.img'
    with open(player_img, 'rb') as f:
        hdr = f.read(8)
        ver, count = struct.unpack('<4sI', hdr)
        entries = {}
        for _ in range(count):
            off, sz, name = struct.unpack('<II24s', f.read(32))
            clean = name.split(b'\x00')[0].decode('latin1').lower()
            entries[clean] = (off * 2048, sz * 2048)
            
        def read_file(name):
            off, sz = entries[name]
            f.seek(off)
            return f.read(sz)

        print('Reading parts from player.img...')
        head = extract_part(read_file('head.dff'))
        vest = extract_part(read_file('vest.dff'))
        jeans = extract_part(read_file('jeans.dff'))
        sneaker = extract_part(read_file('sneaker.dff'))
        hands = extract_part(read_file('hands.dff'))

    parts = [
        ('head', head, 0),
        ('vest', vest, 1),
        ('jeans', jeans, 2),
        ('sneaker', sneaker, 3),
        ('hands', hands, 4),
    ]

    # Arm rotation configuration:
    # Rotate arms ~35 degrees down towards torso for natural standing ped pose
    angle_deg = 34.0
    angle_rad = math.radians(angle_deg)
    
    # Left shoulder: Y=0.17, Z=0.40. Right shoulder: Y=-0.17, Z=0.40
    sy_l, sz_l = 0.17, 0.40
    sy_r, sz_r = -0.17, 0.40

    # Apply arm rotation to vest and hands
    for part_name, pdata in [('vest', vest), ('hands', hands)]:
        new_verts = []
        new_normals = []
        for i, (x, y, z) in enumerate(pdata['verts']):
            nx, ny, nz = pdata['normals'][i] if pdata['normals'] else (0, 0, 1)
            if part_name == 'hands':
                # Full rotation for hands
                if y > 0:
                    y2, z2 = rotate_pt(y, z, sy_l, sz_l, angle_rad)
                    ny2, nz2 = rotate_vec(ny, nz, angle_rad)
                else:
                    y2, z2 = rotate_pt(y, z, sy_r, sz_r, -angle_rad)
                    ny2, nz2 = rotate_vec(ny, nz, -angle_rad)
                new_verts.append((x, y2, z2))
                new_normals.append((nx, ny2, nz2))
            else:
                # Vest: blend rotation smoothly near shoulder joint
                if y > 0.15:
                    w = min(1.0, max(0.0, (y - 0.15) / 0.08))
                    a = angle_rad * w
                    y2, z2 = rotate_pt(y, z, sy_l, sz_l, a)
                    ny2, nz2 = rotate_vec(ny, nz, a)
                    new_verts.append((x, y2, z2))
                    new_normals.append((nx, ny2, nz2))
                elif y < -0.15:
                    w = min(1.0, max(0.0, (-y - 0.15) / 0.08))
                    a = -angle_rad * w
                    y2, z2 = rotate_pt(y, z, sy_r, sz_r, a)
                    ny2, nz2 = rotate_vec(ny, nz, a)
                    new_verts.append((x, y2, z2))
                    new_normals.append((nx, ny2, nz2))
                else:
                    new_verts.append((x, y, z))
                    new_normals.append((nx, ny, nz))
        pdata['verts'] = new_verts
        pdata['normals'] = new_normals

    # Merge all parts into one model
    all_verts = []
    all_normals = []
    all_uvs = []
    all_tris = []

    for name, pdata, mat_idx in parts:
        v_offset = len(all_verts)
        all_verts.extend(pdata['verts'])
        all_normals.extend(pdata['normals'])
        all_uvs.extend(pdata['uvs'])
        for b, a, old_m, c in pdata['tris']:
            all_tris.append((b + v_offset, a + v_offset, mat_idx, c + v_offset))

    total_v = len(all_verts)
    total_t = len(all_tris)
    print(f'Merged CJ model: {total_v} vertices, {total_t} triangles')

    # Rotate mesh 90 degrees around Z so CJ faces +Y (North), matching GTA SA standard ped orientation
    all_verts = [(-y, x, z) for x, y, z in all_verts]
    all_normals = [(-ny, nx, nz) for nx, ny, nz in all_normals]

    # Bounding sphere
    xs = [v[0] for v in all_verts]
    ys = [v[1] for v in all_verts]
    zs = [v[2] for v in all_verts]
    cx = (min(xs) + max(xs)) / 2.0
    cy = (min(ys) + max(ys)) / 2.0
    cz = (min(zs) + max(zs)) / 2.0
    radius = max(math.sqrt((x-cx)**2 + (y-cy)**2 + (z-cz)**2) for x, y, z in all_verts)
    print(f'Bounding box: X=[{min(xs):.2f}, {max(xs):.2f}], Y=[{min(ys):.2f}, {max(ys):.2f}], Z=[{min(zs):.2f}, {max(zs):.2f}]')
    print(f'Center=({cx:.2f}, {cy:.2f}, {cz:.2f}), Radius={radius:.2f}')

    # Build Geometry Struct
    # Flags: 0x10036 (1 UV set, GEO_POSITIONS(0x02), GEO_TEXTURED(0x04), GEO_NORMALS(0x10), GEO_LIGHT(0x20))
    flags = 0x10036
    geo_struct = bytearray()
    geo_struct.extend(struct.pack('<IIII', flags, total_t, total_v, 1)) # format, numTris, numVerts, numMorphTargets
    # UVs
    for u, v in all_uvs:
        geo_struct.extend(struct.pack('<ff', u, v))
    # Triangles (b, a, m, c)
    for b, a, m, c in all_tris:
        geo_struct.extend(struct.pack('<HHHH', b, a, m, c))
    # Bounding sphere
    geo_struct.extend(struct.pack('<ffff', cx, cy, cz, radius))
    # hasVerts=1, hasNormals=1
    geo_struct.extend(struct.pack('<II', 1, 1))
    # Vertices
    for x, y, z in all_verts:
        geo_struct.extend(struct.pack('<fff', x, y, z))
    # Normals
    for nx, ny, nz in all_normals:
        geo_struct.extend(struct.pack('<fff', nx, ny, nz))

    geo_struct_chunk = make_chunk(0x01, bytes(geo_struct))

    # Material list chunk
    texture_names = ['face', 'vest', 'legs', 'sneakerbincblk', 'torso8bit']
    mat_list_struct = struct.pack('<I', len(texture_names)) + struct.pack(f'<{len(texture_names)}i', *[-1]*len(texture_names))
    mat_list_struct_chunk = make_chunk(0x01, mat_list_struct)
    materials_bytes = bytearray(mat_list_struct_chunk)
    for tname in texture_names:
        materials_bytes.extend(make_material_chunk(tname))
    mat_list_chunk = make_chunk(0x08, bytes(materials_bytes))

    geo_ext_chunk = make_chunk(0x03, b'')
    geometry_chunk = make_chunk(0x0F, geo_struct_chunk + mat_list_chunk + geo_ext_chunk)

    # Geometry List chunk
    geom_list_struct = make_chunk(0x01, struct.pack('<I', 1))
    geom_list_chunk = make_chunk(0x1A, geom_list_struct + geometry_chunk)

    # Frame list chunk
    # Frame 0: root, Frame 1: child (ped)
    # rot matrix (9 floats: identity 1 0 0 0 1 0 0 0 1), pos (3 floats: 0 0 0), parent (-1 or 0), flags (0)
    identity_rot = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]
    zero_pos = [0.0, 0.0, 0.0]
    frame_struct_data = bytearray()
    frame_struct_data.extend(struct.pack('<I', 2)) # 2 frames
    # Frame 0
    frame_struct_data.extend(struct.pack('<9f3fiI', *identity_rot, *zero_pos, -1, 0))
    # Frame 1
    frame_struct_data.extend(struct.pack('<9f3fiI', *identity_rot, *zero_pos, 0, 0))
    frame_struct_chunk = make_chunk(0x01, bytes(frame_struct_data))
    frame_ext_0 = make_chunk(0x03, b'')
    frame_ext_1 = make_chunk(0x03, b'')
    frame_list_chunk = make_chunk(0x0E, frame_struct_chunk + frame_ext_0 + frame_ext_1)

    # Atomic chunk
    # frameIndex=1, geometryIndex=0, flags=5, unused=0
    atomic_struct = make_chunk(0x01, struct.pack('<IIII', 1, 0, 5, 0))
    atomic_ext = make_chunk(0x03, b'')
    atomic_chunk = make_chunk(0x14, atomic_struct + atomic_ext)

    # Clump Struct
    clump_struct = make_chunk(0x01, struct.pack('<I', 1)) # 1 atomic
    clump_ext = make_chunk(0x03, b'')
    clump_chunk = make_chunk(0x10, clump_struct + frame_list_chunk + geom_list_chunk + atomic_chunk + clump_ext)

    # Write models/cj.dff
    for out_path in ['models/cj.dff', 'Dados/models/cj.dff']:
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, 'wb') as f_out:
            f_out.write(clump_chunk)
        print(f'Wrote {out_path} ({len(clump_chunk)} bytes)')

    # Build TXD
    # Extract NativeTexture chunks from each TXD and rename/package into models/cj.txd
    txd_sources = [
        ('player_face.txd', 'face'),
        ('vest.txd', 'vest'),
        ('jeansdenim.txd', 'legs'),
        ('sneakerbincblk.txd', 'sneakerbincblk'),
        ('hands.txd', 'torso8bit'),
    ]

    # Pre-extract torso texture from player_torso.txd for compositing onto vest
    torso_pixels = None
    with open(player_img, 'rb') as f:
        off, sz = entries['player_torso.txd']
        f.seek(off)
        tdata = f.read(sz)
        for c in parse_rw(tdata):
            if c['id'] == 0x16:
                for sub in parse_rw(c['data']):
                    if sub['id'] == 0x15:
                        for sc in parse_rw(sub['data']):
                            if sc['id'] == 0x01:
                                st = sc['data']
                                name = st[8:40].split(b'\x00')[0].decode('latin1')
                                if name == 'torso':
                                    torso_pixels = st[92:92+262144]
                                    break

    native_textures = []
    with open(player_img, 'rb') as f:
        for txd_file, expected_name in txd_sources:
            off, sz = entries[txd_file]
            f.seek(off)
            txd_data = f.read(sz)
            for c in parse_rw(txd_data):
                if c['id'] == 0x16:
                    for sub in parse_rw(c['data']):
                        if sub['id'] == 0x15: # TextureNative
                            tex_bytes = bytearray(sub['data'])
                            # Ensure name inside Struct is exactly expected_name
                            for sc in parse_rw(sub['data']):
                                if sc['id'] == 0x01: # Struct
                                    st_data = bytearray(sc['data'])
                                    # name is 32 bytes at offset 8
                                    name_bytes = expected_name.encode('latin1')[:31] + b'\x00'
                                    name_bytes += b'\x00' * (32 - len(name_bytes))
                                    st_data[8:40] = name_bytes

                                    if expected_name == 'vest' and torso_pixels:
                                        # Composite white vest over torso skin (arms, neck, shoulders)
                                        vest_pixels = st_data[92:92+262144]
                                        out_pixels = bytearray(262144)
                                        for pi in range(65536):
                                            idx = pi * 4
                                            va = vest_pixels[idx + 3]
                                            if va == 255:
                                                out_pixels[idx:idx+3] = vest_pixels[idx:idx+3]
                                                out_pixels[idx + 3] = 255
                                            elif va == 0:
                                                out_pixels[idx:idx+3] = torso_pixels[idx:idx+3]
                                                out_pixels[idx + 3] = 255
                                            else:
                                                af = va / 255.0
                                                b = int(vest_pixels[idx] * af + torso_pixels[idx] * (1.0 - af))
                                                g = int(vest_pixels[idx + 1] * af + torso_pixels[idx + 1] * (1.0 - af))
                                                r = int(vest_pixels[idx + 2] * af + torso_pixels[idx + 2] * (1.0 - af))
                                                out_pixels[idx] = b
                                                out_pixels[idx + 1] = g
                                                out_pixels[idx + 2] = r
                                                out_pixels[idx + 3] = 255
                                        st_data[92:92+262144] = out_pixels
                                        # Set alpha = 0, format = 0x600, d3d = 0x16 so it renders solid without alpha testing holes
                                        st_data[72:88] = struct.pack('<IIHHBBBB', 0x600, 0x16, 256, 256, 32, 1, 4, 0)

                                    # reassemble
                                    new_struct_chunk = make_chunk(0x01, bytes(st_data), sc['version'])
                                    rest = sub['data'][sc['pos']+12+sc['size']:]
                                    new_native = make_chunk(0x15, new_struct_chunk + rest, sub['version'])
                                    native_textures.append(new_native)
                                    break

    # Build TXD chunk
    txd_struct = make_chunk(0x01, struct.pack('<H', len(native_textures)) + struct.pack('<H', 0)) # count + device id
    txd_content = bytearray(txd_struct)
    for nt in native_textures:
        txd_content.extend(nt)
    txd_ext = make_chunk(0x03, b'')
    txd_chunk = make_chunk(0x16, bytes(txd_content) + txd_ext)

    for out_path in ['models/cj.txd', 'Dados/models/cj.txd']:
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, 'wb') as f_out:
            f_out.write(txd_chunk)
        print(f'Wrote {out_path} ({len(txd_chunk)} bytes)')

if __name__ == '__main__':
    main()
