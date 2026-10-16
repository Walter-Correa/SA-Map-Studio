// Suporte a Actors : skins, animações e presets
// Documentação: 
//               

export const POPULAR_ANIMATIONS = [
  { label: 'Conversando (Chat)', lib: 'PED', name: 'IDLE_chat', loop: 1, freeze: 0 },
  { label: 'Braços Cruzados (Guarda)', lib: 'COP_AMBIENT', name: 'Coplook_loop', loop: 1, freeze: 0 },
  { label: 'Fumando encostado', lib: 'SMOKING', name: 'M_smklean_loop', loop: 1, freeze: 0 },
  { label: 'Sentado no chão', lib: 'BEACH', name: 'SitnWait_loop', loop: 1, freeze: 1 },
  { label: 'Deitado na praia', lib: 'BEACH', name: 'Lay_Bac_Loop', loop: 1, freeze: 1 },
  { label: 'Dançando (Dance)', lib: 'DANCING', name: 'dance_loop', loop: 1, freeze: 0 },
  { label: 'Mãos ao Alto (Rendição)', lib: 'ROB_BANK', name: 'SHP_HandsUp_Scr', loop: 0, freeze: 1 },
  { label: 'Bêbado andando', lib: 'PED', name: 'WALK_drunk', loop: 1, freeze: 0 },
  { label: 'Atendente de balcão / bar', lib: 'BAR', name: 'Barserve_loop', loop: 1, freeze: 0 },
  { label: 'Traficante esperando', lib: 'DEALER', name: 'DEALER_IDLE', loop: 1, freeze: 0 },
  { label: 'Acenando para a multidão', lib: 'ON_LOOKERS', name: 'wave_loop', loop: 1, freeze: 0 },
  { label: 'Médico reanimando (CPR)', lib: 'MEDIC', name: 'CPR', loop: 1, freeze: 0 },
  { label: 'Policial anotando no bloco', lib: 'COP_AMBIENT', name: 'Copbrowse_loop', loop: 1, freeze: 0 },
  { label: 'Assustado / Encolhido', lib: 'PED', name: 'cower', loop: 1, freeze: 1 },
  { label: 'Gangue falando alto', lib: 'GANGS', name: 'prtial_gngtlkA', loop: 1, freeze: 0 },
  { label: 'Postura armada', lib: 'PED', name: 'IDLE_armed', loop: 1, freeze: 0 },
  { label: 'Prostituta esperando', lib: 'BLOWJOB', name: 'BJ_STAND_LOOP_P', loop: 1, freeze: 0 },
  { label: 'Comemorando / Palmas', lib: 'BENCHPRESS', name: 'gym_bp_celebrate', loop: 1, freeze: 0 },
];

export const ANIM_CATEGORIES = [
  { id: 'populares', label: '⭐ Populares' },
  { id: 'todas', label: '🌐 Todas' },
  { id: 'conversas', label: '💬 Conversas & Gestos' },
  { id: 'sentado', label: '🪑 Sentado & Deitado' },
  { id: 'danca', label: '🕺 Danças' },
  { id: 'policia', label: '👮 Polícia & Segurança' },
  { id: 'combate', label: '🥊 Combate & Armas' },
  { id: 'esportes', label: '🏋️ Esportes & Academia' },
  { id: 'lazer', label: '🍻 Bar, Fumo & Lazer' },
];

export function classifyAnim(a) {
  const lib = (a.lib || '').toUpperCase();
  const nm = (a.name || '').toLowerCase();
  const desc = (a.desc || '').toLowerCase();
  if (lib.includes('DANC') || lib.includes('STRIP') || nm.includes('dance') || desc.includes('dance')) return 'danca';
  if (lib.includes('COP') || lib.includes('POLICE') || lib.includes('SWAT') || nm.includes('cop') || desc.includes('police')) return 'policia';
  if (lib.includes('BEACH') || lib.includes('SUNBATHE') || lib.includes('ATTRACTORS') || lib.includes('INT_HOUSE') || nm.includes('sit') || nm.includes('lay') || desc.includes('sit') || desc.includes('lay')) return 'sentado';
  if (lib.includes('GANG') || lib.includes('ON_LOOKERS') || nm.includes('chat') || nm.includes('talk') || desc.includes('talk') || desc.includes('chat') || desc.includes('wave')) return 'conversas';
  if (lib.includes('FIGHT') || lib.includes('COLT') || lib.includes('RIFLE') || lib.includes('SHOTGUN') || nm.includes('aim') || nm.includes('fight') || desc.includes('fight') || desc.includes('aim')) return 'combate';
  if (lib.includes('GYM') || lib.includes('BENCH') || lib.includes('BOX') || lib.includes('BASEBALL') || desc.includes('gym') || desc.includes('exercise')) return 'esportes';
  if (lib.includes('BAR') || lib.includes('SMOK') || lib.includes('FOOD') || lib.includes('CASINO') || desc.includes('drink') || desc.includes('smoke') || nm.includes('smoke')) return 'lazer';
  return 'outros';
}

export const POPULAR_SKINS = [
  { id: 0, name: 'CJ (Carl Johnson)' },
  { id: 1, name: 'The Truth' },
  { id: 2, name: 'Maccer' },
  { id: 7, name: 'Casual Male' },
  { id: 9, name: 'Normal Female' },
  { id: 10, name: 'Old Fat Female' },
  { id: 17, name: 'Business Male' },
  { id: 21, name: 'Gangster / Thug' },
  { id: 280, name: 'Policial LS (LSPD Cop)' },
  { id: 281, name: 'Policial SF (SFPD Cop)' },
  { id: 282, name: 'Policial LV (LVPD Cop)' },
  { id: 283, name: 'Xerife (County Sheriff)' },
  { id: 285, name: 'SWAT Especial' },
  { id: 286, name: 'Agente Federal (FBI)' },
  { id: 287, name: 'Soldado do Exército' },
  { id: 274, name: 'Médico / Paramédico' },
  { id: 277, name: 'Bombeiro' },
  { id: 105, name: 'Grove Street Fam (Fam1)' },
  { id: 106, name: 'Grove Street Fam (Fam2)' },
  { id: 107, name: 'Grove Street Fam (Fam3)' },
  { id: 102, name: 'Ballas (Balla1)' },
  { id: 103, name: 'Ballas (Balla2)' },
  { id: 104, name: 'Ballas (Balla3)' },
  { id: 108, name: 'Vagos (Vago1)' },
  { id: 109, name: 'Vagos (Vago2)' },
  { id: 110, name: 'Vagos (Vago3)' },
  { id: 114, name: 'Astecas (Azteca1)' },
  { id: 117, name: 'Tríade (Triad1)' },
  { id: 120, name: 'Tríade (Triad2)' },
  { id: 121, name: 'Máfia Italiana (Mafia1)' },
  { id: 124, name: 'Máfia Italiana (Mafia2)' },
  { id: 269, name: 'Big Smoke' },
  { id: 270, name: 'Sweet' },
  { id: 271, name: 'Ryder' },
  { id: 265, name: 'Tenpenny' },
  { id: 266, name: 'Pulaski' },
  { id: 299, name: 'Claude Speed' },
];

