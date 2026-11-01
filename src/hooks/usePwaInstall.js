import { useEffect, useState } from "react";
import { playSfx } from "@/utils/soundSystem";

let deferredPromptGlobal = null;
const listeners = new Set();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPromptGlobal = e;
    listeners.forEach((fn) => fn(deferredPromptGlobal));
  });

  window.addEventListener("appinstalled", () => {
    deferredPromptGlobal = null;
    listeners.forEach((fn) => fn(null));
  });
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(deferredPromptGlobal);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone =
        window.matchMedia?.("(display-mode: standalone)")?.matches ||
        window.navigator?.standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(Boolean(standalone));
    };
    checkStandalone();

    const ua = window.navigator?.userAgent || "";
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIos(Boolean(ios));

    const handler = (promptEvent) => {
      setDeferredPrompt(promptEvent);
      checkStandalone();
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  const triggerInstall = async () => {
    playSfx("tap");
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          deferredPromptGlobal = null;
          setDeferredPrompt(null);
        }
      } catch {}
      return;
    }
    setShowInstructionsModal(true);
  };

  return {
    canInstallNative: Boolean(deferredPrompt),
    isStandalone,
    isIos,
    showInstructionsModal,
    setShowInstructionsModal,
    triggerInstall,
  };
}
