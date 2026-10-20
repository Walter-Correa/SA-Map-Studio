// Carrega os dados do jogo pela rota /gta/ do servidor local:
// gta.dat/default.dat -> IDEs (modelos) -> índices dos IMG -> IPLs (instâncias do mapa).
import { decodeText } from '../formats/binary.js';
import { parseImgHeader, parseImgDirectory } from '../formats/img.js';
import { parseDat, parseIde, parseIplText } from '../formats/text.js';
import { isBinaryIpl, parseIplBinary } from '../formats/iplbin.js';
import { objectCategory, regionOf } from './categories.js';
import { ALL_SKINS } from './actors.js';
import { ALL_WEAPONS, isWeaponModelId } from './weapons.js';
import { isPickupModel } from './pickups.js';

const SKIP_IPL = /(^|\/)(paths\d?|cull|occlu\w*|audiozon|tunnels)\.ipl$|\.zon$/i;

export class GameFS {
  constructor(base = '/gta/') { this.base = base; }
  url(path) { return this.base + path.replace(/\\/g, '/').split('/').map(encodeURIComponent).join('/'); }
  async read(path, offset, length) {
    const headers = {};
    if (offset !== undefined) headers.Range = `bytes=${offset}-${offset + length - 1}`;
    const res = await fetch(this.url(path), { headers });
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
    return res.arrayBuffer();
  }
  async text(path) { return decodeText(await this.read(path)); }
  async tryText(path) { try { return await this.text(path); } catch { return null; } }
}

export { isKitPiece } from './categories.js';
export const categoryOf = (def) => objectCategory(def);

async function pool(items, limit, fn) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const k = i++; await fn(items[k], k); }
  });
  await Promise.all(workers);
}

export class GameData {
  constructor(fs = new GameFS()) {
    this.fs = fs;
    this.models = new Map();      // id -> def
    this.modelByName = new Map(); // nome -> def
    this.txdParents = new Map();  // txd -> txd pai
    this.imgFiles = [];           // caminhos dos IMG carregados
    this.entries = new Map();     // "nome.ext" -> {img, offset, size}
    this.instances = [];          // todas as instâncias do mapa
    this.warnings = [];
  }

