"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Plane, Vector3 } from "three";

export type SceneItem = {
  key: number;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
};

type Props = {
  room: { width: number; depth: number; ceiling: number };
  items: SceneItem[];
  selectedKey: number | null;
  onSelect: (key: number) => void;
  onMove: (key: number, x: number, z: number) => void;
  label: string;
};

const WALL = 0.05;
const FLOOR_PLANE = new Plane(new Vector3(0, 1, 0), 0);

// Where the pointer's ray meets the floor, whatever object it is over.
function floorPoint(event: ThreeEvent<PointerEvent>): Vector3 | null {
  return event.ray.intersectPlane(FLOOR_PLANE, new Vector3());
}

export default function RoomScene({
  room,
  items,
  selectedKey,
  onSelect,
  onMove,
  label,
}: Props) {
  const [dragging, setDragging] = useState(false);
  // The item being dragged and how far its centre is from the grab point,
  // so it does not jump under the finger.
  const drag = useRef<{ key: number; dx: number; dz: number } | null>(null);
  const { width, depth, ceiling } = room;
  const longest = Math.max(width, depth);

  function startDrag(event: ThreeEvent<PointerEvent>, item: SceneItem) {
    event.stopPropagation();
    (event.target as Element).setPointerCapture(event.pointerId);
    onSelect(item.key);
    const point = floorPoint(event);
    if (point === null) {
      return;
    }
    drag.current = { key: item.key, dx: item.x - point.x, dz: item.z - point.z };
    setDragging(true);
  }

  function moveDrag(event: ThreeEvent<PointerEvent>, item: SceneItem) {
    if (drag.current?.key !== item.key) {
      return;
    }
    const point = floorPoint(event);
    if (point !== null) {
      onMove(item.key, point.x + drag.current.dx, point.z + drag.current.dz);
    }
  }

  function endDrag(event: ThreeEvent<PointerEvent>) {
    (event.target as Element).releasePointerCapture(event.pointerId);
    drag.current = null;
    setDragging(false);
  }

  return (
    <Canvas
      // The camera is set once per canvas, so a new room size remounts it.
      key={`${width}x${depth}`}
      camera={{ position: [longest * 0.9, longest * 1.3, depth * 1.5], fov: 45 }}
      style={{ touchAction: "none" }}
      aria-label={label}
      role="img"
    >
      <ambientLight intensity={1.6} />
      <directionalLight position={[3, 6, 4]} intensity={1.4} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#d8d9b4" />
      </mesh>

      {/* Only the two far walls, so the camera always sees into the room. */}
      <mesh position={[0, ceiling / 2, -depth / 2 - WALL / 2]}>
        <boxGeometry args={[width + WALL * 2, ceiling, WALL]} />
        <meshStandardMaterial color="#f4f4f1" />
      </mesh>
      <mesh position={[-width / 2 - WALL / 2, ceiling / 2, 0]}>
        <boxGeometry args={[WALL, ceiling, depth]} />
        <meshStandardMaterial color="#e9e9e4" />
      </mesh>

      {items.map((item) => (
        <mesh
          key={item.key}
          position={[item.x, item.height / 2, item.z]}
          onPointerDown={(event) => startDrag(event, item)}
          onPointerMove={(event) => moveDrag(event, item)}
          onPointerUp={endDrag}
        >
          <boxGeometry args={[item.width, item.height, item.depth]} />
          <meshStandardMaterial
            color={item.key === selectedKey ? "#2f8f84" : "#1f5e57"}
          />
        </mesh>
      ))}

      <OrbitControls
        enabled={!dragging}
        enablePan={false}
        target={[0, ceiling / 4, 0]}
        minDistance={longest * 0.8}
        maxDistance={longest * 4}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </Canvas>
  );
}
