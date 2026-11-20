import { useCallback, useEffect, useRef, useState } from "react";
import { GestureEditorController, INITIAL_EDITOR_VIEW } from "./gestureEditor";
import type { GestureFrame } from "./gestureRecognition";

export const useGestureEditor = (onRequestReset: () => void) => {
  const [view, setView] = useState(INITIAL_EDITOR_VIEW);
  const controller = useRef<GestureEditorController | null>(null);
  const callback = useRef(onRequestReset);
  useEffect(() => { callback.current = onRequestReset; }, [onRequestReset]);
  useEffect(() => {
    const editor = new GestureEditorController(setView, () => callback.current());
    controller.current = editor;
    return () => { editor.dispose(); controller.current = null; };
  }, []);
  const onFrame = useCallback((frame: GestureFrame) => controller.current?.process(frame), []);
  return { view, onFrame };
};
