import { Canvas, useThree } from "@react-three/fiber";
import { useSyncExternalStore } from "react";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
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
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: [8, 10, 8], fov: 45 }} className="w-full h-full" style={{ touchAction: "pan-y" }}>
      <color attach="background" args={["#080f20"]} />
      <BoardView gridSize={gridSize} />
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight position={[10, 20, 10]} intensity={2} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      <Board
        gridSize={gridSize}
        obstacles={obstacles}
        goalX={goalX}
        goalY={goalY}
      />
      <RobotController gridSize={gridSize} />
    </Canvas>
  );
};

// Fit both dimensions, including tall phones and wide desktop panels.
const subscribePointer = (onChange: () => void) => {
  const query = window.matchMedia("(pointer: fine)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const BoardView = ({ gridSize }: { gridSize: number }) => {
  const { width, height } = useThree((state) => state.size);
  const hasMouse = useSyncExternalStore(subscribePointer, () => window.matchMedia("(pointer: fine)").matches, () => false);
  const zoom = Math.min(width / (gridSize * 1.45), height / (gridSize * 0.95 + 1.8)) / 1.05;
  return (
    <>
      <OrthographicCamera makeDefault position={[8, 10, 8]} zoom={zoom} near={0.1} far={100}
        onUpdate={(camera) => { camera.lookAt(0, 0.4, 0); camera.updateProjectionMatrix(); }} />
      {hasMouse && width >= 700 && <OrbitControls makeDefault enablePan={false} enableZoom={false} minPolarAngle={0.35} maxPolarAngle={Math.PI / 2.5} target={[0, 0.4, 0]} />}
    </>
  );
};
