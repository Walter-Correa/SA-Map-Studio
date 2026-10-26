// The objects of the category "Pistas, rampas e estradas": the pieces that join each other by their edges (automatic snap, see editor/roadSnap.js).
// - The tubes of SA-MP 0.3.7 (ids 19646 to 19689): the ones the tool TBR (Adr1 Tube Connector) joins, with its supports and light. They only exist when
//   SA-MP is installed (Singleplayer then takes them as mod objects).
// - Ramps, jumps and stunt pieces of the original game, joined by the ends of their long side (the places are read from the model itself).
import { TUBE_TYPES } from './roadTubes.js';

export const ROAD_CATEGORY = 'Pistas, rampas e estradas';

// Supports (19670, 19671) and the light (19672) of the tubes: they go on a tube, not after it
export const TUBE_EXTRAS = [19670, 19671, 19672];
// Tubes the tool does not join (it has no place for them in its table): the 5 degree bends. They join the other tubes by their ends, read from the model
export const TUBE_BY_SHAPE = [19673, 19674, 19675, 19676];
// The flat plate of 25 x 25 m (TubeFlat25x25m1): joins its twin by the four edges
export const PLATES = [19650];
export const ROAD_TUBE_IDS = [...Object.keys(TUBE_TYPES).map(Number), ...TUBE_BY_SHAPE, ...PLATES, ...TUBE_EXTRAS];

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// Pipes of SA-MP (the end of each one is a round rim; pipes of the same size join): straight, bent, funnels, junctions, the rainbow ones...
export const ROAD_PIPE_IDS = [
  ...range(18808, 18829), ...range(18831, 18842), 18851, ...range(18852, 18855), ...range(18982, 19000), 19901,
];
// Roads, ramps, jumps, tunnels, bridges and loops of SA-MP (the end of each one is a cut across it): the surface of one continues in the next one
export const ROAD_SAMP_IDS = [
  ...range(18772, 18779), 18781, ...range(18783, 18807), 18830, 19628, 19629, ...range(19633, 19635), ...range(19884, 19892),
];
// The tunnel pieces among them: the floor is the lowest surface (the roof is above the road)
export const ROAD_TUNNEL_IDS = [18772, 18773, 18774, 18775, 18776, 18777];
// Ramps, jumps and stunt pieces of the original game
export const ROAD_VANILLA_IDS = [
  1632, 1633, 1634, 1655, 2939, 2940, 3069, 3080, 5152, 5153, 13593, 13645,
];
const PIPE_SET = new Set(ROAD_PIPE_IDS);
// How the ends of a piece are read: 'tube' (the tubes of SA-MP), 'rim' (pipes) or 'surface' (roads, ramps, plates)
export const roadKind = (id) => (PIPE_SET.has(id) ? 'rim' : TUBE_BY_SHAPE.includes(id) ? 'tube' : 'surface');

const ROAD_SET = new Set([...ROAD_TUBE_IDS, ...ROAD_PIPE_IDS, ...ROAD_SAMP_IDS, ...ROAD_VANILLA_IDS]);
export const isRoadModel = (id) => ROAD_SET.has(id);
export const isTubeModel = (id) => TUBE_TYPES[id] !== undefined;
export const isShapeTube = (id) => TUBE_BY_SHAPE.includes(id);
