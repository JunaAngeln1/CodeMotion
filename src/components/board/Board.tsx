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
      <mesh position={[0, -0.09, 0]} receiveShadow>
        <boxGeometry args={[gridSize + 0.12, 0.16, gridSize + 0.12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {Array.from({ length: gridSize * gridSize }, (_, index) => {
        const x = index % gridSize;
        const y = Math.floor(index / gridSize);
        return (
          <mesh key={`tile-${index}`} position={[x - half + 0.5, 0, -(y - half + 0.5)]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[0.96, 0.96]} />
            <meshStandardMaterial color={(x + y) % 2 ? "#294665" : "#33577e"} roughness={0.85} />
          </mesh>
        );
      })}

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
