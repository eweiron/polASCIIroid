import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Foto } from "../../types";
import { Polaroid } from "./Polaroid";
import { FOTOS_MOCK } from "../../models/constantes";

interface MatrixCanvasProps {
  onSelectFoto: (foto: Foto) => void;
  onHoverFoto: (id: number | null) => void;
}

export const MatrixCanvas: React.FC<MatrixCanvasProps> = ({
  onSelectFoto,
  onHoverFoto,
}) => {
  return (
    <div className="w-full h-screen p-6 md:p-12 overflow-y-auto pointer-events-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-24 w-full max-w-7xl mx-auto place-items-center py-12">
        {FOTOS_MOCK.map((foto) => (
          <Polaroid
            key={foto.id}
            foto={foto}
            onClick={onSelectFoto}
            onHover={onHoverFoto}
          />
        ))}
      </div>
    </div>
  );
};
