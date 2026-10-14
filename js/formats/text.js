// Formatos de texto do GTA SA: gta.dat / default.dat, IDE e IPL (texto).

function cleanLines(text) {
  return text.split(/\r?\n/).map(l => {
    const c = l.indexOf('#');
    return (c >= 0 ? l.slice(0, c) : l).trim();
  }).filter(Boolean);
}

function splitFields(line) {
  return line.split(/[,\s]+/).filter(Boolean);
}

// gta.dat: linhas "IDE caminho", "IPL caminho", "IMG caminho"
export function parseDat(text) {
  const out = { ide: [], ipl: [], img: [], colfile: [], texdict: [], modelfile: [] };
  for (const line of cleanLines(text)) {
    const sp = line.indexOf(' ');
    if (sp < 0) continue;
    const kind = line.slice(0, sp).toLowerCase();
    const path = line.slice(sp + 1).trim().replace(/\\/g, '/');
    if (kind === 'colfile') {
      const p = path.split(/\s+/); out.colfile.push(p[p.length - 1]);
    } else if (out[kind]) out[kind].push(path);
  }
  return out;
}

const IDE_OBJECT_SECTIONS = new Set(['objs', 'tobj', 'anim', 'cars', 'peds', 'weap', 'hier']);

// IDE: definições de modelos. Retorna {objects:[], txdParents:[[filho,pai]]}
export function parseIde(text, source = '') {
  const objects = [];
  const txdParents = [];
  let section = null;
  for (const line of cleanLines(text)) {
    const low = line.toLowerCase();
    if (low === 'end') { section = null; continue; }
    if (!section && /^[a-z0-9]+$/.test(low)) { section = low; continue; }
    if (!section) continue;
    const f = splitFields(line);
    if (section === 'txdp') {
      if (f.length >= 2) txdParents.push([f[0].toLowerCase(), f[1].toLowerCase()]);
      continue;
    }
    if (!IDE_OBJECT_SECTIONS.has(section)) continue;
    const id = parseInt(f[0], 10);
    if (!Number.isFinite(id)) continue;
    const def = {
      id,
      model: (f[1] || '').toLowerCase(),
      txd: (f[2] || '').toLowerCase(),
      type: section,
      drawDist: 300,
      flags: 0,
      source,
    };
    if (section === 'objs' || section === 'tobj') {
      // SA: id, model, txd, drawdist, flags  (ou com meshcount antes das distâncias)
      let rest = f.slice(3);
      if (section === 'tobj') rest = rest.slice(0, rest.length - 2);
      if (rest.length >= 2) {
        if (rest.length === 2) { def.drawDist = parseFloat(rest[0]); def.flags = parseInt(rest[1], 10) || 0; }
        else { // meshCount, distâncias..., flags
          const n = parseInt(rest[0], 10) || 1;
          def.drawDist = parseFloat(rest[1 + Math.max(0, n - 1)] ?? rest[1]);
          def.flags = parseInt(rest[rest.length - 1], 10) || 0;
        }
      }
      if (section === 'tobj') { def.timeOn = parseInt(f[f.length - 2], 10); def.timeOff = parseInt(f[f.length - 1], 10); }
    } else if (section === 'anim') {
      def.anim = (f[3] || '').toLowerCase();
      def.drawDist = parseFloat(f[4]) || 300;
      def.flags = parseInt(f[5], 10) || 0;
    } else if (section === 'cars') {
      def.vehicleType = (f[3] || '').toLowerCase();
      def.gameName = f[5] || '';
      def.drawDist = 300;
    } else if (section === 'weap') {
      def.drawDist = parseFloat(f[5]) || 100;
    } else if (section === 'peds') {
      def.drawDist = 100;
    }
    if (!Number.isFinite(def.drawDist) || def.drawDist <= 0) def.drawDist = 300;
    objects.push(def);
  }
  return { objects, txdParents };
}

// IPL texto: seção "inst" (id, nome, interior, x, y, z, qx, qy, qz, qw, lod)
export function parseIplText(text) {
  const inst = [];
  const cars = [];
  let section = null;
  for (const line of cleanLines(text)) {
    const low = line.toLowerCase();
    if (low === 'end') { section = null; continue; }
    if (!section && /^[a-z]+$/.test(low)) { section = low; continue; }
    if (section === 'inst') {
      const f = line.split(',').map(s => s.trim());
      if (f.length < 10) continue;
      const hasInterior = f.length >= 11;
      const o = hasInterior ? 1 : 0;
      inst.push({
        id: parseInt(f[0], 10),
        name: (f[1] || '').toLowerCase(),
        interior: hasInterior ? (parseInt(f[2], 10) || 0) : 0,
        x: parseFloat(f[2 + o]), y: parseFloat(f[3 + o]), z: parseFloat(f[4 + o]),
        qx: parseFloat(f[5 + o]), qy: parseFloat(f[6 + o]), qz: parseFloat(f[7 + o]), qw: parseFloat(f[8 + o]),
        lod: hasInterior ? parseInt(f[10], 10) : -1,
      });
    } else if (section === 'cars') {
      const f = line.split(',').map(s => s.trim());
      if (f.length >= 5) cars.push({ x: +f[0], y: +f[1], z: +f[2], angle: +f[3], id: parseInt(f[4], 10) });
    }
  }
  return { inst, cars };
}
