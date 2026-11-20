import { useState } from "react";
import { createPortal } from "react-dom";
import { useGesture } from "./useGesture";
import { useGestureEditor } from "./useGestureEditor";
import { AlertCircle, Camera, Crosshair, Hand, Maximize2, Minimize2, StopCircle, Trash2, X } from "lucide-react";
import type { GestureType } from "@/types";
import "./gesture.css";

const LABELS: Record<GestureType, string> = { none: "Sin gesto", pinch: "Pinza", open: "Mano abierta", thumbsUp: "Pulgar arriba", fist: "Puño cerrado" };
interface GestureCameraProps {
  enabled?: boolean;
  onRequestReset: () => void;
  onClose: () => void;
}
export const GestureCamera = ({ enabled = false, onRequestReset, onClose }: GestureCameraProps) => {
  const [minimized, setMinimized] = useState(false);
  const [sensitivity, setSensitivity] = useState(1);
  const { view, onFrame } = useGestureEditor(onRequestReset);
  const { stage, frame, isLoading, isActive, error, videoRef, startCamera, stopCamera, calibrate } = useGesture({ onFrame, enabled, sensitivity });
  const cursorX = Math.max(0, Math.min(window.innerWidth - 1, frame.x * window.innerWidth));
  const cursorY = Math.max(0, Math.min(window.innerHeight - 1, frame.y * window.innerHeight));
  const portalTarget = document.querySelector("dialog[open]") ?? document.body;

  return <>
    <section id="gesture-panel" aria-label="Cámara y gestos" className={`gesture-camera-panel ${minimized ? "gesture-camera-panel--minimized" : ""}`}>
      <header className="gesture-camera-header">
        <h2><Hand size={17} aria-hidden="true" /> Control gestual</h2>
        <div>
          <button type="button" data-gesture-click aria-label={minimized ? "Mostrar vista previa" : "Minimizar cámara"} onClick={() => setMinimized((value) => !value)}>{minimized ? <Maximize2 size={17} /> : <Minimize2 size={17} />}</button>
          <button type="button" data-gesture-click aria-label="Cerrar cámara" onClick={onClose}><X size={19} /></button>
        </div>
      </header>
      <div className="gesture-preview" hidden={minimized}>
        <video ref={videoRef} autoPlay muted playsInline aria-label="Vista previa de la cámara" />
        {!isActive && <span className="gesture-preview-placeholder"><Camera size={24} /> Cámara apagada</span>}
      </div>
      <p className={`gesture-tracking ${frame.isTracking ? "gesture-tracking--found" : ""}`}>
        <span /> {stage === "ready" ? frame.isTracking ? `${frame.handedness === "Left" ? "Mano izquierda" : "Mano derecha"} · ${LABELS[frame.type]}` : "Muestra una mano completa" : stage === "permission" ? "Esperando permiso de cámara…" : stage === "model" ? "Cargando MediaPipe…" : "Cámara desactivada"}
      </p>
      {isLoading && <p role="status" className="gesture-small">{stage === "permission" ? "Permite el acceso en el navegador. Puedes cancelar en cualquier momento." : "La primera carga descarga el modelo. Necesitas conexión a internet."}</p>}
      {(!minimized || stage !== "ready") && <div className="gesture-camera-actions">
        <button type="button" data-gesture-click disabled={!enabled} onClick={isActive || isLoading ? stopCamera : startCamera}>
          {isActive || isLoading ? <StopCircle size={17} /> : <Camera size={17} />}{isLoading ? "Cancelar" : isActive ? "Desactivar cámara" : "Activar cámara"}
        </button>
        {stage === "ready" && <button type="button" data-gesture-click disabled={!frame.isTracking} onClick={calibrate} aria-label="Centrar cursor" title="Coloca la mano cómodamente y centra el cursor"><Crosshair size={19} /></button>}
      </div>}
      {error && <p role="alert" className="gesture-error"><AlertCircle size={16} />{error}</p>}
      {!minimized && <p className="gesture-feedback" role="status">{stage === "ready" ? view.message : "La cámara es opcional. El mouse y la pantalla táctil siguen disponibles."}</p>}
      {!minimized && <>
        <label className="gesture-sensitivity">Sensibilidad del cursor <span>{sensitivity.toFixed(1)}×</span><input type="range" min="0.7" max="1.6" step="0.1" value={sensitivity} onChange={(event) => setSensitivity(Number(event.target.value))} /></label>
        <ul className="gesture-guide">
          <li><strong>Mano abierta:</strong> soltar y preparar el siguiente agarre.</li>
          <li><strong>Pinza:</strong> junta pulgar e índice con los otros dedos abiertos; mueve la pieza a Tu programa.</li>
          <li><strong>Pulgar arriba:</strong> mantener 0,6 s para ejecutar.</li>
          <li><strong>Puño:</strong> mantener 0,9 s para solicitar reinicio.</li>
        </ul>
        <p className="gesture-small">Para pulsar botones, haz pinza y abre la mano sobre el mismo botón. Acerca el cursor al borde superior o inferior para desplazar la lista o la página.</p>
        <p className="gesture-privacy">Procesamiento local, sin grabaciones. Al cerrar este panel o cambiar de pestaña se apaga la cámara.</p>
      </>}
    </section>
    {stage === "ready" && frame.isTracking && createPortal(
      <div className="gesture-overlay" aria-hidden="true">
        <div className={`gesture-cursor ${view.label ? "gesture-cursor--holding" : ""}`} style={{ left: cursorX, top: cursorY }}>
          <Hand size={22} /><span>{frame.holdProgress < 1 && frame.candidate !== "none" ? `Mantén ${LABELS[frame.candidate]}` : LABELS[frame.type]}</span>
          {frame.holdProgress > 0 && frame.holdProgress < 1 && <i style={{ width: `${frame.holdProgress * 100}%` }} />}
        </div>
        {view.label && <>
          <div className="gesture-block-preview" style={{ left: Math.max(8, Math.min(window.innerWidth - 160, cursorX + 20)), top: Math.max(8, Math.min(window.innerHeight - 50, cursorY + 24)) }}>{view.label}<small>{view.target === "program" ? "Abre para colocar" : "Bloque agarrado"}</small></div>
          <div className={`gesture-trash ${view.target === "trash" ? "gesture-trash--over" : ""}`} data-gesture-trash><Trash2 size={20} /> Soltar para eliminar</div>
        </>}
      </div>, portalTarget,
    )}
  </>;
};
