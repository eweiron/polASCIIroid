import { useEffect } from "react";


export const useEscapeKey = (
  onEscapeCallback: () => void,
  active: boolean = true,
) => {
  useEffect(() => {
    // Si no está activo, no hacemos nada
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Esc") {
        onEscapeCallback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Limpieza automática incorporada
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onEscapeCallback, active]); // Se vuelve a sincronizar si cambia el callback o el estado activo
};
