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
  ['Ruas e estradas', /(hydrant|parkingmeter|parking_?meter|manhole|drain_?cover|bus_?stop|busstop|tramstop|phonebooth|postbox|mailbox|news_?stand|newsvend)/],
  ['Efeitos e partículas', /(^|_)(fire|smoke|explosion|flame|spark|particle|blood|steam)s?(_|\d|$)|_fx(_|\d|$)/],
  ['Armas', /(gun|rifle|pistol|shotgun|sniper|ammo|weapon|grenade|bomb|knife|sword|katana|colt|deagle|uzi|m4|ak47|rpg|minigun|chainsaw|baton|nightstick|missile)/],
  ['Portas e janelas', /(door|gate(?!way)|window|wndw|shutter|grill_?gate|garagedr|_dr\d|blind)/],
  ['Iluminação', /(light|lamp|lampost|streetlit|neon|spot_?l|flood|lantern|candle|chandelier|bulb|glow)/],
  ['Móveis', /(chair|sofa|couch|bed(?!rock)|table|desk|shelf|shelv|cabinet|wardrobe|drawer|stool|armchair|seat|dresser|cupboard|bookcase|kitchen|fridge|cooker|oven|stove|sink|toilet|bath(?!ing)|shower|basin|counter|bar_?stool|futon|mattress|matress|cushion|rug|carpet|curtain|mirror|wardrb|cj_kitch|swank|cj_bed|cj_sofa|cj_table|cj_chair|kb_)/],
  ['Eletrônicos e escritório', /(computer|(^|_)pc(_|\d|$)|monitor|laptop|keyboard|phone|(^|_)tv(_|\d|$)|television|photocopier|copier|radio|speaker|stereo|printer|fax|atm|vending|vend|arcade|jukebox|cctv|camera|console|hifi|amp\b|desk_?lamp|filing|file_?cab|whiteboard|projector)/],
  ['Comida e bebida', /(food|drink|burger|pizza|cola|soda|bottle|beer|wine|whisky|cup\b|mug|coffee|donut|hotdog|noodle|fries|plate_?food|kebab|ice_?cream|cake|bread|fruit|vegetable|bar_|liquor)/],
  ['Esportes e lazer', /(ball|basket|hoop|ramp|jump|stunt|loop|pool_?table|snooker|bowling|skate|gym|weight|bench_?press|treadmill|sport|golf|tennis|goal|trampoline|swing|slide|playground|carousel|ferris|rollercoaster|dance|disco|stage|piano|guitar|drum_?kit|parachute|chute|para_pack|paracx|parapak|para_col|skydiv)/],
  ['Praia', /(beach|surf|lifeguard|parasol|umbrella|towel|deckchair|deck_?chair|sunbed|lounger|sandcastle|(^|_)pier|jetty|boardwalk|shells|buoy|lilo)/],
  ['Vegetação', /(tree|palm|bush|plant|grass|flower|hedge|cactus|fern|weed|shrub|pine|oak|veg|leaf|leaves|ivy|vine|sm_|trunk|stump|log_|bamboo|reed|cypress|birch|elm|willow|redwood)/],
  ['Lixo e sucata', /(trash|rubbish|garbage|bin\b|_bin|dumpster|skip|junk|wreck|scrap|debris|rubble|litter|wastebin|tyre_?pile|binbag|bag_?rubbish)/],
  ['Industrial', /(crane|container|pipe|tank|drum|barrel|crate|pallet|generator|factory|refinery|cargo|silo|chimney|girder|scaffold|forklift|conveyor|pylon|transformer|substation|oil|gas_?tank|machinery|gantry|derrick|winch|toolbox|wrench|hammer|drill|extinguisher)/],
  ['Barreiras e cercas', /(fence|barrier|railing|bollard|roadblock|cone|barricade|bar_?gate|wire|chainlink|hedge_?wall|wall_?low|post\b|pole|guard_?rail|crash_?bar|kerb_?block|sandbag)/],
  ['Placas e sinalização', /(sign|billboard|bboard|noticeboard|scoreboard|arrow|plaque|poster|banner|advert|logo|traffic|sem[aá]foro|signal|marker|flag|pickup|infopoint|checkpoint|savepoint)/],
  ['Ruas e estradas', /(road|street|hway|highway|freeway|motorway|junction|roundabout|pavement|sidewalk|kerb|curb|crossing|bridge|tunnel|overpass|underpass|flyover|rail|track|tram|lane|parking|carpark|car_?park|(^|_)rd(_|\d|$)|hiway|asphalt|tarmac|ramp_?road|slip|runway|airfield)/],
  ['Água e docas', /(water|pool|dock|harbour|harbor|canal|sewer|drain|lake|river|sea|boat_?house|marina|quay|wharf|fountain)/],
  ['Terreno', /(land|ground|grnd|hill|rock|cliff|mountain|terrain|dirt|desert|dune|crater|cave|mud|gravel|valley|canyon|plateau|slope|cunte|cuntw|cunts|cuntn|ctryn|ctrye|ctrys|ctryw|country)/],
  ['Prédios e casas', /(build|bldg|bld|blok|block|tower|house|hse|home|shop|store|office|(^|_)apart|(^|_)apt(_|\d|$)|motel|hotel|hospital|church|chapel|garage|warehouse|factory|station|mall|plaza|condo|villa|mansion|(^|_)cabin|(^|_)shack|(^|_)hut(_|\d|$)|(^|_)barn|(^|_)shed(_|\d|$)|(^|_)club(_|\d|$)|(^|_)bank(_|\d|$)|school|police|fire_?st|stadium|arena|temple|cathedral|tenement|terrace|skyscr|corp|hq\b|_las\b|_lae\b|_lan\b|_law\b|_sfe\b|_sfs\b|_sfn\b|_sfw\b|_veg)/],
];

export const OBJECT_CATEGORIES = ['Kit de construção', 'Móveis', 'Prédios e casas', 'Ruas e estradas', 'Praia', 'Vegetação',
  'Iluminação', 'Portas e janelas', 'Barreiras e cercas', 'Placas e sinalização', 'Eletrônicos e escritório', 'Comida e bebida',
  'Esportes e lazer', 'Industrial', 'Lixo e sucata', 'Água e docas', 'Terreno', 'Efeitos e partículas', 'Armas', 'Veículos',
  'Actors (Personagens)', 'Interiores', 'LOD (vistos de longe)', 'Diversos'];

export function objectCategory(def) {
  if (def.type === 'cars') return 'Veículos';
  if (def.type === 'peds') return 'Actors (Personagens)';
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
