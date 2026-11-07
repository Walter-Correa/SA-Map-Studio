// TextDraw effects of the TextDrawFX include: the table of its functions with their parameters, the Pawn call,
// the import of a call back into the project, the line of the test server map file and the preview in the editor.
// Every effect works the same way as in the include (same timings, curves and limits), so the preview shows what the game shows.

export const TDFX_INCLUDE = '#include <TextDrawFX>//https://github.com/Walter-Correa/TextDrawFX';
export const TDFX_FRAME = 40;     // TDFX_FRAME_INTERVAL
export const TDFX_MIN_INTERVAL = 30;

export const TDFX_EASE_NAMES = ['TDFX_EASE_LINEAR', 'TDFX_EASE_IN_QUAD', 'TDFX_EASE_OUT_QUAD', 'TDFX_EASE_IN_OUT_QUAD', 'TDFX_EASE_OUT_BOUNCE'];
export const TDFX_DIR_NAMES = ['TDFX_DIR_LEFT_TO_RIGHT', 'TDFX_DIR_RIGHT_TO_LEFT', 'TDFX_DIR_BOUNCE'];
export const TDFX_FW_NAMES = ['TDFX_FW_BURST_SPHERE', 'TDFX_FW_BURST_FAN', 'TDFX_FW_BURST_ROCKET', 'TDFX_FW_BURST_RING', 'TDFX_FW_BURST_FOUNTAIN'];
const ENUMS = { ease: TDFX_EASE_NAMES, dir: TDFX_DIR_NAMES, fw: TDFX_FW_NAMES };

// Parameter: [name in the include, type, default, label, min, max]. A default that is a function takes the TextDraw.
// Types: int, float, bool, color, text (the TextDraw text when empty), tag, ease, dir, fw, td (another TextDraw of the project).
const P = (k, type, def, label, min, max) => ({ k, type, def, label, min, max });
const dur = (def = 0) => P('duration', 'int', def, def ? 'Duração (ms)' : 'Duração (ms, 0 = sem fim)', 0, 600000);
const txt = (k = 'text') => P(k, 'text', '', 'Texto (vazio = o do TextDraw)');
const cx = (k = 'centerX', label = 'Centro X') => P(k, 'float', (td) => round2(td.x), label, -200, 840);
const cy = (k = 'centerY', label = 'Centro Y') => P(k, 'float', (td) => round2(td.y), label, -200, 650);
const ease = (def = 0) => P('easing', 'ease', def, 'Curva');
const round2 = (v) => Math.round((Number(v) || 0) * 100) / 100;

