import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, Sphere, Cylinder } from "@react-three/drei";
import { useRobotStore } from "@/store/robotStore";
import type { Direction } from "@/types";

const DIRECTION_TO_ROTATION: Record<Direction, number> = {
  north: 0,
  east: Math.PI / 2,
  south: Math.PI,
  west: -Math.PI / 2,
};

export const RobotController = ({ gridSize = 6 }: { gridSize?: number }) => {
  const { robot } = useRobotStore();
  const meshRef = useRef<THREE.Group>(null);
  const [initialPosition] = useState<[number, number, number]>(() => [
    robot.x - gridSize / 2 + 0.5, 0.16, -(robot.y - gridSize / 2 + 0.5),
  ]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const targetRot = DIRECTION_TO_ROTATION[robot.direction];
    meshRef.current.rotation.y += (targetRot - meshRef.current.rotation.y) * delta * 6;
    const targetX = robot.x - gridSize / 2 + 0.5;
    const targetZ = -(robot.y - gridSize / 2 + 0.5);
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * delta * 6;
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * delta * 6;
  });

  return (
    <group ref={meshRef} position={initialPosition}>
      <Robot />
    </group>
  );
};

const Robot = () => (
  <group>
    <Box args={[0.7, 0.9, 0.5]} position={[0, 0.55, 0]}>
      <meshStandardMaterial color="#22d3ee" />
    </Box>
    <Box args={[0.55, 0.55, 0.55]} position={[0, 1.15, 0]}>
      <meshStandardMaterial color="#1e293b" />
    </Box>
    <Sphere args={[0.08, 8, 8]} position={[-0.18, 1.25, 0.29]}>
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" />
    </Sphere>
    <Sphere args={[0.08, 8, 8]} position={[0.18, 1.25, 0.29]}>
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" />
    </Sphere>
    <Cylinder args={[0.03, 0.03, 0.3]} position={[0, 1.5, 0]}>
      <meshStandardMaterial color="#a855f7" />
    </Cylinder>
    <Sphere args={[0.1, 8, 8]} position={[0, 1.68, 0]}>
      <meshStandardMaterial color="#a855f7" emissive="#a855f7" />
    </Sphere>
    <Box args={[0.18, 0.5, 0.2]} position={[-0.5, 0.7, 0]}>
      <meshStandardMaterial color="#1e293b" />
    </Box>
    <Box args={[0.18, 0.5, 0.2]} position={[0.5, 0.7, 0]}>
      <meshStandardMaterial color="#1e293b" />
    </Box>
    <Box args={[0.22, 0.6, 0.22]} position={[-0.22, 0.15, 0.15]}>
      <meshStandardMaterial color="#334155" />
    </Box>
    <Box args={[0.22, 0.6, 0.22]} position={[0.22, 0.15, 0.15]}>
      <meshStandardMaterial color="#334155" />
    </Box>
    <Box args={[0.3, 0.12, 0.4]} position={[-0.22, -0.15, 0.15]}>
      <meshStandardMaterial color="#1e293b" />
    </Box>
    <Box args={[0.3, 0.12, 0.4]} position={[0.22, -0.15, 0.15]}>
      <meshStandardMaterial color="#1e293b" />
    </Box>
  </group>
);
