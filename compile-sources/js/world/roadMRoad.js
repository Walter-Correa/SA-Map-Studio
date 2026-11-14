// Data of the stunt roads of SA-MP (MRoad, objects 18788 to 18801): where each piece joins the next one and where its lights go.
// Worked out from the table of the tool Road Construction 1.0 (adri1), which says, for every pair of pieces, where the second goes when it is put after
// the first. Each piece has two ends; the table is the end of the first one meeting the start of the second, so the ends below rebuild every place of the
// table (mean error 9 cm, the rest are hand-made places of the tool) and also the ones it does not have: any piece before another, the 150 m road
// (18789), and the pieces joined by either end.
// MROAD_ENDS: model -> ends [x, y, z, rx, ry, rz]: the frame of the end, +X going out of the piece, +Z up (SA euler, degrees, as the tables of tubes)
export const MROAD_ENDS = {
  18788: [[20, 0, 0, 0, 0, 0], [-20, 0, 0, 0, 0, 180]],                                              // MRoad40m
  18789: [[74.996, 0, -0.562, 0, 0, 0], [-74.996, 0, -0.562, 0, 0, 180]],                            // MRoad150m
  18791: [[-38.9781, 7.7519, -0.5608, 0, 0, 157.5], [38.9784, 7.754, -0.5608, 0, 0, 22.5]],          // MRoadBend45Deg
  18792: [[39.998, 0, -0.5614, 0, 0, 0], [-39.998, 0.145, -0.5413, -15, 0, 180]],                    // MRoadTwist15DegL
  18793: [[39.998, 0, -0.5614, 0, 0, 0], [-39.998, -0.145, -0.5413, 15, 0, 180]],                    // MRoadTwist15DegR
  18794: [[19.8755, 0, 5.2349, 0, -15, 0], [-19.99, 0, 0, 0, 0, 180]],                               // MRoadBend15Deg1 (going up)
  18795: [[19.544, -5.1901, 0, 0, 0, -15], [-20, 0, 0, 0, 0, 180]],                                  // MRoadBend15Deg2 (to the side)
  18796: [[19.9421, 0, -1.3074, 0, 7.3, 0], [-19.9417, 0, -1.3063, 0, 7.3, 180]],                    // MRoadBend15Deg3 (going down)
  18801: [[1.1723, -9.9086, -23.6771, 0, 0, -7], [-1.1907, 9.8976, -23.6771, 0, 0, 173]],            // MRoadLoop1 (the ends at the bottom)
};
export const MROAD_WIDTH = 15.5;

// The lights of the tool (the small point lights 19281 white, 19282 red, 19283 green and 19284 blue) along the sides of each piece: offsets in the piece
export const MROAD_LIGHT_MODELS = [19281, 19282, 19283, 19284];
export const MROAD_LIGHTS = {
  18788: [[-0.5067, -7.7444, 1.8281], [-0.5067, 7.7444, 1.8281]],
  18791: [[-27.653, -4.1658, 1.2507], [-0.8298, -7.6876, 1.2507], [27.6056, -4.2121, 1.2507], [-23.75, 10.7889, 1.2507], [-0.0347, 7.7867, 1.2507], [23.673, 10.7533, 1.2507]],
  18792: [[-19.5232, -7.8409, -0.2468], [17.9498, -7.8409, 0.6988], [-19.5232, 7.3375, 2.7233], [17.968, 7.6175, 1.8245]],
  18793: [[-19.5107, -7.2951, 2.7506], [17.9631, -7.598, 1.8057], [-19.5119, 7.8778, -0.2414], [17.9588, 7.8183, 0.7285]],
  18794: [[-0.6159, -7.7526, 3.0715], [-0.6159, 7.7526, 3.0715]],
  18795: [[-1.5437, -8.9086, 1.7972], [0.4418, 6.4908, 1.7972]],
  18796: [[-0.6159, -7.7526, 1.8335], [-0.6159, 7.7526, 1.8335]],
  18801: [[2.2089, 1.6312, -21.6436], [21.8103, -3.206, 2.2369], [1.013, -7.733, 21.78], [-21.9792, -12.456, 2.2369], [-4.1342, -17.0295, -21.377],
    [4.0666, 16.9831, -21.3406], [21.8181, 12.3629, 2.2369], [-0.909, 7.4012, 21.78], [-21.9944, 3.279, 2.2369], [-2.1976, -1.6457, -21.6436]],
};