// fonts: 'text' = fonts 0 to 3, 'model' = only font 5, 'any' = every TextDraw. player: only for PlayerTextDraws.
// named: parameters that come after extra_id/callback in the include (written as .name = value).
export const TDFX_EFFECTS = [
  { id: 'blink', fn: 'BlinkPlayerTextDraw', gfn: 'BlinkTextDraw', label: 'Piscar', fonts: 'any', params: [
    P('interval', 'int', 500, 'Intervalo (ms)', TDFX_MIN_INTERVAL, 60000), dur(),
    P('perChar', 'bool', false, 'Mostrar caractere por caractere'), P('colour', 'color', 0, 'Cor da piscada (vazio = some)')] },
  { id: 'typewriter', fn: 'TypewriterPlayerTextDraw', gfn: 'TypewriterTextDraw', label: 'Máquina de escrever', fonts: 'text', params: [
    txt(), P('interval', 'int', 50, 'Intervalo (ms)', TDFX_MIN_INTERVAL, 60000), dur()] },
  { id: 'fadeIn', fn: 'FadeInPlayerTextDraw', gfn: 'FadeInTextDraw', label: 'Aparecer aos poucos', fonts: 'any', params: [
    dur(1000), P('fadeBox', 'bool', true, 'Também a caixa'), P('targetAlpha', 'int', 255, 'Opacidade final (0 a 255)', 0, 255)],
    named: [P('autoHide', 'bool', false, 'Esconder no fim')] },
  { id: 'fadeOut', fn: 'FadeOutPlayerTextDraw', gfn: 'FadeOutTextDraw', label: 'Sumir aos poucos', fonts: 'any', params: [
    dur(1000), P('fadeBox', 'bool', true, 'Também a caixa')], named: [P('autoHide', 'bool', true, 'Esconder no fim')] },
  { id: 'fadeColor', fn: 'FadeColorPlayerTextDraw', gfn: 'FadeColorTextDraw', label: 'Trocar de cor', fonts: 'any', params: [
    P('fromColor', 'color', (td) => (Number(td.color ?? 0xFFFFFFFF) >>> 0), 'Cor inicial'), P('toColor', 'color', 0xE74C3CFF, 'Cor final'), dur(1000),
    P('fadeBox', 'bool', false, 'Também a caixa'), P('fromBox', 'color', 0, 'Cor inicial da caixa'), P('toBox', 'color', 0, 'Cor final da caixa'), ease()] },
  { id: 'scale', fn: 'ScalePlayerTextDraw', gfn: 'ScaleTextDraw', label: 'Mudar de tamanho', fonts: 'text', params: [
    P('startSizeX', 'float', (td) => round2((td.letterSizeX ?? 0.35) * 0.4), 'Tamanho inicial X', 0, 10), P('startSizeY', 'float', (td) => round2((td.letterSizeY ?? 1.4) * 0.4), 'Tamanho inicial Y', 0, 40),
    P('targetSizeX', 'float', (td) => round2(td.letterSizeX ?? 0.35), 'Tamanho final X', 0, 10), P('targetSizeY', 'float', (td) => round2(td.letterSizeY ?? 1.4), 'Tamanho final Y', 0, 40), dur(1000), ease(4)] },
  { id: 'pulse', fn: 'PulsePlayerTextDraw', gfn: 'PulseTextDraw', label: 'Pulsar', fonts: 'text', params: [
    P('amplitude', 'float', 0.25, 'Intensidade', 0, 5), P('interval', 'int', 300, 'Tempo de cada pulso (ms)', TDFX_MIN_INTERVAL, 60000), P('cycles', 'int', 0, 'Pulsos (0 = sem fim)', 0, 10000)] },
  { id: 'slide', fn: 'SlidePlayerTextDraw', gfn: 'SlideTextDraw', label: 'Deslizar', fonts: 'any', params: [
    P('targetX', 'float', (td) => round2(td.x + 80), 'Destino X', -200, 840), P('targetY', 'float', (td) => round2(td.y), 'Destino Y', -200, 650), dur(1000), ease(2)] },
  { id: 'count', fn: 'CountPlayerTextDrawNumber', gfn: 'CountTextDrawNumber', label: 'Contador de números', fonts: 'text', params: [
    P('startValue', 'int', 0, 'Valor inicial', -2147483647, 2147483647), P('targetValue', 'int', 1000, 'Valor final', -2147483647, 2147483647), dur(1000),
    P('prefix', 'tag', '', 'Antes do número'), P('suffix', 'tag', '', 'Depois do número'), P('thousandsSep', 'bool', false, 'Separar milhares'), ease()] },
  { id: 'scramble', fn: 'ScramblePlayerTextDraw', gfn: 'ScrambleTextDraw', label: 'Decifrar', fonts: 'text', params: [txt('finalText'), dur(2000)] },
  { id: 'bounce', fn: 'BouncePlayerTextDraw', gfn: 'BounceTextDraw', label: 'Quicar na área', fonts: 'any', params: [
    P('speedX', 'float', 3, 'Velocidade X', -100, 100), P('speedY', 'float', 2, 'Velocidade Y', -100, 100),
    P('minX', 'float', 20, 'X mínimo', -200, 840), P('minY', 'float', 20, 'Y mínimo', -200, 650), P('maxX', 'float', 600, 'X máximo', -200, 840), P('maxY', 'float', 420, 'Y máximo', -200, 650),
    P('colorShift', 'bool', false, 'Trocar de cor ao bater'), dur()] },
  { id: 'bounceCircle', fn: 'BounceCirclePlayerTextDraw', gfn: 'BounceCircleTextDraw', label: 'Quicar no círculo', fonts: 'any', params: [
    P('speed', 'float', 3, 'Velocidade', 0, 100), P('angle', 'float', 45, 'Ângulo', -360, 360), cx(), cy(), P('radius', 'float', 80, 'Raio', 1, 640),
    P('colorShift', 'bool', false, 'Trocar de cor ao bater'), dur()] },
  { id: 'orbit', fn: 'OrbitPlayerTextDraw', gfn: 'OrbitTextDraw', label: 'Órbita', fonts: 'any', params: [
    cx(), cy(), P('radiusX', 'float', 60, 'Raio X', 0, 640), P('radiusY', 'float', 30, 'Raio Y', 0, 640),
    P('angularSpeed', 'float', 60, 'Graus por segundo', -3600, 3600), P('startAngle', 'float', 0, 'Ângulo inicial', -360, 360), dur()] },
  { id: 'shake', fn: 'ShakePlayerTextDraw', gfn: 'ShakeTextDraw', label: 'Tremer', fonts: 'any', params: [P('intensity', 'float', 6, 'Intensidade', 0, 100), dur(800)] },
  { id: 'neon', fn: 'NeonFlickerPlayerTextDraw', gfn: 'NeonFlickerTextDraw', label: 'Neon falhando', fonts: 'any', params: [dur(3000), P('brokenRatio', 'int', 40, 'Falhas (0 a 100%)', 0, 100)] },
  { id: 'waveDrift', fn: 'WaveDriftPlayerTextDraw', gfn: 'WaveDriftTextDraw', label: 'Flutuar', fonts: 'any', params: [
    P('amplitudeX', 'float', 6, 'Amplitude X', 0, 320), P('amplitudeY', 'float', 4, 'Amplitude Y', 0, 240), P('speedMs', 'int', 1500, 'Tempo de cada volta (ms)', 100, 600000), dur()] },
  { id: 'fill', fn: 'FillPlayerTextDrawProgress', gfn: 'FillTextDrawProgress', label: 'Encher a caixa', fonts: 'text', params: [
    P('startWidth', 'float', (td) => fillDefaults(td).start, 'Caixa no começo', -1000, 1000), P('targetWidth', 'float', (td) => fillDefaults(td).end, 'Caixa no fim', -1000, 1000), dur(2000), ease(2),
    P('lineHeight', 'float', 0, 'Altura (0 = a do TextDraw)', 0, 640)] },
  { id: 'firework', fn: 'FireworkPlayerTextDraw', gfn: 'FireworkTextDraw', label: 'Fogos de artifício', fonts: 'any', params: [
    P('pattern', 'fw', 0, 'Explosão'), P('fuseDuration', 'int', 1500, 'Pavio (ms)', TDFX_MIN_INTERVAL, 600000), P('explodeDuration', 'int', 1200, 'Explosão (ms)', TDFX_MIN_INTERVAL, 600000),
    P('shakeIntensity', 'float', 6, 'Tremor', 0, 100), P('burstSpeed', 'float', 6, 'Velocidade das faíscas', 0, 100), P('particleCount', 'int', 10, 'Faíscas (1 a 12)', 1, 12)] },
  { id: 'glitch', fn: 'GlitchPlayerTextDraw', gfn: 'GlitchTextDraw', label: 'Falha digital', fonts: 'text', params: [txt(), P('intensity', 'int', 2, 'Intensidade (1 a 5)', 1, 5), dur(3000)] },
  { id: 'spin3D', fn: 'Spin3DPlayerTextDraw', gfn: 'Spin3DTextDraw', label: 'Girar o modelo', fonts: 'model', params: [
    P('speedX', 'float', 0, 'Graus por segundo X', -3600, 3600), P('speedY', 'float', 0, 'Graus por segundo Y', -3600, 3600), P('speedZ', 'float', 45, 'Graus por segundo Z', -3600, 3600),
    P('zoom', 'float', (td) => round2(td.previewZoom || 1), 'Zoom', 0.1, 50), dur()] },
  { id: 'hover3D', fn: 'Hover3DPlayerTextDraw', gfn: 'Hover3DTextDraw', label: 'Balançar o modelo', fonts: 'model', params: [
    P('tiltX', 'float', 8, 'Inclinação X', -180, 180), P('tiltZ', 'float', 12, 'Inclinação Z', -180, 180), P('zoomAmp', 'float', 0.06, 'Variação do zoom', 0, 10),
    P('speedMs', 'int', 2400, 'Tempo de cada volta (ms)', 100, 600000), dur()] },
  { id: 'shimmer', fn: 'ShimmerPlayerTextDraw', gfn: 'ShimmerTextDraw', label: 'Brilho passando', fonts: 'text', params: [
    txt(), P('baseTag', 'tag', '~y~', 'Cor do texto (tag)'), P('shimmerTag', 'tag', '~w~', 'Cor do brilho (tag)'),
    P('sweepDuration', 'int', 1000, 'Passada (ms)', 300, 600000), P('pauseDuration', 'int', 1500, 'Pausa (ms)', 0, 600000), dur()] },
  { id: 'rainbow', fn: 'RainbowPlayerTextDraw', gfn: 'RainbowTextDraw', label: 'Arco-íris', fonts: 'text', params: [txt(), P('speedMs', 'int', 100, 'Velocidade (ms)', 35, 60000), dur()] },
  { id: 'slotMachine', fn: 'SlotMachinePlayerTextDraw', gfn: 'SlotMachineTextDraw', label: 'Caça-níqueis', fonts: 'text', params: [txt('finalText'), P('spinDuration', 'int', 2200, 'Giro (ms)', 50, 600000)] },
  { id: 'pendulum', fn: 'PendulumPlayerTextDraw', gfn: 'PendulumTextDraw', label: 'Pêndulo', fonts: 'any', params: [
    cx('pivotX', 'Pivô X'), P('pivotY', 'float', (td) => round2(td.y - 80), 'Pivô Y', -200, 650), P('armLength', 'float', 80, 'Comprimento', 0, 640),
    P('maxAngle', 'float', 40, 'Ângulo máximo', 0, 180), P('damping', 'float', 0.65, 'Amortecimento', 0, 20), dur(3500)] },
  { id: 'gravityDrop', fn: 'GravityDropPlayerTextDraw', gfn: 'GravityDropTextDraw', label: 'Cair quicando', fonts: 'any', params: [
    P('startY', 'float', (td) => round2(td.y - 120), 'Y inicial', -200, 650), P('targetY', 'float', (td) => round2(td.y), 'Y final', -200, 650), P('elasticity', 'float', 0.38, 'Elasticidade', 0, 0.95)] },
  { id: 'vortex', fn: 'VortexPlayerTextDraw', gfn: 'VortexTextDraw', label: 'Redemoinho', fonts: 'text', params: [
    cx(), cy(), P('startRadius', 'float', 120, 'Raio inicial', 0, 640), P('spins', 'float', 2.5, 'Voltas', -100, 100), dur(2000)] },
  { id: 'letterbox', fn: 'LetterboxPlayerTextDraw', gfn: 'LetterboxTextDraw', label: 'Faixas de cinema', fonts: 'text', params: [
    P('bottomBarTD', 'td', '', 'Faixa de baixo'), P('barHeight', 'float', 65, 'Altura das faixas', 0, 240), dur(1200), P('reverse', 'bool', false, 'Recolher'), ease(2)] },
  { id: 'sonarPing', fn: 'SonarPingPlayerTextDraw', gfn: 'SonarPingTextDraw', label: 'Pulso de sonar', fonts: 'text', params: [
    cx(), cy(), P('maxRadius', 'float', 140, 'Raio', 0, 640), P('pulseCount', 'int', 3, 'Pulsos', 1, 1000), P('pulseDuration', 'int', 1200, 'Tempo de cada pulso (ms)', 1, 600000)] },
  { id: 'waveSweep', fn: 'WaveSweepPlayerTextDraw', gfn: 'WaveSweepTextDraw', label: 'Onda de cor', fonts: 'text', params: [
    txt(), P('crestTag', 'tag', '~w~', 'Cor da onda (tag)'), P('baseTag', 'tag', '~b~', 'Cor do texto (tag)'), P('crestWidth', 'int', 2, 'Largura da onda', 1, 100),
    P('direction', 'dir', 0, 'Direção'), P('speedMs', 'int', 70, 'Velocidade (ms)', 25, 60000), dur()] },
  { id: 'letterRain', fn: 'LetterRainPlayerTextDraw', gfn: 'LetterRainTextDraw', label: 'Chuva de letras', fonts: 'text', params: [
    txt(), cx('targetX', 'Destino X'), cy('targetY', 'Destino Y'), P('letterSpacing', 'float', 0, 'Espaço entre letras (0 = automático)', 0, 100), dur(3000)] },
  { id: 'scannerSweep', fn: 'ScannerSweepPlayerTextDraw', gfn: 'ScannerSweepTextDraw', label: 'Scanner', fonts: 'text', params: [
    txt(), P('laserTag', 'tag', '~r~', 'Cor do laser (tag)'), P('trailTag', 'tag', '~y~', 'Cor do rastro (tag)'), P('speedMs', 'int', 60, 'Velocidade (ms)', 25, 60000), dur()] },
  { id: 'electricArc', fn: 'ElectricArcPlayerTextDraw', gfn: 'ElectricArcTextDraw', label: 'Curto-circuito', fonts: 'text', params: [txt(), P('surgeDuration', 'int', 2200, 'Duração (ms)', 1, 600000)] },
  { id: 'splitFlap', fn: 'SplitFlapPlayerTextDraw', gfn: 'SplitFlapTextDraw', label: 'Painel de aeroporto', fonts: 'text', params: [
    txt('targetText'), P('charRollMs', 'int', 80, 'Troca das letras (ms)', 1, 60000), P('lockIntervalMs', 'int', 200, 'Fixar cada letra (ms)', 50, 60000)] },
  { id: 'hologram', fn: 'HologramPlayerTextDraw', gfn: 'HologramTextDraw', label: 'Holograma', fonts: 'text', params: [txt(), dur()] },
  { id: 'shockwaveSlam', fn: 'ShockwaveSlamPlayerTextDraw', gfn: 'ShockwaveSlamTextDraw', label: 'Impacto', fonts: 'text', params: [cx(), cy(), dur(1800)] },
  { id: 'waveMotion', fn: 'WaveMotionPlayerTextDraw', gfn: 'WaveMotionTextDraw', label: 'Onda nas letras', fonts: 'text', params: [
    txt(), cx(), cy(), P('crestHeight', 'float', 14, 'Altura da onda', 0, 240), P('crestWidth', 'float', 2.5, 'Largura da onda', 0.1, 100),
    P('direction', 'dir', 0, 'Direção'), dur(2800), P('loop', 'bool', false, 'Repetir')] },
  { id: 'hopLetter', fn: 'HopLetterPlayerTextDraw', gfn: 'HopLetterTextDraw', label: 'Letras pulando', fonts: 'text', params: [
    txt(), cx(), cy(), P('hopHeight', 'float', 16, 'Altura do pulo', 0, 240), P('staggerMs', 'int', 90, 'Atraso entre letras (ms)', 0, 60000),
    P('hopDurationMs', 'int', 350, 'Tempo do pulo (ms)', 1, 60000), P('direction', 'dir', 0, 'Direção'), dur(), P('loop', 'bool', false, 'Repetir')] },
];
// Every function has bool:loop before extra_id (the blink after text and baseColour): it starts the effect again at the end
for (const e of TDFX_EFFECTS) if (!e.params.some(p => p.k === 'loop')) e.params.push(P('loop', 'bool', false, 'Repetir'));
export const TDFX_BY_ID = Object.fromEntries(TDFX_EFFECTS.map(e => [e.id, e]));

