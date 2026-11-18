// SPDX-License-Identifier: MPL-2.0
// Export as a filterscript: the same lines of the Pawn export (pwn.js), put in a complete script that creates everything when it
// loads, destroys everything when it unloads and has commands to test the items in the game.
import { textDrawPawn, progressBarPawn, textDrawVar, progressBarVar } from './project.js';
import { gateIdent } from './gates.js';
import { t as tr, tFallback, uiLocale } from '../ui/i18n.js';

// What each creation call goes into, and how it is destroyed
const KINDS = [
  ['CreateDynamicObject', 'Fs_DynObj', 'STREAMER_TAG_OBJECT:', 'DestroyDynamicObject'],
  ['CreateObject', 'Fs_Obj', '', 'DestroyObject'],
  ['CreateVehicle', 'Fs_Veh', '', 'DestroyVehicle'],
  ['AddStaticVehicleEx', 'Fs_Veh', '', 'DestroyVehicle'],
  ['CreateActor', 'Fs_Actor', '', 'DestroyActor'],
  ['CreateDynamic3DTextLabel', 'Fs_DynLabel', 'STREAMER_TAG_3D_TEXT_LABEL:', 'DestroyDynamic3DTextLabel'],
  ['Create3DTextLabel', 'Fs_Label', 'Text3D:', 'Delete3DTextLabel'],
  ['CreateDynamicPickup', 'Fs_DynPickup', 'STREAMER_TAG_PICKUP:', 'DestroyDynamicPickup'],
  ['CreatePickup', 'Fs_Pickup', '', 'DestroyPickup'],
  ['GangZoneCreate', 'Fs_Zone', '', 'GangZoneDestroy'],
];
const CREATE_RE = new RegExp(`^(\\s*)((?:[\\w\\[\\]]+ = )*)(${KINDS.map(k => k[0]).join('|')})\\(`);

const pos3 = (fc, o) => `${fc(o.x)}, ${fc(o.y)}, ${fc(o.z)}`;
// open.mp takes bool in these arguments, where the export writes 0 or 1 (it is the same value in SA-MP)
// (function: positions of those arguments)
const BOOL_ARGS = {
  SetActorInvulnerable: [1], ApplyActorAnimation: [4, 5, 6, 7], Create3DTextLabel: [7],
  TextDrawSetProportional: [1], TextDrawUseBox: [1], TextDrawSetSelectable: [1],
  PlayerTextDrawSetProportional: [2], PlayerTextDrawUseBox: [2], PlayerTextDrawSetSelectable: [2],
  SetObjectMaterialText: [6], AttachObjectToObject: [8],
};
const CALL_RE = new RegExp(`^(\\s*(?:[\\w\\[\\]]+ = )*)(${Object.keys(BOOL_ARGS).join('|')})\\(`);
// The arguments of the call that starts at l[start] (after its parenthesis), outside strings: { args, end } (end: the
// closing parenthesis), or null when it does not close on this line
function callArgs(l, start) {
  const args = [];
  let depth = 0, str = false, from = start;
  for (let i = start; i < l.length; i++) {
    const c = l[i];
    if (str) { if (c === '\\') i++; else if (c === '"') str = false; continue; }
    if (c === '"') str = true;
    else if (c === '(') depth++;
    else if (c === ')' && depth-- === 0) { args.push(l.slice(from, i)); return { args, end: i }; }
    else if (c === ',' && depth === 0) { args.push(l.slice(from, i)); from = i + 1; }
  }
  return null;
}
export function boolArgs(l) {
  const m = CALL_RE.exec(l);
  if (!m) return l;
  const start = m[0].length, call = callArgs(l, start);
  if (!call) return l;
  const { args, end } = call;
  for (const k of BOOL_ARGS[m[2]]) if (/^\s*[01]\s*$/.test(args[k] ?? '')) args[k] = args[k].replace(/[01]/, (v) => (v === '1' ? 'true' : 'false'));
  return l.slice(0, start) + args.join(',') + l.slice(end);
}

