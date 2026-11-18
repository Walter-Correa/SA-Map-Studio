// SPDX-License-Identifier: MPL-2.0
// Import and export of maps in Pawn (.pwn) and IPL.
// Compatible with what Map Construction, Texture Studio and similar editors export.
import { normalizeMaterial, materialCall, parseColor, toInt, decodePawnString, encodePawnString } from './materials.js';
import { VEHICLE_COMPONENTS } from '../world/vehicleMods.js';
import { mapIconSlots, textDrawNative, progressBarPawn, progressBarVar, textDrawVar, PB_DIRECTIONS, PB_LIMITS, PB_STYLE_NAMES, clampPbStyle, clampPbSegments, clampPbSegmentScale, clampPbAutoFillMax, fitPbBorder, clampPbBlinkInterval, clampPbBlinkDuration, textDrawPawn, PB_INCLUDE, PB_LABEL_ORIENTS } from './project.js';
import { TDFX_FUNCTIONS, TDFX_INCLUDE, tdfxActive, tdfxFromCall } from './tdfx.js';
import { gatePawn, gateVar, importGates } from './gates.js';
import { npcPawn, npcIdent, projectNpcs, importNpcs } from './ompNpc.js';
import { filterscriptPawn, tdParts, boolArgs } from './filterscript.js';

import { t as tr, uiLocale } from '../ui/i18n.js';
const VEHICLE_MIN = 400, VEHICLE_MAX = 611;
export const isVehicleModel = (id) => id >= VEHICLE_MIN && id <= VEHICLE_MAX;

