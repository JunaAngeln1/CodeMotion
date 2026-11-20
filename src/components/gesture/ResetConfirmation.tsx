import { useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";

export const ResetConfirmation = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => {
  const ref = useRef<HTMLDialogElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    if (dialog && !dialog.open) {
      if (dialog.showModal) dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    cancelRef.current?.focus();
    return () => { if (dialog?.open) dialog.close?.(); previous?.focus(); };
  }, []);
  return (
    <dialog ref={ref} className="gesture-reset-dialog" aria-labelledby="reset-title" aria-describedby="reset-description" onCancel={(event) => { event.preventDefault(); onCancel(); }}>
      <span className="gesture-reset-icon"><RotateCcw size={28} /></span>
      <h2 id="reset-title">¿Reiniciar el desafío?</h2>
      <p id="reset-description">Se borrarán los bloques de este programa y el robot volverá al inicio. Tus puntos e insignias se conservan.</p>
      <p className="gesture-reset-hint">Con gestos: haz pinza sobre una opción y abre la mano para elegirla. Un puño por sí solo no borra nada.</p>
      <div className="gesture-reset-actions">
        <button ref={cancelRef} type="button" data-gesture-click onClick={onCancel}>Conservar mis bloques</button>
        <button type="button" data-gesture-click onClick={onConfirm}>Sí, reiniciar</button>
      </div>
    </dialog>
  );
};
