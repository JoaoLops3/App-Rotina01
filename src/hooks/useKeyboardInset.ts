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
      let showHandle: { remove: () => Promise<void> } | undefined;
      let hideHandle: { remove: () => Promise<void> } | undefined;

      void Keyboard.addListener("keyboardWillShow", (event) => {
        setInset(event.keyboardHeight);
      }).then((handle) => {
        showHandle = handle;
      });

      void Keyboard.addListener("keyboardWillHide", () => {
        setInset(0);
      }).then((handle) => {
        hideHandle = handle;
      });

      return () => {
        void showHandle?.remove();
        void hideHandle?.remove();
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
