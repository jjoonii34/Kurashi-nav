// Floor-plan sizes in metres. The room is centred on the origin, so x runs
// from -width/2 to width/2 and z from -depth/2 to depth/2.
export type Rect = { width: number; depth: number };

export function footprint(
  furniture: { width_cm: number; depth_cm: number },
  rotated: boolean,
): Rect {
  const width = furniture.width_cm / 100;
  const depth = furniture.depth_cm / 100;
  return rotated ? { width: depth, depth: width } : { width, depth };
}

export function fits(item: Rect, room: Rect): boolean {
  return item.width <= room.width && item.depth <= room.depth;
}

// Moves a centre point the shortest distance that keeps the whole item
// inside the walls. An item wider than the room stays on the centre line.
export function clampToRoom(
  x: number,
  z: number,
  item: Rect,
  room: Rect,
): { x: number; z: number } {
  const limitX = Math.max(0, (room.width - item.width) / 2);
  const limitZ = Math.max(0, (room.depth - item.depth) / 2);
  return {
    x: Math.min(Math.max(x, -limitX), limitX),
    z: Math.min(Math.max(z, -limitZ), limitZ),
  };
}