function maskComments(source) {
  const len = source.length;
  let masked = '';
  let inLineCmt = false, inBlockCmt = false, inStr = false;
  for (let i = 0; i < len; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (inLineCmt) {
      if (ch === '\n') {
        inLineCmt = false;
        masked += '\n';
      } else {
        masked += ' ';
      }
      continue;
    }

    if (inBlockCmt) {
      if (ch === '*' && next === '/') {
        inBlockCmt = false;
        masked += '  ';
        i++;
      } else {
        masked += (ch === '\n' ? '\n' : ' ');
      }
      continue;
    }

    if (inStr) {
      masked += ch;
      if (ch === '\\') {
        i++;
        masked += (source[i] ?? '');
      } else if (ch === '"') {
        inStr = false;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineCmt = true;
      masked += '  ';
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockCmt = true;
      masked += '  ';
      i++;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      masked += '"';
      continue;
    }
    masked += ch;
  }
  return masked;
}

// Splits the arguments of a call respecting strings and parentheses
function splitArgs(s) {
  const out = [];
  let depth = 0, cur = '', str = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (str) { cur += ch; if (ch === '\\') { cur += s[++i] ?? ''; } else if (ch === '"') str = false; continue; }
    if (ch === '"') { str = true; cur += ch; continue; }
    if (ch === '(' || ch === '{' || ch === '[') depth++;
    if (ch === ')' || ch === '}' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const num = (v, def = 0) => {
  if (v === undefined) return def;
  // open.mp takes true/false in the bool arguments (the export writes them so)
  if (/^\s*true\s*$/i.test(v)) return 1;
  if (/^\s*false\s*$/i.test(v)) return 0;
  const n = parseFloat(String(v).replace(/^Float:/i, '').replace(/[^\d.eE+\-]/g, ''));
  return Number.isFinite(n) ? n : def;
};
const int = (v, def = 0) => { const n = Math.trunc(num(v, NaN)); return Number.isFinite(n) ? n : def; };
const unquote = (s) => (s || '').trim().replace(/^"|"$/g, '');

// A wrapped function name also counts: the known name must be a whole word inside the identifier, with an optional
// prefix ending in "_" (new_CreatePlayerTextDraw) and an optional suffix starting with "Ex" or "_" (CreatePlayerTextDrawEx).
// The lookbehind keeps TextDrawFont from matching inside PlayerTextDrawFont; group 3 is the suffix.
const FN_RE = new RegExp(String.raw`(?:([A-Za-z_@][\w@]*(?:\s*\[[^\]=;]*\])*)\s*=\s*)?(?<![\w@])(?:[\w@]*_)?(CreateDynamicObjectEx|CreateDynamicObject|CreateObject|CreatePlayerObject|RemoveBuildingForPlayer|RemoveBuilding|AddStaticVehicleEx|AddStaticVehicle|CreateVehicle|ChangeVehicleColor|ChangeVehiclePaintjob|AddVehicleComponent|CreateActor|ApplyActorAnimation|SetActorVirtualWorld|SetActorInvulnerable|SetActorHealth|SetActorFacingAngle|SetActorPos|Create3DTextLabel|CreateDynamic3DTextLabel|CreatePickup|CreateDynamicPickup|GangZoneCreate|GangZoneShowForPlayer|GangZoneShowForAll|SetPlayerCheckpoint|CreateDynamicCP|SetPlayerRaceCheckpoint|CreateDynamicRaceCP|SetPlayerMapIcon|CreateDynamicMapIcon|TextDrawCreate|CreatePlayerTextDraw|TextDrawFont|TextDrawColor|TextDrawBoxColor|TextDrawBackgroundColor|TextDrawLetterSize|TextDrawTextSize|TextDrawSetOutline|TextDrawSetShadow|TextDrawAlignment|TextDrawSetSelectable|TextDrawSetProportional|TextDrawSetPreviewModel|TextDrawSetPreviewRot|TextDrawSetPreviewVehCol|TextDrawUseBox|PlayerTextDrawFont|PlayerTextDrawColor|PlayerTextDrawBoxColor|PlayerTextDrawBackgroundColor|PlayerTextDrawLetterSize|PlayerTextDrawTextSize|PlayerTextDrawSetOutline|PlayerTextDrawSetShadow|PlayerTextDrawAlignment|PlayerTextDrawSetSelectable|PlayerTextDrawSetProportional|PlayerTextDrawSetPreviewModel|PlayerTextDrawSetPreviewRot|PlayerTextDrawSetPreviewVehCol|PlayerTextDrawUseBox|CreatePlayerProgressBar|SetPlayerProgressBarValue|BlinkPlayerProgressBar|AutoFillPlayerProgressBar|SetPlayerProgressBarMinValue|SetPlayerProgressBarRange|SetPlayerProgressBarGradient|SetPlayerProgressBarLabel|InterpolatePlayerProgressBarValue|${TDFX_FUNCTIONS.join('|')}|MoveDynamicObject|MoveObject|AttachDynamicObjectToObject|AttachObjectToObject|AttachDynamicObjectToVehicle|AttachObjectToVehicle|SetDynamicObjectMaterialText|SetDynamicObjectMaterial|SetPlayerObjectMaterialText|SetPlayerObjectMaterial|SetObjectMaterialText|SetObjectMaterial|SetPlayerCameraPos|SetPlayerCameraLookAt|InterpolateCameraPos|InterpolateCameraLookAt|SetPlayerPos|SetPlayerInterior)((?:Ex(?![a-z])|_)[\w@]*)?\s*\(`, 'g');
// Streamer functions whose Ex version has its own parameter order (streamer.inc): parameter names of the base
// function and of the Ex one. The Ex call is rewritten in the base order; worlds/interiors/players lists keep
// only their first value, areas and priority are dropped.
const STREAMER_PARAMS = {
  CreateDynamicObject: [
    'modelid,x,y,z,rx,ry,rz,worldid,interiorid,playerid,streamdistance,drawdistance',
    'modelid,x,y,z,rx,ry,rz,streamdistance,drawdistance,worlds,interiors,players'],
  CreateDynamicPickup: [
    'modelid,type,x,y,z,worldid,interiorid,playerid,streamdistance',
    'modelid,type,x,y,z,streamdistance,worlds,interiors,players'],
  CreateDynamicCP: [
    'x,y,z,size,worldid,interiorid,playerid,streamdistance',
    'x,y,z,size,streamdistance,worlds,interiors,players'],
  CreateDynamicRaceCP: [
    'type,x,y,z,nextx,nexty,nextz,size,worldid,interiorid,playerid,streamdistance',
    'type,x,y,z,nextx,nexty,nextz,size,streamdistance,worlds,interiors,players'],
  CreateDynamicMapIcon: [
    'x,y,z,type,color,worldid,interiorid,playerid,streamdistance,style',
    'x,y,z,type,color,style,streamdistance,worlds,interiors,players'],
  CreateDynamic3DTextLabel: [
    'text,color,x,y,z,drawdistance,attachedplayer,attachedvehicle,testlos,worldid,interiorid,playerid,streamdistance',
    'text,color,x,y,z,drawdistance,attachedplayer,attachedvehicle,testlos,streamdistance,worlds,interiors,players'],
};
const STREAMER_EX = new Set(Object.keys(STREAMER_PARAMS));
const EX_LISTS = { worlds: 'worldid', interiors: 'interiorid', players: 'playerid' };
// First value of an array argument: "{ 3, 4 }" -> "3"; a plain value stays as it is
const firstOfList = (v) => {
  if (v === undefined) return undefined;
  const s = String(v).trim();
  if (!s.startsWith('{')) return s;
  return splitArgs(s.replace(/^\{|\}$/g, ''))[0];
};
function streamerExToBase(base, pos, named) {
  const [baseNames, exNames] = STREAMER_PARAMS[base].map(s => s.split(','));
  const vals = {}, rest = {};
  exNames.forEach((n, i) => { if (pos[i] !== undefined) vals[n] = pos[i]; });
  for (const [k, v] of Object.entries(named)) {
    if (exNames.includes(k)) vals[k] = v; else rest[k] = v;
  }
  for (const [list, id] of Object.entries(EX_LISTS)) {
    if (vals[list] !== undefined) vals[id] = firstOfList(vals[list]);
  }
  const out = baseNames.map(n => vals[n]);
  while (out.length && out[out.length - 1] === undefined) out.pop();
  return { pos: out, named: rest };
}
const DECL_BEFORE_RE = /\b(?:stock|public|static|forward|native|hook|function)\s+(?:[A-Za-z_@][\w@]*:\s*)?$/;

const varKey = (s) => String(s || '').replace(/\s+/g, '');
// Color written as a number (0xRRGGBBAA or decimal); anything else is 0 (default color)
const colorArgOrZero = (v) => (v !== undefined && /^-?(0x[0-9a-f]+|\d+)$/i.test(String(v).trim()) ? (parseColor(v) >>> 0) : 0);

// Named Pawn arguments (.worldid = 0) become a separate map
function splitNamed(args) {
  const pos = [], named = {};
  for (const a of args) {
    const m = /^\.(\w+)\s*=\s*([\s\S]*)$/.exec(a);
    if (m) named[m[1].toLowerCase()] = m[2]; else pos.push(a);
  }
  return { pos, named };
}

export function isStudioSectionComment(str) {
  if (!str) return false;
  const t = String(str).trim();
  // The note of the relative export: "... (x, y, z)"
  if (/^\/\/ .*\(-?[\d.]+, -?[\d.]+, -?[\d.]+\)$/.test(t)) return true;
  return /^\/\/\s*(textos?\s*3d|3d\s*text(s|label)?|pickups?|gang\s*zones?|checkpoints?|map\s*icons?|text\s*draws?|actors?|objetos?|objects?|ve[íi]culos|vehicles?|sons\s*\(playerplaysound\)|sons?|extras dos objetos.*|object extras.*|object coordinates array.*|coloque em onplayerconnect.*|removed objects.*|c[âa]meras):?$/i.test(t);
}

function extractPreceding(between) {
  const lines = between.split('\n');
  const commentLines = [];
  let blankLines = 0;
  for (const rawLine of lines) {
    const t = rawLine.trim();
    if (!t) {
      blankLines++;
    } else if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.endsWith('*/')) {
      if (!isStudioSectionComment(t)) {
        commentLines.push(t);
      }
    }
  }
  return {
    preComment: commentLines.join('\n'),
    blankLinesBefore: blankLines,
  };
}

export function cleanPwnHeader(headerText) {
  if (!headerText) return '';
  const rawLines = String(headerText).split('\n');
  const kept = [];
  let inStudioBanner = false;

  for (let i = 0; i < rawLines.length; i++) {
    const l = rawLines[i];
    const t = l.trim();

    // Start / end of editor comment bands (// ================= or // -----------------)
    if (t.startsWith('// =====') || t.startsWith('// -----')) {
      inStudioBanner = !inStudioBanner;
      continue;
    }
    if (inStudioBanner) continue;

    // Generated lines of the editor header
    if (t.startsWith('// Mapa:') ||
        t.startsWith('// Gerado pelo SA Map Studio') ||
        t.startsWith('// Objetos:') ||
        t.startsWith('// Textos 3D:') ||
        t.startsWith('// Como usar:') ||
        t.startsWith('//   OnGameModeInit') ||
        t.startsWith('//   OnPlayerConnect') ||
        /^#include\s*<(ProgressBar|TextDrawFX|streamer)>/i.test(t) ||
        t.startsWith('//   Posições relativas') ||
        t.startsWith('//   Câmeras')) {
      continue;
    }

    // stock/public/forward function declarations generated by the studio or wrapper variables
    if (/^(stock|public|forward)\s+(Mapa_\w+_(Carregar|Remover)|Map_\w+_(Load|Remove))\s*\(/i.test(t) ||
        /^(new\s+(objectid|vehicleid|attachtoid(\s*\[\s*\d*\s*\])?|actorid|gangzoneid);)/i.test(t) ||
        t === '{' || t === '}' || t === 'return 1;' || t === 'return 0;') {
      continue;
    }

    kept.push(l);
  }

  while (kept.length && !kept[0].trim()) kept.shift();
  while (kept.length && !kept[kept.length - 1].trim()) kept.pop();
  return kept.join('\n');
}

// Comments of the first item inside the function that creates the map (what comes before it in the function)
function bodyComments(body) {
  const comments = [];
  let blanks = 0;
  for (const l of body.split('\n')) {
    const t = l.trim();
    if (!t) blanks++;
    else if ((t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.endsWith('*/')) && !isStudioSectionComment(t)) comments.push(t);
  }
  return { comments, blanks };
}

function splitHeaderAndFirstItem(between, isFilterscript = false) {
  // A map exported by the editor as a module: everything from its banner to Map_X_Load() was generated (banner, includes, arrays,
  // gate and NPC systems); only what is above the banner is the user's header
  const loadAt = between.search(/^[ \t]*stock\s+(Map_\w+_Load|Mapa_\w+_Carregar)\s*\(/m);
  // A filterscript exported by the editor: all of it up to the first item was generated (cameras, gates, NPCs...)
  if (isFilterscript) return { header: '', preComment: '', blankLines: 0 };
  if (loadAt >= 0) {
    const before = between.slice(0, loadAt), after = between.slice(loadAt);
    const bannerAt = before.search(/^\/\/ ={5}/m);
    const header = bannerAt >= 0 ? cleanPwnHeader(before.slice(0, bannerAt)) : '';
    const { comments, blanks } = bodyComments(after.slice(after.indexOf('{') + 1));
    return { header, preComment: comments.join('\n'), blankLines: blanks };
  }
  const lines = between.split('\n');
  const headerLines = [];
  const itemComments = [];
  let blankCount = 0;
  let hasCodeHeader = false;
  let band = false;

  for (let idx = 0; idx < lines.length; idx++) {
    const l = lines[idx];
    const t = l.trim();
    if (t.startsWith('#') || t.startsWith('stock ') || t.startsWith('public ') || t.startsWith('forward ') || t === '{') {
      hasCodeHeader = true;
      headerLines.push(l);
    } else if (hasCodeHeader) {
      // The warnings band of the "lines" export is generated
      if (t.startsWith('// -----')) { band = !band; continue; }
      if (band) continue;
      if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.endsWith('*/')) {
        if (!isStudioSectionComment(t)) {
          itemComments.push(t);
        }
      } else if (!t) {
        blankCount++;
      }
    } else {
      headerLines.push(l);
    }
  }

  if (hasCodeHeader) {
    const cleaned = cleanPwnHeader(headerLines.join('\n'));
    return {
      header: cleaned,
      preComment: itemComments.join('\n'),
      blankLines: blankCount,
    };
  }

  const allComments = [];
  let blanks = 0;
  let inBand = false;
  for (const l of lines) {
    const t = l.trim();
    // The warnings band of the "lines" export is generated
    if (t.startsWith('// -----')) { inBand = !inBand; continue; }
    if (inBand) continue;
    if (!t) blanks++;
    else if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.endsWith('*/')) {
      if (!isStudioSectionComment(t)) {
        allComments.push(t);
      }
    }
  }
  return {
    header: '',
    preComment: allComments.join('\n'),
    blankLines: blanks,
  };
}

// Reads the text and returns {objects, vehicles, actors, removed, labels, pickups, gangZones, checkpoints, mapIcons, textDraws, cameras, spawn, preservedHeader, rawPawn}
export function parsePwn(source) {
  const masked = maskComments(source);
  const objects = [], vehicles = [], actors = [], removed = [];
  const labels = [], pickups = [], gangZones = [], textDraws = [];
  const checkpoints = [], mapIcons = [];
  const shots = [], paths = [];
  let spawn = null, interior = null;
  const vars = new Map();
  const fxRefs = []; // TextDrawFX effects that name another TextDraw
  let last = null, lastVeh = null, lastActor = null, pendingShot = null, pendingMove = null;

  // Objects exported "as an array": new Float:Name[][7] = { { model, x, y, z, rx, ry, rz }, ... };
  for (const m of masked.matchAll(/\[\s*\]\s*\[\s*7\s*\]\s*=\s*\{([\s\S]*?)\}\s*;/g)) {
    for (const row of m[1].matchAll(/\{([^{}]*)\}/g)) {
      const c = row[1].split(',').map(v => v.trim());
      if (c.length < 7 || !Number.isFinite(Number(c[0]))) continue;
      objects.push({
        model: int(c[0]), x: num(c[1]), y: num(c[2]), z: num(c[3]), rx: num(c[4]), ry: num(c[5]), rz: num(c[6]),
        world: -1, interior: -1, streamDist: 0, drawDist: 0, materials: [],
        comment: '', preComment: '', blankLinesBefore: 0,
        raw: { x: c[1], y: c[2], z: c[3], rx: c[4], ry: c[5], rz: c[6] },
      });
    }
  }
  let lastTopStmtEnd = 0;
  let firstItemSeen = false;
  let preservedHeader = '';

  const childFns = new Set([
    'SetObjectMaterial', 'SetDynamicObjectMaterial', 'SetPlayerObjectMaterial',
    'SetObjectMaterialText', 'SetDynamicObjectMaterialText', 'SetPlayerObjectMaterialText',
    'MoveObject', 'MoveDynamicObject',
    'AttachObjectToObject', 'AttachDynamicObjectToObject',
    'AttachObjectToVehicle', 'AttachDynamicObjectToVehicle',
    'ChangeVehicleColor', 'ChangeVehiclePaintjob', 'AddVehicleComponent',
    'ApplyActorAnimation', 'SetActorVirtualWorld', 'SetActorInvulnerable',
    'SetActorHealth', 'SetActorFacingAngle', 'SetActorPos',
    'GangZoneShowForPlayer', 'GangZoneShowForAll',
    'TextDrawFont', 'TextDrawColor', 'TextDrawBoxColor', 'TextDrawBackgroundColor',
    'TextDrawLetterSize', 'TextDrawTextSize', 'TextDrawSetOutline', 'TextDrawSetShadow',
    'TextDrawAlignment', 'TextDrawSetSelectable', 'TextDrawSetProportional',
    'TextDrawSetPreviewModel', 'TextDrawSetPreviewRot', 'TextDrawSetPreviewVehCol', 'TextDrawUseBox',
    'PlayerTextDrawFont', 'PlayerTextDrawColor', 'PlayerTextDrawBoxColor', 'PlayerTextDrawBackgroundColor', 'PlayerTextDrawLetterSize', 'PlayerTextDrawTextSize', 'PlayerTextDrawSetOutline', 'PlayerTextDrawSetShadow', 'PlayerTextDrawAlignment', 'PlayerTextDrawSetSelectable', 'PlayerTextDrawSetProportional', 'PlayerTextDrawSetPreviewModel', 'PlayerTextDrawSetPreviewRot', 'PlayerTextDrawSetPreviewVehCol', 'PlayerTextDrawUseBox',
    'SetPlayerProgressBarMinValue', 'SetPlayerProgressBarRange', 'SetPlayerProgressBarGradient', 'SetPlayerProgressBarLabel', 'InterpolatePlayerProgressBarValue',
    ...TDFX_FUNCTIONS,
  ]);

  // Pre-parse of batch camera movement callbacks with switch(step) and cases
  const ignoredSpans = [];
  const cbRegex = /(?:forward\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*;\s*)?public\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*(?:\/\/\s*([^\r\n]*))?\s*\{([\s\S]*?)\n\}/g;
  let cbm;
  while ((cbm = cbRegex.exec(source))) {
    const fnName = cbm[2];
    const inlineName = (cbm[4] || '').trim();
    const body = cbm[5];
    if (body.includes('InterpolateCameraPos') || body.includes('InterpolateCameraLookAt')) {
      const caseRegex = /(?:\/\/\s*([^\r\n]*)\r?\n\s*)?case\s+(\d+)\s*:\s*(?:\/\/\s*([^\r\n]*))?\s*\{([\s\S]*?)\}/g;
      let cm;
      const cases = [];
      while ((cm = caseRegex.exec(body))) {
        const stepNum = parseInt(cm[2], 10);
        const stepName = (cm[3] || cm[1] || '').trim();
        const caseBody = cm[4];

        let fromPos = null, toPos = null, time = 5000, cut = 'cut';
        let fromLook = null, toLook = null;
        let timerDelay = null;

        const posM = /(?<![\w@])(?:[\w@]*_)?InterpolateCameraPos(?:(?:Ex(?![a-z])|_)[\w@]*)?\s*\(([^)]+)\)/.exec(caseBody);
        if (posM) {
          const cArgs = splitArgs(posM[1]);
          const o = (cArgs.length >= 8 && isNaN(Number(cArgs[0]))) ? 1 : 0;
          if (cArgs.length >= 7 + o) {
            fromPos = { x: num(cArgs[o]), y: num(cArgs[o + 1]), z: num(cArgs[o + 2]) };
            toPos = { x: num(cArgs[o + 3]), y: num(cArgs[o + 4]), z: num(cArgs[o + 5]) };
            time = Math.max(1, int(cArgs[o + 6], 5000));
            cut = cArgs[o + 7] === 'CAMERA_MOVE' || int(cArgs[o + 7]) === 1 ? 'move' : 'cut';
          }
        }

        const lookM = /(?<![\w@])(?:[\w@]*_)?InterpolateCameraLookAt(?:(?:Ex(?![a-z])|_)[\w@]*)?\s*\(([^)]+)\)/.exec(caseBody);
        if (lookM) {
          const cArgs = splitArgs(lookM[1]);
          const o = (cArgs.length >= 7 && isNaN(Number(cArgs[0]))) ? 1 : 0;
          if (cArgs.length >= 6 + o) {
            fromLook = { x: num(cArgs[o]), y: num(cArgs[o + 1]), z: num(cArgs[o + 2]) };
            toLook = { x: num(cArgs[o + 3]), y: num(cArgs[o + 4]), z: num(cArgs[o + 5]) };
          }
        }

        const timerM = /SetTimerEx\s*\(([^)]+)\)/.exec(caseBody);
        if (timerM) {
          const tArgs = splitArgs(timerM[1]);
          timerDelay = int(tArgs[1], 0);
        }

        if (fromPos && toPos && fromLook && toLook) {
          cases.push({
            step: stepNum,
            name: stepName,
            fromPos,
            toPos,
            fromLook,
            toLook,
            time,
            cut,
            hold: timerDelay && timerDelay > time ? timerDelay - time : 0
          });
        }
      }

      if (cases.length > 0) {
        cases.sort((a, b) => a.step - b.step);
        // The end: calls itself again (loop), puts the camera behind the player, or stays on the last point.
        // The SetTimerEx("name", ...) of each step is not a call
        let end = 'keep';
        if (new RegExp(`(?<!["\\w@])${fnName}\\s*\\(`).test(body)) end = 'loop';
        else if (/\bSetCameraBehindPlayer\s*\(/.test(body)) end = 'behind';

        const keys = [
          {
            name: 'Início',
            pos: cases[0].fromPos,
            look: cases[0].fromLook,
            time: 0,
            hold: 0,
            cut: 'cut'
          }
        ];

        for (const c of cases) {
          keys.push({
            name: c.name || `Câmera ${c.step + 1}`,
            pos: c.toPos,
            look: c.toLook,
            time: c.time,
            hold: c.hold,
            cut: c.cut
          });
        }

        paths.push({
          id: 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          name: inlineName || fnName,
          end,
          keys
        });

        ignoredSpans.push([cbm.index, cbm.index + cbm[0].length]);
      }
    }
  }

  const re = new RegExp(FN_RE.source, 'g');
  let m;
  while ((m = re.exec(masked))) {
    const stmtStart = m.index;
    if (ignoredSpans.some(([s, e]) => stmtStart >= s && stmtStart < e)) continue;
    let i = re.lastIndex, depth = 1, str = false;
    for (; i < masked.length && depth > 0; i++) {
      const ch = masked[i];
      if (str) { if (ch === '\\') i++; else if (ch === '"') str = false; continue; }
      if (ch === '"') str = true; else if (ch === '(') depth++; else if (ch === ')') depth--;
    }
    const inner = masked.slice(re.lastIndex, i - 1);
    re.lastIndex = i;
    const stmtEnd = i;
    let fn = m[2];
    // CreateDynamicObjectEx is in the list on its own; the other streamer Ex functions come as base name + "Ex" suffix
    const exBase = fn === 'CreateDynamicObjectEx' ? 'CreateDynamicObject'
      : (m[3] && /^Ex/.test(m[3]) && STREAMER_EX.has(fn) ? fn : null);
    // Declarations and definitions of wrappers (stock new_CreatePlayerTextDraw(...) { ... }) and #define lines are not items
    const defBody = /^\s*\{/.exec(masked.slice(stmtEnd, stmtEnd + 200));
    if (defBody) {
      // The wrapper's own body forwards its parameters to the real function: skip it too
      let j = stmtEnd + defBody[0].length, d = 1, q = false;
      for (; j < masked.length && d > 0; j++) {
        const ch = masked[j];
        if (q) { if (ch === '\\') j++; else if (ch === '"') q = false; continue; }
        if (ch === '"') q = true; else if (ch === '{') d++; else if (ch === '}') d--;
      }
      re.lastIndex = j;
      continue;
    }
    if (DECL_BEFORE_RE.test(masked.slice(Math.max(0, stmtStart - 48), stmtStart))) continue;
    if (/^[ \t]*#/.test(masked.slice(masked.lastIndexOf('\n', stmtStart) + 1, stmtStart))) continue;
    let { pos: a, named } = splitNamed(splitArgs(inner));
    if (exBase) {
      ({ pos: a, named } = streamerExToBase(exBase, a, named));
      fn = exBase;
    }
    const variable = m[1] ? varKey(m[1]) : null;
    // Chained assignments (Gate_X_Obj[0] = Fs_DynObj[3] = CreateDynamicObject(...)): every name points to the item
    const aliases = [];
    if (variable) {
      let pre = masked.slice(masked.lastIndexOf('\n', stmtStart) + 1, stmtStart), am;
      while ((am = /([A-Za-z_@][\w@]*(?:\s*\[[^\]=;]*\])*)\s*=\s*$/.exec(pre))) { aliases.push(varKey(am[1])); pre = pre.slice(0, am.index); }
    }
    const setVar = (item) => { if (variable) vars.set(variable, item); for (const al of aliases) vars.set(al, item); };
    // PlayerTextDraw* (with playerid first) set the same things as TextDraw*
    if (/^PlayerTextDraw(Font|Color|BoxColor|BackgroundColor|LetterSize|TextSize|SetOutline|SetShadow|Alignment|SetSelectable|SetProportional|SetPreviewModel|SetPreviewRot|SetPreviewVehCol|UseBox)$/.test(fn)) {
      fn = fn.replace('PlayerTextDraw', 'TextDraw');
      a = a.slice(1);
    }

    let nextNl = source.indexOf('\n', stmtEnd);
    if (nextNl < 0) nextNl = source.length;
    const lineRest = source.slice(stmtEnd, nextNl);
    let inlineComment = '';
    const idxLineCmt = lineRest.indexOf('//');
    const idxBlockCmt = lineRest.indexOf('/*');
    if (idxLineCmt >= 0) {
      inlineComment = lineRest.slice(idxLineCmt + 2).replace(/\r$/, '').trim();
    } else if (idxBlockCmt >= 0) {
      const endBlock = lineRest.indexOf('*/', idxBlockCmt + 2);
      inlineComment = (endBlock >= 0 ? lineRest.slice(idxBlockCmt + 2, endBlock) : lineRest.slice(idxBlockCmt + 2)).replace(/\r$/, '').trim();
    }

    const isChild = childFns.has(fn);
    let preComment = '', blankLinesBefore = 0;
    if (!isChild) {
      const between = source.slice(lastTopStmtEnd, stmtStart);
      if (!firstItemSeen) {
        firstItemSeen = true;
        const res = splitHeaderAndFirstItem(between, /^[ \t]*#define\s+FILTERSCRIPT\b/m.test(masked) && /\bstock\s+Fs_PlayerLoad\s*\(/.test(masked));
        preservedHeader = res.header;
        preComment = res.preComment;
        blankLinesBefore = res.blankLines;
      } else {
        const res = extractPreceding(between);
        preComment = res.preComment;
        blankLinesBefore = res.blankLinesBefore;
      }
    }
    lastTopStmtEnd = (nextNl < source.length ? nextNl + 1 : source.length);

    if (fn === 'CreateObject' || fn === 'CreateDynamicObject' || fn === 'CreatePlayerObject') {
      const o = fn === 'CreatePlayerObject' ? 1 : 0;
      if (a.length < 7 + o) continue;
      // A model that is not a number (e.g. the array loop, MapObjects[i][0]) is not a map object
      if (!Number.isFinite(Number(String(a[o]).trim()))) continue;
      const raw = {
        x: a[o + 1], y: a[o + 2], z: a[o + 3],
        rx: a[o + 4], ry: a[o + 5], rz: a[o + 6],
        drawDist: fn === 'CreateDynamicObject' ? a[11] : a[7 + o],
        streamDist: fn === 'CreateDynamicObject' ? a[10] : undefined,
      };
      const obj = {
        model: int(a[o]), x: num(a[o + 1]), y: num(a[o + 2]), z: num(a[o + 3]),
        rx: num(a[o + 4]), ry: num(a[o + 5]), rz: num(a[o + 6]),
        world: -1, interior: -1, streamDist: 0, drawDist: 0, materials: [],
        comment: inlineComment, preComment, blankLinesBefore,
        raw,
      };
      if (fn === 'CreateDynamicObject') {
        if (a[7] !== undefined) obj.world = int(a[7], -1);
        if (a[8] !== undefined) obj.interior = int(a[8], -1);
        if (a[10] !== undefined) obj.streamDist = num(a[10], 0);
        if (a[11] !== undefined) obj.drawDist = num(a[11], 0);
        if (named.worldid !== undefined || named.world !== undefined) obj.world = int(named.worldid ?? named.world, -1);
        if (named.interiorid !== undefined || named.interior !== undefined) obj.interior = int(named.interiorid ?? named.interior, -1);
        if (named.streamdistance !== undefined || named.streamdist !== undefined) obj.streamDist = num(named.streamdistance ?? named.streamdist, 0);
        if (named.drawdistance !== undefined || named.drawdist !== undefined) obj.drawDist = num(named.drawdistance ?? named.drawdist, 0);
      } else if (a[7 + o] !== undefined) obj.drawDist = num(a[7 + o], 0);
      if (obj.streamDist < 0) obj.streamDist = 0;
      if (obj.drawDist < 0) obj.drawDist = 0;
      if (interior !== null && obj.interior === -1 && interior > 0) obj.interior = interior;
      objects.push(obj);
      last = obj;
      setVar(obj);
    } else if (fn === 'RemoveBuildingForPlayer' || fn === 'RemoveBuilding') {
      const o = fn === 'RemoveBuildingForPlayer' || a.length >= 6 ? 1 : 0;
      if (a.length < 5 + o) continue;
      const raw = {
        x: a[o + 1], y: a[o + 2], z: a[o + 3],
        radius: a[o + 4],
      };
      const rem = {
        model: int(a[o]), x: num(a[o + 1]), y: num(a[o + 2]), z: num(a[o + 3]),
        radius: num(a[o + 4], 0.25),
        comment: inlineComment, preComment, blankLinesBefore,
        raw,
      };
      removed.push(rem);
    } else if (fn === 'CreateVehicle' || fn === 'AddStaticVehicle' || fn === 'AddStaticVehicleEx') {
      if (a.length < 5) continue;
      const raw = {
        x: a[1], y: a[2], z: a[3], rz: a[4],
      };
      const veh = {
        model: int(a[0]), x: num(a[1]), y: num(a[2]), z: num(a[3]), rz: num(a[4]),
        color1: int(a[5], -1), color2: int(a[6], -1),
        respawn: fn === 'AddStaticVehicle' ? -1 : int(a[7], -1),
        paintjob: -1, components: [],
        comment: inlineComment, preComment, blankLinesBefore,
        raw,
      };
      vehicles.push(veh);
      lastVeh = veh;
      setVar(veh);
    } else if (fn === 'ChangeVehicleColor') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastVeh;
      if (target && a.length >= 3) { target.color1 = int(a[1], -1); target.color2 = int(a[2], -1); }
    } else if (fn === 'ChangeVehiclePaintjob') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastVeh;
      if (target && a.length >= 2) target.paintjob = int(a[1], -1);
    } else if (fn === 'AddVehicleComponent') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastVeh;
      if (target && a.length >= 2) {
        if (!target.components) target.components = [];
        const cid = int(a[1]);
        if (!target.components.includes(cid)) target.components.push(cid);
      }
    } else if (fn === 'MoveDynamicObject' || fn === 'MoveObject') {
      if (a[0] && a[0].includes('[') && !vars.has(varKey(a[0]))) continue; // e.g. the gate functions: not a map object
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || last;
      if (target && a.length >= 5) {
        target.move = {
          targetX: num(a[1]),
          targetY: num(a[2]),
          targetZ: num(a[3]),
          speed: Math.max(0.01, num(a[4], 3.0)),
          targetRx: a[5] !== undefined ? num(a[5]) : -1000,
          targetRy: a[6] !== undefined ? num(a[6]) : -1000,
          targetRz: a[7] !== undefined ? num(a[7]) : -1000,
          comment: inlineComment,
        };
      }
    } else if (fn === 'AttachDynamicObjectToObject' || fn === 'AttachObjectToObject') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || last;
      if (target && a.length >= 5) {
        const parentObj = a[1] ? vars.get(varKey(a[1])) : null;
        if (parentObj && !parentObj.uid) parentObj.uid = 'obj_p_' + Math.random().toString(36).slice(2, 9);
        target.attach = {
          to: parentObj ? parentObj.uid : (a[1] ? String(a[1]).trim() : ''),
          type: 'object',
          ox: num(a[2]),
          oy: num(a[3]),
          oz: num(a[4]),
          rx: a[5] !== undefined ? num(a[5]) : 0,
          ry: a[6] !== undefined ? num(a[6]) : 0,
          rz: a[7] !== undefined ? num(a[7]) : 0,
          syncRot: a[8] !== undefined ? int(a[8]) : 1,
          comment: inlineComment,
        };
      }
    } else if (fn === 'AttachDynamicObjectToVehicle' || fn === 'AttachObjectToVehicle') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || last;
      const parentVeh = (a[1] ? vars.get(varKey(a[1])) : null) || lastVeh;
      if (target && a.length >= 5) {
        if (parentVeh && !parentVeh.uid) parentVeh.uid = 'veh_p_' + Math.random().toString(36).slice(2, 9);
        const vehTargetId = parentVeh ? parentVeh.uid : (a[1] ? String(a[1]).trim() : '');
        const existingCount = parentVeh ? objects.filter(o => o.attach && o.attach.to === parentVeh.uid).length : 0;
        if (existingCount < 25) {
          target.attach = {
            to: vehTargetId,
            type: 'vehicle',
            ox: num(a[2]),
            oy: num(a[3]),
            oz: num(a[4]),
            rx: a[5] !== undefined ? num(a[5]) : 0,
            ry: a[6] !== undefined ? num(a[6]) : 0,
            rz: a[7] !== undefined ? num(a[7]) : 0,
            syncRot: 1,
            comment: inlineComment,
          };
        }
      }
    } else if (fn === 'CreateActor') {
      if (a.length >= 5) {
        const actor = {
          skin: int(a[0]),
          x: num(a[1]),
          y: num(a[2]),
          z: num(a[3]),
          rz: num(a[4]),
          world: -1,
          invulnerable: true,
          health: 100,
          comment: inlineComment,
          preComment,
          blankLinesBefore,
          raw: { x: a[1], y: a[2], z: a[3], rz: a[4] },
        };
        actors.push(actor);
        lastActor = actor;
        setVar(actor);
      }
    } else if (fn === 'ApplyActorAnimation') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastActor;
      if (target && a.length >= 3) {
        target.anim = {
          lib: unquote(a[1]),
          name: unquote(a[2]),
          delta: a[3] !== undefined ? num(a[3], 4.1) : 4.1,
          loop: a[4] !== undefined ? int(a[4], 1) : 1,
          lockx: a[5] !== undefined ? int(a[5], 0) : 0,
          locky: a[6] !== undefined ? int(a[6], 0) : 0,
          freeze: a[7] !== undefined ? int(a[7], 0) : 0,
          time: a[8] !== undefined ? int(a[8], 0) : 0,
        };
      }
    } else if (fn === 'SetActorVirtualWorld') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastActor;
      if (target && a[1] !== undefined) target.world = int(a[1]);
    } else if (fn === 'SetActorInvulnerable') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastActor;
      if (target && a[1] !== undefined) target.invulnerable = int(a[1]) !== 0;
    } else if (fn === 'SetActorHealth') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastActor;
      if (target && a[1] !== undefined) target.health = num(a[1], 100);
    } else if (fn === 'SetActorFacingAngle') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastActor;
      if (target && a[1] !== undefined) target.rz = num(a[1]);
    } else if (fn === 'SetActorPos') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || lastActor;
      if (target && a.length >= 4) { target.x = num(a[1]); target.y = num(a[2]); target.z = num(a[3]); }
    } else if (fn === 'SetObjectMaterial' || fn === 'SetDynamicObjectMaterial' || fn === 'SetPlayerObjectMaterial') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || last;
      if (target && a.length >= 5) {
        const mat = normalizeMaterial({
          index: int(a[1]), model: int(a[2]), txd: unquote(a[3]), texture: unquote(a[4]),
          color: a[5] !== undefined ? parseColor(a[5]) : 0,
        });
        if (mat) {
          if (inlineComment) mat.comment = inlineComment;
          target.materials.push(mat);
        }
      }
    } else if (fn === 'SetObjectMaterialText' || fn === 'SetDynamicObjectMaterialText' || fn === 'SetPlayerObjectMaterialText') {
      const target = (a[0] ? vars.get(varKey(a[0])) : null) || last;
      if (target && a.length >= 3) {
        let textArg, indexArg;
        if (String(a[1]).trim().startsWith('"') || (isNaN(Number(a[1])) && !isNaN(Number(a[2])))) {
          textArg = a[1]; indexArg = a[2];
        } else {
          indexArg = a[1]; textArg = a[2];
        }
        const mat = normalizeMaterial({
          index: int(indexArg), text: decodePawnString(textArg),
          size: a[3] !== undefined ? toInt(a[3], 90) : 90,
          font: a[4] ? unquote(a[4]) : 'Arial',
          fontSize: a[5] !== undefined ? toInt(a[5], 24) : 24,
          bold: a[6] !== undefined ? (toInt(a[6], 1) ? 1 : 0) : 1,
          fontColor: a[7] !== undefined ? parseColor(a[7]) : 0xFFFFFFFF,
          backColor: a[8] !== undefined ? parseColor(a[8]) : 0,
          align: a[9] !== undefined ? toInt(a[9], 0) : 0,
        });
        if (mat) {
          if (inlineComment) mat.comment = inlineComment;
          target.materials.push(mat);
        }
      }
    } else if (fn === 'SetPlayerCameraPos') {
      const o = (a.length >= 4 && isNaN(Number(a[0]))) ? 1 : (a.length >= 4 ? 1 : 0);
      if (a.length >= 3 + o) {
        pendingShot = {
          pos: { x: num(a[o]), y: num(a[o + 1]), z: num(a[o + 2]) },
          look: { x: 0, y: 0, z: 0 },
          cut: 'cut',
          name: `Câmera ${shots.length + 1}`
        };
      }
    } else if (fn === 'SetPlayerCameraLookAt') {
      if (pendingShot) {
        const o = (a.length >= 4 && isNaN(Number(a[0]))) ? 1 : (a.length >= 4 ? 1 : 0);
        if (a.length >= 3 + o) {
          pendingShot.look = { x: num(a[o]), y: num(a[o + 1]), z: num(a[o + 2]) };
          const cutArg = a[o + 3];
          pendingShot.cut = cutArg === 'CAMERA_MOVE' || int(cutArg) === 1 ? 'move' : 'cut';
          shots.push(pendingShot);
          pendingShot = null;
        }
      }
    } else if (fn === 'InterpolateCameraPos') {
      const o = (a.length >= 8 && isNaN(Number(a[0]))) ? 1 : (a.length >= 8 ? 1 : 0);
      if (a.length >= 7 + o) {
        pendingMove = {
          fromPos: { x: num(a[o]), y: num(a[o + 1]), z: num(a[o + 2]) },
          toPos: { x: num(a[o + 3]), y: num(a[o + 4]), z: num(a[o + 5]) },
          time: Math.max(0, int(a[o + 6])),
          cut: a[o + 7] === 'CAMERA_MOVE' || int(a[o + 7]) === 1 ? 'move' : 'cut',
        };
      }
    } else if (fn === 'InterpolateCameraLookAt') {
      if (pendingMove) {
        const o = (a.length >= 7 && isNaN(Number(a[0]))) ? 1 : (a.length >= 7 ? 1 : 0);
        if (a.length >= 6 + o) {
          const fromLook = { x: num(a[o]), y: num(a[o + 1]), z: num(a[o + 2]) };
          const toLook = { x: num(a[o + 3]), y: num(a[o + 4]), z: num(a[o + 5]) };
          const time = Math.max(0, int(a[o + 6] !== undefined ? a[o + 6] : pendingMove.time));
          const cut = (a[o + 7] !== undefined ? (a[o + 7] === 'CAMERA_MOVE' || int(a[o + 7]) === 1 ? 'move' : 'cut') : pendingMove.cut);
          paths.push({
            name: `Movimento ${paths.length + 1}`,
            end: 'behind',
            keys: [
              { pos: pendingMove.fromPos, look: fromLook, time: 0, hold: 0, cut: 'cut' },
              { pos: pendingMove.toPos, look: toLook, time: time || 5000, hold: 0, cut: cut }
            ]
          });
          pendingMove = null;
        }
      }
    } else if (fn === 'Create3DTextLabel' || fn === 'CreateDynamic3DTextLabel') {
      if (a.length >= 6) {
        const text = decodePawnString(a[0]);
        const color = parseColor(a[1]);
        const x = num(a[2]), y = num(a[3]), z = num(a[4]);
        const drawDist = num(a[5], 50);
        const world = fn === 'CreateDynamic3DTextLabel' ? int(a[9], -1) : int(a[6], 0);
        const interior = fn === 'CreateDynamic3DTextLabel' ? int(a[10], -1) : -1;
        const testLOS = fn === 'CreateDynamic3DTextLabel' ? (int(a[8], 0) ? 1 : 0) : (int(a[7], 0) ? 1 : 0);
        const lbl = {
          text, color, x, y, z, drawDist, world, interior, testLOS,
          comment: inlineComment, preComment, blankLinesBefore,
        };
        labels.push(lbl);
        setVar(lbl);
      }
    } else if (fn === 'CreatePickup' || fn === 'CreateDynamicPickup') {
      if (a.length >= 5) {
        const model = int(a[0]), type = int(a[1], 1);
        const x = num(a[2]), y = num(a[3]), z = num(a[4]);
        const world = a[5] !== undefined ? int(a[5], -1) : -1;
        const interior = fn === 'CreateDynamicPickup' && a[6] !== undefined ? int(a[6], -1) : -1;
        const pk = {
          model, type, x, y, z, world, interior,
          comment: inlineComment, preComment, blankLinesBefore,
        };
        pickups.push(pk);
        setVar(pk);
      }
    } else if (fn === 'GangZoneCreate') {
      if (a.length >= 4) {
        const rawName = inlineComment ? inlineComment.replace(/^\/\/\s*/, '').trim() : '';
        const gzName = rawName || `Zona ${gangZones.length + 1}`;
        const gz = {
          name: gzName,
          minx: num(a[0]), miny: num(a[1]), maxx: num(a[2]), maxy: num(a[3]),
          color: 0xFF000080,
          comment: gzName, preComment, blankLinesBefore,
        };
        gangZones.push(gz);
        setVar(gz);
      }
    } else if (fn === 'GangZoneShowForPlayer' || fn === 'GangZoneShowForAll') {
      const zoneArg = fn === 'GangZoneShowForPlayer' ? a[1] : a[0];
      const colorArg = fn === 'GangZoneShowForPlayer' ? a[2] : a[1];
      const target = (zoneArg ? vars.get(varKey(zoneArg)) : null) || gangZones[gangZones.length - 1];
      if (target && colorArg !== undefined) {
        target.color = parseColor(colorArg);
      }
    } else if (fn === 'SetPlayerCheckpoint' || fn === 'CreateDynamicCP') {
      const o = fn === 'SetPlayerCheckpoint' ? 1 : 0;
      if (a.length >= 4 + o) {
        const cp = {
          cpKind: 'normal',
          type: 0,
          x: num(a[o]), y: num(a[o + 1]), z: num(a[o + 2]),
          size: num(a[o + 3], 3.0),
          nextx: num(a[o]), nexty: num(a[o + 1]) + 10, nextz: num(a[o + 2]),
          ...(fn === 'CreateDynamicCP' ? { world: int(a[4], -1), interior: int(a[5], -1) } : {}),
          comment: inlineComment, preComment, blankLinesBefore,
        };
        checkpoints.push(cp);
        setVar(cp);
      }
    } else if (fn === 'SetPlayerRaceCheckpoint' || fn === 'CreateDynamicRaceCP') {
      const o = fn === 'SetPlayerRaceCheckpoint' ? 1 : 0;
      if (a.length >= 8 + o) {
        const cp = {
          cpKind: 'race',
          type: Math.max(0, Math.min(4, int(a[o], 0))),
          x: num(a[o + 1]), y: num(a[o + 2]), z: num(a[o + 3]),
          nextx: num(a[o + 4]), nexty: num(a[o + 5]), nextz: num(a[o + 6]),
          size: num(a[o + 7], 4.0),
          ...(fn === 'CreateDynamicRaceCP' ? { world: int(a[8], -1), interior: int(a[9], -1) } : {}),
          comment: inlineComment, preComment, blankLinesBefore,
        };
        checkpoints.push(cp);
        setVar(cp);
      }
    } else if (fn === 'SetPlayerMapIcon' || fn === 'CreateDynamicMapIcon') {
      if (fn === 'SetPlayerMapIcon' && a.length >= 6) {
        const mi = {
          iconid: int(a[1], mapIcons.length),
          x: num(a[2]), y: num(a[3]), z: num(a[4]),
          type: Math.max(0, Math.min(63, int(a[5], 0))),
          color: a[6] !== undefined ? parseColor(a[6]) : 0xFF0000FF,
          style: a[7] !== undefined ? Math.max(0, Math.min(3, int(a[7], 0))) : 0,
          comment: inlineComment, preComment, blankLinesBefore,
        };
        mapIcons.push(mi);
        setVar(mi);
      } else if (fn === 'CreateDynamicMapIcon' && a.length >= 5) {
        const mi = {
          iconid: mapIcons.length,
          x: num(a[0]), y: num(a[1]), z: num(a[2]),
          type: Math.max(0, Math.min(63, int(a[3], 0))),
          color: a[4] !== undefined ? parseColor(a[4]) : 0xFF0000FF,
          style: a[9] !== undefined ? Math.max(0, Math.min(3, int(a[9], 0))) : 0,
          comment: inlineComment, preComment, blankLinesBefore,
        };
        mapIcons.push(mi);
        setVar(mi);
      }
    } else if (fn === 'TextDrawCreate' || fn === 'CreatePlayerTextDraw') {
      const o = fn === 'CreatePlayerTextDraw' ? 1 : 0;
      if (a.length >= 3 + o) {
        let rawTdText = decodePawnString(a[o + 2]);
        if (rawTdText.toLowerCase().startsWith('loadscs:')) {
          const tex = rawTdText.slice(8).toLowerCase();
          rawTdText = 'LOADSUK:' + (tex === 'loadsc0' ? 'loadscuk' : tex);
        }
        const td = {
          tdv: 2,
          isPlayer: Boolean(o),
          x: num(a[o]), y: num(a[o + 1]),
          text: rawTdText,
          font: 1,
          letterSizeX: 0.48, letterSizeY: 1.12,
          textSizeX: 1280, textSizeY: 1280,
          color: 0xE1E1E1FF,
          boxColor: 0x00000080,
          backgroundColor: 0x000000FF,
          shadow: 1,
          outline: 0,
          alignment: 1,
          useBox: 0,
          proportional: 1,
          selectable: 0,
          previewModel: 0,
          previewRotX: 0, previewRotY: 0, previewRotZ: 0, previewZoom: 1,
          previewColor1: -1, previewColor2: -1,
          comment: inlineComment, preComment, blankLinesBefore,
        };
        textDraws.push(td);
        setVar(td);
      }
    } else if (fn === 'CreatePlayerProgressBar') {
      // ProgressBar.inc: CreatePlayerProgressBar(playerid, x, y, width, height, colour, max, direction, border, bordercolour, style, segments, segmentscale),
      // also with named arguments (.colour = ...) and expressions (the leading number is used)
      if (a.length >= 3) {
        const arg = (i, ...names) => { for (const n of names) if (named[n] !== undefined) return named[n]; return a[i]; };
        const dirArg = String(arg(7, 'direction') ?? '0').trim();
        const dirIdx = PB_DIRECTIONS.indexOf(dirArg.toUpperCase());
        const colArg = arg(5, 'colour', 'color');
        const [iBorder, iBorderCol, iStyle, iSeg] = [8, 9, 10, 11];
        const nameFromVar = (v) => {
          if (!v) return '';
          const idx = [...v.matchAll(/\[\s*([A-Za-z_@][\w@]*)\s*\]/g)].map(m => m[1]).filter(s => !/^(playerid|i|j|id|pid)$/i.test(s));
          return idx.length ? idx[idx.length - 1] : v.replace(/\[.*$/, '').trim();
        };
        const td = {
          tdv: 2, type: 'progress', isPlayer: true, text: 'Barra de progresso',
          name: String(inlineComment || '').replace(/^\/\/\s*/, '').trim() || (/^(progress_?\d+|Map_\w+_PB\d+)$/i.test(nameFromVar(variable)) ? '' : nameFromVar(variable)),
          x: num(a[1]), y: num(a[2]),
          pbWidth: num(arg(3, 'width'), 60), pbHeight: num(arg(4, 'height'), 8),
          color: colArg !== undefined && /^-?(0x[0-9a-f]+|\d+)$/i.test(String(colArg).trim()) ? parseColor(colArg) : 0xE74C3CFF,
          pbMax: num(arg(6, 'max'), 100) || 100, pbValue: 0,
          pbDir: dirIdx >= 0 ? dirIdx : Math.max(0, Math.min(3, int(dirArg, 0))),
          pbBorder: /PB_BORDER_NONE/i.test(String(arg(iBorder, 'border') ?? '')) ? 0 : num(arg(iBorder, 'border'), PB_LIMITS.borderDefault),
          pbBorderColor: colorArgOrZero(arg(iBorderCol, 'bordercolour', 'bordercolor')),
          pbStyle: (() => { const st = String(arg(iStyle, 'style') ?? '0').trim().toUpperCase(); const i = PB_STYLE_NAMES.indexOf(st); return i >= 0 ? i : clampPbStyle(int(st, 0)); })(),
          pbSegments: clampPbSegments(int(arg(iSeg, 'segments'), 24)),
          pbSegmentScale: clampPbSegmentScale(num(arg(iSeg + 1, 'segmentscale'), 1)),
          comment: inlineComment, preComment, blankLinesBefore,
        };
        textDraws.push(td);
        setVar(td);
      }
    } else if (fn === 'SetPlayerProgressBarValue') {
      const target = vars.get(varKey(a[1]));
      if (target && target.type === 'progress' && a[2] !== undefined) target.pbValue = num(a[2], 0);
    } else if (fn === 'AutoFillPlayerProgressBar') {
      // AutoFillPlayerProgressBar(playerid, bar, value up to which it fills = bar maximum)
      const target = vars.get(varKey(a[1]));
      if (target && target.type === 'progress') {
        const mv = named.maxvalue ?? a[2];
        const n = num(mv, -1);
        target.pbAutoFill = true;
        target.pbAutoFillMax = clampPbAutoFillMax(n < 0 ? target.pbMax : n, target.pbMax);
      }
    } else if (fn === 'BlinkPlayerProgressBar') {
      // BlinkPlayerProgressBar(playerid, bar, interval, duration, color = 0, border color = 0)
      const target = vars.get(varKey(a[1]));
      if (target && target.type === 'progress') {
        const arg = (i, ...names) => { for (const n of names) if (named[n] !== undefined) return named[n]; return a[i]; };
        const col = arg(4, 'colour', 'color');
        target.pbBlink = true;
        target.pbBlinkInterval = clampPbBlinkInterval(num(arg(2, 'interval'), PB_LIMITS.blinkDefault));
        target.pbBlinkDuration = clampPbBlinkDuration(num(arg(3, 'duration'), 0));
        target.pbBlinkColor = colorArgOrZero(col);
        target.pbBlinkBorderColor = colorArgOrZero(arg(5, 'bordercolour', 'bordercolor'));
      }
    } else if (fn === 'SetPlayerProgressBarMinValue' || fn === 'SetPlayerProgressBarRange') {
      // Lower limit of the bar (and the maximum, in SetPlayerProgressBarRange)
      const target = vars.get(varKey(a[1]));
      if (target && target.type === 'progress') {
        target.pbMin = num(named.min ?? a[2], 0);
        if (fn === 'SetPlayerProgressBarRange' && (named.max ?? a[3]) !== undefined) target.pbMax = num(named.max ?? a[3], target.pbMax);
      }
    } else if (fn === 'SetPlayerProgressBarGradient') {
      // SetPlayerProgressBarGradient(playerid, bar, enable, empty colour, full colour, middle colour, inverted)
      const target = vars.get(varKey(a[1]));
      if (target && target.type === 'progress') {
        const arg = (i, ...names) => { for (const n of names) if (named[n] !== undefined) return named[n]; return a[i]; };
        const on = String(arg(2, 'enable') ?? 'true').trim();
        target.pbGradient = /^(true|1)$/i.test(on);
        const c = (i, name, def) => { const v = arg(i, name); return v === undefined ? def : colorArgOrZero(v); };
        target.pbGradEmpty = c(3, 'colour_empty', 0xE74C3CFF);
        target.pbGradFull = c(4, 'colour_full', 0x2ECC71FF);
        target.pbGradMid = c(5, 'colour_mid', 0xF1C40FFF);
        target.pbGradInverted = /^(true|1|PB_GRAD_INVERTED)$/i.test(String(arg(6, 'inverted') ?? '').trim());
      }
    } else if (fn === 'SetPlayerProgressBarLabel') {
      // SetPlayerProgressBarLabel(playerid, bar, enable, template, colour, alignment, font, scaleX, scaleY, offsetX, offsetY, followColour, orientation)
      const target = vars.get(varKey(a[1]));
      if (target && target.type === 'progress') {
        const arg = (i, ...names) => { for (const n of names) if (named[n] !== undefined) return named[n]; return a[i]; };
        target.pbLabel = /^(true|1)$/i.test(String(arg(2, 'enable') ?? 'true').trim());
        if (arg(3, 'template') !== undefined) target.pbLabelText = decodePawnString(arg(3, 'template'));
        const col = arg(4, 'colour', 'color');
        if (col !== undefined) { const c = colorArgOrZero(col); if (c) target.pbLabelColor = c; else target.pbLabelFollow = true; }
        target.pbLabelAlign = int(arg(5, 'alignment'), 2);
        target.pbLabelFont = int(arg(6, 'font'), 1);
        target.pbLabelScaleX = num(arg(7, 'scalex'), 0);
        target.pbLabelScaleY = num(arg(8, 'scaley'), 0);
        target.pbLabelOffX = num(arg(9, 'offsetx'), 0);
        target.pbLabelOffY = num(arg(10, 'offsety'), 0);
        if (/^(true|1)$/i.test(String(arg(11, 'followcolour', 'followcolor') ?? '').trim())) target.pbLabelFollow = true;
        const o = String(arg(12, 'orientation') ?? '0').trim().toUpperCase();
        const oi = PB_LABEL_ORIENTS.indexOf(o);
        target.pbLabelOrient = oi >= 0 ? oi : o === 'PB_LABEL_ORIENT_HORIZ' ? 1 : o === 'PB_LABEL_ORIENT_VERT' ? 2 : int(o, 0);
      }
    } else if (fn === 'InterpolatePlayerProgressBarValue') {
      // InterpolatePlayerProgressBarValue(playerid, bar, value, ms): the value set before is where it starts
      const target = vars.get(varKey(a[1]));
      if (target && target.type === 'progress' && (named.target_value ?? a[2]) !== undefined) {
        target.pbLerp = true;
        target.pbLerpFrom = target.pbValue;
        target.pbValue = num(named.target_value ?? a[2], 0);
        target.pbLerpMs = int(named.duration_ms ?? a[3], 500);
      }
    } else if (TDFX_FUNCTIONS.includes(fn)) {
      // TextDrawFX effect
      const call = tdfxFromCall(fn, a, named, { num, int, unquote, color: (v) => colorArgOrZero(v) });
      const target = call && vars.get(varKey(call.varArg));
      if (target && target.type !== 'progress') {
        if (call.player) target.isPlayer = true;
        // The other TextDraw (bottom bar of the letterbox) may be created after the call: it is found at the end
        if (call.refArg !== null) fxRefs.push({ fx: call.data, ref: varKey(call.refArg) });
        target.fx = call.data;
      }
    } else if (fn === 'TextDrawFont') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.font = int(a[1], 1);
    } else if (fn === 'TextDrawColor') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.color = parseColor(a[1]);
    } else if (fn === 'TextDrawBoxColor') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.boxColor = parseColor(a[1]);
    } else if (fn === 'TextDrawBackgroundColor') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.backgroundColor = parseColor(a[1]);
    } else if (fn === 'TextDrawLetterSize') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a.length >= 3) { target.letterSizeX = num(a[1], 0.48); target.letterSizeY = num(a[2], 1.12); }
    } else if (fn === 'TextDrawTextSize') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a.length >= 3) { target.textSizeX = num(a[1], 1280); target.textSizeY = num(a[2], 1280); }
    } else if (fn === 'TextDrawSetOutline') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.outline = int(a[1], 0);
    } else if (fn === 'TextDrawSetShadow') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.shadow = int(a[1], 0);
    } else if (fn === 'TextDrawAlignment') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.alignment = int(a[1], 1);
    } else if (fn === 'TextDrawUseBox') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.useBox = int(a[1], 0);
    } else if (fn === 'TextDrawSetSelectable') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.selectable = int(a[1], 0);
    } else if (fn === 'TextDrawSetProportional') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.proportional = int(a[1], 1);
    } else if (fn === 'TextDrawSetPreviewModel') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a[1] !== undefined) target.previewModel = int(a[1], 0);
    } else if (fn === 'TextDrawSetPreviewRot') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a.length >= 5) {
        target.previewRotX = num(a[1]); target.previewRotY = num(a[2]); target.previewRotZ = num(a[3]); target.previewZoom = num(a[4], 1);
      }
    } else if (fn === 'TextDrawSetPreviewVehCol') {
      const target = vars.get(varKey(a[0])) || textDraws[textDraws.length - 1];
      if (target && a.length >= 3) {
        target.previewColor1 = int(a[1], -1); target.previewColor2 = int(a[2], -1);
      }
    } else if (fn === 'SetPlayerPos') {
      if (a.length >= 3) spawn = { x: num(a[0]), y: num(a[1]), z: num(a[2]) };
    } else if (fn === 'SetPlayerInterior') {
      if (a.length >= 1) interior = int(a[0]);
    }
  }
  importGates(masked, vars);
  // open.mp NPCs (exported by the editor or written by hand): they come as actors with the NPC settings
  for (const t of importNpcs(masked, vehicles, vars)) actors.push({ ...t, comment: t.npc.name, preComment: '', blankLinesBefore: 0 });
  for (const { fx, ref } of fxRefs) {
    const o = vars.get(ref);
    if (o && o.type !== 'progress') { if (!o.uid) o.uid = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); fx.bottomBarTD = o.uid; }
  }
  return { objects, vehicles, actors, removed, labels, pickups, gangZones, checkpoints, mapIcons, textDraws, cameras: { shots, paths }, spawn, preservedHeader, rawPawn: source };
}

