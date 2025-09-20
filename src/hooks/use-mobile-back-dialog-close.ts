import { useEffect } from "react";

export function useMobileBackDialogClose(isOpen: boolean, onClose: () => void) {
    useEffect(() => {
        if (!isOpen) return;
        // Only run on mobile
        if (typeof window === "undefined" || window.innerWidth >= 768) return;

        const onPopState = (e: PopStateEvent) => {
            onClose();
        };

        // Push a new state so back button triggers popstate
        window.history.pushState({ dialog: true }, "");
        window.addEventListener("popstate", onPopState);

        return () => {
            window.removeEventListener("popstate", onPopState);
            // When dialog closes, go back in history if the last state was our dialog
            if (window.history.state && window.history.state.dialog) {
                window.history.back();
            }
        };
    }, [isOpen, onClose]);
}
