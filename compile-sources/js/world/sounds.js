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
    "desc": "Rádio Policial (Canal 2)",
    "cat": "Rádio Policial"
  },
  {
    "id": 3,
    "name": "STREAM_POLICE_RADIO_02",
    "desc": "Rádio Policial (Canal 3)",
    "cat": "Rádio Policial"
  },
  {
    "id": 4,
    "name": "STREAM_POLICE_RADIO_03",
    "desc": "Rádio Policial (Canal 4)",
    "cat": "Rádio Policial"
  },
  {
    "id": 5,
    "name": "STREAM_POLICE_RADIO_04",
    "desc": "Rádio Policial (Canal 5)",
    "cat": "Rádio Policial"
  },
  {
    "id": 6,
    "name": "STREAM_POLICE_RADIO_05",
    "desc": "Rádio Policial (Canal 6)",
    "cat": "Rádio Policial"
  },
  {
    "id": 7,
    "name": "STREAM_POLICE_RADIO_06",
    "desc": "Rádio Policial (Canal 7)",
    "cat": "Rádio Policial"
  },
  {
    "id": 8,
    "name": "STREAM_POLICE_RADIO_07",
    "desc": "Rádio Policial (Canal 8)",
    "cat": "Rádio Policial"
  },
  {
    "id": 9,
    "name": "STREAM_POLICE_RADIO_08",
    "desc": "Rádio Policial (Canal 9)",
    "cat": "Rádio Policial"
  },
  {
    "id": 10,
    "name": "STREAM_POLICE_RADIO_09",
    "desc": "Rádio Policial (Canal 10)",
    "cat": "Rádio Policial"
  },
  {
    "id": 11,
    "name": "STREAM_POLICE_RADIO_10",
    "desc": "Rádio Policial (Canal 11)",
    "cat": "Rádio Policial"
  },
  {
    "id": 12,
    "name": "STREAM_POLICE_RADIO_11",
    "desc": "Rádio Policial (Canal 12)",
    "cat": "Rádio Policial"
  },
  {
    "id": 13,
    "name": "STREAM_POLICE_RADIO_12",
    "desc": "Rádio Policial (Canal 13)",
    "cat": "Rádio Policial"
  },
  {
    "id": 14,
    "name": "STREAM_POLICE_RADIO_13",
    "desc": "Rádio Policial (Canal 14)",
    "cat": "Rádio Policial"
  },
  {
    "id": 15,
    "name": "STREAM_POLICE_RADIO_14",
    "desc": "Rádio Policial (Canal 15)",
    "cat": "Rádio Policial"
  },
  {
    "id": 16,
    "name": "STREAM_POLICE_RADIO_15",
    "desc": "Rádio Policial (Canal 16)",
    "cat": "Rádio Policial"
  },
  {
    "id": 17,
    "name": "STREAM_POLICE_RADIO_16",
    "desc": "Rádio Policial (Canal 17)",
    "cat": "Rádio Policial"
  },
  {
    "id": 18,
    "name": "STREAM_POLICE_RADIO_17",
    "desc": "Rádio Policial (Canal 18)",
    "cat": "Rádio Policial"
  },
  {
    "id": 19,
    "name": "STREAM_POLICE_RADIO_18",
    "desc": "Rádio Policial (Canal 19)",
    "cat": "Rádio Policial"
  },
  {
    "id": 20,
    "name": "STREAM_POLICE_RADIO_19",
    "desc": "Rádio Policial (Canal 20)",
    "cat": "Rádio Policial"
  },
  {
    "id": 21,
    "name": "STREAM_POLICE_RADIO_20",
    "desc": "Rádio Policial (Canal 21)",
    "cat": "Rádio Policial"
  },
  {
    "id": 22,
    "name": "STREAM_POLICE_RADIO_21",
    "desc": "Rádio Policial (Canal 22)",
    "cat": "Rádio Policial"
  },
  {
    "id": 23,
    "name": "STREAM_POLICE_RADIO_22",
    "desc": "Rádio Policial (Canal 23)",
    "cat": "Rádio Policial"
  },
  {
    "id": 24,
    "name": "STREAM_POLICE_RADIO_23",
    "desc": "Rádio Policial (Canal 24)",
    "cat": "Rádio Policial"
  },
  {
    "id": 25,
    "name": "STREAM_POLICE_RADIO_24",
    "desc": "Rádio Policial (Canal 25)",
    "cat": "Rádio Policial"
  },
  {
    "id": 26,
    "name": "STREAM_POLICE_RADIO_25",
    "desc": "Rádio Policial (Canal 26)",
    "cat": "Rádio Policial"
  },
  {
    "id": 27,
    "name": "STREAM_POLICE_RADIO_26",
    "desc": "Rádio Policial (Canal 27)",
    "cat": "Rádio Policial"
  },
  {
    "id": 28,
    "name": "STREAM_POLICE_RADIO_27",
    "desc": "Rádio Policial (Canal 28)",
    "cat": "Rádio Policial"
  },
  {
    "id": 29,
    "name": "STREAM_POLICE_RADIO_28",
    "desc": "Rádio Policial (Canal 29)",
    "cat": "Rádio Policial"
  },
  {
    "id": 30,
    "name": "STREAM_POLICE_RADIO_29",
    "desc": "Rádio Policial (Canal 30)",
    "cat": "Rádio Policial"
  },
  {
    "id": 31,
    "name": "STREAM_POLICE_RADIO_30",
    "desc": "Rádio Policial (Canal 31)",
    "cat": "Rádio Policial"
  },
  {
    "id": 32,
    "name": "STREAM_POLICE_RADIO_31",
    "desc": "Rádio Policial (Canal 32)",
    "cat": "Rádio Policial"
  },
  {
    "id": 33,
    "name": "STREAM_POLICE_RADIO_32",
    "desc": "Rádio Policial (Canal 33)",
    "cat": "Rádio Policial"
  },
  {
    "id": 34,
    "name": "STREAM_POLICE_RADIO_33",
    "desc": "Rádio Policial (Canal 34)",
    "cat": "Rádio Policial"
  },
  {
    "id": 35,
    "name": "STREAM_POLICE_RADIO_34",
    "desc": "Rádio Policial (Canal 35)",
    "cat": "Rádio Policial"
  },
  {
    "id": 36,
    "name": "STREAM_POLICE_RADIO_35",
    "desc": "Rádio Policial (Canal 36)",
    "cat": "Rádio Policial"
  },
  {
    "id": 37,
    "name": "STREAM_POLICE_RADIO_36",
    "desc": "Rádio Policial (Canal 37)",
    "cat": "Rádio Policial"
  },
  {
    "id": 38,
    "name": "STREAM_POLICE_RADIO_37",
    "desc": "Rádio Policial (Canal 38)",
    "cat": "Rádio Policial"
  },
  {
    "id": 39,
    "name": "STREAM_POLICE_RADIO_38",
    "desc": "Rádio Policial (Canal 39)",
    "cat": "Rádio Policial"
  },
  {
    "id": 40,
    "name": "STREAM_POLICE_RADIO_39",
    "desc": "Rádio Policial (Canal 40)",
    "cat": "Rádio Policial"
  },
  {
    "id": 41,
    "name": "STREAM_POLICE_RADIO_40",
    "desc": "Rádio Policial (Canal 41)",
    "cat": "Rádio Policial"
  },
  {
    "id": 42,
    "name": "STREAM_POLICE_RADIO_41",
    "desc": "Rádio Policial (Canal 42)",
    "cat": "Rádio Policial"
  },
  {
    "id": 43,
    "name": "STREAM_POLICE_RADIO_42",
    "desc": "Rádio Policial (Canal 43)",
    "cat": "Rádio Policial"
  },
  {
    "id": 44,
    "name": "STREAM_POLICE_RADIO_43",
    "desc": "Rádio Policial (Canal 44)",
    "cat": "Rádio Policial"
  },
  {
    "id": 45,
    "name": "STREAM_POLICE_RADIO_44",
    "desc": "Rádio Policial (Canal 45)",
    "cat": "Rádio Policial"
  },
  {
    "id": 46,
    "name": "STREAM_POLICE_RADIO_45",
    "desc": "Rádio Policial (Canal 46)",
    "cat": "Rádio Policial"
  },
  {
    "id": 47,
    "name": "STREAM_POLICE_RADIO_46",
    "desc": "Rádio Policial (Canal 47)",
    "cat": "Rádio Policial"
  },
  {
    "id": 48,
    "name": "STREAM_POLICE_RADIO_47",
    "desc": "Rádio Policial (Canal 48)",
    "cat": "Rádio Policial"
  },
  {
    "id": 49,
    "name": "STREAM_POLICE_RADIO_48",
    "desc": "Rádio Policial (Canal 49)",
    "cat": "Rádio Policial"
  },
  {
    "id": 50,
    "name": "STREAM_POLICE_RADIO_49",
    "desc": "Rádio Policial (Canal 50)",
    "cat": "Rádio Policial"
  },
  {
    "id": 51,
    "name": "STREAM_POLICE_RADIO_50",
    "desc": "Rádio Policial (Canal 51)",
    "cat": "Rádio Policial"
  },
  {
    "id": 52,
    "name": "STREAM_POLICE_RADIO_51",
    "desc": "Rádio Policial (Canal 52)",
    "cat": "Rádio Policial"
  },
  {
    "id": 53,
    "name": "STREAM_POLICE_RADIO_52",
    "desc": "Rádio Policial (Canal 53)",
    "cat": "Rádio Policial"
  },
  {
    "id": 54,
    "name": "STREAM_POLICE_RADIO_53",
    "desc": "Rádio Policial (Canal 54)",
    "cat": "Rádio Policial"
  },
  {
    "id": 55,
    "name": "STREAM_POLICE_RADIO_54",
    "desc": "Rádio Policial (Canal 55)",
    "cat": "Rádio Policial"
  },
  {
    "id": 56,
    "name": "STREAM_POLICE_RADIO_55",
    "desc": "Rádio Policial (Canal 56)",
    "cat": "Rádio Policial"
  },
  {
    "id": 57,
    "name": "STREAM_POLICE_RADIO_56",
    "desc": "Rádio Policial (Canal 57)",
    "cat": "Rádio Policial"
  },
  {
    "id": 58,
    "name": "STREAM_POLICE_RADIO_57",
    "desc": "Rádio Policial (Canal 58)",
    "cat": "Rádio Policial"
  },
  {
    "id": 59,
    "name": "STREAM_POLICE_RADIO_58",
    "desc": "Rádio Policial (Canal 59)",
    "cat": "Rádio Policial"
  },
  {
    "id": 66,
    "name": "STREAM_RADIO_ADVERT_01",
    "desc": "Comercial de Rádio (Faixa 66)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 67,
    "name": "STREAM_RADIO_ADVERT_02",
    "desc": "Comercial de Rádio (Faixa 67)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 68,
    "name": "STREAM_RADIO_ADVERT_03",
    "desc": "Comercial de Rádio (Faixa 68)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 69,
    "name": "STREAM_RADIO_ADVERT_04",
    "desc": "Comercial de Rádio (Faixa 69)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 70,
    "name": "STREAM_RADIO_ADVERT_05",
    "desc": "Comercial de Rádio (Faixa 70)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 71,
    "name": "STREAM_RADIO_ADVERT_06",
    "desc": "Comercial de Rádio (Faixa 71)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 72,
    "name": "STREAM_RADIO_ADVERT_07",
    "desc": "Comercial de Rádio (Faixa 72)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 73,
    "name": "STREAM_RADIO_ADVERT_08",
    "desc": "Comercial de Rádio (Faixa 73)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 74,
    "name": "STREAM_RADIO_ADVERT_09",
    "desc": "Comercial de Rádio (Faixa 74)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 75,
    "name": "STREAM_RADIO_ADVERT_10",
    "desc": "Comercial de Rádio (Faixa 75)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 76,
    "name": "STREAM_RADIO_ADVERT_11",
    "desc": "Comercial de Rádio (Faixa 76)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 77,
    "name": "STREAM_RADIO_ADVERT_12",
    "desc": "Comercial de Rádio (Faixa 77)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 78,
    "name": "STREAM_RADIO_ADVERT_13",
    "desc": "Comercial de Rádio (Faixa 78)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 79,
    "name": "STREAM_RADIO_ADVERT_14",
    "desc": "Comercial de Rádio (Faixa 79)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 80,
    "name": "STREAM_RADIO_ADVERT_15",
    "desc": "Comercial de Rádio (Faixa 80)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 81,
    "name": "STREAM_RADIO_ADVERT_16",
    "desc": "Comercial de Rádio (Faixa 81)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 82,
    "name": "STREAM_RADIO_ADVERT_17",
    "desc": "Comercial de Rádio (Faixa 82)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 83,
    "name": "STREAM_RADIO_ADVERT_18",
    "desc": "Comercial de Rádio (Faixa 83)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 84,
    "name": "STREAM_RADIO_ADVERT_19",
    "desc": "Comercial de Rádio (Faixa 84)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 85,
    "name": "STREAM_RADIO_ADVERT_20",
    "desc": "Comercial de Rádio (Faixa 85)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 86,
    "name": "STREAM_RADIO_ADVERT_21",
    "desc": "Comercial de Rádio (Faixa 86)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 87,
    "name": "STREAM_RADIO_ADVERT_22",
    "desc": "Comercial de Rádio (Faixa 87)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 88,
    "name": "STREAM_RADIO_ADVERT_23",
    "desc": "Comercial de Rádio (Faixa 88)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 89,
    "name": "STREAM_RADIO_ADVERT_24",
    "desc": "Comercial de Rádio (Faixa 89)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 90,
    "name": "STREAM_RADIO_ADVERT_25",
    "desc": "Comercial de Rádio (Faixa 90)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 91,
    "name": "STREAM_RADIO_ADVERT_26",
    "desc": "Comercial de Rádio (Faixa 91)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 92,
    "name": "STREAM_RADIO_ADVERT_27",
    "desc": "Comercial de Rádio (Faixa 92)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 93,
    "name": "STREAM_RADIO_ADVERT_28",
    "desc": "Comercial de Rádio (Faixa 93)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 94,
    "name": "STREAM_RADIO_ADVERT_29",
    "desc": "Comercial de Rádio (Faixa 94)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 95,
    "name": "STREAM_RADIO_ADVERT_30",
    "desc": "Comercial de Rádio (Faixa 95)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 96,
    "name": "STREAM_RADIO_ADVERT_31",
    "desc": "Comercial de Rádio (Faixa 96)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 97,
    "name": "STREAM_RADIO_ADVERT_32",
    "desc": "Comercial de Rádio (Faixa 97)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 98,
    "name": "STREAM_RADIO_ADVERT_33",
    "desc": "Comercial de Rádio (Faixa 98)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 99,
    "name": "STREAM_RADIO_ADVERT_34",
    "desc": "Comercial de Rádio (Faixa 99)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 100,
    "name": "STREAM_RADIO_ADVERT_35",
    "desc": "Comercial de Rádio (Faixa 100)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 101,
    "name": "STREAM_RADIO_ADVERT_36",
    "desc": "Comercial de Rádio (Faixa 101)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 102,
    "name": "STREAM_RADIO_ADVERT_37",
    "desc": "Comercial de Rádio (Faixa 102)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 103,
    "name": "STREAM_RADIO_ADVERT_38",
    "desc": "Comercial de Rádio (Faixa 103)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 104,
    "name": "STREAM_RADIO_ADVERT_39",
    "desc": "Comercial de Rádio (Faixa 104)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 105,
    "name": "STREAM_RADIO_ADVERT_40",
    "desc": "Comercial de Rádio (Faixa 105)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 106,
    "name": "STREAM_RADIO_ADVERT_41",
    "desc": "Comercial de Rádio (Faixa 106)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 107,
    "name": "STREAM_RADIO_ADVERT_42",
    "desc": "Comercial de Rádio (Faixa 107)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 108,
    "name": "STREAM_RADIO_ADVERT_43",
    "desc": "Comercial de Rádio (Faixa 108)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 109,
    "name": "STREAM_RADIO_ADVERT_44",
    "desc": "Comercial de Rádio (Faixa 109)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 110,
    "name": "STREAM_RADIO_ADVERT_45",
    "desc": "Comercial de Rádio (Faixa 110)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 111,
    "name": "STREAM_RADIO_ADVERT_46",
    "desc": "Comercial de Rádio (Faixa 111)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 112,
    "name": "STREAM_RADIO_ADVERT_47",
    "desc": "Comercial de Rádio (Faixa 112)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 113,
    "name": "STREAM_RADIO_ADVERT_48",
    "desc": "Comercial de Rádio (Faixa 113)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 114,
    "name": "STREAM_RADIO_ADVERT_49",
    "desc": "Comercial de Rádio (Faixa 114)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 115,
    "name": "STREAM_RADIO_ADVERT_50",
    "desc": "Comercial de Rádio (Faixa 115)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 116,
    "name": "STREAM_RADIO_ADVERT_51",
    "desc": "Comercial de Rádio (Faixa 116)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 117,
    "name": "STREAM_RADIO_ADVERT_52",
    "desc": "Comercial de Rádio (Faixa 117)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 118,
    "name": "STREAM_RADIO_ADVERT_53",
    "desc": "Comercial de Rádio (Faixa 118)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 119,
    "name": "STREAM_RADIO_ADVERT_54",
    "desc": "Comercial de Rádio (Faixa 119)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 120,
    "name": "STREAM_RADIO_ADVERT_55",
    "desc": "Comercial de Rádio (Faixa 120)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 121,
    "name": "STREAM_RADIO_ADVERT_56",
    "desc": "Comercial de Rádio (Faixa 121)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 122,
    "name": "STREAM_RADIO_ADVERT_57",
    "desc": "Comercial de Rádio (Faixa 122)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 123,
    "name": "STREAM_RADIO_ADVERT_58",
    "desc": "Comercial de Rádio (Faixa 123)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 124,
    "name": "STREAM_RADIO_ADVERT_59",
    "desc": "Comercial de Rádio (Faixa 124)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 125,
    "name": "STREAM_RADIO_ADVERT_60",
    "desc": "Comercial de Rádio (Faixa 125)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 126,
    "name": "STREAM_RADIO_ADVERT_61",
    "desc": "Comercial de Rádio (Faixa 126)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 127,
    "name": "STREAM_RADIO_ADVERT_62",
    "desc": "Comercial de Rádio (Faixa 127)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 128,
    "name": "STREAM_RADIO_ADVERT_63",
    "desc": "Comercial de Rádio (Faixa 128)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 129,
    "name": "STREAM_RADIO_ADVERT_64",
    "desc": "Comercial de Rádio (Faixa 129)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 130,
    "name": "STREAM_RADIO_ADVERT_65",
    "desc": "Comercial de Rádio (Faixa 130)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 131,
    "name": "STREAM_RADIO_ADVERT_66",
    "desc": "Comercial de Rádio (Faixa 131)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 132,
    "name": "STREAM_RADIO_ADVERT_67",
    "desc": "Comercial de Rádio (Faixa 132)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 133,
    "name": "STREAM_RADIO_ADVERT_68",
    "desc": "Comercial de Rádio (Faixa 133)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 134,
    "name": "STREAM_RADIO_ADVERT_69",
    "desc": "Comercial de Rádio (Faixa 134)",
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
    "id": 947,
    "name": "AMBIENT_TRACK_947",
    "desc": "Faixa de Áudio Ambiente (947)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 948,
    "name": "AMBIENT_TRACK_948",
    "desc": "Faixa de Áudio Ambiente (948)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 949,
    "name": "AMBIENT_TRACK_949",
    "desc": "Faixa de Áudio Ambiente (949)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 950,
    "name": "AMBIENT_TRACK_950",
    "desc": "Faixa de Áudio Ambiente (950)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 951,
    "name": "AMBIENT_TRACK_951",
    "desc": "Faixa de Áudio Ambiente (951)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 952,
    "name": "AMBIENT_TRACK_952",
    "desc": "Faixa de Áudio Ambiente (952)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 953,
    "name": "AMBIENT_TRACK_953",
    "desc": "Faixa de Áudio Ambiente (953)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 954,
    "name": "AMBIENT_TRACK_954",
    "desc": "Faixa de Áudio Ambiente (954)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 955,
    "name": "AMBIENT_TRACK_955",
    "desc": "Faixa de Áudio Ambiente (955)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 956,
    "name": "AMBIENT_TRACK_956",
    "desc": "Faixa de Áudio Ambiente (956)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 957,
    "name": "AMBIENT_TRACK_957",
    "desc": "Faixa de Áudio Ambiente (957)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 958,
    "name": "AMBIENT_TRACK_958",
    "desc": "Faixa de Áudio Ambiente (958)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 959,
    "name": "AMBIENT_TRACK_959",
    "desc": "Faixa de Áudio Ambiente (959)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 960,
    "name": "AMBIENT_TRACK_960",
    "desc": "Faixa de Áudio Ambiente (960)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 961,
    "name": "AMBIENT_TRACK_961",
    "desc": "Faixa de Áudio Ambiente (961)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 962,
    "name": "AMBIENT_TRACK_962",
    "desc": "Faixa de Áudio Ambiente (962)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 963,
    "name": "AMBIENT_TRACK_963",
    "desc": "Faixa de Áudio Ambiente (963)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 964,
    "name": "AMBIENT_TRACK_964",
    "desc": "Faixa de Áudio Ambiente (964)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 965,
    "name": "AMBIENT_TRACK_965",
    "desc": "Faixa de Áudio Ambiente (965)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 966,
    "name": "AMBIENT_TRACK_966",
    "desc": "Faixa de Áudio Ambiente (966)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 967,
    "name": "AMBIENT_TRACK_967",
    "desc": "Faixa de Áudio Ambiente (967)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 968,
    "name": "AMBIENT_TRACK_968",
    "desc": "Faixa de Áudio Ambiente (968)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 969,
    "name": "AMBIENT_TRACK_969",
    "desc": "Faixa de Áudio Ambiente (969)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 970,
    "name": "AMBIENT_TRACK_970",
    "desc": "Faixa de Áudio Ambiente (970)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 971,
    "name": "AMBIENT_TRACK_971",
    "desc": "Faixa de Áudio Ambiente (971)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 972,
    "name": "AMBIENT_TRACK_972",
    "desc": "Faixa de Áudio Ambiente (972)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 973,
    "name": "AMBIENT_TRACK_973",
    "desc": "Faixa de Áudio Ambiente (973)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 974,
    "name": "AMBIENT_TRACK_974",
    "desc": "Faixa de Áudio Ambiente (974)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 975,
    "name": "AMBIENT_TRACK_975",
    "desc": "Faixa de Áudio Ambiente (975)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 976,
    "name": "AMBIENT_TRACK_976",
    "desc": "Faixa de Áudio Ambiente (976)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 977,
    "name": "AMBIENT_TRACK_977",
    "desc": "Faixa de Áudio Ambiente (977)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 978,
    "name": "AMBIENT_TRACK_978",
    "desc": "Faixa de Áudio Ambiente (978)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 979,
    "name": "AMBIENT_TRACK_979",
    "desc": "Faixa de Áudio Ambiente (979)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 980,
    "name": "AMBIENT_TRACK_980",
    "desc": "Faixa de Áudio Ambiente (980)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 981,
    "name": "AMBIENT_TRACK_981",
    "desc": "Faixa de Áudio Ambiente (981)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 982,
    "name": "AMBIENT_TRACK_982",
    "desc": "Faixa de Áudio Ambiente (982)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 983,
    "name": "AMBIENT_TRACK_983",
    "desc": "Faixa de Áudio Ambiente (983)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 984,
    "name": "AMBIENT_TRACK_984",
    "desc": "Faixa de Áudio Ambiente (984)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 985,
    "name": "AMBIENT_TRACK_985",
    "desc": "Faixa de Áudio Ambiente (985)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 986,
    "name": "AMBIENT_TRACK_986",
    "desc": "Faixa de Áudio Ambiente (986)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 987,
    "name": "AMBIENT_TRACK_987",
    "desc": "Faixa de Áudio Ambiente (987)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 988,
    "name": "AMBIENT_TRACK_988",
    "desc": "Faixa de Áudio Ambiente (988)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 989,
    "name": "AMBIENT_TRACK_989",
    "desc": "Faixa de Áudio Ambiente (989)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 990,
    "name": "AMBIENT_TRACK_990",
    "desc": "Faixa de Áudio Ambiente (990)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 991,
    "name": "AMBIENT_TRACK_991",
    "desc": "Faixa de Áudio Ambiente (991)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 992,
    "name": "AMBIENT_TRACK_992",
    "desc": "Faixa de Áudio Ambiente (992)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 993,
    "name": "AMBIENT_TRACK_993",
    "desc": "Faixa de Áudio Ambiente (993)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 994,
    "name": "AMBIENT_TRACK_994",
    "desc": "Faixa de Áudio Ambiente (994)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 995,
    "name": "AMBIENT_TRACK_995",
    "desc": "Faixa de Áudio Ambiente (995)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 996,
    "name": "AMBIENT_TRACK_996",
    "desc": "Faixa de Áudio Ambiente (996)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 997,
    "name": "AMBIENT_TRACK_997",
    "desc": "Faixa de Áudio Ambiente (997)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 998,
    "name": "AMBIENT_TRACK_998",
    "desc": "Faixa de Áudio Ambiente (998)",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 999,
    "name": "AMBIENT_TRACK_999",
    "desc": "Faixa de Áudio Ambiente (999)",
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
    "id": 4000,
    "name": "SOUND_4000",
    "desc": "Grove Street's going down!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 4001,
    "name": "SOUND_4001",
    "desc": "Fuck them Grove Street fools!",
    "cat": "Efeitos e Interface"
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
    "id": 4600,
    "name": "SOUND_4600",
    "desc": "Basketball bounce",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 4601,
    "name": "SOUND_4601",
    "desc": "Basketball bounce",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 4602,
    "name": "SOUND_4602",
    "desc": "Basketball bounce",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 4603,
    "name": "SOUND_4603",
    "desc": "Basketball backboard hit",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 4604,
    "name": "SOUND_4604",
    "desc": "Basketball net ripple",
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
    "id": 5000,
    "name": "SOUND_5000",
    "desc": "Oh Claude you're so big and manful",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5001,
    "name": "SOUND_5001",
    "desc": "Claude, youre the best driver Ive ever bedded!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5002,
    "name": "SOUND_5002",
    "desc": "Hands on the wheel, Claude, hands on the wheel!",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 5003,
    "name": "SOUND_5003",
    "desc": "Oh Claude, its bigger than the gear stick!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5004,
    "name": "SOUND_5004",
    "desc": "I have never felt so satisfied!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5005,
    "name": "SOUND_5005",
    "desc": "Five orgasms in as many minutes!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5006,
    "name": "SOUND_5006",
    "desc": "Marry me, Claude, marry me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5007,
    "name": "SOUND_5007",
    "desc": "Oh Claude, I dont know if Im woman enough!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5008,
    "name": "SOUND_5008",
    "desc": "Hey, Carl, you drive like a drunken camel!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5009,
    "name": "SOUND_5009",
    "desc": "Carl, are you jealous, heh?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5010,
    "name": "SOUND_5010",
    "desc": "Claude has such girth, he is AMAZING!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5011,
    "name": "SOUND_5011",
    "desc": "Claude would make you feel inadequate",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5012,
    "name": "SOUND_5012",
    "desc": "At last I have found a man to satisfy me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5013,
    "name": "SOUND_5013",
    "desc": "Claude is so manful, so FORCEFUL!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5014,
    "name": "SOUND_5014",
    "desc": "I never knew there was so much MORE to sex!",
    "cat": "Efeitos e Interface"
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
    "id": 5600,
    "name": "SOUND_5600",
    "desc": "Package Thrown",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5601,
    "name": "SOUND_5601",
    "desc": "Package Thrown",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5602,
    "name": "SOUND_5602",
    "desc": "Package Thrown",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5800,
    "name": "SOUND_5800",
    "desc": "10 or 20",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5801,
    "name": "SOUND_5801",
    "desc": "2 or 12",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5802,
    "name": "SOUND_5802",
    "desc": "3 or 13",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5803,
    "name": "SOUND_5803",
    "desc": "4 or 14",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5804,
    "name": "SOUND_5804",
    "desc": "5 or 15",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5805,
    "name": "SOUND_5805",
    "desc": "6 or 16",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5806,
    "name": "SOUND_5806",
    "desc": "7 or 17",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5807,
    "name": "SOUND_5807",
    "desc": "8 or 18",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5808,
    "name": "SOUND_5808",
    "desc": "9 or 19",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5809,
    "name": "SOUND_5809",
    "desc": "Place your bets sir",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5810,
    "name": "SOUND_5810",
    "desc": "Please place your bet",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5811,
    "name": "SOUND_5811",
    "desc": "Blackjack!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5812,
    "name": "SOUND_5812",
    "desc": "Blackjack! House loses",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5813,
    "name": "SOUND_5813",
    "desc": "You're bust, sir",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5814,
    "name": "SOUND_5814",
    "desc": "Your hand is dead, sir.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5815,
    "name": "SOUND_5815",
    "desc": "Push.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5816,
    "name": "SOUND_5816",
    "desc": "No winner.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5817,
    "name": "SOUND_5817",
    "desc": "Sorry sir, dealer wins!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5818,
    "name": "SOUND_5818",
    "desc": "Dealer wins!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5819,
    "name": "SOUND_5819",
    "desc": "House wins",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5820,
    "name": "SOUND_5820",
    "desc": "The house is willing to extend an offer of credit sir",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5821,
    "name": "SOUND_5821",
    "desc": "The house is offering you credit sir",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5822,
    "name": "SOUND_5822",
    "desc": "You may accept an offer of credit from the house sir",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5823,
    "name": "SOUND_5823",
    "desc": "I'm sorry sir, you don't have the funds",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5824,
    "name": "SOUND_5824",
    "desc": "You do not have enough to cover your bet sir",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5825,
    "name": "SOUND_5825",
    "desc": "If sir is going to gamble, sir must have enough cash",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5826,
    "name": "SOUND_5826",
    "desc": "No more bets please",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5827,
    "name": "SOUND_5827",
    "desc": "Closed to bets, ladies and gentlemen",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5828,
    "name": "SOUND_5828",
    "desc": "No more bets",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5829,
    "name": "SOUND_5829",
    "desc": "10",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5830,
    "name": "SOUND_5830",
    "desc": "11",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5831,
    "name": "SOUND_5831",
    "desc": "12",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5832,
    "name": "SOUND_5832",
    "desc": "13",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5833,
    "name": "SOUND_5833",
    "desc": "14",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5834,
    "name": "SOUND_5834",
    "desc": "15",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5835,
    "name": "SOUND_5835",
    "desc": "16",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5836,
    "name": "SOUND_5836",
    "desc": "17",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5837,
    "name": "SOUND_5837",
    "desc": "18",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5838,
    "name": "SOUND_5838",
    "desc": "19",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5839,
    "name": "SOUND_5839",
    "desc": "20!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5840,
    "name": "SOUND_5840",
    "desc": "21!!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5841,
    "name": "SOUND_5841",
    "desc": "4",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5842,
    "name": "SOUND_5842",
    "desc": "5",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5843,
    "name": "SOUND_5843",
    "desc": "6",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5844,
    "name": "SOUND_5844",
    "desc": "7",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5845,
    "name": "SOUND_5845",
    "desc": "8",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5846,
    "name": "SOUND_5846",
    "desc": "9",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5847,
    "name": "SOUND_5847",
    "desc": "You win!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5848,
    "name": "SOUND_5848",
    "desc": "You win sir, well played",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5849,
    "name": "SOUND_5849",
    "desc": "Sir is lucky today",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5850,
    "name": "SOUND_5850",
    "desc": "Regulars only at this table sir",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5851,
    "name": "SOUND_5851",
    "desc": "Only regulars at this table sir",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5852,
    "name": "SOUND_5852",
    "desc": "Thank you sir, have a nice day",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5853,
    "name": "SOUND_5853",
    "desc": "Thank you for playing sir",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5854,
    "name": "SOUND_5854",
    "desc": "Luck is with sir today",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5855,
    "name": "SOUND_5855",
    "desc": "Congratulations on your luck sir",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 5856,
    "name": "SOUND_5856",
    "desc": "Sir is on a winning streak",
    "cat": "Efeitos e Interface"
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
    "id": 6402,
    "name": "SOUND_6402",
    "desc": "Lights power down",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 6600,
    "name": "SOUND_6600",
    "desc": "Roof collapse",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 6601,
    "name": "SOUND_6601",
    "desc": "Wall collapse",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 6602,
    "name": "SOUND_6602",
    "desc": "Wall collapse",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 6603,
    "name": "SOUND_6603",
    "desc": "Wooden door breach",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 6800,
    "name": "SOUND_6800",
    "desc": "Cargo plane door loop",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 6801,
    "name": "SOUND_6801",
    "desc": "Cargo plane door start",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 6802,
    "name": "SOUND_6802",
    "desc": "Cargo plane door stop",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 7000,
    "name": "SOUND_7000",
    "desc": "Hey, hey, who the fuck - who are you? Untie me, huh?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7001,
    "name": "SOUND_7001",
    "desc": "Ive been here for fucking ages, I cant feel my hands no more!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7002,
    "name": "SOUND_7002",
    "desc": "You know what? I thing we're gonna take a little drive.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7003,
    "name": "SOUND_7003",
    "desc": "What are you, fucking stupid? I'm not joking here - untie me, motherfucker.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7004,
    "name": "SOUND_7004",
    "desc": "No, I think I'm gonna leave you right where you are.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7005,
    "name": "SOUND_7005",
    "desc": "You got any idea in that pea brain head of yours who the fuck I am?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7006,
    "name": "SOUND_7006",
    "desc": "No, but I think I'm going to find out.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7007,
    "name": "SOUND_7007",
    "desc": "You, you you your fu--, your crazy! You're a dead man! You're a dead man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7008,
    "name": "SOUND_7008",
    "desc": "You're ain't in no position to make no threats.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7009,
    "name": "SOUND_7009",
    "desc": "Who are you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7010,
    "name": "SOUND_7010",
    "desc": "Fuck you man, you know who I man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7011,
    "name": "SOUND_7011",
    "desc": "Have it your way.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7012,
    "name": "SOUND_7012",
    "desc": "You are messing with the wrong people!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7013,
    "name": "SOUND_7013",
    "desc": "You are so dead, do you hear me? DEAD! D-E-A-D pal!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7014,
    "name": "SOUND_7014",
    "desc": "You've signed your own death warrant! Ha ha ha!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7015,
    "name": "SOUND_7015",
    "desc": "You think this is scaring me, huh?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7016,
    "name": "SOUND_7016",
    "desc": "Takes a little more than a drive to get me chirpin' pal!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7017,
    "name": "SOUND_7017",
    "desc": "Hey, l-look, uh, w-we can come to some arrangement, okay?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7018,
    "name": "SOUND_7018",
    "desc": "OK, I can see you're serious!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7019,
    "name": "SOUND_7019",
    "desc": "Hey look pal, this ain't funny anymore.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7020,
    "name": "SOUND_7020",
    "desc": "Hey! Stop this insanity RIGHT NOW!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7021,
    "name": "SOUND_7021",
    "desc": "Oh my God, you're nuts!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7022,
    "name": "SOUND_7022",
    "desc": "Aargh! Oh, I don't wanna die, c'mon I don't wanna die!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7023,
    "name": "SOUND_7023",
    "desc": "FUCK YOU! FUCK YOU-HOO-hooooo!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7024,
    "name": "SOUND_7024",
    "desc": "Oh my God, I just shit myself!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7025,
    "name": "SOUND_7025",
    "desc": "Oh Mother Mary, I've had enough, oh God...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7026,
    "name": "SOUND_7026",
    "desc": "Alright, alright! You made your point, please no more! NO MORE!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7027,
    "name": "SOUND_7027",
    "desc": "Oh man, this is too faaaaast!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7028,
    "name": "SOUND_7028",
    "desc": "Oh! Slow down, slow down for Godsakes!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7029,
    "name": "SOUND_7029",
    "desc": "Oh, this is too fast! TOO FAAAAAAST!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7030,
    "name": "SOUND_7030",
    "desc": "Whoooooooa! Holy fuck!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7031,
    "name": "SOUND_7031",
    "desc": "Whoooa, geez no!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7032,
    "name": "SOUND_7032",
    "desc": "Oh Christ! Ooooooooh!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7033,
    "name": "SOUND_7033",
    "desc": "Oh my God, oh-my-God!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7034,
    "name": "SOUND_7034",
    "desc": "Hey, whatcha doing?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7035,
    "name": "SOUND_7035",
    "desc": "Hey, you think you're smart, but you're not, you're not!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7036,
    "name": "SOUND_7036",
    "desc": "Ha, this shit don't scare me asshole!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7037,
    "name": "SOUND_7037",
    "desc": "Whadaya doin' now?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7038,
    "name": "SOUND_7038",
    "desc": "Somebody, anybody, HELP!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7039,
    "name": "SOUND_7039",
    "desc": "Hey, watch the pedestrians, pal!",
    "cat": "Falas e Vozes"
  },
  {
    "id": 7040,
    "name": "SOUND_7040",
    "desc": "Jesus Christ that was close!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7041,
    "name": "SOUND_7041",
    "desc": "What are you trying to fuck both of us?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7042,
    "name": "SOUND_7042",
    "desc": "Mother Mary, that was lucky!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7043,
    "name": "SOUND_7043",
    "desc": "You're gonna kill us both! Oh God, I'm still alive!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7044,
    "name": "SOUND_7044",
    "desc": "Thank you! Thank God! Thank God!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7045,
    "name": "SOUND_7045",
    "desc": "Jesus! JESUS!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7046,
    "name": "SOUND_7046",
    "desc": "What are you TRYING to hit things?! You're crazy!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7047,
    "name": "SOUND_7047",
    "desc": "Oh...jesus....fuck you...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7048,
    "name": "SOUND_7048",
    "desc": "Aarrgghh!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7049,
    "name": "SOUND_7049",
    "desc": "Oh mama, come for me! Ohhhh.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7050,
    "name": "SOUND_7050",
    "desc": "Holy fuck! My legs! They're on fire!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7051,
    "name": "SOUND_7051",
    "desc": "Shit! My balls! My balls!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7052,
    "name": "SOUND_7052",
    "desc": "Oh mama! I'm on fire!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7053,
    "name": "SOUND_7053",
    "desc": "FIRE! FIRE!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7054,
    "name": "SOUND_7054",
    "desc": "MOTHER FUCKER!!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7055,
    "name": "SOUND_7055",
    "desc": "The family will make you pay for this!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7056,
    "name": "SOUND_7056",
    "desc": "Which family?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7057,
    "name": "SOUND_7057",
    "desc": "The Sindacco Family, ya idiot!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7058,
    "name": "SOUND_7058",
    "desc": "That's all I wanted to hear!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7059,
    "name": "SOUND_7059",
    "desc": "What the-? Oh shit...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7060,
    "name": "SOUND_7060",
    "desc": "Oh God, thank God...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7061,
    "name": "SOUND_7061",
    "desc": "Though I walk through the shadow of the valley of death...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7062,
    "name": "SOUND_7062",
    "desc": "Mummy... mummy...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7063,
    "name": "SOUND_7063",
    "desc": "(whimpering)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7064,
    "name": "SOUND_7064",
    "desc": "I've lead such a sinful life, I'm sorry, so sorry...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7065,
    "name": "SOUND_7065",
    "desc": "CJ, ha, I think he messed himself.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7066,
    "name": "SOUND_7066",
    "desc": "I guess he willing to talk now!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7200,
    "name": "SOUND_7200",
    "desc": "Alright, you guys better get out of Las Venturas, fast!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7201,
    "name": "SOUND_7201",
    "desc": "I'll be in touch.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7202,
    "name": "SOUND_7202",
    "desc": "What about your backup, man, will you be a'right without us?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7203,
    "name": "SOUND_7203",
    "desc": "Of course he will, you fucking moron, come on!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7204,
    "name": "SOUND_7204",
    "desc": "This is private flight CJ101 on approach to Liberty, over.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7205,
    "name": "SOUND_7205",
    "desc": "Flight CJ101, we have you on our scope.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7206,
    "name": "SOUND_7206",
    "desc": "Stay on current heading and await final approach instructions...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7207,
    "name": "SOUND_7207",
    "desc": "Welcome to Liberty City, CJ101...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7208,
    "name": "SOUND_7208",
    "desc": "Private function, invitation only!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7209,
    "name": "SOUND_7209",
    "desc": "Oh yeah? Well Mr. Leone says otherwise!",
    "cat": "Falas e Vozes"
  },
  {
    "id": 7210,
    "name": "SOUND_7210",
    "desc": "Salvatory sends his regards",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7211,
    "name": "SOUND_7211",
    "desc": "The Forellis are finished in this town!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7212,
    "name": "SOUND_7212",
    "desc": "I'm here to spill pasta sauce!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7213,
    "name": "SOUND_7213",
    "desc": "Marco Forelli, Im here for you!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7214,
    "name": "SOUND_7214",
    "desc": "Marco, Im coming for you!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7215,
    "name": "SOUND_7215",
    "desc": "Mafia assholes!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7216,
    "name": "SOUND_7216",
    "desc": "Im your worst egg plant nightmare!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7217,
    "name": "SOUND_7217",
    "desc": "Flight CJ101, you are cleared for take-off!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7218,
    "name": "SOUND_7218",
    "desc": "This is flight CJ101 out of Liberty City,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7219,
    "name": "SOUND_7219",
    "desc": "requesting final approach to Las Venturas International, over.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7220,
    "name": "SOUND_7220",
    "desc": "Flight CJ101, you are clear for landing on runway 3.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7221,
    "name": "SOUND_7221",
    "desc": "Holy fuck, whos flying that thing?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7222,
    "name": "SOUND_7222",
    "desc": "The guys a maniac!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7223,
    "name": "SOUND_7223",
    "desc": "Hes going to hit us!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7224,
    "name": "SOUND_7224",
    "desc": "Oh my god he's going to loose it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7225,
    "name": "SOUND_7225",
    "desc": "Prep the emergency crews!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7226,
    "name": "SOUND_7226",
    "desc": "Prepare the fire crews for a crash landing!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7227,
    "name": "SOUND_7227",
    "desc": "Alright, you guys better get out of Las Venturas fast!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7228,
    "name": "SOUND_7228",
    "desc": "I'll be in touch",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7229,
    "name": "SOUND_7229",
    "desc": "This is private flight CJ-101 on approuch to Liberty, over",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7230,
    "name": "SOUND_7230",
    "desc": "Oh yeah? Well Mr. Leony says otherwise",
    "cat": "Falas e Vozes"
  },
  {
    "id": 7231,
    "name": "SOUND_7231",
    "desc": "Salvatory sends his regards",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7232,
    "name": "SOUND_7232",
    "desc": "The Ferreli's are finished in this town",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7233,
    "name": "SOUND_7233",
    "desc": "I'm here to spill pasta sauce",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7234,
    "name": "SOUND_7234",
    "desc": "Marko Forelli, I'm here for you!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7235,
    "name": "SOUND_7235",
    "desc": "Marko, I'm coming for you!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7236,
    "name": "SOUND_7236",
    "desc": "Mafia assholes!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7237,
    "name": "SOUND_7237",
    "desc": "I'm your worst eggplant nightmare",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7238,
    "name": "SOUND_7238",
    "desc": "This is flight CJ101 out of Liberty City",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7239,
    "name": "SOUND_7239",
    "desc": "Requesting final approuch to Las Venturas Internation, over",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7400,
    "name": "SOUND_7400",
    "desc": "Hey you can't come down here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7401,
    "name": "SOUND_7401",
    "desc": "Where's your safety gear?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7402,
    "name": "SOUND_7402",
    "desc": "You don't have clearance for this area!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7403,
    "name": "SOUND_7403",
    "desc": "Get away from that dynamite!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7404,
    "name": "SOUND_7404",
    "desc": "Hey, that's dangerous!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7405,
    "name": "SOUND_7405",
    "desc": "Stay away from that stuff!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7406,
    "name": "SOUND_7406",
    "desc": "Meet my shovel asshole!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7407,
    "name": "SOUND_7407",
    "desc": "Hes gonna blow us all to hell!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7408,
    "name": "SOUND_7408",
    "desc": "Dude, somebody stop that guy!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7409,
    "name": "SOUND_7409",
    "desc": "Who's this asshole?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7410,
    "name": "SOUND_7410",
    "desc": "Someone call security!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7411,
    "name": "SOUND_7411",
    "desc": "What do you think you're doing?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7412,
    "name": "SOUND_7412",
    "desc": "Someones stealing dynamite, call security!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7413,
    "name": "SOUND_7413",
    "desc": "Hes after the dynamite!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7414,
    "name": "SOUND_7414",
    "desc": "Hes stealing the demolition charges!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7415,
    "name": "SOUND_7415",
    "desc": "ALL PERSONNEL CLEAR!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7416,
    "name": "SOUND_7416",
    "desc": "FIVE SECONDS TO DETONATION!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7417,
    "name": "SOUND_7417",
    "desc": "THREE...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7418,
    "name": "SOUND_7418",
    "desc": "TWO...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7419,
    "name": "SOUND_7419",
    "desc": "ONE...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7420,
    "name": "SOUND_7420",
    "desc": "Delivery for Woozie.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7421,
    "name": "SOUND_7421",
    "desc": "Hey, you be careful with that...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7600,
    "name": "SOUND_7600",
    "desc": "Hey, who's this character? He looks like a cop to me.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7601,
    "name": "SOUND_7601",
    "desc": "We better go warn the boss.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7602,
    "name": "SOUND_7602",
    "desc": "Hey, watch the car, I just got this baby detailed!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7603,
    "name": "SOUND_7603",
    "desc": "What? He must be a fed! Let's give him a proper Sindacco welcome!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7604,
    "name": "SOUND_7604",
    "desc": "Hey, what's going on?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7605,
    "name": "SOUND_7605",
    "desc": "Someone's got a fucking deathwish if they're starting trouble 'round here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7606,
    "name": "SOUND_7606",
    "desc": "Get the boys ready! Production line's gotta keep rolling!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7607,
    "name": "SOUND_7607",
    "desc": "Hey, who's this prick?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7608,
    "name": "SOUND_7608",
    "desc": "Somebody take care of this joker!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7609,
    "name": "SOUND_7609",
    "desc": "Hey, Carl, how'd it go?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7610,
    "name": "SOUND_7610",
    "desc": "Tell Woozie, we'll be getting no more trouble with them.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7611,
    "name": "SOUND_7611",
    "desc": "counterfeit chips",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7612,
    "name": "SOUND_7612",
    "desc": "Aye Johnny. How you feeling?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7800,
    "name": "SOUND_7800",
    "desc": "Me legs are fucked and me head's fuckin' poundin'!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7801,
    "name": "SOUND_7801",
    "desc": "We can't walk back, son, look at the state of us.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7802,
    "name": "SOUND_7802",
    "desc": "Your turn in the boot, kid!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7803,
    "name": "SOUND_7803",
    "desc": "Oooo, this is comfy!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7804,
    "name": "SOUND_7804",
    "desc": "I'm the manager, I get the front seat!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7805,
    "name": "SOUND_7805",
    "desc": "Oi! That's my seat!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7806,
    "name": "SOUND_7806",
    "desc": "Leave him, he'll be fine!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7807,
    "name": "SOUND_7807",
    "desc": "We'll come back for you, I promise!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7808,
    "name": "SOUND_7808",
    "desc": "Oh no you don't, I remember Preston Guild Hall!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7809,
    "name": "SOUND_7809",
    "desc": "I'm the manager, what I say, goes!",
    "cat": "Falas e Vozes"
  },
  {
    "id": 7810,
    "name": "SOUND_7810",
    "desc": "Don't make me slap you, sunshine!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7811,
    "name": "SOUND_7811",
    "desc": "Don't make me sack you, P.!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7812,
    "name": "SOUND_7812",
    "desc": "You're my manager this is all your fault!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7813,
    "name": "SOUND_7813",
    "desc": "So where's the rest of the band, guys?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7814,
    "name": "SOUND_7814",
    "desc": "Maccer, where are the boys?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7815,
    "name": "SOUND_7815",
    "desc": "I don't fuckin' know, do I.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7816,
    "name": "SOUND_7816",
    "desc": "I remember snakes, lots of snakes...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7817,
    "name": "SOUND_7817",
    "desc": "It's a snake farm not too far from here, we can go check it out.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7818,
    "name": "SOUND_7818",
    "desc": "I don't recognize this part of Manchester, kiddo, are we in Chorlton?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7819,
    "name": "SOUND_7819",
    "desc": "How many times do I have to tell you, we're in America!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7820,
    "name": "SOUND_7820",
    "desc": "America? Wait 'til I tell me ma about this!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7821,
    "name": "SOUND_7821",
    "desc": "He's like a fucking stuck record. He'll ask about Las Venturas next.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7822,
    "name": "SOUND_7822",
    "desc": "Las Venturas? Always wanted to go there, great tits.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7823,
    "name": "SOUND_7823",
    "desc": "Don't start, not in this confined space.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7824,
    "name": "SOUND_7824",
    "desc": "Bouncy, wobbling, massive, great tits!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7825,
    "name": "SOUND_7825",
    "desc": "Leave yourself alone, for crying out loud!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7826,
    "name": "SOUND_7826",
    "desc": "Here we are, look familiar?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7827,
    "name": "SOUND_7827",
    "desc": "Looks just like Salford to me...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7828,
    "name": "SOUND_7828",
    "desc": "What are you talking about?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7829,
    "name": "SOUND_7829",
    "desc": "Take a gander at 'em fellas, is that 'em?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7830,
    "name": "SOUND_7830",
    "desc": "That there city boy has gone and been with my prize hog!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7831,
    "name": "SOUND_7831",
    "desc": "Now I don't even get no sugar from her!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7832,
    "name": "SOUND_7832",
    "desc": "And that one done screwed my sis!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7833,
    "name": "SOUND_7833",
    "desc": "I've had a terr'ble aching in my grinds ever since!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7834,
    "name": "SOUND_7834",
    "desc": "I'm gonna slap you silly for giving me and my fella the red bumpies!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7835,
    "name": "SOUND_7835",
    "desc": "What'n tarnation?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7836,
    "name": "SOUND_7836",
    "desc": "I'm a fixing to give ya a whoopin' for what you gone and done to my young'uns!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7837,
    "name": "SOUND_7837",
    "desc": "Oh, no! Run like fuck!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7838,
    "name": "SOUND_7838",
    "desc": "Everybody in the car!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7839,
    "name": "SOUND_7839",
    "desc": "Wait, kiddo, wait!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7840,
    "name": "SOUND_7840",
    "desc": "I want to come too!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7841,
    "name": "SOUND_7841",
    "desc": "Oi, wait for me, sunshine!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7842,
    "name": "SOUND_7842",
    "desc": "Don't leave me in their evil clutches!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7843,
    "name": "SOUND_7843",
    "desc": "I think we lost 'em.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7844,
    "name": "SOUND_7844",
    "desc": "I can't see those snake farmers no more!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7845,
    "name": "SOUND_7845",
    "desc": "Shut up, you two!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7846,
    "name": "SOUND_7846",
    "desc": "Quit squabbling!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7847,
    "name": "SOUND_7847",
    "desc": "Seems you boys had a good time.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7848,
    "name": "SOUND_7848",
    "desc": "Hey, what about the band?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7849,
    "name": "SOUND_7849",
    "desc": "We'll just have to pray they've made it to civilization.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7850,
    "name": "SOUND_7850",
    "desc": "Keyboardists and drummers are ten-a-penny anyway.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7851,
    "name": "SOUND_7851",
    "desc": "Hey, man, I really need to piss!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7852,
    "name": "SOUND_7852",
    "desc": "Oh fuck, we're screwed!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7853,
    "name": "SOUND_7853",
    "desc": "Hey, can't it wait?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7854,
    "name": "SOUND_7854",
    "desc": "I'm about to burst man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7855,
    "name": "SOUND_7855",
    "desc": "You've gotta pull over, he's got a condition - he's priapic. It'll go everywhere!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7856,
    "name": "SOUND_7856",
    "desc": "I can't hold it any longer!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7857,
    "name": "SOUND_7857",
    "desc": "Oh, fuck! It's in me eye!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7858,
    "name": "SOUND_7858",
    "desc": "Hey, c'mon, man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7859,
    "name": "SOUND_7859",
    "desc": "Argh! Stop it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7860,
    "name": "SOUND_7860",
    "desc": "Point it out the fucking window, will you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7861,
    "name": "SOUND_7861",
    "desc": "Oh fuck me, that is so gooood.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7862,
    "name": "SOUND_7862",
    "desc": "Oh, fuck- now I've got the shakes.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7863,
    "name": "SOUND_7863",
    "desc": "You look as pale as a drowned baby, man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7864,
    "name": "SOUND_7864",
    "desc": "Oh God, I think I'm going to chuck!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7865,
    "name": "SOUND_7865",
    "desc": "P. what you need is some food down ya.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7866,
    "name": "SOUND_7866",
    "desc": "(Paul nearly vomits)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7867,
    "name": "SOUND_7867",
    "desc": "A fried egg sanger with mayonnaise will sort it.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7868,
    "name": "SOUND_7868",
    "desc": "(Paul nearly vomits again)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7869,
    "name": "SOUND_7869",
    "desc": "Or what about a pickled egg?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7870,
    "name": "SOUND_7870",
    "desc": "Pull over, NOW!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7871,
    "name": "SOUND_7871",
    "desc": "Shhi- huuuurghhh -hit!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7872,
    "name": "SOUND_7872",
    "desc": "I've go- huuurrrgghh!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7873,
    "name": "SOUND_7873",
    "desc": "Got the- Hhhuurrgghh!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7874,
    "name": "SOUND_7874",
    "desc": "Dry- hurgh!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7875,
    "name": "SOUND_7875",
    "desc": "Dry- hurgh!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7876,
    "name": "SOUND_7876",
    "desc": "Dry heavies... Oh...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7877,
    "name": "SOUND_7877",
    "desc": "Oh, I think it... I think it's passed.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7878,
    "name": "SOUND_7878",
    "desc": "How about a pint of cod liver oil, that'll well sort ya.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7879,
    "name": "SOUND_7879",
    "desc": "(Paul vomiting violently)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7880,
    "name": "SOUND_7880",
    "desc": "Leave him alone, man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7881,
    "name": "SOUND_7881",
    "desc": "Hey, hey, the good doctor was just tryin' to help!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7882,
    "name": "SOUND_7882",
    "desc": "Fuh-huh-Fuck off!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7883,
    "name": "SOUND_7883",
    "desc": "What kind of tits does this Rosie have?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7884,
    "name": "SOUND_7884",
    "desc": "Big, floppy sausage tits?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7885,
    "name": "SOUND_7885",
    "desc": "Empty saddlebags? Or bee stings?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7886,
    "name": "SOUND_7886",
    "desc": "Rosie's a man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7887,
    "name": "SOUND_7887",
    "desc": "And stop touching yourself!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7888,
    "name": "SOUND_7888",
    "desc": "It's just for comfort Pablo, this is a stressful situation, man.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7889,
    "name": "SOUND_7889",
    "desc": "You're fucking telling me it is!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7890,
    "name": "SOUND_7890",
    "desc": "Aw, can it you two!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7891,
    "name": "SOUND_7891",
    "desc": "Hey, he started it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7892,
    "name": "SOUND_7892",
    "desc": "Which Casino is it?",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 7893,
    "name": "SOUND_7893",
    "desc": "It's called Caligula's. It's on the strip somewhere, I think.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7894,
    "name": "SOUND_7894",
    "desc": "Shit! Here come them snake farmers!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7895,
    "name": "SOUND_7895",
    "desc": "Alright, I've had enough. Let's finish this!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7896,
    "name": "SOUND_7896",
    "desc": "Oh, I'm gonna grab some big tits, man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7897,
    "name": "SOUND_7897",
    "desc": "Oh, bollox. In for a penny, in for a pound.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7898,
    "name": "SOUND_7898",
    "desc": "Come on then, let's go in and see Rosie.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7899,
    "name": "SOUND_7899",
    "desc": "What about your backup, man? Will you be alright without us?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7900,
    "name": "SOUND_7900",
    "desc": "Hey Woozie.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7901,
    "name": "SOUND_7901",
    "desc": "I think I found a way to scope Caligula's without causing too much suspicion.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 7902,
    "name": "SOUND_7902",
    "desc": "We can talk later.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8000,
    "name": "SOUND_8000",
    "desc": "So here I am, about to try and rescue some guy I've scared half to death.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8001,
    "name": "SOUND_8001",
    "desc": "If he wake up through all of this, I'm screwed...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8002,
    "name": "SOUND_8002",
    "desc": "Hello, Sir, can I help you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8003,
    "name": "SOUND_8003",
    "desc": "Yeah, I'm here to pick up Mr. Sindacco.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8004,
    "name": "SOUND_8004",
    "desc": "Mr. Sindacco? There must be some mistake.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8005,
    "name": "SOUND_8005",
    "desc": "An ambulance just picked him up.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8006,
    "name": "SOUND_8006",
    "desc": "Oh, OK. Thank you for your help.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8007,
    "name": "SOUND_8007",
    "desc": "Hey mother, mother is that you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8008,
    "name": "SOUND_8008",
    "desc": "I see the light!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8009,
    "name": "SOUND_8009",
    "desc": "Uggh, never...never ever gonna talk like that again.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8010,
    "name": "SOUND_8010",
    "desc": "Fuck you, fuck you! Fuck fuck you!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8011,
    "name": "SOUND_8011",
    "desc": "Oh my God, where am I?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8012,
    "name": "SOUND_8012",
    "desc": "Nurse, hey nurse!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8013,
    "name": "SOUND_8013",
    "desc": "I need my bag emptied!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8014,
    "name": "SOUND_8014",
    "desc": "Hey, Johnny, how you feelin'?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8015,
    "name": "SOUND_8015",
    "desc": "I didn't think he was going to be discharged 'til tomorrow!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8016,
    "name": "SOUND_8016",
    "desc": "Alright, who's messing with Forelli business?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8017,
    "name": "SOUND_8017",
    "desc": "Yeah, who's got a death wish?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8200,
    "name": "SOUND_8200",
    "desc": "OK, boss man, where to?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8201,
    "name": "SOUND_8201",
    "desc": "We're going to pay the Sindacco's a visit.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8202,
    "name": "SOUND_8202",
    "desc": "See how Johnny is,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8203,
    "name": "SOUND_8203",
    "desc": "win him over with some (sniff) kind words during his convalescence.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8204,
    "name": "SOUND_8204",
    "desc": "Well, yeah, sure. I could take you by there.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8205,
    "name": "SOUND_8205",
    "desc": "OK great! (sniff) We need a car!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8206,
    "name": "SOUND_8206",
    "desc": "I've gotta get out of this game.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8207,
    "name": "SOUND_8207",
    "desc": "Shit, my nose is pissing like a race horse (sniff).",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8208,
    "name": "SOUND_8208",
    "desc": "That is really good stuff. Hey drive faster, would you please? C'mon, c'mon, c'mon, what are you, an old lady?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8209,
    "name": "SOUND_8209",
    "desc": "So you trying to get out?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8210,
    "name": "SOUND_8210",
    "desc": "Yes. God, yes.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8211,
    "name": "SOUND_8211",
    "desc": "I want to do something safe and legal and boring, with people that like me.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8212,
    "name": "SOUND_8212",
    "desc": "And have a wife and some kids and get divorced and fight for weekend access, like everybody else.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8213,
    "name": "SOUND_8213",
    "desc": "Listen. I'll see what I can do.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8214,
    "name": "SOUND_8214",
    "desc": "Thanks, I'm just so tired of all this life or death bullshit.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8215,
    "name": "SOUND_8215",
    "desc": "(sniff) Oh, shit, shit's all down my (sniff) damned shirt, and everything,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8216,
    "name": "SOUND_8216",
    "desc": "ah, that's my best shirt too, doesn't this shirt look good on me?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8217,
    "name": "SOUND_8217",
    "desc": "OK, let's get this over with.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8218,
    "name": "SOUND_8218",
    "desc": "I'm the boss, I am the boss! I'm the boss, I am the boss! Yeah,(sniff) yeah...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8219,
    "name": "SOUND_8219",
    "desc": "What did I say? What did I do?",
    "cat": "Falas e Vozes"
  },
  {
    "id": 8220,
    "name": "SOUND_8220",
    "desc": "Nothing. My bad. Now take cover.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8221,
    "name": "SOUND_8221",
    "desc": "Holy fuck, what is it about my luck?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8222,
    "name": "SOUND_8222",
    "desc": "I'm screwed!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8223,
    "name": "SOUND_8223",
    "desc": "We gotta do something!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8224,
    "name": "SOUND_8224",
    "desc": "Carl, leave no witnesses or we're dead meat!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8225,
    "name": "SOUND_8225",
    "desc": "Anybody needs me, they can find me in here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8226,
    "name": "SOUND_8226",
    "desc": "I ain't coming out until it's safe!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8227,
    "name": "SOUND_8227",
    "desc": "Typical end for me, shot, beaten and then barbeque!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8228,
    "name": "SOUND_8228",
    "desc": "Got the extinguisher, I got the extinguisher!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8229,
    "name": "SOUND_8229",
    "desc": "Take those guys out and I'll put out the flames!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8230,
    "name": "SOUND_8230",
    "desc": "Stand back, I'm gonna blast theses flames!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8231,
    "name": "SOUND_8231",
    "desc": "Hey, CJ, wait for me! Wait! Wait!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8232,
    "name": "SOUND_8232",
    "desc": "Well what are you waiting for?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8233,
    "name": "SOUND_8233",
    "desc": "I ain't leading the way!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8234,
    "name": "SOUND_8234",
    "desc": "I'm gonna start up the meat track!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8235,
    "name": "SOUND_8235",
    "desc": "Shit, they've started a fire to keep us back!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8236,
    "name": "SOUND_8236",
    "desc": "There must be an extinguisher here somewhere, find it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8237,
    "name": "SOUND_8237",
    "desc": "Aw, what you do that for?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8238,
    "name": "SOUND_8238",
    "desc": "OK, it's clear!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8239,
    "name": "SOUND_8239",
    "desc": "This is so exciting, Tommy, it's like old times!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8240,
    "name": "SOUND_8240",
    "desc": "Who the fuck is Tommy?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8241,
    "name": "SOUND_8241",
    "desc": "Screw this, I'm going to hide in the freezer!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8242,
    "name": "SOUND_8242",
    "desc": "CJ, some guy's locked me in the freezer!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8243,
    "name": "SOUND_8243",
    "desc": "CJ? CJ! Get me out of here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8244,
    "name": "SOUND_8244",
    "desc": "Thank you, man, I thought I was a popsicle for sure!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8245,
    "name": "SOUND_8245",
    "desc": "The exit's through the stock house!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8246,
    "name": "SOUND_8246",
    "desc": "Rosenberg! Im trapped in the freezer!",
    "cat": "Falas e Vozes"
  },
  {
    "id": 8247,
    "name": "SOUND_8247",
    "desc": "Rosenberg, get me out of this freezer!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8248,
    "name": "SOUND_8248",
    "desc": "Get me out of this freezer, Rosie!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8249,
    "name": "SOUND_8249",
    "desc": "Look out CJ",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8250,
    "name": "SOUND_8250",
    "desc": "Well done, CJ!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8251,
    "name": "SOUND_8251",
    "desc": "Shit, this is insane!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8252,
    "name": "SOUND_8252",
    "desc": "I'm never doin' drugs again, never ever, ever ever!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8253,
    "name": "SOUND_8253",
    "desc": "Shit, we gotta get the fuck out of here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8254,
    "name": "SOUND_8254",
    "desc": "We need some wheels!",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 8255,
    "name": "SOUND_8255",
    "desc": "Get me back to Caligula's!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8256,
    "name": "SOUND_8256",
    "desc": "You calm down, and follow my lead.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8257,
    "name": "SOUND_8257",
    "desc": "Holy fuck, man, we work well as a team together, huh, CJ?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8258,
    "name": "SOUND_8258",
    "desc": "You and me, tearing this town up.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8259,
    "name": "SOUND_8259",
    "desc": "Nobody can stop us, nobody in the world!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8260,
    "name": "SOUND_8260",
    "desc": "Johnny's a done deal. And so is his gang.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8261,
    "name": "SOUND_8261",
    "desc": "Too fucking right they are, dumb pussies!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8262,
    "name": "SOUND_8262",
    "desc": "Oh fuck! I'm screwed! I'm fucking screwed!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8263,
    "name": "SOUND_8263",
    "desc": "What the fuck am I going to do? Shit, shit, SHIIIIT....",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8264,
    "name": "SOUND_8264",
    "desc": "You just got to hang in there.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8265,
    "name": "SOUND_8265",
    "desc": "Play it dumb.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8266,
    "name": "SOUND_8266",
    "desc": "I'll figure out a way to get you out of this.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8267,
    "name": "SOUND_8267",
    "desc": "Just drop me at the airport!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8268,
    "name": "SOUND_8268",
    "desc": "Nah man, they gotta think you dead.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8269,
    "name": "SOUND_8269",
    "desc": "I'll think of something, I promise.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8270,
    "name": "SOUND_8270",
    "desc": "Get in there, and be cool. Like you been out for a relaxing drive or something.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8271,
    "name": "SOUND_8271",
    "desc": "Calm, yeah, calm.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8272,
    "name": "SOUND_8272",
    "desc": "I'm calm.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8273,
    "name": "SOUND_8273",
    "desc": "REAL FUCKING calm!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8274,
    "name": "SOUND_8274",
    "desc": "I'm calm, Mr. Calm, Mr. Calm, that's me, Mr. Calm.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8275,
    "name": "SOUND_8275",
    "desc": "Rosie, where you go?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8276,
    "name": "SOUND_8276",
    "desc": "Rosenberg, is that you in there?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8277,
    "name": "SOUND_8277",
    "desc": "How'd you get locked in there, dude?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8278,
    "name": "SOUND_8278",
    "desc": "Okay, stay in there while I finish off these assholes!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8400,
    "name": "SOUND_8400",
    "desc": "Hey, what's going on!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8401,
    "name": "SOUND_8401",
    "desc": "Shit, how the fuck did HE get in here?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8402,
    "name": "SOUND_8402",
    "desc": "Who cares?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8403,
    "name": "SOUND_8403",
    "desc": "Waste him!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8404,
    "name": "SOUND_8404",
    "desc": "You picked the wrong plane to hijack!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8405,
    "name": "SOUND_8405",
    "desc": "I'm gonna give you the full trolley service, asshole!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8406,
    "name": "SOUND_8406",
    "desc": "We're gonna dump your body over the desert!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8407,
    "name": "SOUND_8407",
    "desc": "Who is this nut job, anyway?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8408,
    "name": "SOUND_8408",
    "desc": "Come out, you chicken shit asshole!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8409,
    "name": "SOUND_8409",
    "desc": "Heh yeah - yeah, what's the matter, you lost your nerve?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8410,
    "name": "SOUND_8410",
    "desc": "Ah, the 'ickle boy is hiding, ain't dat cute?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8411,
    "name": "SOUND_8411",
    "desc": "Hey, come out and play, asshole!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8412,
    "name": "SOUND_8412",
    "desc": "I ain't going down without a fight!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8600,
    "name": "SOUND_8600",
    "desc": "Where's your car?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8601,
    "name": "SOUND_8601",
    "desc": "Where's yours?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8602,
    "name": "SOUND_8602",
    "desc": "Ladies don't drive themselves, that's what men are for!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8603,
    "name": "SOUND_8603",
    "desc": "Oh my goodness! Thanks Cesar. Appreciate this, homie!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8604,
    "name": "SOUND_8604",
    "desc": "So, what's your name? Where we going?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8605,
    "name": "SOUND_8605",
    "desc": "My name is Catalina and we gonna take this county for every stinking cent!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8606,
    "name": "SOUND_8606",
    "desc": "OK, good plan... I guess.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8607,
    "name": "SOUND_8607",
    "desc": "You're damn straight it's a good plan!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8608,
    "name": "SOUND_8608",
    "desc": "I've cased four soft targets;",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8609,
    "name": "SOUND_8609",
    "desc": "a gas station in Dillimore,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8610,
    "name": "SOUND_8610",
    "desc": "a bank in Palomino Creek,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8611,
    "name": "SOUND_8611",
    "desc": "a liquor store in Blueberry,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8612,
    "name": "SOUND_8612",
    "desc": "and a betting shop in Montgomery.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8613,
    "name": "SOUND_8613",
    "desc": "Hold up. Which one first?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8614,
    "name": "SOUND_8614",
    "desc": "You're the driver, you dumb pig, you choose!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8615,
    "name": "SOUND_8615",
    "desc": "You're pretty high strung, huh, lady.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8616,
    "name": "SOUND_8616",
    "desc": "Yeah? And what are you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8617,
    "name": "SOUND_8617",
    "desc": "Some laid back gang banger dude?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8618,
    "name": "SOUND_8618",
    "desc": "I keep myself to myself. That's my style.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8619,
    "name": "SOUND_8619",
    "desc": "Cesar says you got a brother in jail,",
    "cat": "Falas e Vozes"
  },
  {
    "id": 8620,
    "name": "SOUND_8620",
    "desc": "another brother dead, a mother just killed,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8621,
    "name": "SOUND_8621",
    "desc": "and you got a bent cop on your case.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8622,
    "name": "SOUND_8622",
    "desc": "I ain't listening to you.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8623,
    "name": "SOUND_8623",
    "desc": "You think that is keeping yourself to yourself, eh amigo?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8624,
    "name": "SOUND_8624",
    "desc": "Real cool? You just an idiota!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8625,
    "name": "SOUND_8625",
    "desc": "And you're real charming. A proper lady.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8626,
    "name": "SOUND_8626",
    "desc": "I have a hideout on Fern Ridge.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8627,
    "name": "SOUND_8627",
    "desc": "It's West of here.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8628,
    "name": "SOUND_8628",
    "desc": "It's East of here.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8629,
    "name": "SOUND_8629",
    "desc": "It's North of here.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8630,
    "name": "SOUND_8630",
    "desc": "Now drive!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8631,
    "name": "SOUND_8631",
    "desc": "You're fucking psycho!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8632,
    "name": "SOUND_8632",
    "desc": "All you little men are scared of strong women!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8633,
    "name": "SOUND_8633",
    "desc": "If we're passionate you say we're crazy.",
    "cat": "Falas e Vozes"
  },
  {
    "id": 8634,
    "name": "SOUND_8634",
    "desc": "If we're upset you say we're hysterical.",
    "cat": "Falas e Vozes"
  },
  {
    "id": 8635,
    "name": "SOUND_8635",
    "desc": "We sleep with men, we're sluts.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8636,
    "name": "SOUND_8636",
    "desc": "If we don't put out we're frigid bitches.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8637,
    "name": "SOUND_8637",
    "desc": "Who you calling little men? You went berserk back there!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8638,
    "name": "SOUND_8638",
    "desc": "That? That was just another day at the office!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8639,
    "name": "SOUND_8639",
    "desc": "You can't stand the heat, go put your tiny balls in the freezer!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8640,
    "name": "SOUND_8640",
    "desc": "Tiny balls? Now just wait a minute...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8641,
    "name": "SOUND_8641",
    "desc": "Enough! Just shut up and drive, I'm counting the fucking money!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8642,
    "name": "SOUND_8642",
    "desc": "That was fun, homeboy.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8643,
    "name": "SOUND_8643",
    "desc": "You wanna play again tomorrow?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8644,
    "name": "SOUND_8644",
    "desc": "Here. This is your cut.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8645,
    "name": "SOUND_8645",
    "desc": "Lady, I gotta take it easy.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8646,
    "name": "SOUND_8646",
    "desc": "Like you said, I got some other shit going on.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8647,
    "name": "SOUND_8647",
    "desc": "Whatever, baby.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8648,
    "name": "SOUND_8648",
    "desc": "If I play too rough, you do whatever makes you feel safe.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8649,
    "name": "SOUND_8649",
    "desc": "Maricon. See you around.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8650,
    "name": "SOUND_8650",
    "desc": "Thanks and everything bitch, but you crazy.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8651,
    "name": "SOUND_8651",
    "desc": "If you was the last bitch on earth,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8652,
    "name": "SOUND_8652",
    "desc": "I'd start going out with an animal.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8653,
    "name": "SOUND_8653",
    "desc": "You're too fucking loco, senorita.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8654,
    "name": "SOUND_8654",
    "desc": "Whatever else went down,I know I gotts do",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8655,
    "name": "SOUND_8655",
    "desc": "anything I can to avoid hanging out with",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8656,
    "name": "SOUND_8656",
    "desc": "that crazy bitch.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8657,
    "name": "SOUND_8657",
    "desc": "Hey, what we got left?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8658,
    "name": "SOUND_8658",
    "desc": "Are you stupid? You forget already?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8659,
    "name": "SOUND_8659",
    "desc": "The gas station in Dillimore.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8660,
    "name": "SOUND_8660",
    "desc": "The bank in Palomino Creek.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8661,
    "name": "SOUND_8661",
    "desc": "The liquor store in Blueberry.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8662,
    "name": "SOUND_8662",
    "desc": "The betting shop in Montgomery.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8663,
    "name": "SOUND_8663",
    "desc": "Or the liquor store in Blueberry.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8664,
    "name": "SOUND_8664",
    "desc": "Or the betting shop in Montgomery.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8665,
    "name": "SOUND_8665",
    "desc": "OK, well this time we're gonna do it real chill,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8666,
    "name": "SOUND_8666",
    "desc": "no crazy psycho shit, baby.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8667,
    "name": "SOUND_8667",
    "desc": "Speak for yourself, soft boy.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8668,
    "name": "SOUND_8668",
    "desc": "Today I feel like killing all the men I meet!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8669,
    "name": "SOUND_8669",
    "desc": "Ah baby!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8670,
    "name": "SOUND_8670",
    "desc": "Don't worry, I make an exception for some of the men in my life.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8671,
    "name": "SOUND_8671",
    "desc": "Now drive faster!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8672,
    "name": "SOUND_8672",
    "desc": "Take me home, Carl.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8673,
    "name": "SOUND_8673",
    "desc": "Okay. Look, but we gotta talk about something.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8674,
    "name": "SOUND_8674",
    "desc": "What? What do I have to say to you?",
    "cat": "Falas e Vozes"
  },
  {
    "id": 8675,
    "name": "SOUND_8675",
    "desc": "You're a great girl, and all, but you gotta calm down.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8676,
    "name": "SOUND_8676",
    "desc": "I know some cold blooded cats wouldn't act like you.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8677,
    "name": "SOUND_8677",
    "desc": "Oh, you get given a lioness and you want a pussy cat? Wimp!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8678,
    "name": "SOUND_8678",
    "desc": "No, I just want...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8679,
    "name": "SOUND_8679",
    "desc": "You know why I act like this.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8680,
    "name": "SOUND_8680",
    "desc": "No.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8681,
    "name": "SOUND_8681",
    "desc": "I'm in love, Carl.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8682,
    "name": "SOUND_8682",
    "desc": "A woman's heart is a tempestuous place,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8683,
    "name": "SOUND_8683",
    "desc": "and you will break my heart.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8684,
    "name": "SOUND_8684",
    "desc": "Sometimes I want to kill us both!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8685,
    "name": "SOUND_8685",
    "desc": "Please, don't do that. Just relax a little.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8686,
    "name": "SOUND_8686",
    "desc": "See you soon, handsome. Next time, we play REALLY rough.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8687,
    "name": "SOUND_8687",
    "desc": "Yeah, that's cool. But we can also play for some real money.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8688,
    "name": "SOUND_8688",
    "desc": "I got some money to... well,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8689,
    "name": "SOUND_8689",
    "desc": "it's a long story, but I need some serious paper, fast.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8690,
    "name": "SOUND_8690",
    "desc": "You come and see me again soon.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8691,
    "name": "SOUND_8691",
    "desc": "We rob a real bank.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8692,
    "name": "SOUND_8692",
    "desc": "How was it?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8693,
    "name": "SOUND_8693",
    "desc": "Different...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8694,
    "name": "SOUND_8694",
    "desc": "I knew you would like it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8695,
    "name": "SOUND_8695",
    "desc": "Look, baby, I thought we was going to make some serious paper.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8696,
    "name": "SOUND_8696",
    "desc": "I'm starting to get really bored of you.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8697,
    "name": "SOUND_8697",
    "desc": "I just need the money.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8698,
    "name": "SOUND_8698",
    "desc": "And I'm just a cheap fuck?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8699,
    "name": "SOUND_8699",
    "desc": "A whore you don't even pay?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8700,
    "name": "SOUND_8700",
    "desc": "No, I didn't say that.",
    "cat": "Falas e Vozes"
  },
  {
    "id": 8701,
    "name": "SOUND_8701",
    "desc": "Carl, I say I'm in love with you, and you act like I'm an idiot.",
    "cat": "Falas e Vozes"
  },
  {
    "id": 8702,
    "name": "SOUND_8702",
    "desc": "I see the way you look at other women.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8703,
    "name": "SOUND_8703",
    "desc": "I know your kind, Carl. I am serious.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8704,
    "name": "SOUND_8704",
    "desc": "I will kill you if you ever mess around.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8705,
    "name": "SOUND_8705",
    "desc": "I will castrate you first.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8706,
    "name": "SOUND_8706",
    "desc": "Then I will make you eat them.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8707,
    "name": "SOUND_8707",
    "desc": "Enough! I need some fucking money!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8708,
    "name": "SOUND_8708",
    "desc": "Carl, you are really boring me now.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8709,
    "name": "SOUND_8709",
    "desc": "Please, sweetheart. I got in some real, real deep shit.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8710,
    "name": "SOUND_8710",
    "desc": "Okay. Maybe today we hit it big!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8711,
    "name": "SOUND_8711",
    "desc": "Drive, lover!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8712,
    "name": "SOUND_8712",
    "desc": "You a lunatic, bitch?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8713,
    "name": "SOUND_8713",
    "desc": "Shut the fuck up. Home! Wimp!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8714,
    "name": "SOUND_8714",
    "desc": "Carl, you have much to learn about the female heart.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8715,
    "name": "SOUND_8715",
    "desc": "Come and see me again when you think you understand it.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8716,
    "name": "SOUND_8716",
    "desc": "Goodbye!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8717,
    "name": "SOUND_8717",
    "desc": "Come on, drive!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8718,
    "name": "SOUND_8718",
    "desc": "What's wrong?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8719,
    "name": "SOUND_8719",
    "desc": "Nothing. I just hate men.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8720,
    "name": "SOUND_8720",
    "desc": "Well give me a break.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8721,
    "name": "SOUND_8721",
    "desc": "Here's your break.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8722,
    "name": "SOUND_8722",
    "desc": "Your break is you're not on my barbecue being eaten.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8723,
    "name": "SOUND_8723",
    "desc": "Well, that's one way of looking at shit, I suppose.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8724,
    "name": "SOUND_8724",
    "desc": "Now, try to be a man this time.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8725,
    "name": "SOUND_8725",
    "desc": "Take me home now, big man.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8726,
    "name": "SOUND_8726",
    "desc": "How we do?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8727,
    "name": "SOUND_8727",
    "desc": "Is that all you care about? Money?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8728,
    "name": "SOUND_8728",
    "desc": "No, but I really need the paper--.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8729,
    "name": "SOUND_8729",
    "desc": "You revolt me. You make my skin crawl.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8730,
    "name": "SOUND_8730",
    "desc": "Well I ain't crazy about you, either!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8731,
    "name": "SOUND_8731",
    "desc": "That's just it. How little you know.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8732,
    "name": "SOUND_8732",
    "desc": "Don't talk. Let us enjoy the peace and quiet.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8733,
    "name": "SOUND_8733",
    "desc": "There you go.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8734,
    "name": "SOUND_8734",
    "desc": "Thanks",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8735,
    "name": "SOUND_8735",
    "desc": "One day, Carl Johnson, you will realize.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8736,
    "name": "SOUND_8736",
    "desc": "She, she truly loved me, and your heart will break in two.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8737,
    "name": "SOUND_8737",
    "desc": "But you are more like the spiny lizard than a man.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8738,
    "name": "SOUND_8738",
    "desc": "Goodbye!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8800,
    "name": "SOUND_8800",
    "desc": "This place will be a walk in the park!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8801,
    "name": "SOUND_8801",
    "desc": "You mean like the last place?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8802,
    "name": "SOUND_8802",
    "desc": "OK, Let's just take it",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8803,
    "name": "SOUND_8803",
    "desc": "Who are these cowboy assholes?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8804,
    "name": "SOUND_8804",
    "desc": "Hang back a while, see what's what.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8805,
    "name": "SOUND_8805",
    "desc": "We got the cash, let's get outta here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8806,
    "name": "SOUND_8806",
    "desc": "Those maricon bastards have our money!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8807,
    "name": "SOUND_8807",
    "desc": "THAT'S MY MONEY!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8808,
    "name": "SOUND_8808",
    "desc": "Carl, you drive, I'll shoot!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8809,
    "name": "SOUND_8809",
    "desc": "C'mon, move your fucking butt!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8810,
    "name": "SOUND_8810",
    "desc": "Let's go, yeehaa!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8811,
    "name": "SOUND_8811",
    "desc": "Keep up with them!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8812,
    "name": "SOUND_8812",
    "desc": "Faster, you fool!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8813,
    "name": "SOUND_8813",
    "desc": "You're driving like an old lady!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8814,
    "name": "SOUND_8814",
    "desc": "They're getting away!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8815,
    "name": "SOUND_8815",
    "desc": "They're dots in the distance, FASTER!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8816,
    "name": "SOUND_8816",
    "desc": "You're losing them!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8817,
    "name": "SOUND_8817",
    "desc": "They're getting away!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8818,
    "name": "SOUND_8818",
    "desc": "They're making fools of us!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8819,
    "name": "SOUND_8819",
    "desc": "Your pathetic driving is helping them escape!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8820,
    "name": "SOUND_8820",
    "desc": "Those chota pigs are on to us!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8821,
    "name": "SOUND_8821",
    "desc": "And now the cops, FUCKING TYPICAL!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8822,
    "name": "SOUND_8822",
    "desc": "Your pissing around bought the cops",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8823,
    "name": "SOUND_8823",
    "desc": "The cops too, FUCK! FUCK! FUCK!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8824,
    "name": "SOUND_8824",
    "desc": "OK, Carl, let's get back to the hideout!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8825,
    "name": "SOUND_8825",
    "desc": "Back to Fern Ridge, Carl!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8826,
    "name": "SOUND_8826",
    "desc": "Don't leave me behind, Carl Johnson!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8827,
    "name": "SOUND_8827",
    "desc": "You leave me, I CASTRATE YOU!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8828,
    "name": "SOUND_8828",
    "desc": "Get back here, you useless bastard!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8829,
    "name": "SOUND_8829",
    "desc": "Carl Johnson, don't you leave me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8830,
    "name": "SOUND_8830",
    "desc": "Stop shooting that thing right next to my ear!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8831,
    "name": "SOUND_8831",
    "desc": "What?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8832,
    "name": "SOUND_8832",
    "desc": "Can't hear anything - I'm deaf!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8833,
    "name": "SOUND_8833",
    "desc": "You blew out my ear!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8834,
    "name": "SOUND_8834",
    "desc": "Watch my damn head, bitch!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8835,
    "name": "SOUND_8835",
    "desc": "I hope you drive better this time around!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8836,
    "name": "SOUND_8836",
    "desc": "You ever driven a quad? It ain't easy.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8837,
    "name": "SOUND_8837",
    "desc": "'Specially when you got a screaming bitch on the back, shooting past your ear!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8838,
    "name": "SOUND_8838",
    "desc": "I like it when you angry at me, Carl.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8839,
    "name": "SOUND_8839",
    "desc": "I will try to anger you more often.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 8840,
    "name": "SOUND_8840",
    "desc": "Now that I'm looking forward to...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9000,
    "name": "SOUND_9000",
    "desc": "Just our fucking luck, the army's in town",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9001,
    "name": "SOUND_9001",
    "desc": "You wanna rob a betting shop?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9002,
    "name": "SOUND_9002",
    "desc": "Yeah. You not man enough?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9003,
    "name": "SOUND_9003",
    "desc": "Im going to cut off their balls!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9004,
    "name": "SOUND_9004",
    "desc": "Look, keep em sweet and Ill go cause a diversion.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9005,
    "name": "SOUND_9005",
    "desc": "Hello, I'm from out of town",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9006,
    "name": "SOUND_9006",
    "desc": "and maybe you big boys will show me a good time?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9007,
    "name": "SOUND_9007",
    "desc": "You impress me, Carl Johnson!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9008,
    "name": "SOUND_9008",
    "desc": "Cmon, lets do the damn thing!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9009,
    "name": "SOUND_9009",
    "desc": "I think I like you",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9010,
    "name": "SOUND_9010",
    "desc": "Open the backroom door or I blow your fucking face off!",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 9011,
    "name": "SOUND_9011",
    "desc": "Leave the panic button or I'll kill your children too!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9012,
    "name": "SOUND_9012",
    "desc": "Go! Get in there and open the safe!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9013,
    "name": "SOUND_9013",
    "desc": "Move it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9014,
    "name": "SOUND_9014",
    "desc": "Stop playing with your balls and hurry up!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9015,
    "name": "SOUND_9015",
    "desc": "We havent got all fucking day!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9016,
    "name": "SOUND_9016",
    "desc": "I warned you, you stupid bitch!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9017,
    "name": "SOUND_9017",
    "desc": "Stupid fucking bitch!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9018,
    "name": "SOUND_9018",
    "desc": "Now I kill you!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9019,
    "name": "SOUND_9019",
    "desc": "OK, I got it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9020,
    "name": "SOUND_9020",
    "desc": "About fucking time, you're a fucking sloth!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9021,
    "name": "SOUND_9021",
    "desc": "Whatever. Let's roll!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9022,
    "name": "SOUND_9022",
    "desc": "Carl, you have to be fast and totally ruthless!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9023,
    "name": "SOUND_9023",
    "desc": "No fucking about like in the betting shop!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9024,
    "name": "SOUND_9024",
    "desc": "What? If you hadn't started bustin', things would have been sweet!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9025,
    "name": "SOUND_9025",
    "desc": "They had to die because YOU were slow and stupid,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9026,
    "name": "SOUND_9026",
    "desc": "like a big fat brat that eats chocolates while his",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9027,
    "name": "SOUND_9027",
    "desc": "father gives nothing to his step daughter but stale bread!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9028,
    "name": "SOUND_9028",
    "desc": "What? Where'd that come from?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9029,
    "name": "SOUND_9029",
    "desc": "Enough! I'm not speaking to you any more!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9030,
    "name": "SOUND_9030",
    "desc": "Wh-what is you talking about?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9031,
    "name": "SOUND_9031",
    "desc": "Satchel charges?! Where the hell'd you get them?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9200,
    "name": "SOUND_9200",
    "desc": "Security Alarm",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 9201,
    "name": "SOUND_9201",
    "desc": "Wooden Door Breaking",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 9400,
    "name": "SOUND_9400",
    "desc": "Hand over the takings, or I blow your fucking balls off!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9401,
    "name": "SOUND_9401",
    "desc": "This here's bulletproof glass!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9402,
    "name": "SOUND_9402",
    "desc": "So you can just fuck off, bitch, before I call the sheriff!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9403,
    "name": "SOUND_9403",
    "desc": "What are you doing, son, just give her the cash!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9404,
    "name": "SOUND_9404",
    "desc": "Suit yourself, maricon.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9405,
    "name": "SOUND_9405",
    "desc": "Change of plan, Carl, we're taking the tanker!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9406,
    "name": "SOUND_9406",
    "desc": "Hey! What you doing?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9407,
    "name": "SOUND_9407",
    "desc": "Move it, you lazy bastard, get that tanker hooked up!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9408,
    "name": "SOUND_9408",
    "desc": "I'm on it, I got it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9409,
    "name": "SOUND_9409",
    "desc": "You won't get away with this!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9410,
    "name": "SOUND_9410",
    "desc": "Shut your spotty little mouth!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9411,
    "name": "SOUND_9411",
    "desc": "Drive! I know a guy who'll pay for this rig and its cargo!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9412,
    "name": "SOUND_9412",
    "desc": "I ain't losing another crappy job because of some crazy bitch!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9413,
    "name": "SOUND_9413",
    "desc": "C'mon, Derek, we're going to stop those bastards!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9414,
    "name": "SOUND_9414",
    "desc": "Do I have to?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9415,
    "name": "SOUND_9415",
    "desc": "Follow me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9416,
    "name": "SOUND_9416",
    "desc": "Oh no you don't, bitch!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9417,
    "name": "SOUND_9417",
    "desc": "C'mon, Derek, we're going to be local heroes!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9418,
    "name": "SOUND_9418",
    "desc": "I'd be happier staying here and stacking shelves!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9419,
    "name": "SOUND_9419",
    "desc": "Follow me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9420,
    "name": "SOUND_9420",
    "desc": "What is keeping you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9421,
    "name": "SOUND_9421",
    "desc": "C'mon, Carl, move it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9422,
    "name": "SOUND_9422",
    "desc": "Not far now!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9423,
    "name": "SOUND_9423",
    "desc": "This way!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9424,
    "name": "SOUND_9424",
    "desc": "Where have you been?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9425,
    "name": "SOUND_9425",
    "desc": "I thought you said you could drive!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9426,
    "name": "SOUND_9426",
    "desc": "Keep her steady so I can get a good shot!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9427,
    "name": "SOUND_9427",
    "desc": "Pull alongside!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9428,
    "name": "SOUND_9428",
    "desc": "Keep up with them!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9429,
    "name": "SOUND_9429",
    "desc": "Get ahead of them!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9430,
    "name": "SOUND_9430",
    "desc": "Block their route!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9431,
    "name": "SOUND_9431",
    "desc": "Steady... steady...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9432,
    "name": "SOUND_9432",
    "desc": "It ain't worth it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9433,
    "name": "SOUND_9433",
    "desc": "I'm scared!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9434,
    "name": "SOUND_9434",
    "desc": "This ain't my fight!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9435,
    "name": "SOUND_9435",
    "desc": "We'll get ourselves killed!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9436,
    "name": "SOUND_9436",
    "desc": "I don't wanna do this!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9437,
    "name": "SOUND_9437",
    "desc": "Oh my God, I'm gonna die!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9438,
    "name": "SOUND_9438",
    "desc": "That rig will crush us!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9439,
    "name": "SOUND_9439",
    "desc": "Pull up in that depot up ahead!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9440,
    "name": "SOUND_9440",
    "desc": "That's the place, up ahead!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9441,
    "name": "SOUND_9441",
    "desc": "Yeehaa, that's the place, go, Carl, go!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9442,
    "name": "SOUND_9442",
    "desc": "Hello, Mr. Whittaker!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9443,
    "name": "SOUND_9443",
    "desc": "Catalina! What have you brought me today?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9444,
    "name": "SOUND_9444",
    "desc": "A rig and tanker, full to the brim with premium gas!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9445,
    "name": "SOUND_9445",
    "desc": "Never seen it, never saw you, never gave you this wad of cash!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9446,
    "name": "SOUND_9446",
    "desc": "Nice not doing business!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9447,
    "name": "SOUND_9447",
    "desc": "Likewise. Now get out of here, before the cops come snooping.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9448,
    "name": "SOUND_9448",
    "desc": "You ever get hold of another rig, just drop it in,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9449,
    "name": "SOUND_9449",
    "desc": "I'll always give a good price!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9450,
    "name": "SOUND_9450",
    "desc": "You ever want to run some freight for me just drop in.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9451,
    "name": "SOUND_9451",
    "desc": "I've always got shit to move.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9600,
    "name": "SOUND_9600",
    "desc": "Shit, I just bought another donut! Dont criminals have any consideration?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9601,
    "name": "SOUND_9601",
    "desc": "We can collect that bribe later. Might as well go and take a look.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9602,
    "name": "SOUND_9602",
    "desc": "We know you're in there!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9603,
    "name": "SOUND_9603",
    "desc": "The game's up! Come on out!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9604,
    "name": "SOUND_9604",
    "desc": "Come out real peaceable, like!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9605,
    "name": "SOUND_9605",
    "desc": "Give up, you're surrounded!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9606,
    "name": "SOUND_9606",
    "desc": "Thought you might try the back way!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9607,
    "name": "SOUND_9607",
    "desc": "We were waiting for yer!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9608,
    "name": "SOUND_9608",
    "desc": "Stop your grinning and drop your linen!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9609,
    "name": "SOUND_9609",
    "desc": "You two, FREEZE!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9610,
    "name": "SOUND_9610",
    "desc": "Shit, I just bought another donut! Don't criminals have any consideration?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9611,
    "name": "SOUND_9611",
    "desc": "We can collect that bribe later, might as well go take a look",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9612,
    "name": "SOUND_9612",
    "desc": "We know youre in there!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9613,
    "name": "SOUND_9613",
    "desc": "The games up! Come on out!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9614,
    "name": "SOUND_9614",
    "desc": "Come out real peaceable, like!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9615,
    "name": "SOUND_9615",
    "desc": "Give up, you're surrounded!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9616,
    "name": "SOUND_9616",
    "desc": "Thought you might try the back way!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9617,
    "name": "SOUND_9617",
    "desc": "We were waiting for yer!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9618,
    "name": "SOUND_9618",
    "desc": "Stop your grinning and drop your linen!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9619,
    "name": "SOUND_9619",
    "desc": "You two, freeze!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9620,
    "name": "SOUND_9620",
    "desc": "Attention all units - some psychos are robbing the bank at Palomino Creek!",
    "cat": "Rádio Policial"
  },
  {
    "id": 9621,
    "name": "SOUND_9621",
    "desc": "You're on crowd control so don't take any shit!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9622,
    "name": "SOUND_9622",
    "desc": "Yes'm, Miss Catalina, Miss.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9623,
    "name": "SOUND_9623",
    "desc": "And dont try to be funny, you are NOT funny, Carl Johnson!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9624,
    "name": "SOUND_9624",
    "desc": "Don't even think about doin' anything, motherfucker!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9625,
    "name": "SOUND_9625",
    "desc": "Hand over every last dollar, NOW, BITCH!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9626,
    "name": "SOUND_9626",
    "desc": "I'm going to empty the safe.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9627,
    "name": "SOUND_9627",
    "desc": "Keep these idiots covered!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9628,
    "name": "SOUND_9628",
    "desc": "A'ight, you heard the lady, no heroic shit!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9629,
    "name": "SOUND_9629",
    "desc": "Dont even think it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9630,
    "name": "SOUND_9630",
    "desc": "What you lookin at?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9631,
    "name": "SOUND_9631",
    "desc": "You got kids?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9632,
    "name": "SOUND_9632",
    "desc": "Think you a hero?!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9633,
    "name": "SOUND_9633",
    "desc": "Don't push me",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9634,
    "name": "SOUND_9634",
    "desc": "I had a real bad day!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9635,
    "name": "SOUND_9635",
    "desc": "This ain't cool fool",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9636,
    "name": "SOUND_9636",
    "desc": "What I tell you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9637,
    "name": "SOUND_9637",
    "desc": "I ain't asking again",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9638,
    "name": "SOUND_9638",
    "desc": "You wanna die?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9639,
    "name": "SOUND_9639",
    "desc": "You pushing me, motherfucker!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9640,
    "name": "SOUND_9640",
    "desc": "Ive just about hed enough of your games!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9641,
    "name": "SOUND_9641",
    "desc": "Im serious, REAL serious!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9642,
    "name": "SOUND_9642",
    "desc": "Oh shit!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9643,
    "name": "SOUND_9643",
    "desc": "Girl, I warned you!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9644,
    "name": "SOUND_9644",
    "desc": "Shit! I give you one simple job!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9645,
    "name": "SOUND_9645",
    "desc": "Idiota!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9646,
    "name": "SOUND_9646",
    "desc": "Horrible pigs will be here any minute!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9647,
    "name": "SOUND_9647",
    "desc": "Smash the ATMs and get as much cash as possible!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9648,
    "name": "SOUND_9648",
    "desc": "Ill watch outside!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9649,
    "name": "SOUND_9649",
    "desc": "Quick, we haven't much time!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9650,
    "name": "SOUND_9650",
    "desc": "Shit! Local idiotas all over the street!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9651,
    "name": "SOUND_9651",
    "desc": "Better take the back door!",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 9652,
    "name": "SOUND_9652",
    "desc": "Carl, behind you!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9653,
    "name": "SOUND_9653",
    "desc": "Look out, Carl!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9654,
    "name": "SOUND_9654",
    "desc": "Watch your back, Carl!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9655,
    "name": "SOUND_9655",
    "desc": "To our left!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9656,
    "name": "SOUND_9656",
    "desc": "Policiato a right",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9657,
    "name": "SOUND_9657",
    "desc": "Cops! Take cover!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9658,
    "name": "SOUND_9658",
    "desc": "Keep going!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9659,
    "name": "SOUND_9659",
    "desc": "Follow me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9660,
    "name": "SOUND_9660",
    "desc": "Cover me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9661,
    "name": "SOUND_9661",
    "desc": "Go, Carl, Ill cover you!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9662,
    "name": "SOUND_9662",
    "desc": "Grab a bike and follow me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9663,
    "name": "SOUND_9663",
    "desc": "You think you can keep up with a real woman?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9664,
    "name": "SOUND_9664",
    "desc": "What's keeping you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9665,
    "name": "SOUND_9665",
    "desc": "You slow bastard!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9666,
    "name": "SOUND_9666",
    "desc": "Are you afraid of speed, Carl?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9667,
    "name": "SOUND_9667",
    "desc": "Stop getting lost!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9668,
    "name": "SOUND_9668",
    "desc": "You're too laid back, you lazy slob!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9669,
    "name": "SOUND_9669",
    "desc": "Pick it up a little, you retarded asshole!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9670,
    "name": "SOUND_9670",
    "desc": "More speed, less idiota!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9671,
    "name": "SOUND_9671",
    "desc": "I feel good today, like a woman reborn!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9672,
    "name": "SOUND_9672",
    "desc": "Cool, maybe you won't go berserk, huh?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9673,
    "name": "SOUND_9673",
    "desc": "Oh, I go berserk, but not until I really pissed!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9674,
    "name": "SOUND_9674",
    "desc": "Oh, well, that's a relief to hear!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9675,
    "name": "SOUND_9675",
    "desc": "Perhaps this time no cowboy motherfuckers will get in our way!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9676,
    "name": "SOUND_9676",
    "desc": "Amen to that!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9800,
    "name": "SOUND_9800",
    "desc": "Faster, Carl, faster!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9801,
    "name": "SOUND_9801",
    "desc": "I like my men fast!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9802,
    "name": "SOUND_9802",
    "desc": "Hit the gas, you wimp!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9803,
    "name": "SOUND_9803",
    "desc": "Floor it, CJ, floor it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9804,
    "name": "SOUND_9804",
    "desc": "Get a fucking move on",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9805,
    "name": "SOUND_9805",
    "desc": "I know ladys that drive faster than this!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9806,
    "name": "SOUND_9806",
    "desc": "I've met pigs that can drive faster!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9807,
    "name": "SOUND_9807",
    "desc": "Carl, you are too slow, and very fucking shit.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9808,
    "name": "SOUND_9808",
    "desc": "Get in!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9809,
    "name": "SOUND_9809",
    "desc": "Get in, idiota",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9810,
    "name": "SOUND_9810",
    "desc": "Get in or walk like a stinking pero",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9811,
    "name": "SOUND_9811",
    "desc": "What are you waiting for?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9812,
    "name": "SOUND_9812",
    "desc": "Get your stupid ass in the car CJ!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9813,
    "name": "SOUND_9813",
    "desc": "Get in the fucking car!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9814,
    "name": "SOUND_9814",
    "desc": "Drive me",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9815,
    "name": "SOUND_9815",
    "desc": "You drive American",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9816,
    "name": "SOUND_9816",
    "desc": "Take the wheel Carl",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 9817,
    "name": "SOUND_9817",
    "desc": "You drive, fucking pero",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9818,
    "name": "SOUND_9818",
    "desc": "Carl, honey, you drive!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9819,
    "name": "SOUND_9819",
    "desc": "Carl, you drive",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9820,
    "name": "SOUND_9820",
    "desc": "Back to fern ridge",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9821,
    "name": "SOUND_9821",
    "desc": "Fern ridge now",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9822,
    "name": "SOUND_9822",
    "desc": "Back to our hideout 'merican!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9823,
    "name": "SOUND_9823",
    "desc": "We will lie low at furridge",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9824,
    "name": "SOUND_9824",
    "desc": "Get us back to the hideout!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9825,
    "name": "SOUND_9825",
    "desc": "We need to lay low!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9826,
    "name": "SOUND_9826",
    "desc": "Carl, you dare leave me behind!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9827,
    "name": "SOUND_9827",
    "desc": "Wait for me, Carl!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9828,
    "name": "SOUND_9828",
    "desc": "Wait for me, you fucking idiota!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9829,
    "name": "SOUND_9829",
    "desc": "Hey, you leave me and I kill your family!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9830,
    "name": "SOUND_9830",
    "desc": "Don't try and dump me, Carl!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9831,
    "name": "SOUND_9831",
    "desc": "Hey, I do the dumping around here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9832,
    "name": "SOUND_9832",
    "desc": "You trying to run out on me?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9833,
    "name": "SOUND_9833",
    "desc": "You won't get far without me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9834,
    "name": "SOUND_9834",
    "desc": "Carl!  Help me you pig!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9835,
    "name": "SOUND_9835",
    "desc": "CJ, be a man and help your lady",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9836,
    "name": "SOUND_9836",
    "desc": "Ah shit, Carl, kill that motherfucker!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9837,
    "name": "SOUND_9837",
    "desc": "Help me Carl, help me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9838,
    "name": "SOUND_9838",
    "desc": "Kill them all!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9839,
    "name": "SOUND_9839",
    "desc": "Shit on them like dogs",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9840,
    "name": "SOUND_9840",
    "desc": "These stinking little people, kill them!!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9841,
    "name": "SOUND_9841",
    "desc": "Break them Carl, break them for me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9842,
    "name": "SOUND_9842",
    "desc": "We are fucked CJ! Run!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9843,
    "name": "SOUND_9843",
    "desc": "Fuck you!  Carl we're leaving",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9844,
    "name": "SOUND_9844",
    "desc": "Too many damn ... run!!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9845,
    "name": "SOUND_9845",
    "desc": "Come on Carl! We're leaving",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9846,
    "name": "SOUND_9846",
    "desc": "Come on Carl, we gotta get outta here",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9847,
    "name": "SOUND_9847",
    "desc": "Carl, get us some fucking wheels!",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 9848,
    "name": "SOUND_9848",
    "desc": "We need some wheels NOW!",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 9849,
    "name": "SOUND_9849",
    "desc": "We can do it alright CJ!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9850,
    "name": "SOUND_9850",
    "desc": "Go go CJ, go!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9851,
    "name": "SOUND_9851",
    "desc": "Hit the gas!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9852,
    "name": "SOUND_9852",
    "desc": "Get us out of here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9853,
    "name": "SOUND_9853",
    "desc": "Get us the fuck out of here",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9854,
    "name": "SOUND_9854",
    "desc": "Carl, you listen, and listen good!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9855,
    "name": "SOUND_9855",
    "desc": "Carl, turn that down, I'm speaking!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9856,
    "name": "SOUND_9856",
    "desc": "That is all i have to say on the matter!",
    "cat": "Falas e Vozes"
  },
  {
    "id": 9857,
    "name": "SOUND_9857",
    "desc": "There. That is what I have to say",
    "cat": "Falas e Vozes"
  },
  {
    "id": 9858,
    "name": "SOUND_9858",
    "desc": "Here you go",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9859,
    "name": "SOUND_9859",
    "desc": "Here, Carl.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9860,
    "name": "SOUND_9860",
    "desc": "Here's your cut, big man.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9861,
    "name": "SOUND_9861",
    "desc": "Die, idiota pigs!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9862,
    "name": "SOUND_9862",
    "desc": "I'll kill all you police dogs!",
    "cat": "Rádio Policial"
  },
  {
    "id": 9863,
    "name": "SOUND_9863",
    "desc": "I've killed hundreds of pigs like you!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9864,
    "name": "SOUND_9864",
    "desc": "Eat it, you fucking perro!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9865,
    "name": "SOUND_9865",
    "desc": "I hope it hurts!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9866,
    "name": "SOUND_9866",
    "desc": "I hope it takes you long to die!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9867,
    "name": "SOUND_9867",
    "desc": "I'll take your fucking head off!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9868,
    "name": "SOUND_9868",
    "desc": "I'm gonna fry your balls and eat them!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9869,
    "name": "SOUND_9869",
    "desc": "I'm gonna kill all you stupid pigs!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9870,
    "name": "SOUND_9870",
    "desc": "You want some too, huh?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9871,
    "name": "SOUND_9871",
    "desc": "Take it and party!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9872,
    "name": "SOUND_9872",
    "desc": "Bleed, stupid motherfucker!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9873,
    "name": "SOUND_9873",
    "desc": "I'm going to kill and kill!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9874,
    "name": "SOUND_9874",
    "desc": "Nobody screws with me, NOBODY!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9875,
    "name": "SOUND_9875",
    "desc": "I'll kill your family too!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9876,
    "name": "SOUND_9876",
    "desc": "I'm going to skin you like a perro!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9877,
    "name": "SOUND_9877",
    "desc": "Eat my shit!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9878,
    "name": "SOUND_9878",
    "desc": "Drink my piss!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9879,
    "name": "SOUND_9879",
    "desc": "You lucky I don't ram it up your ass!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9880,
    "name": "SOUND_9880",
    "desc": "You laughing at me?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9881,
    "name": "SOUND_9881",
    "desc": "I saw you laughing!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9882,
    "name": "SOUND_9882",
    "desc": "Nobody survives Catalina, NOBODY!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9883,
    "name": "SOUND_9883",
    "desc": "you messing with the biggest bitch in town, assholes",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9884,
    "name": "SOUND_9884",
    "desc": "Who wants me now?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9885,
    "name": "SOUND_9885",
    "desc": "what were you saying, huh?",
    "cat": "Falas e Vozes"
  },
  {
    "id": 9886,
    "name": "SOUND_9886",
    "desc": "don't you laugh at me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9887,
    "name": "SOUND_9887",
    "desc": "disrespecting a woman!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9888,
    "name": "SOUND_9888",
    "desc": "You're all dead, assholes!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9889,
    "name": "SOUND_9889",
    "desc": "Carl, you are a fucking idiota!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9890,
    "name": "SOUND_9890",
    "desc": "Idiota, Carl, idiota!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9891,
    "name": "SOUND_9891",
    "desc": "Useless cabron!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9892,
    "name": "SOUND_9892",
    "desc": "You are a waste of good balls!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9893,
    "name": "SOUND_9893",
    "desc": "I should cut your balls off!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9894,
    "name": "SOUND_9894",
    "desc": "Carl Johnson, you are shit!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9895,
    "name": "SOUND_9895",
    "desc": "What are you doing, you stupid perro!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9896,
    "name": "SOUND_9896",
    "desc": "I never fuck you again!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9897,
    "name": "SOUND_9897",
    "desc": "I don't love you no more!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9898,
    "name": "SOUND_9898",
    "desc": "I cannot love a stupid man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9899,
    "name": "SOUND_9899",
    "desc": "Where are we going?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9900,
    "name": "SOUND_9900",
    "desc": "Why is it taking so long?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9901,
    "name": "SOUND_9901",
    "desc": "Are you sure this is the way?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9902,
    "name": "SOUND_9902",
    "desc": "This is not a shortcut!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9903,
    "name": "SOUND_9903",
    "desc": "Tell me we are not lost!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9904,
    "name": "SOUND_9904",
    "desc": "Where do you think we are going?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9905,
    "name": "SOUND_9905",
    "desc": "You are lost, and stupid!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9906,
    "name": "SOUND_9906",
    "desc": "I ask you to drive, and you fuck about!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9907,
    "name": "SOUND_9907",
    "desc": "Carl, what are you doing?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9908,
    "name": "SOUND_9908",
    "desc": "Come on, Carl.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9909,
    "name": "SOUND_9909",
    "desc": "Please, Carlito, drive.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9910,
    "name": "SOUND_9910",
    "desc": "Come on, Carl, what you pissing about for?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9911,
    "name": "SOUND_9911",
    "desc": "Carl, please, come on",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9912,
    "name": "SOUND_9912",
    "desc": "Get a fucking move on, Carlito.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9913,
    "name": "SOUND_9913",
    "desc": "Please, Carl, come on, hurry the fucking driving",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 9914,
    "name": "SOUND_9914",
    "desc": "Where the fuck is this?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10000,
    "name": "SOUND_10000",
    "desc": "Hey, keep up, holmes!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10001,
    "name": "SOUND_10001",
    "desc": "Not far now, eh!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10002,
    "name": "SOUND_10002",
    "desc": "C'mon, Carl, follow us!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10003,
    "name": "SOUND_10003",
    "desc": "You're almost there, Carl!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10004,
    "name": "SOUND_10004",
    "desc": "You gonna have to drive better than that, CJ!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10005,
    "name": "SOUND_10005",
    "desc": "Hey, CJ, you wrecking your car, eh!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10006,
    "name": "SOUND_10006",
    "desc": "C'mon, Carl, you've gotta be kidding me right? - pick it up!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10007,
    "name": "SOUND_10007",
    "desc": "Oh, Carl, I thought you said you could drive!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10008,
    "name": "SOUND_10008",
    "desc": "Carl! What are you doing?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10009,
    "name": "SOUND_10009",
    "desc": "Watch out, Carl!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10010,
    "name": "SOUND_10010",
    "desc": "Carl, you idiot!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10011,
    "name": "SOUND_10011",
    "desc": "Hey, Carl, don't play dirty!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10012,
    "name": "SOUND_10012",
    "desc": "Hey, watch out, Carl!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10013,
    "name": "SOUND_10013",
    "desc": "You trying to kill your sister?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10014,
    "name": "SOUND_10014",
    "desc": "Lets see what you got, homeboy. Lets do this!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10015,
    "name": "SOUND_10015",
    "desc": "Good luck homls",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10200,
    "name": "SOUND_10200",
    "desc": "Hey you! Police. Stop!",
    "cat": "Rádio Policial"
  },
  {
    "id": 10201,
    "name": "SOUND_10201",
    "desc": "Hey, what are you doing in here?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10202,
    "name": "SOUND_10202",
    "desc": "Hey, this is police property!",
    "cat": "Rádio Policial"
  },
  {
    "id": 10203,
    "name": "SOUND_10203",
    "desc": "OK punk, have it your way!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10204,
    "name": "SOUND_10204",
    "desc": "Hi there. In ygo.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10205,
    "name": "SOUND_10205",
    "desc": "Hows it going? OK, its open.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10206,
    "name": "SOUND_10206",
    "desc": "Hold on. There you go, pal.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10207,
    "name": "SOUND_10207",
    "desc": "The Los Santos Police precinct is in Pershing Square in Commerce.",
    "cat": "Rádio Policial"
  },
  {
    "id": 10208,
    "name": "SOUND_10208",
    "desc": "Yeah, I know Pershing Square...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10209,
    "name": "SOUND_10209",
    "desc": "Theres an entrance to the left that leads to the underground carpark.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10210,
    "name": "SOUND_10210",
    "desc": "At the back is a garage that holds the impounded vehicles.",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 10211,
    "name": "SOUND_10211",
    "desc": "Ah man, this is gonna be crawling with cops!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10212,
    "name": "SOUND_10212",
    "desc": "Yeah I know, but if your prize car is missing when you come back to it,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10213,
    "name": "SOUND_10213",
    "desc": "Its probably been towed.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10214,
    "name": "SOUND_10214",
    "desc": "Aright man, thanks, I guess I can take it from here.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10400,
    "name": "SOUND_10400",
    "desc": "Get in, CJ, get in!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10401,
    "name": "SOUND_10401",
    "desc": "Hop in, holmes!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10402,
    "name": "SOUND_10402",
    "desc": "All aboard!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10403,
    "name": "SOUND_10403",
    "desc": "You got shotgun, CJ!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10404,
    "name": "SOUND_10404",
    "desc": "Get in the car, CJ!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10405,
    "name": "SOUND_10405",
    "desc": "Jump in, CJ, quick!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10406,
    "name": "SOUND_10406",
    "desc": "Wait up, CJ!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10407,
    "name": "SOUND_10407",
    "desc": "Hang ten, CJ!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10408,
    "name": "SOUND_10408",
    "desc": "Hold up!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10409,
    "name": "SOUND_10409",
    "desc": "Slow down, Carl!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10600,
    "name": "SOUND_10600",
    "desc": "Oh my God, help!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10601,
    "name": "SOUND_10601",
    "desc": "Somebody help me, help!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10602,
    "name": "SOUND_10602",
    "desc": "The smoke, it's choking me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10603,
    "name": "SOUND_10603",
    "desc": "Please, somebody, anybody, help!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10604,
    "name": "SOUND_10604",
    "desc": "Hey! Can anybody hear me?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10605,
    "name": "SOUND_10605",
    "desc": "Please, God, somebody, HELP!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10606,
    "name": "SOUND_10606",
    "desc": "FIRE! Help, FIRE!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10607,
    "name": "SOUND_10607",
    "desc": "CALL 911!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10608,
    "name": "SOUND_10608",
    "desc": "Oh god, the flames, the flames!!!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10609,
    "name": "SOUND_10609",
    "desc": "Oh God, the flames! THE FLAMES!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10610,
    "name": "SOUND_10610",
    "desc": "(SCREAM)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10611,
    "name": "SOUND_10611",
    "desc": "(SCREAM)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10612,
    "name": "SOUND_10612",
    "desc": "(SCREAM)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10613,
    "name": "SOUND_10613",
    "desc": "(SCREAM)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10614,
    "name": "SOUND_10614",
    "desc": "(SCREAM)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10615,
    "name": "SOUND_10615",
    "desc": "(SCREAM)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10616,
    "name": "SOUND_10616",
    "desc": "(SCREAM)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10617,
    "name": "SOUND_10617",
    "desc": "(SCREAM)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10618,
    "name": "SOUND_10618",
    "desc": "(SCREAM)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10619,
    "name": "SOUND_10619",
    "desc": "(SCREAM)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10620,
    "name": "SOUND_10620",
    "desc": "Hold tight, girl, I'm coming!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10621,
    "name": "SOUND_10621",
    "desc": "Stay at the window, I'm coming up!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10622,
    "name": "SOUND_10622",
    "desc": "Who the fuck are you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10623,
    "name": "SOUND_10623",
    "desc": "You started this!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10624,
    "name": "SOUND_10624",
    "desc": "Eh, this Grove Street chingon started the fire!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10625,
    "name": "SOUND_10625",
    "desc": "So, Grove Street OGs started to fire...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10626,
    "name": "SOUND_10626",
    "desc": "You there, you OK?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10627,
    "name": "SOUND_10627",
    "desc": "Yeah, but those flames, they're too hot! I'm scared!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10628,
    "name": "SOUND_10628",
    "desc": "Hold on, there's probably a fire extinguisher in the kitchen!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10629,
    "name": "SOUND_10629",
    "desc": "I'll be right back!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10630,
    "name": "SOUND_10630",
    "desc": "Stand back!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10631,
    "name": "SOUND_10631",
    "desc": "Put it out! Put it out!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10632,
    "name": "SOUND_10632",
    "desc": "Oh God, I'm so scared!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10633,
    "name": "SOUND_10633",
    "desc": "OHMYGOD, what was that?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10634,
    "name": "SOUND_10634",
    "desc": "Hey, the building's starting to collapse, we gotta get out of here, fast!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10635,
    "name": "SOUND_10635",
    "desc": "Hurry up, put it out, put it out!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10636,
    "name": "SOUND_10636",
    "desc": "Oh my God, we'll never escape!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10637,
    "name": "SOUND_10637",
    "desc": "Quickly, QUICKLY!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10638,
    "name": "SOUND_10638",
    "desc": "Put out that fire, quickly, quickly!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10639,
    "name": "SOUND_10639",
    "desc": "Stand back, I've got it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10640,
    "name": "SOUND_10640",
    "desc": "Gimme a second girl, don't panic!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10641,
    "name": "SOUND_10641",
    "desc": "Quit panicking, I'm on it! I'm on it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10642,
    "name": "SOUND_10642",
    "desc": "Hold on, we're nearly there!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10643,
    "name": "SOUND_10643",
    "desc": "Shit! Shit! The house is collapsing!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10644,
    "name": "SOUND_10644",
    "desc": "Oh my God, the house is going to go!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10645,
    "name": "SOUND_10645",
    "desc": "I can feel the floor giving way!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10646,
    "name": "SOUND_10646",
    "desc": "Hey, man, I owe you my life...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10647,
    "name": "SOUND_10647",
    "desc": "I was nearly dead there, for sure!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10648,
    "name": "SOUND_10648",
    "desc": "Hey, you look pretty shook up. girl, you want me to take you home?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10649,
    "name": "SOUND_10649",
    "desc": "Yeah, please, thanks.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10650,
    "name": "SOUND_10650",
    "desc": "Where you live?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10651,
    "name": "SOUND_10651",
    "desc": "Just off Grove Street.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10652,
    "name": "SOUND_10652",
    "desc": "No shit! What you doing in Vagos 'hood?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10653,
    "name": "SOUND_10653",
    "desc": "I like to live dangerously.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10654,
    "name": "SOUND_10654",
    "desc": "You're CJ, right?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10655,
    "name": "SOUND_10655",
    "desc": "Yeah, how you know me?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10656,
    "name": "SOUND_10656",
    "desc": "Everybody in the Grove knows you and your brother,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10657,
    "name": "SOUND_10657",
    "desc": "but I thought you'd run away.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10658,
    "name": "SOUND_10658",
    "desc": "I never 'ran away' OK, I just needed to...get away from shit.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10659,
    "name": "SOUND_10659",
    "desc": "This is my place, here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10660,
    "name": "SOUND_10660",
    "desc": "Hey, what's your name?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10661,
    "name": "SOUND_10661",
    "desc": "Denise. Denise Robinson. Give me a call sometime, we should go out, or something.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10662,
    "name": "SOUND_10662",
    "desc": "Yeah, I'd like that.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10663,
    "name": "SOUND_10663",
    "desc": "OK, I'll catch you later, CJ.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10800,
    "name": "SOUND_10800",
    "desc": "This doesn't concern you",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10801,
    "name": "SOUND_10801",
    "desc": "Beat it",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10802,
    "name": "SOUND_10802",
    "desc": "Police bussiness",
    "cat": "Rádio Policial"
  },
  {
    "id": 10803,
    "name": "SOUND_10803",
    "desc": "Don't push me, son",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10804,
    "name": "SOUND_10804",
    "desc": "You wanna make this a problem?!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10805,
    "name": "SOUND_10805",
    "desc": "Are you looking for trouble?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10806,
    "name": "SOUND_10806",
    "desc": "I think he's an accomplice",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10807,
    "name": "SOUND_10807",
    "desc": "You had to push me",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10808,
    "name": "SOUND_10808",
    "desc": "You leave me no choice",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10809,
    "name": "SOUND_10809",
    "desc": "Another day, another scumbag off the street!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10810,
    "name": "SOUND_10810",
    "desc": "Too much damn over time",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10811,
    "name": "SOUND_10811",
    "desc": "Did anybody frisk that guy?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10812,
    "name": "SOUND_10812",
    "desc": "Shit, the bags burst, there's weed all over",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10813,
    "name": "SOUND_10813",
    "desc": "Anybody want any of this?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10814,
    "name": "SOUND_10814",
    "desc": "Didn't even break a sweat",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10815,
    "name": "SOUND_10815",
    "desc": "This ain't interesting, go away",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10816,
    "name": "SOUND_10816",
    "desc": "What's this to you? beat it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10817,
    "name": "SOUND_10817",
    "desc": "Where you gonna score now, huh?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10818,
    "name": "SOUND_10818",
    "desc": "C'mon, beat it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10819,
    "name": "SOUND_10819",
    "desc": "Dont make this an issue",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10820,
    "name": "SOUND_10820",
    "desc": "You trying to bait me?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10821,
    "name": "SOUND_10821",
    "desc": "Ok, I've had enough of you!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10822,
    "name": "SOUND_10822",
    "desc": "You want a night in the cells? Fine!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10823,
    "name": "SOUND_10823",
    "desc": "Ok buddy, assume the position",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10824,
    "name": "SOUND_10824",
    "desc": "I used to go to college with this guy",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10825,
    "name": "SOUND_10825",
    "desc": "Anybody want any of this before I bag it?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10826,
    "name": "SOUND_10826",
    "desc": "Where did his gun gone?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10827,
    "name": "SOUND_10827",
    "desc": "Making all this money",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10828,
    "name": "SOUND_10828",
    "desc": "Weed, coke, it's all the same to me",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10829,
    "name": "SOUND_10829",
    "desc": "Beat 'em up a little, huh?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10830,
    "name": "SOUND_10830",
    "desc": "Tenpenny set me up!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10831,
    "name": "SOUND_10831",
    "desc": "Busta C.R.A.S.H. set me up!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 10832,
    "name": "SOUND_10832",
    "desc": "Tenpenny sold me out!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11000,
    "name": "SOUND_11000",
    "desc": "Big mistake, my friend!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11001,
    "name": "SOUND_11001",
    "desc": "Hes after the guns!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11002,
    "name": "SOUND_11002",
    "desc": "Wrong, Im after you!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11003,
    "name": "SOUND_11003",
    "desc": "Hey, hey, maybe we can talk about this!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11004,
    "name": "SOUND_11004",
    "desc": "Stop, we could do business!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11005,
    "name": "SOUND_11005",
    "desc": "Fuck you, Americansky! I'm gone!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11006,
    "name": "SOUND_11006",
    "desc": "Doing business in America is dangerous!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11007,
    "name": "SOUND_11007",
    "desc": "Got to get away from this crazy Americansky!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11008,
    "name": "SOUND_11008",
    "desc": "Hey, who the fuck are you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11009,
    "name": "SOUND_11009",
    "desc": "You dont want to be nosing around here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11010,
    "name": "SOUND_11010",
    "desc": "You're putting your nose where it's not wanted!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11200,
    "name": "SOUND_11200",
    "desc": "Object being dropped",
    "cat": "Falas e Vozes"
  },
  {
    "id": 11400,
    "name": "SOUND_11400",
    "desc": "Dance n Fly",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11401,
    "name": "SOUND_11401",
    "desc": "Whao!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11402,
    "name": "SOUND_11402",
    "desc": "You the man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11403,
    "name": "SOUND_11403",
    "desc": "Those are some killer moves!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11404,
    "name": "SOUND_11404",
    "desc": "Incredible!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11405,
    "name": "SOUND_11405",
    "desc": "Are you a professional?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11406,
    "name": "SOUND_11406",
    "desc": "Kid knows how to move",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11407,
    "name": "SOUND_11407",
    "desc": "Look at this guy!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11408,
    "name": "SOUND_11408",
    "desc": "How does he do that?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11409,
    "name": "SOUND_11409",
    "desc": "Give me some of that",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11410,
    "name": "SOUND_11410",
    "desc": "That's the bomb",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11411,
    "name": "SOUND_11411",
    "desc": "Hey! You're a natural!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11412,
    "name": "SOUND_11412",
    "desc": "Rock n roll!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11413,
    "name": "SOUND_11413",
    "desc": "Best dancer I've seen in here",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11414,
    "name": "SOUND_11414",
    "desc": "You dance great!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11415,
    "name": "SOUND_11415",
    "desc": "I gotta admit, this guy has got it",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11416,
    "name": "SOUND_11416",
    "desc": "Everyone thinks you're cool",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11417,
    "name": "SOUND_11417",
    "desc": "That was the shit",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11418,
    "name": "SOUND_11418",
    "desc": "Nice moves",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11419,
    "name": "SOUND_11419",
    "desc": "Thats, incredible",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11420,
    "name": "SOUND_11420",
    "desc": "Wish I could dance like that",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11421,
    "name": "SOUND_11421",
    "desc": "You've done this before",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11422,
    "name": "SOUND_11422",
    "desc": "Yeahahaha man",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11423,
    "name": "SOUND_11423",
    "desc": "You're an awesome dancer!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11424,
    "name": "SOUND_11424",
    "desc": "Do you have a choreographer?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11425,
    "name": "SOUND_11425",
    "desc": "Lets totally sleep together",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11426,
    "name": "SOUND_11426",
    "desc": "Woah, this guy is better than me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11427,
    "name": "SOUND_11427",
    "desc": "Stay here, and marry me",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11428,
    "name": "SOUND_11428",
    "desc": "You must practice everyday",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11429,
    "name": "SOUND_11429",
    "desc": "I'm loving his moves out there",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11430,
    "name": "SOUND_11430",
    "desc": "You have some serious moves",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11431,
    "name": "SOUND_11431",
    "desc": "Yeah dude!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11432,
    "name": "SOUND_11432",
    "desc": "I wish i can move like that!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11433,
    "name": "SOUND_11433",
    "desc": "Such precision while sliding that left leg",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11434,
    "name": "SOUND_11434",
    "desc": "Clear the floor for this guy",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11435,
    "name": "SOUND_11435",
    "desc": "You have some beautiful moves.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11436,
    "name": "SOUND_11436",
    "desc": "Kiss the sky",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11437,
    "name": "SOUND_11437",
    "desc": "He doin' the bud-boogey!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11438,
    "name": "SOUND_11438",
    "desc": "Woah, nice moves!!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11439,
    "name": "SOUND_11439",
    "desc": "You're awesome!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11440,
    "name": "SOUND_11440",
    "desc": "You must have taken dance lessons",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11441,
    "name": "SOUND_11441",
    "desc": "Damn, you can dance!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11442,
    "name": "SOUND_11442",
    "desc": "How you dance so good?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11443,
    "name": "SOUND_11443",
    "desc": "Yeah hot stuff, that's right",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11444,
    "name": "SOUND_11444",
    "desc": "Lets continue this in my trailor",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11445,
    "name": "SOUND_11445",
    "desc": "Fancy footwork my friend",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11446,
    "name": "SOUND_11446",
    "desc": "Your the best in the place!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11447,
    "name": "SOUND_11447",
    "desc": "Wow, such an imaginitive moves!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11448,
    "name": "SOUND_11448",
    "desc": "I like his little gangster twists",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11449,
    "name": "SOUND_11449",
    "desc": "He's a dancer.....?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11450,
    "name": "SOUND_11450",
    "desc": "Hey, go on! Whooowooohoo",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11451,
    "name": "SOUND_11451",
    "desc": "You can take advantage of me, any time",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11452,
    "name": "SOUND_11452",
    "desc": "That boy looks so fine out there",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11453,
    "name": "SOUND_11453",
    "desc": "Some fancy moves for a city boy",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11454,
    "name": "SOUND_11454",
    "desc": "Wow! You must've taken lessons!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11455,
    "name": "SOUND_11455",
    "desc": "Skinny lizard, you're the second coming!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11600,
    "name": "SOUND_11600",
    "desc": "My seat aren't black and blue atleast",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11601,
    "name": "SOUND_11601",
    "desc": "Why do I have to be subjected to this?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11602,
    "name": "SOUND_11602",
    "desc": "How much do I have to pay you to leave?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11603,
    "name": "SOUND_11603",
    "desc": "I'm feeling embarrassed for you right now",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11604,
    "name": "SOUND_11604",
    "desc": "You look way estupido, holms!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11605,
    "name": "SOUND_11605",
    "desc": "Man you dance like a cripple on crack",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11606,
    "name": "SOUND_11606",
    "desc": "Have you thought about taking lessons?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11607,
    "name": "SOUND_11607",
    "desc": "Damn baby, relax, you too stiff",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11608,
    "name": "SOUND_11608",
    "desc": "Hey, you dance like my retarded cousin",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11609,
    "name": "SOUND_11609",
    "desc": "I guess gangstas don't like dancin', huh?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11610,
    "name": "SOUND_11610",
    "desc": "Females is laughing man",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11611,
    "name": "SOUND_11611",
    "desc": "Resty ain't the word for it",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11612,
    "name": "SOUND_11612",
    "desc": "Uh oh, you getting sweated man",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11613,
    "name": "SOUND_11613",
    "desc": "I'm sure you could take some classes.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11614,
    "name": "SOUND_11614",
    "desc": "Did you eat a bad lobster of something",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11615,
    "name": "SOUND_11615",
    "desc": "Dancing isn't for everyone you know?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11616,
    "name": "SOUND_11616",
    "desc": "Get a drink, relax",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11617,
    "name": "SOUND_11617",
    "desc": "I didn't know we were doing the chicken dance",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11618,
    "name": "SOUND_11618",
    "desc": "Aye, did someone shoot you in your ass?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11619,
    "name": "SOUND_11619",
    "desc": "Come on darling, shake it for me",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11620,
    "name": "SOUND_11620",
    "desc": "What kind of music do you think this is?",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 11621,
    "name": "SOUND_11621",
    "desc": "You look like your feet are fightin'",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11622,
    "name": "SOUND_11622",
    "desc": "I know your not doing that right now",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11623,
    "name": "SOUND_11623",
    "desc": "That's an interesting move!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11624,
    "name": "SOUND_11624",
    "desc": "I thought you were gonna be cool",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11625,
    "name": "SOUND_11625",
    "desc": "I'm not sure you're supposed to look like that",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11626,
    "name": "SOUND_11626",
    "desc": "Well, you didn't step on my feet",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11627,
    "name": "SOUND_11627",
    "desc": "That's ... an interesting move",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11628,
    "name": "SOUND_11628",
    "desc": "You dance like you're nerdioso",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11629,
    "name": "SOUND_11629",
    "desc": "God, look at him! Hahaha!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11630,
    "name": "SOUND_11630",
    "desc": "Ah, stop dancing please",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11631,
    "name": "SOUND_11631",
    "desc": "You didn't even trip me once",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11632,
    "name": "SOUND_11632",
    "desc": "You dance like you've got cooties",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11633,
    "name": "SOUND_11633",
    "desc": "I seen belt buckles more spritely",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11634,
    "name": "SOUND_11634",
    "desc": "You dance like a tacato",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11635,
    "name": "SOUND_11635",
    "desc": "Maybe you should take it easy",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11636,
    "name": "SOUND_11636",
    "desc": "Why don't you take a break for a while",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11637,
    "name": "SOUND_11637",
    "desc": "You look like you're in pain",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11638,
    "name": "SOUND_11638",
    "desc": "Come on, you can do it",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11639,
    "name": "SOUND_11639",
    "desc": "Your moves are awful!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11640,
    "name": "SOUND_11640",
    "desc": "Give it a little extra sweety",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11641,
    "name": "SOUND_11641",
    "desc": "Not bad for a new guy",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11642,
    "name": "SOUND_11642",
    "desc": "Have you eaten something off?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11643,
    "name": "SOUND_11643",
    "desc": "Those moves are dangerous",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11644,
    "name": "SOUND_11644",
    "desc": "Careful big guy",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11645,
    "name": "SOUND_11645",
    "desc": "Maybe you should sit this one out",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11646,
    "name": "SOUND_11646",
    "desc": "Do you know what a beat is?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11647,
    "name": "SOUND_11647",
    "desc": "Is that the best you got?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11648,
    "name": "SOUND_11648",
    "desc": "Duuuuuude",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11649,
    "name": "SOUND_11649",
    "desc": "You got two left feet!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11650,
    "name": "SOUND_11650",
    "desc": "Quit joking around",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11651,
    "name": "SOUND_11651",
    "desc": "Take some lessons",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11652,
    "name": "SOUND_11652",
    "desc": "At least you're moving.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11653,
    "name": "SOUND_11653",
    "desc": "What are you doing?!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11654,
    "name": "SOUND_11654",
    "desc": "Dude, you suck",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11655,
    "name": "SOUND_11655",
    "desc": "Not bad man",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11800,
    "name": "SOUND_11800",
    "desc": "You must have taken lessons",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11801,
    "name": "SOUND_11801",
    "desc": "You're not a bad dancer",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11802,
    "name": "SOUND_11802",
    "desc": "You've done this before",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11803,
    "name": "SOUND_11803",
    "desc": "Pretty good moves there buddy",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11804,
    "name": "SOUND_11804",
    "desc": "Try to learn us a little?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11805,
    "name": "SOUND_11805",
    "desc": "Checking you out man",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11806,
    "name": "SOUND_11806",
    "desc": "You're a pretty good dancer",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11807,
    "name": "SOUND_11807",
    "desc": "Those were some new moves.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11808,
    "name": "SOUND_11808",
    "desc": "Like, awsome",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11809,
    "name": "SOUND_11809",
    "desc": "Not bad. Not bad",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11810,
    "name": "SOUND_11810",
    "desc": "Do it baby, do it",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11811,
    "name": "SOUND_11811",
    "desc": "You're getting the hang of this honey",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11812,
    "name": "SOUND_11812",
    "desc": "Nice moves, man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11813,
    "name": "SOUND_11813",
    "desc": "Trying to give me some competition",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11814,
    "name": "SOUND_11814",
    "desc": "Oh that's right, you're getting there",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11815,
    "name": "SOUND_11815",
    "desc": "Well, you don't totally suck",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11816,
    "name": "SOUND_11816",
    "desc": "Nice moves, baby",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11817,
    "name": "SOUND_11817",
    "desc": "Ok! You're doing good",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11818,
    "name": "SOUND_11818",
    "desc": "Maybe I was wrong about you",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11819,
    "name": "SOUND_11819",
    "desc": "You're a dancing machine!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11820,
    "name": "SOUND_11820",
    "desc": "Hey, you're making me look bad",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11821,
    "name": "SOUND_11821",
    "desc": "Bet you get the ladies with those moves",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11822,
    "name": "SOUND_11822",
    "desc": "Bueno, now you're doing it right!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11823,
    "name": "SOUND_11823",
    "desc": "I have some friends that might be into that",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11824,
    "name": "SOUND_11824",
    "desc": "My pet lizard has better moves",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11825,
    "name": "SOUND_11825",
    "desc": "Were you like, putting me on before?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11826,
    "name": "SOUND_11826",
    "desc": "Hey, save the next dance for me",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11827,
    "name": "SOUND_11827",
    "desc": "You can practice with me some more if you want",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11828,
    "name": "SOUND_11828",
    "desc": ".................................. homey",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11829,
    "name": "SOUND_11829",
    "desc": "The music gets you high man",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 11830,
    "name": "SOUND_11830",
    "desc": "I see, I see. Do it homes!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11831,
    "name": "SOUND_11831",
    "desc": "Aight, now you bustin' moves",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11832,
    "name": "SOUND_11832",
    "desc": "Ok, you've got my attention, woo!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11833,
    "name": "SOUND_11833",
    "desc": "It's so cute you're trying so hard",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11834,
    "name": "SOUND_11834",
    "desc": "Hey, this bloke thinks he got something",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11835,
    "name": "SOUND_11835",
    "desc": "You still won't win any awards",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11836,
    "name": "SOUND_11836",
    "desc": "You sure as hell can't dance can you",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11837,
    "name": "SOUND_11837",
    "desc": "Hey, that's kinda cool",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11838,
    "name": "SOUND_11838",
    "desc": "Your starting to hold your own right here",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11839,
    "name": "SOUND_11839",
    "desc": ".... to relax a little",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11840,
    "name": "SOUND_11840",
    "desc": "Girl, he's looking kind of cute out there",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11841,
    "name": "SOUND_11841",
    "desc": "You're pretty good at this",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11842,
    "name": "SOUND_11842",
    "desc": "Not too shavy",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11843,
    "name": "SOUND_11843",
    "desc": "Hey, you're alright",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11844,
    "name": "SOUND_11844",
    "desc": "Magical",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11845,
    "name": "SOUND_11845",
    "desc": "Those moves ain't bad",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11846,
    "name": "SOUND_11846",
    "desc": "Can you keep it up though?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11847,
    "name": "SOUND_11847",
    "desc": "Show me what else you got",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11848,
    "name": "SOUND_11848",
    "desc": "You're pretty good at this",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11849,
    "name": "SOUND_11849",
    "desc": "Now you're getting it",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11850,
    "name": "SOUND_11850",
    "desc": "Shake it man",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11851,
    "name": "SOUND_11851",
    "desc": "Not too shaby",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11852,
    "name": "SOUND_11852",
    "desc": "Come on!! Dance!!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11853,
    "name": "SOUND_11853",
    "desc": "Keep it up then!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11854,
    "name": "SOUND_11854",
    "desc": "Pretty sweet",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 11855,
    "name": "SOUND_11855",
    "desc": "Not bad!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12000,
    "name": "SOUND_12000",
    "desc": "Could be better",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12001,
    "name": "SOUND_12001",
    "desc": "Are you OK?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12002,
    "name": "SOUND_12002",
    "desc": "We don't know each other",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12003,
    "name": "SOUND_12003",
    "desc": "Go away",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12004,
    "name": "SOUND_12004",
    "desc": "There goes the neighbourhood",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12005,
    "name": "SOUND_12005",
    "desc": "Are you kidding me?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12006,
    "name": "SOUND_12006",
    "desc": "What are you doing?!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12007,
    "name": "SOUND_12007",
    "desc": "Do you need a doctor?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12008,
    "name": "SOUND_12008",
    "desc": "Man with no rhythm",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12009,
    "name": "SOUND_12009",
    "desc": "You're making me sick",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12010,
    "name": "SOUND_12010",
    "desc": "Wow, you suck",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12011,
    "name": "SOUND_12011",
    "desc": "That's weak",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12012,
    "name": "SOUND_12012",
    "desc": "Do you have gas?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12013,
    "name": "SOUND_12013",
    "desc": "Get a life loser",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12014,
    "name": "SOUND_12014",
    "desc": "You blowing my high man",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12015,
    "name": "SOUND_12015",
    "desc": "He's having a heart attack!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12016,
    "name": "SOUND_12016",
    "desc": "Maybe you should take leasons",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12017,
    "name": "SOUND_12017",
    "desc": "That is disgusting",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12018,
    "name": "SOUND_12018",
    "desc": "What is wrong with you?!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12019,
    "name": "SOUND_12019",
    "desc": "Awful, awful, awful",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12020,
    "name": "SOUND_12020",
    "desc": "Don't hurt yourself",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12021,
    "name": "SOUND_12021",
    "desc": "My cat dances better than you",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12022,
    "name": "SOUND_12022",
    "desc": "You're not going to get any honeys that way",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12023,
    "name": "SOUND_12023",
    "desc": "Someone stole your soul",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12024,
    "name": "SOUND_12024",
    "desc": "You're the joke of the place.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12025,
    "name": "SOUND_12025",
    "desc": "I know talent buddy, and you ain't it",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12026,
    "name": "SOUND_12026",
    "desc": "Hahahaha",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12027,
    "name": "SOUND_12027",
    "desc": "That's not dancing, m-mm",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12028,
    "name": "SOUND_12028",
    "desc": "Ugghh, stop doing that",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12029,
    "name": "SOUND_12029",
    "desc": "Bad carma dude",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12030,
    "name": "SOUND_12030",
    "desc": "You're a really crappy dancer",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12031,
    "name": "SOUND_12031",
    "desc": "Lame moves man",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12032,
    "name": "SOUND_12032",
    "desc": "I've seen livestock with better moves",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12033,
    "name": "SOUND_12033",
    "desc": "Ugh, you know what dancing is, right?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12034,
    "name": "SOUND_12034",
    "desc": "Everyones laughing at you",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12035,
    "name": "SOUND_12035",
    "desc": "Stop doing that near me",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12036,
    "name": "SOUND_12036",
    "desc": "I seen ... dance better",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12037,
    "name": "SOUND_12037",
    "desc": "Call an ambulance, he's having a seizure",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12038,
    "name": "SOUND_12038",
    "desc": "No cuchy for your ass tonight!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12039,
    "name": "SOUND_12039",
    "desc": "This guys about to blow chunks",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12040,
    "name": "SOUND_12040",
    "desc": "Maybe you should rest for a bit",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12041,
    "name": "SOUND_12041",
    "desc": "Higher dude, higher",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12042,
    "name": "SOUND_12042",
    "desc": "You dance with a hand up your ass",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12043,
    "name": "SOUND_12043",
    "desc": "Hey! Your taking up valuble space",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12044,
    "name": "SOUND_12044",
    "desc": "You dance like my retarded cousin",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12045,
    "name": "SOUND_12045",
    "desc": "Stop it, you're embarrassing us all",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12046,
    "name": "SOUND_12046",
    "desc": "You like you're having a seizure.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12047,
    "name": "SOUND_12047",
    "desc": "That was the funniest I have ever seen",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12048,
    "name": "SOUND_12048",
    "desc": "You need a refund on your blackness",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12049,
    "name": "SOUND_12049",
    "desc": "You on sherm homey, what's wrong?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12050,
    "name": "SOUND_12050",
    "desc": "Hey go home and practice infront of a mirror",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12051,
    "name": "SOUND_12051",
    "desc": "Is your pingo small too baby?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12052,
    "name": "SOUND_12052",
    "desc": "You look like you're spreading manure",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12053,
    "name": "SOUND_12053",
    "desc": "I almost wanna call an ambulance",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12054,
    "name": "SOUND_12054",
    "desc": "Are you like, scratching yourself, or what?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12055,
    "name": "SOUND_12055",
    "desc": "And the point of this is?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12200,
    "name": "SOUND_12200",
    "desc": "Container door opens",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 12201,
    "name": "SOUND_12201",
    "desc": "Gate being opened",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12400,
    "name": "SOUND_12400",
    "desc": "Can I get your sneakers?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12401,
    "name": "SOUND_12401",
    "desc": "You won't be needing those fancy clothes.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12402,
    "name": "SOUND_12402",
    "desc": "Don't take your clothes with y'!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12403,
    "name": "SOUND_12403",
    "desc": "A little more action!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12404,
    "name": "SOUND_12404",
    "desc": "The show must go on!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12405,
    "name": "SOUND_12405",
    "desc": "He's gonna be pavement pizza!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12406,
    "name": "SOUND_12406",
    "desc": "Holy Moley, that was close!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12407,
    "name": "SOUND_12407",
    "desc": "Thank you very much!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12408,
    "name": "SOUND_12408",
    "desc": "Ohh.. you got him!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12409,
    "name": "SOUND_12409",
    "desc": "Jump! Look what dying did for my career!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12410,
    "name": "SOUND_12410",
    "desc": "JUMP! You fool!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12411,
    "name": "SOUND_12411",
    "desc": "Jump! It'll save your career!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12600,
    "name": "SOUND_12600",
    "desc": "Cement pour",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12601,
    "name": "SOUND_12601",
    "desc": "Smash portacabin",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12602,
    "name": "SOUND_12602",
    "desc": "!Smash portacabin",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12603,
    "name": "SOUND_12603",
    "desc": "Smash portacabin",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12604,
    "name": "SOUND_12604",
    "desc": "Smash portacabin",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12605,
    "name": "SOUND_12605",
    "desc": "Toilet flushing",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12800,
    "name": "SOUND_12800",
    "desc": "Alright, Carl, lets see a little of that initiative!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12801,
    "name": "SOUND_12801",
    "desc": "What the- you in here too?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12802,
    "name": "SOUND_12802",
    "desc": "Doesn't matter where I am",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12803,
    "name": "SOUND_12803",
    "desc": "just that Ive been watching you for a while.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12804,
    "name": "SOUND_12804",
    "desc": "You're a stalker or some shit?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12805,
    "name": "SOUND_12805",
    "desc": "Oooh, when the mood hits me.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12806,
    "name": "SOUND_12806",
    "desc": "Now lets just pay attention to the job at hand, shall we?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12807,
    "name": "SOUND_12807",
    "desc": "Why? Why am I doing this?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12808,
    "name": "SOUND_12808",
    "desc": "Because I can help you and your brother.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12809,
    "name": "SOUND_12809",
    "desc": "What? Why? How you know about my brother?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12810,
    "name": "SOUND_12810",
    "desc": "Hu-hu-how do you know my brother? Youre beginning to sound like a broken record, Carl.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12811,
    "name": "SOUND_12811",
    "desc": "Look, Im gonna leave you in peace to just get the job done the best you can",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12812,
    "name": "SOUND_12812",
    "desc": "and if you make the grade, maybe, just maybe,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12813,
    "name": "SOUND_12813",
    "desc": "How can I help you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12814,
    "name": "SOUND_12814",
    "desc": "Hello?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12815,
    "name": "SOUND_12815",
    "desc": "Hey, asshole!.... Shit....",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12816,
    "name": "SOUND_12816",
    "desc": "We can help each other.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12817,
    "name": "SOUND_12817",
    "desc": "Here's the deal, this is all about speed and commitment.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12818,
    "name": "SOUND_12818",
    "desc": "You got a GPS in the cab. Get to each set of map coordinates as quick as you can.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12819,
    "name": "SOUND_12819",
    "desc": "Make it to all the coordinates then get the truck back here.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12820,
    "name": "SOUND_12820",
    "desc": "Lose the truck and you fail.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12821,
    "name": "SOUND_12821",
    "desc": "First, what's a GPS? Second, fail what?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12822,
    "name": "SOUND_12822",
    "desc": "Sorry, need-to-know basis only!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12823,
    "name": "SOUND_12823",
    "desc": "Oh, one more thing, this baby's got four-wheel steering instead of a handbrake.",
    "cat": "Cassino e Jogos"
  },
  {
    "id": 12824,
    "name": "SOUND_12824",
    "desc": "Good luck!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12825,
    "name": "SOUND_12825",
    "desc": "And third, who the fuck are you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12826,
    "name": "SOUND_12826",
    "desc": "OK, the boss was right about you!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12827,
    "name": "SOUND_12827",
    "desc": "Not bad at all, I'm semi-hard.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12828,
    "name": "SOUND_12828",
    "desc": "Boy, by the skin of your teeth.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12829,
    "name": "SOUND_12829",
    "desc": "The boss will be in touch.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12830,
    "name": "SOUND_12830",
    "desc": "Sorry pal, you're not what the boss is looking for.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12831,
    "name": "SOUND_12831",
    "desc": "Luck.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 12832,
    "name": "SOUND_12832",
    "desc": "Pretty good for a ghetto boy...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13000,
    "name": "SOUND_13000",
    "desc": "I got here as fast as I could, CJ.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13001,
    "name": "SOUND_13001",
    "desc": "Yeah, you sure did. How you know I needed help?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13002,
    "name": "SOUND_13002",
    "desc": "Man, you losing it, holmes.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13003,
    "name": "SOUND_13003",
    "desc": "You phoned me a half an hour ago, man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13004,
    "name": "SOUND_13004",
    "desc": "I did? I mean, oh yeah, I did.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13005,
    "name": "SOUND_13005",
    "desc": "Sorry man, I got a whole lot on my mind.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13006,
    "name": "SOUND_13006",
    "desc": "We need to 'jack a truck on the freeway.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13007,
    "name": "SOUND_13007",
    "desc": "It's headed to San Fierro.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13008,
    "name": "SOUND_13008",
    "desc": "We can get on the freeway here, holmes.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13009,
    "name": "SOUND_13009",
    "desc": "Man, you crazy, this is the rail bridge!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13010,
    "name": "SOUND_13010",
    "desc": "The road bridge is over there!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13011,
    "name": "SOUND_13011",
    "desc": "We jacking a train, holmes?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13012,
    "name": "SOUND_13012",
    "desc": "You missed the turnpike, holmes!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13013,
    "name": "SOUND_13013",
    "desc": "The freeway's back there!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13014,
    "name": "SOUND_13014",
    "desc": "Dude, you missed the turn!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13015,
    "name": "SOUND_13015",
    "desc": "There's the rig up ahead!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13016,
    "name": "SOUND_13016",
    "desc": "What's the plan?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13017,
    "name": "SOUND_13017",
    "desc": "I'm gonna pull alongside and you're gonna hop on board!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13018,
    "name": "SOUND_13018",
    "desc": "Oh shit, you did not mention that on the phone.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13019,
    "name": "SOUND_13019",
    "desc": "It'll be a walk in the park!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13020,
    "name": "SOUND_13020",
    "desc": "Tell Kendl I love her!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13021,
    "name": "SOUND_13021",
    "desc": "Closer, CJ, closer!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13022,
    "name": "SOUND_13022",
    "desc": "Just a little closer!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13023,
    "name": "SOUND_13023",
    "desc": "What do you think, I'm a Mexican jumping bean? Closer!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13024,
    "name": "SOUND_13024",
    "desc": "Hold her steady, CJ!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13025,
    "name": "SOUND_13025",
    "desc": "Steady... steady!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13026,
    "name": "SOUND_13026",
    "desc": "Just let me get my balance!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13027,
    "name": "SOUND_13027",
    "desc": "Speed up, CJ!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13028,
    "name": "SOUND_13028",
    "desc": "Match the truck's speed!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13029,
    "name": "SOUND_13029",
    "desc": "Keep level, CJ, keep it level!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13030,
    "name": "SOUND_13030",
    "desc": "Slow down, CJ!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13031,
    "name": "SOUND_13031",
    "desc": "Just a bit slower!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13032,
    "name": "SOUND_13032",
    "desc": "Calm it down, CJ, you're too fast!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13033,
    "name": "SOUND_13033",
    "desc": "OK, CJ, let's get this rig back to the garage!",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 13034,
    "name": "SOUND_13034",
    "desc": "Where we gonna take this thing?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13035,
    "name": "SOUND_13035",
    "desc": "Theres a hauling firm over in Whetstone county. We can take it there and get some money for it.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13036,
    "name": "SOUND_13036",
    "desc": "We can take it there and get some cash for it",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13037,
    "name": "SOUND_13037",
    "desc": "Ok, well drop me off and I'll make my own way back to the garage.",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 13038,
    "name": "SOUND_13038",
    "desc": "See you later, holmes!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13200,
    "name": "SOUND_13200",
    "desc": "Jesus, what took you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13201,
    "name": "SOUND_13201",
    "desc": "Toreno! Where you at?!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13202,
    "name": "SOUND_13202",
    "desc": "Miles away. No time for niceties, kid.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13203,
    "name": "SOUND_13203",
    "desc": "Choose a vehicle, grab the equipment I've provided,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13204,
    "name": "SOUND_13204",
    "desc": "get to that drop zone, and wait for that package",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13205,
    "name": "SOUND_13205",
    "desc": "That's our cargo arriving now!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13206,
    "name": "SOUND_13206",
    "desc": "Jesus! Will you stop doing that?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13207,
    "name": "SOUND_13207",
    "desc": "Hold up.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13208,
    "name": "SOUND_13208",
    "desc": "Shit, pilot says he's got trouble,",
    "cat": "Falas e Vozes"
  },
  {
    "id": 13209,
    "name": "SOUND_13209",
    "desc": "two agency choppers coming in on an intercept.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13210,
    "name": "SOUND_13210",
    "desc": "Can you see them?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13211,
    "name": "SOUND_13211",
    "desc": "Yeah.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13212,
    "name": "SOUND_13212",
    "desc": "Shoot 'em down. Protect the cargo at all costs!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13213,
    "name": "SOUND_13213",
    "desc": "OK, get the package back to Las Brujas.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13214,
    "name": "SOUND_13214",
    "desc": "Where are you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13215,
    "name": "SOUND_13215",
    "desc": "You givin' me the heebie jeebies, man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13216,
    "name": "SOUND_13216",
    "desc": "Carl, I will ALWAYS be watching...or listening...or both.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13400,
    "name": "SOUND_13400",
    "desc": "Hey Carl.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13401,
    "name": "SOUND_13401",
    "desc": "You gotta stay nice and low on your approach or you'll pop up on the radar.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13402,
    "name": "SOUND_13402",
    "desc": "Use the canyon as cover.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13403,
    "name": "SOUND_13403",
    "desc": "You sure this thing's safe, I can see daylight through the floor?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13404,
    "name": "SOUND_13404",
    "desc": "Hey, in that thing you look like an enthusiast.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13405,
    "name": "SOUND_13405",
    "desc": "The US Air Force is less likely to shoot you down.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13406,
    "name": "SOUND_13406",
    "desc": "Cool. What's the problem then?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13407,
    "name": "SOUND_13407",
    "desc": "I said less likely.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13408,
    "name": "SOUND_13408",
    "desc": "If you did as many amphetamines as these guys do, you'd be lucky not to shoot anything that moves.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13409,
    "name": "SOUND_13409",
    "desc": "Aw, shit.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13410,
    "name": "SOUND_13410",
    "desc": "Hey, just stay low and you'll be fine.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13411,
    "name": "SOUND_13411",
    "desc": "You're flying too high!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13412,
    "name": "SOUND_13412",
    "desc": "Get below the radar!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13413,
    "name": "SOUND_13413",
    "desc": "Stay low, Carl!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13414,
    "name": "SOUND_13414",
    "desc": "Nap of the Earth, Carl, nap of the Earth!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13415,
    "name": "SOUND_13415",
    "desc": "Shit, you've been spotted!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13416,
    "name": "SOUND_13416",
    "desc": "What that mean?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13417,
    "name": "SOUND_13417",
    "desc": "it means they'll send something in the area to go check you out!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13418,
    "name": "SOUND_13418",
    "desc": "Watch your six!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13419,
    "name": "SOUND_13419",
    "desc": "Nice going Carl, really, you did good kid",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13600,
    "name": "SOUND_13600",
    "desc": "Please, no more violence! Take my pass card and go!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13601,
    "name": "SOUND_13601",
    "desc": "Possible intruder sighted. Condition Blue! Set searchlights to tracking mode!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13602,
    "name": "SOUND_13602",
    "desc": "Code Blue! Set the Searchlight perimeter to tracking mode!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13603,
    "name": "SOUND_13603",
    "desc": "This installation is at Condition Blue! Switching searchlights to tracking mode!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13604,
    "name": "SOUND_13604",
    "desc": "Code Blue! Searchlights set to tracking mode!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13605,
    "name": "SOUND_13605",
    "desc": "Sighting unconfirmed. Stand down from Condition Blue!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13606,
    "name": "SOUND_13606",
    "desc": "No further sign of intrusion. Stand down, repeat, stand down!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13607,
    "name": "SOUND_13607",
    "desc": "Perimeter is secure. Standing down from Code Blue!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13608,
    "name": "SOUND_13608",
    "desc": "No perimeter breach confirmed. Stand down from Blue Alert!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13609,
    "name": "SOUND_13609",
    "desc": "Code Red! Sighting confirmed! All personnel shoot to kill!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13610,
    "name": "SOUND_13610",
    "desc": "Code red! Repeat, code red! Intruder alert!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13611,
    "name": "SOUND_13611",
    "desc": "This is a code red! All personnel adopt intruder protocols!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13612,
    "name": "SOUND_13612",
    "desc": "Intruder alert! Condition Red! Repeat: Condition Red!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13613,
    "name": "SOUND_13613",
    "desc": "Set blast doors and control tower to Lock Down!",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 13614,
    "name": "SOUND_13614",
    "desc": "This facility is in Lock Down!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13615,
    "name": "SOUND_13615",
    "desc": "Secure blast doors on control tower",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 13616,
    "name": "SOUND_13616",
    "desc": "Lock down protocols initiated! Blast doors and security tower isolated!",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 13617,
    "name": "SOUND_13617",
    "desc": "All towers are cleared to use lethal force, repeat, lethal force!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13618,
    "name": "SOUND_13618",
    "desc": "All towers shoot on sight, repeat, shoot on sight!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13619,
    "name": "SOUND_13619",
    "desc": "Installation personnel please be aware we are at Condition Blue. This is not a drill!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13620,
    "name": "SOUND_13620",
    "desc": "Installation personnel please be aware we are at Condition Red. This is not a drill!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13621,
    "name": "SOUND_13621",
    "desc": "This facility has been breached, all security personnel head to the research labs now!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13622,
    "name": "SOUND_13622",
    "desc": "All personnel wishing to go to Shazam tonight, please inform reception at your earliest convenience",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13623,
    "name": "SOUND_13623",
    "desc": "Personnel are reminded that running in corridors while holding scissors is not permitted",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13624,
    "name": "SOUND_13624",
    "desc": "Tonights menu is posted in the canteen, barf bags can be ordered from human resources",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13625,
    "name": "SOUND_13625",
    "desc": "Personnel are reminded that the downloading of pornography is strictly prohibited",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13626,
    "name": "SOUND_13626",
    "desc": "The composites lab would like to remind diagnostics that that fridge is off limits to diagnostics staff",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13627,
    "name": "SOUND_13627",
    "desc": "Can personal please make sure that they shut all the windows before they leave tonight",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13628,
    "name": "SOUND_13628",
    "desc": "The Globular Deli have arrived in the Canteen.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13629,
    "name": "SOUND_13629",
    "desc": "The Sprunk machine has now been refilled",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13630,
    "name": "SOUND_13630",
    "desc": "Diagnostics would like to point out that they know that the composites lab stole their copy last weekend",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13631,
    "name": "SOUND_13631",
    "desc": "Could whoever stole composite glass mugs please return them",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13632,
    "name": "SOUND_13632",
    "desc": "Could the owner of the alien culture in the diagnostics lab fridge kindly remove it",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13633,
    "name": "SOUND_13633",
    "desc": "Personnel found stealing alien technology will not be invited on the next staff night out",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13634,
    "name": "SOUND_13634",
    "desc": "Could all personal remember that the quarantine breach alarm test has now been moved to Monday morning",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 13635,
    "name": "SOUND_13635",
    "desc": "Has anybody seen my screwdriver, I think I left it in the composites lab",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13636,
    "name": "SOUND_13636",
    "desc": "Code red, code red!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13637,
    "name": "SOUND_13637",
    "desc": "Intruder has penetrated the project! All military personnel to the launch bay IMMEDIATELY!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13638,
    "name": "SOUND_13638",
    "desc": "Intruder is stealing the jet pack! All military personnel outside and fire at will!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13639,
    "name": "SOUND_13639",
    "desc": "Take him out! That's a $60,000,000 project!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13640,
    "name": "SOUND_13640",
    "desc": "Get the General Mills on the line!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13641,
    "name": "SOUND_13641",
    "desc": "(???) I want anything airbourne after that bastard",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13642,
    "name": "SOUND_13642",
    "desc": "Hey, Truth, do we have a plan here?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13643,
    "name": "SOUND_13643",
    "desc": "HEY! Hold up, dude!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13644,
    "name": "SOUND_13644",
    "desc": "Hey, here you go. You better stash it somewhere fast!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13645,
    "name": "SOUND_13645",
    "desc": "Hey, wait a...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13646,
    "name": "SOUND_13646",
    "desc": "Ahh, was it too much to ask to get a lift into town?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13800,
    "name": "SOUND_13800",
    "desc": "Oh fuck, my guns!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13801,
    "name": "SOUND_13801",
    "desc": "Oh man, my guns!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13802,
    "name": "SOUND_13802",
    "desc": "Ah, what's Toreno up to now?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 13803,
    "name": "SOUND_13803",
    "desc": "I'm feeling a little exposed here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14000,
    "name": "SOUND_14000",
    "desc": "Stay back!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14001,
    "name": "SOUND_14001",
    "desc": "Dont think about grabbing me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14002,
    "name": "SOUND_14002",
    "desc": "I warn y'all, I'll jump!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14003,
    "name": "SOUND_14003",
    "desc": "I ain't kidding",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14004,
    "name": "SOUND_14004",
    "desc": "I got gold records, what you got?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14005,
    "name": "SOUND_14005",
    "desc": "Give me some more liquor!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14006,
    "name": "SOUND_14006",
    "desc": "Brandy, Goddamn it, get the brandy!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14007,
    "name": "SOUND_14007",
    "desc": "Ill take all yall down with me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14008,
    "name": "SOUND_14008",
    "desc": "I aint kidding! Im real serious, see!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14009,
    "name": "SOUND_14009",
    "desc": "Just drive, come on, drive!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14010,
    "name": "SOUND_14010",
    "desc": "This is it! This is the end! I'm out!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14011,
    "name": "SOUND_14011",
    "desc": "It's time, I'm going to do it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14012,
    "name": "SOUND_14012",
    "desc": "Goodbye cruel world!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14013,
    "name": "SOUND_14013",
    "desc": "Time to take your sorry ass to rehab you drunken idiot.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14014,
    "name": "SOUND_14014",
    "desc": "Am I still the top rapper, dude?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14015,
    "name": "SOUND_14015",
    "desc": "Best there ever was.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14016,
    "name": "SOUND_14016",
    "desc": "Second to nobody else, homeboy.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14017,
    "name": "SOUND_14017",
    "desc": "And the name's Carl.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14018,
    "name": "SOUND_14018",
    "desc": "Thanks, Carl...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14019,
    "name": "SOUND_14019",
    "desc": "Oh, man, I'm gonna die!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14020,
    "name": "SOUND_14020",
    "desc": "I'm slipping away, Carl!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14021,
    "name": "SOUND_14021",
    "desc": "Momma, is that you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14022,
    "name": "SOUND_14022",
    "desc": "Brandy! I need more brandy...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14023,
    "name": "SOUND_14023",
    "desc": "I'm a ghetto superstar!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14024,
    "name": "SOUND_14024",
    "desc": "Loc! LOC! I'm gonna kill you!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14025,
    "name": "SOUND_14025",
    "desc": "Wha-? Where am I? Why's it so dark?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14026,
    "name": "SOUND_14026",
    "desc": "I'm cold, Carl - damn, man, I'm cold!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14027,
    "name": "SOUND_14027",
    "desc": "OG Loc, you're a dead man. Dead, man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14028,
    "name": "SOUND_14028",
    "desc": "Where're all my bitches..? My bitches!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14029,
    "name": "SOUND_14029",
    "desc": "It's the end! Oh, you non-driving asshole... Uurruuggh...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14030,
    "name": "SOUND_14030",
    "desc": "Uuaaghh, you tried, man... Ooh, ugh... but it wasn't good enough ... I'm out.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14031,
    "name": "SOUND_14031",
    "desc": "Momma, 's'at you? Uugh!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14032,
    "name": "SOUND_14032",
    "desc": "Hey, get yourself straightened out,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14033,
    "name": "SOUND_14033",
    "desc": "then we can get you back in the studio.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14034,
    "name": "SOUND_14034",
    "desc": "Carl.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14035,
    "name": "SOUND_14035",
    "desc": "What?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14036,
    "name": "SOUND_14036",
    "desc": "When I get clean I'm gonna need a new manager.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14037,
    "name": "SOUND_14037",
    "desc": "Thought I might look you up.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14038,
    "name": "SOUND_14038",
    "desc": "You do that, homie.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14039,
    "name": "SOUND_14039",
    "desc": "Hey, that's my truck!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14040,
    "name": "SOUND_14040",
    "desc": "What the fuck you doing?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14041,
    "name": "SOUND_14041",
    "desc": "Hey! HEY!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14200,
    "name": "SOUND_14200",
    "desc": "Pissing",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14400,
    "name": "SOUND_14400",
    "desc": "Video game sound effect",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14401,
    "name": "SOUND_14401",
    "desc": "Explosion sound?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14402,
    "name": "SOUND_14402",
    "desc": "Explosion",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14403,
    "name": "SOUND_14403",
    "desc": "Video game sound, like a plane flying by",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14404,
    "name": "SOUND_14404",
    "desc": "Soft knock noise",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14405,
    "name": "SOUND_14405",
    "desc": "Gulp sound",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14406,
    "name": "SOUND_14406",
    "desc": "Teleportation sound effect",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14407,
    "name": "SOUND_14407",
    "desc": "Teleportation sound",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14408,
    "name": "SOUND_14408",
    "desc": "Video game sound",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14409,
    "name": "SOUND_14409",
    "desc": "Weird sound effect",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14410,
    "name": "SOUND_14410",
    "desc": "Weird sound effect",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14600,
    "name": "SOUND_14600",
    "desc": "Wall Smash/Wall Breach/Wall Break",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 14800,
    "name": "SOUND_14800",
    "desc": "Detonation Siren",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15000,
    "name": "SOUND_15000",
    "desc": "Dude, hurry the hell up!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15001,
    "name": "SOUND_15001",
    "desc": "Get a move on dude!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15002,
    "name": "SOUND_15002",
    "desc": "We gotta go buddy, come on!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15003,
    "name": "SOUND_15003",
    "desc": "Ok, ok!!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15004,
    "name": "SOUND_15004",
    "desc": "Aright, aright!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15005,
    "name": "SOUND_15005",
    "desc": "Im almost done!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15006,
    "name": "SOUND_15006",
    "desc": "Lets get out of here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15007,
    "name": "SOUND_15007",
    "desc": "Come on lets go!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15008,
    "name": "SOUND_15008",
    "desc": "Leave it, we gotta go!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15009,
    "name": "SOUND_15009",
    "desc": "Hey, yo dude, hurry up!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15010,
    "name": "SOUND_15010",
    "desc": "We got to get a move on, man.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15011,
    "name": "SOUND_15011",
    "desc": "We gotta go, come on man, move it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15012,
    "name": "SOUND_15012",
    "desc": "OK, OK!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15013,
    "name": "SOUND_15013",
    "desc": "Almost there, dude!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15014,
    "name": "SOUND_15014",
    "desc": "Yo, Im almost done!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15015,
    "name": "SOUND_15015",
    "desc": "OK, lets get out of here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15016,
    "name": "SOUND_15016",
    "desc": "Were moving, NOW!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15017,
    "name": "SOUND_15017",
    "desc": "Dude, hurry the fuck up!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15018,
    "name": "SOUND_15018",
    "desc": "Get a move on, man.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15019,
    "name": "SOUND_15019",
    "desc": "We gotta go, come on, move it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15020,
    "name": "SOUND_15020",
    "desc": "OK, OK!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15021,
    "name": "SOUND_15021",
    "desc": "Im almost there, man.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15022,
    "name": "SOUND_15022",
    "desc": "Almost done!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15023,
    "name": "SOUND_15023",
    "desc": "OK, lets get out of here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15024,
    "name": "SOUND_15024",
    "desc": "Were moving, right now!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15025,
    "name": "SOUND_15025",
    "desc": "Leave it, we gotta go!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15026,
    "name": "SOUND_15026",
    "desc": "What do you mean its been ambushed?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15027,
    "name": "SOUND_15027",
    "desc": "We can't just go after T Bone, it could be a DEA trap",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15028,
    "name": "SOUND_15028",
    "desc": "CJ, get your ass over there and rescue the situation.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15200,
    "name": "SOUND_15200",
    "desc": "He says he can hear seagulls!",
    "cat": "Falas e Vozes"
  },
  {
    "id": 15201,
    "name": "SOUND_15201",
    "desc": "Mike can hear gulls!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15202,
    "name": "SOUND_15202",
    "desc": "He can hear heavy machinery!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15203,
    "name": "SOUND_15203",
    "desc": "He says it's busy, like a freight depot or something.",
    "cat": "Falas e Vozes"
  },
  {
    "id": 15204,
    "name": "SOUND_15204",
    "desc": "Mike can hear a harbor bell!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15205,
    "name": "SOUND_15205",
    "desc": "He says he can hear a truck reversing.",
    "cat": "Falas e Vozes"
  },
  {
    "id": 15206,
    "name": "SOUND_15206",
    "desc": "Sounds like a ships horn!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15207,
    "name": "SOUND_15207",
    "desc": "Mike can hear aircraft taking off and landing.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15208,
    "name": "SOUND_15208",
    "desc": "Shit, he says they stopped, then he heard gunfire.",
    "cat": "Falas e Vozes"
  },
  {
    "id": 15209,
    "name": "SOUND_15209",
    "desc": "He thinks they just shot there way through a security gate!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15210,
    "name": "SOUND_15210",
    "desc": "Seagulls? Shit, that could be anywhere in this town.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15211,
    "name": "SOUND_15211",
    "desc": "Seagulls and heavy machinery? What is that? A building site, or a landfill or something?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15212,
    "name": "SOUND_15212",
    "desc": "Freight? Aw, they must be down at the docks!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15213,
    "name": "SOUND_15213",
    "desc": "They don't have heavy security at the docks,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15214,
    "name": "SOUND_15214",
    "desc": "but they do at the airport's freight depot!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15215,
    "name": "SOUND_15215",
    "desc": "There's a building site in Doherty!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15216,
    "name": "SOUND_15216",
    "desc": "Get to the docks in Easter Basin!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15217,
    "name": "SOUND_15217",
    "desc": "To the airport, rapido!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15218,
    "name": "SOUND_15218",
    "desc": "Gotta make this quick, Mike doesn't got much time on his battery left!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15219,
    "name": "SOUND_15219",
    "desc": "Mike's cellphone battery's running low!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15220,
    "name": "SOUND_15220",
    "desc": "Mike's cellphone is nearly dead!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15221,
    "name": "SOUND_15221",
    "desc": "Shit, Mike's phone's dead!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15222,
    "name": "SOUND_15222",
    "desc": "Hey don't worry, Mike, we're nearly there!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15223,
    "name": "SOUND_15223",
    "desc": "Hey, we'll be there in a minute, Mike!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15224,
    "name": "SOUND_15224",
    "desc": "Hey, just hang in there, Mike, help is on the way!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15225,
    "name": "SOUND_15225",
    "desc": "There's the gate!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15226,
    "name": "SOUND_15226",
    "desc": "And some dead security guards!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15227,
    "name": "SOUND_15227",
    "desc": "Ey, this is the place, keep your eyes peeled for that van!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15228,
    "name": "SOUND_15228",
    "desc": "OK, the tags should work now, holmes.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15229,
    "name": "SOUND_15229",
    "desc": "Tag? What the hell is a tag?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15230,
    "name": "SOUND_15230",
    "desc": "After that last bit of trouble, Mike hid the transponder in the white.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15231,
    "name": "SOUND_15231",
    "desc": "We was going to follow it to the gang, but something must have fucked up",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15232,
    "name": "SOUND_15232",
    "desc": "and now we gotta use it to find that van and rescue Mike!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15233,
    "name": "SOUND_15233",
    "desc": "How it work?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15234,
    "name": "SOUND_15234",
    "desc": "Simple. Closer we get, the stronger the signal.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15235,
    "name": "SOUND_15235",
    "desc": "That's the van!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15236,
    "name": "SOUND_15236",
    "desc": "Over there, man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15237,
    "name": "SOUND_15237",
    "desc": "There it is!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15238,
    "name": "SOUND_15238",
    "desc": "Shit, there they are!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15239,
    "name": "SOUND_15239",
    "desc": "We need a bigger car, come on, move it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15240,
    "name": "SOUND_15240",
    "desc": "Too small, come on, think!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15241,
    "name": "SOUND_15241",
    "desc": "We're not going to fit in that, think on your feet, kid!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15242,
    "name": "SOUND_15242",
    "desc": "How long you been working for Jizzy, I haven't seen you before?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15243,
    "name": "SOUND_15243",
    "desc": "Just got into town last week. I done a couple jobs here and there.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15244,
    "name": "SOUND_15244",
    "desc": "Just got into town, huh? Where were you before that?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15245,
    "name": "SOUND_15245",
    "desc": "Hey, what is this?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15246,
    "name": "SOUND_15246",
    "desc": "Man, just answer the fucking question.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15247,
    "name": "SOUND_15247",
    "desc": "Look man, chill. I been in Los Santos with my family, a'ight?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15248,
    "name": "SOUND_15248",
    "desc": "Gimme his wallet.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15249,
    "name": "SOUND_15249",
    "desc": "What? Hey, get off!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15250,
    "name": "SOUND_15250",
    "desc": "Quit struggling and concentrate on the road!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15251,
    "name": "SOUND_15251",
    "desc": "Here y'go, Mike.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15252,
    "name": "SOUND_15252",
    "desc": "Carl Johnson, huh?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15253,
    "name": "SOUND_15253",
    "desc": "Alright. I've seen enough. Here.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15254,
    "name": "SOUND_15254",
    "desc": "Hey, was a dub in there. Better still be there when I check it.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15255,
    "name": "SOUND_15255",
    "desc": "Shut the fuck up.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15256,
    "name": "SOUND_15256",
    "desc": "Or what? You gonna hit me with your purse?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15257,
    "name": "SOUND_15257",
    "desc": "OK, Carl Johnson, you did good today.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15258,
    "name": "SOUND_15258",
    "desc": "Man, now shake the spot, we got shit to talk about.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15400,
    "name": "SOUND_15400",
    "desc": "You won't get far!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15401,
    "name": "SOUND_15401",
    "desc": "Stop that car!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15402,
    "name": "SOUND_15402",
    "desc": "He's getting away!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15403,
    "name": "SOUND_15403",
    "desc": "Stop that car at all costs!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15404,
    "name": "SOUND_15404",
    "desc": "Get after him!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15405,
    "name": "SOUND_15405",
    "desc": "Dont just stand there, get that car!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15406,
    "name": "SOUND_15406",
    "desc": "Give up the car and we'll spare you!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15407,
    "name": "SOUND_15407",
    "desc": "That's our property!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15408,
    "name": "SOUND_15408",
    "desc": "After him, no quarter!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15600,
    "name": "SOUND_15600",
    "desc": "It's decoy, back to Chinatown!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15601,
    "name": "SOUND_15601",
    "desc": "This car is a decoy!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15602,
    "name": "SOUND_15602",
    "desc": "Come on boys, take the bait...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15603,
    "name": "SOUND_15603",
    "desc": "Ah, look like these punks about to make they move!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15800,
    "name": "SOUND_15800",
    "desc": "This is the Los Santos Police Department; Stay where you all are!",
    "cat": "Rádio Policial"
  },
  {
    "id": 15801,
    "name": "SOUND_15801",
    "desc": "Freeze or we will open fire!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15802,
    "name": "SOUND_15802",
    "desc": "Go! Go! Go!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15803,
    "name": "SOUND_15803",
    "desc": "Get into positions!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15804,
    "name": "SOUND_15804",
    "desc": "Await backup!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15805,
    "name": "SOUND_15805",
    "desc": "Go Go Go!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15806,
    "name": "SOUND_15806",
    "desc": "Im taking fire, cover me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15807,
    "name": "SOUND_15807",
    "desc": "Get some suppressing fire in there!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15808,
    "name": "SOUND_15808",
    "desc": "Gimme some fucking covering fire!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15809,
    "name": "SOUND_15809",
    "desc": "Surprise, homeboy!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15810,
    "name": "SOUND_15810",
    "desc": "Heads up, brother!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15811,
    "name": "SOUND_15811",
    "desc": "This is Buzzard 1, we are taking ground fire!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15812,
    "name": "SOUND_15812",
    "desc": "Four bangers in blue 4door heading back into South Central.",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 15813,
    "name": "SOUND_15813",
    "desc": "Block him!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15814,
    "name": "SOUND_15814",
    "desc": "Cut him up!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15815,
    "name": "SOUND_15815",
    "desc": "Get in front!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15816,
    "name": "SOUND_15816",
    "desc": "All units Rock'n'roll!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15817,
    "name": "SOUND_15817",
    "desc": "Holy shit! Echo unit is down!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15818,
    "name": "SOUND_15818",
    "desc": "Unit down, repeat, unit down!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15819,
    "name": "SOUND_15819",
    "desc": "Mayday, mayday! Buzzard 1 is going down!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15820,
    "name": "SOUND_15820",
    "desc": "Blue 4-door in East Los Santos headed for Ganton!",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 15821,
    "name": "SOUND_15821",
    "desc": "You saved me, have some sugar!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15822,
    "name": "SOUND_15822",
    "desc": "My hero deserves his honey!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15823,
    "name": "SOUND_15823",
    "desc": "Oh baby, you're hurt!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15824,
    "name": "SOUND_15824",
    "desc": "This is the LSPD do not, HEY! WHAT THE FUCK? TOO LOW, YOU'LL KILL US ALL!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15825,
    "name": "SOUND_15825",
    "desc": "LSPD, stop right... are you insane? You'll kill us all!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15826,
    "name": "SOUND_15826",
    "desc": "Say, CJ, you gonna crash the car again?",
    "cat": "Falas e Vozes"
  },
  {
    "id": 15827,
    "name": "SOUND_15827",
    "desc": "Fuck you, Ryder.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15828,
    "name": "SOUND_15828",
    "desc": "Ryder, give CJ a break, man. He's practically turned the Grove around by himself.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15829,
    "name": "SOUND_15829",
    "desc": "Man, I was just telling a joke on the little nigga.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15830,
    "name": "SOUND_15830",
    "desc": "Everything you do is a joke, Ryder.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15831,
    "name": "SOUND_15831",
    "desc": "That's right, that's my brother",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15832,
    "name": "SOUND_15832",
    "desc": "That ain't true!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15833,
    "name": "SOUND_15833",
    "desc": "Tell 'em Smoke, back me up man, it ain't true",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15834,
    "name": "SOUND_15834",
    "desc": "Ryder... just chill the fuck out, man!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15835,
    "name": "SOUND_15835",
    "desc": "Remember, we're reuniting the Families, so no bullshit.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15836,
    "name": "SOUND_15836",
    "desc": "Stay cool.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15837,
    "name": "SOUND_15837",
    "desc": "You know me, Sweet, cool as a Shaolin monk!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15838,
    "name": "SOUND_15838",
    "desc": "Especially you, Ryder.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15839,
    "name": "SOUND_15839",
    "desc": "What you mean? I resent your implication, and shit.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15840,
    "name": "SOUND_15840",
    "desc": "Sweet's just sayin' you a natural killer, baby.",
    "cat": "Falas e Vozes"
  },
  {
    "id": 15841,
    "name": "SOUND_15841",
    "desc": "You gotta check yourself and stay cool.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15842,
    "name": "SOUND_15842",
    "desc": "Yeah, well put it like this - I understand what he's trying to say,",
    "cat": "Falas e Vozes"
  },
  {
    "id": 15843,
    "name": "SOUND_15843",
    "desc": "but I'm always cool, fool!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15844,
    "name": "SOUND_15844",
    "desc": "Hey we all down with that, baby.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15845,
    "name": "SOUND_15845",
    "desc": "Ok, we nearly there, ya'll cool?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15846,
    "name": "SOUND_15846",
    "desc": "Ice cold baby",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15847,
    "name": "SOUND_15847",
    "desc": "For sure homie",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15848,
    "name": "SOUND_15848",
    "desc": "OK, it's strictly one rep per set - you guys are gonna have to wait here.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15849,
    "name": "SOUND_15849",
    "desc": "We'll be there just in case, bro.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15850,
    "name": "SOUND_15850",
    "desc": "Thanks, homie, but I'm down with these boys.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15851,
    "name": "SOUND_15851",
    "desc": "I don't like this, man. Look at all them other family hoods! They used to be Grove Streets.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15852,
    "name": "SOUND_15852",
    "desc": "Relax. We straight, they straight. How about you, Smoke?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15853,
    "name": "SOUND_15853",
    "desc": "How 'bout you Smoke?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15854,
    "name": "SOUND_15854",
    "desc": "Hey, I'm feelin' a little exposed, but I'm good.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15855,
    "name": "SOUND_15855",
    "desc": "This is the Los Santos Police Department; Everybody stay where you are!",
    "cat": "Rádio Policial"
  },
  {
    "id": 15856,
    "name": "SOUND_15856",
    "desc": "Oh shit!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15857,
    "name": "SOUND_15857",
    "desc": "Man, what you doin'?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15858,
    "name": "SOUND_15858",
    "desc": "Carl, get back in, man we outta here baby!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15859,
    "name": "SOUND_15859",
    "desc": "I ain't leavin' my brother, I ain't no buster!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15860,
    "name": "SOUND_15860",
    "desc": "Man, it's every motherfucker for himself!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15861,
    "name": "SOUND_15861",
    "desc": "Shit, hey man, you alright?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15862,
    "name": "SOUND_15862",
    "desc": "Nah, I real fucked up, man",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15863,
    "name": "SOUND_15863",
    "desc": "Where the OG's at - I gotta get my brother, Sweet.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15864,
    "name": "SOUND_15864",
    "desc": "They were meeting in the back of the motel someplace...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15865,
    "name": "SOUND_15865",
    "desc": "Alright man, hang in there",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15866,
    "name": "SOUND_15866",
    "desc": "Families! Cops comin' in from behind!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15867,
    "name": "SOUND_15867",
    "desc": "Fuck you cops! Fuck all yall!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15868,
    "name": "SOUND_15868",
    "desc": "What took you? Where's Smoke and Ryder?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15869,
    "name": "SOUND_15869",
    "desc": "They shook on us!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15870,
    "name": "SOUND_15870",
    "desc": "What?!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15871,
    "name": "SOUND_15871",
    "desc": "Fuck it, let's get out of here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15872,
    "name": "SOUND_15872",
    "desc": "CJ, that chopper's all over us! Hit it!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15873,
    "name": "SOUND_15873",
    "desc": "CJ, dump on that helicopter!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15874,
    "name": "SOUND_15874",
    "desc": "C'mon, CJ, let's go!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15875,
    "name": "SOUND_15875",
    "desc": "Little bruv, lets hit it",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15876,
    "name": "SOUND_15876",
    "desc": "Ah shit, what now?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15877,
    "name": "SOUND_15877",
    "desc": "It's Smoke and Ryder!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15878,
    "name": "SOUND_15878",
    "desc": "Get in!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15879,
    "name": "SOUND_15879",
    "desc": "Hit the gas!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15880,
    "name": "SOUND_15880",
    "desc": "Eh man, I'm running low.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15881,
    "name": "SOUND_15881",
    "desc": "I got a 'K here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15882,
    "name": "SOUND_15882",
    "desc": "This fucking antique?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15883,
    "name": "SOUND_15883",
    "desc": "Yeah, well... Emmet ain't the Pentagon!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15884,
    "name": "SOUND_15884",
    "desc": "You got it off Emmet? Shit...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15885,
    "name": "SOUND_15885",
    "desc": "Holy shit! Look at that!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15886,
    "name": "SOUND_15886",
    "desc": "Damn! That was close!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15887,
    "name": "SOUND_15887",
    "desc": "Man, they's got smoked! Did you see that?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15888,
    "name": "SOUND_15888",
    "desc": "Man, it's getting intense! It's getting worse out here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15889,
    "name": "SOUND_15889",
    "desc": "It's like World War VIII!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15890,
    "name": "SOUND_15890",
    "desc": "We really in the middle of this shit tonight",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15891,
    "name": "SOUND_15891",
    "desc": "I wish I'd have stayed home and watched the fucking game!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15892,
    "name": "SOUND_15892",
    "desc": "Hey, CJ, watch to the left!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15893,
    "name": "SOUND_15893",
    "desc": "Your left or my left?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15894,
    "name": "SOUND_15894",
    "desc": "Hell, I don't know, just shoot everybody, motherfucker!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15895,
    "name": "SOUND_15895",
    "desc": "My side, my side",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15896,
    "name": "SOUND_15896",
    "desc": "CJ to our right",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15897,
    "name": "SOUND_15897",
    "desc": "CJ, watch our right!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15898,
    "name": "SOUND_15898",
    "desc": "Cover the right, Carl",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15899,
    "name": "SOUND_15899",
    "desc": "Eyes front, CJ!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15900,
    "name": "SOUND_15900",
    "desc": "We got trouble up front!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15901,
    "name": "SOUND_15901",
    "desc": "They infront of us!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15902,
    "name": "SOUND_15902",
    "desc": "Trouble up ahead!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15903,
    "name": "SOUND_15903",
    "desc": "Waste of good donuts.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15904,
    "name": "SOUND_15904",
    "desc": "Let's roll",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15905,
    "name": "SOUND_15905",
    "desc": "All hells breaking loose tonight!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15906,
    "name": "SOUND_15906",
    "desc": "Guess we better lend a hand...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15907,
    "name": "SOUND_15907",
    "desc": "Smoke, what the FUCK are you doin'?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15908,
    "name": "SOUND_15908",
    "desc": "I like things clean!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15909,
    "name": "SOUND_15909",
    "desc": "Oh, man, my windows broke!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15910,
    "name": "SOUND_15910",
    "desc": "Put up your windows!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15911,
    "name": "SOUND_15911",
    "desc": "Smoke, what are you thinking, man?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15912,
    "name": "SOUND_15912",
    "desc": "Aw man, my damn window down!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15913,
    "name": "SOUND_15913",
    "desc": "I got suds in my eyes!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15914,
    "name": "SOUND_15914",
    "desc": "Dammit, Smoke, I got soap in my eyes!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15915,
    "name": "SOUND_15915",
    "desc": "Hey, ain't we been here before?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15916,
    "name": "SOUND_15916",
    "desc": "We going around in circles",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15917,
    "name": "SOUND_15917",
    "desc": "Smoke, stop going in circles!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15918,
    "name": "SOUND_15918",
    "desc": "Hey, I'm taking what options I have, a'ight?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15919,
    "name": "SOUND_15919",
    "desc": "This ain't no Sunday cruise CJ",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15920,
    "name": "SOUND_15920",
    "desc": "Maybe if you have a nice word with these officers they'll let us on our way!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15921,
    "name": "SOUND_15921",
    "desc": "Hey, man, some idiot's hanging off the back of the car!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15922,
    "name": "SOUND_15922",
    "desc": "Somebody shoot him!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15923,
    "name": "SOUND_15923",
    "desc": "OH SHIT! Roadblock up ahead!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15924,
    "name": "SOUND_15924",
    "desc": "The K's jammed!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15925,
    "name": "SOUND_15925",
    "desc": "Cheap Emmet shit!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15926,
    "name": "SOUND_15926",
    "desc": "Fuck it, I'm going through!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15927,
    "name": "SOUND_15927",
    "desc": "CJ, we got the ghetto bird up ahead!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15928,
    "name": "SOUND_15928",
    "desc": "Eh, I told you my clip is empty!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15929,
    "name": "SOUND_15929",
    "desc": "Whats that motherfucker doing?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15930,
    "name": "SOUND_15930",
    "desc": "Back up, Smoke, Back up!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15931,
    "name": "SOUND_15931",
    "desc": "Hell no, I'm going through!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15932,
    "name": "SOUND_15932",
    "desc": "Oh, man, whered I put my water?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15933,
    "name": "SOUND_15933",
    "desc": "Smoke, you're insane!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15934,
    "name": "SOUND_15934",
    "desc": "Oooooooh SHIIIIIIIT!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15935,
    "name": "SOUND_15935",
    "desc": "Oh man!! That's nasty!!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15936,
    "name": "SOUND_15936",
    "desc": "OH! I got a bit of an ear in my lap!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15937,
    "name": "SOUND_15937",
    "desc": "CJ! Get it off me! Get it off me!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15938,
    "name": "SOUND_15938",
    "desc": "Ah man, I ain't touching no shit in your lap!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15939,
    "name": "SOUND_15939",
    "desc": "Hey, I cant see jack through all this fucking blood!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15940,
    "name": "SOUND_15940",
    "desc": "Slow down, Smoke, SLOW DOWN!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15941,
    "name": "SOUND_15941",
    "desc": "Oh shit, the brakes is out!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15942,
    "name": "SOUND_15942",
    "desc": "Oh man we gonna diiie!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15943,
    "name": "SOUND_15943",
    "desc": "Shit! That's gonna be a hell of a story to tell when we passin' the blunt!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15944,
    "name": "SOUND_15944",
    "desc": "Man, that was some serious shit! Woo!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15945,
    "name": "SOUND_15945",
    "desc": "Fuck this! We gotta get outta here!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15946,
    "name": "SOUND_15946",
    "desc": "Ryder's right, everybody split up, and we'll meet up later.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15947,
    "name": "SOUND_15947",
    "desc": "Oh shit! All I got in my rearview is bad guys!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15948,
    "name": "SOUND_15948",
    "desc": "Carl, behind us! Behind us!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15949,
    "name": "SOUND_15949",
    "desc": "CJ, cover the rear!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 15950,
    "name": "SOUND_15950",
    "desc": "Carl, they all over our ass, baby!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16000,
    "name": "SOUND_16000",
    "desc": "I gotta warn Sweet!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16001,
    "name": "SOUND_16001",
    "desc": "(Dialing tone)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16002,
    "name": "SOUND_16002",
    "desc": "Dammit, Sweet, pickup! Pickup!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16003,
    "name": "SOUND_16003",
    "desc": "(Dialing tone)",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16004,
    "name": "SOUND_16004",
    "desc": "Hey, what's up? You called me but I ain't pickin' up, so leave a message after the...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16005,
    "name": "SOUND_16005",
    "desc": "Shit! Shit! Shit!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16006,
    "name": "SOUND_16006",
    "desc": "Eh, Sweet man, you alright? You been hit!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16007,
    "name": "SOUND_16007",
    "desc": "CJ... Where you been?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16008,
    "name": "SOUND_16008",
    "desc": "Cesar called, showed me some shit.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16009,
    "name": "SOUND_16009",
    "desc": "It's Smoke, and he in deep with Tenpenny and some Ballas!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16010,
    "name": "SOUND_16010",
    "desc": "He sold us out!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16011,
    "name": "SOUND_16011",
    "desc": "It doesn't matter, man - you gotta get out of here. The cops gonna arrive any second.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16012,
    "name": "SOUND_16012",
    "desc": "Nah man, I ain't runnin' out on my brother!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16013,
    "name": "SOUND_16013",
    "desc": "Yo, Ballas! I'm taking you motherfuckers, you hear me?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16014,
    "name": "SOUND_16014",
    "desc": "I'M TAKING YOU ALL DOWN!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16015,
    "name": "SOUND_16015",
    "desc": "I told you to get the hell out of here, CJ...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16016,
    "name": "SOUND_16016",
    "desc": "Hey, I wasn't gonna lose another brother",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16017,
    "name": "SOUND_16017",
    "desc": "Man, I was wrong, Carl. You aint no buster.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16018,
    "name": "SOUND_16018",
    "desc": "Don't move a fucking muscle",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16200,
    "name": "SOUND_16200",
    "desc": "Basketball sound",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16400,
    "name": "SOUND_16400",
    "desc": "C'mon, man, there's these two guys I know - used to work on marine engines,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16401,
    "name": "SOUND_16401",
    "desc": "'til the mob bought their business over in Vice.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16402,
    "name": "SOUND_16402",
    "desc": "Now they try and make ends meet by taking any old job.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16403,
    "name": "SOUND_16403",
    "desc": "They're a little bit dulled by their habit,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16404,
    "name": "SOUND_16404",
    "desc": "but the smoke don't get in the way of their skills with an engine.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16405,
    "name": "SOUND_16405",
    "desc": "We'll pick up Jethro first.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16406,
    "name": "SOUND_16406",
    "desc": "Last I heard, he was working at a garage over Easter Basin way.",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 16407,
    "name": "SOUND_16407",
    "desc": "Last I heard, he was working at a garage over East Esplanade way.",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 16408,
    "name": "SOUND_16408",
    "desc": "Last I heard, he was working at a garage over North Esplanade way.",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 16409,
    "name": "SOUND_16409",
    "desc": "Hey man, how'd you meet these dudes anyway?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16410,
    "name": "SOUND_16410",
    "desc": "I met them at the '89 Fierro Love-in, apparently.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16411,
    "name": "SOUND_16411",
    "desc": "Apparently?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16412,
    "name": "SOUND_16412",
    "desc": "You know how it is, man,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16413,
    "name": "SOUND_16413",
    "desc": "a field of tents, crazy-assed music,",
    "cat": "Músicas e Ambientes"
  },
  {
    "id": 16414,
    "name": "SOUND_16414",
    "desc": "a quart of mescaline vodka, polar bears...",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16415,
    "name": "SOUND_16415",
    "desc": "Polar bears?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16416,
    "name": "SOUND_16416",
    "desc": "Yeah. Go figure. But they were funny guys, man - great sense of humor.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16417,
    "name": "SOUND_16417",
    "desc": "This here's Vietnamese gang territory.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16418,
    "name": "SOUND_16418",
    "desc": "Da Nang Boys, Shining Razors, Butterfly Children.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16419,
    "name": "SOUND_16419",
    "desc": "Watch yourself, dude. These cats are real serious.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16420,
    "name": "SOUND_16420",
    "desc": "Hey, Jethro!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16421,
    "name": "SOUND_16421",
    "desc": "Hey there Truth dude!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16422,
    "name": "SOUND_16422",
    "desc": "Oh man, do I owe you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16423,
    "name": "SOUND_16423",
    "desc": "Coz I swear I paid for that weed, dude!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16424,
    "name": "SOUND_16424",
    "desc": "No, man, we're good, I think.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16425,
    "name": "SOUND_16425",
    "desc": "Hop in, man. I've landed you a real job.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16426,
    "name": "SOUND_16426",
    "desc": "Jethro, Carl. Carl, Jethro.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16427,
    "name": "SOUND_16427",
    "desc": "Wassup man.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16428,
    "name": "SOUND_16428",
    "desc": "Can we swing by the hospital, it's over in Santa Flora district, west of here.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16429,
    "name": "SOUND_16429",
    "desc": "Yeah, you sick?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16430,
    "name": "SOUND_16430",
    "desc": "No. The government is, but that's a long story.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16431,
    "name": "SOUND_16431",
    "desc": "So y'know, like what's the deal, dudes?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16432,
    "name": "SOUND_16432",
    "desc": "I'm opening a garage in Doherty by the waste ground.",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 16433,
    "name": "SOUND_16433",
    "desc": "You know, car mods, lowriders, all that shit.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16434,
    "name": "SOUND_16434",
    "desc": "You down?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16435,
    "name": "SOUND_16435",
    "desc": "Do polar bears shit in the woods?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16436,
    "name": "SOUND_16436",
    "desc": "No, but they've been known to shit in the liquor tent, if I remember it right.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16437,
    "name": "SOUND_16437",
    "desc": "Yeah, that was, like, so far gone, man.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16438,
    "name": "SOUND_16438",
    "desc": "What we here for, anyway?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16439,
    "name": "SOUND_16439",
    "desc": "Nothin'.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16440,
    "name": "SOUND_16440",
    "desc": "Ooh, don't look.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16441,
    "name": "SOUND_16441",
    "desc": "Cover your faces.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16442,
    "name": "SOUND_16442",
    "desc": "Think about a yellow rubber duck.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16443,
    "name": "SOUND_16443",
    "desc": "You tripping again.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16444,
    "name": "SOUND_16444",
    "desc": "Sshhh!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16445,
    "name": "SOUND_16445",
    "desc": "OK, I've seen enough.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16446,
    "name": "SOUND_16446",
    "desc": "Let's go see if we can find Dwaine.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16447,
    "name": "SOUND_16447",
    "desc": "He's working a hotdog van at the tram terminal in King's.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16448,
    "name": "SOUND_16448",
    "desc": "C'mon, dude, what's all that about?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16449,
    "name": "SOUND_16449",
    "desc": "You don't want to know.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16450,
    "name": "SOUND_16450",
    "desc": "Why?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16451,
    "name": "SOUND_16451",
    "desc": "Do you know what a sub-dermal neurophone is?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16452,
    "name": "SOUND_16452",
    "desc": "A what?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16453,
    "name": "SOUND_16453",
    "desc": "Exactly.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16454,
    "name": "SOUND_16454",
    "desc": "Sometimes it's best to stay in the dark, kid.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16455,
    "name": "SOUND_16455",
    "desc": "Dude, Dwaine, man, how's the hot dog business?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16456,
    "name": "SOUND_16456",
    "desc": "It's totally shit. Why, what's happenin'?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16457,
    "name": "SOUND_16457",
    "desc": "Uh, my friend Carl here is opening a chop shop.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16458,
    "name": "SOUND_16458",
    "desc": "Jethro's in, how about you?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16459,
    "name": "SOUND_16459",
    "desc": "Ah yeah, cool man.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16460,
    "name": "SOUND_16460",
    "desc": "Uh I've got like some shit to take care of first though.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16461,
    "name": "SOUND_16461",
    "desc": "So uh you tell me where you guys are going to be at and I'll meet you dudes there.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16462,
    "name": "SOUND_16462",
    "desc": "The garage is on the waste grounds in Doherty.",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 16463,
    "name": "SOUND_16463",
    "desc": "I'll see y'all later.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16464,
    "name": "SOUND_16464",
    "desc": "OK, next stop the cop station downtown.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16465,
    "name": "SOUND_16465",
    "desc": "What? You out your mind! Why?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16466,
    "name": "SOUND_16466",
    "desc": "If I told you, the likelihood is you'd get a probe up your ass within a month.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16467,
    "name": "SOUND_16467",
    "desc": "Like, listen to the man, dude, he's real serious about that shit.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16468,
    "name": "SOUND_16468",
    "desc": "Wuh? OK, but you're starting to freak me out with all that space shit, man.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16469,
    "name": "SOUND_16469",
    "desc": "OK, you know the drill.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16470,
    "name": "SOUND_16470",
    "desc": "Don't look interested in anything.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16471,
    "name": "SOUND_16471",
    "desc": "Picture a pink golfball in your mind.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16472,
    "name": "SOUND_16472",
    "desc": "OK, we're good to go.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16473,
    "name": "SOUND_16473",
    "desc": "Where to next, Spacehead?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16474,
    "name": "SOUND_16474",
    "desc": "There's an electronics guy I've had dealings with,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16475,
    "name": "SOUND_16475",
    "desc": "goes by the name of ZERO.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16476,
    "name": "SOUND_16476",
    "desc": "He could fix a supercomputer with a paperclip.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16477,
    "name": "SOUND_16477",
    "desc": "He's got his own shop,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16478,
    "name": "SOUND_16478",
    "desc": "but he's always ready to help fellow travelers along the path.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16479,
    "name": "SOUND_16479",
    "desc": "Let's go introduce you to him",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16480,
    "name": "SOUND_16480",
    "desc": "Look, what's goin' on, Truth?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16481,
    "name": "SOUND_16481",
    "desc": "Who was them dudes?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16482,
    "name": "SOUND_16482",
    "desc": "Don't go there, man.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16483,
    "name": "SOUND_16483",
    "desc": "Listen to Jethro.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16484,
    "name": "SOUND_16484",
    "desc": "Now, what if I told you we never went to the moon,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16485,
    "name": "SOUND_16485",
    "desc": "JFK lives in Scotland with Janis Joplin,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16486,
    "name": "SOUND_16486",
    "desc": "and the only reason we've been in a cold war for the last forty-five years,",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16487,
    "name": "SOUND_16487",
    "desc": "was because snake-headed aliens run the oil business?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16488,
    "name": "SOUND_16488",
    "desc": "I think you popped another microdot.",
    "cat": "Falas e Vozes"
  },
  {
    "id": 16489,
    "name": "SOUND_16489",
    "desc": "Good. Keep it that way.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16490,
    "name": "SOUND_16490",
    "desc": "Blow the horn.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16491,
    "name": "SOUND_16491",
    "desc": "Leave me alone Berkley!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16492,
    "name": "SOUND_16492",
    "desc": "This is stalking!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16493,
    "name": "SOUND_16493",
    "desc": "Oh, hey, Truth.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16494,
    "name": "SOUND_16494",
    "desc": "Get in, I'll fill you in as we drive.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16495,
    "name": "SOUND_16495",
    "desc": "Home, James!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16496,
    "name": "SOUND_16496",
    "desc": "Carl, Zero, Zero, Carl.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16497,
    "name": "SOUND_16497",
    "desc": "Sup.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16498,
    "name": "SOUND_16498",
    "desc": "Carl here is opening a garage around the corner.",
    "cat": "Alarmes e Portas"
  },
  {
    "id": 16499,
    "name": "SOUND_16499",
    "desc": "I told him you're the man to speak to when it comes to electronics.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16500,
    "name": "SOUND_16500",
    "desc": "Actually, I'm the ONLY man to speak to.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16501,
    "name": "SOUND_16501",
    "desc": "You should drop by the shop sometime, see some of my shit, bro.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16502,
    "name": "SOUND_16502",
    "desc": "I'll do that.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16503,
    "name": "SOUND_16503",
    "desc": "OK, we here.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16504,
    "name": "SOUND_16504",
    "desc": "Grade A, tip-top genius, that's me.",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16600,
    "name": "SOUND_16600",
    "desc": "What's all that damned clatter?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16601,
    "name": "SOUND_16601",
    "desc": "Holy crap! I didn't see nothing!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16602,
    "name": "SOUND_16602",
    "desc": "Oh God, no!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16603,
    "name": "SOUND_16603",
    "desc": "Oh god! Argh, I'm gonna barf!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16604,
    "name": "SOUND_16604",
    "desc": "Oh, my suit, it's ruined!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16605,
    "name": "SOUND_16605",
    "desc": "Oh God the stench!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16606,
    "name": "SOUND_16606",
    "desc": "Please, somebody help!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16607,
    "name": "SOUND_16607",
    "desc": "I'm gonna throw - huurrgghh!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16608,
    "name": "SOUND_16608",
    "desc": "Oh, my own shit!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16609,
    "name": "SOUND_16609",
    "desc": "Shouldn't have had that goddam curry!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16610,
    "name": "SOUND_16610",
    "desc": "Oh God, is that corn?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16611,
    "name": "SOUND_16611",
    "desc": "Urgh, it's all in my mouth!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16612,
    "name": "SOUND_16612",
    "desc": "Hey, where's your hard hat?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16613,
    "name": "SOUND_16613",
    "desc": "Are you supposed to be here?",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16614,
    "name": "SOUND_16614",
    "desc": "Hey, this site is dangerous!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16800,
    "name": "SOUND_16800",
    "desc": "This area is restricted to pilots only!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16801,
    "name": "SOUND_16801",
    "desc": "Only people holding a valid pilot's license may enter!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16802,
    "name": "SOUND_16802",
    "desc": "They'll give a pilot license to anybody these days!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 16803,
    "name": "SOUND_16803",
    "desc": "Pilots are looking younger these days!",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 17000,
    "name": "SOUND_17000",
    "desc": "Video game sound",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 17001,
    "name": "SOUND_17001",
    "desc": "Selecting sound effect",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 17002,
    "name": "SOUND_17002",
    "desc": "Video game sound",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 17003,
    "name": "SOUND_17003",
    "desc": "explosion sound",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 17004,
    "name": "SOUND_17004",
    "desc": "Video game noise",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 17005,
    "name": "SOUND_17005",
    "desc": "Zap",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 17006,
    "name": "SOUND_17006",
    "desc": "Cell phone keypad sound effect",
    "cat": "Efeitos e Interface"
  },
  {
    "id": 17200,
    "name": "SOUND_17200",
    "desc": "Heavy Crate Landing",
    "cat": "Efeitos e Interface"
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
