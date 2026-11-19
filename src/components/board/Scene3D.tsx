import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Board } from "@/components/board/Board";
import { RobotController } from "@/components/robot/RobotController";

interface Scene3DProps {
  gridSize: number;
  obstacles: { x: number; y: number }[];
  goalX: number;
  goalY: number;
}

export const Scene3D = ({ gridSize, obstacles, goalX, goalY }: Scene3DProps) => {
  return (
    <Canvas shadows camera={{ position: [8, 10, 10], fov: 45 }} className="w-full h-full bg-slate-950">
      <fog attach="fog" args={["#0f172a", 1, 30]} />
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      <OrbitControls enableZoom enablePan={false} />
      <Board
        gridSize={gridSize}
        obstacles={obstacles}
        goalX={goalX}
        goalY={goalY}
      />
      <RobotController />
    </Canvas>
  );
};
