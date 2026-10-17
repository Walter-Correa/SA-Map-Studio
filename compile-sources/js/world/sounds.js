// Catálogo completo de Sound IDs (PlayerPlaySound) e nó 3D para sons no mapa.
import * as THREE from 'three';

export const SOUND_CATEGORIES = [
  'Todos',
  'Efeitos e Interface',
  'Músicas e Ambientes',
  'Alarmes e Portas',
  'Cassino e Jogos',
  'Rádio Policial',
  'Locais (Rádio)',
  'Falas e Vozes',
  'Especiais',
];

export const SOUND_IDS = [
  {
    "id": 0,
    "name": "SOUND_STOP",
    "desc": "Parar som atual / Restaurar trilha ambiente externa",
    "cat": "Especiais"
  },
  {
    "id": 1,
    "name": "SOUND_DISABLE_INTERIOR_AMBIENT",
    "desc": "Desativar ruído de vento do interior 0",
    "cat": "Especiais"
  },
  {
    "id": 2,
    "name": "STREAM_POLICE_RADIO_01",
    "desc": "Rádio Policial (Faixas 2 a 59)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 66,
    "name": "STREAM_RADIO_ADVERT_01",
    "desc": "Comercial de Rádio (Faixas 66 a 134)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 135,
    "name": "AMBIENT_VENTILATION_1",
    "desc": "Ventilação de interior 1",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 136,
    "name": "AMBIENT_VENTILATION_2",
    "desc": "Ventilação de interior 2",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 137,
    "name": "AMBIENT_AMMUNATION",
    "desc": "Ambiente interno da Ammu-Nation",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 138,
    "name": "AMBIENT_AREA51",
    "desc": "Ambiente interno da Área 51 / 69",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 139,
    "name": "MUSIC_AWARDS_CEREMONY",
    "desc": "Música de cerimônia de premiação",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 140,
    "name": "MUSIC_DISCO_ROCK",
    "desc": "Música de Boate / Disco (Rock)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 141,
    "name": "MUSIC_BEE_BEE_GONE",
    "desc": "Música Let's Get Ready to Bumble",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 142,
    "name": "MUSIC_BIKE_AWARD",
    "desc": "Música de premiação (Escola de Moto)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 143,
    "name": "MUSIC_MARCOS_BISTRO",
    "desc": "Música do Marco's Bistro",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 144,
    "name": "MUSIC_DINER",
    "desc": "Música ambiente de lanchonete (Diner)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 145,
    "name": "MUSIC_AWARD_TRACK",
    "desc": "Música de premiação (1097)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 146,
    "name": "MUSIC_CASINO",
    "desc": "Música ambiente de Cassino",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 147,
    "name": "MUSIC_DISCO_ELECTRO",
    "desc": "Música de Boate / Disco (Electro)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 148,
    "name": "AMBIENT_PLANE_CABIN_1",
    "desc": "Zumbido interno de cabine de avião 1",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 149,
    "name": "MUSIC_DRIVING_AWARD",
    "desc": "Música de premiação (Auto-Escola)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 150,
    "name": "MUSIC_DUALITY",
    "desc": "Música Duality (1068)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 151,
    "name": "AMBIENT_FAN",
    "desc": "Ventilador girando",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 152,
    "name": "AMBIENT_BAR_OUTSIDE",
    "desc": "Ambiente de bar (lado externo)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 153,
    "name": "MUSIC_GOGO_SPACE_MONKEY",
    "desc": "Música Go Go Space Monkey (1062)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 154,
    "name": "AMBIENT_VENTILATION_3",
    "desc": "Ventilação de interior 3",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 155,
    "name": "AMBIENT_PLANE_CABIN_2",
    "desc": "Zumbido interno de cabine de avião 2",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 156,
    "name": "AMBIENT_PLANE_CABIN_3",
    "desc": "Zumbido interno de cabine de avião 3",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 157,
    "name": "MUSIC_DISCO_HIPHOP_1",
    "desc": "Música de Boate / Disco (Hip-Hop 1)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 158,
    "name": "AMBIENT_VENTILATION_4",
    "desc": "Ventilação de interior 4",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 159,
    "name": "AMBIENT_HORSE_RACE_1",
    "desc": "Corrida de cavalos (Inside Track 1)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 160,
    "name": "AMBIENT_HORSE_RACE_2",
    "desc": "Corrida de cavalos (Inside Track 2)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 161,
    "name": "MUSIC_PILOT_AWARD",
    "desc": "Música de premiação (Escola de Pilotagem)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 162,
    "name": "MUSIC_DISCO_HIPHOP_2",
    "desc": "Música de Boate / Disco (Hip-Hop 2)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 163,
    "name": "AMBIENT_VENTILATION_5",
    "desc": "Ventilação de interior 5",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 164,
    "name": "AMBIENT_CARRIER_LIFT_1",
    "desc": "Elevador de porta-aviões 1",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 165,
    "name": "AMBIENT_CARRIER_LIFT_2",
    "desc": "Elevador de porta-aviões 2",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 166,
    "name": "AMBIENT_RIOT",
    "desc": "Ambiente de tumulto / revolta nas ruas",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 167,
    "name": "AMBIENT_RAIN",
    "desc": "Ambiente de chuva",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 168,
    "name": "AMBIENT_PLANE_INTERIOR",
    "desc": "Interior de avião",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 169,
    "name": "AMBIENT_STUNT_RACE",
    "desc": "Ambiente de estádio / corrida radical",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 170,
    "name": "MUSIC_STRIP_CLUB",
    "desc": "Música de Strip Club",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 171,
    "name": "MUSIC_DISCO_WELCOME_JUNGLE",
    "desc": "Disco (Rock): Welcome To The Jungle",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 172,
    "name": "MUSIC_DARK_THEME",
    "desc": "Tema sombrio de suspense",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 173,
    "name": "AMBIENT_CONVEYOR_BELT",
    "desc": "Esteira rolante industrial",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 174,
    "name": "AMBIENT_WATER",
    "desc": "Correnteza de água",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 175,
    "name": "MUSIC_DISCO_1",
    "desc": "Música de Discoteca 1",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 176,
    "name": "MUSIC_SA_INTRO_THEME",
    "desc": "Tema Clássico de Abertura do GTA San Andreas",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 177,
    "name": "MUSIC_DISCO_2",
    "desc": "Música de Discoteca 2",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 178,
    "name": "MUSIC_DISCO_3",
    "desc": "Música de Discoteca 3",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 179,
    "name": "MUSIC_LOWRIDER_CHALLENGE_1",
    "desc": "Desafio de Lowrider 1",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 180,
    "name": "MUSIC_LOWRIDER_CHALLENGE_2",
    "desc": "Desafio de Lowrider 2",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 181,
    "name": "MUSIC_LOWRIDER_CHALLENGE_3",
    "desc": "Desafio de Lowrider 3",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 182,
    "name": "MUSIC_MISSION_PASSED_1",
    "desc": "Tema de Missão Concluída / Propriedade Comprada",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 183,
    "name": "MUSIC_MISSION_PASSED_2",
    "desc": "Tema de Missão Concluída (Clássico)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 184,
    "name": "VOICE_LINE_184",
    "desc": "Amostra de voz (184)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 185,
    "name": "RADIO_PLAYBACK_FM",
    "desc": "Rádio Playback FM (Faixas 185 a 314)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 315,
    "name": "RADIO_K_ROSE",
    "desc": "Rádio K-ROSE (Faixas 315 a 469)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 470,
    "name": "RADIO_K_DST",
    "desc": "Rádio K-DST (Faixas 470 a 625)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 534,
    "name": "RADIO_KDST_YOUNG_HEARTS",
    "desc": "K-DST: Rod Stewart - Young Hearts Be Free Tonight",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 669,
    "name": "MUSIC_DATE_FAILED",
    "desc": "Música de encontro fracassado",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 670,
    "name": "MUSIC_DATE_SUCCESS",
    "desc": "Música de encontro bem-sucedido",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 743,
    "name": "VOICE_BIG_SMOKE_ORDER",
    "desc": "Fala: Pedido gigante do Big Smoke no Drive-Thru",
    "cat": "Falas e Vozes"
  },
  {
    "id": 767,
    "name": "RADIO_BOUNCE_FM",
    "desc": "Rádio Bounce FM (Faixas 767 a 945)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 946,
    "name": "RADIO_SF_UR",
    "desc": "Rádio SF-UR (Faixas 946 a 999)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1000,
    "name": "SOUND_DISABLE_HELI_AUDIO",
    "desc": "Desativar sons de helicóptero",
    "cat": "Especiais"
  },
  {
    "id": 1001,
    "name": "SOUND_ENABLE_HELI_AUDIO",
    "desc": "Habilitar sons de helicóptero",
    "cat": "Especiais"
  },
  {
    "id": 1002,
    "name": "SOUND_CEILING_VENT_LAND",
    "desc": "Queda em duto de ventilação / Batida fraca",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1009,
    "name": "SOUND_BONNET_DENT",
    "desc": "Colisão / Amassar capô",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1020,
    "name": "SOUND_MACHINERY_LOOP",
    "desc": "Ruído constante de maquinário",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1021,
    "name": "SOUND_MACHINERY",
    "desc": "Maquinário em operação",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1022,
    "name": "SOUND_MOTOR_STOP",
    "desc": "Motor parando",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1027,
    "name": "SOUND_WHEEL_OF_FORTUNE_CLACKER",
    "desc": "Roda da fortuna / Batida leve",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1035,
    "name": "SOUND_SHUTTER_DOOR_START",
    "desc": "Porta de enrolar / garagem abrindo",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1036,
    "name": "SOUND_SHUTTER_DOOR_STOP",
    "desc": "Porta de enrolar / garagem parando",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1039,
    "name": "SOUND_PARACHUTE_OPEN",
    "desc": "Paraquedas abrindo",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1052,
    "name": "SOUND_AMMUNATION_BUY_WEAPON",
    "desc": "Comprar arma na Ammu-Nation (Blip A)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1053,
    "name": "SOUND_AMMUNATION_BUY_WEAPON_DENIED",
    "desc": "Compra negada na Ammu-Nation (Blip B)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1054,
    "name": "SOUND_SHOP_BUY",
    "desc": "Compra em loja confirmada (Blip A)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1055,
    "name": "SOUND_SHOP_BUY_DENIED",
    "desc": "Compra em loja negada (Blip B)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1056,
    "name": "SOUND_RACE_321",
    "desc": "Contagem de largada 3, 2, 1 (Corrida)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1057,
    "name": "SOUND_RACE_GO",
    "desc": "Sinal de largada GO! (Corrida)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1058,
    "name": "SOUND_PART_MISSION_COMPLETE",
    "desc": "Seleção / Etapa de missão concluída",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1062,
    "name": "SOUND_GOGO_TRACK_START",
    "desc": "Música Fliperama: Go Go Space Monkey (Iniciar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1063,
    "name": "SOUND_GOGO_TRACK_STOP",
    "desc": "Música Fliperama: Go Go Space Monkey (Parar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1068,
    "name": "SOUND_DUAL_TRACK_START",
    "desc": "Música Fliperama: Duality (Iniciar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1069,
    "name": "SOUND_DUAL_TRACK_STOP",
    "desc": "Música Fliperama: Duality (Parar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1076,
    "name": "SOUND_BEE_TRACK_START",
    "desc": "Música Fliperama: Let's Get Ready to Bumble (Iniciar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1077,
    "name": "SOUND_BEE_TRACK_STOP",
    "desc": "Música Fliperama: Let's Get Ready to Bumble (Parar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1083,
    "name": "SOUND_ROULETTE_ADD_CASH",
    "desc": "Apostar ficha na roleta / Marcar no mapa",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1084,
    "name": "SOUND_ROULETTE_REMOVE_CASH",
    "desc": "Retirar ficha na roleta / Desmarcar no mapa",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1085,
    "name": "SOUND_ROULETTE_NO_CASH",
    "desc": "Sem saldo na roleta (Blip C)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1095,
    "name": "SOUND_BIKE_PACKER_CLUNK",
    "desc": "Impacto metálico forte",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1097,
    "name": "SOUND_AWARD_TRACK_START",
    "desc": "Música: Cerimônia de premiação (Iniciar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1098,
    "name": "SOUND_AWARD_TRACK_STOP",
    "desc": "Música: Cerimônia de premiação (Parar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1100,
    "name": "SOUND_MESH_GATE_OPEN_START",
    "desc": "Portão de grade metálica abrindo",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1101,
    "name": "SOUND_MESH_GATE_OPEN_STOP",
    "desc": "Portão de grade metálica parando",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1130,
    "name": "SOUND_PUNCH_PED",
    "desc": "Soco / Golpe A",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1131,
    "name": "SOUND_AMMUNATION_GUN_COLLISION",
    "desc": "Colisão de arma / Objeto de madeira",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1132,
    "name": "SOUND_CAMERA_SHOT",
    "desc": "Clique de câmera fotográfica",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1133,
    "name": "SOUND_BUY_CAR_MOD",
    "desc": "Instalar componente de veículo (TransFender)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1134,
    "name": "SOUND_BUY_CAR_RESPRAY",
    "desc": "Spray de pintura de veículo (Pay 'n' Spray)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1135,
    "name": "SOUND_BASEBALL_BAT_HIT_PED",
    "desc": "Golpe de taco de beisebol",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1136,
    "name": "SOUND_STAMP_PED",
    "desc": "Soco / Pisotear B",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1137,
    "name": "SOUND_CHECKPOINT_AMBER",
    "desc": "Checkpoint Âmbar (Blip agudo A)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1138,
    "name": "SOUND_CHECKPOINT_GREEN",
    "desc": "Checkpoint Verde (Blip agudo B)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1139,
    "name": "SOUND_CHECKPOINT_RED",
    "desc": "Checkpoint Vermelho (Blip agudo C)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1140,
    "name": "SOUND_CAR_SMASH_CAR",
    "desc": "Colisão entre carros A",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1141,
    "name": "SOUND_CAR_SMASH_GATE",
    "desc": "Carro quebrando portão B",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1142,
    "name": "SOUND_OTB_TRACK_START",
    "desc": "Ambiente de estádio / Corrida de cavalos (Iniciar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1143,
    "name": "SOUND_OTB_TRACK_STOP",
    "desc": "Ambiente de estádio / Corrida de cavalos (Parar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1144,
    "name": "SOUND_PED_HIT_WATER_SPLASH",
    "desc": "Queda na água (Splash)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1145,
    "name": "SOUND_RESTAURANT_TRAY_COLLISION",
    "desc": "Colisão de bandeja de restaurante",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1147,
    "name": "SOUND_SWEETS_HORN",
    "desc": "Buzina de carro (Sweet)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1148,
    "name": "SOUND_MAGNET_VEHICLE_COLLISION",
    "desc": "Colisão metálica no ímã C",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1149,
    "name": "SOUND_PROPERTY_PURCHASED",
    "desc": "Imóvel adquirido / Selecionar",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1150,
    "name": "SOUND_PICKUP_STANDARD",
    "desc": "Coletar Pickup padrão",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1153,
    "name": "SOUND_GARAGE_DOOR_START",
    "desc": "Portão de garagem abrindo",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1154,
    "name": "SOUND_GARAGE_DOOR_STOP",
    "desc": "Portão de garagem parando",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1159,
    "name": "SOUND_EXPLOSION",
    "desc": "Explosão forte",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1163,
    "name": "SOUND_PED_COLLAPSE",
    "desc": "Queda de pedestre no chão",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1165,
    "name": "SOUND_SHUTTER_DOOR_SLOW_START",
    "desc": "Portão grande de hangar abrindo lento",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1166,
    "name": "SOUND_SHUTTER_DOOR_SLOW_STOP",
    "desc": "Portão grande de hangar parando",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1169,
    "name": "SOUND_RESTAURANT_CJ_PUKE",
    "desc": "Passando mal no restaurante",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 1183,
    "name": "SOUND_DRIVING_AWARD_TRACK_START",
    "desc": "Música: Resultado da Auto-Escola (Iniciar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1184,
    "name": "SOUND_DRIVING_AWARD_TRACK_STOP",
    "desc": "Música: Resultado da Auto-Escola (Parar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1185,
    "name": "SOUND_BIKE_AWARD_TRACK_START",
    "desc": "Música: Escola de Moto e Barco (Iniciar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1186,
    "name": "SOUND_BIKE_AWARD_TRACK_STOP",
    "desc": "Música: Escola de Moto e Barco (Parar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1187,
    "name": "SOUND_PILOT_AWARD_TRACK_START",
    "desc": "Música: Escola de Pilotagem (Iniciar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1188,
    "name": "SOUND_PILOT_AWARD_TRACK_STOP",
    "desc": "Música: Escola de Pilotagem (Parar)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 1190,
    "name": "SOUND_SLAP",
    "desc": "Tapa / Bofetada",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 2000,
    "name": "LOC_ALDEA_MALVADA",
    "desc": "Local no Rádio: \"ALDEA MALVADA\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2001,
    "name": "LOC_ANGEL_PINE",
    "desc": "Local no Rádio: \"ANGEL PINE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2002,
    "name": "LOC_ARCO_DEL_OESTE",
    "desc": "Local no Rádio: \"ARCO DEL OESTE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2003,
    "name": "LOC_AVISPA_COUNTRY_CLUB",
    "desc": "Local no Rádio: \"AVISPA COUNTRY CLUB\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2004,
    "name": "LOC_BACK_O_BEYOND",
    "desc": "Local no Rádio: \"BACK O BEYOND\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2005,
    "name": "LOC_BATTERY_POINT",
    "desc": "Local no Rádio: \"BATTERY POINT\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2006,
    "name": "LOC_BAYSIDE",
    "desc": "Local no Rádio: \"BAYSIDE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2007,
    "name": "LOC_BAYSIDE_MARINA",
    "desc": "Local no Rádio: \"BAYSIDE MARINA\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2008,
    "name": "LOC_BAYSIDE_TUNNEL",
    "desc": "Local no Rádio: \"BAYSIDE TUNNEL\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2009,
    "name": "LOC_BEACON_HILL",
    "desc": "Local no Rádio: \"BEACON HILL\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2010,
    "name": "LOC_BLACKFIELD",
    "desc": "Local no Rádio: \"BLACKFIELD\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2011,
    "name": "LOC_BLACKFIELD_CHAPEL",
    "desc": "Local no Rádio: \"BLACKFIELD CHAPEL\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2012,
    "name": "LOC_BLACKFIELD_INTERSECTION",
    "desc": "Local no Rádio: \"BLACKFIELD INTERSECTION\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2013,
    "name": "LOC_BLUEBERRY_ACRES",
    "desc": "Local no Rádio: \"BLUEBERRY ACRES\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2014,
    "name": "LOC_BLUEBERRY",
    "desc": "Local no Rádio: \"BLUEBERRY\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2015,
    "name": "LOC_BONE_COUNTY",
    "desc": "Local no Rádio: \"BONE COUNTY\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2016,
    "name": "LOC_CALIGULAS_PALACE",
    "desc": "Local no Rádio: \"CALIGULAS PALACE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2017,
    "name": "LOC_CALTON_HEIGHTS",
    "desc": "Local no Rádio: \"CALTON HEIGHTS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2018,
    "name": "LOC_CHINATOWN",
    "desc": "Local no Rádio: \"CHINATOWN\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2019,
    "name": "LOC_CITY_HALL",
    "desc": "Local no Rádio: \"CITY HALL\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2020,
    "name": "LOC_COME_A_LOT",
    "desc": "Local no Rádio: \"COME A LOT\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2021,
    "name": "LOC_COMMERCE",
    "desc": "Local no Rádio: \"COMMERCE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2022,
    "name": "LOC_CONFERENCE_CENTRE",
    "desc": "Local no Rádio: \"CONFERENCE CENTRE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2023,
    "name": "LOC_CRANBERRY_STATION",
    "desc": "Local no Rádio: \"CRANBERRY STATION\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2024,
    "name": "LOC_DILLIMORE",
    "desc": "Local no Rádio: \"DILLIMORE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2025,
    "name": "LOC_DOHERTY",
    "desc": "Local no Rádio: \"DOHERTY\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2026,
    "name": "LOC_DOWNTOWN",
    "desc": "Local no Rádio: \"DOWNTOWN\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2027,
    "name": "LOC_DOWNTOWN_LOS_SANTOS",
    "desc": "Local no Rádio: \"DOWNTOWN LOS SANTOS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2028,
    "name": "LOC_EAST_LOS_SANTOS",
    "desc": "Local no Rádio: \"EAST LOS SANTOS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2029,
    "name": "LOC_EAST_BEACH",
    "desc": "Local no Rádio: \"EAST BEACH\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2030,
    "name": "LOC_EASTER_BASIN",
    "desc": "Local no Rádio: \"EASTER BASIN\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2031,
    "name": "LOC_EASTER_BAY_AIRPORT",
    "desc": "Local no Rádio: \"EASTER BAY AIRPORT\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2032,
    "name": "LOC_EASTER_BAY_BLUFFS_CHEMICAL_PLANT",
    "desc": "Local no Rádio: \"EASTER BAY BLUFFS CHEMICAL PLANT\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2033,
    "name": "LOC_EASTER_TUNNEL",
    "desc": "Local no Rádio: \"EASTER TUNNEL\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2034,
    "name": "LOC_EL_CASTILLO_DEL_DIABLO",
    "desc": "Local no Rádio: \"EL CASTILLO DEL DIABLO\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2035,
    "name": "LOC_EL_CORONA",
    "desc": "Local no Rádio: \"EL CORONA\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2036,
    "name": "LOC_EL_QUEBRADOS",
    "desc": "Local no Rádio: \"EL QUEBRADOS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2037,
    "name": "LOC_ESPLANADE_EAST",
    "desc": "Local no Rádio: \"ESPLANADE EAST\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2038,
    "name": "LOC_ESPLANADE_NORTH",
    "desc": "Local no Rádio: \"ESPLANADE NORTH\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2039,
    "name": "LOC_FALLEN_TREE",
    "desc": "Local no Rádio: \"FALLEN TREE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2040,
    "name": "LOC_FALLOW_BRIDGE",
    "desc": "Local no Rádio: \"FALLOW BRIDGE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2041,
    "name": "LOC_FERN_RIDGE",
    "desc": "Local no Rádio: \"FERN RIDGE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2042,
    "name": "LOC_FINANCIAL",
    "desc": "Local no Rádio: \"FINANCIAL\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2043,
    "name": "LOC_FISHERS_LAGOON",
    "desc": "Local no Rádio: \"FISHERS LAGOON\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2044,
    "name": "LOC_FLINT_COUNTY",
    "desc": "Local no Rádio: \"FLINT COUNTY\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2045,
    "name": "LOC_FLINT_INTERSECTION",
    "desc": "Local no Rádio: \"FLINT INTERSECTION\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2046,
    "name": "LOC_FLINT_RANGE",
    "desc": "Local no Rádio: \"FLINT RANGE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2047,
    "name": "LOC_FLINT_WATER",
    "desc": "Local no Rádio: \"FLINT WATER\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2048,
    "name": "LOC_FORT_CARSON",
    "desc": "Local no Rádio: \"FORT CARSON\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2049,
    "name": "LOC_FOSTER_VALLEY",
    "desc": "Local no Rádio: \"FOSTER VALLEY\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2050,
    "name": "LOC_FREDERICK_BRIDGE",
    "desc": "Local no Rádio: \"FREDERICK BRIDGE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2051,
    "name": "LOC_GANTON",
    "desc": "Local no Rádio: \"GANTON\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2052,
    "name": "LOC_GANT_BRIDGE",
    "desc": "Local no Rádio: \"GANT BRIDGE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2053,
    "name": "LOC_GARCIA",
    "desc": "Local no Rádio: \"GARCIA\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2054,
    "name": "LOC_GARVER_BRIDGE",
    "desc": "Local no Rádio: \"GARVER BRIDGE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2055,
    "name": "LOC_GLEN_PARK",
    "desc": "Local no Rádio: \"GLEN PARK\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2056,
    "name": "LOC_GREENGLASS_COLLEGE",
    "desc": "Local no Rádio: \"GREENGLASS COLLEGE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2057,
    "name": "LOC_GREEN_PALMS",
    "desc": "Local no Rádio: \"GREEN PALMS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2058,
    "name": "LOC_HAMPTON_BARNS",
    "desc": "Local no Rádio: \"HAMPTON BARNS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2059,
    "name": "LOC_HANKYPANKY_POINT",
    "desc": "Local no Rádio: \"HANKYPANKY POINT\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2060,
    "name": "LOC_HARRY_GOLD_PARKWAY",
    "desc": "Local no Rádio: \"HARRY GOLD PARKWAY\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2061,
    "name": "LOC_HASHBERRY",
    "desc": "Local no Rádio: \"HASHBERRY\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2062,
    "name": "LOC_HILLTOP_FARM",
    "desc": "Local no Rádio: \"HILLTOP FARM\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2063,
    "name": "LOC_HUNTER_QUARRY",
    "desc": "Local no Rádio: \"HUNTER QUARRY\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2064,
    "name": "LOC_IDLEWOOD",
    "desc": "Local no Rádio: \"IDLEWOOD\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2065,
    "name": "LOC_JULIUS_THRUWAY_EAST",
    "desc": "Local no Rádio: \"JULIUS THRUWAY EAST\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2066,
    "name": "LOC_JULIUS_THRUWAY_NORTH",
    "desc": "Local no Rádio: \"JULIUS THRUWAY NORTH\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2067,
    "name": "LOC_JULIUS_THRUWAY_SOUTH",
    "desc": "Local no Rádio: \"JULIUS THRUWAY SOUTH\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2068,
    "name": "LOC_JULIUS_THRUWAY_WEST",
    "desc": "Local no Rádio: \"JULIUS THRUWAY WEST\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2069,
    "name": "LOC_JUNIPER_HILL",
    "desc": "Local no Rádio: \"JUNIPER HILL\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2070,
    "name": "LOC_JUNIPER_HOLLOW",
    "desc": "Local no Rádio: \"JUNIPER HOLLOW\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2071,
    "name": "LOC_KACC_MILITARY_FUELS",
    "desc": "Local no Rádio: \"KACC MILITARY FUELS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2072,
    "name": "LOC_KINCAID_BRIDGE",
    "desc": "Local no Rádio: \"KINCAID BRIDGE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2073,
    "name": "LOC_KINGS",
    "desc": "Local no Rádio: \"KINGS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2074,
    "name": "LOC_LAS_BARRANCAS",
    "desc": "Local no Rádio: \"LAS BARRANCAS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2075,
    "name": "LOC_LAS_BRUJAS",
    "desc": "Local no Rádio: \"LAS BRUJAS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2076,
    "name": "LOC_LAS_PAYASADAS",
    "desc": "Local no Rádio: \"LAS PAYASADAS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2077,
    "name": "LOC_LAST_DIME_MOTEL",
    "desc": "Local no Rádio: \"LAST DIME MOTEL\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2078,
    "name": "LOC_LAS_VENTURAS",
    "desc": "Local no Rádio: \"LAS VENTURAS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2079,
    "name": "LOC_LEAFY_HOLLOW",
    "desc": "Local no Rádio: \"LEAFY HOLLOW\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2080,
    "name": "LOC_LIL_PROBE_INN",
    "desc": "Local no Rádio: \"LIL PROBE INN\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2081,
    "name": "LOC_LINDEN_SIDE",
    "desc": "Local no Rádio: \"LINDEN SIDE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2082,
    "name": "LOC_LINDEN_STATION",
    "desc": "Local no Rádio: \"LINDEN STATION\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2083,
    "name": "LOC_LITTLE_MEXICO",
    "desc": "Local no Rádio: \"LITTLE MEXICO\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2084,
    "name": "LOC_LAS_COLINAS",
    "desc": "Local no Rádio: \"LAS COLINAS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2085,
    "name": "LOC_LOS_FLORES",
    "desc": "Local no Rádio: \"LOS FLORES\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2086,
    "name": "LOC_LOS_SANTOS",
    "desc": "Local no Rádio: \"LOS SANTOS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2087,
    "name": "LOC_LOS_SANTOS_INLET",
    "desc": "Local no Rádio: \"LOS SANTOS INLET\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2088,
    "name": "LOC_LOS_SANTOS_INTERNATIONAL",
    "desc": "Local no Rádio: \"LOS SANTOS INTERNATIONAL\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2089,
    "name": "LOC_LOS_SEPULCROS",
    "desc": "Local no Rádio: \"LOS SEPULCROS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2090,
    "name": "LOC_LAS_VENTURAS_AIRPORT",
    "desc": "Local no Rádio: \"LAS VENTURAS AIRPORT\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2091,
    "name": "LOC_LVA_FREIGHT_DEPOT",
    "desc": "Local no Rádio: \"LVA FREIGHT DEPOT\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2092,
    "name": "LOC_MARINA",
    "desc": "Local no Rádio: \"MARINA\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2093,
    "name": "LOC_MARKET",
    "desc": "Local no Rádio: \"MARKET\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2094,
    "name": "LOC_MARKET_STATION",
    "desc": "Local no Rádio: \"MARKET STATION\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2095,
    "name": "LOC_MARTIN_BRIDGE",
    "desc": "Local no Rádio: \"MARTIN BRIDGE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2096,
    "name": "LOC_MISSIONARY_HILL",
    "desc": "Local no Rádio: \"MISSIONARY HILL\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2097,
    "name": "LOC_MONTGOMERY",
    "desc": "Local no Rádio: \"MONTGOMERY\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2098,
    "name": "LOC_MONTGOMERY_INTERSECTION",
    "desc": "Local no Rádio: \"MONTGOMERY INTERSECTION\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2099,
    "name": "LOC_MOUNT_CHILLIAD",
    "desc": "Local no Rádio: \"MOUNT CHILLIAD\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2100,
    "name": "LOC_MULHOLLAND",
    "desc": "Local no Rádio: \"MULHOLLAND\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2101,
    "name": "LOC_MULHOLLAND_INTERSECTION",
    "desc": "Local no Rádio: \"MULHOLLAND INTERSECTION\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2102,
    "name": "LOC_NORTHSTAR_ROCK",
    "desc": "Local no Rádio: \"NORTHSTAR ROCK\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2103,
    "name": "LOC_OCEAN_DOCKS",
    "desc": "Local no Rádio: \"OCEAN DOCKS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2104,
    "name": "LOC_OCEAN_FLATS",
    "desc": "Local no Rádio: \"OCEAN FLATS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2105,
    "name": "LOC_OCTANE_SPRINGS",
    "desc": "Local no Rádio: \"OCTANE SPRINGS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2106,
    "name": "LOC_OLD_VENTURAS_STRIP",
    "desc": "Local no Rádio: \"OLD VENTURAS STRIP\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2107,
    "name": "LOC_OPEN_OCEAN",
    "desc": "Local no Rádio: \"OPEN OCEAN\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2108,
    "name": "LOC_PALLISADES",
    "desc": "Local no Rádio: \"PALLISADES\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2109,
    "name": "LOC_PALOMINO_CREEK",
    "desc": "Local no Rádio: \"PALOMINO CREEK\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2110,
    "name": "LOC_PARADISO",
    "desc": "Local no Rádio: \"PARADISO\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2111,
    "name": "LOC_PILGRAMS_CREEK",
    "desc": "Local no Rádio: \"PILGRAMS CREEK\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2112,
    "name": "LOC_PILSON_INTERSECTION",
    "desc": "Local no Rádio: \"PILSON INTERSECTION\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2113,
    "name": "LOC_PLAYA_DEL_SEVILLE",
    "desc": "Local no Rádio: \"PLAYA DEL SEVILLE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2114,
    "name": "LOC_PRICKLE_PINE",
    "desc": "Local no Rádio: \"PRICKLE PINE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2115,
    "name": "LOC_QUEENS",
    "desc": "Local no Rádio: \"QUEENS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2116,
    "name": "LOC_RANDOLPH_INDUSTRIAL_ESTATE",
    "desc": "Local no Rádio: \"RANDOLPH INDUSTRIAL ESTATE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2117,
    "name": "LOC_RED_COUNTY",
    "desc": "Local no Rádio: \"RED COUNTY\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2118,
    "name": "LOC_REDSANDS_EAST",
    "desc": "Local no Rádio: \"REDSANDS EAST\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2119,
    "name": "LOC_REDSANDS_WEST",
    "desc": "Local no Rádio: \"REDSANDS WEST\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2120,
    "name": "LOC_REGULAR_TOM",
    "desc": "Local no Rádio: \"REGULAR TOM\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2121,
    "name": "LOC_RICHMAN",
    "desc": "Local no Rádio: \"RICHMAN\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2122,
    "name": "LOC_ROCA_ESCALANTE",
    "desc": "Local no Rádio: \"ROCA ESCALANTE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2123,
    "name": "LOC_ROCKSHORE_EAST",
    "desc": "Local no Rádio: \"ROCKSHORE EAST\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2124,
    "name": "LOC_ROCKSHORE_WEST",
    "desc": "Local no Rádio: \"ROCKSHORE WEST\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2125,
    "name": "LOC_RODEO",
    "desc": "Local no Rádio: \"RODEO\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2126,
    "name": "LOC_ROYALE_CASINO",
    "desc": "Local no Rádio: \"ROYALE CASINO\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2127,
    "name": "LOC_SAN_ANDREAS_SOUND",
    "desc": "Local no Rádio: \"SAN ANDREAS SOUND\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2128,
    "name": "LOC_SAN_FIERRO",
    "desc": "Local no Rádio: \"SAN FIERRO\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2129,
    "name": "LOC_SAN_FIERRO_BAY",
    "desc": "Local no Rádio: \"SAN FIERRO BAY\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2130,
    "name": "LOC_SANTA_FLORA",
    "desc": "Local no Rádio: \"SANTA FLORA\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2131,
    "name": "LOC_SANTA_MARIA_BEACH",
    "desc": "Local no Rádio: \"SANTA MARIA BEACH\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2132,
    "name": "LOC_SHADY_CREEKS",
    "desc": "Local no Rádio: \"SHADY CREEKS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2133,
    "name": "LOC_SHERMAN_RESERVOIR",
    "desc": "Local no Rádio: \"SHERMAN RESERVOIR\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2134,
    "name": "LOC_SOBELL_RAILYARDS",
    "desc": "Local no Rádio: \"SOBELL RAILYARDS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2135,
    "name": "LOC_SPINYBED",
    "desc": "Local no Rádio: \"SPINYBED\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2136,
    "name": "LOC_STARFISH_CASINO",
    "desc": "Local no Rádio: \"STARFISH CASINO\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2137,
    "name": "LOC_SUNNYSIDE",
    "desc": "Local no Rádio: \"SUNNYSIDE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2138,
    "name": "LOC_TEMPLE",
    "desc": "Local no Rádio: \"TEMPLE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2139,
    "name": "LOC_THE_BIG_EAR_RADIOTELESCOPE",
    "desc": "Local no Rádio: \"THE BIG EAR RADIOTELESCOPE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2140,
    "name": "LOC_THE_CAMELS_TOE",
    "desc": "Local no Rádio: \"THE CAMELS TOE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2141,
    "name": "LOC_THE_CLOWNS_POCKET",
    "desc": "Local no Rádio: \"THE CLOWNS POCKET\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2142,
    "name": "LOC_THE_EMERALD_ISLE",
    "desc": "Local no Rádio: \"THE EMERALD ISLE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2143,
    "name": "LOC_THE_FARM",
    "desc": "Local no Rádio: \"THE FARM\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2144,
    "name": "LOC_THE_FOUR_DRAGONS_CASINO",
    "desc": "Local no Rádio: \"THE FOUR DRAGONS CASINO\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2145,
    "name": "LOC_THE_HIGH_ROLLER",
    "desc": "Local no Rádio: \"THE HIGH ROLLER\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2146,
    "name": "LOC_THE_MAKO_SPAN",
    "desc": "Local no Rádio: \"THE MAKO SPAN\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2147,
    "name": "LOC_THE_PANOPTICON",
    "desc": "Local no Rádio: \"THE PANOPTICON\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2148,
    "name": "LOC_THE_PINK_SWAN",
    "desc": "Local no Rádio: \"THE PINK SWAN\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2149,
    "name": "LOC_THE_PIRATES_IN_MENS_PANTS",
    "desc": "Local no Rádio: \"THE PIRATES IN MENS PANTS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2150,
    "name": "LOC_THE_SHERMAN_DAM",
    "desc": "Local no Rádio: \"THE SHERMAN DAM\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2151,
    "name": "LOC_THE_VISAGE",
    "desc": "Local no Rádio: \"THE VISAGE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2152,
    "name": "LOC_TIERRA_ROBADA",
    "desc": "Local no Rádio: \"TIERRA ROBADA\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2153,
    "name": "LOC_UNITY_STATION",
    "desc": "Local no Rádio: \"UNITY STATION\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2154,
    "name": "LOC_VALLE_OCULTADO",
    "desc": "Local no Rádio: \"VALLE OCULTADO\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2155,
    "name": "LOC_VERDANT_BLUFFS",
    "desc": "Local no Rádio: \"VERDANT BLUFFS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2156,
    "name": "LOC_VERDANT_MEADOWS",
    "desc": "Local no Rádio: \"VERDANT MEADOWS\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2157,
    "name": "LOC_VERONA_BEACH",
    "desc": "Local no Rádio: \"VERONA BEACH\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2158,
    "name": "LOC_VINEWOOD",
    "desc": "Local no Rádio: \"VINEWOOD\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2159,
    "name": "LOC_WHETSTONE",
    "desc": "Local no Rádio: \"WHETSTONE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2160,
    "name": "LOC_WHITEWOOD_ESTATES",
    "desc": "Local no Rádio: \"WHITEWOOD ESTATES\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2161,
    "name": "LOC_WILLOWFIELD",
    "desc": "Local no Rádio: \"WILLOWFIELD\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2162,
    "name": "LOC_YELLOWBELL_GOLF_COURSE",
    "desc": "Local no Rádio: \"YELLOWBELL GOLF COURSE\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2163,
    "name": "LOC_YELLOWBELL_STATION",
    "desc": "Local no Rádio: \"YELLOWBELL STATION\"",
    "cat": "Locais (Rádio)"
  },
  {
    "id": 2200,
    "name": "POLICE_BLACK",
    "desc": "Rádio Policial: \"Black\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2201,
    "name": "POLICE_BLUE",
    "desc": "Rádio Policial: \"Blue\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2202,
    "name": "POLICE_BROWN",
    "desc": "Rádio Policial: \"Brown\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2203,
    "name": "POLICE_COPPER",
    "desc": "Rádio Policial: \"Copper\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2204,
    "name": "POLICE_CUSTOM",
    "desc": "Rádio Policial: \"Custom\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2205,
    "name": "POLICE_CUSTOMIZED",
    "desc": "Rádio Policial: \"Customized\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2206,
    "name": "POLICE_DARK",
    "desc": "Rádio Policial: \"Dark\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2207,
    "name": "POLICE_GOLD",
    "desc": "Rádio Policial: \"Gold\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2208,
    "name": "POLICE_GREEN",
    "desc": "Rádio Policial: \"Green\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2209,
    "name": "POLICE_GREY",
    "desc": "Rádio Policial: \"Grey\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2210,
    "name": "POLICE_LIGHT",
    "desc": "Rádio Policial: \"Light\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2211,
    "name": "POLICE_PINK",
    "desc": "Rádio Policial: \"Pink\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2212,
    "name": "POLICE_RED",
    "desc": "Rádio Policial: \"Red\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2213,
    "name": "POLICE_SILVER",
    "desc": "Rádio Policial: \"Silver\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2214,
    "name": "POLICE_WHITE",
    "desc": "Rádio Policial: \"White\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2400,
    "name": "POLICE_CENTRAL",
    "desc": "Rádio Policial: \"Central\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2401,
    "name": "POLICE_EAST",
    "desc": "Rádio Policial: \"East\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2402,
    "name": "POLICE_NORTH",
    "desc": "Rádio Policial: \"North\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2403,
    "name": "POLICE_SOUTH",
    "desc": "Rádio Policial: \"South\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2404,
    "name": "POLICE_WEST",
    "desc": "Rádio Policial: \"West\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2600,
    "name": "POLICE_HEAD_TO_A_10",
    "desc": "Rádio Policial: \"Head to a 10-\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2601,
    "name": "POLICE_IN_A",
    "desc": "Rádio Policial: \"In a\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2602,
    "name": "POLICE_IN_WATER",
    "desc": "Rádio Policial: \"In water\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2603,
    "name": "POLICE_ON_A",
    "desc": "Rádio Policial: \"On a\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2604,
    "name": "POLICE_ON_FOOT",
    "desc": "Rádio Policial: \"On foot\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2605,
    "name": "POLICE_RESPOND_TO_A_10",
    "desc": "Rádio Policial: \"Respond to a 10-\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2606,
    "name": "POLICE_SUSPECT_IN_WATER",
    "desc": "Rádio Policial: \"Suspect in water\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2607,
    "name": "POLICE_SUSPECT_LAST_SEEN",
    "desc": "Rádio Policial: \"Suspect last seen\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2608,
    "name": "POLICE_WE_GOT_A_10",
    "desc": "Rádio Policial: \"We got a 10-\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2800,
    "name": "POLICE_17_IN",
    "desc": "Rádio Policial: \"17 in\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2801,
    "name": "POLICE_21_IN",
    "desc": "Rádio Policial: \"21 in\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2802,
    "name": "POLICE_24_IN",
    "desc": "Rádio Policial: \"24 in\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2803,
    "name": "POLICE_28_IN",
    "desc": "Rádio Policial: \"28 in\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2804,
    "name": "POLICE_34_IN",
    "desc": "Rádio Policial: \"34 in\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2805,
    "name": "POLICE_37_IN",
    "desc": "Rádio Policial: \"37 in\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2806,
    "name": "POLICE_7_IN",
    "desc": "Rádio Policial: \"7 in\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2807,
    "name": "POLICE_71_IN",
    "desc": "Rádio Policial: \"71 in\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2808,
    "name": "POLICE_81_IN",
    "desc": "Rádio Policial: \"81 in\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2809,
    "name": "POLICE_90_IN",
    "desc": "Rádio Policial: \"90 in\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2810,
    "name": "POLICE_91_IN",
    "desc": "Rádio Policial: \"91 in\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2811,
    "name": "POLICE_CODE_10A",
    "desc": "Rádio Policial: \"Code 10-A\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2812,
    "name": "POLICE_CODE_10B",
    "desc": "Rádio Policial: \"Code 10-B\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 2813,
    "name": "POLICE_CODE_10C",
    "desc": "Rádio Policial: \"Code 10-C\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3000,
    "name": "POLICE_2_DOOR",
    "desc": "Rádio Policial: \"2 Door\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3001,
    "name": "POLICE_4_DOOR",
    "desc": "Rádio Policial: \"4 Door\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3002,
    "name": "POLICE_AMBULANCE",
    "desc": "Rádio Policial: \"Ambulance\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3003,
    "name": "POLICE_ARTIC_CAB",
    "desc": "Rádio Policial: \"Artic Cab\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3004,
    "name": "POLICE_BEACH_BUGGY",
    "desc": "Rádio Policial: \"Beach Buggy\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3005,
    "name": "POLICE_BIKE",
    "desc": "Rádio Policial: \"Bike\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3006,
    "name": "POLICE_BOAT",
    "desc": "Rádio Policial: \"Boat\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3007,
    "name": "POLICE_BUGGY",
    "desc": "Rádio Policial: \"Buggy\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3008,
    "name": "POLICE_BULLDOZER",
    "desc": "Rádio Policial: \"Bulldozer\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3009,
    "name": "POLICE_BUS",
    "desc": "Rádio Policial: \"Bus\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3010,
    "name": "POLICE_CAMPER_VAN",
    "desc": "Rádio Policial: \"Camper Van\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3011,
    "name": "POLICE_COACH",
    "desc": "Rádio Policial: \"Coach\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3012,
    "name": "POLICE_COMBINE_HARVESTER",
    "desc": "Rádio Policial: \"Combine Harvester\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3013,
    "name": "POLICE_COMPACT",
    "desc": "Rádio Policial: \"Compact\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3014,
    "name": "POLICE_CONVERTIBLE",
    "desc": "Rádio Policial: \"Convertible\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3015,
    "name": "POLICE_COUPE",
    "desc": "Rádio Policial: \"Coupe\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3016,
    "name": "POLICE_CRUISER",
    "desc": "Rádio Policial: \"Cruiser\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3017,
    "name": "POLICE_FIRETRUCK",
    "desc": "Rádio Policial: \"Firetruck\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3018,
    "name": "POLICE_FORKLIFT",
    "desc": "Rádio Policial: \"Forklift\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3019,
    "name": "POLICE_FREIGHT_TRAIN",
    "desc": "Rádio Policial: \"Freight Train\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3020,
    "name": "POLICE_GARBAGE_TRUCK",
    "desc": "Rádio Policial: \"Garbage Truck\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3021,
    "name": "POLICE_GAS_TANKER",
    "desc": "Rádio Policial: \"Gas Tanker\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3022,
    "name": "POLICE_GOLF_CAR",
    "desc": "Rádio Policial: \"Golf Car\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3023,
    "name": "POLICE_GO_KART",
    "desc": "Rádio Policial: \"Go Kart\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3024,
    "name": "POLICE_HEARSE",
    "desc": "Rádio Policial: \"Hearse\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3025,
    "name": "POLICE_HELICOPTER",
    "desc": "Rádio Policial: \"Helicopter\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3026,
    "name": "POLICE_HOVERCRAFT",
    "desc": "Rádio Policial: \"Hovercraft\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3027,
    "name": "POLICE_ICECREAM_VAN",
    "desc": "Rádio Policial: \"Icecream Van\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3028,
    "name": "POLICE_JEEP",
    "desc": "Rádio Policial: \"Jeep\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3029,
    "name": "POLICE_LAWN_MOWER",
    "desc": "Rádio Policial: \"Lawn Mower\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3030,
    "name": "POLICE_LIMO",
    "desc": "Rádio Policial: \"Limo\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3031,
    "name": "POLICE_LOWRIDER",
    "desc": "Rádio Policial: \"Lowrider\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3032,
    "name": "POLICE_MOPED",
    "desc": "Rádio Policial: \"Moped\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3033,
    "name": "POLICE_MOTORBIKE",
    "desc": "Rádio Policial: \"Motorbike\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3034,
    "name": "POLICE_OFFROAD",
    "desc": "Rádio Policial: \"Offroad\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3035,
    "name": "POLICE_PEOPLE_CARRIER",
    "desc": "Rádio Policial: \"People Carrier\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3036,
    "name": "POLICE_PICKUP",
    "desc": "Rádio Policial: \"Pickup\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3037,
    "name": "POLICE_PLANE",
    "desc": "Rádio Policial: \"Plane\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3038,
    "name": "POLICE_POLICE_CAR",
    "desc": "Rádio Policial: \"Police Car\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3039,
    "name": "POLICE_POLICE_VAN",
    "desc": "Rádio Policial: \"Police Van\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3040,
    "name": "POLICE_QUAD_BIKE",
    "desc": "Rádio Policial: \"Quad Bike\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3041,
    "name": "POLICE_RUBBER_DINGHY",
    "desc": "Rádio Policial: \"Rubber Dinghy\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3042,
    "name": "POLICE_SAND_BUGGY",
    "desc": "Rádio Policial: \"Sand Buggy\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3043,
    "name": "POLICE_SEA_PLANE",
    "desc": "Rádio Policial: \"Sea Plane\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3044,
    "name": "POLICE_SNOWCAT",
    "desc": "Rádio Policial: \"Snowcat\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3045,
    "name": "POLICE_SPEEDBOAT",
    "desc": "Rádio Policial: \"Speedboat\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3046,
    "name": "POLICE_SPORT",
    "desc": "Rádio Policial: \"Sport\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3047,
    "name": "POLICE_SPORTS_CAR",
    "desc": "Rádio Policial: \"Sports Car\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3048,
    "name": "POLICE_SPORTS_BIKE",
    "desc": "Rádio Policial: \"Sports Bike\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3049,
    "name": "POLICE_STATION_WAGON",
    "desc": "Rádio Policial: \"Station Wagon\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3050,
    "name": "POLICE_SUV",
    "desc": "Rádio Policial: \"SUV\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3051,
    "name": "POLICE_TANK",
    "desc": "Rádio Policial: \"Tank\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3052,
    "name": "POLICE_TAXI",
    "desc": "Rádio Policial: \"Taxi\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3053,
    "name": "POLICE_TRACTOR",
    "desc": "Rádio Policial: \"Tractor\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3054,
    "name": "POLICE_TRAIN",
    "desc": "Rádio Policial: \"Train\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3055,
    "name": "POLICE_TRAM",
    "desc": "Rádio Policial: \"Tram\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3056,
    "name": "POLICE_TRUCK",
    "desc": "Rádio Policial: \"Truck\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3057,
    "name": "POLICE_VAN",
    "desc": "Rádio Policial: \"Van\"",
    "cat": "Rádio Policial"
  },
  {
    "id": 3200,
    "name": "SOUND_AIR_HORN_1",
    "desc": "Buzina a ar curta",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 3201,
    "name": "SOUND_AIR_HORN_2",
    "desc": "Buzina a ar longa",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 3400,
    "name": "SOUND_AIR_CONDITIONING",
    "desc": "Ar-condicionado contínuo",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 3401,
    "name": "SOUND_RINGING_BELL_LOOP",
    "desc": "Campainha / Alarme contínuo",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 3600,
    "name": "SOUND_CALLING_TONE",
    "desc": "Tom de chamada de telefone",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 3800,
    "name": "SOUND_VIDEOTAPE_LOOP",
    "desc": "Fita de vídeo rebobinando (contínuo)",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 4200,
    "name": "SOUND_CASINO_BANDIT_START",
    "desc": "Caça-níquel girando (Cassino)",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 4201,
    "name": "SOUND_CASINO_FALLING_COINS",
    "desc": "Moedas caindo (Prêmio no Cassino)",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 4202,
    "name": "SOUND_CASINO_BLIP_1",
    "desc": "Blip de cassino 1",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 4203,
    "name": "SOUND_CASINO_BLIP_2",
    "desc": "Blip de cassino 2",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 4400,
    "name": "SOUND_BARBER_RAZOR",
    "desc": "Máquina elétrica de cortar cabelo (Barbearia)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 4800,
    "name": "VOICE_GYM_LEARN_MOVES",
    "desc": "Academia: 'Yo, you wanna learn some new moves?'",
    "cat": "Falas e Vozes"
  },
  {
    "id": 4801,
    "name": "VOICE_GYM_STREETS_MEAN",
    "desc": "Academia: 'Suit yourself homes, but the streets are mean dude.'",
    "cat": "Falas e Vozes"
  },
  {
    "id": 4802,
    "name": "VOICE_GYM_GET_MUSCLES",
    "desc": "Academia: 'Man you're an embarrassment, get yourselves some muscles first.'",
    "cat": "Falas e Vozes"
  },
  {
    "id": 4803,
    "name": "VOICE_GYM_GO_AROUND",
    "desc": "Academia: 'Hey you wanna go around with me?'",
    "cat": "Falas e Vozes"
  },
  {
    "id": 4804,
    "name": "VOICE_GYM_PAY_ATTENTION",
    "desc": "Academia: 'Yo pay attention and you might learn something.'",
    "cat": "Falas e Vozes"
  },
  {
    "id": 4805,
    "name": "VOICE_GYM_CHARGE_IN",
    "desc": "Academia: 'Yo charge in and batter yo opponent!'",
    "cat": "Falas e Vozes"
  },
  {
    "id": 4806,
    "name": "VOICE_GYM_DOWN_AND_OUT",
    "desc": "Academia: 'Make sure yo opponent is down and out!'",
    "cat": "Falas e Vozes"
  },
  {
    "id": 4807,
    "name": "VOICE_GYM_NEVER_RECOVER",
    "desc": "Academia: 'Never give your opponent time to recover.'",
    "cat": "Falas e Vozes"
  },
  {
    "id": 5200,
    "name": "SOUND_GAME_BUZZ_LOOP",
    "desc": "Zumbido contínuo (Jogo)",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5201,
    "name": "SOUND_GAME_BLING",
    "desc": "Bling de pontuação (Jogo)",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5202,
    "name": "SOUND_GAME_BUMBLEBEE_DAMAGE",
    "desc": "Videogame Bumblebee: Dano sofrido",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5203,
    "name": "SOUND_GAME_BUMBLEBEE_GAMEOVER",
    "desc": "Videogame Bumblebee: Game Over",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5204,
    "name": "SOUND_GAME_BUMBLEBEE_FIRE",
    "desc": "Videogame Bumblebee: Disparo",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5205,
    "name": "SOUND_GAME_BUMBLEBEE_BEEP",
    "desc": "Videogame Bumblebee: Beep",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5206,
    "name": "SOUND_GAME_BUMBLEBEE_DEATH",
    "desc": "Videogame Bumblebee: Morte",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5400,
    "name": "VOICE_CASINO_PLACE_BETS_1",
    "desc": "Cassino: 'Place your bets!'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5401,
    "name": "VOICE_CASINO_PLACE_BETS_2",
    "desc": "Cassino: 'Place your bets ladies and gentlemen.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5402,
    "name": "VOICE_CASINO_CREDIT_OFFER_1",
    "desc": "Cassino: 'An offer of credit has been made sir.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5403,
    "name": "VOICE_CASINO_CREDIT_OFFER_2",
    "desc": "Cassino: 'The house is prepared to offer you credit sir.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5404,
    "name": "VOICE_CASINO_CREDIT_RATING",
    "desc": "Cassino: 'The house recognises sir's credit rating.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5405,
    "name": "VOICE_CASINO_NO_MONEY_1",
    "desc": "Cassino: 'Sir doesn't have sufficient money to back another bet.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5406,
    "name": "VOICE_CASINO_NO_MONEY_2",
    "desc": "Cassino: 'Sorry sir you do not have enough funds.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5407,
    "name": "VOICE_CASINO_NO_MONEY_3",
    "desc": "Cassino: 'You appear to have insufficient funds to continue betting.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5408,
    "name": "VOICE_CASINO_NO_MORE_BETS_1",
    "desc": "Cassino: 'No more bets please!'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5409,
    "name": "VOICE_CASINO_NO_MORE_BETS_2",
    "desc": "Cassino: 'No more bets ladies and gentlemen, please.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5410,
    "name": "VOICE_CASINO_NO_MORE_BETS_3",
    "desc": "Cassino: 'No more bets people.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5411,
    "name": "VOICE_ROULETTE_NUM_01",
    "desc": "Roleta: Número cantado #1",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5412,
    "name": "VOICE_ROULETTE_NUM_02",
    "desc": "Roleta: Número cantado #2",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5413,
    "name": "VOICE_ROULETTE_NUM_03",
    "desc": "Roleta: Número cantado #3",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5414,
    "name": "VOICE_ROULETTE_NUM_04",
    "desc": "Roleta: Número cantado #4",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5415,
    "name": "VOICE_ROULETTE_NUM_05",
    "desc": "Roleta: Número cantado #5",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5416,
    "name": "VOICE_ROULETTE_NUM_06",
    "desc": "Roleta: Número cantado #6",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5417,
    "name": "VOICE_ROULETTE_NUM_07",
    "desc": "Roleta: Número cantado #7",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5418,
    "name": "VOICE_ROULETTE_NUM_08",
    "desc": "Roleta: Número cantado #8",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5419,
    "name": "VOICE_ROULETTE_NUM_09",
    "desc": "Roleta: Número cantado #9",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5420,
    "name": "VOICE_ROULETTE_NUM_10",
    "desc": "Roleta: Número cantado #10",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5421,
    "name": "VOICE_ROULETTE_NUM_11",
    "desc": "Roleta: Número cantado #11",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5422,
    "name": "VOICE_ROULETTE_NUM_12",
    "desc": "Roleta: Número cantado #12",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5423,
    "name": "VOICE_ROULETTE_NUM_13",
    "desc": "Roleta: Número cantado #13",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5424,
    "name": "VOICE_ROULETTE_NUM_14",
    "desc": "Roleta: Número cantado #14",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5425,
    "name": "VOICE_ROULETTE_NUM_15",
    "desc": "Roleta: Número cantado #15",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5426,
    "name": "VOICE_ROULETTE_NUM_16",
    "desc": "Roleta: Número cantado #16",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5427,
    "name": "VOICE_ROULETTE_NUM_17",
    "desc": "Roleta: Número cantado #17",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5428,
    "name": "VOICE_ROULETTE_NUM_18",
    "desc": "Roleta: Número cantado #18",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5429,
    "name": "VOICE_ROULETTE_NUM_19",
    "desc": "Roleta: Número cantado #19",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5430,
    "name": "VOICE_ROULETTE_NUM_20",
    "desc": "Roleta: Número cantado #20",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5431,
    "name": "VOICE_ROULETTE_NUM_21",
    "desc": "Roleta: Número cantado #21",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5432,
    "name": "VOICE_ROULETTE_NUM_22",
    "desc": "Roleta: Número cantado #22",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5433,
    "name": "VOICE_ROULETTE_NUM_23",
    "desc": "Roleta: Número cantado #23",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5434,
    "name": "VOICE_ROULETTE_NUM_24",
    "desc": "Roleta: Número cantado #24",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5435,
    "name": "VOICE_ROULETTE_NUM_25",
    "desc": "Roleta: Número cantado #25",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5436,
    "name": "VOICE_ROULETTE_NUM_26",
    "desc": "Roleta: Número cantado #26",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5437,
    "name": "VOICE_ROULETTE_NUM_27",
    "desc": "Roleta: Número cantado #27",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5438,
    "name": "VOICE_ROULETTE_NUM_28",
    "desc": "Roleta: Número cantado #28",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5439,
    "name": "VOICE_ROULETTE_NUM_29",
    "desc": "Roleta: Número cantado #29",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5440,
    "name": "VOICE_ROULETTE_NUM_30",
    "desc": "Roleta: Número cantado #30",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5441,
    "name": "VOICE_ROULETTE_NUM_31",
    "desc": "Roleta: Número cantado #31",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5442,
    "name": "VOICE_ROULETTE_NUM_32",
    "desc": "Roleta: Número cantado #32",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5443,
    "name": "VOICE_ROULETTE_NUM_33",
    "desc": "Roleta: Número cantado #33",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5444,
    "name": "VOICE_ROULETTE_NUM_34",
    "desc": "Roleta: Número cantado #34",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5445,
    "name": "VOICE_ROULETTE_NUM_35",
    "desc": "Roleta: Número cantado #35",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5446,
    "name": "VOICE_ROULETTE_NUM_36",
    "desc": "Roleta: Número cantado #36",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5447,
    "name": "VOICE_ROULETTE_NUM_37",
    "desc": "Roleta: Número cantado #37",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5448,
    "name": "VOICE_CASINO_YOU_WIN_1",
    "desc": "Cassino: 'You win!'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5449,
    "name": "VOICE_CASINO_YOU_WIN_2",
    "desc": "Cassino: 'You win sir well done.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5450,
    "name": "VOICE_CASINO_CONGRATS_1",
    "desc": "Cassino: 'Congratulations sir!'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5451,
    "name": "VOICE_CASINO_REGULARS_ONLY",
    "desc": "Cassino: 'Sorry sir, regulars only.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5452,
    "name": "VOICE_CASINO_NO_LIMIT",
    "desc": "Cassino: 'The house does not recognize your limit at this table sir.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5453,
    "name": "VOICE_CASINO_THANK_YOU_1",
    "desc": "Cassino: 'Thank you sir have a nice day!'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5454,
    "name": "VOICE_CASINO_THANK_YOU_2",
    "desc": "Cassino: 'Thank you for playing sir!'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5455,
    "name": "VOICE_CASINO_PAYS_1",
    "desc": "Cassino: 'One dollar pays out!'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5456,
    "name": "VOICE_CASINO_PAYS_2",
    "desc": "Cassino: 'Two dollars pays out!'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5457,
    "name": "VOICE_CASINO_PAYS_5",
    "desc": "Cassino: 'Five dollars pays out!'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5458,
    "name": "VOICE_CASINO_PAYS_10",
    "desc": "Cassino: 'Ten dollars pays out.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5459,
    "name": "VOICE_CASINO_PAYS_20",
    "desc": "Cassino: 'Twenty dollars pays out.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5460,
    "name": "VOICE_CASINO_PAYS_40",
    "desc": "Cassino: 'Forty dollars pays out.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5461,
    "name": "VOICE_CASINO_JACKPOT",
    "desc": "Cassino: 'Jackpot!'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5462,
    "name": "VOICE_CASINO_ANOTHER_WIN",
    "desc": "Cassino: 'Another win for sir!'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5463,
    "name": "VOICE_CASINO_QUITE_A_RUN",
    "desc": "Cassino: 'Congratulations sir, you're having quite a run.'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5464,
    "name": "VOICE_CASINO_LUCK_HOLDS",
    "desc": "Cassino: 'I hope sir's luck holds!'",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 6000,
    "name": "SOUND_BLAST_DOOR_SLIDE",
    "desc": "Porta blindada deslizando",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 6001,
    "name": "SOUND_REPEATING_SIREN",
    "desc": "Sirene de alarme repetitiva (a cada 2s)",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 6002,
    "name": "SOUND_HEAVY_DOOR",
    "desc": "Porta pesada batendo",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 6003,
    "name": "SOUND_ELECTRICITY_TAZER",
    "desc": "Descarga elétrica / Tazer",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 6200,
    "name": "SOUND_BOAT_SCHOOL_SEAGULLS",
    "desc": "Gaivotas na marina",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 6201,
    "name": "VOICE_BOAT_SCHOOL_WELCOME",
    "desc": "Escola Náutica: 'Welcome to the boat school.'",
    "cat": "Falas e Vozes"
  },
  {
    "id": 6202,
    "name": "VOICE_BOAT_SCHOOL_BRONZE",
    "desc": "Escola Náutica: 'To pass, you must achieve bronze or higher...'",
    "cat": "Falas e Vozes"
  },
  {
    "id": 6203,
    "name": "VOICE_BOAT_SCHOOL_DEMO",
    "desc": "Escola Náutica: 'To view a demonstration of each test...'",
    "cat": "Falas e Vozes"
  },
  {
    "id": 6204,
    "name": "VOICE_BOAT_SCHOOL_UNLOCK",
    "desc": "Escola Náutica: 'Passing the test, will unlock the next test.'",
    "cat": "Falas e Vozes"
  },
  {
    "id": 6205,
    "name": "VOICE_BOAT_SCHOOL_SCORES",
    "desc": "Escola Náutica: 'You can come back and check your scores...'",
    "cat": "Falas e Vozes"
  },
  {
    "id": 6400,
    "name": "SOUND_DOOR_BUZZER",
    "desc": "Campainha / Interfone de porta (Blip)",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 6401,
    "name": "SOUND_LIFT_BELL_RINGS",
    "desc": "Sino de elevador (Ding)",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 39000,
    "name": "VOICE_PED_39000",
    "desc": "Voz NPC: \"What would your mother think?\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 39002,
    "name": "VOICE_PED_39002",
    "desc": "Voz NPC: \"Filth like you always have to pay for sex!\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 39047,
    "name": "VOICE_PED_39047",
    "desc": "Voz NPC: \"Where's my cellphone!!\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 39051,
    "name": "VOICE_PED_39051",
    "desc": "Voz NPC: \"That's right put your hands there\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 39052,
    "name": "VOICE_PED_39052",
    "desc": "Voz NPC: \"Holy fuck I've got my phone\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 39074,
    "name": "VOICE_PED_39074",
    "desc": "Voz NPC: \"I'm listening...\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 39076,
    "name": "VOICE_PED_39076",
    "desc": "Voz NPC: \"Aha, real interesting\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 50002,
    "name": "VOICE_PED_50002",
    "desc": "Voz NPC: \"Just Try Punk! Just Try It!\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 50004,
    "name": "VOICE_PED_50004",
    "desc": "Voz NPC: \"You're My World Now!\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 50050,
    "name": "VOICE_PED_50050",
    "desc": "Voz NPC: \"Tell My Wife I Love Her\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 50051,
    "name": "VOICE_PED_50051",
    "desc": "Voz NPC: \"I'm going in\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 50052,
    "name": "VOICE_PED_50052",
    "desc": "Voz NPC: \"What The Hell!\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 50053,
    "name": "VOICE_PED_50053",
    "desc": "Voz NPC: \"Uh, My Coffee\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 50094,
    "name": "VOICE_PED_50094",
    "desc": "Voz NPC: \"Wait Wait, think about what you're doing\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 100001,
    "name": "VOICE_PED_100001",
    "desc": "Voz NPC: \"Come On, time is money\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 100005,
    "name": "VOICE_PED_100005",
    "desc": "Voz NPC: \"Not This Car!\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 100006,
    "name": "VOICE_PED_100006",
    "desc": "Voz NPC: \"My boss is gonna kill me\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 100007,
    "name": "VOICE_PED_100007",
    "desc": "Voz NPC: \"There goes another tip\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 100008,
    "name": "VOICE_PED_100008",
    "desc": "Voz NPC: \"OH NO MAN!\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 100009,
    "name": "VOICE_PED_100009",
    "desc": "Voz NPC: \"Today couldn't get any worse\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 100010,
    "name": "VOICE_PED_100010",
    "desc": "Voz NPC: \"This is not good\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 100011,
    "name": "VOICE_PED_100011",
    "desc": "Voz NPC: \"You Idiot\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 100012,
    "name": "VOICE_PED_100012",
    "desc": "Voz NPC: \"Look Out!\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 100013,
    "name": "VOICE_PED_100013",
    "desc": "Voz NPC: \"What Are You Doing?!\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 100014,
    "name": "VOICE_PED_100014",
    "desc": "Voz NPC: \"Heeeeey\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 100015,
    "name": "VOICE_PED_100015",
    "desc": "Voz NPC: \"Oh Fuck\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 100016,
    "name": "VOICE_PED_100016",
    "desc": "Voz NPC: \"What The Fuck\"",
    "cat": "Falas e Vozes"
  },
  {
    "id": 100017,
    "name": "VOICE_PED_100017",
    "desc": "Voz NPC: \"Hey Man!\"",
    "cat": "Falas e Vozes"
  }
];