// Box fill: TextDrawTextSize of the box changes from the first value to the second. Aligned left (or right), the value is the
// X where the box ends on the screen; centred, it is the width of the box. The defaults fill the box the TextDraw has.
function fillDefaults(td) {
  const centred = (td.align ?? td.alignment ?? 1) === 2;
  if (centred) return { start: 0, end: round2(Math.abs(Number(td.textSizeY) || 0) || 150) };
  const x = Number(td.x) || 0, end = Number(td.textSizeX) || 0;
  return { start: round2(x), end: round2(end > x ? end : x + 150) };
}

// Cinema bars: black full-width boxes; the include gives them the letter size of the bar height (top h / 9.5, bottom
// (h + 35.8) / 9.5) and moves them in from outside the screen
export const letterboxTopSize = (h) => round4(Number(h) / 9.5);
export const letterboxBottomSize = (h) => round4((Number(h) + 35.8) / 9.5);
export function letterboxBar(td, top, barHeight) {
  Object.assign(td, {
    text: '_', font: 1, x: 0, y: top ? -(Number(barHeight) + 15) : 480, letterSizeX: 0, letterSizeY: top ? letterboxTopSize(barHeight) : letterboxBottomSize(barHeight),
    textSizeX: 640, textSizeY: 0, useBox: 1, boxColor: 0x000000FF, color: 0x00000000, align: 1, alignment: 1, outline: 0, shadow: 0, proportional: 1,
  });
  return td;
}
const BY_FN = new Map();
for (const e of TDFX_EFFECTS) { BY_FN.set(e.fn, { e, player: true }); if (e.gfn) BY_FN.set(e.gfn, { e, player: false }); }
export const TDFX_FUNCTIONS = [...BY_FN.keys()];
export const tdfxParams = (e) => [...e.params, ...(e.named || [])];

// Can this effect go on this TextDraw? (font, box and the global TextDraws)
export function tdfxAllowed(e, td) {
  if (!e || !td || td.type === 'progress') return false;
  const font = td.font ?? 1;
  if (e.fonts === 'text' && font > 3) return false;
  if (e.fonts === 'model' && font !== 5) return false;
  if (!td.isPlayer && !e.gfn) return false;
  return true;
}

const clampNum = (v, min, max, def) => { const n = Number(v); if (!Number.isFinite(n)) return def; return Math.max(min ?? -Infinity, Math.min(max ?? Infinity, n)); };
const defOf = (p, td) => (typeof p.def === 'function' ? p.def(td || {}) : p.def);

function normParam(p, v, td) {
  const def = defOf(p, td);
  switch (p.type) {
    case 'int': return Math.round(clampNum(v, p.min, p.max, def));
    case 'float': return round4(clampNum(v, p.min, p.max, def));
    case 'bool': return v === undefined ? Boolean(def) : Boolean(v);
    case 'color': return v === undefined ? (Number(def) >>> 0) : (Number(v || 0) >>> 0);
    case 'ease': return Math.round(clampNum(v, 0, 4, def));
    case 'dir': return Math.round(clampNum(v, 0, 2, def));
    case 'fw': return Math.round(clampNum(v, 0, 4, def));
    case 'td': return v ? String(v) : '';
    default: return v === undefined ? String(def ?? '') : String(v).slice(0, 255);
  }
}
const round4 = (v) => Math.round(v * 10000) / 10000;

// A clean copy of the effect of a TextDraw ({ type, ...parameters }), null when it has none or the type is unknown
export function makeFx(data, td) {
  const e = data && TDFX_BY_ID[data.type];
  if (!e) return null;
  const fx = { type: e.id };
  for (const p of tdfxParams(e)) fx[p.k] = normParam(p, data[p.k], td);
  return fx;
}

// A new effect with the include defaults, the positions taken from the TextDraw
export const newFx = (type, td) => makeFx({ type }, td);

// The effect that really runs: off when the font or the kind of TextDraw does not take it
export const tdfxActive = (td) => Boolean(td?.fx && tdfxAllowed(TDFX_BY_ID[td.fx.type], td));