// open.mp gives these arguments a tag: a plain number there is warning 213 in a script without SAMP_COMPAT. The tag does not
// change the value (SAMP_COMPAT drops it), but SA-MP does not know it: only the open.mp projects get it
// (function: { position: tag })
const OMP_TAGS = {
  TextDrawFont: { 1: 'TEXT_DRAW_FONT' }, PlayerTextDrawFont: { 2: 'TEXT_DRAW_FONT' },
  TextDrawAlignment: { 1: 'TEXT_DRAW_ALIGN' }, PlayerTextDrawAlignment: { 2: 'TEXT_DRAW_ALIGN' },
  SetObjectMaterialText: { 3: 'OBJECT_MATERIAL_SIZE', 9: 'OBJECT_MATERIAL_TEXT_ALIGN' },
  SetPlayerMapIcon: { 7: 'MAPICON' }, SetPlayerRaceCheckpoint: { 1: 'CP_TYPE' },
};
// The open.mp names of the SA-MP functions it marks as deprecated (warning 234)
const OMP_NAMES = { TextDrawSetPreviewVehCol: 'TextDrawSetPreviewVehicleColours', PlayerTextDrawSetPreviewVehCol: 'PlayerTextDrawSetPreviewVehicleColours' };
const OMP_RE = new RegExp(`(?<![\\w@])(${[...Object.keys(OMP_TAGS), ...Object.keys(OMP_NAMES)].join('|')})\\(`, 'g');
export function ompArgs(l) {
  if (/^\s*\/\//.test(l) || !OMP_RE.test(l)) return l;
  OMP_RE.lastIndex = 0;
  let out = '', from = 0, m;
  while ((m = OMP_RE.exec(l))) {
    const fn = m[1], start = m.index + m[0].length;
    out += l.slice(from, m.index) + (OMP_NAMES[fn] || fn) + '(';
    from = start;
    const call = OMP_TAGS[fn] && callArgs(l, start);
    if (!call) continue;
    const { args, end } = call;
    for (const [k, tag] of Object.entries(OMP_TAGS[fn])) if (/^\s*-?\d+\s*$/.test(args[k] ?? '')) args[k] = args[k].replace(/-?\d+/, (v) => `${tag}:${v}`);
    out += args.join(',');
    from = end;
    OMP_RE.lastIndex = end;
  }
  return out + l.slice(from);
}
// The Pawn lines are written here as "if(" (so the language check does not take them for interface texts); the script gets "if ("
const spaced = (l) => l.replace(/^(\s*)(if|else if|switch|for|while)\(/, '$1$2 (');
const block = (L, head, body) => { L.push(head, '{', ...body.map(l => (l ? '    ' + l : '')), '}', ''); };

// The TextDraws in Pawn: the global ones (created once), the ones of a player and the bars (created for each player, in arrays
// [MAX_PLAYERS], so their lines use name[playerid]). varOf(td, all): the variable of each one; comment(td): its end-of-line comment.
export function tdParts(tds, fc, { varOf, comment, preComments = false } = {}) {
  const vOf = varOf || ((td, all) => (td.type === 'progress' ? progressBarVar(td, all) : textDrawVar(td, all)));
  const cmt = comment || ((td) => (td.name ? ` // ${String(td.name).replace(/[\r\n]+/g, ' ').trim()}` : ''));
  const refVar = (uid) => { const o = tds.find(t => t.uid === uid && t.type !== 'progress'); return o ? vOf(o, tds) : null; };
  const pre = (td) => (preComments && td.preComment ? td.preComment.split('\n').map(l => l.trim()).filter(Boolean).map(l => (l.startsWith('//') || l.startsWith('/*') ? l : `// ${l}`)) : []);
  const globalTds = [], playerTds = [], bars = [];
  for (const td of tds) {
    const v = vOf(td, tds);
    if (td.type === 'progress') bars.push({ v, lines: [...pre(td), ...progressBarPawn(td, v, fc)] });
    else (td.isPlayer ? playerTds : globalTds).push({ v, lines: [...pre(td), ...textDrawPawn(td, v, fc, undefined, cmt(td), refVar)] });
  }
  const perPlayer = [...playerTds, ...bars].map(x => x.v);
  const perPlayerRe = perPlayer.length ? new RegExp(`\\b(${perPlayer.join('|')})\\b(?!\\[)`, 'g') : null;
  const playerTdLines = [...playerTds, ...bars].flatMap(x => x.lines).map(l => l.replace(/^new (PlayerText:)?/, '').replace(perPlayerRe, '$1[playerid]'));
  const globalTdLines = globalTds.flatMap(x => x.lines).map(l => l.replace(/^new Text:/, ''));
  return { globalTds, playerTds, bars, playerTdLines, globalTdLines };
}

// The chat of SA-MP only shows Windows-1252: chatText(text) (gameText of the editor) gives the text the game can show, or null;
// then the message goes in English. Without chatText, a text with letters outside Latin-1 goes in English.
const latin1 = (s) => /^[\x00-\xff]*$/.test(String(s));
const fillArgs = (s, args) => String(s).replace(/\{(\d+)\}/g, (m, i) => (args[i] !== undefined ? String(args[i]) : m));

// ctx: what exportPawn has already built (the lines of each kind, the gate and NPC systems, the cameras) and the
// project's lists. Returns the lines of the script and where the includes go.
export function filterscriptPawn(ctx) {
  const { project, fc, gateId, gateObjs, npcMod, npcActors, actors, vehs, cams } = ctx;
  const npcs = npcActors.length > 0;
  const gameSafe = (s) => (ctx.chatText ? ctx.chatText(s) : (latin1(s) ? s : null));
  const chat = (key, ...args) => gameSafe(tr(key, ...args)) ?? fillArgs(tFallback(key), args);
  const mapName = gameSafe(String(project.name)) ?? ctx.fileName;

  // Every creation call keeps its id in the array of its kind
  const count = new Map();
  const track = (lines) => lines.map(l => l.replace(CREATE_RE, (m, sp, asg, fn) => {
    const arr = KINDS.find(k => k[0] === fn)[1];
    const n = count.get(arr) || 0;
    count.set(arr, n + 1);
    return `${sp}${asg}${arr}[${n}] = ${fn}(`;
  }));
  const objLines = track(ctx.objLines), vehLines = track(ctx.vehLines);
  // actorid = Fs_Actor[n] = CreateActor(...): the following lines use Fs_Actor[n] directly
  let actorVar = 'actorid';
  const actorLines = track(ctx.actorLines).map(l => {
    const m = /^actorid = (Fs_Actor\[\d+\]) = /.exec(l);
    if (m) { actorVar = m[1]; return l.replace(/^actorid = /, ''); }
    return l.replace(/\bactorid\b/g, actorVar);
  });
  const labelLines = track(ctx.labelLines), pickupLines = track(ctx.pickupLines);
  // The gang zones are shown to each player when they connect (ShowForAll only reaches who is already online)
  const zoneColors = [];
  const zoneLines = track(ctx.gangZoneLines).filter(l => {
    const m = /^GangZoneShowForAll\(gangzoneid, (\w+)\);/.exec(l);
    if (m) zoneColors.push(m[1]);
    return !m;
  }).map(l => l.replace(/^gangzoneid = /, ''));

  // TextDraws: the global ones are created when the script loads, the ones of a player and the bars when each player connects
  const tds = project.textDraws || [];
  const { globalTds, playerTds, bars, playerTdLines, globalTdLines } = tdParts(tds, fc);

  // Checkpoints: one of each kind at a time, chosen with /fscp
  const cpCalls = ctx.checkpointLines.filter(l => /^SetPlayer(Race)?Checkpoint\(/.test(l));
  const firstCp = cpCalls.findIndex(l => l.startsWith('SetPlayerCheckpoint('));
  const firstRace = cpCalls.findIndex(l => l.startsWith('SetPlayerRaceCheckpoint('));
  const iconIds = ctx.mapIconLines.map(l => /^SetPlayerMapIcon\(playerid, (\d+)/.exec(l)?.[1]).filter(v => v !== undefined);
  const camCalls = cams.usage.map(u => u.replace(/\s*\/\/.*$/, ''));
  const G = gateIdent(gateId);

  // Items the player can go to with /fsgo <type> <number>
  const live = new Set(['veh']);
  const goto = [
    ['obj', project.objects.filter(o => !o.attach)],
    ['veh', vehs],
    ['actor', actors],
    ['npc', npcActors],
    ['label', project.labels || []],
    ['pickup', project.pickups || []],
    ['cp', project.checkpoints || []],
    ['icon', project.mapIcons || []],
    ['gate', gateObjs],
  ].filter(([, list]) => list.length);

  // SAMP_COMPAT: open.mp accepts the SA-MP names the export writes (and <a_samp> does not warn there); SA-MP ignores it
  // The header always comes first, above the defines and includes
  const date = new Date().toLocaleDateString(uiLocale());
  const L = ['// ================================================================',
    `// ${tr('Mapa: {0}', project.name)}`,
    `// ${tr('Filterscript gerado pelo SA Map Studio em {0}', date)}`,
    `// ${tr('Carregue com: loadfs {0}. Comandos no jogo: /fs', ctx.fileName)}`,
    ...(ctx.warnLines || []),
    '// ================================================================',
    '',
    '#define FILTERSCRIPT', `#define SAMP_COMPAT // ${tr('aceita os nomes de funções do SA-MP')}`, '', project.server === 'samp' ? '#include <a_samp>' : '#include <open.mp>'];
  const incAt = L.length;
  L.push('');
  L.push('#define FS_COLOR_INFO  0xF0A630FF');
  L.push('#define FS_COLOR_OK    0x57B77AFF');
  L.push('');

  // Arrays with the ids of what the script creates
  const used = KINDS.filter(([, arr], i) => count.get(arr) && KINDS.findIndex(k => k[1] === arr) === i);
  for (const [, arr, tag] of used) L.push(`new ${tag}${arr}[${count.get(arr)}];`);
  for (const x of globalTds) L.push(`new Text:${x.v} = INVALID_TEXT_DRAW;`);
  for (const x of playerTds) L.push(`new PlayerText:${x.v}[MAX_PLAYERS];`);
  for (const x of bars) L.push(`new ${x.v}[MAX_PLAYERS];`);
  if (tds.length) L.push('new bool:Fs_TdHidden[MAX_PLAYERS];');
  for (const [k, list] of goto) {
    if (live.has(k)) continue;
    L.push(`stock const Float:Fs_Go_${k}[${list.length}][3] = {`);
    list.forEach((o, i) => L.push(`    {${pos3(fc, o)}}${i < list.length - 1 ? ',' : ''}`));
    L.push('};');
  }
  L.push('');

  if (ctx.gates.decl) L.push(ctx.gates.decl, '');
  if (npcMod.decl) L.push(npcMod.decl, '');
  if (ctx.gates.code) L.push(ctx.gates.code, '');
  if (npcMod.code) L.push(npcMod.code, '');
  if (cams.code) L.push(cams.code, '');

  // ---------------------------------------------------------------- create and destroy
  const init = [];
  if (ctx.needObjId) init.push('new objectid;');
  if (ctx.attachDecl) init.push(ctx.attachDecl);
  if (ctx.needVehId) init.push('new vehicleid;');
  const section = (title, lines) => { if (lines.length) init.push('', `// ${title}`, ...lines); };
  section(tr('Objetos'), objLines);
  section(tr('Veículos'), vehLines);
  section('Actors', actorLines);
  section(tr('Textos 3D'), labelLines);
  section('Pickups', pickupLines);
  section('GangZones', zoneLines);
  section('TextDraws', globalTdLines);
  if (npcMod.load) section(tr('NPCs do open.mp:'), [npcMod.load]);
  init.push('', `// ${tr('Jogadores que já estão no servidor')}`, 'for(new i = 0; i < MAX_PLAYERS; i++)', '{', '    if(IsPlayerConnected(i) && !IsPlayerNPC(i)) Fs_PlayerLoad(i);', '}');
  init.push(`print(${JSON.stringify('[SA Map Studio] ' + chat('Mapa {0} carregado.', mapName))});`, 'return 1;');
  block(L, 'public OnFilterScriptInit()', init);

  const exit = ['for(new i = 0; i < MAX_PLAYERS; i++)', '{', '    if(IsPlayerConnected(i) && !IsPlayerNPC(i)) Fs_PlayerUnload(i);', '}'];
  if (npcMod.load) exit.push(npcMod.load.replace(/_Load\(\);$/, '_Unload();'));
  for (const [, arr, , destroy] of used) exit.push(`for(new i = 0; i < sizeof(${arr}); i++) ${destroy}(${arr}[i]);`);
  for (const x of globalTds) exit.push(`TextDrawDestroy(${x.v});`);
  if (ctx.remLines.length) exit.push(`// ${tr('Os prédios removidos só voltam quando o jogador reconecta.')}`);
  exit.push('return 1;');
  block(L, 'public OnFilterScriptExit()', exit);

  // ---------------------------------------------------------------- each player
  const load = [];
  if (ctx.remLines.length) load.push(...ctx.remLines);
  if (ctx.mapIconLines.length) load.push(...ctx.mapIconLines);
  zoneColors.forEach((c, k) => load.push(`GangZoneShowForPlayer(playerid, Fs_Zone[${k}], ${c});`));
  for (const x of globalTds) load.push(`TextDrawShowForPlayer(playerid, ${x.v});`);
  load.push(...playerTdLines);
  if (tds.length) load.push('Fs_TdHidden[playerid] = false;');
  if (firstCp >= 0) load.push(`Fs_Checkpoint(playerid, ${firstCp});`);
  if (firstRace >= 0) load.push(`Fs_Checkpoint(playerid, ${firstRace});`);
  if (!load.length) load.push('#pragma unused playerid'); // nothing per player: no warning 203
  load.push('return 1;');
  block(L, 'stock Fs_PlayerLoad(playerid)', load);

  const unload = [];
  for (const id of iconIds) unload.push(`RemovePlayerMapIcon(playerid, ${id});`);
  for (const x of playerTds) unload.push(`PlayerTextDrawDestroy(playerid, ${x.v}[playerid]);`);
  for (const x of bars) unload.push(`DestroyPlayerProgressBar(playerid, ${x.v}[playerid]);`);
  if (firstCp >= 0) unload.push('DisablePlayerCheckpoint(playerid);');
  if (firstRace >= 0) unload.push('DisablePlayerRaceCheckpoint(playerid);');
  if (!unload.length) unload.push('#pragma unused playerid');
  unload.push('return 1;');
  block(L, 'stock Fs_PlayerUnload(playerid)', unload);

  if (tds.length) {
    const vis = ['Fs_TdHidden[playerid] = !show;'];
    for (const x of globalTds) vis.push(`if(show) TextDrawShowForPlayer(playerid, ${x.v}); else TextDrawHideForPlayer(playerid, ${x.v});`);
    for (const x of playerTds) vis.push(`if(show) PlayerTextDrawShow(playerid, ${x.v}[playerid]); else PlayerTextDrawHide(playerid, ${x.v}[playerid]);`);
    for (const x of bars) vis.push(`if(show) ShowPlayerProgressBar(playerid, ${x.v}[playerid]); else HidePlayerProgressBar(playerid, ${x.v}[playerid]);`);
    vis.push('return 1;');
    block(L, 'stock Fs_ShowTextDraws(playerid, bool:show)', vis);
  }
  if (cpCalls.length) {
    const sw = ['switch(cp)', '{'];
    cpCalls.forEach((c, k) => sw.push(`    case ${k}: ${c.replace(/\s*\/\/.*$/, '')}`));
    sw.push('    default: return 0;', '}', 'return 1;');
    block(L, 'stock Fs_Checkpoint(playerid, cp)', sw);
  }
  if (camCalls.length) {
    const sw = ['switch(cam)', '{'];
    camCalls.forEach((c, k) => sw.push(`    case ${k}: ${c}`));
    sw.push('    default: return 0;', '}', 'return 1;');
    block(L, 'stock Fs_Camera(playerid, cam)', sw);
  }
  if (goto.length) {
    const go = ['if(!type[0]) return 0;', 'new Float:x, Float:y, Float:z;'];
    for (const [k, list] of goto) {
      go.push(`if(!strcmp(type, "${k}", true))`, '{', `    if(n < 0 || n >= ${list.length}) return 0;`);
      if (k === 'veh') go.push('    GetVehiclePos(Fs_Veh[n], x, y, z);', '    x += 2.5;');
      else go.push(`    x = Fs_Go_${k}[n][0], y = Fs_Go_${k}[n][1], z = Fs_Go_${k}[n][2];`);
      go.push('}', 'else ');
    }
    go.pop();
    go.push('else return 0;', 'if(IsPlayerInAnyVehicle(playerid)) SetVehiclePos(GetPlayerVehicleID(playerid), x, y, z + 1.0);', 'else SetPlayerPos(playerid, x, y, z + 1.0);', 'return 1;');
    // "else " followed by the next "if" on the following line reads as "else if"
    const merged = [];
    for (const l of go) { if (merged.length && merged[merged.length - 1] === 'else ') merged[merged.length - 1] = `else ${l}`; else merged.push(l); }
    block(L, 'stock Fs_Goto(playerid, const type[], n)', merged);
  }

  // ---------------------------------------------------------------- callbacks
  block(L, 'public OnPlayerConnect(playerid)', ['if(!IsPlayerNPC(playerid)) Fs_PlayerLoad(playerid);', 'return 1;']);
  if (ctx.gates.code) {
    L.push('#if defined _INC_open_mp', 'public OnPlayerKeyStateChange(playerid, KEY:newkeys, KEY:oldkeys)', '#else', 'public OnPlayerKeyStateChange(playerid, newkeys, oldkeys)', '#endif');
    L.push('{', `    ${G}_Key(playerid, newkeys, oldkeys);`, '    return 1;', '}', '');
  }

  // ---------------------------------------------------------------- commands
  // [command and its arguments, what it does]
  const help = [[['/fs'], chat('esta lista')]];
  if (goto.length) help.push([['/fsgo', `<${goto.map(g => g[0]).join('|')}>`, '<0..>'], chat('vai até um item do mapa')]);
  if (tds.length) help.push([['/fstd'], chat('mostra ou esconde os textdraws')]);
  if (cpCalls.length) help.push([['/fscp', `<0..${cpCalls.length - 1}>`], chat('mostra um checkpoint')]);
  if (camCalls.length) help.push([['/fscam', `<0..${camCalls.length - 1}>`], chat('roda uma câmera')]);
  if (gateObjs.length) help.push([['/fsgate'], chat('abre os portões perto de você')]);
  if (npcs) help.push([['/fsnpc'], chat('recria os NPCs')]);
  const q = (s) => JSON.stringify(s);
  const cmd = ['new idx = 0, name[16];', 'Fs_Token(cmdtext, idx, name, sizeof(name));'];
  cmd.push('if(!strcmp(name, "/fs", true))', '{', `    SendClientMessage(playerid, FS_COLOR_INFO, ${q(chat('Comandos do mapa {0}:', mapName))});`);
  for (const [c, what] of help) cmd.push(`    SendClientMessage(playerid, -1, ${q(c.join(' ') + ': ' + what)});`);
  cmd.push('    return 1;', '}');
  const arg = ['new param[16];', 'Fs_Token(cmdtext, idx, param, sizeof(param));'];
  const notFound = `SendClientMessage(playerid, FS_COLOR_INFO, ${q(chat('Não existe esse item. Veja /fs.'))});`;
  if (goto.length) {
    cmd.push('if(!strcmp(name, "/fsgo", true))', '{', '    new type[16], param[16];', '    Fs_Token(cmdtext, idx, type, sizeof(type));', '    Fs_Token(cmdtext, idx, param, sizeof(param));');
    cmd.push(`    if(!Fs_Goto(playerid, type, param[0] ? strval(param) : 0)) ${notFound}`, '    return 1;', '}');
  }
  if (tds.length) cmd.push('if(!strcmp(name, "/fstd", true))', '{', '    Fs_ShowTextDraws(playerid, Fs_TdHidden[playerid]);', '    return 1;', '}');
  if (cpCalls.length) cmd.push('if(!strcmp(name, "/fscp", true))', '{', ...arg.map(l => '    ' + l), `    if(!Fs_Checkpoint(playerid, strval(param))) ${notFound}`, '    return 1;', '}');
  if (camCalls.length) cmd.push('if(!strcmp(name, "/fscam", true))', '{', ...arg.map(l => '    ' + l), `    if(!Fs_Camera(playerid, strval(param))) ${notFound}`, '    return 1;', '}');
  if (gateObjs.length) {
    cmd.push('if(!strcmp(name, "/fsgate", true))', '{', `    for(new i = 0; i < sizeof(${G}_Obj); i++)`, '    {');
    cmd.push(`        if(${G}_State[i] == 0 && IsPlayerInRangeOfPoint(playerid, ${G}_Pos[i][13] + 10.0, ${G}_Pos[i][0], ${G}_Pos[i][1], ${G}_Pos[i][2])) ${G}_Move(i, true);`, '    }', '    return 1;', '}');
  }
  if (npcs) {
    const P = npcMod.load.replace(/_Load\(\);$/, '');
    // The names of the NPCs only get free a moment after they leave: they come back by a timer
    cmd.push('if(!strcmp(name, "/fsnpc", true))', '{', `    ${P}_Unload();`, '    SetTimer("Fs_NpcReload", 1000, false);', `    SendClientMessage(playerid, FS_COLOR_OK, ${q(chat('NPCs recriados.'))});`, '    return 1;', '}');
  }
  cmd.push('return 0;');
  block(L, 'public OnPlayerCommandText(playerid, cmdtext[])', cmd);
  if (npcs) {
    L.push('forward Fs_NpcReload();');
    block(L, 'public Fs_NpcReload()', [`${npcMod.load}`, 'return 1;']);
  }

  // Next word of the command (no plugin needed)
  block(L, 'stock Fs_Token(const text[], &idx, dest[], size)', [
    'new len = strlen(text), n = 0;', "while(idx < len && text[idx] == ' ') idx++;",
    "while(idx < len && text[idx] != ' ' && n < size - 1) dest[n++] = text[idx++];", 'dest[n] = EOS;', 'return n;']);
  return { lines: L.map(l => boolArgs(spaced(l))).filter((l, i, all) => l !== '' || all[i - 1] !== ''), incAt };
}