export const SOUND_CATALOG = SOUND_IDS;

export function getSoundInfo(id) {
  return SOUND_IDS.find(s => s.id === (id | 0)) || { id: id | 0, name: `SOUND_${id}`, desc: `Som ID ${id}`, cat: 'Efeitos e Interface' };
}

export function createSoundNode(snd) {
  const group = new THREE.Group();
  group.name = `sound_${snd.soundid}`;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#38bdf8';
  ctx.stroke();

  // Desenha ícone de alto-falante
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(18, 26);
  ctx.lineTo(26, 26);
  ctx.lineTo(35, 18);
  ctx.lineTo(35, 46);
  ctx.lineTo(26, 38);
  ctx.lineTo(18, 38);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(36, 32, 7, -Math.PI / 3, Math.PI / 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(36, 32, 12, -Math.PI / 3, Math.PI / 3);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.scale.set(2.4, 2.4, 1);
  sprite.position.set(0, 0, 1.8);
  sprite.renderOrder = 10;
  group.add(sprite);

  // Esfera azul translúcida na base
  const sphGeo = new THREE.SphereGeometry(0.65, 16, 12);
  sphGeo.translate(0, 0, 0.65);
  const sphMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4, wireframe: true });
  group.add(new THREE.Mesh(sphGeo, sphMat));

  const pickGeo = new THREE.CylinderGeometry(1.0, 1.0, 2.6, 12);
  pickGeo.rotateX(Math.PI / 2);
  pickGeo.translate(0, 0, 1.3);
  const pickMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false });
  group.add(new THREE.Mesh(pickGeo, pickMat));

  group.userData.isSound = true;
  group.userData.kind = 'sounds';
  return group;
}