const hex8 = (v) => '0x' + (Number(v) >>> 0).toString(16).toUpperCase().padStart(8, '0');
const pawnFloat = (v) => { const s = String(round4(Number(v) || 0)); return s.includes('.') ? s : s + '.0'; };
const pawnStr = (s) => '"' + String(s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';

function pawnValue(p, v, ctx) {
  switch (p.type) {
    case 'int': return String(v | 0);
    case 'float': return pawnFloat(v);
    case 'bool': return v ? 'true' : 'false';
    case 'color': return v ? hex8(v) : '0';
    case 'ease': case 'dir': case 'fw': return ENUMS[p.type][v | 0] || ENUMS[p.type][0];
    case 'text': return pawnStr(v || ctx.text);
    default: return pawnStr(v);
  }
}

// The TextDrawFX call of a TextDraw. text = the text of the TextDraw (textDrawNative), refVar(uid) = variable of another TextDraw.
export function tdfxPawn(td, varName, text, refVar = () => null) {
  const fx = td.fx, e = TDFX_BY_ID[fx?.type];
  if (!e || !tdfxActive(td)) return '';
  const player = Boolean(td.isPlayer);
  const args = player ? ['playerid'] : [];
  const ctx = { text };
  if (e.id === 'letterbox') {
    const bottom = refVar(fx.bottomBarTD);
    args.push(varName, bottom || (player ? 'PlayerText:INVALID_TEXT_DRAW' : 'Text:INVALID_TEXT_DRAW'));
  } else {
    args.push(varName);
  }
  if (e.id === 'blink') {
    // Only what is not the default; the text and the original colour make it work on SA-MP 0.3.7 too
    args.push(String(fx.interval), String(fx.duration));
    const perChar = fx.perChar && (td.font ?? 1) <= 3;
    if (perChar || fx.colour || fx.loop) {
      args.push(perChar ? 'true' : 'false', fx.colour ? hex8(fx.colour) : '0', perChar ? pawnStr(text) : '""');
      if (fx.colour || fx.loop) args.push(fx.colour ? hex8((td.font ?? 1) === 5 ? (td.useBox ? (td.boxColor ?? 0x00000060) : 0) : (td.color ?? 0xFFFFFFFF)) : '0');
      if (fx.loop) args.push('true');
    }
  } else {
    for (const p of e.params) if (p.type !== 'td') args.push(pawnValue(p, fx[p.k], ctx));
    for (const p of e.named || []) if (fx[p.k] !== defOf(p, td)) args.push(`.${p.k} = ${pawnValue(p, fx[p.k], ctx)}`);
  }
  return `${player ? e.fn : e.gfn}(${args.join(', ')});`;
}

// Import: a call of the include read from a Pawn file. a = positional arguments, named = .name = value (lower case).
// Returns { varArg, refArg, fx } or null; the caller finds the TextDraw by the variable.
export function tdfxFromCall(fn, a, named, helpers) {
  const hit = BY_FN.get(fn);
  if (!hit) return null;
  const { e, player } = hit;
  const { num, int, unquote, color } = helpers;
  let i = player ? 1 : 0;
  const varArg = a[i++];
  let refArg = null;
  if (e.id === 'letterbox') refArg = a[i++];
  const data = { type: e.id };
  const read = (p, raw) => {
    if (raw === undefined) return undefined;
    const s = String(raw).trim();
    switch (p.type) {
      case 'int': return int(s, undefined);
      case 'float': return num(s, undefined);
      case 'bool': return /^(true|1)$/i.test(s);
      case 'color': return color(s);
      case 'ease': case 'dir': case 'fw': { const k = ENUMS[p.type].indexOf(s.toUpperCase()); return k >= 0 ? k : int(s, undefined); }
      default: return unquote(s);
    }
  };
  for (const p of e.params) {
    if (p.type === 'td') continue;
    if (e.id === 'blink' && p.k === 'loop') i += 2; // text and baseColour come before loop
    data[p.k] = read(p, named[p.k.toLowerCase()] ?? a[i]);
    i++;
  }
  for (const p of e.named || []) data[p.k] = read(p, named[p.k.toLowerCase()]);
  if (e.id === 'blink') data.perChar = Boolean(data.perChar);
  return { player, varArg, refArg, data };
}

// Line of the test server map file: DF|TextDraw number|effect number|number of the other TextDraw (-1)|parameters...|text
// (the text goes last because it may have a |)
export function tdfxMapLine(td, tdIdx, text, refIdx = () => -1) {
  const fx = td.fx, e = TDFX_BY_ID[fx?.type];
  if (!e || !tdfxActive(td)) return '';
  const signed = (v) => (Number(v) | 0);
  const out = [];
  let longText = null;
  for (const p of tdfxParams(e)) {
    const v = fx[p.k];
    switch (p.type) {
      case 'td': break;
      case 'text': longText = String(v || text); break;
      case 'tag': out.push(String(v ?? '').replace(/[|\r\n]/g, ' ') || '_'); break;
      case 'bool': out.push(v ? 1 : 0); break;
      case 'color': out.push(signed(v)); break;
      case 'float': out.push((+v || 0).toFixed(4)); break;
      default: out.push(v | 0);
    }
  }
  if (e.id === 'blink') longText = text;
  const ref = e.id === 'letterbox' ? refIdx(fx.bottomBarTD) : -1;
  return ['DF', tdIdx, TDFX_EFFECTS.indexOf(e), ref, ...out, ...(longText !== null ? [longText] : [])].join('|');
}

// ---------- Preview ----------

// Character widths of the include (TDFX_FontWidths), used to lay out the letters of the effects that split the text
const FONT_WIDTHS = [
  [12, 13, 13, 28, 28, 28, 28, 8, 17, 17, 30, 28, 28, 12, 9, 21, 28, 14, 28, 28, 28, 28, 28, 28, 28, 28, 13, 13, 30, 30, 30, 30, 10, 25, 23, 21, 24, 22, 20, 24, 24, 17, 20, 22, 20, 30, 27, 27, 26, 26, 24, 23, 24, 31, 23, 31, 24, 23, 21, 28, 33, 33, 14, 28, 10, 11, 12, 9, 11, 10, 10, 12, 12, 7, 7, 13, 5, 18, 12, 10, 12, 11, 10, 12, 8, 13, 13, 18, 17, 13, 12, 30, 30, 37, 35],
  [15, 9, 17, 27, 20, 34, 23, 12, 12, 12, 21, 20, 12, 14, 12, 15, 23, 15, 21, 21, 21, 21, 21, 21, 20, 21, 12, 12, 24, 24, 24, 19, 10, 22, 19, 19, 22, 16, 19, 24, 22, 11, 16, 21, 15, 28, 24, 27, 20, 25, 19, 19, 18, 23, 23, 31, 23, 19, 21, 21, 13, 35, 11, 21, 10, 19, 20, 14, 20, 19, 13, 20, 19, 9, 9, 19, 9, 29, 19, 21, 19, 19, 15, 15, 14, 18, 19, 27, 20, 20, 17, 21, 17, 20, 15],
  [12, 13, 13, 28, 28, 28, 28, 8, 17, 17, 30, 28, 28, 12, 9, 21, 27, 16, 27, 27, 27, 27, 27, 27, 27, 27, 13, 13, 30, 30, 30, 30, 10, 29, 26, 25, 28, 26, 25, 27, 28, 12, 24, 25, 24, 30, 27, 29, 26, 26, 25, 26, 25, 26, 28, 32, 27, 26, 26, 28, 33, 33, 14, 28, 10, 29, 26, 25, 28, 26, 25, 27, 28, 12, 24, 25, 24, 30, 27, 29, 26, 26, 25, 26, 25, 26, 28, 32, 27, 26, 26, 30, 30, 37, 35],
  [15, 9, 17, 27, 20, 34, 23, 12, 12, 12, 21, 20, 12, 14, 12, 15, 20, 18, 19, 19, 21, 19, 19, 19, 19, 19, 12, 12, 24, 24, 24, 19, 10, 19, 19, 19, 20, 19, 16, 19, 19, 9, 19, 20, 14, 29, 19, 19, 19, 19, 19, 19, 21, 19, 20, 32, 21, 19, 19, 21, 13, 35, 11, 21, 10, 19, 19, 19, 20, 19, 16, 19, 19, 9, 19, 20, 14, 29, 19, 19, 19, 19, 19, 19, 21, 19, 20, 32, 21, 19, 19, 21, 17, 20, 15],
];
function charWidth(ch, font, lsX, outline) {
  const f = font >= 0 && font <= 3 ? font : 1;
  const idx = ch.charCodeAt(0) - 32;
  return ((idx >= 0 && idx < 95 ? FONT_WIDTHS[f][idx] : 22) + outline) * lsX;
}
// Width of a text the way _TDFX_MeasureStringWidth does it: ~~ is a tilde, ~n~ starts a line, other tags are skipped
function measureWidth(text, font, lsX, outline) {
  if (lsX <= 0) lsX = 0.40;
  if (font < 0 || font > 3) font = 1;
  let total = 0, max = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '~') {
      if (text[i + 1] === '~') { total += charWidth('~', font, lsX, outline); i++; continue; }
      if (text[i + 1] === 'n' && text[i + 2] === '~') { max = Math.max(max, total); total = 0; i += 2; continue; }
      const close = text.indexOf('~', i + 1);
      if (close !== -1) { i = close; continue; }
    }
    total += charWidth(text[i], font, lsX, outline);
  }
  return Math.max(max, total);
}
// How far the TextDraw reaches from its position (_TDFX_GetPlayerTDDimensions): the bounce keeps all of it inside
function tdDims(td, curX, text) {
  const font = td.font ?? 1;
  let align = td.align ?? td.alignment ?? 1;
  if (align < 1 || align > 3) align = 1;
  let lsX = Number(td.letterSizeX ?? 0.48), lsY = Number(td.letterSizeY ?? 1.6);
  if (lsX <= 0) lsX = 0.40;
  if (lsY <= 0) lsY = 1.60;
  const szX = Number(td.textSizeX) || 0, szY = Number(td.textSizeY) || 0, outline = Number(td.outline ?? 0) | 0;
  const side = (w) => (align === 2 ? { l: w / 2, r: w / 2 } : align === 3 ? { l: w, r: 0 } : { l: 0, r: w });
  if (font === 4 || font === 5) return { l: 0, r: szX > 0 ? szX : 32, t: 0, b: szY > 0 ? szY : 32 };
  if (td.useBox && (szX > 0 || szY > 0)) {
    const h = align === 2 ? (szX > 0 ? szX : lsY * 9.5) : (szY > 0 ? szY : lsY * 9.5);
    const w = align === 2 ? (szY > 0 ? szY : lsX * 100) : szX > 0 ? Math.abs(align === 3 ? curX - szX : szX - curX) : lsX * 100;
    return { ...side(w), t: 0, b: h };
  }
  const w = text ? measureWidth(text, font, lsX, outline) : 12 * 20 * lsX;
  return { ...side(w), t: outline, b: lsY * 9.5 + outline };
}
// _TDFX_ParseGlyphs: every visible character with the colour tag that is active on it (at most `max`)
function parseGlyphs(text, max = 32) {
  const out = [];
  let tag = '';
  for (let i = 0; i < text.length && out.length < max;) {
    if (text[i] === '~') { const n = skipTag(text, i); if (n - i < 16) tag = text.slice(i, n); i = n; continue; }
    out.push({ ch: text[i], tag });
    i++;
  }
  return out;
}
const visibleGlyphs = (s) => { let i = 0, n = 0; while (i < s.length) { if (s[i] === '~') { i = skipTag(s, i); continue; } i++; n++; } return n; };
// The colour sweep of Shimmer, WaveSweep and Scanner: each visible character takes the tag pick(index) gives (or the
// tag of the text on it), and a tag is written only when it changes, exactly like the include builds the string
function tagSweep(s, firstTag, pick) {
  let out = '', cur = firstTag, last = null, vis = 0;
  for (let i = 0; i < s.length;) {
    if (s[i] === '~') { const n = skipTag(s, i); cur = s.slice(i, n); i = n; continue; }
    const need = pick(vis) ?? cur;
    if (need !== last && need !== '') out += need;
    if (need !== last) last = need;
    out += s[i]; vis++; i++;
  }
  return out;
}
function layoutChars(text, font, lsX, anchorX, spacing, align, outline) {
  const out = [];
  if (spacing > 0) {
    const start = align === 1 ? anchorX : align === 3 ? anchorX - text.length * spacing : anchorX - text.length * spacing / 2;
    for (let p = 0; p < text.length; p++) out.push(start + p * spacing + spacing / 2);
    return out;
  }
  let total = 0;
  for (const ch of text) total += charWidth(ch, font, lsX, outline);
  let x = align === 1 ? anchorX : align === 3 ? anchorX - total : anchorX - total / 2;
  for (const ch of text) { const w = charWidth(ch, font, lsX, outline); out.push(x + w / 2); x += w; }
  return out;
}

