// Suporte completo a Pickups (CreatePickup e CreateDynamicPickup)
// As specified:
// and official list of pickup IDs:
import * as THREE from 'three';

export const PICKUP_TYPES = [
  { type: 1, name: '1 - Sempre visível (Não pode ser pego, ideal para entradas, teleports e marcadores)' },
  { type: 2, name: '2 - Pega e respawna após alguns segundos' },
  { type: 3, name: '3 - Pega e respawna apenas após a morte do jogador' },
  { type: 4, name: '4 - Desaparece logo após spawnar (arma dropada)' },
  { type: 14, name: '14 - Pode ser pego de dentro de um veículo' },
  { type: 19, name: '19 - Dinheiro (some ao pegar, não respawna)' },
  { type: 22, name: '22 - Desaparece ao pegar (não respawna)' },
];

export const PREDEFINED_PICKUPS = [
  // All 59 official IDs from the table ()
  { model: 954, name: 'Ferradura da Sorte (Horseshoe)', category: 'Itens' },
  { model: 1210, name: 'Maleta de Dinheiro (Briefcase)', category: 'Geral e Marcadores' },
  { model: 1212, name: 'Pacote de Dinheiro (Money)', category: 'Geral e Marcadores' },
  { model: 1213, name: 'Mina Terrestre (Landmine)', category: 'Itens' },
  { model: 1239, name: 'Ícone de Informação (i)', category: 'Geral e Marcadores' },
  { model: 1240, name: 'Coração / Vida (Health)', category: 'Saúde e Proteção' },
  { model: 1241, name: 'Pílula de Adrenalina', category: 'Saúde e Proteção' },
  { model: 1242, name: 'Colete / Armadura (Armour)', category: 'Saúde e Proteção' },
  { model: 1247, name: 'Estrela de Suborno Policial', category: 'Geral e Marcadores' },
  { model: 1248, name: 'Logo GTA III', category: 'Geral e Marcadores' },
  { model: 1252, name: 'Barril Explosivo (Barrel explosion)', category: 'Itens' },
  { model: 1254, name: 'Caveira (Skull)', category: 'Geral e Marcadores' },
  { model: 1272, name: 'Casa Azul (Comprada)', category: 'Propriedades' },
  { model: 1273, name: 'Casa Verde (À Venda)', category: 'Propriedades' },
  { model: 1274, name: 'Cifrão de Dinheiro ($)', category: 'Geral e Marcadores' },
  { model: 1275, name: 'Camisa Azul (Shirt)', category: 'Itens' },
  { model: 1276, name: 'Estátua Tiki', category: 'Itens' },
  { model: 1277, name: 'Disquete de Save Game', category: 'Geral e Marcadores' },
  { model: 1279, name: 'Pacote Craig (Package)', category: 'Itens' },
  { model: 1310, name: 'Paraquedas (Parachute)', category: 'Itens' },
  { model: 1313, name: 'Caveira Dupla (Kill frenzy rampage)', category: 'Geral e Marcadores' },
  { model: 1314, name: 'Ícone 2 Jogadores', category: 'Geral e Marcadores' },
  { model: 1318, name: 'Seta Amarela de Entrada', category: 'Geral e Marcadores' },
  { model: 1550, name: 'Saco de Dinheiro (Money bag)', category: 'Geral e Marcadores' },
  { model: 1575, name: 'Pacote de Drogas Branco', category: 'Itens' },
  { model: 1576, name: 'Pacote de Drogas Laranja', category: 'Itens' },
  { model: 1577, name: 'Pacote de Drogas Amarelo', category: 'Itens' },
  { model: 1578, name: 'Pacote de Drogas Verde', category: 'Itens' },
  { model: 1579, name: 'Pacote de Drogas Azul', category: 'Itens' },
  { model: 1580, name: 'Pacote de Drogas Vermelho', category: 'Itens' },
  { model: 1581, name: 'Cartão de Acesso (Keycard)', category: 'Itens' },
  { model: 1582, name: 'Caixa de Pizza (Pizza box)', category: 'Itens' },
  { model: 1636, name: 'Bomba RC (RC bomb)', category: 'Itens' },
  { model: 1650, name: 'Galão de Combustível (Petrol can)', category: 'Itens' },
  { model: 1654, name: 'Dinamite (Dynamite)', category: 'Itens' },
  { model: 2057, name: 'Lata de Chamas (Flame tins)', category: 'Itens' },
  { model: 2060, name: 'Saco de Areia (Sandbag)', category: 'Itens' },
  { model: 2061, name: 'Conchas (Shells)', category: 'Itens' },
  { model: 2690, name: 'Extintor de Incêndio', category: 'Itens' },
  { model: 2710, name: 'Relógio de Pulso (Hand watch)', category: 'Itens' },
  { model: 11736, name: 'Bolsa Médica (Medical satchel)', category: 'Saúde e Proteção' },
  { model: 11738, name: 'Maleta Médica (Medical case)', category: 'Saúde e Proteção' },
  { model: 19130, name: 'Seta Flutuante Tipo 1', category: 'Geral e Marcadores' },
  { model: 19131, name: 'Seta Flutuante Tipo 2', category: 'Geral e Marcadores' },
  { model: 19132, name: 'Seta Flutuante Tipo 3', category: 'Geral e Marcadores' },
  { model: 19133, name: 'Seta Flutuante Tipo 4', category: 'Geral e Marcadores' },
  { model: 19134, name: 'Seta Flutuante Tipo 5', category: 'Geral e Marcadores' },
  { model: 19135, name: 'Marcador Externo Animado', category: 'Geral e Marcadores' },
  { model: 19197, name: 'Marcador Amarelo Grande', category: 'Geral e Marcadores' },
  { model: 19198, name: 'Marcador Amarelo Pequeno', category: 'Geral e Marcadores' },
  { model: 19320, name: 'Abóbora de Halloween', category: 'Itens' },
  { model: 19522, name: 'Casa Vermelha (House red)', category: 'Propriedades' },
  { model: 19523, name: 'Casa Laranja (House orange)', category: 'Propriedades' },
  { model: 19524, name: 'Casa Amarela (House yellow)', category: 'Propriedades' },
  { model: 19602, name: 'Mina Terrestre Tipo 2', category: 'Itens' },
  { model: 19605, name: 'Marcador Externo Vermelho', category: 'Geral e Marcadores' },
  { model: 19606, name: 'Marcador Externo Verde', category: 'Geral e Marcadores' },
  { model: 19607, name: 'Marcador Externo Azul', category: 'Geral e Marcadores' },
  { model: 19832, name: 'Caixa Ammu-Nation', category: 'Geral e Marcadores' },

  // Melee Weapons and Holdable Objects
  { model: 321, name: 'Dildo Padrão (Regular Dildo)', category: 'Armas Brancas' },
  { model: 322, name: 'Dildo Branco (White Dildo)', category: 'Armas Brancas' },
  { model: 323, name: 'Vibrador Médio (Vibrator)', category: 'Armas Brancas' },
  { model: 324, name: 'Vibrador Grande (Vibrator)', category: 'Armas Brancas' },
  { model: 325, name: 'Buquê de Flores', category: 'Armas Brancas' },
  { model: 326, name: 'Bengala (Cane)', category: 'Armas Brancas' },
  { model: 330, name: 'Celular do CJ', category: 'Itens' },
  { model: 331, name: 'Soco Inglês (Brass Knuckles)', category: 'Armas Brancas' },
  { model: 333, name: 'Taco de Golfe (Golf Club)', category: 'Armas Brancas' },
  { model: 334, name: 'Cassetete Policial (Nightstick)', category: 'Armas Brancas' },
  { model: 335, name: 'Faca (Combat Knife)', category: 'Armas Brancas' },
  { model: 336, name: 'Taco de Beisebol (Baseball Bat)', category: 'Armas Brancas' },
  { model: 337, name: 'Pá (Shovel)', category: 'Armas Brancas' },
  { model: 338, name: 'Taco de Sinuca (Pool Cue)', category: 'Armas Brancas' },
  { model: 339, name: 'Katana', category: 'Armas Brancas' },
  { model: 341, name: 'Motosserra (Chainsaw)', category: 'Armas Brancas' },

  // Pistolas
  { model: 346, name: 'Pistola 9mm (Colt 45)', category: 'Pistolas' },
  { model: 347, name: 'Pistola Silenciada (Silenced Colt)', category: 'Pistolas' },
  { model: 348, name: 'Desert Eagle', category: 'Pistolas' },

  // Shotguns
  { model: 349, name: 'Shotgun Calibre 12', category: 'Espingardas (Shotguns)' },
  { model: 350, name: 'Sawnoff Shotgun', category: 'Espingardas (Shotguns)' },
  { model: 351, name: 'SPAS-12 (Combat Shotgun)', category: 'Espingardas (Shotguns)' },

  // Submetralhadoras
  { model: 352, name: 'Micro Uzi', category: 'Submetralhadoras' },
  { model: 353, name: 'MP5', category: 'Submetralhadoras' },
  { model: 372, name: 'Tec-9', category: 'Submetralhadoras' },

  // Fuzis e Rifles
  { model: 355, name: 'AK-47', category: 'Fuzis e Rifles' },
  { model: 356, name: 'M4', category: 'Fuzis e Rifles' },
  { model: 357, name: 'Rifle de Caça (Country Rifle)', category: 'Fuzis e Rifles' },
  { model: 358, name: 'Rifle de Precisão (Sniper Rifle)', category: 'Fuzis e Rifles' },

  // Pesadas e Explosivos
  { model: 359, name: 'Lança-Foguetes (RPG)', category: 'Pesadas e Explosivos' },
  { model: 360, name: 'Lança-Mísseis Teleguiado', category: 'Pesadas e Explosivos' },
  { model: 361, name: 'Lança-Chamas (Flamethrower)', category: 'Pesadas e Explosivos' },
  { model: 362, name: 'Minigun', category: 'Pesadas e Explosivos' },
  { model: 342, name: 'Granada (Grenade)', category: 'Pesadas e Explosivos' },
  { model: 343, name: 'Gás Lacrimogêneo (Teargas)', category: 'Pesadas e Explosivos' },
  { model: 344, name: 'Coquetel Molotov', category: 'Pesadas e Explosivos' },
  { model: 363, name: 'Carga Explosiva (Satchel Charge)', category: 'Pesadas e Explosivos' },
  { model: 364, name: 'Detonador', category: 'Pesadas e Explosivos' },
  { model: 365, name: 'Lata de Spray', category: 'Outros' },
  { model: 366, name: 'Extintor de Incêndio', category: 'Outros' },
  { model: 367, name: 'Câmera Fotográfica', category: 'Itens' },
  { model: 368, name: 'Óculos de Visão Noturna', category: 'Itens' },
  { model: 369, name: 'Óculos de Visão Térmica', category: 'Itens' },
  { model: 370, name: 'Jetpack', category: 'Itens' },
  { model: 371, name: 'Paraquedas (Equipável)', category: 'Itens' },
];