// =====================================================================  exportar Pawn
export function formatCoord(val, rawStr) {
  if (val === undefined || val === null || isNaN(val)) return '0.0';
  const num = +val || 0;
  // Rule 9: Coordinates or float values with zero after the point (180.00000, 0.00000) must end up like this: 180.0, 0.0
  if (Math.abs(num - Math.round(num)) < 1e-6) {
    const rounded = Math.round(num);
    return (rounded === 0 ? 0 : rounded) + '.0';
  }
  // Preserves exactly the imported file's representation if the value was not modified
  if (rawStr !== undefined && rawStr !== null) {
    const s = String(rawStr).trim().replace(/^Float:/i, '');
    const parsed = parseFloat(s);
    if (!isNaN(parsed) && Math.abs(parsed - num) < 1e-6) {
      return s;
    }
  }
  // If changed or new and it has decimal places, formats with up to 6 places without extra zeros
  let s = num.toFixed(6);
  s = s.replace(/(\.\d*?[1-9])0+$/, '$1');
  return s;
}

const f = (n, d = 4) => formatCoord(n);
const normAngle = (a) => ((+a || 0) % 360 + 360) % 360;


// Cyrillic letters written in Latin ones, so a name in Russian, Ukrainian or Bulgarian still gives its own Pawn name
const CYRILLIC = { \u0430: 'a', \u0431: 'b', \u0432: 'v', \u0433: 'g', \u0434: 'd', \u0435: 'e', \u0451: 'e', \u0436: 'zh', \u0437: 'z', \u0438: 'i', \u0439: 'y', \u043a: 'k', \u043b: 'l', \u043c: 'm', \u043d: 'n', \u043e: 'o', \u043f: 'p', \u0440: 'r', \u0441: 's', \u0442: 't', \u0443: 'u', \u0444: 'f', \u0445: 'h', \u0446: 'ts', \u0447: 'ch', \u0448: 'sh', \u0449: 'sht', \u044a: 'a', \u044c: '', \u044e: 'yu', \u044f: 'ya', \u0456: 'i', \u0457: 'yi', \u0454: 'ye', \u0491: 'g', \u044b: 'y', \u044d: 'e' };
export function sanitizeIdent(name) {
  const latin = [...String(name || 'Mapa')].map(ch => { const l = CYRILLIC[ch.toLowerCase()]; return l === undefined ? ch : (ch !== ch.toLowerCase() && l ? l[0].toUpperCase() + l.slice(1) : l); }).join('');
  const base = latin.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (!base && String(name || '').trim()) {
    // Other alphabets: a short code from the name, so different maps still get different names
    let h = 0;
    for (const ch of String(name)) h = (h * 31 + ch.codePointAt(0)) >>> 0;
    return 'Mapa_' + h.toString(36);
  }
  return (/^\d/.test(base) ? 'M' + base : base) || 'Mapa';
}