export function tdfxEase(t, e) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  switch (e) {
    case 1: return t * t;
    case 2: return t * (2 - t);
    case 3: return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case 4:
      if (t < 1 / 2.75) return 7.5625 * t * t;
      if (t < 2 / 2.75) { t -= 1.5 / 2.75; return 7.5625 * t * t + 0.75; }
      if (t < 2.5 / 2.75) { t -= 2.25 / 2.75; return 7.5625 * t * t + 0.9375; }
      t -= 2.625 / 2.75; return 7.5625 * t * t + 0.984375;
  }
  return t;
}
function lerpColor(c1, c2, t) {
  c1 >>>= 0; c2 >>>= 0;
  if (t <= 0) return c1;
  if (t >= 1) return c2;
  const ch = (c, s) => (c >>> s) & 0xFF;
  const m = (s) => (ch(c1, s) + Math.round((ch(c2, s) - ch(c1, s)) * t)) & 0xFF;
  return ((m(24) << 24) | (m(16) << 16) | (m(8) << 8) | m(0)) >>> 0;
}
const withAlpha = (c, a) => (((Number(c) >>> 0) & 0xFFFFFF00) | (a & 0xFF)) >>> 0;
// Deterministic random numbers (the same frame always draws the same thing)
function rnd(seed, i) {
  let h = (Math.imul(seed | 0, 0x9E3779B1) ^ Math.imul((i | 0) + 0x632BE5AB, 0x85EBCA77)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x2C1B3C6D) >>> 0;
  h = Math.imul(h ^ (h >>> 12), 0x297A2D39) >>> 0;
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
}
const rint = (seed, i, n) => Math.floor(rnd(seed, i) * n);
const sinD = (d) => Math.sin(d * Math.PI / 180), cosD = (d) => Math.cos(d * Math.PI / 180);