export const ALL_SKINS = [
  {
    "id": 0,
    "model": "fam1",
    "txd": "fam1",
    "name": "Carl CJ Johnson (Main Character)"
  },
  {
    "id": 1,
    "model": "truth",
    "txd": "truth",
    "name": "The Truth"
  },
  {
    "id": 2,
    "model": "maccer",
    "txd": "maccer",
    "name": "Maccer"
  },
  {
    "id": 3,
    "model": "andre",
    "txd": "andre",
    "name": "Andre"
  },
  {
    "id": 4,
    "model": "bbthin",
    "txd": "bbthin",
    "name": "Barry Big Bear Thorne [Thin]"
  },
  {
    "id": 5,
    "model": "bb",
    "txd": "bb",
    "name": "Barry Big Bear Thorne [Big]"
  },
  {
    "id": 6,
    "model": "emmet",
    "txd": "emmet",
    "name": "Emmet"
  },
  {
    "id": 7,
    "model": "male01",
    "txd": "male01",
    "name": "Taxi Driver/Train Driver"
  },
  {
    "id": 8,
    "model": "janitor",
    "txd": "janitor",
    "name": "Janitor"
  },
  {
    "id": 9,
    "model": "bfori",
    "txd": "bfori",
    "name": "Normal Ped"
  },
  {
    "id": 10,
    "model": "bfost",
    "txd": "bfost",
    "name": "Old Woman"
  },
  {
    "id": 11,
    "model": "vbfycrp",
    "txd": "vbfycrp",
    "name": "Casino croupier"
  },
  {
    "id": 12,
    "model": "bfyri",
    "txd": "bfyri",
    "name": "Rich Woman"
  },
  {
    "id": 13,
    "model": "bfyst",
    "txd": "bfyst",
    "name": "Street Girl"
  },
  {
    "id": 14,
    "model": "bmori",
    "txd": "bmori",
    "name": "Normal Ped"
  },
  {
    "id": 15,
    "model": "bmost",
    "txd": "bmost",
    "name": "Mr.Whittaker (RS Haul Owner)"
  },
  {
    "id": 16,
    "model": "bmyap",
    "txd": "bmyap",
    "name": "Airport Ground Worker"
  },
  {
    "id": 17,
    "model": "bmybu",
    "txd": "bmybu",
    "name": "Businessman"
  },
  {
    "id": 18,
    "model": "bmybe",
    "txd": "bmybe",
    "name": "Beach Visitor"
  },
  {
    "id": 19,
    "model": "bmydj",
    "txd": "bmydj",
    "name": "DJ"
  },
  {
    "id": 20,
    "model": "bmyri",
    "txd": "bmyri",
    "name": "Rich Guy (Madd Dogg's Manager)"
  },
  {
    "id": 21,
    "model": "bmycr",
    "txd": "bmycr",
    "name": "Normal Ped"
  },
  {
    "id": 22,
    "model": "bmyst",
    "txd": "bmyst",
    "name": "Normal Ped"
  },
  {
    "id": 23,
    "model": "wmybmx",
    "txd": "wmybmx",
    "name": "BMXer"
  },
  {
    "id": 24,
    "model": "wbdyg1",
    "txd": "wbdyg1",
    "name": "Madd Dogg Bodyguard"
  },
  {
    "id": 25,
    "model": "wbdyg2",
    "txd": "wbdyg2",
    "name": "Madd Dogg Bodyguard"
  },
  {
    "id": 26,
    "model": "wmybp",
    "txd": "wmybp",
    "name": "Backpacker"
  },
  {
    "id": 27,
    "model": "wmycon",
    "txd": "wmycon",
    "name": "Construction Worker"
  },
  {
    "id": 28,
    "model": "bmydrug",
    "txd": "bmydrug",
    "name": "Drug Dealer"
  },
  {
    "id": 29,
    "model": "wmydrug",
    "txd": "wmydrug",
    "name": "Drug Dealer"
  },
  {
    "id": 30,
    "model": "hmydrug",
    "txd": "hmydrug",
    "name": "Drug Dealer"
  },
  {
    "id": 31,
    "model": "dwfolc",
    "txd": "dwfolc",
    "name": "Farm-Town inhabitant"
  },
  {
    "id": 32,
    "model": "dwmolc1",
    "txd": "dwmolc1",
    "name": "Farm-Town inhabitant"
  },
  {
    "id": 33,
    "model": "dwmolc2",
    "txd": "dwmolc2",
    "name": "Farm-Town inhabitant"
  },
  {
    "id": 34,
    "model": "dwmylc1",
    "txd": "dwmylc1",
    "name": "Farm-Town inhabitant"
  },
  {
    "id": 35,
    "model": "hmogar",
    "txd": "hmogar",
    "name": "Gardener"
  },
  {
    "id": 36,
    "model": "wmygol1",
    "txd": "wmygol1",
    "name": "Golfer"
  },
  {
    "id": 37,
    "model": "wmygol2",
    "txd": "wmygol2",
    "name": "Golfer"
  },
  {
    "id": 38,
    "model": "hfori",
    "txd": "hfori",
    "name": "Normal Ped"
  },
  {
    "id": 39,
    "model": "hfost",
    "txd": "hfost",
    "name": "Normal Ped"
  },
  {
    "id": 40,
    "model": "hfyri",
    "txd": "hfyri",
    "name": "Normal Ped"
  },
  {
    "id": 41,
    "model": "hfyst",
    "txd": "hfyst",
    "name": "Normal Ped"
  },
  {
    "id": 42,
    "model": "jethro",
    "txd": "jethro",
    "name": "Jethro"
  },
  {
    "id": 43,
    "model": "hmori",
    "txd": "hmori",
    "name": "Normal Ped"
  },
  {
    "id": 44,
    "model": "hmost",
    "txd": "hmost",
    "name": "Normal Ped"
  },
  {
    "id": 45,
    "model": "hmybe",
    "txd": "hmybe",
    "name": "Beach Visitor"
  },
  {
    "id": 46,
    "model": "hmyri",
    "txd": "hmyri",
    "name": "Normal Ped"
  },
  {
    "id": 47,
    "model": "hmycr",
    "txd": "hmycr",
    "name": "Normal Ped"
  },
  {
    "id": 48,
    "model": "hmyst",
    "txd": "hmyst",
    "name": "Normal Ped"
  },
  {
    "id": 49,
    "model": "omokung",
    "txd": "omokung",
    "name": "Snakehead (Da Nang)"
  },
  {
    "id": 50,
    "model": "wmymech",
    "txd": "wmymech",
    "name": "Mechanic"
  },
  {
    "id": 51,
    "model": "bmymoun",
    "txd": "bmymoun",
    "name": "Mountain Biker"
  },
  {
    "id": 52,
    "model": "wmymoun",
    "txd": "wmymoun",
    "name": "Mountain Biker"
  },
  {
    "id": 53,
    "model": "ofori",
    "txd": "ofori",
    "name": "Unknown"
  },
  {
    "id": 54,
    "model": "ofost",
    "txd": "ofost",
    "name": "Normal Ped"
  },
  {
    "id": 55,
    "model": "ofyri",
    "txd": "ofyri",
    "name": "Normal Ped"
  },
  {
    "id": 56,
    "model": "ofyst",
    "txd": "ofyst",
    "name": "Normal Ped"
  },
  {
    "id": 57,
    "model": "omori",
    "txd": "omori",
    "name": "Oriental Ped"
  },
  {
    "id": 58,
    "model": "omost",
    "txd": "omost",
    "name": "Oriental Ped"
  },
  {
    "id": 59,
    "model": "omyri",
    "txd": "omyri",
    "name": "Normal Ped"
  },
  {
    "id": 60,
    "model": "omyst",
    "txd": "omyst",
    "name": "Normal Ped"
  },
  {
    "id": 61,
    "model": "wmyplt",
    "txd": "wmyplt",
    "name": "Pilot"
  },
  {
    "id": 62,
    "model": "wmopj",
    "txd": "wmopj",
    "name": "Colonel Fuhrberger"
  },
  {
    "id": 63,
    "model": "bfypro",
    "txd": "bfypro",
    "name": "Prostitute"
  },
  {
    "id": 64,
    "model": "hfypro",
    "txd": "hfypro",
    "name": "Prostitute"
  },
  {
    "id": 65,
    "model": "kendl",
    "txd": "kendl",
    "name": "Kendl Johnson"
  },
  {
    "id": 66,
    "model": "bmypol1",
    "txd": "bmypol1",
    "name": "Pool Player"
  },
  {
    "id": 67,
    "model": "bmypol2",
    "txd": "bmypol2",
    "name": "Pool Player"
  },
  {
    "id": 68,
    "model": "wmoprea",
    "txd": "wmoprea",
    "name": "Priest/Preacher"
  },
  {
    "id": 69,
    "model": "sbfyst",
    "txd": "sbfyst",
    "name": "Normal Ped"
  },
  {
    "id": 70,
    "model": "wmosci",
    "txd": "wmosci",
    "name": "Scientist"
  },
  {
    "id": 71,
    "model": "wmysgrd",
    "txd": "wmysgrd",
    "name": "Security Guard"
  },
  {
    "id": 72,
    "model": "swmyhp1",
    "txd": "swmyhp1",
    "name": "Hippy"
  },
  {
    "id": 73,
    "model": "swmyhp2",
    "txd": "swmyhp2",
    "name": "Hippy"
  },
  {
    "id": 74,
    "model": "dwayne",
    "txd": "dwayne",
    "name": "Skin 74"
  },
  {
    "id": 75,
    "model": "swfopro",
    "txd": "swfopro",
    "name": "Prostitute"
  },
  {
    "id": 76,
    "model": "wfystew",
    "txd": "wfystew",
    "name": "Stewardess"
  },
  {
    "id": 77,
    "model": "swmotr1",
    "txd": "swmotr1",
    "name": "Homeless"
  },
  {
    "id": 78,
    "model": "wmotr1",
    "txd": "wmotr1",
    "name": "Homeless"
  },
  {
    "id": 79,
    "model": "bmotr1",
    "txd": "bmotr1",
    "name": "Homeless"
  },
  {
    "id": 80,
    "model": "vbmybox",
    "txd": "vbmybox",
    "name": "Boxer"
  },
  {
    "id": 81,
    "model": "vwmybox",
    "txd": "vwmybox",
    "name": "Boxer"
  },
  {
    "id": 82,
    "model": "vhmyelv",
    "txd": "vhmyelv",
    "name": "Black Elvis"
  },
  {
    "id": 83,
    "model": "vbmyelv",
    "txd": "vbmyelv",
    "name": "White Elvis"
  },
  {
    "id": 84,
    "model": "vimyelv",
    "txd": "vimyelv",
    "name": "Blue Elvis"
  },
  {
    "id": 85,
    "model": "vwfypro",
    "txd": "vwfypro",
    "name": "Prostitute"
  },
  {
    "id": 86,
    "model": "ryder2",
    "txd": "ryder2",
    "name": "Ryder with robbery mask"
  },
  {
    "id": 87,
    "model": "vwfyst1",
    "txd": "vwfyst1",
    "name": "Stripper"
  },
  {
    "id": 88,
    "model": "wfori",
    "txd": "wfori",
    "name": "Normal Ped"
  },
  {
    "id": 89,
    "model": "wfost",
    "txd": "wfost",
    "name": "Normal Ped"
  },
  {
    "id": 90,
    "model": "wfyjg",
    "txd": "wfyjg",
    "name": "Jogger"
  },
  {
    "id": 91,
    "model": "wfyri",
    "txd": "wfyri",
    "name": "Rich Woman"
  },
  {
    "id": 92,
    "model": "wfyro",
    "txd": "wfyro",
    "name": "Rollerskater"
  },
  {
    "id": 93,
    "model": "wfyst",
    "txd": "wfyst",
    "name": "Normal Ped"
  },
  {
    "id": 94,
    "model": "wmori",
    "txd": "wmori",
    "name": "Normal Ped"
  },
  {
    "id": 95,
    "model": "wmost",
    "txd": "wmost",
    "name": "Normal Ped"
  },
  {
    "id": 96,
    "model": "wmyjg",
    "txd": "wmyjg",
    "name": "Jogger"
  },
  {
    "id": 97,
    "model": "wmylg",
    "txd": "wmylg",
    "name": "Lifeguard"
  },
  {
    "id": 98,
    "model": "wmyri",
    "txd": "wmyri",
    "name": "Normal Ped"
  },
  {
    "id": 99,
    "model": "wmyro",
    "txd": "wmyro",
    "name": "Rollerskater"
  },
  {
    "id": 100,
    "model": "wmycr",
    "txd": "wmycr",
    "name": "Biker"
  },
  {
    "id": 101,
    "model": "wmyst",
    "txd": "wmyst",
    "name": "Normal Ped"
  },
  {
    "id": 102,
    "model": "ballas1",
    "txd": "ballas1",
    "name": "Balla"
  },
  {
    "id": 103,
    "model": "ballas2",
    "txd": "ballas2",
    "name": "Balla"
  },
  {
    "id": 104,
    "model": "ballas3",
    "txd": "ballas3",
    "name": "Balla"
  },
  {
    "id": 105,
    "model": "fam1",
    "txd": "fam1",
    "name": "Grove Street Families"
  },
  {
    "id": 106,
    "model": "fam2",
    "txd": "fam2",
    "name": "Grove Street Families"
  },
  {
    "id": 107,
    "model": "fam3",
    "txd": "fam3",
    "name": "Grove Street Families"
  },
  {
    "id": 108,
    "model": "lsv1",
    "txd": "lsv1",
    "name": "Los Santos Vagos"
  },
  {
    "id": 109,
    "model": "lsv2",
    "txd": "lsv2",
    "name": "Los Santos Vagos"
  },
  {
    "id": 110,
    "model": "lsv3",
    "txd": "lsv3",
    "name": "Los Santos Vagos"
  },
  {
    "id": 111,
    "model": "maffa",
    "txd": "maffa",
    "name": "The Russian Mafia"
  },
  {
    "id": 112,
    "model": "maffb",
    "txd": "maffb",
    "name": "The Russian Mafia"
  },
  {
    "id": 113,
    "model": "mafboss",
    "txd": "mafboss",
    "name": "The Russian Mafia"
  },
  {
    "id": 114,
    "model": "vla1",
    "txd": "vla1",
    "name": "Varrios Los Aztecas"
  },
  {
    "id": 115,
    "model": "vla2",
    "txd": "vla2",
    "name": "Varrios Los Aztecas"
  },
  {
    "id": 116,
    "model": "vla3",
    "txd": "vla3",
    "name": "Varrios Los Aztecas"
  },
  {
    "id": 117,
    "model": "triada",
    "txd": "triada",
    "name": "Triad"
  },
  {
    "id": 118,
    "model": "triadb",
    "txd": "triadb",
    "name": "Triad"
  },
  {
    "id": 119,
    "model": "sindaco",
    "txd": "sindaco",
    "name": "Johnny Sindacco"
  },
  {
    "id": 120,
    "model": "triboss",
    "txd": "triboss",
    "name": "Triad Boss"
  },
  {
    "id": 121,
    "model": "dnb1",
    "txd": "dnb1",
    "name": "Da Nang Boy"
  },
  {
    "id": 122,
    "model": "dnb2",
    "txd": "dnb2",
    "name": "Da Nang Boy"
  },
  {
    "id": 123,
    "model": "dnb3",
    "txd": "dnb3",
    "name": "Da Nang Boy"
  },
  {
    "id": 124,
    "model": "vmaff1",
    "txd": "vmaff1",
    "name": "The Mafia"
  },
  {
    "id": 125,
    "model": "vmaff2",
    "txd": "vmaff2",
    "name": "The Mafia"
  },
  {
    "id": 126,
    "model": "vmaff3",
    "txd": "vmaff3",
    "name": "The Mafia"
  },
  {
    "id": 127,
    "model": "vmaff4",
    "txd": "vmaff4",
    "name": "The Mafia"
  },
  {
    "id": 128,
    "model": "dnmylc",
    "txd": "dnmylc",
    "name": "Farm Inhabitant"
  },
  {
    "id": 129,
    "model": "dnfolc1",
    "txd": "dnfolc1",
    "name": "Farm Inhabitant"
  },
  {
    "id": 130,
    "model": "dnfolc2",
    "txd": "dnfolc2",
    "name": "Farm Inhabitant"
  },
  {
    "id": 131,
    "model": "dnfylc",
    "txd": "dnfylc",
    "name": "Farm Inhabitant"
  },
  {
    "id": 132,
    "model": "dnmolc1",
    "txd": "dnmolc1",
    "name": "Farm Inhabitant"
  },
  {
    "id": 133,
    "model": "dnmolc2",
    "txd": "dnmolc2",
    "name": "Farm Inhabitant"
  },
  {
    "id": 134,
    "model": "sbmotr2",
    "txd": "sbmotr2",
    "name": "Homeless"
  },
  {
    "id": 135,
    "model": "swmotr2",
    "txd": "swmotr2",
    "name": "Homeless"
  },
  {
    "id": 136,
    "model": "sbmytr3",
    "txd": "sbmytr3",
    "name": "Normal Ped"
  },
  {
    "id": 137,
    "model": "swmotr3",
    "txd": "swmotr3",
    "name": "Homeless"
  },
  {
    "id": 138,
    "model": "wfybe",
    "txd": "wfybe",
    "name": "Beach Visitor"
  },
  {
    "id": 139,
    "model": "bfybe",
    "txd": "bfybe",
    "name": "Beach Visitor"
  },
  {
    "id": 140,
    "model": "hfybe",
    "txd": "hfybe",
    "name": "Beach Visitor"
  },
  {
    "id": 141,
    "model": "sofybu",
    "txd": "sofybu",
    "name": "Businesswoman"
  },
  {
    "id": 142,
    "model": "sbmyst",
    "txd": "sbmyst",
    "name": "Taxi Driver"
  },
  {
    "id": 143,
    "model": "sbmycr",
    "txd": "sbmycr",
    "name": "Crack Maker"
  },
  {
    "id": 144,
    "model": "bmycg",
    "txd": "bmycg",
    "name": "Crack Maker"
  },
  {
    "id": 145,
    "model": "wfycrk",
    "txd": "wfycrk",
    "name": "Crack Maker"
  },
  {
    "id": 146,
    "model": "hmycm",
    "txd": "hmycm",
    "name": "Crack Maker"
  },
  {
    "id": 147,
    "model": "wmybu",
    "txd": "wmybu",
    "name": "Businessman"
  },
  {
    "id": 148,
    "model": "bfybu",
    "txd": "bfybu",
    "name": "Businesswoman"
  },
  {
    "id": 149,
    "model": "smokev",
    "txd": "smokev",
    "name": "Big Smoke Armored"
  },
  {
    "id": 150,
    "model": "wfybu",
    "txd": "wfybu",
    "name": "Businesswoman"
  },
  {
    "id": 151,
    "model": "dwfylc1",
    "txd": "dwfylc1",
    "name": "Normal Ped"
  },
  {
    "id": 152,
    "model": "wfypro",
    "txd": "wfypro",
    "name": "Prostitute"
  },
  {
    "id": 153,
    "model": "wmyconb",
    "txd": "wmyconb",
    "name": "Construction Worker"
  },
  {
    "id": 154,
    "model": "wmybe",
    "txd": "wmybe",
    "name": "Beach Visitor"
  },
  {
    "id": 155,
    "model": "wmypizz",
    "txd": "wmypizz",
    "name": "Well Stacked Pizza Worker"
  },
  {
    "id": 156,
    "model": "bmobar",
    "txd": "bmobar",
    "name": "Barber"
  },
  {
    "id": 157,
    "model": "cwfyhb",
    "txd": "cwfyhb",
    "name": "Hillbilly"
  },
  {
    "id": 158,
    "model": "cwmofr",
    "txd": "cwmofr",
    "name": "Farmer"
  },
  {
    "id": 159,
    "model": "cwmohb1",
    "txd": "cwmohb1",
    "name": "Hillbilly"
  },
  {
    "id": 160,
    "model": "cwmohb2",
    "txd": "cwmohb2",
    "name": "Hillbilly"
  },
  {
    "id": 161,
    "model": "cwmyfr",
    "txd": "cwmyfr",
    "name": "Farmer"
  },
  {
    "id": 162,
    "model": "cwmyhb1",
    "txd": "cwmyhb1",
    "name": "Hillbilly"
  },
  {
    "id": 163,
    "model": "bmyboun",
    "txd": "bmyboun",
    "name": "Black Bouncer"
  },
  {
    "id": 164,
    "model": "wmyboun",
    "txd": "wmyboun",
    "name": "White Bouncer"
  },
  {
    "id": 165,
    "model": "wmomib",
    "txd": "wmomib",
    "name": "White MIB agent"
  },
  {
    "id": 166,
    "model": "bmymib",
    "txd": "bmymib",
    "name": "Black MIB agent"
  },
  {
    "id": 167,
    "model": "wmybell",
    "txd": "wmybell",
    "name": "Cluckin' Bell Worker"
  },
  {
    "id": 168,
    "model": "bmochil",
    "txd": "bmochil",
    "name": "Hotdog/Chilli Dog Vendor"
  },
  {
    "id": 169,
    "model": "sofyri",
    "txd": "sofyri",
    "name": "Normal Ped"
  },
  {
    "id": 170,
    "model": "somyst",
    "txd": "somyst",
    "name": "Normal Ped"
  },
  {
    "id": 171,
    "model": "vwmybjd",
    "txd": "vwmybjd",
    "name": "Blackjack Dealer"
  },
  {
    "id": 172,
    "model": "vwfycrp",
    "txd": "vwfycrp",
    "name": "Casino croupier"
  },
  {
    "id": 173,
    "model": "sfr1",
    "txd": "sfr1",
    "name": "San Fierro Rifa"
  },
  {
    "id": 174,
    "model": "sfr2",
    "txd": "sfr2",
    "name": "San Fierro Rifa"
  },
  {
    "id": 175,
    "model": "sfr3",
    "txd": "sfr3",
    "name": "San Fierro Rifa"
  },
  {
    "id": 176,
    "model": "bmybar",
    "txd": "bmybar",
    "name": "Barber"
  },
  {
    "id": 177,
    "model": "wmybar",
    "txd": "wmybar",
    "name": "Barber"
  },
  {
    "id": 178,
    "model": "wfysex",
    "txd": "wfysex",
    "name": "Whore"
  },
  {
    "id": 179,
    "model": "wmyammo",
    "txd": "wmyammo",
    "name": "Ammunation Salesman"
  },
  {
    "id": 180,
    "model": "bmytatt",
    "txd": "bmytatt",
    "name": "Tattoo Artist"
  },
  {
    "id": 181,
    "model": "vwmycr",
    "txd": "vwmycr",
    "name": "Punk"
  },
  {
    "id": 182,
    "model": "vbmocd",
    "txd": "vbmocd",
    "name": "Cab Driver"
  },
  {
    "id": 183,
    "model": "vbmycr",
    "txd": "vbmycr",
    "name": "Normal Ped"
  },
  {
    "id": 184,
    "model": "vhmycr",
    "txd": "vhmycr",
    "name": "Normal Ped"
  },
  {
    "id": 185,
    "model": "sbmyri",
    "txd": "sbmyri",
    "name": "Normal Ped"
  },
  {
    "id": 186,
    "model": "somyri",
    "txd": "somyri",
    "name": "Normal Ped"
  },
  {
    "id": 187,
    "model": "somybu",
    "txd": "somybu",
    "name": "Businessman"
  },
  {
    "id": 188,
    "model": "swmyst",
    "txd": "swmyst",
    "name": "Normal Ped"
  },
  {
    "id": 189,
    "model": "wmyva",
    "txd": "wmyva",
    "name": "Valet"
  },
  {
    "id": 190,
    "model": "copgrl3",
    "txd": "copgrl3",
    "name": "Barbara Schternvart"
  },
  {
    "id": 191,
    "model": "gungrl3",
    "txd": "gungrl3",
    "name": "Helena Wankstein"
  },
  {
    "id": 192,
    "model": "mecgrl3",
    "txd": "mecgrl3",
    "name": "Michelle Cannes"
  },
  {
    "id": 193,
    "model": "nurgrl3",
    "txd": "nurgrl3",
    "name": "Katie Zhan"
  },
  {
    "id": 194,
    "model": "crogrl3",
    "txd": "crogrl3",
    "name": "Millie Perkins"
  },
  {
    "id": 195,
    "model": "gangrl3",
    "txd": "gangrl3",
    "name": "Denise Robinson"
  },
  {
    "id": 196,
    "model": "cwfofr",
    "txd": "cwfofr",
    "name": "Farm-Town inhabitant"
  },
  {
    "id": 197,
    "model": "cwfohb",
    "txd": "cwfohb",
    "name": "Hillbilly"
  },
  {
    "id": 198,
    "model": "cwfyfr1",
    "txd": "cwfyfr1",
    "name": "Farm-Town inhabitant"
  },
  {
    "id": 199,
    "model": "cwfyfr2",
    "txd": "cwfyfr2",
    "name": "Farm-Town inhabitant"
  },
  {
    "id": 200,
    "model": "cwmyhb2",
    "txd": "cwmyhb2",
    "name": "Hillbilly"
  },
  {
    "id": 201,
    "model": "dwfylc2",
    "txd": "dwfylc2",
    "name": "Farmer"
  },
  {
    "id": 202,
    "model": "dwmylc2",
    "txd": "dwmylc2",
    "name": "Farmer"
  },
  {
    "id": 203,
    "model": "omykara",
    "txd": "omykara",
    "name": "Karate Teacher"
  },
  {
    "id": 204,
    "model": "wmykara",
    "txd": "wmykara",
    "name": "Karate Teacher"
  },
  {
    "id": 205,
    "model": "wfyburg",
    "txd": "wfyburg",
    "name": "Burger Shot Cashier"
  },
  {
    "id": 206,
    "model": "vwmycd",
    "txd": "vwmycd",
    "name": "Cab Driver"
  },
  {
    "id": 207,
    "model": "vhfypro",
    "txd": "vhfypro",
    "name": "Prostitute"
  },
  {
    "id": 208,
    "model": "suzie",
    "txd": "suzie",
    "name": "Su Xi Mu (Suzie)"
  },
  {
    "id": 209,
    "model": "omonood",
    "txd": "omonood",
    "name": "Oriental Noodle stand vendor"
  },
  {
    "id": 210,
    "model": "omoboat",
    "txd": "omoboat",
    "name": "Oriental Boating School Instructor"
  },
  {
    "id": 211,
    "model": "wfyclot",
    "txd": "wfyclot",
    "name": "Clothes shop staff"
  },
  {
    "id": 212,
    "model": "vwmotr1",
    "txd": "vwmotr1",
    "name": "Homeless"
  },
  {
    "id": 213,
    "model": "vwmotr2",
    "txd": "vwmotr2",
    "name": "Weird old man"
  },
  {
    "id": 214,
    "model": "vwfywai",
    "txd": "vwfywai",
    "name": "Waitress (Maria Latore)"
  },
  {
    "id": 215,
    "model": "sbfori",
    "txd": "sbfori",
    "name": "Normal Ped"
  },
  {
    "id": 216,
    "model": "swfyri",
    "txd": "swfyri",
    "name": "Normal Ped"
  },
  {
    "id": 217,
    "model": "wmyclot",
    "txd": "wmyclot",
    "name": "Clothes shop staff"
  },
  {
    "id": 218,
    "model": "sbfost",
    "txd": "sbfost",
    "name": "Normal Ped"
  },
  {
    "id": 219,
    "model": "sbfyri",
    "txd": "sbfyri",
    "name": "Rich Woman"
  },
  {
    "id": 220,
    "model": "sbmocd",
    "txd": "sbmocd",
    "name": "Cab Driver"
  },
  {
    "id": 221,
    "model": "sbmori",
    "txd": "sbmori",
    "name": "Normal Ped"
  },
  {
    "id": 222,
    "model": "sbmost",
    "txd": "sbmost",
    "name": "Normal Ped"
  },
  {
    "id": 223,
    "model": "shmycr",
    "txd": "shmycr",
    "name": "Normal Ped"
  },
  {
    "id": 224,
    "model": "sofori",
    "txd": "sofori",
    "name": "Normal Ped"
  },
  {
    "id": 225,
    "model": "sofost",
    "txd": "sofost",
    "name": "Normal Ped"
  },
  {
    "id": 226,
    "model": "sofyst",
    "txd": "sofyst",
    "name": "Normal Ped"
  },
  {
    "id": 227,
    "model": "somobu",
    "txd": "somobu",
    "name": "Oriental Businessman"
  },
  {
    "id": 228,
    "model": "somori",
    "txd": "somori",
    "name": "Oriental Ped"
  },
  {
    "id": 229,
    "model": "somost",
    "txd": "somost",
    "name": "Oriental Ped"
  },
  {
    "id": 230,
    "model": "swmotr5",
    "txd": "swmotr5",
    "name": "Homeless"
  },
  {
    "id": 231,
    "model": "swfori",
    "txd": "swfori",
    "name": "Normal Ped"
  },
  {
    "id": 232,
    "model": "swfost",
    "txd": "swfost",
    "name": "Normal Ped"
  },
  {
    "id": 233,
    "model": "swfyst",
    "txd": "swfyst",
    "name": "Normal Ped"
  },
  {
    "id": 234,
    "model": "swmocd",
    "txd": "swmocd",
    "name": "Cab Driver"
  },
  {
    "id": 235,
    "model": "swmori",
    "txd": "swmori",
    "name": "Normal Ped"
  },
  {
    "id": 236,
    "model": "swmost",
    "txd": "swmost",
    "name": "Normal Ped"
  },
  {
    "id": 237,
    "model": "shfypro",
    "txd": "shfypro",
    "name": "Prostitute"
  },
  {
    "id": 238,
    "model": "sbfypro",
    "txd": "sbfypro",
    "name": "Prostitute"
  },
  {
    "id": 239,
    "model": "swmotr4",
    "txd": "swmotr4",
    "name": "Homeless"
  },
  {
    "id": 240,
    "model": "swmyri",
    "txd": "swmyri",
    "name": "The D.A"
  },
  {
    "id": 241,
    "model": "smyst",
    "txd": "smyst",
    "name": "Afro-American"
  },
  {
    "id": 242,
    "model": "smyst2",
    "txd": "smyst2",
    "name": "Mexican"
  },
  {
    "id": 243,
    "model": "sfypro",
    "txd": "sfypro",
    "name": "Prostitute"
  },
  {
    "id": 244,
    "model": "vbfyst2",
    "txd": "vbfyst2",
    "name": "Stripper"
  },
  {
    "id": 245,
    "model": "vbfypro",
    "txd": "vbfypro",
    "name": "Prostitute"
  },
  {
    "id": 246,
    "model": "vhfyst3",
    "txd": "vhfyst3",
    "name": "Stripper"
  },
  {
    "id": 247,
    "model": "bikera",
    "txd": "bikera",
    "name": "Biker"
  },
  {
    "id": 248,
    "model": "bikerb",
    "txd": "bikerb",
    "name": "Biker"
  },
  {
    "id": 249,
    "model": "bmypimp",
    "txd": "bmypimp",
    "name": "Pimp"
  },
  {
    "id": 250,
    "model": "swmycr",
    "txd": "swmycr",
    "name": "Normal Ped"
  },
  {
    "id": 251,
    "model": "wfylg",
    "txd": "wfylg",
    "name": "Lifeguard"
  },
  {
    "id": 252,
    "model": "wmyva2",
    "txd": "wmyva2",
    "name": "Naked Valet"
  },
  {
    "id": 253,
    "model": "bmosec",
    "txd": "bmosec",
    "name": "Bus Driver"
  },
  {
    "id": 254,
    "model": "bikdrug",
    "txd": "bikdrug",
    "name": "Biker Drug Dealer"
  },
  {
    "id": 255,
    "model": "wmych",
    "txd": "wmych",
    "name": "Chauffeur (Limo Driver)"
  },
  {
    "id": 256,
    "model": "sbfystr",
    "txd": "sbfystr",
    "name": "Stripper"
  },
  {
    "id": 257,
    "model": "swfystr",
    "txd": "swfystr",
    "name": "Stripper"
  },
  {
    "id": 258,
    "model": "heck1",
    "txd": "heck1",
    "name": "Heckler"
  },
  {
    "id": 259,
    "model": "heck2",
    "txd": "heck2",
    "name": "Heckler"
  },
  {
    "id": 260,
    "model": "bmycon",
    "txd": "bmycon",
    "name": "Construction Worker"
  },
  {
    "id": 261,
    "model": "wmycd1",
    "txd": "wmycd1",
    "name": "Cab driver"
  },
  {
    "id": 262,
    "model": "bmocd",
    "txd": "bmocd",
    "name": "Cab driver"
  },
  {
    "id": 263,
    "model": "vwfywa2",
    "txd": "vwfywa2",
    "name": "Normal Ped"
  },
  {
    "id": 264,
    "model": "wmoice",
    "txd": "wmoice",
    "name": "Clown (Ice-cream Van Driver)"
  },
  {
    "id": 265,
    "model": "tenpen",
    "txd": "tenpen",
    "name": "Officer Frank Tenpenny (Corrupt Cop)"
  },
  {
    "id": 266,
    "model": "pulaski",
    "txd": "pulaski",
    "name": "Officer Eddie Pulaski (Corrupt Cop)"
  },
  {
    "id": 267,
    "model": "hern",
    "txd": "hern",
    "name": "Officer Jimmy Hernandez"
  },
  {
    "id": 268,
    "model": "dwayne",
    "txd": "dwayne",
    "name": "Dwaine/Dwayne"
  },
  {
    "id": 269,
    "model": "smoke",
    "txd": "smoke",
    "name": "Melvin Big Smoke Harris (Mission)"
  },
  {
    "id": 270,
    "model": "sweet",
    "txd": "sweet",
    "name": "Sean 'Sweet' Johnson"
  },
  {
    "id": 271,
    "model": "ryder",
    "txd": "ryder",
    "name": "Lance 'Ryder' Wilson"
  },
  {
    "id": 272,
    "model": "forelli",
    "txd": "forelli",
    "name": "Mafia Boss"
  },
  {
    "id": 273,
    "model": "tbone",
    "txd": "tbone",
    "name": "T-Bone Mendez"
  },
  {
    "id": 274,
    "model": "laemt1",
    "txd": "laemt1",
    "name": "Paramedic (Emergency Medical Technician)"
  },
  {
    "id": 275,
    "model": "lvemt1",
    "txd": "lvemt1",
    "name": "Paramedic (Emergency Medical Technician)"
  },
  {
    "id": 276,
    "model": "sfemt1",
    "txd": "sfemt1",
    "name": "Paramedic (Emergency Medical Technician)"
  },
  {
    "id": 277,
    "model": "lafd1",
    "txd": "lafd1",
    "name": "Firefighter"
  },
  {
    "id": 278,
    "model": "lvfd1",
    "txd": "lvfd1",
    "name": "Firefighter"
  },
  {
    "id": 279,
    "model": "sffd1",
    "txd": "sffd1",
    "name": "Firefighter"
  },
  {
    "id": 280,
    "model": "lapd1",
    "txd": "lapd1",
    "name": "Los Santos Police Officer"
  },
  {
    "id": 281,
    "model": "sfpd1",
    "txd": "sfpd1",
    "name": "San Fierro Police Officer"
  },
  {
    "id": 282,
    "model": "lvpd1",
    "txd": "lvpd1",
    "name": "Las Venturas Police Officer"
  },
  {
    "id": 283,
    "model": "csher",
    "txd": "csher",
    "name": "County Sheriff"
  },
  {
    "id": 284,
    "model": "lapdm1",
    "txd": "lapdm1",
    "name": "LSPD Motorbike Cop"
  },
  {
    "id": 285,
    "model": "swat",
    "txd": "swat",
    "name": "S.W.A.T Special Forces"
  },
  {
    "id": 286,
    "model": "fbi",
    "txd": "fbi",
    "name": "FBI Agent"
  },
  {
    "id": 287,
    "model": "army",
    "txd": "army",
    "name": "San Andreas Army Soldier"
  },
  {
    "id": 288,
    "model": "dsher",
    "txd": "dsher",
    "name": "Desert Sheriff"
  },
  {
    "id": 289,
    "model": "zero",
    "txd": "zero",
    "name": "Zero"
  },
  {
    "id": 290,
    "model": "csrosenberg",
    "txd": "csrosenberg",
    "name": "Ken Rosenberg"
  },
  {
    "id": 291,
    "model": "paul",
    "txd": "paul",
    "name": "Kent Paul"
  },
  {
    "id": 292,
    "model": "cesar",
    "txd": "cesar",
    "name": "Cesar Vialpando"
  },
  {
    "id": 293,
    "model": "ogloc",
    "txd": "ogloc",
    "name": "Jeffery OG Loc Martin/Cross"
  },
  {
    "id": 294,
    "model": "wuzimu",
    "txd": "wuzimu",
    "name": "Wu Zi Mu (Woozie)"
  },
  {
    "id": 295,
    "model": "cstorino",
    "txd": "cstorino",
    "name": "Michael Toreno (Mike)"
  },
  {
    "id": 296,
    "model": "jizzy",
    "txd": "jizzy",
    "name": "Jizzy B."
  },
  {
    "id": 297,
    "model": "maddogg",
    "txd": "maddogg",
    "name": "Madd Dogg"
  },
  {
    "id": 298,
    "model": "cscatalina",
    "txd": "cscatalina",
    "name": "Catalina"
  },
  {
    "id": 299,
    "model": "claude",
    "txd": "claude",
    "name": "Claude Speed"
  },
  {
    "id": 300,
    "model": "lapdna",
    "txd": "lapd1",
    "name": "Los Santos Police Officer (Without gun holster)"
  },
  {
    "id": 301,
    "model": "sfpdna",
    "txd": "sfpd1",
    "name": "San Fierro Police Officer (Without gun holster)"
  },
  {
    "id": 302,
    "model": "lvpdna",
    "txd": "lvpd1",
    "name": "Las Venturas Police Officer (Without gun holster)"
  },
  {
    "id": 303,
    "model": "lapdpc",
    "txd": "lapdpc",
    "name": "Los Santos Police Officer (Without uniform)"
  },
  {
    "id": 304,
    "model": "lapdpd",
    "txd": "lapdpd",
    "name": "Los Santos Police Officer (Without uniform)"
  },
  {
    "id": 305,
    "model": "lvpdpc",
    "txd": "lvpdpc",
    "name": "Las Venturas Police Officer (Without uniform)"
  },
  {
    "id": 306,
    "model": "wfyclpd",
    "txd": "wfyclpd",
    "name": "Los Santos Police Officer"
  },
  {
    "id": 307,
    "model": "vbfycpd",
    "txd": "vbfycpd",
    "name": "San Fierro Police Officer"
  },
  {
    "id": 308,
    "model": "wfyclem",
    "txd": "wfyclem",
    "name": "San Fierro Paramedic (Emergency Medical Technician)"
  },
  {
    "id": 309,
    "model": "wfycllv",
    "txd": "wfycllv",
    "name": "Las Venturas Police Officer"
  },
  {
    "id": 310,
    "model": "csherna",
    "txd": "csherna",
    "name": "Country Sheriff (Without hat)"
  },
  {
    "id": 311,
    "model": "dsherna",
    "txd": "dsherna",
    "name": "Desert Sheriff (Without hat)"
  }
];