export const EXPORT_DEFAULTS = {
  objectFn: 'CreateDynamicObject', // or 'CreateObject'
  layout: 'module',                // 'module' (ready-made functions) or 'lines' (just the lines)
  includeRemoved: true,
  includeVehicles: true,
  includeActors: true,
  vehicleFn: 'CreateVehicle',      // or 'AddStaticVehicleEx'
  relative: false,
  includeCameras: true,
  exportArray: false,
  decimals: 5,
};

function commentSuffix(item) {
  if (!item || !item.comment) return '';
  const clean = String(item.comment).replace(/^\/\/\s*/, '').trim();
  return clean ? ` // ${clean}` : '';
}

function objectLine(o, opt, center) {
  const isRel = Boolean(opt.relative && (center.x || center.y || center.z));
  const x = o.x - center.x, y = o.y - center.y, z = o.z - center.z;
  const raw = o.raw || {};
  const fx = formatCoord(x, isRel ? null : raw.x);
  const fy = formatCoord(y, isRel ? null : raw.y);
  const fz = formatCoord(z, isRel ? null : raw.z);
  const frx = formatCoord(o.rx, isRel ? null : raw.rx);
  const fry = formatCoord(o.ry, isRel ? null : raw.ry);
  const frz = formatCoord(o.rz, isRel ? null : raw.rz);
  const base = `${o.model}, ${fx}, ${fy}, ${fz}, ${frx}, ${fry}, ${frz}`;

  if (opt.objectFn === 'CreateObject') {
    return `CreateObject(${base}${o.drawDist > 0 ? ', ' + formatCoord(o.drawDist, raw.drawDist) : ''})`;
  }

  const extra = [];
  const hasStreamOrDraw = o.streamDist > 0 || o.drawDist > 0;
  const hasWorldOrInt = (o.world ?? -1) !== -1 || (o.interior ?? -1) !== -1;
  if (hasStreamOrDraw || hasWorldOrInt) {
    extra.push(o.world ?? -1, o.interior ?? -1);
    if (hasStreamOrDraw) {
      const dd = o.drawDist > 0 ? o.drawDist : 0;
      const sd = o.streamDist > 0 ? o.streamDist : dd;
      const rawSd = raw.streamDist || (raw.drawDist && !o.streamDist ? raw.drawDist : null);
      const rawDd = raw.drawDist || null;
      extra.push(-1, formatCoord(sd, rawSd), formatCoord(dd, rawDd));
    }
  }
  return `CreateDynamicObject(${base}${extra.length ? ', ' + extra.join(', ') : ''})`;
}

