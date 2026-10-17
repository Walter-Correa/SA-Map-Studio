// Categorias amigáveis para objetos e texturas.
// O jogo não guarda categorias: elas são deduzidas pelo nome do modelo/textura,
// pelo arquivo IDE de origem e por alguns intervalos conhecidos de IDs do SA-MP.

// Peças do SA-MP feitas para receber textura (paredes, pisos, planos, concretos, cubos)
const KIT_RANGES = [[18762, 18767], [18980, 18981], [19353, 19417], [19426, 19465], [19475, 19483],
  [19529, 19552], [19603, 19604], [19789, 19791]];
export const isKitPiece = (id) => KIT_RANGES.some(([a, b]) => id >= a && id <= b);

// Regiões (filtro secundário)
export function regionOf(def) {
  const s = (def.source || '').toLowerCase();
  if (s.includes('samp')) return 'SA-MP';
  if (s.includes('custom')) return 'Personalizados';
  if (s.includes('/la/')) return 'Los Santos';
  if (s.includes('/sf/')) return 'San Fierro';
  if (s.includes('/vegas/')) return 'Las Venturas';
  if (s.includes('/country/')) return 'Interior do estado';
  if (s.includes('/interior/')) return 'Interiores';
  if (s.includes('/generic/')) return 'Genéricos';
  return 'Outros';
}
export const REGIONS = ['SA-MP', 'Los Santos', 'San Fierro', 'Las Venturas', 'Interior do estado', 'Interiores', 'Genéricos', 'Personalizados', 'Outros'];