  async load(onProgress = () => {}) {
    const fs = this.fs;
    onProgress('Lendo gta.dat', 0.02);
    const gtaDat = parseDat(await fs.text('data/gta.dat'));
    const defDat = parseDat((await fs.tryText('data/default.dat')) || '');

    // ---- IDE ----
    const ideList = [...defDat.ide, ...gtaDat.ide, 'SAMP/SAMP.ide', 'SAMP/CUSTOM.ide'];
    let done = 0;
    const ideTexts = new Array(ideList.length);
    await pool(ideList, 8, async (p, k) => {
      ideTexts[k] = await fs.tryText(p);
      if (ideTexts[k] === null && !/custom/i.test(p)) this.warnings.push(`IDE não encontrado: ${p}`);
      onProgress('Lendo definições de objetos', 0.05 + 0.15 * (++done / ideList.length));
    });
    ideList.forEach((p, k) => {
      if (!ideTexts[k]) return;
      const { objects, txdParents } = parseIde(ideTexts[k], p.replace(/\\/g, '/'));
      for (const d of objects) {
        this.models.set(d.id, d);
        if (!this.modelByName.has(d.model)) this.modelByName.set(d.model, d);
      }
      for (const [c, par] of txdParents) this.txdParents.set(c, par);
    });

    // Registra todas as skins de Actors (0 a 311) garantindo que todas tenham DFF e TXD mapeados
    for (const s of ALL_SKINS) {
      const def = {
        id: s.id,
        model: s.model,
        txd: s.txd,
        name: s.name,
        type: 'peds',
        drawDist: 100,
        flags: 0,
        source: 'actors.js',
      };
      this.models.set(s.id, def);
      if (!this.modelByName.has(s.model)) this.modelByName.set(s.model, def);
    }

    // Registra todas as armas  (321 a 372)
    for (const w of ALL_WEAPONS) {
      if (!this.models.has(w.id)) {
        const def = {
          id: w.id,
          model: w.model,
          txd: w.txd,
          name: w.name,
          type: 'weap',
          drawDist: 100,
          flags: 0,
          source: 'weapons.js',
        };
        this.models.set(w.id, def);
        if (!this.modelByName.has(w.model)) this.modelByName.set(w.model, def);
      } else {
        const def = this.models.get(w.id);
        def.type = 'weap';
        if (!def.name) def.name = w.name;
      }
    }

    // ---- IMG ----
    const imgList = ['models/gta3.img', 'models/gta_int.img', 'models/cutscene.img', 'SAMP/SAMP.img', 'SAMP/custom.img'];
    done = 0;
    for (const img of imgList) {
      onProgress(`Indexando ${img}`, 0.2 + 0.2 * (done++ / imgList.length));
      try {
        const head = await fs.read(img, 0, 8);
        const count = parseImgHeader(head);
        const dir = await fs.read(img, 0, 8 + count * 32);
        for (const e of parseImgDirectory(dir, count)) {
          // Entrada vazia (tamanho 0) não é lida: sem isso o arquivo .img inteiro seria baixado
          if (!e.size || !e.name) continue;
          this.entries.set(e.name.toLowerCase(), { img, offset: e.offset, size: e.size });
        }
        this.imgFiles.push(img);
      } catch (err) {
        if (!/custom/i.test(img)) this.warnings.push(`Não consegui ler ${img} (${err.message})`);
      }
    }

    // Registra modelo e textura padrão de Carl Johnson (Skin 0 / CJ)
    this.entries.set('cj.dff', { img: 'models/cj.dff', offset: 0, size: 0 });
    this.entries.set('cj.txd', { img: 'models/cj.txd', offset: 0, size: 0 });

    // ---- IPL texto ----
    const iplList = [...gtaDat.ipl.filter(p => !SKIP_IPL.test(p)), 'SAMP/SAMP.ipl'];
    const textIpl = new Map(); // nome-base -> {start, count}
    done = 0;
    const iplTexts = new Array(iplList.length);
    await pool(iplList, 8, async (p, k) => {
      iplTexts[k] = await fs.tryText(p);
      onProgress('Lendo posicionamento do mapa', 0.4 + 0.2 * (++done / iplList.length));
    });
    iplList.forEach((p, k) => {
      if (!iplTexts[k]) return;
      const base = p.replace(/\\/g, '/').split('/').pop().replace(/\.ipl$/i, '').toLowerCase();
      const { inst } = parseIplText(iplTexts[k]);
      // map: posição no arquivo -> índice global (o "lod" do IPL aponta para a posição no arquivo)
      const map = inst.map(it => this.addInstance(it, base));
      textIpl.set(base, map);
    });

    // ---- IPL binário (streaming) dentro dos IMG ----
    const streams = [];
    for (const [name, e] of this.entries) {
      const m = /^(.+)_stream\d+\.ipl$/.exec(name);
      if (m) streams.push({ name, base: m[1], e });
    }
    done = 0;
    const results = new Array(streams.length);
    await pool(streams, 8, async (s, k) => {
      try {
        const buf = await fs.read(s.e.img, s.e.offset, s.e.size);
        if (isBinaryIpl(buf)) results[k] = parseIplBinary(buf).inst;
      } catch (err) { this.warnings.push('IPL ' + s.name + ': ' + err.message); }
      onProgress('Lendo mapa em streaming', 0.6 + 0.35 * (++done / streams.length));
    });
    streams.forEach((s, k) => {
      if (!results[k]) return;
      const map = textIpl.get(s.base) || [];
      for (const it of results[k]) {
        const idx = this.addInstance(it, s.base);
        if (idx >= 0) this.instances[idx].lodIndex = it.lod >= 0 && it.lod < map.length ? map[it.lod] : -1;
      }
    });

    // Instâncias dos IPL de texto apontam para o LOD pela posição no mesmo arquivo
    for (const map of textIpl.values()) {
      for (const idx of map) {
        if (idx < 0) continue;
        const inst = this.instances[idx];
        const l = inst.rawLod;
        inst.lodIndex = l >= 0 && l < map.length ? map[l] : -1;
      }
    }
    // Liga cada LOD aos seus filhos (para trocar LOD <-> modelo detalhado)
    for (const inst of this.instances) {
      if (inst.lodIndex >= 0) {
        const lod = this.instances[inst.lodIndex];
        if (lod) { (lod.children || (lod.children = [])).push(inst); inst.lodRef = lod; lod.isLod = true; }
      }
    }
    // Quem tem LOD próprio é um modelo detalhado, mesmo que o nome comece com "lod"
    for (const inst of this.instances) if (inst.lodRef && !inst.children) inst.isLod = false;
    onProgress('Pronto', 1);
    return this;
  }

  // Devolve o índice global da instância (ou -1 se o modelo não tem definição)
  addInstance(it, base) {
    const def = this.models.get(it.id);
    if (!def) { this.skipped = (this.skipped || 0) + 1; return -1; }
    const flags = it.interior | 0;
    const inst = {
      index: this.instances.length,
      id: it.id, def,
      x: it.x, y: it.y, z: it.z,
      qx: it.qx, qy: it.qy, qz: it.qz, qw: it.qw,
      // Os bits altos do campo "interior" são flags do jogo (sem importância, túnel...):
      // o número do interior fica só no byte de baixo
      interior: flags & 0xff,
      rawLod: it.lod,
      lodIndex: -1,
      ipl: base,
      isLod: def.model.startsWith('lod'),
      children: null, lodRef: null,
    };
    this.instances.push(inst);
    return inst.index;
  }

  entry(name) { return this.entries.get(name.toLowerCase()) || null; }

  async readEntry(name) {
    const e = this.entry(name);
    if (!e) return null;
    return this.fs.read(e.img, e.offset, e.size);
  }

  catalog() {
    const out = [];
    for (const d of this.models.values()) {
      if (d.type === 'hier') continue;
      if (!this.entries.has(d.model + '.dff')) continue;
      let category = objectCategory(d);
      if (d.type === 'weap' || isWeaponModelId(d.id)) {
        category = 'Armas';
      } else if (d.type === 'peds') {
        if (d.id !== 0) continue; // No catálogo "todos" ou "actors" mantém apenas uma skin disponível (ID 0)
        category = 'Actors (Personagens)';
      } else if (d.type === 'cars') {
        category = 'Veículos';
      } else if (isPickupModel(d.id)) {
        category = 'Pickups';
      }
      out.push({
        id: d.id,
        name: d.type === 'peds' ? 'Actor (Personagem)' : (d.name || d.model),
        category,
        region: regionOf(d),
        isLod: category.startsWith('LOD'),
        def: d
      });
    }
    out.sort((a, b) => a.id - b.id);
    return out;
  }
}