function materialLines(o, opt, varName) {
  const fn = opt.objectFn === 'CreateObject' ? 'SetObjectMaterial' : 'SetDynamicObjectMaterial';
  return o.materials.map(m => {
    const call = materialCall(m, varName, fn);
    return m.comment ? `${call} // ${m.comment}` : call;
  });
}

function vehicleLine(v, opt, center) {
  const isRel = Boolean(opt.relative && (center.x || center.y || center.z));
  const x = v.x - center.x, y = v.y - center.y, z = v.z - center.z;
  const raw = v.raw || {};
  const respawn = v.respawn > 0 ? v.respawn : (opt.vehicleFn === 'CreateVehicle' ? -1 : 300);
  return `${opt.vehicleFn}(${v.model}, ${formatCoord(x, isRel ? null : raw.x)}, ${formatCoord(y, isRel ? null : raw.y)}, ${formatCoord(z, isRel ? null : raw.z)}, ${formatCoord(v.rz, isRel ? null : raw.rz)}, ${v.color1 ?? -1}, ${v.color2 ?? -1}, ${respawn});`;
}

export function projectCenter(project) {
  const all = [
    ...(project.objects || []),
    ...(project.vehicles || []),
    ...(project.actors || []),
    ...(project.labels || []),
    ...(project.pickups || []),
    ...(project.checkpoints || []),
    ...(project.mapIcons || []),
  ];
  if (!all.length) return { x: 0, y: 0, z: 0 };
  let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (const o of all) {
    if (typeof o.x === 'number' && typeof o.y === 'number' && typeof o.z === 'number') {
      minX = Math.min(minX, o.x); maxX = Math.max(maxX, o.x);
      minY = Math.min(minY, o.y); maxY = Math.max(maxY, o.y);
      minZ = Math.min(minZ, o.z); maxZ = Math.max(maxZ, o.z);
    }
  }
  if (!isFinite(minX)) return { x: 0, y: 0, z: 0 };
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2, z: (minZ + maxZ) / 2 };
}