// Regras na ordem: a primeira que bater vale
const OBJECT_RULES = [
  ['Efeitos e partículas', /(^|_)(fire|smoke|explosion|flame|spark|particle|blood|steam)s?(_|\d|$)|_fx(_|\d|$)/],
  ['Armas', /(gun|rifle|pistol|shotgun|sniper|ammo|weapon|grenade|bomb|knife|sword|katana|colt|deagle|uzi|m4|ak47|rpg|minigun|chainsaw|baton|nightstick|missile|dildo|vibe|knuckle)/],
  ['Portas e janelas', /(^|_)(door|gate(?!way)|window|wndw|shutter|grill_?gate|garagedr|blind)(s|_|\d|$)|_dr\d/],
  ['Iluminação', /(^|_)(light|lamp|lampost|streetlit|neon|spot_?l|flood|lantern|candle|chandelier|bulb|glow)(s|_|\d|$)/],
  ['Móveis', /(^|_)(chair|sofa|couch|bed(?!rock)|table|desk|shelf|shelv|cabinet|wardrobe|drawer|stool|armchair|seat|dresser|cupboard|bookcase|kitchen|fridge|cooker|oven|stove|sink|toilet|bath(?!ing)|shower|basin|counter|bar_?stool|futon|mattress|cushion|rug|carpet|curtain|mirror|wardrb)(s|_|\d|$)|^(cj_kitch|swank|cj_bed|cj_sofa|cj_table|cj_chair|kb_)/],
  ['Eletrônicos e escritório', /(^|_)(computer|pc|monitor|laptop|keyboard|phone|tv|television|photocopier|copier|radio|speaker|stereo|printer|fax|atm|vending|vend|arcade|jukebox|cctv|camera|console|hifi|desk_?lamp|whiteboard|projector)(s|_|\d|$)/],
  ['Comida e bebida', /(^|_)(food|drink|burger|pizza|cola|soda|bottle|beer|wine|whisky|cup|mug|coffee|donut|hotdog|noodle|fries|kebab|ice_?cream|cake|bread|fruit|vegetable|liquor)(s|_|\d|$)|plate_?food/],
  ['Esportes e lazer', /(^|_)(basket|foot_?ball|base_?ball|soccer_?ball|hoop|ramp|pool_?table|snooker|bowling|skate|gym|bench_?press|treadmill|golf|tennis|goal|trampoline|swing|slide|playground|carousel|ferris|rollercoaster|dance|disco|piano|guitar|drum_?kit|parachute|skydiv)(s|_|\d|$)|(stunt_?jump|stunt_?loop)/],
  ['Praia', /(^|_)(beach|surf|lifeguard|parasol|umbrella|towel|deckchair|deck_?chair|sunbed|lounger|sandcastle|pier|jetty|boardwalk|shells|buoy|lilo)(s|_|\d|$)/],
  ['Vegetação', /(^|_)(tree|palm|bush|plant|grass|flower|hedge|cactus|fern|shrub|pine|oak|leaf|leaves|ivy|bamboo|reed|cypress|birch|elm|willow|redwood|foliage)(s|_|\d|$)|(trunk|stump|log_)|(^|_)vine(?!wood)/],
  ['Lixo e sucata', /(^|_)(trash|rubbish|garbage|dumpster|skip|junk|wreck|scrap|debris|rubble|litter|wastebin|binbag)(s|_|\d|$)|_bin(s|_|\d|$)|tyre_?pile/],
  ['Industrial', /(^|_)(crane|container|pipe|drum|barrel|crate|pallet|generator|factory|refinery|cargo|silo|chimney|girder|scaffold|forklift|conveyor|pylon|transformer|substation|gas_?tank|machinery|gantry|derrick|winch|toolbox|wrench|hammer|drill|extinguisher)(s|_|\d|$)/],
  ['Barreiras e cercas', /(^|_)(fence|barrier|railing|bollard|roadblock|cone|barricade|bar_?gate|chainlink|hedge_?wall|guard_?rail|crash_?bar|sandbag)(s|_|\d|$)|wall_?low|kerb_?block/],
  ['Placas e sinalização', /(^|_)(sign|billboard|bboard|noticeboard|scoreboard|arrow|plaque|poster|banner|advert|logo|traffic|signal|marker|flag|pickup|infopoint|checkpoint|savepoint)(s|_|\d|$)|sem[aá]foro/],
  ['Ruas e estradas', /(^|_)(hydrant|parking_?meter|manhole|drain_?cover|bus_?stop|tram_?stop|phone_?booth|post_?box|mail_?box|news_?stand|newsvend|road|street|highway|freeway|motorway|junction|roundabout|pavement|sidewalk|kerb|curb|crossing|bridge|tunnel|overpass|underpass|flyover|rail|track|tram|lane|parking|car_?park|asphalt|tarmac|runway|airfield)(s|_|\d|$)|(^|_)rd(_|\d|$)|^hway|^hiway/],
  ['Água e docas', /(^|_)(water|pool|dock|harbour|harbor|canal|sewer|drain|lake|river|sea|boat_?house|marina|quay|wharf|fountain)(s|_|\d|$)/],
  ['Terreno', /(^|_)(land|ground|hill|rock|cliff|mountain|terrain|dirt|desert|dune|crater|cave|mud|gravel|valley|canyon|plateau|slope)(s|_|\d|$)/],
  ['Prédios e casas', /(^|_)(build|bldg|bld|blok|block|tower|house|hse|home|shop|store|office|apart|apt|motel|hotel|hospital|church|chapel|garage|warehouse|mall|plaza|condo|villa|mansion|cabin|shack|hut|barn|shed|club|bank|school|police|fire_?st|stadium|arena|temple|cathedral|tenement|terrace|skyscr|corp|hq)(s|_|\d|$)|(_las|_lae|_lan|_law|_sfe|_sfs|_sfn|_sfw|_veg)/],
];

import { isPickupModel } from './pickups.js';