export const PICKUP_MODEL_IDS = new Set(PREDEFINED_PICKUPS.map(p => p.model));
export const isPickupModel = (id) => PICKUP_MODEL_IDS.has(id | 0);

export function getPickupLabel(model) {
  const p = PREDEFINED_PICKUPS.find(item => item.model === (model | 0));
  return p ? p.name : `Pickup ID ${model}`;
}

// Creates a stylized fallback mesh (floating Diamond)
export function createPickupFallbackMesh(model) {
  const group = new THREE.Group();
  const geo = new THREE.OctahedronGeometry(0.38, 0);
  let color = 0x57b77a; // Default green
  if (model === 1240) color = 0xee3333; // Heart red
  else if (model === 1242) color = 0x3388ff; // Azul colete
  else if (model === 1274) color = 0x22cc44; // Verde $
  else if (model === 1239) color = 0xf0a630; // Amarelo info
  else if (model === 1273) color = 0x33dd33; // Casa verde
  else if (model === 1272) color = 0x3366ee; // Casa azul
  else if (model >= 331 && model <= 372) color = 0xddaa33; // Armas ouro

  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.25,
    metalness: 0.65,
    emissive: color,
    emissiveIntensity: 0.25,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.set(0.8, 1.2, 0.8);
  mesh.position.set(0, 0, 0.4);
  group.add(mesh);

  // Glowing ring at the base
  const ringGeo = new THREE.RingGeometry(0.3, 0.38, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0, 0.05);
  group.add(ring);

  return group;
}
