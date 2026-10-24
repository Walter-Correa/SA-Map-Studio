// The game's weapons: id, name, the model that has to be loaded for the game to hand it over, and whether it is a melee one.
export const WEAPONS = [
  { id: 1, name: 'Soco inglês', model: 331, melee: true },
  { id: 2, name: 'Taco de golfe', model: 333, melee: true },
  { id: 3, name: 'Cassetete', model: 334, melee: true },
  { id: 4, name: 'Faca', model: 335, melee: true },
  { id: 5, name: 'Taco de beisebol', model: 336, melee: true },
  { id: 6, name: 'Pá', model: 337, melee: true },
  { id: 7, name: 'Taco de sinuca', model: 338, melee: true },
  { id: 8, name: 'Katana', model: 339, melee: true },
  { id: 9, name: 'Motosserra', model: 341, melee: true },
  { id: 16, name: 'Granada', model: 342, melee: false },
  { id: 17, name: 'Gás lacrimogêneo', model: 343, melee: false },
  { id: 18, name: 'Molotov', model: 344, melee: false },
  { id: 22, name: 'Pistola 9mm', model: 346, melee: false },
  { id: 23, name: 'Pistola silenciada', model: 347, melee: false },
  { id: 24, name: 'Desert Eagle', model: 348, melee: false },
  { id: 25, name: 'Escopeta', model: 349, melee: false },
  { id: 26, name: 'Escopeta de cano serrado', model: 350, melee: false },
  { id: 27, name: 'Escopeta de combate', model: 351, melee: false },
  { id: 28, name: 'Micro SMG', model: 352, melee: false },
  { id: 29, name: 'MP5', model: 353, melee: false },
  { id: 30, name: 'AK-47', model: 355, melee: false },
  { id: 31, name: 'M4', model: 356, melee: false },
  { id: 32, name: 'Tec-9', model: 372, melee: false },
  { id: 33, name: 'Rifle', model: 357, melee: false },
  { id: 34, name: 'Sniper', model: 358, melee: false },
  { id: 35, name: 'Lança-foguetes', model: 359, melee: false },
  { id: 37, name: 'Lança-chamas', model: 361, melee: false },
  { id: 38, name: 'Minigun', model: 362, melee: false },
  { id: 41, name: 'Spray', model: 365, melee: false },
  { id: 42, name: 'Extintor', model: 366, melee: false },
  { id: 43, name: 'Câmera', model: 367, melee: false },
  { id: 46, name: 'Paraquedas', model: 371, melee: false },
];

// What a NPC can carry: melee and firearms
export const NPC_WEAPONS = WEAPONS.filter(w => ![41, 42, 43, 46, 17].includes(w.id));
// The firearms that ammunition can be added to
export const AMMO_WEAPONS = WEAPONS.filter(w => !w.melee && ![41, 42, 43, 46].includes(w.id)).map(w => w.id);

export const weaponModel = (id) => WEAPONS.find(w => w.id === id)?.model || 0;
export const weaponName = (id) => WEAPONS.find(w => w.id === id)?.name || '';
export const optionsHtml = (list, current) => `<option value="0">Nenhuma</option>` + list.map(w => `<option value="${w.id}" ${w.id === current ? 'selected' : ''}>${w.name}</option>`).join('');
