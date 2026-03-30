import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConversationalTriagePanel } from "./ConversationalTriagePanel";

const SM = "(min-width: 640px)";

export default function TriageDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(SM).matches : true
  );

  useEffect(() => {
    const m = window.matchMedia(SM);
    const fn = () => setIsDesktop(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="triage-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              backgroundColor: "rgba(0,0,0,0.45)",
            }}
          />
          <motion.div
            key="triage-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Conversational triage"
            initial={isDesktop ? { x: "100%" } : { y: "100%" }}
            animate={{ x: 0, y: 0 }}
            exit={isDesktop ? { x: "100%" } : { y: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            style={
              isDesktop
                ? {
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "min(440px, 100vw - 24px)",
                    zIndex: 301,
                    backgroundColor: "var(--color-bg-main)",
                    borderLeft: "1px solid var(--color-border)",
                    boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "100%",
                    overflow: "hidden",
                  }
                : {
                    position: "fixed",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "min(88dvh, 100%)",
                    zIndex: 301,
                    backgroundColor: "var(--color-bg-main)",
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    border: "1px solid var(--color-border)",
                    borderBottom: "none",
                    boxShadow: "0 -8px 32px rgba(0,0,0,0.12)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }
            }
          >
            <ConversationalTriagePanel variant="drawer" onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