export function getSkinLabel(skinId) {
  const id = skinId | 0;
  if (ALL_SKINS[id]) return ALL_SKINS[id].name;
  const p = POPULAR_SKINS.find(s => s.id === id);
  if (p) return p.name;
  return 'Skin ' + id;
}

export function findSkin(query) {
  if (query === null || query === undefined || query === '') return null;
  const str = String(query).trim().toLowerCase();
  const num = parseInt(str, 10);
  if (Number.isFinite(num) && num >= 0 && num <= 311 && ALL_SKINS[num]) {
    return ALL_SKINS[num];
  }
  return ALL_SKINS.find(s => s.name.toLowerCase().includes(str) || s.model.toLowerCase().includes(str)) || null;
}

export const ALL_ANIMATIONS = [
  {
    "lib": "AIRPORT",
    "name": "thrw_barl_thrw",
    "desc": "Opening a door with two hands",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "Attractors",
    "name": "Stepsit_in",
    "desc": "Sitting on the ground",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "Attractors",
    "name": "Stepsit_loop",
    "desc": "Sitting on the ground loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "Attractors",
    "name": "Stepsit_out",
    "desc": "Standing up after sitting",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BAR",
    "name": "Barcustom_get",
    "desc": "Receiving a drink",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BAR",
    "name": "Barcustom_loop",
    "desc": "Waiting for a drink",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BAR",
    "name": "Barcustom_order",
    "desc": "Ordering a drink",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BAR",
    "name": "BARman_idle",
    "desc": "Male bartender idling",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BAR",
    "name": "Barserve_bottle",
    "desc": "Grabbing a bottle from the bottom shelf",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BAR",
    "name": "Barserve_give",
    "desc": "Serving a bottle",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BAR",
    "name": "Barserve_glass",
    "desc": "Pouring liquid into a glass",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BAR",
    "name": "Barserve_in",
    "desc": "Female bartender lean start",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BAR",
    "name": "Barserve_loop",
    "desc": "Female bartender idling",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BAR",
    "name": "Barserve_order",
    "desc": "Bartender taking order",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BAR",
    "name": "dnk_stndF_loop",
    "desc": "Female drinking animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BAR",
    "name": "dnk_stndM_loop",
    "desc": "Male drinking animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BASEBALL",
    "name": "Bat_1",
    "desc": "First bat swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BASEBALL",
    "name": "Bat_2",
    "desc": "Second bat swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BASEBALL",
    "name": "Bat_3",
    "desc": "Third bat swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BASEBALL",
    "name": "Bat_4",
    "desc": "Bat swing on downed enemy",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BASEBALL",
    "name": "Bat_block",
    "desc": "Bat block",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BASEBALL",
    "name": "Bat_Hit_1",
    "desc": "Getting hit by a baseball bat",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BASEBALL",
    "name": "Bat_Hit_2",
    "desc": "Getting hit by a baseball bat",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BASEBALL",
    "name": "Bat_Hit_3",
    "desc": "Getting hit by a baseball bat",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BASEBALL",
    "name": "Bat_IDLE",
    "desc": "Baseball bat idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BASEBALL",
    "name": "Bat_M",
    "desc": "Bat running attack",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BASEBALL",
    "name": "BAT_PART",
    "desc": "Bat running attack",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BD_FIRE",
    "name": "BD_Fire1",
    "desc": "[missing animation]",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BD_FIRE",
    "name": "BD_Fire2",
    "desc": "[missing animation]",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BD_FIRE",
    "name": "BD_Fire3",
    "desc": "[missing animation]",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BD_FIRE",
    "name": "BD_GF_Wave",
    "desc": "Girlfriend wave",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BD_FIRE",
    "name": "BD_Panic_01",
    "desc": "Window panic animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BD_FIRE",
    "name": "BD_Panic_02",
    "desc": "Window panic animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BD_FIRE",
    "name": "BD_Panic_03",
    "desc": "Window panic animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BD_FIRE",
    "name": "BD_Panic_04",
    "desc": "Window panic animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BD_FIRE",
    "name": "BD_Panic_Loop",
    "desc": "Window panic animation loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BD_FIRE",
    "name": "Grlfrd_Kiss_03",
    "desc": "Girlfriend kiss",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BD_FIRE",
    "name": "M_smklean_loop",
    "desc": "Male lean and smoking animation loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BD_FIRE",
    "name": "Playa_Kiss_03",
    "desc": "Player kiss animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BD_FIRE",
    "name": "wash_up",
    "desc": "Wash animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BEACH",
    "name": "bather",
    "desc": "Female sunbathing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BEACH",
    "name": "Lay_Bac_Loop",
    "desc": "Male sunbathing animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BEACH",
    "name": "ParkSit_M_loop",
    "desc": "Male beach sitting",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BEACH",
    "name": "ParkSit_W_loop",
    "desc": "Female beach sitting",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BEACH",
    "name": "SitnWait_loop_W",
    "desc": "Alternative male beach sitting",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "benchpress",
    "name": "gym_bp_celebrate",
    "desc": "Gym after workout animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "benchpress",
    "name": "gym_bp_down",
    "desc": "Benchpress lowering",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "benchpress",
    "name": "gym_bp_getoff",
    "desc": "Finishing benchpress workout",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "benchpress",
    "name": "gym_bp_geton",
    "desc": "Starting benchpress workout",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "benchpress",
    "name": "gym_bp_up_A",
    "desc": "Benchpress lifting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "benchpress",
    "name": "gym_bp_up_B",
    "desc": "Benchpress lifting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "benchpress",
    "name": "gym_bp_up_smooth",
    "desc": "Benchpress lifting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BF_injection",
    "name": "BF_getin_LHS",
    "desc": "Entering a bf injection from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BF_injection",
    "name": "BF_getin_RHS",
    "desc": "Entering a bf injection from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BF_injection",
    "name": "BF_getout_LHS",
    "desc": "Exiting a bf injection from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BF_injection",
    "name": "BF_getout_RHS",
    "desc": "Exiting a bf injection from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_Back",
    "desc": "Sanchez lean back",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_drivebyFT",
    "desc": "Sanchez drive by front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_drivebyLHS",
    "desc": "Sanchez drive by left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_drivebyRHS",
    "desc": "Sanchez drive by right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_Fwd",
    "desc": "Sanchez lean front",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_getoffBACK",
    "desc": "Jumping off a Sanchez at high speed",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_getoffLHS",
    "desc": "Getting off a Sanchez from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_getoffRHS",
    "desc": "Getting off a Sanchez from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_hit",
    "desc": "Sanchez hit",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_jumponL",
    "desc": "Sanchez enter from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_jumponR",
    "desc": "Sanchez enter from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_kick",
    "desc": "Sanchez kick from the front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_Left",
    "desc": "Sanchez sway left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_passenger",
    "desc": "Sanchez passenger flinch",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_pushes",
    "desc": "Sanchez reverse",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_Ride",
    "desc": "Sanchez riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_Right",
    "desc": "Sanchez sway right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_shuffle",
    "desc": "Get on bike from back",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKED",
    "name": "BIKEd_Still",
    "desc": "Sanchez still riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_Back",
    "desc": "Freeway lean back",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_drivebyFT",
    "desc": "Freeway lean back",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_drivebyLHS",
    "desc": "Freeway drive by left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_drivebyRHS",
    "desc": "Freeway drive by right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_Fwd",
    "desc": "Freeway lean front",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_getoffBACK",
    "desc": "Freeway bail at high speed",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_getoffLHS",
    "desc": "Getting off a Freeway from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_getoffRHS",
    "desc": "Getting off a Freeway from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_hit",
    "desc": "Freeway hit",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_jumponL",
    "desc": "Getting on a Freeway from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_jumponR",
    "desc": "Getting on a Freeway from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_kick",
    "desc": "Jumping on a Freeway from the front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_Left",
    "desc": "Freeway sway left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_passenger",
    "desc": "Freeway Passenger flinch",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_pushes",
    "desc": "Freeway reversing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_Ride",
    "desc": "Freeway riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_Right",
    "desc": "Freeway sway right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEH",
    "name": "BIKEh_Still",
    "desc": "Freeway still riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKELEAP",
    "name": "bk_blnce_in",
    "desc": "Balance in while standing on a bike",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BIKELEAP",
    "name": "bk_blnce_out",
    "desc": "Getting back to bike's seat after standing",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BIKELEAP",
    "name": "bk_jmp",
    "desc": "Jumping from a bike",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKELEAP",
    "name": "bk_rdy_in",
    "desc": "Getting ready to jump from a bike",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKELEAP",
    "name": "bk_rdy_out",
    "desc": "Cancelling a jump from a bike",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKELEAP",
    "name": "struggle_cesar",
    "desc": "Fighting a truck's driver",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKELEAP",
    "name": "struggle_driver",
    "desc": "Truck driver struggling with an attacker",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKELEAP",
    "name": "truck_driver",
    "desc": "Truck driver getting thrown out",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKELEAP",
    "name": "truck_getin",
    "desc": "Truck hijacker steals a truck",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_Back",
    "desc": "PCJ lean back",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_drivebyFT",
    "desc": "PCJ drive by front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_drivebyLHS",
    "desc": "PCJ drive by left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_drivebyRHS",
    "desc": "PCJ drive by right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_Fwd",
    "desc": "PCJ lean front",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_getoffBACK",
    "desc": "Bailing from a PCJ at high speed",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_getoffLHS",
    "desc": "Getting off a PCJ from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_getoffRHS",
    "desc": "Getting off a PCJ from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_hit",
    "desc": "Getting hit on a PCJ",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_jumponL",
    "desc": "Getting on a PCJ from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_jumponR",
    "desc": "Getting on a PCJ from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_kick",
    "desc": "Getting on a PCJ from the front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_Left",
    "desc": "PCJ sway left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_passenger",
    "desc": "PCJ passanger anim",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_pushes",
    "desc": "PCJ reverse animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_Ride",
    "desc": "PCJ riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_Right",
    "desc": "PCJ sway right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_Snatch_L",
    "desc": "Snatching from the left while riding a PCJ",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_Snatch_R",
    "desc": "Snatching from the right while riding a PCJ",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKES",
    "name": "BIKEs_Still",
    "desc": "PCJ still riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_Back",
    "desc": "Faggio lean back",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_drivebyFT",
    "desc": "Faggio drive by front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_drivebyLHS",
    "desc": "Faggio drive by left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_drivebyRHS",
    "desc": "Faggio drive by right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_Fwd",
    "desc": "Faggio lean front",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_getoffBACK",
    "desc": "Bailing from a Faggio at high speed",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_getoffLHS",
    "desc": "Getting off a Faggio from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_getoffRHS",
    "desc": "Getting off a Faggio from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_hit",
    "desc": "Getting hit on a Faggio",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_jumponL",
    "desc": "Getting on a Faggio from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_jumponR",
    "desc": "Getting on a Faggio from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_kick",
    "desc": "Getting on a Faggio from the front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_Left",
    "desc": "Faggio sway left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_passenger",
    "desc": "Faggio passanger anim",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_pushes",
    "desc": "Faggio reverse",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_Ride",
    "desc": "Faggio riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_Right",
    "desc": "Faggio sway right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKEV",
    "name": "BIKEv_Still",
    "desc": "Faggio still riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKE_DBZ",
    "name": "Pass_Driveby_BWD",
    "desc": "Bike passanger drive bying back",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKE_DBZ",
    "name": "Pass_Driveby_FWD",
    "desc": "Bike passanger drive bying front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKE_DBZ",
    "name": "Pass_Driveby_LHS",
    "desc": "Bike passanger drive bying left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BIKE_DBZ",
    "name": "Pass_Driveby_RHS",
    "desc": "Bike passanger drive bying right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_back",
    "desc": "BMX lean back",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_bunnyhop",
    "desc": "BMX bunnyhop",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_drivebyFT",
    "desc": "BMX drive by front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_driveby_LHS",
    "desc": "BMX drive by left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_driveby_RHS",
    "desc": "BMX drive by right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_fwd",
    "desc": "BMX lean front",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_getoffBACK",
    "desc": "BMX bail out at high speed",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_getoffLHS",
    "desc": "Getting off a BMX from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_getoffRHS",
    "desc": "Getting off a BMX from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_jumponL",
    "desc": "Getting on a BMX from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_jumponR",
    "desc": "Getting on a BMX from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_Left",
    "desc": "BMX sway left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_pedal",
    "desc": "BMX pedal",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_pushes",
    "desc": "BMX reversing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_Ride",
    "desc": "BMX riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_Right",
    "desc": "BMX sway right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_sprint",
    "desc": "BMX sprinting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BMX",
    "name": "BMX_still",
    "desc": "BMX still riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BOMBER",
    "name": "BOM_Plant",
    "desc": "Bomb planting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BOMBER",
    "name": "BOM_Plant_2Idle",
    "desc": "Bomb planting idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BOMBER",
    "name": "BOM_Plant_Crouch_In",
    "desc": "Crouching to plant a bomb",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BOMBER",
    "name": "BOM_Plant_Crouch_Out",
    "desc": "Standing up after planting a bomb",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BOMBER",
    "name": "BOM_Plant_In",
    "desc": "Planting a bomb",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BOMBER",
    "name": "BOM_Plant_Loop",
    "desc": "Bomb planting loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BOX",
    "name": "boxhipin",
    "desc": "Putting a box down",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BOX",
    "name": "boxhipup",
    "desc": "Putting a box down",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BOX",
    "name": "boxshdwn",
    "desc": "Putting a box down",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BOX",
    "name": "boxshup",
    "desc": "Putting a box up",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BOX",
    "name": "bxhipwlk",
    "desc": "Walking with a box to the hip",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BOX",
    "name": "bxhwlki",
    "desc": "Box walking",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BOX",
    "name": "bxshwlk",
    "desc": "Box walking",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BOX",
    "name": "bxshwlki",
    "desc": "Box walking",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BOX",
    "name": "bxwlko",
    "desc": "Box walking",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BOX",
    "name": "catch_box",
    "desc": "Catching a box",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_def_jump_shot",
    "desc": "Basktball defense block shot while jumping",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_def_loop",
    "desc": "Basketball defense loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_def_stepL",
    "desc": "Basketball defense step left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_def_stepR",
    "desc": "Basketball defense step right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_Dnk",
    "desc": "Basketball dunking animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_Dnk_Gli",
    "desc": "Basketball dunking animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_Dnk_Gli_O",
    "desc": "Missing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_Dnk_Lnch",
    "desc": "Basketball dunking animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_Dnk_Lnch_O",
    "desc": "Missing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_Dnk_Lnd",
    "desc": "Landing on the ground after dunking",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_Dnk_O",
    "desc": "Missing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_idle",
    "desc": "Basketball trick animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_idle2",
    "desc": "Basketball trick animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_idle2_O",
    "desc": "Missing animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_idleloop",
    "desc": "Basketball idle animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_idleloop_O",
    "desc": "Missing animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_idle_O",
    "desc": "Missing animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_Jump_Cancel",
    "desc": "Basketball jump cancelling",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_Jump_Cancel_O",
    "desc": "Missing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_Jump_End",
    "desc": "Landing on the ground after shooting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_Jump_Shot",
    "desc": "Basketball shooting",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_Jump_Shot_O",
    "desc": "Missing animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_Net_Dnk_O",
    "desc": "Missing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_pickup",
    "desc": "Picking up a basketball",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_pickup_O",
    "desc": "Missing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_react_miss",
    "desc": "Basketball reaction to missing the shot",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_react_score",
    "desc": "Basketball reaction to scoring the shot",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_run",
    "desc": "Basketball run and dribble",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_run_O",
    "desc": "Missing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_SkidStop_L",
    "desc": "Skid stop left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_SkidStop_L_O",
    "desc": "Missing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_SkidStop_R",
    "desc": "Skid stop right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_SkidStop_R_O",
    "desc": "Missing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_walk",
    "desc": "Walking with a basketball while dribbling",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_WalkStop_L",
    "desc": "Walk stop left",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_WalkStop_L_O",
    "desc": "Missing animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_WalkStop_R",
    "desc": "Walk stop right",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_WalkStop_R_O",
    "desc": "Missing animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_walk_O",
    "desc": "Missing animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_walk_start",
    "desc": "Basketball walk start",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BSKTBALL",
    "name": "BBALL_walk_start_O",
    "desc": "Missing animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "BUDDY",
    "name": "buddy_crouchfire",
    "desc": "Combat shotgun crouch fire",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BUDDY",
    "name": "buddy_crouchreload",
    "desc": "Combat shotgun crouch reload",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BUDDY",
    "name": "buddy_fire",
    "desc": "Combat shotgun fire",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BUDDY",
    "name": "buddy_fire_poor",
    "desc": "Combat shotgun fire with poor skills",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BUDDY",
    "name": "buddy_reload",
    "desc": "Combat shotgun reload",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "BUS",
    "name": "BUS_close",
    "desc": "Bus door close",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BUS",
    "name": "BUS_getin_LHS",
    "desc": "Getting into a bus from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BUS",
    "name": "BUS_getin_RHS",
    "desc": "Getting into a bus from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BUS",
    "name": "BUS_getout_LHS",
    "desc": "Getting out of a bus from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BUS",
    "name": "BUS_getout_RHS",
    "desc": "Getting out of a bus from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BUS",
    "name": "BUS_jacked_LHS",
    "desc": "Getting thrown off a bus",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BUS",
    "name": "BUS_open",
    "desc": "Bus door opening",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BUS",
    "name": "BUS_open_RHS",
    "desc": "Bus door opening from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "BUS",
    "name": "BUS_pullout_LHS",
    "desc": "Pulling out a bus' driver",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAMERA",
    "name": "camcrch_cmon",
    "desc": "Crouching with a camera and signalling to move",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAMERA",
    "name": "camcrch_idleloop",
    "desc": "Crouching with a camera idle loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAMERA",
    "name": "camcrch_stay",
    "desc": "Signalling to stay with a camera",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAMERA",
    "name": "camcrch_to_camstnd",
    "desc": "Standing up with a camera",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAMERA",
    "name": "camstnd_cmon",
    "desc": "Signalling to move with a camera",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAMERA",
    "name": "camstnd_idleloop",
    "desc": "Standing with a camera",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAMERA",
    "name": "camstnd_lkabt",
    "desc": "Looking around with a camera",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAMERA",
    "name": "camstnd_to_camcrch",
    "desc": "Crouching with a camera",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAMERA",
    "name": "piccrch_in",
    "desc": "Priming camera to take a picture while crouching",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAMERA",
    "name": "piccrch_out",
    "desc": "After picture while crouched",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAMERA",
    "name": "piccrch_take",
    "desc": "Taking a picture while crouched",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAMERA",
    "name": "picstnd_in",
    "desc": "Priming camera to take picture while standing",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAMERA",
    "name": "picstnd_out",
    "desc": "After picture while standing",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAMERA",
    "name": "picstnd_take",
    "desc": "Taking a picture while standing",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR",
    "name": "Fixn_Car_Loop",
    "desc": "Fixing a car loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR",
    "name": "Fixn_Car_Out",
    "desc": "Standing up after fixing a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR",
    "name": "flag_drop",
    "desc": "Race flag drop",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAR",
    "name": "Sit_relaxed",
    "desc": "Relaxed sitting in a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR",
    "name": "Tap_hand",
    "desc": "Tapping hand on the window",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAR",
    "name": "Tyd2car_bump",
    "desc": "Tied to a car hood bump",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAR",
    "name": "Tyd2car_high",
    "desc": "Tied to a car hood with high stress",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAR",
    "name": "Tyd2car_low",
    "desc": "Tied to a car hood with low stress",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAR",
    "name": "Tyd2car_med",
    "desc": "Tied to a car hood with medium stress",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAR",
    "name": "Tyd2car_TurnL",
    "desc": "Tied to a car hood sway left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAR",
    "name": "Tyd2car_TurnR",
    "desc": "Tied to a car hood sway right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CARRY",
    "name": "crry_prtial",
    "desc": "Start carry animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CARRY",
    "name": "liftup",
    "desc": "Lift up item",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CARRY",
    "name": "liftup05",
    "desc": "Lift up item from medium height",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CARRY",
    "name": "liftup105",
    "desc": "Lift up item from high surface",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CARRY",
    "name": "putdwn",
    "desc": "Put down item",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CARRY",
    "name": "putdwn05",
    "desc": "Put down item on medium height surface",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CARRY",
    "name": "putdwn105",
    "desc": "Put down item on high surface",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "carfone_in",
    "desc": "Starting to talk on phone inside a car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "carfone_loopA",
    "desc": "Phone conversation inside a car loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "carfone_loopA_to_B",
    "desc": "Phone conversation inside a car transition",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "carfone_loopB",
    "desc": "Phone conversation inside a car loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "carfone_loopB_to_A",
    "desc": "Phone conversation insie a car transition",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "carfone_out",
    "desc": "Hanging up inside a car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "CAR_Sc1_BL",
    "desc": "Chatting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "CAR_Sc1_BR",
    "desc": "Chatting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "CAR_Sc1_FL",
    "desc": "Chatting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "CAR_Sc1_FR",
    "desc": "Chatting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "CAR_Sc2_FL",
    "desc": "Chatting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "CAR_Sc3_BR",
    "desc": "Chatting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "CAR_Sc3_FL",
    "desc": "Chatting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "CAR_Sc3_FR",
    "desc": "Chatting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "CAR_Sc4_BL",
    "desc": "Chatting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "CAR_Sc4_BR",
    "desc": "Chatting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "CAR_Sc4_FL",
    "desc": "Chatting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "CAR_Sc4_FR",
    "desc": "Chatting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "car_talkm_in",
    "desc": "Starting a chat inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "car_talkm_loop",
    "desc": "Chatting inside a car loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CAR_CHAT",
    "name": "car_talkm_out",
    "desc": "Ending a chat inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "cards_in",
    "desc": "Entering a game of cards",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "cards_loop",
    "desc": "Card table game loop animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "cards_lose",
    "desc": "Losing at cards",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "cards_out",
    "desc": "Exiting a game of cards",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "cards_pick_01",
    "desc": "Picking a card",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "cards_pick_02",
    "desc": "Picking a card",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "cards_raise",
    "desc": "Raising the stakes at cards",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "cards_win",
    "desc": "Winning at cards",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "dealone",
    "desc": "Dealer deals one card",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "manwinb",
    "desc": "Male winning animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "manwind",
    "desc": "Male winning animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "Roulette_bet",
    "desc": "Betting on roulette table",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "Roulette_in",
    "desc": "Entering a game of roulette",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "Roulette_loop",
    "desc": "Waiting for roulette to stop loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "Roulette_lose",
    "desc": "Lose at a roulette table",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "Roulette_out",
    "desc": "Leaving roulette table",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "Roulette_win",
    "desc": "Roulette winning animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "Slot_bet_01",
    "desc": "Slot betting animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "Slot_bet_02",
    "desc": "Slot betting animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "Slot_in",
    "desc": "Slot machine start animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "Slot_lose_out",
    "desc": "End of Slot machine lose",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "Slot_Plyr",
    "desc": "Using a slot machine",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "Slot_wait",
    "desc": "Waiting for a slot machine to stop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "Slot_win_out",
    "desc": "End of slot machine win",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CASINO",
    "name": "wof",
    "desc": "Wheel of fortune spin",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHAINSAW",
    "name": "CSAW_1",
    "desc": "Chainsaw swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHAINSAW",
    "name": "CSAW_2",
    "desc": "Chainsaw swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHAINSAW",
    "name": "CSAW_3",
    "desc": "Chainsaw swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHAINSAW",
    "name": "CSAW_G",
    "desc": "Chainsaw hit on the ground",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "CHAINSAW",
    "name": "CSAW_Hit_1",
    "desc": "Getting hit by a chainsaw",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "CHAINSAW",
    "name": "CSAW_Hit_2",
    "desc": "Getting hit by a chainsaw",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "CHAINSAW",
    "name": "CSAW_Hit_3",
    "desc": "Getting hit by a chainsaw",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "CHAINSAW",
    "name": "csaw_part",
    "desc": "Chainsaw holding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHAINSAW",
    "name": "IDLE_csaw",
    "desc": "Idle with a chainsaw",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CHAINSAW",
    "name": "WEAPON_csaw",
    "desc": "VC chainsaw swing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHAINSAW",
    "name": "WEAPON_csawlo",
    "desc": "VC chainsaw ground swing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_back",
    "desc": "Chopper bicycle lean back",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_bunnyhop",
    "desc": "Chopper bicycle bunny hop",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_drivebyFT",
    "desc": "Chopper bicycle drive by front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_driveby_LHS",
    "desc": "Chopper bicycle drive by left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_driveby_RHS",
    "desc": "Chopper bicycle drive by right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_fwd",
    "desc": "Chopper bicycle lean front",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_getoffBACK",
    "desc": "Bailing from a Chopper bicycle at high speed",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_getoffLHS",
    "desc": "Getting off a Chopper bicycle from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_getoffRHS",
    "desc": "Getting off a Chopper bicycle from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_jumponL",
    "desc": "Getting on a Chopper bicycle from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_jumponR",
    "desc": "Getting on a Chopper bicycle from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_Left",
    "desc": "Chopper bicycle sway left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_pedal",
    "desc": "Chopper bicycle pedal",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_Pushes",
    "desc": "Chopper bicycle reverse",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_ride",
    "desc": "Chopper bicycle riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_Right",
    "desc": "Chopper bicycle sway right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_sprint",
    "desc": "Chopper bicycle sprint",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CHOPPA",
    "name": "CHOPPA_Still",
    "desc": "Chopper bicycle riding still",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CLOTHES",
    "name": "CLO_Buy",
    "desc": "Buying clothes pose",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CLOTHES",
    "name": "CLO_In",
    "desc": "Walking into the wardrobe",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CLOTHES",
    "name": "CLO_Out",
    "desc": "Walking out of the wardrobe",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CLOTHES",
    "name": "CLO_Pose_Hat",
    "desc": "Posing with a hat",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CLOTHES",
    "name": "CLO_Pose_In",
    "desc": "Start of clothes pose",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CLOTHES",
    "name": "CLO_Pose_In_O",
    "desc": "Start of clothes pose",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CLOTHES",
    "name": "CLO_Pose_Legs",
    "desc": "Posing with new pants",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CLOTHES",
    "name": "CLO_Pose_Loop",
    "desc": "Posing loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CLOTHES",
    "name": "CLO_Pose_Out",
    "desc": "End of clothes pose",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CLOTHES",
    "name": "CLO_Pose_Out_O",
    "desc": "End of clothes pose",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CLOTHES",
    "name": "CLO_Pose_Shoes",
    "desc": "Posing with new shoes",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CLOTHES",
    "name": "CLO_Pose_Torso",
    "desc": "Posing with new torso",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CLOTHES",
    "name": "CLO_Pose_Watch",
    "desc": "Posing with a new watch",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COACH",
    "name": "COACH_inL",
    "desc": "Entering a Coach from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COACH",
    "name": "COACH_inR",
    "desc": "Entering a Coach from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COACH",
    "name": "COACH_opnL",
    "desc": "Opening a Coach's door from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COACH",
    "name": "COACH_opnR",
    "desc": "Opening a Coach's door from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COACH",
    "name": "COACH_outL",
    "desc": "Exiting a Coach from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COACH",
    "name": "COACH_outR",
    "desc": "Exiting a Coach from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COLT45",
    "name": "2guns_crouchfire",
    "desc": "Crouch fire with two guns",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COLT45",
    "name": "colt45_crouchfire",
    "desc": "Crouch fire with a Colt45",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COLT45",
    "name": "colt45_crouchreload",
    "desc": "Reload a Colt45 while crouching",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COLT45",
    "name": "colt45_fire",
    "desc": "Colt45 fire",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COLT45",
    "name": "colt45_fire_2hands",
    "desc": "Duel Colt45 firing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COLT45",
    "name": "colt45_reload",
    "desc": "Colt45 reload",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COLT45",
    "name": "sawnoff_reload",
    "desc": "Sawnoff reload",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COP_AMBIENT",
    "name": "Copbrowse_in",
    "desc": "Cop kneeling and checking tire",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COP_AMBIENT",
    "name": "Copbrowse_loop",
    "desc": "Cop kneeling and fixing tire loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "COP_AMBIENT",
    "name": "Copbrowse_nod",
    "desc": "Cop kneeling and nodding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COP_AMBIENT",
    "name": "Copbrowse_out",
    "desc": "Cop stands up after kneeling",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "COP_AMBIENT",
    "name": "Copbrowse_shake",
    "desc": "Cop kneeling and shakes something",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COP_AMBIENT",
    "name": "Coplook_in",
    "desc": "Cop crossing his arms",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COP_AMBIENT",
    "name": "Coplook_loop",
    "desc": "Cop crossing his arms loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "COP_AMBIENT",
    "name": "Coplook_nod",
    "desc": "Cop nodding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COP_AMBIENT",
    "name": "Coplook_out",
    "desc": "Cop waiting animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "COP_AMBIENT",
    "name": "Coplook_shake",
    "desc": "Cop waiting animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "COP_AMBIENT",
    "name": "Coplook_think",
    "desc": "Cop thinking animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COP_AMBIENT",
    "name": "Coplook_watch",
    "desc": "Cop checking watch while crossing arms",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COP_DVBYZ",
    "name": "COP_Dvby_B",
    "desc": "Copbike drive by back",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COP_DVBYZ",
    "name": "COP_Dvby_FT",
    "desc": "Copbike drive by front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COP_DVBYZ",
    "name": "COP_Dvby_L",
    "desc": "Copbike drive by left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "COP_DVBYZ",
    "name": "COP_Dvby_R",
    "desc": "Copbike drive by right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CRACK",
    "name": "Bbalbat_Idle_01",
    "desc": "Crackhead baseball bat idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CRACK",
    "name": "Bbalbat_Idle_02",
    "desc": "Crackhead baseball bat idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CRACK",
    "name": "crckdeth1",
    "desc": "Crackhead dying animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CRACK",
    "name": "crckdeth2",
    "desc": "Crackhead dying animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CRACK",
    "name": "crckdeth3",
    "desc": "Crackhead dying animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CRACK",
    "name": "crckdeth4",
    "desc": "Crackhead dying animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CRACK",
    "name": "crckidle1",
    "desc": "Crackhead idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CRACK",
    "name": "crckidle2",
    "desc": "Crackhead idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CRACK",
    "name": "crckidle3",
    "desc": "Crackhead idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CRACK",
    "name": "crckidle4",
    "desc": "Crackhead idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CRIB",
    "name": "CRIB_Console_Loop",
    "desc": "Game console loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CRIB",
    "name": "CRIB_Use_Switch",
    "desc": "Game console switch",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "CRIB",
    "name": "PED_Console_Loop",
    "desc": "Game console loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CRIB",
    "name": "PED_Console_Loose",
    "desc": "Game console losing",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "CRIB",
    "name": "PED_Console_Win",
    "desc": "Game console winning",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DAM_JUMP",
    "name": "DAM_Dive_Loop",
    "desc": "Diving loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DAM_JUMP",
    "name": "DAM_Land",
    "desc": "Diving land in water",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DAM_JUMP",
    "name": "DAM_Launch",
    "desc": "Running to dive",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DAM_JUMP",
    "name": "Jump_Roll",
    "desc": "End of the line jump and roll",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DAM_JUMP",
    "name": "SF_JumpWall",
    "desc": "Rail jump into a body of water",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DANCING",
    "name": "bd_clap",
    "desc": "Clapping dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DANCING",
    "name": "bd_clap1",
    "desc": "Clapping dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DANCING",
    "name": "dance_loop",
    "desc": "Dancing loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DANCING",
    "name": "DAN_Down_A",
    "desc": "Dance animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DANCING",
    "name": "DAN_Left_A",
    "desc": "Dance animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DANCING",
    "name": "DAN_Loop_A",
    "desc": "Dance animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DANCING",
    "name": "DAN_Right_A",
    "desc": "Dance animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DANCING",
    "name": "DAN_Up_A",
    "desc": "Dance animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DANCING",
    "name": "dnce_M_a",
    "desc": "Dance animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DANCING",
    "name": "dnce_M_b",
    "desc": "Dance animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DANCING",
    "name": "dnce_M_c",
    "desc": "Dance animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DANCING",
    "name": "dnce_M_d",
    "desc": "Dance animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DANCING",
    "name": "dnce_M_e",
    "desc": "Dance animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DEALER",
    "name": "DEALER_DEAL",
    "desc": "Drug dealer dealing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DEALER",
    "name": "DEALER_IDLE",
    "desc": "Drug dealer idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DEALER",
    "name": "DEALER_IDLE_01",
    "desc": "Drug dealer idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DEALER",
    "name": "DEALER_IDLE_02",
    "desc": "Drug dealer idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DEALER",
    "name": "DEALER_IDLE_03",
    "desc": "Drug dealer idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DEALER",
    "name": "DRUGS_BUY",
    "desc": "Buying drugs from a dealer",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DEALER",
    "name": "shop_pay",
    "desc": "Paying money at a shop",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DILDO",
    "name": "DILDO_1",
    "desc": "Dildo swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DILDO",
    "name": "DILDO_2",
    "desc": "Dildo swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DILDO",
    "name": "DILDO_3",
    "desc": "Dildo swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DILDO",
    "name": "DILDO_block",
    "desc": "Dildo block",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DILDO",
    "name": "DILDO_G",
    "desc": "Dildo swing on ground",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DILDO",
    "name": "DILDO_Hit_1",
    "desc": "Getting hit by a dildo",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "DILDO",
    "name": "DILDO_Hit_2",
    "desc": "Getting hit by a dildo",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "DILDO",
    "name": "DILDO_Hit_3",
    "desc": "Getting hit by a dildo",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "DILDO",
    "name": "DILDO_IDLE",
    "desc": "Dildo idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "DODGE",
    "name": "Cover_Dive_01",
    "desc": "Run and dive",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DODGE",
    "name": "Cover_Dive_02",
    "desc": "Run and dive",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DODGE",
    "name": "Crushed",
    "desc": "Getting ready to dodge",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DODGE",
    "name": "Crush_Jump",
    "desc": "Jumping and rolling to the side",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DOZER",
    "name": "DOZER_Align_LHS",
    "desc": "Climbing a dozer from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DOZER",
    "name": "DOZER_Align_RHS",
    "desc": "Climbing a dozer from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DOZER",
    "name": "DOZER_getin_LHS",
    "desc": "Getting into a dozer from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DOZER",
    "name": "DOZER_getin_RHS",
    "desc": "Getting into a dozer from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DOZER",
    "name": "DOZER_getout_LHS",
    "desc": "Getting out of a dozer from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DOZER",
    "name": "DOZER_getout_RHS",
    "desc": "Getting out of a dozer from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DOZER",
    "name": "DOZER_Jacked_LHS",
    "desc": "Getting jacked out of a dozer from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DOZER",
    "name": "DOZER_Jacked_RHS",
    "desc": "Getting jacked out of a dozer from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DOZER",
    "name": "DOZER_pullout_LHS",
    "desc": "Pulling a dozer driver from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DOZER",
    "name": "DOZER_pullout_RHS",
    "desc": "Pulling a dozer driver from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DRIVEBYS",
    "name": "Gang_DrivebyLHS",
    "desc": "Gang drive by left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DRIVEBYS",
    "name": "Gang_DrivebyLHS_Bwd",
    "desc": "Gang drive by back",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DRIVEBYS",
    "name": "Gang_DrivebyLHS_Fwd",
    "desc": "Gang drive by front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DRIVEBYS",
    "name": "Gang_DrivebyRHS",
    "desc": "Gang drive by right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DRIVEBYS",
    "name": "Gang_DrivebyRHS_Bwd",
    "desc": "Right seat drive by back",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DRIVEBYS",
    "name": "Gang_DrivebyRHS_Fwd",
    "desc": "Right seat drive by front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DRIVEBYS",
    "name": "Gang_DrivebyTop_LHS",
    "desc": "Gang drive by top left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "DRIVEBYS",
    "name": "Gang_DrivebyTop_RHS",
    "desc": "Gang drive by top right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatIdle",
    "desc": "Fat CJ idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatIdle_armed",
    "desc": "Fat CJ armed stance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatIdle_Csaw",
    "desc": "Fat CJ with a chainsaw",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatIdle_Rocket",
    "desc": "Fat CJ with a rocket launcher",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatRun",
    "desc": "Fat CJ run",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatRun_armed",
    "desc": "Fat CJ run with a weapon",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatRun_Csaw",
    "desc": "Fat CJ run with a chainsaw",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatRun_Rocket",
    "desc": "Fat CJ run with a rocket launcher",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatSprint",
    "desc": "Fat CJ sprint",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatWalk",
    "desc": "Fat CJ walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatWalkstart",
    "desc": "Fat CJ walk start",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatWalkstart_Csaw",
    "desc": "Fat CJ walk start with a chainsaw",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatWalkSt_armed",
    "desc": "Fat CJ walk start with a weapon",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatWalkSt_Rocket",
    "desc": "Fat CJ walk start with a rocket launcher",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatWalk_armed",
    "desc": "Fat CJ walk with a weapon",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatWalk_Csaw",
    "desc": "Fat CJ walk with a chainsaw",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "FatWalk_Rocket",
    "desc": "Fat CJ walk with a rocket launcher",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FAT",
    "name": "IDLE_tired",
    "desc": "Fat CJ tired idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FIGHT_B",
    "name": "FightB_1",
    "desc": "Boxing fighting style combo 1",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_B",
    "name": "FightB_2",
    "desc": "Boxing fighting style combo 2",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_B",
    "name": "FightB_3",
    "desc": "Boxing fighting style finisher",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_B",
    "name": "FightB_block",
    "desc": "Boxing fighting style block",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_B",
    "name": "FightB_G",
    "desc": "Boxing fighting style ground attack",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_B",
    "name": "FightB_IDLE",
    "desc": "Boxing fighting style idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FIGHT_B",
    "name": "FightB_M",
    "desc": "Boxing fighting style running attack",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_B",
    "name": "HitB_1",
    "desc": "Hit by boxing style",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FIGHT_B",
    "name": "HitB_2",
    "desc": "Hit by boxing style",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FIGHT_B",
    "name": "HitB_3",
    "desc": "Hit by boxing style",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FIGHT_C",
    "name": "FightC_1",
    "desc": "Kung Fu kick 1",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_C",
    "name": "FightC_2",
    "desc": "Kung Fu kick 2",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_C",
    "name": "FightC_3",
    "desc": "Kung Fu finisher",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_C",
    "name": "FightC_block",
    "desc": "Kung Fu block",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_C",
    "name": "FightC_blocking",
    "desc": "Kung Fu sparring and blocking",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_C",
    "name": "FightC_G",
    "desc": "Kung Fu ground attack",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_C",
    "name": "FightC_IDLE",
    "desc": "Kung Fu idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FIGHT_C",
    "name": "FightC_M",
    "desc": "Kung Fu running attack",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_C",
    "name": "FightC_Spar",
    "desc": "Kung Fu sparring",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_C",
    "name": "HitC_1",
    "desc": "Hit by Kung fu",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FIGHT_C",
    "name": "HitC_2",
    "desc": "Hit by Kung fu",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FIGHT_C",
    "name": "HitC_3",
    "desc": "Hit by Kung fu",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FIGHT_D",
    "name": "FightD_1",
    "desc": "Muay Thai kick",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_D",
    "name": "FightD_2",
    "desc": "Muay Thai combo",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_D",
    "name": "FightD_3",
    "desc": "Muay Thai finisher",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_D",
    "name": "FightD_block",
    "desc": "Muay Thai block",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_D",
    "name": "FightD_G",
    "desc": "Muay Thai ground attack",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_D",
    "name": "FightD_IDLE",
    "desc": "Muay Thai idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FIGHT_D",
    "name": "FightD_M",
    "desc": "Muay Thai running attack",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_D",
    "name": "HitD_1",
    "desc": "Hit by Muay Thai",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FIGHT_D",
    "name": "HitD_2",
    "desc": "Hit by Muay Thai",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FIGHT_D",
    "name": "HitD_3",
    "desc": "Hit by Muay Thai",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FIGHT_E",
    "name": "FightKick",
    "desc": "CJ's default fighting style punch",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_E",
    "name": "FightKick_B",
    "desc": "CJ's default fighting style kick",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FIGHT_E",
    "name": "Hit_fightkick",
    "desc": "Hit by default fighting style",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FIGHT_E",
    "name": "Hit_fightkick_B",
    "desc": "Kicked by default fighting style",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FINALE",
    "name": "FIN_Climb_In",
    "desc": "Sweet climbs into a car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FINALE",
    "name": "FIN_Cop1_ClimbOut2",
    "desc": "Cop walks on Firetrack's ladder",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FINALE",
    "name": "FIN_Cop1_Loop",
    "desc": "Cop standing on Firetrack's ladder",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FINALE",
    "name": "FIN_Cop1_Stomp",
    "desc": "Cop stomping on Sweet's fingers",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FINALE",
    "name": "FIN_Hang_L",
    "desc": "Sweet sways left while holding the ladder",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FINALE",
    "name": "FIN_Hang_Loop",
    "desc": "Sweet hangs onto the ladder loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FINALE",
    "name": "FIN_Hang_R",
    "desc": "Sweet sways right while holding the ladder",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FINALE",
    "name": "FIN_Hang_Slip",
    "desc": "Sweet slips while hanging onto the ladder",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FINALE",
    "name": "FIN_Jump_On",
    "desc": "Sweet jumps on CJ's car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FINALE",
    "name": "FIN_Land_Car",
    "desc": "Sweet lands on CJ's car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FINALE",
    "name": "FIN_Land_Die",
    "desc": "Sweet lands in traffic and dies",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FINALE",
    "name": "FIN_LegsUp",
    "desc": "Sweet pulls his legs while hanging on",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FINALE",
    "name": "FIN_LegsUp_L",
    "desc": "Sweet sways left while pulling his legs",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FINALE",
    "name": "FIN_LegsUp_Loop",
    "desc": "Sweet pulls his legs while hanging on loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FINALE",
    "name": "FIN_LegsUp_R",
    "desc": "Sweet sways right while pulling his legs",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FINALE",
    "name": "FIN_Let_Go",
    "desc": "Sweet lets go of the ladder",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FINALE2",
    "name": "FIN_Cop1_ClimbOut",
    "desc": "Cop climbs out of the firetrack",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FINALE2",
    "name": "FIN_Cop1_Fall",
    "desc": "Cop falls off the firetrack ladder",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FINALE2",
    "name": "FIN_Cop1_Loop",
    "desc": "Cop hangs onto the ladder",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FINALE2",
    "name": "FIN_Cop1_Shot",
    "desc": "Cop is shot while on the ladder",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FINALE2",
    "name": "FIN_Cop1_Swing",
    "desc": "Cop swings while dead",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FINALE2",
    "name": "FIN_Cop2_ClimbOut",
    "desc": "Cop 2 climbs out of the firetrack",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FINALE2",
    "name": "FIN_Switch_P",
    "desc": "Driver switches with passanger",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FINALE2",
    "name": "FIN_Switch_S",
    "desc": "Passanger switches with driver",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FLAME",
    "name": "FLAME_fire",
    "desc": "Flamethrower firing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "Flowers",
    "name": "Flower_attack",
    "desc": "Attacking with flowers",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "Flowers",
    "name": "Flower_attack_M",
    "desc": "Attacking with flowers",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "Flowers",
    "name": "Flower_Hit",
    "desc": "Getting hit with flowers",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "FOOD",
    "name": "EAT_Burger",
    "desc": "Eating a burger",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "EAT_Chicken",
    "desc": "Eating chicken",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "EAT_Pizza",
    "desc": "Eating pizza",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "EAT_Vomit_P",
    "desc": "Vomiting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "EAT_Vomit_SK",
    "desc": "Vomiting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Dam_Bkw",
    "desc": "Getting hit from the back while sitting",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Dam_Fwd",
    "desc": "Getting hit from the front while sitting",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Dam_Left",
    "desc": "Getting hit from the left while sitting",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Dam_Right",
    "desc": "Getting hit from the right while sitting",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Die_Bkw",
    "desc": "Dying while sitting down from the back",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Die_Fwd",
    "desc": "Dying while sitting down from the front",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Die_Left",
    "desc": "Dying while sitting down fron the left",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Die_Right",
    "desc": "Dying while sitting down from the right",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Sit_Eat1",
    "desc": "Eating food while sitting down",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Sit_Eat2",
    "desc": "Eating food while sitting down",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Sit_Eat3",
    "desc": "Eating food while sitting down",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Sit_In",
    "desc": "Sitting down at a table",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Sit_In_L",
    "desc": "Taking a seat from the left",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Sit_In_R",
    "desc": "Taking a seat from the right",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Sit_Look",
    "desc": "Looking while sitting down",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Sit_Loop",
    "desc": "Looking while sitting down loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Sit_Out_180",
    "desc": "Standing up while doing a 180",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Sit_Out_L_180",
    "desc": "Standing up from the left and doing a 180",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "FF_Sit_Out_R_180",
    "desc": "Standing up from the right and doing a 180",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "SHP_Thank",
    "desc": "Shop clerk thanks customer",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "SHP_Tray_In",
    "desc": "Shop clerk inserts tray in",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "SHP_Tray_Lift",
    "desc": "Shop clerk lifts a tray up a counter",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "SHP_Tray_Lift_In",
    "desc": "Shop clerk lifts a tray up a counter",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "SHP_Tray_Lift_Loop",
    "desc": "Shop clerk with a tray loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "SHP_Tray_Lift_Out",
    "desc": "Shop clerk lifts down a tray",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "SHP_Tray_Out",
    "desc": "Shop clerk pulls a tray out",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "SHP_Tray_Pose",
    "desc": "Shop clerk idles with the tray",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "FOOD",
    "name": "SHP_Tray_Return",
    "desc": "Shop clerk returns tray",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "Freeweights",
    "name": "gym_barbell",
    "desc": "Sitting down while lifting a dumbell",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "Freeweights",
    "name": "gym_free_A",
    "desc": "Standing while lifting up dumbells",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "Freeweights",
    "name": "gym_free_B",
    "desc": "Standing while lifting up dumbells",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "Freeweights",
    "name": "gym_free_celebrate",
    "desc": "Flexing muscles animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "Freeweights",
    "name": "gym_free_down",
    "desc": "Standing while lifting down dumbells",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "Freeweights",
    "name": "gym_free_loop",
    "desc": "Holding dumbells",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "Freeweights",
    "name": "gym_free_pickup",
    "desc": "Wiping hands then picking up dumbells",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "Freeweights",
    "name": "gym_free_putdown",
    "desc": "Putting down dumbells",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "Freeweights",
    "name": "gym_free_up_smooth",
    "desc": "Smooth dumbell lift animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "DEALER_DEAL",
    "desc": "Drug dealer dealing drugs animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "DEALER_IDLE",
    "desc": "Drug dealer idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "drnkbr_prtl",
    "desc": "Gang drink bottle",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "drnkbr_prtl_F",
    "desc": "Gang drink bottle",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "DRUGS_BUY",
    "desc": "Buying drugs from a dealer",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "hndshkaa",
    "desc": "Gang handshake",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "hndshkba",
    "desc": "Gang handshake",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "hndshkca",
    "desc": "Gang handshake",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "hndshkcb",
    "desc": "Gang handshake",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "hndshkda",
    "desc": "Gang handshake",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "hndshkea",
    "desc": "Gang handshake",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "hndshkfa",
    "desc": "Gang handshake",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "hndshkfa_swt",
    "desc": "Gang handshake",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "Invite_No",
    "desc": "Gang refusing recruitment",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "Invite_Yes",
    "desc": "Gang accepting recruitment",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "leanIDLE",
    "desc": "Leaning idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "leanIN",
    "desc": "Leaning",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "leanOUT",
    "desc": "Leaning end animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "prtial_gngtlkA",
    "desc": "Gang talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "prtial_gngtlkB",
    "desc": "Gang talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "prtial_gngtlkC",
    "desc": "Gang talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "prtial_gngtlkD",
    "desc": "Gang talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "prtial_gngtlkE",
    "desc": "Gang talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "prtial_gngtlkF",
    "desc": "Gang talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "prtial_gngtlkG",
    "desc": "Gang talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "prtial_gngtlkH",
    "desc": "Gang talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "prtial_hndshk_01",
    "desc": "Gang handshake",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "prtial_hndshk_biz_01",
    "desc": "Gang handshake",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "shake_cara",
    "desc": "Shoving a car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "shake_carK",
    "desc": "Kicking a car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "shake_carSH",
    "desc": "Full body slam against a car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "smkcig_prtl",
    "desc": "Smoking animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GANGS",
    "name": "smkcig_prtl_F",
    "desc": "Smoking animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B1",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B2",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B3",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B4",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B5",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B6",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B7",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B8",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B9",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B10",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B11",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B12",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B13",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B14",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B15",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_B16",
    "desc": "Bad \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G1",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G2",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G3",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G4",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G5",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G6",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G7",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G8",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G9",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G10",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G11",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G12",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G13",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G14",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G15",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "Dance_G16",
    "desc": "Good \"G Thang\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GFUNK",
    "name": "dance_loop",
    "desc": "Dancing loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "gsign1",
    "desc": "Gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "gsign1LH",
    "desc": "High gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "gsign2",
    "desc": "Gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "gsign2LH",
    "desc": "High gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "gsign3",
    "desc": "Gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "gsign3LH",
    "desc": "High gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "gsign4",
    "desc": "Gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "gsign4LH",
    "desc": "High gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "gsign5",
    "desc": "Gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "gsign5LH",
    "desc": "High gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "LHGsign1",
    "desc": "Gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "LHGsign2",
    "desc": "Gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "LHGsign3",
    "desc": "Gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "LHGsign4",
    "desc": "Gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "LHGsign5",
    "desc": "Gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "RHGsign1",
    "desc": "Gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "RHGsign2",
    "desc": "Gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "RHGsign3",
    "desc": "Gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "RHGsign4",
    "desc": "Gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHANDS",
    "name": "RHGsign5",
    "desc": "Gang sign",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHETTO_DB",
    "name": "GDB_Car2_PLY",
    "desc": "CJ's animation inside the car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHETTO_DB",
    "name": "GDB_Car2_SMO",
    "desc": "Big Smoke's animation inside the car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHETTO_DB",
    "name": "GDB_Car2_SWE",
    "desc": "Sweet's animation inside the car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHETTO_DB",
    "name": "GDB_Car_PLY",
    "desc": "CJ's animation inside the car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHETTO_DB",
    "name": "GDB_Car_RYD",
    "desc": "Ryder's animation inside the car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHETTO_DB",
    "name": "GDB_Car_SMO",
    "desc": "Big Smoke's animation inside the car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GHETTO_DB",
    "name": "GDB_Car_SWE",
    "desc": "Sweet's animation inside the car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "goggles",
    "name": "goggles_put_on",
    "desc": "Putting on/off NVG goggles",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GRAFFITI",
    "name": "graffiti_Chkout",
    "desc": "Putting away a graffiti can",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GRAFFITI",
    "name": "spraycan_fire",
    "desc": "Spraying with graffiti",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GRAVEYARD",
    "name": "mrnF_loop",
    "desc": "Female mourner loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GRAVEYARD",
    "name": "mrnM_loop",
    "desc": "Male mourner loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GRAVEYARD",
    "name": "prst_loopa",
    "desc": "Graveyard priest loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GRENADE",
    "name": "WEAPON_start_throw",
    "desc": "Start throw animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GRENADE",
    "name": "WEAPON_throw",
    "desc": "Grenade/Molotov high throw",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GRENADE",
    "name": "WEAPON_throwu",
    "desc": "Grenade/Moltotov toss",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "GYMshadowbox",
    "desc": "Boxing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_bike_celebrate",
    "desc": "Celebrating after finishing bike workout",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_bike_fast",
    "desc": "Peddling fast on a gym bike",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_bike_faster",
    "desc": "Peddling faster on a gym bike",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_bike_getoff",
    "desc": "Getting off a gym bike",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_bike_geton",
    "desc": "Getting on a gym bike",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_bike_pedal",
    "desc": "Peddling on a gym bike",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_bike_slow",
    "desc": "Peddling on a gym bike slowly",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_bike_still",
    "desc": "Staying still on a gym bike",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_jog_falloff",
    "desc": "Falling off a treadmill",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_shadowbox",
    "desc": "Boxing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_tread_celebrate",
    "desc": "Celebrating after finishing treadmill workout",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_tread_falloff",
    "desc": "Falling off a treadmill",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_tread_getoff",
    "desc": "Getting off a treadmill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_tread_geton",
    "desc": "Getting on a treadmill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_tread_jog",
    "desc": "Jogging on a treadmill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_tread_sprint",
    "desc": "Sprinting on a treadmill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_tread_tired",
    "desc": "Tired while on a treadmill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_tread_walk",
    "desc": "Walking on a treadmill",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "gym_walk_falloff",
    "desc": "Falling off a treadmill",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "Pedals_fast",
    "desc": "Peddling fast on a gym bike",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "Pedals_med",
    "desc": "Peddling in medium speed on a gym bike",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "Pedals_slow",
    "desc": "Peddling slow on a gym bike",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "GYMNASIUM",
    "name": "Pedals_still",
    "desc": "Stay still on a gym bike",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "HAIRCUTS",
    "name": "BRB_Beard_01",
    "desc": "Barber beard animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HAIRCUTS",
    "name": "BRB_Buy",
    "desc": "Buying haircut animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HAIRCUTS",
    "name": "BRB_Cut",
    "desc": "Barber cutting hair animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HAIRCUTS",
    "name": "BRB_Cut_In",
    "desc": "Start of barber cutting hair animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HAIRCUTS",
    "name": "BRB_Cut_Out",
    "desc": "Barber showing off hair animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HAIRCUTS",
    "name": "BRB_Hair_01",
    "desc": "Admiring haircut",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HAIRCUTS",
    "name": "BRB_Hair_02",
    "desc": "Admiring haircut",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HAIRCUTS",
    "name": "BRB_In",
    "desc": "Barber start animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HAIRCUTS",
    "name": "BRB_Loop",
    "desc": "Barber loop animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "HAIRCUTS",
    "name": "BRB_Out",
    "desc": "Barber end animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HAIRCUTS",
    "name": "BRB_Sit_In",
    "desc": "Sitting on barber's chair",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "HAIRCUTS",
    "name": "BRB_Sit_Loop",
    "desc": "Sitting on barber's chair loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "HAIRCUTS",
    "name": "BRB_Sit_Out",
    "desc": "Getting off the barber's chair",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "HEIST9",
    "name": "CAS_G2_GasKO",
    "desc": "Choking on gas animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HEIST9",
    "name": "swt_wllpk_L",
    "desc": "Taking cover behind a left wall",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HEIST9",
    "name": "swt_wllpk_L_back",
    "desc": "Taking cover behind a left wall",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HEIST9",
    "name": "swt_wllpk_R",
    "desc": "Taking cover behind a right wall",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HEIST9",
    "name": "swt_wllpk_R_back",
    "desc": "Taking cover behind a right wall",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HEIST9",
    "name": "swt_wllshoot_in_L",
    "desc": "Out of left cover with a gun",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HEIST9",
    "name": "swt_wllshoot_in_R",
    "desc": "Out of right cover with a gun",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HEIST9",
    "name": "swt_wllshoot_out_L",
    "desc": "Going back to cover on the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HEIST9",
    "name": "swt_wllshoot_out_R",
    "desc": "Going back to cover on the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "HEIST9",
    "name": "Use_SwipeCard",
    "desc": "Swiping access card",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "INT_HOUSE",
    "name": "BED_In_L",
    "desc": "Getting into bed on the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "INT_HOUSE",
    "name": "BED_In_R",
    "desc": "Getting into bed on the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "INT_HOUSE",
    "name": "BED_Loop_L",
    "desc": "Sleeping on the left side of the bed loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "INT_HOUSE",
    "name": "BED_Loop_R",
    "desc": "Sleeping on the right side of the bed loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "INT_HOUSE",
    "name": "BED_Out_L",
    "desc": "Getting out of bed on the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "INT_HOUSE",
    "name": "BED_Out_R",
    "desc": "Getting out of bed on the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "INT_HOUSE",
    "name": "LOU_In",
    "desc": "Sitting down on a sofa",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "INT_HOUSE",
    "name": "LOU_Loop",
    "desc": "Sitting loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "INT_HOUSE",
    "name": "LOU_Out",
    "desc": "Getting up from a sofa",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "INT_HOUSE",
    "name": "wash_up",
    "desc": "Washing hands at the sink",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "INT_OFFICE",
    "name": "FF_Dam_Fwd",
    "desc": "Getting hit from the front while sitting down",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "INT_OFFICE",
    "name": "OFF_Sit_2Idle_180",
    "desc": "Getting up and doing a 180",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "INT_OFFICE",
    "name": "OFF_Sit_Bored_Loop",
    "desc": "Sitting while bored on a chair",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "INT_OFFICE",
    "name": "OFF_Sit_Crash",
    "desc": "Slamming keyboard while sitting",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "INT_OFFICE",
    "name": "OFF_Sit_Drink",
    "desc": "Drinking while sitting down",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "INT_OFFICE",
    "name": "OFF_Sit_Idle_Loop",
    "desc": "Sitting down loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "INT_OFFICE",
    "name": "OFF_Sit_In",
    "desc": "Taking a sit",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "INT_OFFICE",
    "name": "OFF_Sit_Read",
    "desc": "Reading while sitting",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "INT_OFFICE",
    "name": "OFF_Sit_Type_Loop",
    "desc": "Typing on a keyboard while sitting loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "INT_OFFICE",
    "name": "OFF_Sit_Watch",
    "desc": "Checking your watch while sitting",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "INT_SHOP",
    "name": "shop_cashier",
    "desc": "Opening up the register",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "INT_SHOP",
    "name": "shop_in",
    "desc": "Start of opening up register animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "INT_SHOP",
    "name": "shop_lookA",
    "desc": "Looking at an item in register",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "INT_SHOP",
    "name": "shop_lookB",
    "desc": "Looking at an item in register",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "INT_SHOP",
    "name": "shop_loop",
    "desc": "Handling the register",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "INT_SHOP",
    "name": "shop_out",
    "desc": "End animation for register handling",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "INT_SHOP",
    "name": "shop_pay",
    "desc": "Taking out money and putting on the counter",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "INT_SHOP",
    "name": "shop_shelf",
    "desc": "Taking out an item from a shelf",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "JST_BUISNESS",
    "name": "girl_01",
    "desc": "Girl sitting animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "JST_BUISNESS",
    "name": "girl_02",
    "desc": "Girl sitting animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "JST_BUISNESS",
    "name": "player_01",
    "desc": "CJ's animation from \"Just Business\"",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "JST_BUISNESS",
    "name": "smoke_01",
    "desc": "Big smoke's anim from \"Just Business\"",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KART",
    "name": "KART_getin_LHS",
    "desc": "Getting into a kart from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KART",
    "name": "KART_getin_RHS",
    "desc": "Getting into a kart from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KART",
    "name": "KART_getout_LHS",
    "desc": "Getting out of a kart from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KART",
    "name": "KART_getout_RHS",
    "desc": "Getting out of a kart from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KISSING",
    "name": "BD_GF_Wave",
    "desc": "Girlfriend wave",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "KISSING",
    "name": "gfwave2",
    "desc": "Girlfriend wave",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "KISSING",
    "name": "GF_CarArgue_01",
    "desc": "Arguing inside a car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KISSING",
    "name": "GF_CarArgue_02",
    "desc": "Arguing inside a car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KISSING",
    "name": "GF_CarSpot",
    "desc": "Spotting someone while sitting in a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "KISSING",
    "name": "GF_StreetArgue_01",
    "desc": "Arguing in the street",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KISSING",
    "name": "GF_StreetArgue_02",
    "desc": "Arguing in the street",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KISSING",
    "name": "gift_get",
    "desc": "Receiving a gift",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KISSING",
    "name": "gift_give",
    "desc": "Giving a gift",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KISSING",
    "name": "Grlfrd_Kiss_01",
    "desc": "Girlfriend kissing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KISSING",
    "name": "Grlfrd_Kiss_02",
    "desc": "Girlfriend kissing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KISSING",
    "name": "Grlfrd_Kiss_03",
    "desc": "Girlfriend kissing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KISSING",
    "name": "Playa_Kiss_01",
    "desc": "Player kissing animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "KISSING",
    "name": "Playa_Kiss_02",
    "desc": "Player kissing animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "KISSING",
    "name": "Playa_Kiss_03",
    "desc": "Player kissing animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "KNIFE",
    "name": "KILL_Knife_Ped_Damage",
    "desc": "Getting throat slit from behind",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "KNIFE",
    "name": "KILL_Knife_Ped_Die",
    "desc": "Dying from a stealth kill",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "KNIFE",
    "name": "KILL_Knife_Player",
    "desc": "Slitting throat from behind",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "KNIFE",
    "name": "KILL_Partial",
    "desc": "Killing with a knife from behind",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KNIFE",
    "name": "knife_1",
    "desc": "Knife swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KNIFE",
    "name": "knife_2",
    "desc": "Knife swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KNIFE",
    "name": "knife_3",
    "desc": "Knife swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KNIFE",
    "name": "Knife_4",
    "desc": "Knife swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KNIFE",
    "name": "knife_block",
    "desc": "Knife block",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KNIFE",
    "name": "Knife_G",
    "desc": "Stabbing downed opponent with a knife",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KNIFE",
    "name": "knife_hit_1",
    "desc": "Getting hit by a knife",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "KNIFE",
    "name": "knife_hit_2",
    "desc": "Getting hit by a knife",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "KNIFE",
    "name": "knife_hit_3",
    "desc": "Getting hit by a knife",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "KNIFE",
    "name": "knife_IDLE",
    "desc": "Knife idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "KNIFE",
    "name": "knife_part",
    "desc": "Knife parting animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "KNIFE",
    "name": "WEAPON_knifeidle",
    "desc": "Knife idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LAPDAN1",
    "name": "LAPDAN_D",
    "desc": "Stripper lapdance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LAPDAN1",
    "name": "LAPDAN_P",
    "desc": "Stripper lapdance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LAPDAN2",
    "name": "LAPDAN_D",
    "desc": "Stripper lapdance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LAPDAN2",
    "name": "LAPDAN_P",
    "desc": "Stripper lapdance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LAPDAN3",
    "name": "LAPDAN_D",
    "desc": "Stripper lapdance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LAPDAN3",
    "name": "LAPDAN_P",
    "desc": "Stripper lapdance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "F_smklean_loop",
    "desc": "Smoking while leaning loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_bdbnce",
    "desc": "Bounching while sitting on top of a car seat",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_hair",
    "desc": "Stroking hair while sitting on top of a car seat",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_hurry",
    "desc": "Sitting in a car and signalling to hurry up",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_idleloop",
    "desc": "Sitting in a car loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_idle_to_l0",
    "desc": "Sitting in a lowrider",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l0_bnce",
    "desc": "Bounching while sitting in a lowrider",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l0_loop",
    "desc": "Sitting in a lowrider loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l0_to_l1",
    "desc": "Getting up and sitting on top of the car seat",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l12_to_l0",
    "desc": "Sitting back down on the car's seat",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l1_bnce",
    "desc": "Bounching while sitting on top of a car seat",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l1_loop",
    "desc": "Sitting on top of the car's seat loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l1_to_l2",
    "desc": "Sitting on top of a car's seat while cheering",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l2_bnce",
    "desc": "Bounching on top of a car's seat",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l2_loop",
    "desc": "Sitting on top of a car's seat loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l2_to_l3",
    "desc": "Leaning on a lowrider's windshield",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l345_to_l1",
    "desc": "Going back on top of a car's seat",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l3_bnce",
    "desc": "Bounching on a lowrider while holding the windshield",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l3_loop",
    "desc": "Holding a lowrider's windshield loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l3_to_l4",
    "desc": "Holding a lowrider's windshield while cheering",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l4_bnce",
    "desc": "Bounching while holding a lowrider's windshield",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l4_loop",
    "desc": "Holding a lowrider's windshield loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l4_to_l5",
    "desc": "Holding a lowrider's windshield with one hand",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l5_bnce",
    "desc": "Bounching while holding a lowrider's windshield with one hand",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "lrgirl_l5_loop",
    "desc": "Holding a lowrider's windshield with one hand loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "M_smklean_loop",
    "desc": "Smoking animation loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "M_smkstnd_loop",
    "desc": "Smoking animation loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "prtial_gngtlkB",
    "desc": "Lowrider gang talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "prtial_gngtlkC",
    "desc": "Lowrider gang talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "prtial_gngtlkD",
    "desc": "Lowrider gang talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "prtial_gngtlkE",
    "desc": "Lowrider gang talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "prtial_gngtlkF",
    "desc": "Lowrider gang talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "prtial_gngtlkG",
    "desc": "Lowrider gang talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "prtial_gngtlkH",
    "desc": "Lowrider gang talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "RAP_A_Loop",
    "desc": "Lowrider rapping",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "RAP_B_Loop",
    "desc": "Lowrider rapping",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "RAP_C_Loop",
    "desc": "Lowrider rapping",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "Sit_relaxed",
    "desc": "Relaxing while sitting in car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "LOWRIDER",
    "name": "Tap_hand",
    "desc": "Tapping hand on the window of a car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "Carhit_Hangon",
    "desc": "Cop hanging on a windshield",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "MD_CHASE",
    "name": "Carhit_Tumble",
    "desc": "Cop hanging on a windshield",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "MD_CHASE",
    "name": "donutdrop",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "Fen_Choppa_L1",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "Fen_Choppa_L2",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "Fen_Choppa_L3",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "Fen_Choppa_R1",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "Fen_Choppa_R2",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "Fen_Choppa_R3",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "Hangon_Stun_loop",
    "desc": "Stunned while hanging on a windshield",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "Hangon_Stun_Turn",
    "desc": "Turning while hanging on a windshield",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "MD_BIKE_2_HANG",
    "desc": "Tumbling and hanging on a car's bumper",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "MD_BIKE_Jmp_BL",
    "desc": "Jumping from a bike onto a car from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "MD_BIKE_Jmp_F",
    "desc": "Jumping from a bike onto a car from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "MD_BIKE_Lnd_BL",
    "desc": "Landing on top of a car from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "MD_BIKE_Lnd_Die_BL",
    "desc": "Dying on top of a car from the left",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "MD_CHASE",
    "name": "MD_BIKE_Lnd_Die_F",
    "desc": "Dying on top of a car from the right",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "MD_CHASE",
    "name": "MD_BIKE_Lnd_F",
    "desc": "Landing on top of a car from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "MD_BIKE_Lnd_Roll",
    "desc": "Rolling into traffic from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "MD_BIKE_Lnd_Roll_F",
    "desc": "Rolling into traffic from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "MD_BIKE_Punch",
    "desc": "Punching the player while on the roof",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "MD_CHASE",
    "name": "MD_BIKE_Punch_F",
    "desc": "Punching the player while on the roof",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "MD_CHASE",
    "name": "MD_BIKE_Shot_F",
    "desc": "Getting shot off a car's roof",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "MD_CHASE",
    "name": "MD_HANG_Lnd_Roll",
    "desc": "Rolling into traffic death animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_CHASE",
    "name": "MD_HANG_Loop",
    "desc": "Hanging at the back of a car loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MD_END",
    "name": "END_SC1_PLY",
    "desc": "CJ's relief animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_END",
    "name": "END_SC1_RYD",
    "desc": "Ryder's relief animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_END",
    "name": "END_SC1_SMO",
    "desc": "Big Smoke's relief animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_END",
    "name": "END_SC1_SWE",
    "desc": "Sweet's relief animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_END",
    "name": "END_SC2_PLY",
    "desc": "CJ's end animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_END",
    "name": "END_SC2_RYD",
    "desc": "Ryder's end animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_END",
    "name": "END_SC2_SMO",
    "desc": "Big Smoke's end animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MD_END",
    "name": "END_SC2_SWE",
    "desc": "Sweet's end animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MEDIC",
    "name": "CPR",
    "desc": "Medic performing CPR",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "bitchslap",
    "desc": "Bitch slapping animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "BMX_celebrate",
    "desc": "BMX celebrate animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "BMX_comeon",
    "desc": "Signalling to come on on BMX",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "bmx_idleloop_01",
    "desc": "BMX idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "bmx_idleloop_02",
    "desc": "BMX idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "bmx_talkleft_in",
    "desc": "BMX talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "bmx_talkleft_loop",
    "desc": "BMX talking loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "bmx_talkleft_out",
    "desc": "BMX talk end",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "bmx_talkright_in",
    "desc": "BMX talk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "bmx_talkright_loop",
    "desc": "BMX talking loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "bmx_talkright_out",
    "desc": "BMX talk end",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "bng_wndw",
    "desc": "Banging on a window",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "bng_wndw_02",
    "desc": "Talking through a window",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "Case_pickup",
    "desc": "Picking up a case",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "door_jet",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "GRAB_L",
    "desc": "Grabbing from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "GRAB_R",
    "desc": "Grabbing from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "Hiker_Pose",
    "desc": "Signalling for a taxi from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "Hiker_Pose_L",
    "desc": "Signalling for a taxi from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "Idle_Chat_02",
    "desc": "Idle chat",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "KAT_Throw_K",
    "desc": "Throwing a katana and challenging to a fight",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "KAT_Throw_O",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "KAT_Throw_P",
    "desc": "Getting a katana and preparing for a fight",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "PASS_Rifle_O",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "PASS_Rifle_Ped",
    "desc": "Passing a rifle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "PASS_Rifle_Ply",
    "desc": "Receiving a rifle",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "pickup_box",
    "desc": "Picking up a box",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "Plane_door",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "Plane_exit",
    "desc": "CJ's plane exit animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "Plane_hijack",
    "desc": "Hijacking a plane",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "Plunger_01",
    "desc": "Detonating a bomb with a plunger",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "Plyrlean_loop",
    "desc": "Leaning loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "plyr_shkhead",
    "desc": "Facepalm animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "Run_Dive",
    "desc": "Ryder's diving animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "Scratchballs_01",
    "desc": "Scratching crotch",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "SEAT_LR",
    "desc": "Sitting and looking back",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "Seat_talk_01",
    "desc": "Talking while sitting down",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "Seat_talk_02",
    "desc": "Talking while sitting down",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "SEAT_watch",
    "desc": "Checking watch while sitting down",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "smalplane_door",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MISC",
    "name": "smlplane_door",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_back",
    "desc": "mtn, mountain, bike, bicycle",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_bunnyhop",
    "desc": "Muntain bike bunny hop",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_drivebyFT",
    "desc": "Mountain bike drive by front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_driveby_LHS",
    "desc": "Mountain bike drive by left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_driveby_RHS",
    "desc": "Mountain bike drive by right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_fwd",
    "desc": "Mountain bike lean front",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_getoffBACK",
    "desc": "Bailing from a Mountain bike at high speed",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_getoffLHS",
    "desc": "Getting off a Mountain bike from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_getoffRHS",
    "desc": "Getting off a Mountain bike from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_jumponL",
    "desc": "Getting on a Mountain bike from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_jumponR",
    "desc": "Getting on a Mountain bike from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_Left",
    "desc": "Mountain bike sway left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_pedal",
    "desc": "Mountain bike pedal",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_pushes",
    "desc": "Mountain bike reverse",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_Ride",
    "desc": "Mountain bike riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_Right",
    "desc": "Mountain bike sway right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_sprint",
    "desc": "Mountain bike sprint",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MTB",
    "name": "MTB_still",
    "desc": "Mountain bike still riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "MscleWalkst_armed",
    "desc": "Muscle CJ walk start with a weapon",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "MscleWalkst_Csaw",
    "desc": "Muscle CJ walk start with a chainsaw",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "Mscle_rckt_run",
    "desc": "Muscle CJ rocket run",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "Mscle_rckt_walkst",
    "desc": "Muscle CJ rocket walk start",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "Mscle_run_Csaw",
    "desc": "Muscle CJ run with a chainsaw",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "MuscleIdle",
    "desc": "Muscle CJ idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "MuscleIdle_armed",
    "desc": "Muscle CJ idle with a weapon",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "MuscleIdle_Csaw",
    "desc": "Muscle CJ idle with a chainsaw",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "MuscleIdle_rocket",
    "desc": "Muscle CJ idle with a rocket launcher",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "MuscleRun",
    "desc": "Muscle CJ run",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "MuscleRun_armed",
    "desc": "Muscle CJ run with a weapon",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "MuscleSprint",
    "desc": "Muscle CJ sprint",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "MuscleWalk",
    "desc": "Muscle CJ walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "MuscleWalkstart",
    "desc": "Muscle CJ start walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "MuscleWalk_armed",
    "desc": "Muscle CJ walk with a weapon",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "Musclewalk_Csaw",
    "desc": "Muscle CJ walk with a chainsaw",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "MUSCULAR",
    "name": "Musclewalk_rocket",
    "desc": "Muscle CJ walk with a rocket launcher",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "NEVADA",
    "name": "NEVADA_getin",
    "desc": "Getting into a Nevada plane anim",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "NEVADA",
    "name": "NEVADA_getout",
    "desc": "Getting out of a Nevada plane anim",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "lkaround_in",
    "desc": "Looking around animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "lkaround_loop",
    "desc": "Looking around loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "lkaround_out",
    "desc": "End of looking around animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "lkup_in",
    "desc": "Looking up animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "lkup_loop",
    "desc": "Looking up loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "lkup_out",
    "desc": "End of looking up animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "lkup_point",
    "desc": "Looking and pointing up",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "panic_cower",
    "desc": "Cowering in fear",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ON_LOOKERS",
    "name": "panic_hide",
    "desc": "Panicking and hiding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "panic_in",
    "desc": "Start of panicking animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "panic_loop",
    "desc": "Panicking loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "panic_out",
    "desc": "End of panicking animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "panic_point",
    "desc": "Pointing forward while panicking",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "panic_shout",
    "desc": "Shouting while panicking",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "Pointup_in",
    "desc": "Start of pointing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "Pointup_loop",
    "desc": "Pointing up animation loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "Pointup_out",
    "desc": "End of pointing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "Pointup_shout",
    "desc": "Shouting while looking up",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "point_in",
    "desc": "Start of pointing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "point_loop",
    "desc": "Pointing forward loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "point_out",
    "desc": "End of pointing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "shout_01",
    "desc": "Cheering animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "shout_02",
    "desc": "Cheering animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "shout_in",
    "desc": "Start of shouting animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "shout_loop",
    "desc": "Shouting loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "shout_out",
    "desc": "End of shouting animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "wave_in",
    "desc": "Start of wave animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "wave_loop",
    "desc": "Waving loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ON_LOOKERS",
    "name": "wave_out",
    "desc": "End of wave animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "OTB",
    "name": "betslp_in",
    "desc": "Start of writing on table animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "OTB",
    "name": "betslp_lkabt",
    "desc": "Writing on a table",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "OTB",
    "name": "betslp_loop",
    "desc": "Writing on a table",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "OTB",
    "name": "betslp_out",
    "desc": "End of writing on table animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "OTB",
    "name": "betslp_tnk",
    "desc": "Writing on a table and thinking",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "OTB",
    "name": "wtchrace_cmon",
    "desc": "Watching a horse race while cheering",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "OTB",
    "name": "wtchrace_in",
    "desc": "Start of watching a horse race animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "OTB",
    "name": "wtchrace_loop",
    "desc": "Watching a horse race loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "OTB",
    "name": "wtchrace_lose",
    "desc": "Losing at a horse race bet",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "OTB",
    "name": "wtchrace_out",
    "desc": "End of watching a horse race animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "OTB",
    "name": "wtchrace_win",
    "desc": "Winning a horse race bet",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "FALL_skyDive",
    "desc": "Skydiving aniamtion",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "PARACHUTE",
    "name": "FALL_SkyDive_Accel",
    "desc": "Skydiving acceleration",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "PARACHUTE",
    "name": "FALL_skyDive_DIE",
    "desc": "Skydiving fall death animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "PARACHUTE",
    "name": "FALL_SkyDive_L",
    "desc": "Skydiving sway left",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "PARACHUTE",
    "name": "FALL_SkyDive_R",
    "desc": "Skydiving sway right",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_decel",
    "desc": "Parachute gliding with knees up",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_decel_O",
    "desc": "Turn yourself into a buggy mess",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_float",
    "desc": "Parachute gliding with knees down",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_float_O",
    "desc": "Turn yourself into a buggy mess",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_Land",
    "desc": "Landing with a parchute",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_Land_O",
    "desc": "Turn yourself into a buggy mess",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_Land_Water",
    "desc": "Landing with a parachute in water",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_Land_Water_O",
    "desc": "Turn yourself into a buggy mess",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_open",
    "desc": "Opening parachute animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_open_O",
    "desc": "Turn yourself into a buggy mess",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_Rip_Land_O",
    "desc": "Turn yourself into a buggy mess",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_Rip_Loop_O",
    "desc": "Turn yourself into a buggy mess",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_Rip_O",
    "desc": "Turn yourself into a buggy mess",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_steerL",
    "desc": "Parachute steer left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_steerL_O",
    "desc": "Turn yourself into a buggy mess",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_steerR",
    "desc": "Parachute steer right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARACHUTE",
    "name": "PARA_steerR_O",
    "desc": "Turn yourself into a buggy mess",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARK",
    "name": "Tai_Chi_in",
    "desc": "Starting tai-chi",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PARK",
    "name": "Tai_Chi_Loop",
    "desc": "Tai-chi loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "PARK",
    "name": "Tai_Chi_Out",
    "desc": "Finishing tai-chi",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PAULNMAC",
    "name": "Piss_in",
    "desc": "Pissing animation start",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PAULNMAC",
    "name": "Piss_loop",
    "desc": "Pissing loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "PAULNMAC",
    "name": "Piss_out",
    "desc": "Finish pissing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PAULNMAC",
    "name": "PnM_Argue1_A",
    "desc": "Paul and Maccer arguing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PAULNMAC",
    "name": "PnM_Argue1_B",
    "desc": "Paul and Maccer arguing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PAULNMAC",
    "name": "PnM_Argue2_A",
    "desc": "Paul and Maccer arguing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PAULNMAC",
    "name": "PnM_Argue2_B",
    "desc": "Paul and Maccer arguing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PAULNMAC",
    "name": "PnM_Loop_A",
    "desc": "Paul and Maccer loop animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "PAULNMAC",
    "name": "PnM_Loop_B",
    "desc": "Paul and Maccer loop animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "PAULNMAC",
    "name": "wank_in",
    "desc": "Maccer touching himself",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PAULNMAC",
    "name": "wank_loop",
    "desc": "Maccer wanking loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "PAULNMAC",
    "name": "wank_out",
    "desc": "Maccer finishing up",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "abseil",
    "desc": "Abseiling down a rope",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "ARRESTgun",
    "desc": "Arresting with a gun animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "ATM",
    "desc": "Using an ATM",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "BIKE_elbowL",
    "desc": "Bike elbow left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "BIKE_elbowR",
    "desc": "Bike elbow right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "BIKE_fallR",
    "desc": "Falling off a bike",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "BIKE_fall_off",
    "desc": "Falling off a bike",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "BIKE_pickupL",
    "desc": "Picking up a bike from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "BIKE_pickupR",
    "desc": "Picking up a bike from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "BIKE_pullupL",
    "desc": "Pulling a bike from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "BIKE_pullupR",
    "desc": "Pulling a bike from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "bomber",
    "desc": "Bomber animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_alignHI_LHS",
    "desc": "Jumping and aligning from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_alignHI_RHS",
    "desc": "Jumping and aligning from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_align_LHS",
    "desc": "Aligning to car on the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_align_RHS",
    "desc": "Aligning to car on the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_closedoorL_LHS",
    "desc": "Closing a car's door from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_closedoorL_RHS",
    "desc": "Closing a car's door from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_closedoor_LHS",
    "desc": "Closing a car's door from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_closedoor_RHS",
    "desc": "Closing a car's door from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_close_LHS",
    "desc": "Close car door on the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_close_RHS",
    "desc": "Close car door on the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_crawloutRHS",
    "desc": "Crawl outside of a flipped car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_dead_LHS",
    "desc": "Dead inside a car on the left",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "CAR_dead_RHS",
    "desc": "Dead inside a car on the right",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "CAR_doorlocked_LHS",
    "desc": "Car door locked on the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_doorlocked_RHS",
    "desc": "Car door locked on the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_fallout_LHS",
    "desc": "Bail from a car on the left",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "CAR_fallout_RHS",
    "desc": "Bail from a car on the right",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "CAR_getinL_LHS",
    "desc": "Get into a car from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_getinL_RHS",
    "desc": "Get into a car from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_getin_LHS",
    "desc": "Get into a car from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_getin_RHS",
    "desc": "Get into a car from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_getoutL_LHS",
    "desc": "Getting out of a car from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_getoutL_RHS",
    "desc": "Getting out of a car from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_getout_LHS",
    "desc": "Getting out of a car from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_getout_RHS",
    "desc": "Getting out of a car from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "car_hookertalk",
    "desc": "Hooker talk in car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_jackedLHS",
    "desc": "Jacking a car from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_jackedRHS",
    "desc": "Jacking a car from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_jumpin_LHS",
    "desc": "Jumping into a car from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_LB",
    "desc": "Car driveby on the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_LB_pro",
    "desc": "Car driveby on the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_LB_weak",
    "desc": "Car driveby on the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_LjackedLHS",
    "desc": "Getting jacked from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_LjackedRHS",
    "desc": "Getting jacked from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_Lshuffle_RHS",
    "desc": "Shuffling to the driver's sit",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_Lsit",
    "desc": "Sitting in a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_open_LHS",
    "desc": "Opening door from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_open_RHS",
    "desc": "Opening door from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_pulloutL_LHS",
    "desc": "Pulling out a passanger from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_pulloutL_RHS",
    "desc": "Pulling out the driver on the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_pullout_LHS",
    "desc": "Pulling out a passanger from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_pullout_RHS",
    "desc": "Pulling out a passanger from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_Qjacked",
    "desc": "Getting jacked from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_rolldoor",
    "desc": "Closing car door animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_rolldoorLO",
    "desc": "Closing car door animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_rollout_LHS",
    "desc": "Bailing out of a car from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_rollout_RHS",
    "desc": "Bailing out of a car from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_shuffle_RHS",
    "desc": "Shuffling to the right side",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_sit",
    "desc": "Sitting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_sitp",
    "desc": "Sitting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_sitpLO",
    "desc": "Sitting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_sit_pro",
    "desc": "Sitting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_sit_weak",
    "desc": "Sitting inside a car",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CAR_tune_radio",
    "desc": "Changing radio station in a car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CLIMB_idle",
    "desc": "Hanging onto a wall idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CLIMB_jump",
    "desc": "Jumping and hanging onto a wall",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CLIMB_jump2fall",
    "desc": "Letting go after hanging",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "CLIMB_jump_B",
    "desc": "Vaulting over a wall",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CLIMB_Pull",
    "desc": "Pulling self over object",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CLIMB_Stand",
    "desc": "Standing after pulling",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "CLIMB_Stand_finish",
    "desc": "Standing after pulling",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "cower",
    "desc": "Cowering in fear animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "Crouch_Roll_L",
    "desc": "Left crouch roll",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Crouch_Roll_R",
    "desc": "Right crouch roll",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "DAM_armL_frmBK",
    "desc": "Getting shot in the left arm",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DAM_armL_frmFT",
    "desc": "Getting shot in the left arm",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DAM_armL_frmLT",
    "desc": "Getting shot in the left arm",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DAM_armR_frmBK",
    "desc": "Getting shot in the right arm",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DAM_armR_frmFT",
    "desc": "Getting shot in the right arm",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DAM_armR_frmRT",
    "desc": "Getting shot in the right arm",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DAM_LegL_frmBK",
    "desc": "Getting shot in the left leg",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DAM_LegL_frmFT",
    "desc": "Getting shot in the left leg",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DAM_LegL_frmLT",
    "desc": "Getting shot in the left leg",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DAM_LegR_frmBK",
    "desc": "Getting shot in the right leg",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DAM_LegR_frmFT",
    "desc": "Getting shot in the right leg",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DAM_LegR_frmRT",
    "desc": "Getting shot in the right leg",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DAM_stomach_frmBK",
    "desc": "Getting shot in the stomach",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DAM_stomach_frmFT",
    "desc": "Getting shot in the stomach",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DAM_stomach_frmLT",
    "desc": "Getting shot in the stomach",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DAM_stomach_frmRT",
    "desc": "Getting shot in the stomach",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "DOOR_LHinge_O",
    "desc": "Buggy animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "DOOR_RHinge_O",
    "desc": "Buggy animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "DrivebyL_L",
    "desc": "Drive by left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "DrivebyL_R",
    "desc": "Drive by right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Driveby_L",
    "desc": "Drive by left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Driveby_R",
    "desc": "Drive by right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "DRIVE_BOAT",
    "desc": "Boat driving",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "DRIVE_BOAT_back",
    "desc": "Reversing with a boat",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "DRIVE_BOAT_L",
    "desc": "Steering boat left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "DRIVE_BOAT_R",
    "desc": "Steering boat right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drive_L",
    "desc": "Steering left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drive_LO_l",
    "desc": "Steering left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drive_LO_R",
    "desc": "Steering right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drive_L_pro",
    "desc": "Steering left with high skill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drive_L_pro_slow",
    "desc": "Steering left with high skill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drive_L_slow",
    "desc": "Steering left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drive_L_weak",
    "desc": "Steering left with low skill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drive_L_weak_slow",
    "desc": "Steering left with low skill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drive_R",
    "desc": "Steering right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drive_R_pro",
    "desc": "Steering right with high skill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drive_R_pro_slow",
    "desc": "Steering right with high skill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drive_R_slow",
    "desc": "Steering right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drive_R_weak",
    "desc": "Steering right with low skill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drive_R_weak_slow",
    "desc": "Steering right with low skill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drive_truck",
    "desc": "Truck driving animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "DRIVE_truck_back",
    "desc": "Reversing with a truck",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "DRIVE_truck_L",
    "desc": "Steering left with a truck",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "DRIVE_truck_R",
    "desc": "Steering right with a truck",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Drown",
    "desc": "Drowning animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "DUCK_cower",
    "desc": "Cowering animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "endchat_01",
    "desc": "End of chatting animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "endchat_02",
    "desc": "End of chatting animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "endchat_03",
    "desc": "Wave animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "EV_dive",
    "desc": "Dive away from danger",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "EV_step",
    "desc": "Stepping away from danger",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "facanger",
    "desc": "Anger face animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "facgum",
    "desc": "Chewing gum animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "facsurp",
    "desc": "Face talk animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "facsurpm",
    "desc": "Face talk animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "factalk",
    "desc": "Face talk animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "facurios",
    "desc": "Curious face animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "FALL_back",
    "desc": "Falling while facing up",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "FALL_collapse",
    "desc": "Absorbing damage from low fall",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "FALL_fall",
    "desc": "Falling animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "FALL_front",
    "desc": "Falling while facing down",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "FALL_glide",
    "desc": "Fall gliding",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "FALL_land",
    "desc": "Soft impack from fall",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "FALL_skyDive",
    "desc": "Skydiving animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "Fight2Idle",
    "desc": "Fighting idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "FightA_1",
    "desc": "Punch animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "FightA_2",
    "desc": "Punch animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "FightA_3",
    "desc": "Punch animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "FightA_block",
    "desc": "Punch block",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "FightA_G",
    "desc": "Kicking downed opponent",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "FightA_M",
    "desc": "Running attack",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "FIGHTIDLE",
    "desc": "Fighting idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "FightShB",
    "desc": "Pulling back while fighting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "FightShF",
    "desc": "Going forward while fighting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "FightSh_BWD",
    "desc": "Going backwards while fighting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "FightSh_FWD",
    "desc": "Going forward while fighting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "FightSh_Left",
    "desc": "Going left while fighting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "FightSh_Right",
    "desc": "Going right while fighting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "flee_lkaround_01",
    "desc": "Looking around while fleeing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "FLOOR_hit",
    "desc": "Getting hit on the floor while lying on back",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "FLOOR_hit_f",
    "desc": "Getting hit on the floor while lying on stomach",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "fucku",
    "desc": "Giving the finger animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "gang_gunstand",
    "desc": "Aiming a gun",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "gas_cwr",
    "desc": "Choking on spray/tear gas",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "getup",
    "desc": "Getting up",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "getup_front",
    "desc": "Getting up from the front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "gum_eat",
    "desc": "Eating a gum",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "GunCrouchBwd",
    "desc": "Crouching backwards with a gun",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "GunCrouchFwd",
    "desc": "Crouching forward with a gun",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "GunMove_BWD",
    "desc": "Moving backwards with a gun",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "GunMove_FWD",
    "desc": "Moving forward with a gun",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "GunMove_L",
    "desc": "Moving left with a gun",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "GunMove_R",
    "desc": "Moving right with a gun",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Gun_2_IDLE",
    "desc": "Holding rifle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "GUN_BUTT",
    "desc": "Gun whip",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "GUN_BUTT_crouch",
    "desc": "Gun whip",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Gun_stand",
    "desc": "Holding rifle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "handscower",
    "desc": "Scared and moving backwards",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "handsup",
    "desc": "Putting your hands up",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "HitA_1",
    "desc": "Getting hit",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "HitA_2",
    "desc": "Getting hit",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "HitA_3",
    "desc": "Getting hit",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "HIT_back",
    "desc": "Getting hit from the back",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "HIT_behind",
    "desc": "Getting hit from behind",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "HIT_front",
    "desc": "Getting hit from the front",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "HIT_GUN_BUTT",
    "desc": "Getting hit by a gun",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "HIT_L",
    "desc": "Getting hit from the left",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "HIT_R",
    "desc": "Getting hit from the right",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "HIT_walk",
    "desc": "Getting hit while walking",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "HIT_wall",
    "desc": "Hitting a wall",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "Idlestance_fat",
    "desc": "Idle while fat",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "idlestance_old",
    "desc": "Idle while old",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "IDLE_armed",
    "desc": "Idle while holding a rifle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "IDLE_chat",
    "desc": "Moving hands while chatting",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "IDLE_csaw",
    "desc": "Holding a chainsaw",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Idle_Gang1",
    "desc": "Idle of gangmembers",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "IDLE_HBHB",
    "desc": "Idle when examining",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "IDLE_ROCKET",
    "desc": "Holding a rocket launcher",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "IDLE_stance",
    "desc": "Normal idle standing animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "IDLE_taxi",
    "desc": "Calling for a cab",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "IDLE_tired",
    "desc": "Exhausted out of breath animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Jetpack_Idle",
    "desc": "Holding a jetpack",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "JOG_femaleA",
    "desc": "Female jogging",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "JOG_maleA",
    "desc": "Male jogging",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "JUMP_glide",
    "desc": "Mid-air after jumping",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "JUMP_land",
    "desc": "Landing after a jump",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "JUMP_launch",
    "desc": "Start of jump (left leg)",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "JUMP_launch_R",
    "desc": "Start of jump (right leg)",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "KART_drive",
    "desc": "Go-Kart-driving-animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "KART_L",
    "desc": "Leaning left while driving a Go-Kart",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "KART_LB",
    "desc": "Go-Kart-driving-animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "KART_R",
    "desc": "Leaning right while driving a Go-Kart",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "KD_left",
    "desc": "Dying during an explosion",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "KD_right",
    "desc": "Dying during an explosion",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "KO_shot_face",
    "desc": "Holding face while dying",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "KO_shot_front",
    "desc": "Falling forward and dying",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "KO_shot_stom",
    "desc": "Holding stomach while dying",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "KO_skid_back",
    "desc": "Falling forward and dying",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "KO_skid_front",
    "desc": "Falling backward and dying",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "KO_spin_L",
    "desc": "Spinning left and dying",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "KO_spin_R",
    "desc": "Spinning right and dying",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "pass_Smoke_in_car",
    "desc": "Smoking in a car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "phone_in",
    "desc": "Picking up the phone",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "phone_out",
    "desc": "Hanging up the phone",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "phone_talk",
    "desc": "Talking on phone",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Player_Sneak",
    "desc": "Standing sneak animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Player_Sneak_walkstart",
    "desc": "Start of standing sneak animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "roadcross",
    "desc": "Looking right and left before crossing road",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "roadcross_female",
    "desc": "Looking right and left before crossing road",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "roadcross_gang",
    "desc": "Looking right and left before crossing road",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "roadcross_old",
    "desc": "Looking right and left before crossing road",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "run_1armed",
    "desc": "Player jog",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "run_armed",
    "desc": "Jog with assault rifle",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "run_civi",
    "desc": "Ped jog",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "run_csaw",
    "desc": "Jogging with chainsaw",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "run_fat",
    "desc": "Fat jog",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "run_fatold",
    "desc": "Old fat jog",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "run_gang1",
    "desc": "Gang jog",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "run_left",
    "desc": "Jog to the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "run_old",
    "desc": "Old man jog",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "run_player",
    "desc": "Player jog",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "run_right",
    "desc": "Jog to the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "run_rocket",
    "desc": "Jog with rocket launcher",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Run_stop",
    "desc": "Stop jogging",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Run_stopR",
    "desc": "Stop jogging",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Run_Wuzi",
    "desc": "Jog with hand placed out in front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "SEAT_down",
    "desc": "Sitting down",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "SEAT_idle",
    "desc": "Sitting down",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "SEAT_up",
    "desc": "Standing up",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "SHOT_leftP",
    "desc": "Getting shot from the left",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "SHOT_partial",
    "desc": "Getting shot from the front",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "SHOT_partial_B",
    "desc": "Getting shot from behind",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "SHOT_rightP",
    "desc": "Getting shot from the right",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "Shove_Partial",
    "desc": "Shoving someone away",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Smoke_in_car",
    "desc": "Smoking in a car",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "sprint_civi",
    "desc": "Player sprint",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ped",
    "name": "sprint_panic",
    "desc": "NPC sprint",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Sprint_Wuzi",
    "desc": "Sprinting while holding hand forward",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "swat_run",
    "desc": "Police jog",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Swim_Tread",
    "desc": "Idle swimming animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Tap_hand",
    "desc": "Tapping hand on window (left side)",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Tap_handP",
    "desc": "Tapping hand on window (right side)",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "turn_180",
    "desc": "Turning around",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Turn_L",
    "desc": "Turning left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Turn_R",
    "desc": "Turning right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_armed",
    "desc": "Slow walking with a weapon",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_civi",
    "desc": "NPC slow walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_csaw",
    "desc": "Slow walk with chainsaw",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Walk_DoorPartial",
    "desc": "Opening a door",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_drunk",
    "desc": "Drunk walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_fat",
    "desc": "Fat walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_fatold",
    "desc": "Fat and old walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_gang1",
    "desc": "Gang walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_gang2",
    "desc": "Gang walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_old",
    "desc": "Old walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_player",
    "desc": "Player walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_rocket",
    "desc": "Walking with a rocket",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_shuffle",
    "desc": "Walking with a buckle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_start",
    "desc": "Start of walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_start_armed",
    "desc": "Start of walk with weapon",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_start_csaw",
    "desc": "Start of walk with chainsaw",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WALK_start_rocket",
    "desc": "Start of walk with rocket launcher",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "Walk_Wuzi",
    "desc": "Start of walk with hand forward",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WEAPON_crouch",
    "desc": "Crouching with a weapon",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "woman_idlestance",
    "desc": "Woman's idle stance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "woman_run",
    "desc": "Woman run animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WOMAN_runbusy",
    "desc": "Busy woman run animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WOMAN_runfatold",
    "desc": "Fat and old woman run animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "woman_runpanic",
    "desc": "Woman panic run",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WOMAN_runsexy",
    "desc": "Sexy woman run",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WOMAN_walkbusy",
    "desc": "Busy woman walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WOMAN_walkfatold",
    "desc": "Fat and old woman walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WOMAN_walknorm",
    "desc": "Normal woman walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WOMAN_walkold",
    "desc": "Old woman walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WOMAN_walkpro",
    "desc": "Prostitute walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WOMAN_walksexy",
    "desc": "Sexy woman walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "WOMAN_walkshop",
    "desc": "Woman shop walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ped",
    "name": "XPRESSscratch",
    "desc": "Looking around idle animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "PLAYER_DVBYS",
    "name": "Plyr_DrivebyBwd",
    "desc": "Drive-by backward",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PLAYER_DVBYS",
    "name": "Plyr_DrivebyFwd",
    "desc": "Drive-by forward",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PLAYER_DVBYS",
    "name": "Plyr_DrivebyLHS",
    "desc": "Drive-by left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PLAYER_DVBYS",
    "name": "Plyr_DrivebyRHS",
    "desc": "Drive-by right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PLAYIDLES",
    "name": "shift",
    "desc": "One of CJ's idle animations",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "PLAYIDLES",
    "name": "shldr",
    "desc": "One of CJ's idle animations",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "PLAYIDLES",
    "name": "stretch",
    "desc": "One of CJ's idle animations",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "PLAYIDLES",
    "name": "strleg",
    "desc": "One of CJ's idle animations",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "PLAYIDLES",
    "name": "time",
    "desc": "One of CJ's idle animations",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "POLICE",
    "name": "CopTraf_Away",
    "desc": "Cop signalling traffic to move away",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "POLICE",
    "name": "CopTraf_Come",
    "desc": "Cop signalling traffic to come to him",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "POLICE",
    "name": "CopTraf_Left",
    "desc": "Cop signalling traffic to move to the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "POLICE",
    "name": "CopTraf_Stop",
    "desc": "Cop signalling traffic to stop",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "POLICE",
    "name": "COP_getoutcar_LHS",
    "desc": "Getting out the car and aiming",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "POLICE",
    "name": "Cop_move_FWD",
    "desc": "Walking forward while aiming",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "POLICE",
    "name": "crm_drgbst_01",
    "desc": "Thrown onto car by officer",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "POLICE",
    "name": "Door_Kick",
    "desc": "Kicking down a door",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "POLICE",
    "name": "plc_drgbst_01",
    "desc": "Officer arresting someone",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "POLICE",
    "name": "plc_drgbst_02",
    "desc": "Officer searching through trunk",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "POOL",
    "name": "POOL_ChalkCue",
    "desc": "Chalking pool cue",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "POOL",
    "name": "POOL_Idle_Stance",
    "desc": "Idle with a pool cue",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "POOL",
    "name": "POOL_Long_Shot",
    "desc": "Pool long shot",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "POOL",
    "name": "POOL_Long_Shot_O",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "POOL",
    "name": "POOL_Long_Start",
    "desc": "Start of long shot pool",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "POOL",
    "name": "POOL_Long_Start_O",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "POOL",
    "name": "POOL_Med_Shot",
    "desc": "Medium pool shot",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "POOL",
    "name": "POOL_Med_Shot_O",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "POOL",
    "name": "POOL_Med_Start",
    "desc": "Start of medium pool shot",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "POOL",
    "name": "POOL_Med_Start_O",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "POOL",
    "name": "POOL_Place_White",
    "desc": "Placing the white ball",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "POOL",
    "name": "POOL_Short_Shot",
    "desc": "Short pool shot",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "POOL",
    "name": "POOL_Short_Shot_O",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "POOL",
    "name": "POOL_Short_Start",
    "desc": "Start of short pool shot",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "POOL",
    "name": "POOL_Short_Start_O",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "POOL",
    "name": "POOL_Walk",
    "desc": "Pool walking",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "POOL",
    "name": "POOL_Walk_Start",
    "desc": "Start of pool walking",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "POOL",
    "name": "POOL_XLong_Shot",
    "desc": "Extra long pool shot",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "POOL",
    "name": "POOL_XLong_Shot_O",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "POOL",
    "name": "POOL_XLong_Start",
    "desc": "Start of extra long pool shot",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "POOL",
    "name": "POOL_XLong_Start_O",
    "desc": "Blank animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "POOR",
    "name": "WINWASH_Start",
    "desc": "Washing window at an intersection",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "POOR",
    "name": "WINWASH_Wash2Beg",
    "desc": "Washing window at an intersection",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PYTHON",
    "name": "python_crouchfire",
    "desc": "Deagle crouch fire",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PYTHON",
    "name": "python_crouchreload",
    "desc": "Deagle crouch reload",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PYTHON",
    "name": "python_fire",
    "desc": "Deagle fire",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PYTHON",
    "name": "python_fire_poor",
    "desc": "Deagle fire with poor skill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "PYTHON",
    "name": "python_reload",
    "desc": "Deagle reload",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_back",
    "desc": "Quad bike lean back",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_driveby_FT",
    "desc": "Quad bike drive by front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_driveby_LHS",
    "desc": "Quad bike drive by left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_driveby_RHS",
    "desc": "Quad bike drive by right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_FWD",
    "desc": "Quad bike lean forward",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_getoff_B",
    "desc": "Bailing off a Quad bike at high speed",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_getoff_LHS",
    "desc": "Getting off a Quad bike from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_getoff_RHS",
    "desc": "Getting off a Quad bike from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_geton_LHS",
    "desc": "Getting on a Quad bike from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_geton_RHS",
    "desc": "Getting on a Quad bike from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_hit",
    "desc": "Getting hit on a Quad bike",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "QUAD",
    "name": "QUAD_kick",
    "desc": "Getting on a Quad bike from the front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_Left",
    "desc": "Quad bike sway left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_passenger",
    "desc": "Quad bike passanger sit",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_reverse",
    "desc": "Quad bike reverse",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_ride",
    "desc": "Quad bike riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD",
    "name": "QUAD_Right",
    "desc": "Quad bike sway right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD_DBZ",
    "name": "Pass_Driveby_BWD",
    "desc": "Quad passanger drive bying back",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD_DBZ",
    "name": "Pass_Driveby_FWD",
    "desc": "Quad passanger drive bying front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD_DBZ",
    "name": "Pass_Driveby_LHS",
    "desc": "Quad passanger drive bying left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "QUAD_DBZ",
    "name": "Pass_Driveby_RHS",
    "desc": "Quad passanger drive bying right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RAPPING",
    "name": "Laugh_01",
    "desc": "Laughing animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RAPPING",
    "name": "RAP_A_IN",
    "desc": "Rapping animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RAPPING",
    "name": "RAP_A_Loop",
    "desc": "Rapping animation loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RAPPING",
    "name": "RAP_A_OUT",
    "desc": "Rapping animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RAPPING",
    "name": "RAP_B_IN",
    "desc": "Rapping animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RAPPING",
    "name": "RAP_B_Loop",
    "desc": "Rapping animation loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RAPPING",
    "name": "RAP_B_OUT",
    "desc": "Rapping animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RAPPING",
    "name": "RAP_C_Loop",
    "desc": "Rapping animation loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RIFLE",
    "name": "RIFLE_crouchfire",
    "desc": "Rifle crouch fire",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RIFLE",
    "name": "RIFLE_crouchload",
    "desc": "Rifle crouch reload",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RIFLE",
    "name": "RIFLE_fire",
    "desc": "Rifle fire",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RIFLE",
    "name": "RIFLE_fire_poor",
    "desc": "Rifle fire with poor skill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RIFLE",
    "name": "RIFLE_load",
    "desc": "Rifle reload",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RIOT",
    "name": "RIOT_ANGRY",
    "desc": "Angry rioting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RIOT",
    "name": "RIOT_ANGRY_B",
    "desc": "Angry rioting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RIOT",
    "name": "RIOT_challenge",
    "desc": "Taunting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RIOT",
    "name": "RIOT_CHANT",
    "desc": "Riot chanting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RIOT",
    "name": "RIOT_FUKU",
    "desc": "Giving the finger",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RIOT",
    "name": "RIOT_PUNCHES",
    "desc": "Riot chanting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RIOT",
    "name": "RIOT_shout",
    "desc": "Riot shouting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ROB_BANK",
    "name": "CAT_Safe_End",
    "desc": "Opening a safe",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ROB_BANK",
    "name": "CAT_Safe_Open",
    "desc": "Opening a safe",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ROB_BANK",
    "name": "CAT_Safe_Open_O",
    "desc": "Opening a safe",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ROB_BANK",
    "name": "CAT_Safe_Rob",
    "desc": "Robbing a safe",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ROB_BANK",
    "name": "SHP_HandsUp_Scr",
    "desc": "Slowly putting hands down",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "ROCKET",
    "name": "idle_rocket",
    "desc": "Rocket launcher idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ROCKET",
    "name": "RocketFire",
    "desc": "Rocket launcher fire",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ROCKET",
    "name": "run_rocket",
    "desc": "Rocket launcher run",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "ROCKET",
    "name": "walk_rocket",
    "desc": "Rocket launcher walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "ROCKET",
    "name": "WALK_start_rocket",
    "desc": "Rocket launcher start walk",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B1",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B2",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B3",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B4",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B5",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B6",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B7",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B8",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B9",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B10",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B11",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B12",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B13",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B14",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B15",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_B16",
    "desc": "Bad \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G1",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G2",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G3",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G4",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G5",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G6",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G7",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G8",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G9",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G10",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G11",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G12",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G13",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G14",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G15",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "Dance_G16",
    "desc": "Good \"Hollywood swinging\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUNNINGMAN",
    "name": "dance_loop",
    "desc": "Dancing loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RUSTLER",
    "name": "Plane_align_LHS",
    "desc": "Entering a rustler from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RUSTLER",
    "name": "Plane_close",
    "desc": "Closing a rustler's door",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RUSTLER",
    "name": "Plane_getin",
    "desc": "Getting into a rustler",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RUSTLER",
    "name": "Plane_getout",
    "desc": "Getting out of a rustler",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RUSTLER",
    "name": "Plane_open",
    "desc": "Opening a rustler's door",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RYDER",
    "name": "RYD_Beckon_01",
    "desc": "Signalling to come here",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RYDER",
    "name": "RYD_Beckon_02",
    "desc": "Signalling truck to drive back",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RYDER",
    "name": "RYD_Beckon_03",
    "desc": "Signalling truck to drive back",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RYDER",
    "name": "RYD_Die_PT1",
    "desc": "Ryder's death animation part 1",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "RYDER",
    "name": "RYD_Die_PT2",
    "desc": "Ryder's death animation part 2",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "RYDER",
    "name": "Van_Crate_L",
    "desc": "Holding a crate on the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RYDER",
    "name": "Van_Crate_R",
    "desc": "Holding a crate on the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RYDER",
    "name": "Van_Fall_L",
    "desc": "Falling on the left side of a truck",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "RYDER",
    "name": "Van_Fall_R",
    "desc": "Falling on the right side of a truck",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "RYDER",
    "name": "Van_Lean_L",
    "desc": "Leaning on the left side of the truck",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RYDER",
    "name": "Van_Lean_R",
    "desc": "Leaning on the right side of the truck",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RYDER",
    "name": "VAN_PickUp_E",
    "desc": "Picking up a crate and doing a 180",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RYDER",
    "name": "VAN_PickUp_S",
    "desc": "Doing a 180 and picking up a crate",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "RYDER",
    "name": "Van_Stand",
    "desc": "Standing while hanging on a truck's side",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RYDER",
    "name": "Van_Stand_Crate",
    "desc": "Standing with a crate",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "RYDER",
    "name": "Van_Throw",
    "desc": "Throwing a crate",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SAMP",
    "name": "FishingIdle",
    "desc": "A fishing idle animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SCRATCHING",
    "name": "scdldlp",
    "desc": "DJ animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SCRATCHING",
    "name": "scdlulp",
    "desc": "DJ animation while rising hand",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SCRATCHING",
    "name": "scdrdlp",
    "desc": "DJ animation with arm holding head",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SCRATCHING",
    "name": "scdrulp",
    "desc": "DJ animation rising hand",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SCRATCHING",
    "name": "sclng_l",
    "desc": "DJ animation left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SCRATCHING",
    "name": "sclng_r",
    "desc": "DJ animation right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SCRATCHING",
    "name": "scmid_l",
    "desc": "DJ animation left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SCRATCHING",
    "name": "scmid_r",
    "desc": "DJ animation right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SCRATCHING",
    "name": "scshrtl",
    "desc": "DJ animation left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SCRATCHING",
    "name": "scshrtr",
    "desc": "DJ animation right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SCRATCHING",
    "name": "sc_ltor",
    "desc": "DJ animation left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SCRATCHING",
    "name": "sc_rtol",
    "desc": "DJ animation right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHAMAL",
    "name": "SHAMAL_align",
    "desc": "Aligning to enter a Shamal",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHAMAL",
    "name": "SHAMAL_getin_LHS",
    "desc": "Getting into a Shamal from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHAMAL",
    "name": "SHAMAL_getout_LHS",
    "desc": "Getting off a Shamal from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHAMAL",
    "name": "SHAMAL_open",
    "desc": "Opening a Shamal's door",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "ROB_2Idle",
    "desc": "Idle from robbing animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "ROB_Loop",
    "desc": "Robbing loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "ROB_Loop_Threat",
    "desc": "Robbing and threatening loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "ROB_Shifty",
    "desc": "Putting on a mask",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "ROB_StickUp_In",
    "desc": "Start of stickup animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Duck",
    "desc": "Ducking animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Duck_Aim",
    "desc": "Ducking and aiming animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Duck_Fire",
    "desc": "Ducking and shooting animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Gun_Aim",
    "desc": "Aiming a gun",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Gun_Duck",
    "desc": "Ducking with a gun",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Gun_Fire",
    "desc": "Firing a gun",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Gun_Grab",
    "desc": "Grabbing a gun from a counter",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Gun_Threat",
    "desc": "Threatening with a gun",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_HandsUp_Scr",
    "desc": "Putting hands up",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SHOP",
    "name": "SHP_Jump_Glide",
    "desc": "Putting foot up",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Jump_Land",
    "desc": "Climbing the counter and aiming a gun",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Jump_Launch",
    "desc": "Jumping on a counter with a gun",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Rob_GiveCash",
    "desc": "Clerk giving cash",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Rob_HandsUp",
    "desc": "Clerk raising hands up",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SHOP",
    "name": "SHP_Rob_React",
    "desc": "Reaction to being threatened with a gun",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Serve_End",
    "desc": "End of shop serving animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Serve_Idle",
    "desc": "Shop serving idle animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Serve_Loop",
    "desc": "Counting money from register loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "SHP_Serve_Start",
    "desc": "Start of serving animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SHOP",
    "name": "Smoke_RYD",
    "desc": "Smoking and leaning back",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SHOTGUN",
    "name": "shotgun_crouchfire",
    "desc": "Shotgun crouch fire",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SHOTGUN",
    "name": "shotgun_fire",
    "desc": "Shotgun fire",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SHOTGUN",
    "name": "shotgun_fire_poor",
    "desc": "Shotgun fire with poor skill",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SILENCED",
    "name": "CrouchReload",
    "desc": "Silenced pistol crouched reload",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SILENCED",
    "name": "SilenceCrouchfire",
    "desc": "Silenced pistol crouched fire",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SILENCED",
    "name": "Silence_fire",
    "desc": "Silenced pistol fire",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SILENCED",
    "name": "Silence_reload",
    "desc": "Silenced pistol reload",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SKATE",
    "name": "skate_idle",
    "desc": "Rollerblades idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SKATE",
    "name": "skate_run",
    "desc": "Rollerblades run",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SKATE",
    "name": "skate_sprint",
    "desc": "Rollerblades sprint",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SMOKING",
    "name": "F_smklean_loop",
    "desc": "Female smoking and leaning loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SMOKING",
    "name": "M_smklean_loop",
    "desc": "Male smoking and leaning loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SMOKING",
    "name": "M_smkstnd_loop",
    "desc": "Male smoking and leaning loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SMOKING",
    "name": "M_smk_drag",
    "desc": "Smoking drag animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SMOKING",
    "name": "M_smk_in",
    "desc": "Start of smoking animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SMOKING",
    "name": "M_smk_loop",
    "desc": "Smoking animation loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SMOKING",
    "name": "M_smk_out",
    "desc": "End of smoking animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SMOKING",
    "name": "M_smk_tap",
    "desc": "Tapping cigarrette animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SNIPER",
    "name": "WEAPON_sniper",
    "desc": "Aiming with a sniper rifle",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SPRAYCAN",
    "name": "spraycan_fire",
    "desc": "Spraying with a spray can",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SPRAYCAN",
    "name": "spraycan_full",
    "desc": "Pulling out a spray can",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "PLY_CASH",
    "desc": "Player dropping cash for a stripper",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "STRIP",
    "name": "PUN_CASH",
    "desc": "Dropping cash for a stripper",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "PUN_HOLLER",
    "desc": "Hollering at a stripper",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "PUN_LOOP",
    "desc": "Entertained by a stripper loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "strip_A",
    "desc": "Stripper dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "strip_B",
    "desc": "Stripper dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "strip_C",
    "desc": "Stripper dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "strip_D",
    "desc": "Stripper dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "strip_E",
    "desc": "Stripper dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "strip_F",
    "desc": "Stripper dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "strip_G",
    "desc": "Stripper dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "STR_A2B",
    "desc": "Stripper dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "STR_B2A",
    "desc": "Stripper dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "STR_B2C",
    "desc": "Stripper dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "STR_C1",
    "desc": "Stripper dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "STR_C2",
    "desc": "Stripper dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "STR_C2B",
    "desc": "Stripper dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "STR_Loop_A",
    "desc": "Stripper dance loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "STR_Loop_B",
    "desc": "Stripper dance loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "STRIP",
    "name": "STR_Loop_C",
    "desc": "Stripper dance loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SUNBATHE",
    "name": "batherdown",
    "desc": "Lay down to sunbathe",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SUNBATHE",
    "name": "batherup",
    "desc": "Get up after sunbathing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SUNBATHE",
    "name": "Lay_Bac_in",
    "desc": "Start of male sunbathe animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SUNBATHE",
    "name": "Lay_Bac_out",
    "desc": "End of male sunbathe animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SUNBATHE",
    "name": "ParkSit_M_IdleA",
    "desc": "Male sitting idle animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SUNBATHE",
    "name": "ParkSit_M_IdleB",
    "desc": "Male sitting idle animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SUNBATHE",
    "name": "ParkSit_M_IdleC",
    "desc": "Male sitting idle animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SUNBATHE",
    "name": "ParkSit_M_in",
    "desc": "Start of park sitting animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SUNBATHE",
    "name": "ParkSit_M_out",
    "desc": "End of park sitting animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SUNBATHE",
    "name": "ParkSit_W_idleA",
    "desc": "Female park sitting idle animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SUNBATHE",
    "name": "ParkSit_W_idleB",
    "desc": "Female park sitting idle animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SUNBATHE",
    "name": "ParkSit_W_idleC",
    "desc": "Female park sitting idle animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SUNBATHE",
    "name": "ParkSit_W_in",
    "desc": "Start of female park sitting",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SUNBATHE",
    "name": "ParkSit_W_out",
    "desc": "End of female park sitting",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SUNBATHE",
    "name": "SBATHE_F_LieB2Sit",
    "desc": "Lying to sitting position",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SUNBATHE",
    "name": "SBATHE_F_Out",
    "desc": "Sitting to standing up postion",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SUNBATHE",
    "name": "SitnWait_in_W",
    "desc": "Sitting and waiting animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SUNBATHE",
    "name": "SitnWait_out_W",
    "desc": "End of sitting and waiting animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "gnstwall_injurd",
    "desc": "Injured up against a wall animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "JMP_Wall1m_180",
    "desc": "Jumping a low wall and doing a 180",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "Rail_fall",
    "desc": "Running and falling off a railing",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SWAT",
    "name": "Rail_fall_crawl",
    "desc": "Crawling on the ground and dying",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SWAT",
    "name": "swt_breach_01",
    "desc": "SWAT breaching",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_breach_02",
    "desc": "SWAT breaching",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_breach_03",
    "desc": "SWAT breaching",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_go",
    "desc": "SWAT command to move in",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_lkt",
    "desc": "SWAT command to watch back",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_sty",
    "desc": "SWAT command to hold/stay",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_vent_01",
    "desc": "Jumping down a vent",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_vent_02",
    "desc": "Jumping down a vent (feet first)",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_vnt_sht_die",
    "desc": "Getting shot in a vent",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SWAT",
    "name": "swt_vnt_sht_in",
    "desc": "Looking down from a vent",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_vnt_sht_loop",
    "desc": "Looking down from a vent",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_wllpk_L",
    "desc": "Peeking left from cover",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_wllpk_L_back",
    "desc": "Going back into cover from left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_wllpk_R",
    "desc": "Peeking right from cover",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_wllpk_R_back",
    "desc": "Going back into cover from right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_wllshoot_in_L",
    "desc": "Taking cover on left side",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_wllshoot_in_R",
    "desc": "Taking cover on right side",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_wllshoot_out_L",
    "desc": "Going back to left cover",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWAT",
    "name": "swt_wllshoot_out_R",
    "desc": "Going back to right cover",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWEET",
    "name": "ho_ass_slapped",
    "desc": "Ho getting her ass slapped",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SWEET",
    "name": "LaFin_Player",
    "desc": "Running up to injured person and kneeling down",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SWEET",
    "name": "LaFin_Sweet",
    "desc": "Holding a stomach gunshot wound",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SWEET",
    "name": "plyr_hndshldr_01",
    "desc": "Getting shoulder held by someone",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWEET",
    "name": "sweet_ass_slap",
    "desc": "Sweet slaps a ho's ass",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWEET",
    "name": "sweet_hndshldr_01",
    "desc": "Holding onto someone's shoulder",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWEET",
    "name": "Sweet_injuredloop",
    "desc": "Injured animation loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SWIM",
    "name": "Swim_Breast",
    "desc": "Breast swimming",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWIM",
    "name": "SWIM_crawl",
    "desc": "Crawl swimming",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWIM",
    "name": "Swim_Dive_Under",
    "desc": "Diving under the water",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWIM",
    "name": "Swim_Glide",
    "desc": "Gliding under water",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWIM",
    "name": "Swim_jumpout",
    "desc": "Jumping out the water",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWIM",
    "name": "Swim_Tread",
    "desc": "Idle swimming",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SWIM",
    "name": "Swim_Under",
    "desc": "Swimming further below",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWORD",
    "name": "sword_1",
    "desc": "Sword swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWORD",
    "name": "sword_2",
    "desc": "Sword swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWORD",
    "name": "sword_3",
    "desc": "Sword swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWORD",
    "name": "sword_4",
    "desc": "Sword swing",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWORD",
    "name": "sword_block",
    "desc": "Sword block",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "SWORD",
    "name": "Sword_Hit_1",
    "desc": "Getting hit by a sword",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SWORD",
    "name": "Sword_Hit_2",
    "desc": "Getting hit by a sword",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SWORD",
    "name": "Sword_Hit_3",
    "desc": "Getting hit by a sword",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "SWORD",
    "name": "sword_IDLE",
    "desc": "Sword idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "SWORD",
    "name": "sword_part",
    "desc": "Sword running attack",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TANK",
    "name": "TANK_align_LHS",
    "desc": "Climbing a tank from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TANK",
    "name": "TANK_close_LHS",
    "desc": "Closing the hatch of a tank",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TANK",
    "name": "TANK_doorlocked",
    "desc": "Trying to open a locked hatch of a tank",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TANK",
    "name": "TANK_getin_LHS",
    "desc": "Getting into a tank from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TANK",
    "name": "TANK_getout_LHS",
    "desc": "Getting out of a tank from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TANK",
    "name": "TANK_open_LHS",
    "desc": "Opening the tank hatch from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmL_In_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmL_In_P",
    "desc": "Pulling left sleeve down",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmL_In_T",
    "desc": "Examining tattoo on left lower arm",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmL_Out_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmL_Out_P",
    "desc": "Pulling left sleeve up",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmL_Out_T",
    "desc": "Stopping to examine tattoo",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmL_Pose_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmL_Pose_P",
    "desc": "Posing with left shoulder out",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmL_Pose_T",
    "desc": "Posing with left arm stretched out",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmR_In_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmR_In_P",
    "desc": "Pulling right sleeve down",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmR_In_T",
    "desc": "Examining tattoo on right lower arm",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmR_Out_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmR_Out_P",
    "desc": "Pulling right sleeve up",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmR_Out_T",
    "desc": "Stopping to examine tattoo",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmR_Pose_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmR_Pose_P",
    "desc": "Posing with right shoulder out",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_ArmR_Pose_T",
    "desc": "Posing with right arm stretched out",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Back_In_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Back_In_P",
    "desc": "Posing with back",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Back_In_T",
    "desc": "Posing with back",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Back_Out_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Back_Out_P",
    "desc": "Admiring back tattoo",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Back_Out_T",
    "desc": "End of admiring back tattoo animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Back_Pose_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Back_Pose_P",
    "desc": "Posing with back",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Back_Pose_T",
    "desc": "Posing with back",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Back_Sit_In_P",
    "desc": "Correcting position while sitting",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Back_Sit_Loop_P",
    "desc": "Sitting loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Back_Sit_Out_P",
    "desc": "End of sitting loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Bel_In_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Bel_In_T",
    "desc": "Posing with back",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Bel_Out_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Bel_Out_T",
    "desc": "End of back tattoo animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Bel_Pose_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Bel_Pose_T",
    "desc": "Getting tattoo on the chest",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Che_In_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Che_In_P",
    "desc": "Start of tattoo animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Che_In_T",
    "desc": "Start of tattoo animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Che_Out_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Che_Out_P",
    "desc": "Admiring chest tattoo",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Che_Out_T",
    "desc": "End of chest tattoo",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Che_Pose_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Che_Pose_P",
    "desc": "Posing with chest tattoo",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Che_Pose_T",
    "desc": "Tattooing a body part",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Drop_O",
    "desc": "Bugged animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Idle_Loop_O",
    "desc": "Bugged animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Idle_Loop_T",
    "desc": "Sitting on a chair loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Sit_In_O",
    "desc": "Bugged animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Sit_In_P",
    "desc": "Walking and sitting on a chair",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Sit_In_T",
    "desc": "Tattoo artist getting a customer",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Sit_Loop_O",
    "desc": "Bugged animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Sit_Loop_P",
    "desc": "Browsing for tattoos",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Sit_Loop_T",
    "desc": "Waiting for tattoo order",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Sit_Out_O",
    "desc": "Bugged animation",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Sit_Out_P",
    "desc": "Getting off the chair and walking",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "TATTOOS",
    "name": "TAT_Sit_Out_T",
    "desc": "Tattoo artist wishing customer well",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "TEC",
    "name": "TEC_crouchfire",
    "desc": "Tec9 crouch fire",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TEC",
    "name": "TEC_crouchreload",
    "desc": "Tec9 crouch reload",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TEC",
    "name": "TEC_fire",
    "desc": "Tec9 fire",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TEC",
    "name": "TEC_reload",
    "desc": "Tec9 reload",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRAIN",
    "name": "tran_gtup",
    "desc": "Getting up on the train",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRAIN",
    "name": "tran_hng",
    "desc": "Hanging from a train",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRAIN",
    "name": "tran_ouch",
    "desc": "Getting killed by a steel beam",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRAIN",
    "name": "tran_stmb",
    "desc": "Stumbling on a train",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_ALIGN_LHS",
    "desc": "Climb onto a truck from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_ALIGN_RHS",
    "desc": "Climb onto a truck from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_closedoor_LHS",
    "desc": "Close left truck door",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_closedoor_RHS",
    "desc": "Close right truck door",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_close_LHS",
    "desc": "Close door on the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_close_RHS",
    "desc": "Close door on the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_getin_LHS",
    "desc": "Getting into a truck on the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_getin_RHS",
    "desc": "Getting into a truck from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_getout_LHS",
    "desc": "Getting out of a truck from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_getout_RHS",
    "desc": "Getting out of a track from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_jackedLHS",
    "desc": "Getting jacked from a truck on the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_jackedRHS",
    "desc": "Getting jacked from a truck on the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_open_LHS",
    "desc": "Open left truck door",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_open_RHS",
    "desc": "Open right truck door",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_pullout_LHS",
    "desc": "Pulling out the truck driver from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_pullout_RHS",
    "desc": "Pulling out the truck passanger from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "TRUCK",
    "name": "TRUCK_Shuffle",
    "desc": "Truck shuffle",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "UZI",
    "name": "UZI_crouchfire",
    "desc": "Uzi crouch fire",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "UZI",
    "name": "UZI_crouchreload",
    "desc": "Uzi crouch reload",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "UZI",
    "name": "UZI_fire",
    "desc": "Uzi fire",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "UZI",
    "name": "UZI_fire_poor",
    "desc": "Uzi fire with poor skill",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "UZI",
    "name": "UZI_reload",
    "desc": "Uzi reload",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VAN",
    "name": "VAN_close_back_LHS",
    "desc": "Closing the back left door of a van",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VAN",
    "name": "VAN_close_back_RHS",
    "desc": "Closing the back right door of a van",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VAN",
    "name": "VAN_getin_Back_LHS",
    "desc": "Getting into the back left seat of a van",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VAN",
    "name": "VAN_getin_Back_RHS",
    "desc": "Getting into the back right seat of a van",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VAN",
    "name": "VAN_getout_back_LHS",
    "desc": "Getting out of the left back seat of a van",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VAN",
    "name": "VAN_getout_back_RHS",
    "desc": "Getting out of the right back seat of a van",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VAN",
    "name": "VAN_open_back_LHS",
    "desc": "Opening the back left door of a van",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VAN",
    "name": "VAN_open_back_RHS",
    "desc": "Opening the back right door of a van",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VENDING",
    "name": "VEND_Drink2_P",
    "desc": "Drinking from a vending machine",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VENDING",
    "name": "VEND_Drink_P",
    "desc": "Drinking from a vending machine",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VENDING",
    "name": "vend_eat1_P",
    "desc": "Eating from a vending machine",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VENDING",
    "name": "VEND_Eat_P",
    "desc": "Eating from a vending machine",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VENDING",
    "name": "VEND_Use",
    "desc": "Using a vending machine",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VENDING",
    "name": "VEND_Use_pt2",
    "desc": "Using a vending machine",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VORTEX",
    "name": "CAR_jumpin_LHS",
    "desc": "Entering a vortex from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VORTEX",
    "name": "CAR_jumpin_RHS",
    "desc": "Entering a vortex from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VORTEX",
    "name": "vortex_getout_LHS",
    "desc": "Exiting a vortex from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "VORTEX",
    "name": "vortex_getout_RHS",
    "desc": "Exiting a vortex from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_Back",
    "desc": "Wayfarer lean back",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_drivebyFT",
    "desc": "Wayfarer drive by front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_drivebyLHS",
    "desc": "Wayfarer drive by left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_drivebyRHS",
    "desc": "Wayfarer drive by right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_Fwd",
    "desc": "Wayfarer lean front",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_getoffBACK",
    "desc": "Bailing from a Wayfarer at high speed",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_getoffLHS",
    "desc": "Getting off a Wayfarer from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_getoffRHS",
    "desc": "Getting off a Wayfarer from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_hit",
    "desc": "Getting hit on a Wayfarer",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "WAYFARER",
    "name": "WF_jumponL",
    "desc": "Getting on a Wayfarer from the left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_jumponR",
    "desc": "Getting on a Wayfarer from the right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_kick",
    "desc": "Getting on a Wayfarer from the front",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_Left",
    "desc": "Wayfarer sway left",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_passenger",
    "desc": "Wayfarer passanger anim",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_pushes",
    "desc": "Wayfarer reverse",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_Ride",
    "desc": "Wayfarer riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_Right",
    "desc": "Wayfarer sway right",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WAYFARER",
    "name": "WF_Still",
    "desc": "Wayfarer still riding",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_1H_Lift",
    "desc": "Shop owner lifts a pistol",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_1H_Lift_End",
    "desc": "Shop owner puts a pistol on the counter",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_1H_Ret",
    "desc": "Shop owner retracts a pistol",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_1H_Ret_S",
    "desc": "Shop owner puts back a pistol",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_2H_Lift",
    "desc": "Shop owner lifts body armor",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_2H_Lift_End",
    "desc": "Shop owner puts body armor on the counter",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_2H_Ret",
    "desc": "Shop owner retracts body armor",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_2H_Ret_S",
    "desc": "Shop owner puts away body armor",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_Ar_Lift",
    "desc": "Shop owner lifts an AR",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_Ar_Lift_End",
    "desc": "Shop owner puts an AR on the counter",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_Ar_Ret",
    "desc": "Shop owner retracts an AR",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_Ar_Ret_S",
    "desc": "Shop owner puts back an AR",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_G_Lift_In",
    "desc": "Shop owner lifts a weapon",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_G_Lift_Out",
    "desc": "Shop owner puts a weapon on the counter",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_Tray_In",
    "desc": "Shop owner pose start",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_Tray_Out",
    "desc": "Shop owner pose end",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WEAPONS",
    "name": "SHP_Tray_Pose",
    "desc": "Shop owner lean on table pose",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B1",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B2",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B3",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B4",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B5",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B6",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B7",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B8",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B9",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B10",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B11",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B12",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B13",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B14",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B15",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_B16",
    "desc": "Bad \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G1",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G2",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G3",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G4",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G5",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G6",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G7",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G8",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G9",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G10",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G11",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G12",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G13",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G14",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G15",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "Dance_G16",
    "desc": "Good \"Funky president\" dance",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WOP",
    "name": "dance_loop",
    "desc": "Dancing loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WUZI",
    "name": "CS_Dead_Guy",
    "desc": "Cutscene dead guy animation",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "WUZI",
    "name": "CS_Plyr_pt1",
    "desc": "Cutscene player animation part 1",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "WUZI",
    "name": "CS_Plyr_pt2",
    "desc": "Cutscene player animation part 2",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "WUZI",
    "name": "CS_Wuzi_pt1",
    "desc": "Cutscene Wuzi animation part 1",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WUZI",
    "name": "CS_Wuzi_pt2",
    "desc": "Cutscene Wuzi animation part 2",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WUZI",
    "name": "Walkstart_Idle_01",
    "desc": "Wuzi's start walk idle",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WUZI",
    "name": "Wuzi_follow",
    "desc": "Wuzi's follow animation",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WUZI",
    "name": "Wuzi_Greet_Plyr",
    "desc": "Wuzi greeting the player",
    "loop": 0,
    "freeze": 1
  },
  {
    "lib": "WUZI",
    "name": "Wuzi_Greet_Wuzi",
    "desc": "Wuzi greeting",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WUZI",
    "name": "Wuzi_grnd_chk",
    "desc": "Wuzi grenade chuck",
    "loop": 0,
    "freeze": 0
  },
  {
    "lib": "WUZI",
    "name": "Wuzi_stand_loop",
    "desc": "Wuzi's stand animation loop",
    "loop": 1,
    "freeze": 0
  },
  {
    "lib": "WUZI",
    "name": "Wuzi_Walk",
    "desc": "Wuzi's walk",
    "loop": 1,
    "freeze": 0
  }
];