export function exportPawn(project, options = {}) {
  const opt = { ...EXPORT_DEFAULTS, ...options };
  // The filterscript keeps the ids of what it creates: real positions, one call per item, vehicles that can be destroyed
  if (opt.layout === 'filterscript') Object.assign(opt, { relative: false, exportArray: false, vehicleFn: 'CreateVehicle' });
  const d = opt.decimals;
  const dyn = opt.objectFn !== 'CreateObject';
  const center = opt.relative ? projectCenter(project) : { x: 0, y: 0, z: 0 };
  const objs = project.objects;
  const vehs = opt.includeVehicles ? project.vehicles : [];
  const actors = (opt.includeActors ? project.actors : []) || [];
  const rems = opt.includeRemoved ? project.removed : [];
  const lines = [];
  // The map in the Pawn names, so two maps fit in the same script (Pawn names: up to 31 letters)
  const id = sanitizeIdent(project.name).slice(0, 17).replace(/_+$/, '');

  const vehUidSet = new Set(vehs.map(v => v.uid).filter(Boolean));
  const objUidSet = new Set(objs.map(o => o.uid).filter(Boolean));
  const objByUid = new Map(objs.map(o => [o.uid, o]));
  // Attachments: the parent must be in this export (a vehicle left out, or a parent deleted, leaves the object loose)
  const isVehAttach = (o) => o.attach.type === 'vehicle' || vehUidSet.has(o.attach.to);
  const attachOk = (o) => !!o.attach && (isVehAttach(o) ? vehUidSet.has(o.attach.to) : objUidSet.has(o.attach.to) && o.attach.to !== o.uid);
  const parentObj = (o) => (o.attach && !isVehAttach(o) && attachOk(o) ? objByUid.get(o.attach.to) : null);
  // The object of a chain (vehicle <- object <- object...) attached right to an exported vehicle
  const chainTop = (o) => {
    const seen = new Set();
    for (let c = o; c?.attach && !seen.has(c); c = parentObj(c)) {
      seen.add(c);
      if (isVehAttach(c)) return attachOk(c) ? c : null;
    }
    return null;
  };
  // Each parent object keeps its own id (attachtoid[k]), so every child finds its own parent
  const parentIdx = new Map();
  for (const o of objs) { const p = parentObj(o); if (p && !parentIdx.has(p.uid)) parentIdx.set(p.uid, parentIdx.size); }
  const parentVar = (uid) => `attachtoid[${parentIdx.get(uid)}]`;
  // Parents are created before the objects attached to them
  const ordered = (list) => {
    const inList = new Set(list), done = new Set(), out = [];
    const visit = (o) => {
      if (done.has(o)) return;
      done.add(o);
      const p = parentObj(o);
      if (p && inList.has(p)) visit(p);
      out.push(o);
    };
    list.forEach(o => visit(o));
    return out;
  };
  // Up to 25 objects attached right to each vehicle (and what hangs on them)
  const vehTrees = new Map();
  for (const v of vehs) {
    const kept = new Set(objs.filter(o => o.attach && isVehAttach(o) && o.attach.to === v.uid).slice(0, 25));
    vehTrees.set(v.uid, ordered(objs.filter(o => kept.has(chainTop(o)))));
  }

  const moveFn = dyn ? 'MoveDynamicObject' : 'MoveObject';
  const attFn = dyn ? 'AttachDynamicObjectToObject' : 'AttachObjectToObject';
  const attVehFn = dyn ? 'AttachDynamicObjectToVehicle' : 'AttachObjectToVehicle';
  const fc = (v) => formatCoord(v, null);
  const preLines = (item, out, indent = '') => {
    if (!item.preComment) return;
    for (const pl of item.preComment.split('\n')) {
      const t = pl.trim();
      if (t && !isStudioSectionComment(t)) out.push(indent + (t.startsWith('//') || t.startsWith('/*') ? t : `// ${t}`));
    }
  };

  // Gates and doors: their objects go into the gate system's array (see gates.js)
  const gateId = id;
  const gateObjs = objs.filter(o => o.gate && !o.attach);
  const gateIdx = new Map(gateObjs.map((o, k) => [o.uid, k]));
  // open.mp NPCs: actors that are NPCs leave the actors; the vehicles they use go into Npc_<id>_Veh and the objects they surf on
  // (server objects, also with the Streamer) into Npc_<id>_Obj
  const npcActors = projectNpcs(project).filter(a => actors.includes(a));
  const npcSet = new Set(npcActors);
  const npcVehIdx = new Map(), npcObjIdx = new Map();
  const addNpcVeh = (uid) => { if (uid && vehUidSet.has(uid) && !npcVehIdx.has(uid)) npcVehIdx.set(uid, npcVehIdx.size); };
  for (const a of npcActors) {
    const n = a.npc;
    addNpcVeh(n.vehicle?.uid);
    if (n.surf?.type === 'vehicle') addNpcVeh(n.surf.uid);
    if (n.surf?.type === 'object' && objUidSet.has(n.surf.uid) && !npcObjIdx.has(n.surf.uid)) npcObjIdx.set(n.surf.uid, npcObjIdx.size);
    for (const p of n.points) for (const ac of p.acts) addNpcVeh(ac.veh);
  }
  const npcP = npcIdent(gateId);
  const npcMod = npcPawn(npcActors, { id: gateId, fmt: (v) => f(v, d), center, vehIdx: npcVehIdx, objIdx: npcObjIdx, tr });
  const emitObjectBlock = (targetArr, o) => {
    const isParent = parentIdx.has(o.uid);
    const varName = isParent ? parentVar(o.uid) : 'objectid';
    const hasExtras = (o.materials && o.materials.length) || o.move || attachOk(o) || isParent || gateIdx.has(o.uid);
    const cmt = commentSuffix(o);
    if (npcObjIdx.has(o.uid)) {
      // An object a NPC surfs on: NPC_SetSurfingObject needs a server object
      const ov = `${npcP}_Obj[${npcObjIdx.get(o.uid)}]`, so = { ...opt, objectFn: 'CreateObject' };
      targetArr.push(`${ov} = ${objectLine(o, so, center)};${cmt}`);
      if (o.materials?.length) targetArr.push(...materialLines(o, so, ov));
      if (o.move) targetArr.push(`MoveObject(${ov}, ${f(o.move.targetX - center.x, d)}, ${f(o.move.targetY - center.y, d)}, ${f(o.move.targetZ - center.z, d)}, ${f(o.move.speed, 2)}, ${f(o.move.targetRx, 2)}, ${f(o.move.targetRy, 2)}, ${f(o.move.targetRz, 2)});`);
      if (isParent) targetArr.push(`${varName} = ${ov};`);
    } else if (gateIdx.has(o.uid)) {
      const gv = gateVar(gateId, gateIdx.get(o.uid));
      targetArr.push(`${gv} = ${objectLine(o, opt, center)};${cmt}`);
      if (o.materials?.length) targetArr.push(...materialLines(o, opt, gv));
      if (isParent) targetArr.push(`${varName} = ${gv};`);
    } else if (hasExtras) {
      targetArr.push(`${varName} = ${objectLine(o, opt, center)};${cmt}`);
      if (o.materials?.length) targetArr.push(...materialLines(o, opt, varName));
      if (o.move) {
        const mx = o.move.targetX - center.x, my = o.move.targetY - center.y, mz = o.move.targetZ - center.z;
        const moveCmt = o.move.comment ? ` // ${o.move.comment}` : '';
        targetArr.push(`${moveFn}(${varName}, ${f(mx, d)}, ${f(my, d)}, ${f(mz, d)}, ${f(o.move.speed, 2)}, ${f(o.move.targetRx, 2)}, ${f(o.move.targetRy, 2)}, ${f(o.move.targetRz, 2)});${moveCmt}`);
      }
      if (attachOk(o)) {
        const attCmt = o.attach.comment ? ` // ${o.attach.comment}` : '';
        if (isVehAttach(o)) {
          targetArr.push(`${attVehFn}(${varName}, vehicleid, ${f(o.attach.ox, 4)}, ${f(o.attach.oy, 4)}, ${f(o.attach.oz, 4)}, ${f(o.attach.rx, 2)}, ${f(o.attach.ry, 2)}, ${f(o.attach.rz, 2)});${attCmt}`);
        } else {
          targetArr.push(`${attFn}(${varName}, ${parentVar(o.attach.to)}, ${f(o.attach.ox, 4)}, ${f(o.attach.oy, 4)}, ${f(o.attach.oz, 4)}, ${f(o.attach.rx, 2)}, ${f(o.attach.ry, 2)}, ${f(o.attach.rz, 2)}, ${o.attach.syncRot ?? 1});${attCmt}`);
        }
      }
    } else {
      targetArr.push(objectLine(o, opt, center) + ';' + cmt);
    }
  };

  const objLines = [];
  const looseObjs = ordered(objs.filter(o => !chainTop(o)));
  looseObjs.forEach((o, idx) => {
    if (o.blankLinesBefore > 0 && idx > 0) objLines.push('');
    preLines(o, objLines);
    emitObjectBlock(objLines, o);
  });

  const vehLines = [];
  for (let idx = 0; idx < vehs.length; idx++) {
    const v = vehs[idx];
    if (v.blankLinesBefore > 0 && idx > 0) vehLines.push('');
    preLines(v, vehLines);
    const attachedToVeh = vehTrees.get(v.uid);
    const hasMods = (v.paintjob !== undefined && v.paintjob >= 0) || (v.components && v.components.length > 0) || attachedToVeh.length > 0 || npcVehIdx.has(v.uid);
    const cmt = commentSuffix(v);
    if (hasMods) {
      vehLines.push(`vehicleid = ${vehicleLine(v, opt, center)}${cmt}`);
      if (npcVehIdx.has(v.uid)) vehLines.push(`${npcP}_Veh[${npcVehIdx.get(v.uid)}] = vehicleid;`);
      if (v.paintjob !== undefined && v.paintjob >= 0) vehLines.push(`ChangeVehiclePaintjob(vehicleid, ${v.paintjob});`);
      for (const comp of (v.components || [])) {
        const cInfo = VEHICLE_COMPONENTS[comp];
        const cComment = cInfo?.name ? `;//${cInfo.name}` : ';';
        vehLines.push(`AddVehicleComponent(vehicleid, ${comp})${cComment}`);
      }
      for (const ao of attachedToVeh) emitObjectBlock(vehLines, ao);
    } else {
      vehLines.push(vehicleLine(v, opt, center) + cmt);
    }
  }

  const isRel = Boolean(opt.relative && (center.x || center.y || center.z));
  const actorLines = [];
  for (let idx = 0; idx < actors.length; idx++) {
    const a = actors[idx];
    if (npcSet.has(a)) continue;
    if (a.blankLinesBefore > 0 && idx > 0) actorLines.push('');
    preLines(a, actorLines);
    const ax = a.x - center.x, ay = a.y - center.y, az = a.z - center.z;
    const cmt = commentSuffix(a);
    actorLines.push(`actorid = CreateActor(${a.skin}, ${formatCoord(ax, isRel ? null : a.raw?.x)}, ${formatCoord(ay, isRel ? null : a.raw?.y)}, ${formatCoord(az, isRel ? null : a.raw?.z)}, ${formatCoord(a.rz, isRel ? null : a.raw?.rz)});${cmt}`);
    if ((a.world ?? -1) !== -1) actorLines.push(`SetActorVirtualWorld(actorid, ${a.world});`);
    // An actor is born invulnerable: the vulnerable one needs the call too
    actorLines.push(`SetActorInvulnerable(actorid, ${a.invulnerable ? 1 : 0});`);
    if (a.health !== undefined && a.health !== 100) actorLines.push(`SetActorHealth(actorid, ${formatCoord(a.health)});`);
    if (a.anim) {
      actorLines.push(`ApplyActorAnimation(actorid, "${a.anim.lib}", "${a.anim.name}", ${formatCoord(a.anim.delta)}, ${a.anim.loop ?? 1}, ${a.anim.lockx ?? 0}, ${a.anim.locky ?? 0}, ${a.anim.freeze ?? 0}, ${a.anim.time ?? 0});`);
    }
  }

  const remLines = [];
  for (let idx = 0; idx < rems.length; idx++) {
    const r = rems[idx];
    if (r.blankLinesBefore > 0 && idx > 0) remLines.push('');
    preLines(r, remLines);
    remLines.push(`RemoveBuildingForPlayer(playerid, ${r.model}, ${formatCoord(r.x, r.raw?.x)}, ${formatCoord(r.y, r.raw?.y)}, ${formatCoord(r.z, r.raw?.z)}, ${formatCoord(r.radius ?? 0.25, r.raw?.radius)});${commentSuffix(r)}`);
  }

  const hex8 = (v) => '0x' + (Number(v) >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const labelLines = [];
  const labels = project.labels || [];
  for (let idx = 0; idx < labels.length; idx++) {
    const l = labels[idx];
    if (l.blankLinesBefore > 0 && idx > 0) labelLines.push('');
    preLines(l, labelLines);
    const lx = l.x - center.x, ly = l.y - center.y, lz = l.z - center.z;
    const cmt = commentSuffix(l);
    const escText = encodePawnString(l.text || '');
    if (!dyn) {
      // Without the streamer there is no "every world": -1 would hide the label, so it goes to world 0
      labelLines.push(`Create3DTextLabel(${escText}, ${hex8(l.color)}, ${formatCoord(lx)}, ${formatCoord(ly)}, ${formatCoord(lz)}, ${formatCoord(l.drawDist || 50)}, ${Math.max(0, l.world ?? 0)}, ${l.testLOS ? 1 : 0});${cmt}`);
    } else {
      labelLines.push(`CreateDynamic3DTextLabel(${escText}, ${hex8(l.color)}, ${formatCoord(lx)}, ${formatCoord(ly)}, ${formatCoord(lz)}, ${formatCoord(l.drawDist || 50)}, INVALID_PLAYER_ID, INVALID_VEHICLE_ID, ${l.testLOS ? 1 : 0}, ${l.world ?? -1}, ${l.interior ?? -1});${cmt}`);
    }
  }

  const pickupLines = [];
  const pickups = project.pickups || [];
  for (let idx = 0; idx < pickups.length; idx++) {
    const pk = pickups[idx];
    if (pk.blankLinesBefore > 0 && idx > 0) pickupLines.push('');
    preLines(pk, pickupLines);
    const px = pk.x - center.x, py = pk.y - center.y, pz = pk.z - center.z;
    const cmt = commentSuffix(pk);
    if (!dyn) {
      pickupLines.push(`CreatePickup(${pk.model}, ${pk.type ?? 1}, ${formatCoord(px)}, ${formatCoord(py)}, ${formatCoord(pz)}, ${pk.world ?? -1});${cmt}`);
    } else {
      const int = (pk.interior ?? -1) !== -1 ? `, ${pk.interior}` : '';
      pickupLines.push(`CreateDynamicPickup(${pk.model}, ${pk.type ?? 1}, ${formatCoord(px)}, ${formatCoord(py)}, ${formatCoord(pz)}, ${pk.world ?? -1}${int});${cmt}`);
    }
  }

  // Gang zones: created once, shown to each player (GangZoneShowForAll only reaches who is already online)
  const gangZones = project.gangZones || [];
  const zones = gangZones.map((gz) => {
    const pre = [];
    preLines(gz, pre);
    const minx = (gz.minx ?? gz.minX ?? 0) - center.x, miny = (gz.miny ?? gz.minY ?? 0) - center.y;
    const maxx = (gz.maxx ?? gz.maxX ?? 0) - center.x, maxy = (gz.maxy ?? gz.maxY ?? 0) - center.y;
    const gzName = gz.name || (gz.comment ? String(gz.comment).replace(/^\/\/\s*/, '').trim() : '');
    return { pre, blank: gz.blankLinesBefore > 0, create: `GangZoneCreate(${formatCoord(minx)}, ${formatCoord(miny)}, ${formatCoord(maxx)}, ${formatCoord(maxy)})`, color: hex8(gz.color), cmt: gzName ? ` // ${gzName}` : '' };
  });
  const gangZoneLines = [];
  zones.forEach((z, idx) => {
    if (z.blank && idx > 0) gangZoneLines.push('');
    gangZoneLines.push(...z.pre, `gangzoneid = ${z.create};${z.cmt}`, `GangZoneShowForAll(gangzoneid, ${z.color});`);
  });

  // Checkpoints: SA-MP shows one of each kind at a time to a player; the streamer shows all of them (the nearest one)
  const checkpointLines = [], cpDynLines = [];
  const checkpoints = project.checkpoints || [];
  for (const cp of checkpoints) {
    preLines(cp, checkpointLines);
    preLines(cp, cpDynLines);
    const cx = cp.x - center.x, cy = cp.y - center.y, cz = cp.z - center.z;
    const cmt = commentSuffix(cp);
    const wi = (cp.world ?? -1) !== -1 || (cp.interior ?? -1) !== -1 ? `, ${cp.world ?? -1}, ${cp.interior ?? -1}` : '';
    if (cp.cpKind === 'race') {
      const nx = (cp.nextx ?? cp.x) - center.x, ny = (cp.nexty ?? (cp.y + 10)) - center.y, nz = (cp.nextz ?? cp.z) - center.z;
      const args = `${cp.type ?? 0}, ${formatCoord(cx)}, ${formatCoord(cy)}, ${formatCoord(cz)}, ${formatCoord(nx)}, ${formatCoord(ny)}, ${formatCoord(nz)}, ${formatCoord(cp.size || 4.0)}`;
      checkpointLines.push(`SetPlayerRaceCheckpoint(playerid, ${args});${cmt}`);
      cpDynLines.push(`CreateDynamicRaceCP(${args}${wi});${cmt}`);
    } else {
      const args = `${formatCoord(cx)}, ${formatCoord(cy)}, ${formatCoord(cz)}, ${formatCoord(cp.size || 3.0)}`;
      checkpointLines.push(`SetPlayerCheckpoint(playerid, ${args});${cmt}`);
      cpDynLines.push(`CreateDynamicCP(${args}${wi});${cmt}`);
    }
  }
  const cpCalls = checkpointLines.filter(l => /^SetPlayer(Race)?Checkpoint\(/.test(l));
  const firstCp = cpCalls.findIndex(l => l.startsWith('SetPlayerCheckpoint('));
  const firstRace = cpCalls.findIndex(l => l.startsWith('SetPlayerRaceCheckpoint('));

  // Map icons: each one in its own slot (0 to 99), or the last one replaces the others
  const mapIconLines = [];
  const mapIcons = project.mapIcons || [];
  const iconSlots = mapIconSlots(mapIcons);
  for (let idx = 0; idx < mapIcons.length; idx++) {
    const mi = mapIcons[idx];
    preLines(mi, mapIconLines);
    const mx = mi.x - center.x, my = mi.y - center.y, mz = mi.z - center.z;
    mapIconLines.push(`SetPlayerMapIcon(playerid, ${iconSlots[idx]}, ${formatCoord(mx)}, ${formatCoord(my)}, ${formatCoord(mz)}, ${mi.type ?? 0}, ${hex8(mi.color ?? 0xFF0000FF)}, ${mi.style ?? 0});${commentSuffix(mi)}`);
  }

  const textDrawLines = [];
  const textDraws = project.textDraws || [];
  for (let idx = 0; idx < textDraws.length; idx++) {
    const td = textDraws[idx];
    preLines(td, textDrawLines);
    if (td.type === 'progress') {
      // Progress bar: needs #include <ProgressBar>
      textDrawLines.push(...progressBarPawn(td, progressBarVar(td, textDraws), fc));
      continue;
    }
    const cmt = commentSuffix(td);
    textDrawLines.push(...textDrawPawn(td, textDrawVar(td, textDraws), fc, undefined, cmt, (uid) => { const o = textDraws.find(t => t.uid === uid && t.type !== 'progress'); return o ? textDrawVar(o, textDraws) : null; }));
  }

  const cams = opt.includeCameras ? cameraFunctions(project.cameras, { id, center }) : { code: '', usage: [] };
  const gates = gatePawn(gateObjs, { id: gateId, dynamic: dyn, center, fmt: (v) => f(v, d), tr });

  // Limits of the game: what goes past them does not appear (the streamer has no limit for its own items)
  const warnLines = [];
  const warn = (count, fn, limit) => { if (count > limit) warnLines.push(`// ${tr('Aviso: {0} itens com {1}, mais que o limite de {2}: os que passarem não aparecem no jogo.', count, fn, limit)}`); };
  warn(dyn ? npcObjIdx.size : objs.length, 'CreateObject', 1000);
  warn(vehs.length, opt.vehicleFn, 2000);
  warn(actors.length - npcActors.length, 'CreateActor', 1000);
  if (!dyn) { warn(labels.length, 'Create3DTextLabel', 1024); warn(pickups.length, 'CreatePickup', 4096); }
  warn(gangZones.length, 'GangZoneCreate', 1024);
  warn(mapIcons.length, 'SetPlayerMapIcon', 100);
  warn(textDraws.filter(t => t.type !== 'progress' && !t.isPlayer).length, 'TextDrawCreate', 2048);
  warn(textDraws.filter(t => t.type !== 'progress' && t.isPlayer).length, 'CreatePlayerTextDraw', 256);
  warn(textDraws.filter(t => t.type === 'progress').length, 'CreatePlayerProgressBar', 85);

  // Array format: only plain objects go in the array; those with texture, movement, attachment, world, interior or
  // distances are created one by one (otherwise the object would be created twice, or lose what the array has no room for)
  const arrayName = `Map_${id}_Objects`;
  const arrayObjs = objs.filter(o => !(o.materials && o.materials.length) && !o.move && !o.attach && !gateIdx.has(o.uid) && !npcObjIdx.has(o.uid)
    && !parentIdx.has(o.uid) && (o.world ?? -1) === -1 && (o.interior ?? -1) === -1 && !(o.streamDist > 0) && !(o.drawDist > 0));
  const useArray = opt.exportArray && arrayObjs.length > 0;
  const arrayLines = [];
  if (useArray) {
    arrayLines.push('// Object coordinates array: Model, X, Y, Z, RX, RY, RZ');
    arrayLines.push(`new Float:${arrayName}[][7] = {`);
    for (let idx = 0; idx < arrayObjs.length; idx++) {
      const o = arrayObjs[idx];
      preLines(o, arrayLines, '    ');
      const x = o.x - center.x, y = o.y - center.y, z = o.z - center.z;
      const raw = o.raw || {};
      const c = [formatCoord(x, isRel ? null : raw.x), formatCoord(y, isRel ? null : raw.y), formatCoord(z, isRel ? null : raw.z),
        formatCoord(o.rx, isRel ? null : raw.rx), formatCoord(o.ry, isRel ? null : raw.ry), formatCoord(o.rz, isRel ? null : raw.rz)];
      const comma = (idx === arrayObjs.length - 1) ? '' : ',';
      // the model as a Float too (the array is Float:): no tag warning; floatround gives it back
      arrayLines.push(`    { ${o.model}.0, ${c.join(', ')} }${comma}${commentSuffix(o)}`);
    }
    arrayLines.push('};');
  }
  const arrayLoop = (ind) => [`${ind}for (new i = 0; i < sizeof(${arrayName}); i++)`, `${ind}{`,
    `${ind}    ${opt.objectFn === 'CreateObject' ? 'CreateObject' : 'CreateDynamicObject'}(floatround(${arrayName}[i][0]), ${arrayName}[i][1], ${arrayName}[i][2], ${arrayName}[i][3], ${arrayName}[i][4], ${arrayName}[i][5], ${arrayName}[i][6]);`, `${ind}}`];
  const extraLines = [];
  if (useArray) {
    const inArray = new Set(arrayObjs);
    for (const o of looseObjs) if (!inArray.has(o)) emitObjectBlock(extraLines, o);
  }
  const bodyObjLines = useArray ? extraLines : objLines;

  // The variables the lines use
  const uses = (ls, v) => { const re = new RegExp(`\\b${v}\\b`); return ls.some(l => re.test(l.replace(/\/\/.*$/, ''))); };
  const needObjId = uses([...bodyObjLines, ...vehLines], 'objectid');
  const needVehId = uses(vehLines, 'vehicleid');
  const attachDecl = parentIdx.size ? `new attachtoid[${parentIdx.size}];` : '';
  const needActorId = actorLines.length > 0;
  const needGzId = gangZoneLines.length > 0;

  // Includes the code needs (Progress Bar Plus and TextDrawFX), each with the link to download it
  const incs = [];
  if (textDraws.some(td => td.type === 'progress')) incs.push(PB_INCLUDE);
  if (textDraws.some(tdfxActive)) incs.push(TDFX_INCLUDE);

  if (opt.layout === 'filterscript') {
    const fs = filterscriptPawn({ project, fc: (v) => f(v, d), fileName: sanitizeIdent(project.name).toLowerCase(), gateId, gateObjs, gates, npcMod, npcActors,
      actors: actors.filter(a => !npcSet.has(a)), vehs, cams, objLines, vehLines, actorLines, remLines, labelLines, pickupLines, gangZoneLines,
      checkpointLines, mapIconLines, needObjId, attachDecl, needVehId, warnLines, chatText: opt.chatText });
    return withIncludes(fs.lines, fs.incAt, incs);
  }

  if (opt.layout === 'lines') {
    const cleanHeader = cleanPwnHeader(project.pwnHeader);
    if (cleanHeader) lines.push(cleanHeader, '');
    const incAt = lines.length;
    if (warnLines.length) lines.push('// ----------------------------------------------------------------', ...warnLines, '// ----------------------------------------------------------------');
    if (opt.relative) lines.push(`// ${tr('Posições relativas ao centro ({0})', `${f(center.x, 4)}, ${f(center.y, 4)}, ${f(center.z, 4)}`)}`);
    if (useArray) {
      lines.push(...arrayLines, '', ...arrayLoop(''));
      if (extraLines.length) lines.push('', '// Object extras (textures, movement and attachment):');
    }
    if (needObjId) lines.push('new objectid;');
    if (attachDecl) lines.push(attachDecl);
    lines.push(...bodyObjLines);
    if (needVehId) lines.push('new vehicleid;');
    if (needActorId) lines.push('new actorid;');
    if (needGzId) lines.push('new gangzoneid;');
    if (vehLines.length) lines.push('', ...vehLines);
    if (actorLines.length) lines.push('', '// Actors:', ...actorLines);
    if (labelLines.length) lines.push('', '// 3D Texts:', ...labelLines);
    if (pickupLines.length) lines.push('', '// Pickups:', ...pickupLines);
    if (gangZoneLines.length) lines.push('', '// GangZones:', ...gangZoneLines);
    if (checkpoints.length) {
      lines.push('', '// Checkpoints:');
      if (dyn) lines.push(...cpDynLines);
      else {
        if (cpCalls.length > 1) lines.push(`// ${tr('Sem o streamer, o jogador vê um checkpoint de cada tipo por vez: o último chamado substitui o anterior.')}`);
        lines.push(...checkpointLines);
      }
    }
    if (mapIconLines.length) lines.push('', '// MapIcons:', ...mapIconLines);
    if (textDrawLines.length) lines.push('', '// TextDraws:', ...textDrawLines);
    if (npcMod.load) lines.push('', `// ${tr('NPCs do open.mp: chame depois de criar os veículos:')}`, npcMod.load);
    if (remLines.length) lines.push('', '// Removed objects (put in OnPlayerConnect):', ...remLines);
    if (cams.code) lines.push('', cams.code);
    if (gates.code) lines.push('', gates.decl, '', gates.code);
    // The NPC system goes outside the functions, like the cameras and the gates (its call is with the other lines above)
    if (npcMod.code) lines.push('', npcMod.decl, '', npcMod.code);
    return withIncludes(lines, incAt, incs);
  }

  // Module: Map_<id>_Load() creates the map, Map_<id>_Player(playerid) gives each player what is per player
  // (map icons, gang zones, TextDraws, bars and checkpoints)
  const td = tdParts(textDraws, fc, {
    varOf: (t, all) => (t.type === 'progress' ? progressBarVar(t, all).replace('progress_', `Map_${id}_PB`) : textDrawVar(t, all).replace('textdraw_', `Map_${id}_TD`)),
    comment: commentSuffix, preComments: true,
  });
  const zoneVar = (k) => `Map_${id}_Zone[${k}]`;
  const cpFn = `Map_${id}_CP`;
  const useCpFn = !dyn && cpCalls.length > 0;
  const playerLines = [...mapIconLines];
  zones.forEach((z, k) => playerLines.push(`GangZoneShowForPlayer(playerid, ${zoneVar(k)}, ${z.color});`));
  for (const x of td.globalTds) playerLines.push(`TextDrawShowForPlayer(playerid, ${x.v});`);
  playerLines.push(...td.playerTdLines);
  if (useCpFn && firstCp >= 0) playerLines.push(`${cpFn}(playerid, ${firstCp});`);
  if (useCpFn && firstRace >= 0) playerLines.push(`${cpFn}(playerid, ${firstRace});`);

  const date = new Date().toLocaleDateString(uiLocale());
  const cleanHeader = cleanPwnHeader(project.pwnHeader);
  if (cleanHeader) lines.push(cleanHeader, '');
  const incAt = lines.length;
  lines.push('// ================================================================');
  lines.push(`// ${tr('Mapa: {0}', project.name)}`);
  lines.push(`// ${tr('Gerado pelo SA Map Studio em {0}', date)}`);
  lines.push(`// ${tr('Objetos: {0}', objs.length)}   ${tr('Veículos: {0}', vehs.length)}   ${tr('Actors: {0}', actors.length)}   ${tr('Objetos removidos: {0}', rems.length)}`);
  if (labels.length || pickups.length || gangZones.length || textDraws.length || checkpoints.length || mapIcons.length) {
    lines.push(`// ${tr('Textos 3D: {0}', labels.length)}   Pickups: ${pickups.length}   GangZones: ${gangZones.length}   Checkpoints: ${checkpoints.length}   MapIcons: ${mapIcons.length}   TextDraws: ${textDraws.length}`);
  }
  if (npcActors.length) lines.push(`// ${tr('NPCs do open.mp: {0}', npcActors.length)}`);
  lines.push(...warnLines);
  lines.push('// ----------------------------------------------------------------');
  lines.push(`// ${tr('Como usar:')}`);
  lines.push(`//   OnGameModeInit():   Map_${id}_Load();${npcActors.length ? `  // ${tr('também cria os NPCs')}` : ''}`);
  if (playerLines.length) lines.push(`//   OnPlayerConnect():  Map_${id}_Player(playerid);`);
  if (remLines.length) lines.push(`//   OnPlayerConnect():  Map_${id}_Remove(playerid);`);
  if (useCpFn && cpCalls.length > 1) lines.push(`//   ${tr('Checkpoints: troque com {0}', `${cpFn}(playerid, 0..${cpCalls.length - 1});`)}`);
  for (const u of gates.usage) lines.push('//   ' + u);
  if (cams.usage.length) { lines.push(`//   ${tr('Câmeras (chame quando quiser, com o jogador já spawnado):')}`); for (const u of cams.usage) lines.push('//     ' + u); }
  if (opt.relative) lines.push(`//   ${tr('Posições relativas: some ({0}) ou passe a origem.', `${f(center.x, 4)}, ${f(center.y, 4)}, ${f(center.z, 4)}`)}`);
  lines.push('// ================================================================');
  lines.push('');

  if (useArray) lines.push(...arrayLines, '');
  if (gates.decl) lines.push(gates.decl, '');
  if (npcMod.decl) lines.push(npcMod.decl, '');
  const globals = [];
  if (zones.length) globals.push(`new ${zoneVar(zones.length)};`);
  for (const x of td.globalTds) globals.push(`new Text:${x.v} = INVALID_TEXT_DRAW;`);
  for (const x of td.playerTds) globals.push(`new PlayerText:${x.v}[MAX_PLAYERS];`);
  for (const x of td.bars) globals.push(`new ${x.v}[MAX_PLAYERS];`);
  if (globals.length) lines.push(...globals, '');

  const indent = (l) => (l === '' ? '' : '    ' + l);
  lines.push(`stock Map_${id}_Load()`);
  lines.push('{');
  if (needObjId) lines.push('    new objectid;');
  if (attachDecl) lines.push('    ' + attachDecl);
  if (needVehId) lines.push('    new vehicleid;');
  if (needActorId) lines.push('    new actorid;');
  if (useArray) {
    lines.push(...arrayLoop('    '));
    if (extraLines.length) lines.push('    // Object extras (textures, movement and attachment):');
  }
  for (const l of bodyObjLines) lines.push(indent(l));
  if (vehLines.length) { if (bodyObjLines.length || useArray) lines.push(''); for (const l of vehLines) lines.push(indent(l)); }
  if (actorLines.length) { lines.push(''); for (const l of actorLines) lines.push(indent(l)); }
  if (labelLines.length) { lines.push('', '    // 3D Texts:'); for (const l of labelLines) lines.push(indent(l)); }
  if (pickupLines.length) { lines.push('', '    // Pickups:'); for (const l of pickupLines) lines.push(indent(l)); }
  if (zones.length) {
    lines.push('', '    // GangZones:');
    zones.forEach((z, k) => { if (z.blank && k > 0) lines.push(''); lines.push(...z.pre.map(indent), indent(`${zoneVar(k)} = ${z.create};${z.cmt}`)); });
  }
  if (dyn && cpDynLines.length) { lines.push('', '    // Checkpoints:'); for (const l of cpDynLines) lines.push(indent(l)); }
  if (td.globalTdLines.length) { lines.push('', '    // TextDraws:'); for (const l of td.globalTdLines) lines.push(indent(l)); }
  if (npcMod.load) lines.push('', `    // ${tr('NPCs do open.mp:')}`, indent(npcMod.load));
  lines.push('    return 1;');
  lines.push('}');
  if (playerLines.length) {
    lines.push('', `stock Map_${id}_Player(playerid)`, '{');
    for (const l of playerLines) lines.push(indent(l));
    lines.push('    return 1;', '}');
  }
  if (useCpFn) {
    lines.push('', `stock ${cpFn}(playerid, cp)`, '{', '    switch (cp)', '    {');
    cpCalls.forEach((c, k) => lines.push(`        case ${k}: ${c}`));
    lines.push('        default: return 0;', '    }', '    return 1;', '}');
  }
  if (remLines.length) {
    lines.push('');
    lines.push(`stock Map_${id}_Remove(playerid)`);
    lines.push('{');
    for (const l of remLines) lines.push(indent(l));
    lines.push('    return 1;');
    lines.push('}');
  }
  if (cams.code) { lines.push(''); lines.push(cams.code); }
  if (gates.code) lines.push('', gates.code);
  if (npcMod.code) lines.push('', npcMod.code);
  return withIncludes(lines, incAt, incs);
}
export const exportPwn = exportPawn;

// Puts the includes the code needs at the top, each with the address to download it; the streamer comes first
// when the code uses dynamic items
const STREAMER_INCLUDE = '#include <streamer>//https://github.com/samp-incognito/samp-streamer-plugin';
function withIncludes(lines, at, incs) {
  // open.mp takes true/false where the lines write 0/1 (the same value in SA-MP, without warning 213 in open.mp)
  const dynamic = /\b(CreateDynamic\w*|MoveDynamicObject|SetDynamicObject\w*|AttachDynamicObject\w*|Streamer_\w+)\s*\(/.test(lines.join('\n'));
  const all = [...(dynamic ? [STREAMER_INCLUDE] : []), ...incs];
  if (all.length) lines.splice(at, 0, ...all, '');
  return lines.join('\n').split('\n').map(boolArgs).join('\n') + '\n';
}

export function exportIpl(project, quatOf, modelName) {
  const lines = [`# ${tr('Gerado pelo SA Map Studio')}`, `# ${tr('Prédios removidos não existem em IPL: apague-os no IPL original do jogo.')}`, 'inst'];
  for (const o of project.objects) {
    const q = quatOf(o);
    const interior = o.interior > 0 ? o.interior : 0;
    lines.push(`${o.model}, ${modelName(o.model)}, ${interior}, ${f(o.x, 6)}, ${f(o.y, 6)}, ${f(o.z, 6)}, ${f(-q.x, 8)}, ${f(-q.y, 8)}, ${f(-q.z, 8)}, ${f(q.w, 8)}, -1`);
  }
  lines.push('end');
  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Cameras: fixed points (SetPlayerCameraPos/LookAt) and movements (InterpolateCamera*)
// ---------------------------------------------------------------------------
const camIdent = (prefix, name, used) => {
  // the name only fills what is left of the 31 letters
  let base = (prefix + sanitizeIdent(name)).slice(0, 28);
  let id = base, i = 2;
  while (used.has(id.toLowerCase())) id = base.slice(0, 26) + '_' + i++;
  used.add(id.toLowerCase());
  return id;
};
const cutName = (c) => (c === 'move' ? 'CAMERA_MOVE' : 'CAMERA_CUT');

// id: the map in the function names (two maps in the same script); center: subtracted from the positions (relative export)
export function cameraFunctions(cameras, { id = '', center = { x: 0, y: 0, z: 0 } } = {}) {
  const shots = cameras?.shots || [], paths = (cameras?.paths || []).filter(p => p.keys.length);
  if (!shots.length && !paths.length) return { code: '', usage: [] };
  const used = new Set();
  const out = [], usage = [];
  const p3 = (v) => `${f(v.x - center.x, 4)}, ${f(v.y - center.y, 4)}, ${f(v.z - center.z, 4)}`;
  for (const s of shots) {
    const fn = camIdent(id ? `Cam_${id}_` : 'CameraShot_', s.name, used);
    usage.push(`${fn}(playerid);  // ${s.name}`);
    out.push(`// Camera shot: ${s.name}`, `stock ${fn}(playerid)`, '{',
      `    SetPlayerCameraPos(playerid, ${p3(s.pos)});`,
      `    SetPlayerCameraLookAt(playerid, ${p3(s.look)}, ${cutName(s.cut)});`,
      '    return 1;', '}', '');
  }
  let pathIdx = 1;
  for (const p of paths) {
    const fn = id ? `CamMove_${id}_${pathIdx++}` : `CameraMove_${pathIdx++}`;
    used.add(fn.toLowerCase());
    const setName = (p.name || tr('Conjunto {0}', pathIdx - 1)).trim();
    usage.push(`${fn}(playerid, 0);  // ${setName}`);
    const k = p.keys;
    out.push(`forward ${fn}(playerid, step);`,
      `public ${fn}(playerid, step)//${setName}`,
      '{',
      '    switch (step)',
      '    {');
    for (let s = 0; s < k.length - 1; s++) {
      const a = k[s], b = k[s + 1];
      const time = Math.max(1, b.time | 0);
      const camName = (b.name || a.name || tr('Câmera {0}', s + 1)).trim();
      out.push(`        case ${s}://${camName}`,
        '        {',
        `            InterpolateCameraPos(playerid, ${p3(a.pos)}, ${p3(b.pos)}, ${time}, ${cutName(b.cut)});`,
        `            InterpolateCameraLookAt(playerid, ${p3(a.look)}, ${p3(b.look)}, ${time}, ${cutName(b.cut)});`,
        `            SetTimerEx("${fn}", ${time + (b.hold | 0)}, false, "ii", playerid, ${s + 1});`,
        '        }');
    }
    if (p.end === 'loop') {
      out.push('        default:', '        {', `            ${fn}(playerid, 0);`, '        }');
    } else if (p.end === 'keep') {
      // Stays on the last point: nothing to do at the end
      out.push('        default:', '        {', '        }');
    } else {
      out.push('        default:', '        {', '            SetCameraBehindPlayer(playerid);', '        }');
    }
    out.push('    }', '    return 1;', '}', '');
  }
  return { code: out.join('\n'), usage };
}
if (typeof window !== 'undefined') window.exportPawn = exportPawn;

