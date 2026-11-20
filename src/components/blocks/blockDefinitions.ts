import { ArrowUp, CornerUpLeft, CornerUpRight, Repeat2 } from "lucide-react";

export const BLOCK_VISUALS = {
  move: { label: "Avanzar", libraryLabel: "Avanzar", detail: "1 casilla", icon: ArrowUp },
  turnLeft: { label: "Girar izquierda", libraryLabel: "Girar izquierda", detail: "Giro de 90°", icon: CornerUpLeft },
  turnRight: { label: "Girar derecha", libraryLabel: "Girar derecha", detail: "Giro de 90°", icon: CornerUpRight },
  repeat: { label: "Repetir", libraryLabel: "Repetir N veces", detail: "N veces", icon: Repeat2 },
} as const;
