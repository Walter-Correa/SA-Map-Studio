// Suporte completo a veículos: cores do carcols.dat, paintjobs e tuning (AddVehicleComponent)
// Conforme a especificação do Open.MP e SA-MP: https://open.mp/docs/scripting/functions/AddVehicleComponent

export const CAR_COLORS = [
  [0,0,0], [245,245,245], [42,119,161], [132,4,16], [38,55,57], [134,68,110], [215,142,16], [76,117,183],
  [189,190,198], [94,112,114], [70,89,122], [101,106,121], [93,126,141], [88,89,90], [214,218,214], [156,161,163],
  [51,95,63], [115,14,26], [123,10,42], [159,157,148], [116,29,40], [109,40,55], [115,51,34], [63,62,59],
  [68,68,68], [116,86,55], [105,123,142], [59,78,120], [61,74,94], [83,104,89], [66,83,73], [44,40,36],
  [74,52,27], [151,149,146], [109,122,136], [78,104,129], [156,138,125], [109,103,89], [78,88,68], [150,145,140],
  [107,36,32], [107,67,81], [54,65,85], [111,130,151], [86,103,123], [67,88,71], [120,70,58], [115,24,39],
  [39,44,46], [116,74,40], [68,98,79], [46,91,88], [48,79,69], [77,98,104], [63,80,95], [51,63,54],
  [164,160,150], [101,134,153], [11,65,77], [122,117,96], [131,139,121], [123,113,94], [33,68,106], [66,80,68],
  [68,56,49], [138,136,134], [77,91,97], [158,164,158], [152,149,134], [118,123,124], [82,86,77], [103,116,132],
  [139,136,118], [38,56,41], [12,56,38], [47,56,79], [137,137,137], [98,96,91], [58,62,58], [111,103,95],
  [142,140,127], [66,31,33], [75,32,43], [51,41,40], [49,65,60], [75,73,72], [117,106,94], [150,144,126],
  [123,118,106], [146,141,113], [148,157,159], [164,160,147], [110,34,31], [72,98,90], [92,109,121], [94,96,89],
  [160,161,153], [116,29,40], [153,152,140], [145,115,71], [115,70,89], [125,98,86], [119,124,107], [144,124,104],
  [112,85,96], [127,116,106], [121,105,98], [143,140,130], [105,94,94], [87,69,64], [66,48,31], [115,53,36],
  [62,44,36], [139,119,109], [141,114,84], [148,119,103], [141,163,164], [138,148,142], [155,159,157], [136,149,160],
  [131,142,146], [88,89,90], [131,139,131], [135,132,126], [49,52,53], [81,81,81], [255,255,255], [42,119,161],
  [23,117,23], [33,6,6], [18,84,120], [69,42,13], [87,30,30], [1,7,1], [37,34,90], [44,137,170],
  [138,77,189], [53,150,58], [183,183,183], [70,76,141], [132,136,140], [129,120,103], [129,122,38], [106,80,111],
  [88,62,111], [140,185,114], [130,79,120], [109,39,106], [30,29,19], [30,19,6], [31,37,24], [44,69,49],
  [30,76,153], [46,95,67], [30,153,72], [30,153,153], [153,153,118], [124,132,153], [153,46,30], [44,30,8],
  [20,36,7], [153,62,77], [30,76,153], [25,129,129], [26,41,42], [22,97,111], [27,102,135], [108,63,153],
  [72,26,14], [122,115,153], [123,153,61], [105,105,140], [153,132,61], [153,61,92], [61,153,143], [28,28,14],
  [58,58,15], [58,33,15], [79,15,15], [26,26,36], [53,47,58], [92,71,92], [140,104,140], [153,199,153],
  [63,153,63], [63,112,153], [40,71,92], [64,105,140], [79,121,153], [153,190,201], [25,51,76], [15,32,51],
  [0,15,26], [51,153,204], [106,166,204], [176,224,230], [51,102,153], [18,36,54], [28,53,79], [66,123,189],
  [140,188,232], [35,79,127], [86,126,170], [49,92,138], [26,51,76], [13,26,38], [30,70,45], [43,102,66],
  [43,140,81], [51,230,119], [74,204,114], [51,178,102], [20,71,40], [18,59,34], [10,38,23], [20,82,43],
  [34,139,79], [51,204,119], [51,153,102], [34,102,68], [17,51,34], [51,51,0], [102,102,0], [153,153,0],
  [204,204,51], [255,255,102], [230,230,76], [178,178,51], [128,128,26], [76,76,13], [51,51,0], [102,82,0],
  [153,122,0], [204,163,0], [255,204,0], [230,184,0], [184,148,0], [138,112,0], [92,75,0], [46,38,0],
  [76,46,0], [128,77,0], [179,107,0], [230,138,0], [255,163,26], [255,128,0], [204,102,0], [153,76,0],
  [102,51,0], [51,26,0], [102,25,25], [153,38,38], [204,51,51], [255,77,77], [255,26,26], [230,0,0]
];

