import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

/**
 * Altura do teclado em px — para reposicionar bottom sheets acima do teclado.
 * Funciona no Capacitor (iOS) e no Safari via visualViewport.
 */
export function useKeyboardInset(active: boolean): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (!active) {
      setInset(0);
      return;
    }

    if (Capacitor.isNativePlatform()) {
      const handles: { remove: () => Promise<void> }[] = [];
      let cancelled = false;

      const onShow = (event: { keyboardHeight: number }) => {
        setInset(event.keyboardHeight);
      };
      const onHide = () => setInset(0);

      void (async () => {
        handles.push(
          await Keyboard.addListener("keyboardWillShow", onShow),
        );
        handles.push(await Keyboard.addListener("keyboardDidShow", onShow));
        handles.push(
          await Keyboard.addListener("keyboardWillHide", onHide),
        );
        handles.push(await Keyboard.addListener("keyboardDidHide", onHide));

        if (cancelled) {
          await Promise.all(handles.map((handle) => handle.remove()));
        }
      })();

      return () => {
        cancelled = true;
        void Promise.all(handles.map((handle) => handle.remove()));
      };
    }

    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const keyboardHeight =
        window.innerHeight - viewport.height - viewport.offsetTop;
      setInset(Math.max(0, Math.round(keyboardHeight)));
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, [active]);

  return inset;
}
