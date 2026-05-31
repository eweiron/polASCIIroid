"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Foto } from "../../types";
import { WebglStaticGroup } from "./WebglStaticGroup";

interface SceneContainerProps {
  fotos: Foto[];
  hoveredId: number | null;
}

export const SceneContainer: React.FC<SceneContainerProps> = ({
  fotos,
  hoveredId,
}) => {
  return (
    <div className="fixed inset-0 w-full h-screen pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="w-full h-full"
        //Obligamos a que renderice a resolución estándar (1x) sin importar la pantalla
        dpr={[1, 1]}
        gl={{
          antialias: false,
          alpha: true,
          // Cambiamos a "default" para evitar bugs de drivers en Windows al cambiar de GPU integrada a dedicada
          powerPreference: "default",
        }}
      >
        {/* Evita que el Canvas se atragante intentando cargar texturas de golpe */}
        <Suspense fallback={null}>
          <WebglStaticGroup fotos={fotos} hoveredId={hoveredId} />
        </Suspense>
      </Canvas>
    </div>
  );
};