export function carColorHex(id) {
  if (id === undefined || id === null || id < 0) return '#888888';
  const c = CAR_COLORS[id % CAR_COLORS.length];
  return c ? `#${c[0].toString(16).padStart(2,'0')}${c[1].toString(16).padStart(2,'0')}${c[2].toString(16).padStart(2,'0')}` : '#888888';
}

export const COMPONENT_TYPES = {
  0: 'Aerofólio (Spoiler)',
  1: 'Capô (Hood)',
  2: 'Teto (Roof)',
  3: 'Saia Lateral (Sideskirt)',
  4: 'Faróis (Lamps)',
  5: 'Nitro',
  6: 'Escapamento (Exhaust)',
  7: 'Rodas (Wheels)',
  8: 'Som Estéreo (Stereo)',
  9: 'Suspensão Hidráulica (Hydraulics)',
  10: 'Para-choque Dianteiro',
  11: 'Para-choque Traseiro',
  12: 'Entrada de Ar Direita',
  13: 'Entrada de Ar Esquerda',
  14: 'Grade / Bullbar Dianteira',
  15: 'Grade / Bullbar Traseira',
};

// Mapeamento completo de componentes Open.MP / SA-MP
export const VEHICLE_COMPONENTS = {
  // Spoilers (0)
  1000: { type: 0, name: 'Pro Spoiler' },
  1001: { type: 0, name: 'Win Spoiler' },
  1002: { type: 0, name: 'Drag Spoiler' },
  1003: { type: 0, name: 'Alpha Spoiler' },
  1014: { type: 0, name: 'Champ Spoiler' },
  1015: { type: 0, name: 'Fury Spoiler' },
  1016: { type: 0, name: 'Worx Spoiler' },
  1023: { type: 0, name: 'Fury Spoiler' },
  1049: { type: 0, name: 'Alien Spoiler' },
  1050: { type: 0, name: 'X-Flow Spoiler' },
  1058: { type: 0, name: 'Alien Spoiler (Elegy)' },
  1060: { type: 0, name: 'X-Flow Spoiler (Elegy)' },
  1138: { type: 0, name: 'Alien Spoiler (Sultan)' },
  1139: { type: 0, name: 'X-Flow Spoiler (Sultan)' },
  1146: { type: 0, name: 'X-Flow Spoiler (Flash)' },
  1147: { type: 0, name: 'Alien Spoiler (Flash)' },
  1158: { type: 0, name: 'X-Flow Spoiler (Uranus)' },
  1162: { type: 0, name: 'Alien Spoiler (Uranus)' },
  1163: { type: 0, name: 'X-Flow Spoiler (Jester)' },
  1164: { type: 0, name: 'Alien Spoiler (Jester)' },

  // Hoods (1)
  1004: { type: 1, name: 'Fury Hood' },
  1005: { type: 1, name: 'Champ Hood' },
  1011: { type: 1, name: 'Race Hood Scoop' },
  1012: { type: 1, name: 'Worx Hood Scoop' },
  1142: { type: 1, name: 'Left Oval Hood Vent' },
  1143: { type: 1, name: 'Right Oval Hood Vent' },
  1144: { type: 1, name: 'Left Square Hood Vent' },
  1145: { type: 1, name: 'Right Square Hood Vent' },

  // Roof (2)
  1006: { type: 2, name: 'Roof Scoop' },
  1032: { type: 2, name: 'Alien Roof Vent' },
  1033: { type: 2, name: 'X-Flow Roof Vent' },
  1035: { type: 2, name: 'Roof Scoop (Elegy)' },
  1038: { type: 2, name: 'Alien Roof (Elegy)' },
  1053: { type: 2, name: 'X-Flow Roof (Elegy)' },
  1054: { type: 2, name: 'Alien Roof Scoop' },
  1055: { type: 2, name: 'Alien Roof (Sultan)' },
  1061: { type: 2, name: 'X-Flow Roof (Sultan)' },
  1067: { type: 2, name: 'Alien Roof (Flash)' },
  1068: { type: 2, name: 'X-Flow Roof (Flash)' },
  1088: { type: 2, name: 'Alien Roof (Jester)' },
  1091: { type: 2, name: 'X-Flow Roof (Jester)' },

  // Sideskirt (3)
  1007: { type: 3, name: 'Sideskirt' },
  1017: { type: 3, name: 'Sideskirt (Right)' },
  1026: { type: 3, name: 'Alien Sideskirt (Sultan)' },
  1027: { type: 3, name: 'X-Flow Sideskirt (Sultan)' },
  1030: { type: 3, name: 'Alien Sideskirt (Elegy)' },
  1031: { type: 3, name: 'X-Flow Sideskirt (Elegy)' },
  1036: { type: 3, name: 'Alien Sideskirt (Flash)' },
  1039: { type: 3, name: 'X-Flow Sideskirt (Flash)' },
  1040: { type: 3, name: 'Alien Sideskirt (Stratum)' },
  1041: { type: 3, name: 'X-Flow Sideskirt (Stratum)' },
  1042: { type: 3, name: 'Chrome Sideskirt' },
  1047: { type: 3, name: 'Alien Sideskirt' },
  1048: { type: 3, name: 'X-Flow Sideskirt' },
  1056: { type: 3, name: 'Alien Sideskirt (Uranus)' },
  1057: { type: 3, name: 'X-Flow Sideskirt (Uranus)' },
  1069: { type: 3, name: 'Alien Sideskirt (Jester)' },
  1070: { type: 3, name: 'X-Flow Sideskirt (Jester)' },
  1090: { type: 3, name: 'Alien Sideskirt' },
  1093: { type: 3, name: 'X-Flow Sideskirt' },
  1094: { type: 3, name: 'Sideskirt' },
  1095: { type: 3, name: 'Right Sideskirt' },
  1099: { type: 3, name: 'Left Chrome Sideskirt' },
  1101: { type: 3, name: 'Right Chrome Sideskirt' },
  1102: { type: 3, name: 'Left Wheelarch Skirt' },
  1106: { type: 3, name: 'Right Wheelarch Skirt' },
  1107: { type: 3, name: 'Left Chrome Trim' },
  1108: { type: 3, name: 'Right Chrome Trim' },
  1118: { type: 3, name: 'Left Flame Skirt' },
  1119: { type: 3, name: 'Right Flame Skirt' },
  1120: { type: 3, name: 'Left Slamin Skirt' },
  1121: { type: 3, name: 'Right Slamin Skirt' },
  1122: { type: 3, name: 'Left Chrome Strip' },
  1124: { type: 3, name: 'Right Chrome Strip' },
  1133: { type: 3, name: 'Left Stripe Skirt' },
  1134: { type: 3, name: 'Right Stripe Skirt' },
  1137: { type: 3, name: 'Left Classic Skirt' },

  // Lamps (4)
  1013: { type: 4, name: 'Round Fog Lamps' },
  1024: { type: 4, name: 'Square Fog Lamps' },

  // Nitro (5)
  1008: { type: 5, name: 'Nitro 10x' },
  1009: { type: 5, name: 'Nitro 5x' },
  1010: { type: 5, name: 'Nitro 2x' },

  // Exhaust (6)
  1018: { type: 6, name: 'Upswept Exhaust' },
  1019: { type: 6, name: 'Twin Exhaust' },
  1020: { type: 6, name: 'Large Exhaust' },
  1021: { type: 6, name: 'Medium Exhaust' },
  1022: { type: 6, name: 'Small Exhaust' },
  1028: { type: 6, name: 'Alien Exhaust (Sultan)' },
  1029: { type: 6, name: 'X-Flow Exhaust (Sultan)' },
  1034: { type: 6, name: 'Alien Exhaust (Elegy)' },
  1037: { type: 6, name: 'X-Flow Exhaust (Elegy)' },
  1043: { type: 6, name: 'Alien Exhaust (Flash)' },
  1044: { type: 6, name: 'X-Flow Exhaust (Flash)' },
  1045: { type: 6, name: 'Alien Exhaust (Stratum)' },
  1046: { type: 6, name: 'X-Flow Exhaust (Stratum)' },
  1059: { type: 6, name: 'Alien Exhaust (Uranus)' },
  1064: { type: 6, name: 'X-Flow Exhaust (Uranus)' },
  1065: { type: 6, name: 'Alien Exhaust (Jester)' },
  1066: { type: 6, name: 'X-Flow Exhaust (Jester)' },
  1089: { type: 6, name: 'Chrome Exhaust' },
  1092: { type: 6, name: 'Slamin Exhaust' },
  1104: { type: 6, name: 'Chrome Exhaust' },
  1105: { type: 6, name: 'Slamin Exhaust' },
  1113: { type: 6, name: 'Chrome Exhaust' },
  1114: { type: 6, name: 'Slamin Exhaust' },
  1126: { type: 6, name: 'Chrome Exhaust' },
  1127: { type: 6, name: 'Slamin Exhaust' },
  1129: { type: 6, name: 'Chrome Exhaust' },
  1132: { type: 6, name: 'Slamin Exhaust' },
  1135: { type: 6, name: 'Chrome Exhaust' },
  1136: { type: 6, name: 'Slamin Exhaust' },

  // Wheels (7)
  1025: { type: 7, name: 'Offroad' },
  1073: { type: 7, name: 'Shadow' },
  1074: { type: 7, name: 'Mega' },
  1075: { type: 7, name: 'Rimshine' },
  1076: { type: 7, name: 'Wires' },
  1077: { type: 7, name: 'Classic' },
  1078: { type: 7, name: 'Twist' },
  1079: { type: 7, name: 'Cutter' },
  1080: { type: 7, name: 'Switch' },
  1081: { type: 7, name: 'Grove' },
  1082: { type: 7, name: 'Import' },
  1083: { type: 7, name: 'Dollar' },
  1084: { type: 7, name: 'Trance' },
  1085: { type: 7, name: 'Atomic' },
  1096: { type: 7, name: 'Ahab' },
  1097: { type: 7, name: 'Virtual' },
  1098: { type: 7, name: 'Access' },

  // Stereo (8)
  1086: { type: 8, name: 'Bass Boost (Stereo)' },

  // Hydraulics (9)
  1087: { type: 9, name: 'Hidráulica (Hydraulics)' },

  // Front Bumper (10)
  1117: { type: 10, name: 'Chrome Front Bumper' },
  1152: { type: 10, name: 'X-Flow Front Bumper (Flash)' },
  1153: { type: 10, name: 'Alien Front Bumper (Flash)' },
  1155: { type: 10, name: 'Alien Front Bumper (Stratum)' },
  1157: { type: 10, name: 'X-Flow Front Bumper (Stratum)' },
  1160: { type: 10, name: 'Alien Front Bumper (Jester)' },
  1165: { type: 10, name: 'X-Flow Front Bumper (Sultan)' },
  1166: { type: 10, name: 'Alien Front Bumper (Uranus)' },
  1169: { type: 10, name: 'Alien Front Bumper (Sultan)' },
  1170: { type: 10, name: 'X-Flow Front Bumper (Sultan)' },
  1171: { type: 10, name: 'Alien Front Bumper (Elegy)' },
  1172: { type: 10, name: 'X-Flow Front Bumper (Elegy)' },
  1173: { type: 10, name: 'X-Flow Front Bumper (Jester)' },
  1174: { type: 10, name: 'Chrome Front Bumper' },
  1175: { type: 10, name: 'Slamin Front Bumper' },
  1179: { type: 10, name: 'Chrome Front Bumper' },
  1181: { type: 10, name: 'Slamin Front Bumper' },
  1182: { type: 10, name: 'Chrome Front Bumper' },
  1185: { type: 10, name: 'Slamin Front Bumper' },
  1188: { type: 10, name: 'Chrome Front Bumper' },
  1189: { type: 10, name: 'Slamin Front Bumper' },
  1190: { type: 10, name: 'Chrome Front Bumper' },
  1191: { type: 10, name: 'Slamin Front Bumper' },

  // Rear Bumper (11)
  1140: { type: 11, name: 'X-Flow Rear Bumper (Sultan)' },
  1141: { type: 11, name: 'Alien Rear Bumper (Sultan)' },
  1148: { type: 11, name: 'X-Flow Rear Bumper (Elegy)' },
  1149: { type: 11, name: 'Alien Rear Bumper (Elegy)' },
  1150: { type: 11, name: 'Alien Rear Bumper (Flash)' },
  1151: { type: 11, name: 'X-Flow Rear Bumper (Flash)' },
  1154: { type: 11, name: 'Alien Rear Bumper (Stratum)' },
  1156: { type: 11, name: 'X-Flow Rear Bumper (Stratum)' },
  1159: { type: 11, name: 'Alien Rear Bumper (Jester)' },
  1161: { type: 11, name: 'X-Flow Rear Bumper (Jester)' },
  1167: { type: 11, name: 'X-Flow Rear Bumper (Uranus)' },
  1168: { type: 11, name: 'Alien Rear Bumper (Uranus)' },
  1176: { type: 11, name: 'Chrome Rear Bumper' },
  1177: { type: 11, name: 'Slamin Rear Bumper' },
  1178: { type: 11, name: 'Chrome Rear Bumper' },
  1180: { type: 11, name: 'Chrome Rear Bumper' },
  1183: { type: 11, name: 'Slamin Rear Bumper' },
  1184: { type: 11, name: 'Chrome Rear Bumper' },
  1186: { type: 11, name: 'Slamin Rear Bumper' },
  1187: { type: 11, name: 'Chrome Rear Bumper' },
  1192: { type: 11, name: 'Chrome Rear Bumper' },
  1193: { type: 11, name: 'Slamin Rear Bumper' },

  // Vents (12, 13)
  1100: { type: 12, name: 'Chrome Grill' },
  1123: { type: 12, name: 'Bullbar' },
  1125: { type: 12, name: 'Chrome Wing' },

  // Bullbars (14, 15)
  1109: { type: 14, name: 'Chrome Front Bullbar' },
  1110: { type: 15, name: 'Chrome Rear Bullbar' },
  1115: { type: 14, name: 'Slamin Front Bullbar' },
  1116: { type: 15, name: 'Slamin Rear Bullbar' },
};

// Veículos que suportam paintjobs no SA-MP
export const PAINTJOB_VEHICLES = new Set([
  562, // Elegy
  560, // Sultan
  565, // Flash
  559, // Jester
  558, // Uranus
  561, // Stratum
  567, // Savanna
  536, // Blade
  535, // Slamvan
  575, // Remington
  576, // Broadway
  483, // Camper
]);

export function supportsPaintjob(model) {
  return PAINTJOB_VEHICLES.has(model | 0);
}