function skipTag(s, i) {
  let j = i + 1;
  while (j < s.length && s[j] !== '~') j++;
  if (s[j] !== '~') return j;
  const key = j === i + 2 && (s[i + 1] === 'k' || s[i + 1] === 'K');
  j++;
  if (key && s[j] === '~') { j++; while (j < s.length && s[j] !== '~') j++; if (s[j] === '~') j++; }
  return j;
}
function countChars(s) { let i = 0, n = 0; while (i < s.length) { if (s[i] === '~') { i = skipTag(s, i); continue; } if (s[i] !== ' ' && s[i] !== '_') n++; i++; } return n; }
function cutChars(s, chars) { if (chars <= 0) return 0; let i = 0, n = 0; while (i < s.length) { if (s[i] === '~') { i = skipTag(s, i); continue; } if (s[i] === ' ' || s[i] === '_') { i++; continue; } i++; n++; if (n === chars) return i; } return i; }
function formatNumber(v, prefix, suffix, sep) {
  let s = String(Math.abs(v));
  if (sep) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${prefix}${v < 0 ? '-' : ''}${s}${suffix}`;
}
const DVD = [0xFF3333FF, 0x33FF33FF, 0x3388FFFF, 0xFFFF33FF, 0xFF33FFFF, 0x33FFFFFF, 0xFF8833FF, 0xAA33FFFF];
const FW_PALETTE = [0xF1C40FFF, 0xE74C3CFF, 0xE67E22FF, 0x00FFFFFF, 0x9B59B6FF, 0x2ECC71FF, 0xFF69B4FF, 0xFFFFFFFF];
const FW_GLYPHS = ['*', '+', '#', 'o', 'x', '^', '!', '*', '+', 'o', 'x', '*'];
const RAINBOW = ['~r~', '~y~', '~g~', '~b~', '~p~', '~w~'];

// Interval of the typewriter: with a duration it shrinks so every character fits (like the blink character by character)
function typewriterInterval(p, td) {
  const count = countChars(String(p.text || td.text || ''));
  let iv = Math.max(TDFX_MIN_INTERVAL, p.interval);
  if (p.duration > 0 && count > 0 && count * iv > p.duration) iv = Math.max(TDFX_MIN_INTERVAL, Math.floor(p.duration / count));
  return iv;
}

// How long the effect runs in the game (ms); 0 = until it is stopped
export function tdfxLength(fx, td) {
  const p = fx;
  switch (fx.type) {
    case 'pulse': return p.cycles > 0 ? p.cycles * p.interval : 0;
    case 'typewriter': {
      // Without a duration it stops one step after the last character; with one, it ends at the duration
      if (p.duration > 0) return p.duration;
      return (countChars(String(p.text || td.text || '')) + 1) * typewriterInterval(p, td);
    }
    case 'firework': return p.fuseDuration + p.explodeDuration;
    case 'slotMachine': {
      // It ends when every character is locked and the spin time is over
      const spin = p.spinDuration > 0 ? p.spinDuration : 2200, vis = visibleGlyphs(String(p.finalText || td.text || ''));
      return vis ? Math.max(spin, vis * Math.max(50, Math.floor(spin / vis))) : spin;
    }
    case 'gravityDrop': return 4000;
    case 'sonarPing': return p.pulseCount * p.pulseDuration;
    case 'electricArc': return p.surgeDuration;
    case 'splitFlap': return visibleGlyphs(String(p.targetText || td.text || '')) * (p.lockIntervalMs < 50 ? 180 : p.lockIntervalMs) + 600;
    case 'hopLetter': {
      if (p.duration > 0) return p.duration;
      const n = parseGlyphs(String(p.text || td.text || '')).length;
      return Math.max(0, n - 1) * p.staggerMs * (p.direction === 2 ? 2 : 1) + p.hopDurationMs + 100;
    }
    case 'fadeIn': case 'fadeOut': case 'fadeColor': case 'scale': case 'slide': case 'count': case 'scramble': case 'shake': case 'neon':
    case 'fill': case 'glitch': case 'pendulum': case 'vortex': case 'letterbox': case 'letterRain': case 'shockwaveSlam': case 'waveMotion':
      return Math.max(TDFX_MIN_INTERVAL, p.duration | 0);
    default: return Math.max(0, p.duration | 0);
  }
}
const loops = (fx) => Boolean(fx.loop);

// The TextDraw at this moment of the effect: { view (copy of the TextDraw, null = hidden), extras (other TextDraws drawn,
// such as sparks and letters), done }. td = the TextDraw as in the project, text = its text (textDrawNative), t = ms since start.
export function tdfxFrame(td, text, t, other = () => null) {
  const fx = td.fx, e = TDFX_BY_ID[fx.type];
  const len = tdfxLength(fx, td);
  const rawT = t;
  let done = false;
  if (len > 0 && t >= len) {
    if (loops(fx)) t %= len;
    else done = true;
  }
  const view = { ...td, text };
  const r = { view, extras: [], done };
  const frame = Math.floor(t / TDFX_FRAME);
  const prog = len > 0 ? Math.min(1, t / len) : 1;
  const font = td.font ?? 1;
  const preview = font === 5;
  const baseCol = preview ? (td.useBox ? (td.boxColor ?? 0x00000060) : 0) : (Number(td.color ?? 0xFFFFFFFF) >>> 0);
  const setCol = (c) => { if (preview) { view.useBox = 1; view.boxColor = c; } else view.color = c; };
  const p = fx;
  switch (e.id) {
    case 'blink': {
      const interval = Math.max(TDFX_MIN_INTERVAL, p.interval);
      const perChar = p.perChar && font <= 3 && countChars(text) > 0;
      if (done) return r;
      if (perChar) {
        const count = countChars(text);
        let iv = interval;
        if (p.duration > 0 && count * iv > p.duration) iv = Math.max(TDFX_MIN_INTERVAL, Math.floor(p.duration / count));
        const step = Math.floor(t / iv) % (count + 1);
        const cut = step >= count ? text.length : cutChars(text, step);
        view.text = cut > 0 ? text.slice(0, cut) : ' ';
        return r;
      }
      const lit = Math.floor(t / interval) % 2 === 0;
      if (p.colour) {
        if (lit) { setCol(p.colour); if (!preview && td.useBox) view.boxColor = p.colour; }
      } else if (!lit) r.view = null;
      return r;
    }
    case 'typewriter': {
      const s = p.text || text;
      const count = countChars(s);
      if (done || !count) { view.text = s; return r; }
      const step = Math.min(count, Math.floor(t / typewriterInterval(p, td)));
      const cut = step >= count ? s.length : cutChars(s, step);
      view.text = cut > 0 ? s.slice(0, cut) : ' ';
      return r;
    }
    case 'fadeIn': case 'fadeOut': {
      const box = Number(td.boxColor ?? 0x000000AA) >>> 0 || 0x000000AA;
      const base = baseCol || 0xFFFFFFFF;
      const inn = e.id === 'fadeIn';
      const from = inn ? withAlpha(base, 0) : base, to = inn ? withAlpha(base, p.targetAlpha) : withAlpha(base, 0);
      const fromB = inn ? withAlpha(box, 0) : box, toB = inn ? withAlpha(box, p.targetAlpha) : withAlpha(box, 0);
      if (done) {
        if (p.autoHide) { r.view = null; return r; }
        if (inn) { setCol(to); if (p.fadeBox && !preview) view.boxColor = toB; }
        return r; // the fade out puts the colours back when it does not hide
      }
      setCol(lerpColor(from, to, prog));
      if (p.fadeBox && !preview) view.boxColor = lerpColor(fromB, toB, prog);
      return r;
    }
    case 'fadeColor': {
      const f = tdfxEase(done ? 1 : prog, p.easing);
      setCol(lerpColor(p.fromColor, p.toColor, f));
      if (p.fadeBox && !preview) view.boxColor = lerpColor(p.fromBox, p.toBox, f);
      return r;
    }
    case 'scale': {
      if (done) { view.letterSizeX = p.targetSizeX; view.letterSizeY = p.targetSizeY; return r; }
      const f = tdfxEase(prog, p.easing);
      view.letterSizeX = p.startSizeX + (p.targetSizeX - p.startSizeX) * f;
      view.letterSizeY = p.startSizeY + (p.targetSizeY - p.startSizeY) * f;
      return r;
    }
    case 'pulse': {
      if (done) return r;
      const wave = p.cycles > 0 ? sinD(prog * 360 * p.cycles) : sinD((t % 1000) * 0.36);
      view.letterSizeX = (td.letterSizeX ?? 0.35) * (1 + p.amplitude * wave);
      view.letterSizeY = (td.letterSizeY ?? 1.4) * (1 + p.amplitude * wave);
      return r;
    }
    case 'slide': {
      const f = tdfxEase(done ? 1 : prog, p.easing);
      view.x = td.x + (p.targetX - td.x) * f;
      view.y = td.y + (p.targetY - td.y) * f;
      return r;
    }
    case 'count': {
      const f = tdfxEase(done ? 1 : prog, p.easing);
      view.text = formatNumber(p.startValue + Math.round((p.targetValue - p.startValue) * f), p.prefix, p.suffix, p.thousandsSep);
      return r;
    }
    case 'scramble': {
      const s = p.finalText || text;
      if (done) { view.text = s; return r; }
      const solved = Math.round(s.length * prog);
      const cs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%*&@$!';
      let out = '';
      for (let i = 0; i < s.length; i++) {
        if (s[i] === '~') { const n = skipTag(s, i); out += s.slice(i, n); i = n - 1; continue; }
        out += (s[i] === ' ' || s[i] === '_' || i < solved) ? s[i] : cs[rint(frame, i, cs.length)];
      }
      view.text = out;
      return r;
    }
    case 'bounce': case 'bounceCircle': {
      // The include moves it one step per frame; the run without an end is replayed every 2 minutes
      const ticks = Math.floor((done ? len : len > 0 && !loops(fx) ? t : rawT % 120000) / TDFX_FRAME);
      const sim = (e.id === 'bounce' ? bounceSim : bounceCircleSim)(td, p, text, ticks);
      view.x = sim.x; view.y = sim.y;
      if (sim.col) setCol(sim.col);
      return r;
    }
    case 'orbit': {
      const a = p.startAngle + p.angularSpeed * (done ? len : t) / 1000;
      view.x = p.centerX + p.radiusX * cosD(a);
      view.y = p.centerY + p.radiusY * sinD(a);
      return r;
    }
    case 'shake': {
      if (done) return r;
      const s = (1 - prog) ** 2 * p.intensity, ang = rint(frame, 1, 360), dist = rint(frame, 2, 1001) / 1000 * s;
      view.x = td.x + dist * sinD(ang); view.y = td.y + dist * cosD(ang);
      return r;
    }
    case 'neon': {
      if (done) return r;
      let alpha = 255;
      if (prog < 0.85 && rint(frame, 1, 100) < p.brokenRatio) {
        const sub = rint(frame, 2, 100);
        alpha = sub < 25 ? 30 + rint(frame, 3, 50) : sub < 55 ? 0 : sub < 80 ? 120 + rint(frame, 3, 60) : 255;
      }
      setCol(withAlpha(baseCol, alpha));
      if (!preview && td.useBox) { const b = Number(td.boxColor ?? 0) >>> 0; view.boxColor = withAlpha(b, Math.floor(alpha * (b & 0xFF) / 255)); }
      return r;
    }
    case 'waveDrift': {
      if (done) return r;
      const sp = p.speedMs < 100 ? 1500 : p.speedMs, ang = (t % sp) / sp * 360;
      view.x = td.x + p.amplitudeX * sinD(ang); view.y = td.y + p.amplitudeY * cosD(ang);
      return r;
    }
    case 'fill': {
      const f = tdfxEase(done ? 1 : prog, p.easing), w = p.startWidth + (p.targetWidth - p.startWidth) * f;
      // Default line value: aligned left or right the TextSize Y (12 without one), centred the TextSize X (20 without one)
      const centred = (td.align ?? td.alignment ?? 1) === 2;
      const h = p.lineHeight > 0 ? p.lineHeight : centred ? (td.textSizeX || 20) : (td.textSizeY || 12);
      if ((td.align ?? td.alignment ?? 1) === 2) { view.textSizeX = h; view.textSizeY = w; } else { view.textSizeX = w; view.textSizeY = h; }
      view.useBox = 1; // the include turns the box on
      return r;
    }
    case 'firework': return fireworkFrame(r, td, p, t, frame, done, baseCol, setCol);
    case 'glitch': {
      // Only the frames that dim the text (35%) change characters; tags and spaces are kept
      const s = p.text || text;
      if (done) { view.text = s; return r; }
      const buf = s.split('');
      let alpha = 255;
      if (rint(frame, 1, 100) < 35 && s.length > 0) {
        alpha = 180 + rint(frame, 2, 76);
        const gc = '!@#$%^&*<>[]{}01/+=?';
        for (let g = 0; g < Math.max(1, Math.min(5, p.intensity)); g++) {
          const idx = rint(frame, 10 + g, s.length);
          let j = 0, inTag = false;
          while (j <= idx && j < s.length) { if (s[j] === '~') { const n = skipTag(s, j); if (idx >= j && idx < n) { inTag = true; break; } j = n; continue; } j++; }
          if (!inTag && buf[idx] !== ' ' && buf[idx] !== '_') buf[idx] = gc[rint(frame, 30 + g, gc.length)];
        }
      }
      view.text = buf.join(''); setCol(withAlpha(baseCol, alpha));
      return r;
    }
    case 'spin3D': {
      const s = (done ? len : Math.floor(t / TDFX_FRAME) * TDFX_FRAME + TDFX_FRAME) / 1000;
      const wrap = (v) => ((v % 360) + 360) % 360;
      view.previewRotX = wrap((td.previewRotX ?? -16) + p.speedX * s);
      view.previewRotY = wrap((td.previewRotY ?? 0) + p.speedY * s);
      view.previewRotZ = wrap((td.previewRotZ ?? -55) + p.speedZ * s);
      view.previewZoom = p.zoom;
      return r;
    }
    case 'hover3D': {
      if (done) return r;
      const sp = p.speedMs > 0 ? p.speedMs : 2000, th = (t % sp) / sp * 360;
      view.previewRotX = (td.previewRotX ?? -16) + p.tiltX * sinD(th);
      view.previewRotZ = (td.previewRotZ ?? -55) + p.tiltZ * cosD(th);
      view.previewZoom = (td.previewZoom || 1) + p.zoomAmp * sinD(th);
      return r;
    }
    case 'shimmer': {
      // Visible characters (spaces too) count; the three around the light take its tag, the others keep their own colour
      const s = p.text || text;
      if (done && !loops(fx)) t = Math.max(0, len - 1);
      const sweep = Math.max(300, p.sweepDuration), cyc = t % (sweep + Math.max(0, p.pauseDuration)), vis = visibleGlyphs(s);
      const h = cyc < sweep && vis > 0 ? Math.round(cyc / sweep * (vis + 2)) - 1 : -1;
      view.text = tagSweep(s, p.baseTag, (i) => (h >= 0 && i >= h - 1 && i <= h + 1 ? p.shimmerTag : null));
      return r;
    }
    case 'rainbow': {
      // The tags of the text are dropped; every visible character (spaces count) gets the colour of its place
      const s = p.text || text;
      if (done && !loops(fx)) t = Math.max(0, len - 1);
      const ph = Math.floor(t / Math.max(35, p.speedMs)) % 6;
      let out = '', vis = 0;
      for (let i = 0; i < s.length;) {
        if (s[i] === '~') { i = skipTag(s, i); continue; }
        out += s[i] === ' ' ? ' ' : RAINBOW[(vis + ph) % 6] + s[i];
        vis++; i++;
      }
      view.text = out;
      return r;
    }
    case 'slotMachine': {
      // Each visible character locks at its turn (spin time / characters, at least 50 ms); tags stay in place
      const s = p.finalText || text, vis = visibleGlyphs(s);
      if (done || !vis) { view.text = s; return r; }
      const col = Math.max(50, Math.floor((p.spinDuration > 0 ? p.spinDuration : 2200) / vis)), locked = Math.min(vis, Math.floor(t / col));
      const g = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#*?@!';
      let out = '', v = 0;
      for (let i = 0; i < s.length;) {
        if (s[i] === '~') { const n = skipTag(s, i); out += s.slice(i, n); i = n; continue; }
        out += v < locked ? s[i] : s[i] === ' ' ? ' ' : g[rint(frame, v, g.length)];
        v++; i++;
      }
      view.text = out;
      return r;
    }
    case 'pendulum': {
      // At the end it rests under the pivot
      if (done) { view.x = p.pivotX; view.y = p.pivotY + p.armLength; return r; }
      const s = t / 1000, th = p.maxAngle * Math.exp(-p.damping * s) * cosD(4.5 * s * 57.2958);
      view.x = p.pivotX + p.armLength * sinD(th); view.y = p.pivotY + p.armLength * cosD(th);
      return r;
    }
    case 'gravityDrop': {
      let y = p.startY, v = 0, hits = 0;
      const n = done ? 100 : frame;
      for (let i = 0; i <= n; i++) {
        v += 1.15; y += v;
        if (y >= p.targetY) {
          y = p.targetY; v = -v * p.elasticity; hits++;
          if (Math.abs(v) < 0.6 || hits >= 4) { r.done = true; break; }
        }
      }
      view.y = y;
      return r;
    }
    case 'vortex': {
      if (done) { r.view = null; return r; }
      const rad = p.startRadius * (1 - prog * prog), th = p.spins * 360 * prog;
      view.x = p.centerX + rad * cosD(th); view.y = p.centerY + rad * sinD(th);
      view.letterSizeX = (td.letterSizeX ?? 0.35) * (1 - prog); view.letterSizeY = (td.letterSizeY ?? 1.4) * (1 - prog);
      return r;
    }
    case 'letterbox': {
      let f = tdfxEase(done ? 1 : prog, p.easing);
      if (p.reverse) f = 1 - f;
      const h = p.barHeight;
      view.x = 0; view.y = -(h + 15) + (h + 15) * f; view.useBox = 1; // the include turns the box of both bars on
      view.letterSizeY = letterboxTopSize(h);
      const bottom = other(p.bottomBarTD);
      if (bottom) r.moved = { [bottom.uid]: { x: 0, y: 480 - (h + 35.8) * f, letterSizeY: letterboxBottomSize(h), hidden: done && p.reverse } };
      if (done && p.reverse) r.view = null;
      return r;
    }
    case 'sonarPing': {
      if (done) { r.view = null; return r; }
      const pd = p.pulseDuration > 0 ? p.pulseDuration : 1200, pp = (t % pd) / pd;
      setCol(withAlpha(baseCol, Math.round(255 * (1 - pp * 0.85))));
      view.letterSizeX = (td.letterSizeX ?? 0.35) * (1 + 0.35 * pp); view.letterSizeY = (td.letterSizeY ?? 1.4) * (1 + 0.35 * pp);
      return r;
    }
    case 'waveSweep': {
      const s = p.text || text, vis = visibleGlyphs(s);
      if (!vis) return r;
      const cw = Math.max(1, Math.round(p.crestWidth)), half = Math.floor(cw / 2), cyc = Math.floor(t / Math.max(25, p.speedMs));
      let center;
      if (p.direction === 0) center = (cyc % (vis + cw)) - half;
      else if (p.direction === 1) center = vis - (cyc % (vis + cw)) + half;
      else { const b = Math.max(1, (vis - 1) * 2), bp = cyc % b; center = bp >= vis ? b - bp : bp; }
      view.text = tagSweep(s, p.baseTag, (i) => (Math.abs(i - center) <= half ? p.crestTag : null));
      return r;
    }
    case 'scannerSweep': {
      const s = p.text || text, vis = visibleGlyphs(s);
      if (!vis) return r;
      const b = Math.max(1, (vis - 1) * 2), bp = Math.floor(t / Math.max(25, p.speedMs)) % b, li = bp >= vis ? b - bp : bp;
      view.text = tagSweep(s, '~w~', (i) => { const d = Math.abs(i - li); return d === 0 ? p.laserTag : d === 1 ? p.trailTag : null; });
      return r;
    }
    case 'electricArc': {
      const s = p.text || text;
      if (done) { view.text = s; return r; }
      const decay = Math.max(0, 1 - t / len);
      view.x = td.x + (rint(frame, 1, 21) - 10) / 10 * 2.2 * decay;
      view.y = td.y + (rint(frame, 2, 17) - 8) / 10 * 1.6 * decay;
      const spark = rint(frame, 3, 4);
      view.text = decay > 0.15 && spark === 0 ? `~b~>> ${s} ~b~<<` : decay > 0.15 && spark === 1 ? `~y~** ${s} ~y~**` : s;
      return r;
    }
    case 'splitFlap': {
      // Letters lock one by one; the rolling letters only change when the next one locks (the include sets the string then)
      const s = p.targetText || text;
      if (done) { view.text = s; return r; }
      const li = p.lockIntervalMs < 50 ? 180 : p.lockIntervalMs, step = Math.floor(t / li), fc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?$#*';
      const tt = step * li;
      let out = '', v = 0;
      for (let i = 0; i < s.length;) {
        if (s[i] === '~') { const n = skipTag(s, i); out += s.slice(i, n); i = n; continue; }
        out += tt >= (v + 1) * li ? s[i] : s[i] === ' ' ? ' ' : fc[rint(step, v, fc.length)];
        v++; i++;
      }
      view.text = out;
      return r;
    }
    case 'hologram': {
      if (done && !loops(fx)) t = Math.max(0, len - 1);
      const a = Math.max(40, Math.min(255, Math.round(175 + 80 * sinD(t * 0.22))));
      view.color = withAlpha(0x00FFFFFF, a);
      if (rint(frame, 1, 6) === 0) view.y = td.y + (rint(frame, 2, 3) - 1) * 0.7;
      return r;
    }
    case 'shockwaveSlam': return shockFrame(r, td, p, t, frame, done, len);
    case 'letterRain': case 'waveMotion': case 'hopLetter': return lettersFrame(r, td, p, e.id, t, done, len, text);
  }
  return r;
}

// BouncePlayerTextDraw: the limits shrink by the size of the TextDraw, the start is put inside them, the speeds get a
// random sign and +-10%, and every wall changes the other speed a little (kept between 1.2 and 4); corners turn both
function bounceSim(td, p, text, ticks) {
  const d = tdDims(td, td.x, text);
  let minX = p.minX + d.l, maxX = p.maxX - d.r, minY = p.minY + d.t, maxY = p.maxY - d.b;
  if (minX > maxX) minX = maxX = (p.minX + p.maxX) / 2;
  if (minY > maxY) minY = maxY = (p.minY + p.maxY) / 2;
  let x = Math.max(minX, Math.min(maxX, td.x)), y = Math.max(minY, Math.min(maxY, td.y));
  let vx = (rint(11, 1, 2) ? p.speedX : -p.speedX) * (0.90 + rint(11, 3, 21) / 100);
  let vy = (rint(11, 2, 2) ? p.speedY : -p.speedY) * (0.90 + rint(11, 4, 21) / 100);
  let col = null;
  const jit = (v, i) => { v *= 0.94 + rint(12, i, 13) / 100; return Math.abs(v) < 1 ? (v < 0 ? -1.2 : 1.2) : Math.abs(v) > 4.5 ? (v < 0 ? -4 : 4) : v; };
  for (let i = 0; i < ticks; i++) {
    let cx = x + vx, cy = y + vy, hit = false;
    const tol = (Math.abs(vx) + Math.abs(vy)) * 1.5;
    const nearX = cx <= minX + tol || cx >= maxX - tol, nearY = cy <= minY + tol || cy >= maxY - tol;
    if (nearX && nearY && (cx <= minX || cx >= maxX || cy <= minY || cy >= maxY)) {
      cx = cx <= minX ? minX : cx >= maxX ? maxX : cx;
      cy = cy <= minY ? minY : cy >= maxY ? maxY : cy;
      vx = -vx; vy = -vy; hit = true;
    } else {
      if (cx <= minX || cx >= maxX) { cx = cx <= minX ? minX : maxX; vx = -vx; vy = jit(vy, i * 2); hit = true; }
      if (cy <= minY || cy >= maxY) { cy = cy <= minY ? minY : maxY; vy = -vy; vx = jit(vx, i * 2 + 1); hit = true; }
    }
    x = cx; y = cy;
    if (hit && p.colorShift) col = DVD[rint(13, i, DVD.length)];
  }
  return { x, y, col };
}
// BounceCirclePlayerTextDraw: the radius shrinks by the half size of the TextDraw (at least 5) and the start goes inside it
function bounceCircleSim(td, p, text, ticks) {
  const d = tdDims(td, td.x, text);
  const hw = Math.max(d.l, d.r), hh = Math.max(d.b, d.t);
  let rad = p.radius - Math.hypot(hw, hh);
  if (rad < 5) rad = p.radius > 10 ? p.radius * 0.5 : p.radius;
  let x = td.x, y = td.y;
  const cd = Math.hypot(x - p.centerX, y - p.centerY);
  if (cd > rad && cd > 0.001) { x = p.centerX + (x - p.centerX) / cd * rad; y = p.centerY + (y - p.centerY) / cd * rad; }
  else if (cd < 0.001) { x = p.centerX + rad * 0.40; y = p.centerY - rad * 0.25; }
  let vx = p.speed * cosD(p.angle), vy = p.speed * sinD(p.angle), col = null;
  for (let i = 0; i < ticks; i++) {
    x += vx; y += vy;
    const dx = x - p.centerX, dy = y - p.centerY, dist = Math.hypot(dx, dy);
    if (dist >= rad && dist > 0.0001) {
      const nx = dx / dist, ny = dy / dist, dot = vx * nx + vy * ny;
      if (dot > 0) {
        let wx = vx - 2 * dot * nx, wy = vy - 2 * dot * ny;
        const sp = Math.hypot(wx, wy);
        if (dot >= sp * 0.85) {
          wx += -ny * sp * 0.4; wy += nx * sp * 0.4;
          const ns = Math.hypot(wx, wy);
          if (ns > 0.001) { wx = wx / ns * sp; wy = wy / ns * sp; }
        }
        vx = wx; vy = wy;
        x = p.centerX + nx * (rad - 0.5); y = p.centerY + ny * (rad - 0.5);
        if (p.colorShift) col = DVD[rint(13, i, DVD.length)];
      }
    }
  }
  return { x, y, col };
}

function fireworkFrame(r, td, p, t, frame, done, baseCol, setCol) {
  const { view } = r;
  if (t < p.fuseDuration && !done) {
    const fp = t / p.fuseDuration, inten = p.shakeIntensity * (0.25 + 0.75 * fp * fp);
    view.x = td.x + (rint(frame, 1, 200) - 100) / 100 * inten;
    view.y = td.y + (rint(frame, 2, 200) - 100) / 100 * inten;
    setCol(Math.floor(t / 60) % 2 === 0 ? (fp > 0.6 ? 0xFFFFFFFF : 0xE74C3CFF) : baseCol);
    return r;
  }
  r.view = null; // the TextDraw stays hidden after the explosion
  if (done) return r;
  const expT = t - p.fuseDuration, explode = Math.max(1, p.explodeDuration), ep = Math.min(1, expT / explode);
  const steps = Math.floor(expT / TDFX_FRAME), count = Math.max(1, Math.min(12, p.particleCount)), alpha = Math.round(255 * (1 - ep));
  for (let k = 0; k < count; k++) {
    const spd = p.burstSpeed * (0.8 + rint(7, k, 40) / 100);
    let ang, vx, vy;
    switch (p.pattern) {
      case 1: ang = -135 + 90 / Math.max(1, count - 1) * k + rint(8, k, 10) - 5; vx = spd * cosD(ang); vy = spd * sinD(ang) - 2; break;
      case 2: ang = -90 + (k - count / 2) * 8 + rint(8, k, 6) - 3; vx = spd * 0.45 * cosD(ang); vy = -spd * (1.3 + (k % 3) * 0.2); break;
      case 3: ang = k % 2 === 0 ? rint(8, k, 40) - 20 : 180 + rint(8, k, 40) - 20; vx = spd * 1.35 * cosD(ang); vy = spd * 0.35 * sinD(ang); break;
      case 4: ang = -110 + 40 / Math.max(1, count - 1) * k + rint(8, k, 10) - 5; vx = spd * 0.7 * cosD(ang); vy = -spd * (1.3 + rint(9, k, 40) / 100); break;
      default: ang = 360 / count * k + rint(8, k, 24) - 12; vx = spd * cosD(ang); vy = spd * sinD(ang) - 2.5;
    }
    let x = td.x, y = td.y;
    for (let i = 0; i < steps; i++) { vy += 0.22; vx *= 0.96; vy *= 0.96; x += vx; y += vy; }
    r.extras.push(spark(x, y, FW_GLYPHS[k], withAlpha(FW_PALETTE[k % FW_PALETTE.length], alpha), 0.4, 1.6, 1));
  }
  return r;
}

function spark(x, y, text, color, lx, ly, outline) {
  return { x, y, text, font: 2, align: 2, alignment: 2, letterSizeX: lx, letterSizeY: ly, color, outline, shadow: 0, backgroundColor: 0x000000FF, useBox: 0, proportional: 1, textSizeX: 640, textSizeY: 480 };
}

function shockFrame(r, td, p, t, frame, done, len) {
  const { view } = r;
  const lx = td.letterSizeX ?? 0.35, ly = td.letterSizeY ?? 1.4;
  if (done) { view.x = p.centerX; view.y = p.centerY; return r; }
  if (t < 500) {
    const f = tdfxEase(t / 500, 1);
    view.letterSizeX = lx * (2.4 - 1.4 * f); view.letterSizeY = ly * (2.4 - 1.4 * f);
    view.x = p.centerX; view.y = p.centerY - 90 + 90 * f; view.useBox = 0;
    return r;
  }
  const it = t - 500;
  view.x = p.centerX; view.y = p.centerY;
  if (it < 300) {
    const d = 1 - it / 300;
    view.x += (rint(frame, 1, 15) - 7) / 7 * 3.5 * d; view.y += (rint(frame, 2, 15) - 7) / 7 * 3.5 * d;
  }
  const pp = Math.min(1, it / Math.max(1, len - 500)), steps = Math.floor(it / TDFX_FRAME) + 1;
  for (let k = 0; k < 12; k++) {
    const a = k * 30;
    r.extras.push(spark(p.centerX + sinD(a) * 2.2 * steps, p.centerY - cosD(a) * 2.2 * steps, '*', withAlpha(0xF1C40FFF, Math.round(255 * (1 - pp))), 0.35, 1.2, 0));
  }
  return r;
}

function lettersFrame(r, td, p, id, t, done, len, text) {
  // The include splits the text into visible characters (at most 32), each one a centred TextDraw with the colour tag
  // active on it, the font, letter size, colour and outline of the original; the original is hidden, or keeps only its
  // box (text " ") when it has one. At the end the original comes back with its text.
  const src = String(p.text || text);
  if (done) { r.view.text = src; return r; }
  const glyphs = parseGlyphs(src, 32), n = glyphs.length;
  if (td.useBox) { r.view.text = ' '; r.view.color = withAlpha(td.color ?? 0xFFFFFFFF, 0); } else r.view = null;
  const font = td.font ?? 1, lsX = td.letterSizeX > 0 ? td.letterSizeX : 0.45, align = td.align ?? td.alignment ?? 2;
  const anchorX = id === 'letterRain' ? p.targetX : p.centerX, baseY = id === 'letterRain' ? p.targetY : p.centerY;
  const outline = Number(td.outline ?? 0) | 0;
  const xs = layoutChars(glyphs.map(g => g.ch).join(''), font, lsX, anchorX, id === 'letterRain' ? p.letterSpacing : 0, align, outline);
  const hopMs = p.hopDurationMs > 0 ? p.hopDurationMs : 350, stag = p.staggerMs > 0 ? p.staggerMs : 90;
  for (let k = 0; k < n; k++) {
    let y = baseY;
    if (id === 'letterRain') {
      const delay = k * 80 + rint(5, k, 60);
      if (t < delay) continue; // still waiting above the screen (at Y -25, hidden by the top)
      y = -25 + (baseY + 25) * tdfxEase(Math.min(1, (t - delay) / 750), 4);
    } else if (id === 'waveMotion') {
      const prog = Math.min(1, t / len), cw = p.crestWidth, min = -cw, max = n - 1 + cw;
      const crest = p.direction === 0 ? min + (max - min) * prog : p.direction === 1 ? max - (max - min) * prog
        : min + (max - min) * (prog < 0.5 ? prog * 2 : (1 - prog) * 2);
      const d = Math.abs(k - crest);
      if (d < cw) { const c = cosD(d / cw * 90); y -= p.crestHeight * c * c; }
    } else {
      // Letter k starts at its turn (from the left, from the right, or there and back again)
      let he = -1;
      if (p.direction === 2) {
        const fwd = k * stag, bwd = (n - 1) * stag + (n - 1 - k) * stag;
        if (t >= fwd && t < fwd + hopMs) he = t - fwd; else if (t >= bwd && t < bwd + hopMs) he = t - bwd;
      } else {
        const start = (p.direction === 0 ? k : n - 1 - k) * p.staggerMs;
        if (t >= start && t < start + hopMs) he = t - start;
      }
      if (he >= 0) {
        const u = he / hopMs;
        if (u <= 0.8) { const u1 = u / 0.8; y -= p.hopHeight * 4 * u1 * (1 - u1); } else { const u2 = (u - 0.8) / 0.2; y -= p.hopHeight * 0.8 * u2 * (1 - u2); }
      }
    }
    r.extras.push({ ...td, text: glyphs[k].tag + glyphs[k].ch, x: xs[k], y, align: 2, alignment: 2, useBox: 0, fx: null });
  }
  return r;
}
