interface BoardProps {
  gridSize: number;
  obstacles: { x: number; y: number }[];
  goalX: number;
  goalY: number;
}

export const Board = ({ gridSize, obstacles, goalX, goalY }: BoardProps) => {
  const half = gridSize / 2;

  return (
    <group>
      <gridHelper args={[gridSize, gridSize, "#334155", "#1e293b"]} />

      <mesh>
        <planeGeometry args={[gridSize, gridSize]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.6} />
      </mesh>

      {obstacles.map((o, i) => (
        <mesh key={`obs-${i}`} position={[o.x - half + 0.5, 0.3, -(o.y - half + 0.5)]}>
          <boxGeometry args={[0.8, 0.6, 0.8]} />
          <meshStandardMaterial color="#ef4444" emissive="#7f1d1d" />
        </mesh>
      ))}

      <mesh position={[goalX - half + 0.5, 0.35, -(goalY - half + 0.5)]}>
        <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#166534" />
      </mesh>
      <mesh position={[goalX - half + 0.5, 0.6, -(goalY - half + 0.5)]}>
        <boxGeometry args={[0.9, 0.1, 0.9]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
    </group>
  );
};
