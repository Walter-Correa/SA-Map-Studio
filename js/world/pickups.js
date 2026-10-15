// Suporte completo a Pickups (CreatePickup e CreateDynamicPickup)
// Conforme especificação do open.mp: https://open.mp/docs/scripting/functions/CreatePickup
// e lista oficial de IDs de pickup: https://open.mp/docs/scripting/resources/pickupids
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
  // Saúde, Armadura e Vida
  { model: 1240, name: 'Coração / Vida (Health)', category: 'Saúde e Proteção' },
  { model: 1242, name: 'Colete / Armadura (Armour)', category: 'Saúde e Proteção' },
  { model: 1241, name: 'Pílula de Adrenalina', category: 'Saúde e Proteção' },

  // Propriedades, Dinheiro e Marcadores
  { model: 1274, name: 'Cifrão de Dinheiro ($)', category: 'Geral e Marcadores' },
  { model: 1239, name: 'Ícone de Informação (i)', category: 'Geral e Marcadores' },
  { model: 1318, name: 'Seta de Entrada (Branca/Amarela)', category: 'Geral e Marcadores' },
  { model: 1272, name: 'Casa Azul (Comprada/Ocupada)', category: 'Propriedades' },
  { model: 1273, name: 'Casa Verde (À Venda)', category: 'Propriedades' },
  { model: 1277, name: 'Disquete de Save Game', category: 'Geral e Marcadores' },
  { model: 1247, name: 'Estrela de Suborno Policial', category: 'Geral e Marcadores' },
  { model: 1248, name: 'Distintivo Policial', category: 'Geral e Marcadores' },
  { model: 1210, name: 'Maleta de Dinheiro (Briefcase)', category: 'Geral e Marcadores' },
  { model: 1253, name: 'Câmera Fotográfica', category: 'Itens' },
  { model: 1254, name: 'Mochila de Pára-quedas', category: 'Itens' },
  { model: 1275, name: 'Camisa Azul', category: 'Itens' },
  { model: 1276, name: 'Estátua Tiki', category: 'Itens' },
  { model: 1252, name: 'Bomba / Detonador Explosivo', category: 'Itens' },
  { model: 1313, name: 'Ícone 2 Jogadores', category: 'Geral e Marcadores' },
  { model: 1314, name: 'Caveira 2 Jogadores', category: 'Geral e Marcadores' },

  // Armas Corpo a Corpo
  { model: 331, name: 'Soco Inglês (Brass Knuckles)', category: 'Armas Brancas' },
  { model: 333, name: 'Taco de Golfe (Golf Club)', category: 'Armas Brancas' },
  { model: 334, name: 'Cassetete Policial (Nightstick)', category: 'Armas Brancas' },
  { model: 335, name: 'Faca (Knife)', category: 'Armas Brancas' },
  { model: 336, name: 'Taco de Beisebol (Baseball Bat)', category: 'Armas Brancas' },
  { model: 337, name: 'Pá (Shovel)', category: 'Armas Brancas' },
  { model: 338, name: 'Taco de Sinuca (Pool Cue)', category: 'Armas Brancas' },
  { model: 339, name: 'Katana', category: 'Armas Brancas' },
  { model: 341, name: 'Motosserra (Chainsaw)', category: 'Armas Brancas' },

  // Pistolas
  { model: 346, name: 'Pistola 9mm', category: 'Pistolas' },
  { model: 347, name: 'Pistola 9mm Silenciada', category: 'Pistolas' },
  { model: 348, name: 'Desert Eagle', category: 'Pistolas' },

  // Shotguns
  { model: 349, name: 'Shotgun Calibre 12', category: 'Espingardas (Shotguns)' },
  { model: 350, name: 'Sawnoff Shotgun', category: 'Espingardas (Shotguns)' },
  { model: 351, name: 'SPAS-12 (Combat Shotgun)', category: 'Espingardas (Shotguns)' },

  // Submetralhadoras
  { model: 352, name: 'Micro Uzi', category: 'Submetralhadoras' },
  { model: 353, name: 'MP5', category: 'Submetralhadoras' },
  { model: 372, name: 'Tec-9', category: 'Submetralhadoras' },

  // Fuzis de Assalto e Rifles
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
  { model: 365, name: 'Lata de Spray', category: 'Outros' },
  { model: 366, name: 'Extintor de Incêndio', category: 'Outros' },
];

export function getPickupLabel(model) {
  const p = PREDEFINED_PICKUPS.find(item => item.model === (model | 0));
  return p ? p.name : `Pickup ID ${model}`;
}

// Cria malha de fallback estilizada (Diamante flutuante)
export function createPickupFallbackMesh(model) {
  const group = new THREE.Group();
  const geo = new THREE.OctahedronGeometry(0.38, 0);
  let color = 0x57b77a; // Verde padrão
  if (model === 1240) color = 0xee3333; // Vermelho coração
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

  // Anel luminoso na base
  const ringGeo = new THREE.RingGeometry(0.3, 0.38, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0, 0.05);
  group.add(ring);

  return group;
}