export const OBJECT_CATEGORIES = [
  'Actors (Personagens)', 'Armas', 'Barreiras e cercas', 'Comida e bebida', 'Diversos',
  'Efeitos e partículas', 'Eletrônicos e escritório', 'Esportes e lazer', 'Iluminação',
  'Industrial', 'Interiores', 'Kit de construção', 'LOD (vistos de longe)', 'Lixo e sucata',
  'Móveis', 'Pickups', 'Placas e sinalização', 'Portas e janelas', 'Praia', 'Prédios e casas',
  'Ruas e estradas', 'Terreno', 'Vegetação', 'Veículos', 'Água e docas'
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export function objectCategory(def) {
  if (def.type === 'cars') return 'Veículos';
  if (def.type === 'peds') return 'Actors (Personagens)';
  if (isPickupModel(def.id) && def.type !== 'weap') return 'Pickups';
  if (def.type === 'weap' || (def.id >= 321 && def.id <= 373)) return 'Armas';
  if (isKitPiece(def.id)) return 'Kit de construção';
  const n = (def.model || '').toLowerCase();
  const s = (def.source || '').toLowerCase();
  if (/^lod|lod\d|_lod|lod_/.test(n)) return 'LOD (vistos de longe)';
  if (s.includes('vegepart') || s.includes('procobj')) return 'Vegetação';
  if (s.includes('barriers')) return 'Barreiras e cercas';
  for (const [cat, re] of OBJECT_RULES) if (re.test(n)) return cat;
  if (s.includes('props') || s.includes('furnit')) return 'Móveis';
  if (s.includes('/interior/')) return 'Interiores';
  if (s.includes('/country/')) return 'Terreno';
  if ((s.includes('/la/') || s.includes('/sf/') || s.includes('/vegas/')) && def.drawDist >= 150) return 'Prédios e casas';
  return 'Diversos';
}

// ---------------------------------------------------------------- texturas
const TEXTURE_RULES = [
  ['Cores e lisas', /^(white|black|red|blue|green|yellow|orange|grey|gray|pink|purple|lime|brown|cyan|samp(black|white|red|orange|blue|green|grey|yellow)|plain|blank|solid|col_)|^(black|white|grey)\d*$/],
  ['Placas e letreiros', /(sign|logo|neon|billboard|bboard|poster|advert|banner|menu|letter|text|font|graffiti|graf|sticker|decal|label|plaque|ad_)/],
  ['Vidro e janelas', /(glass|window|wind_|win_|winda|pane|mirror|wndw|shopwin|glaz)/],
  ['Portas', /(door|gate|shutter|garagedr)/],
  ['Telhados', /(roof|shingle|tiles_?roof|rooftile|eave|gutter)/],
  ['Pisos e carpetes', /(floor|carpet|carp|rug|parquet|lino|flr|mat_|tile_?floor|floortile|kitchfloor|bathfloor)/],
  ['Madeira', /(wood|plank|timber|oak|pine|bark|crate|board|log_|walnut|mahog|beech|veneer|ply)/],
  ['Metal', /(metal|steel|iron|chrome|alum|rust|corrug|mesh|grate|grill|sheet|tin|copper|brass|metl|girder|pipe)/],
  ['Ruas e estradas', /(road|asphalt|tarmac|hiway|hway|street|junction|crossing|laneline|roadmark|kerb|curb|pave|sidewalk|cobble|drive)/],
  ['Concreto e pedra', /(concrete|conc|cement|stone|rock|marble|granite|slate|plaster|stucco|render|grey_?wall|block)/],
  ['Tijolos e paredes', /(brick|bric|wall|wll|panel|wallpaper|wallpap|tilewall|walltile|cladding|siding)/],
  ['Tecidos e couro', /(fabric|cloth|leather|curtain|cushion|sofa|couch|bed|linen|velvet|wool|silk|canvas|towel)/],
  ['Natureza', /(grass|dirt|mud|sand|soil|leaf|leaves|tree|bush|cliff|gravel|moss|flower|desert|snow|forest|veg|hedge|plant|ivy|palm|weed|field|ground|grnd|rocky|beach)/],
  ['Água', /(water|pool|sea|wave|ocean|river|lake|splash|fountain|wet)/],
  ['Iluminação', /(light|lamp|glow|bulb|flare|corona)/],
  ['Veículos', /(vehicle|car_|_car|tyre|tire|wheel|bumper|engine|chassis|carpaint)/],
];

export const TEXTURE_CATEGORIES = ['Tijolos e paredes', 'Pisos e carpetes', 'Madeira', 'Metal', 'Concreto e pedra', 'Ruas e estradas',
  'Natureza', 'Vidro e janelas', 'Telhados', 'Portas', 'Tecidos e couro', 'Placas e letreiros', 'Água', 'Iluminação',
  'Cores e lisas', 'Veículos', 'Diversos'];

export function textureCategory(name, txd, w = 64, h = 64) {
  const n = (name || '').toLowerCase();
  for (const [cat, re] of TEXTURE_RULES) if (re.test(n)) return cat;
  if (w <= 16 && h <= 16) return 'Cores e lisas';
  const t = (txd || '').toLowerCase();
  for (const [cat, re] of TEXTURE_RULES) if (cat !== 'Cores e lisas' && re.test(t)) return cat;
  return 'Diversos';
}
