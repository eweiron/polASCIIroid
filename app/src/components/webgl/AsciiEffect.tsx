"use client";
import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
//@ts-ignore
import { AsciiEffect as ThreeAsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";

interface AsciiEffectProps {
  caracteres?: string;
  resolution?: number;
}

export const AsciiEffect: React.FC<AsciiEffectProps> = ({
  caracteres = " .:-+*=%@#",
  resolution = 0.2,
}) => {
  const { gl, scene, camera, size } = useThree();

  // Efecto analogo de Three.js
  const effect = useMemo(() => {
    const ascii = new ThreeAsciiEffect(gl, caracteres, {
      invert: true,
      color: true,
      resolution,
    });

    ascii.domElement.style.position = "absolute";
    ascii.domElement.style.top = "0px";
    ascii.domElement.style.left = "0px";
    ascii.domElement.style.pointerEvents = "none";
    return ascii;
  }, [gl, caracteres, resolution]);

  // Sobreponer el efecto ASCII al DOM y ocultar el canvas 3D
  useEffect(() => {
    gl.domElement.style.opacity = "0";
    const parent = gl.domElement.parentNode;
    if (parent) parent.appendChild(effect.domElement);

    return () => {
      gl.domElement.style.opacity = "1";
      if (parent) parent.removeChild(effect.domElement);
    };
  }, [gl, effect]);

  // Ajustar el tamaño del texto si se cambia el tamaño de la UI
  useEffect(() => {
    effect.setSize(size.width, size.height);
  }, [effect, size]);

  //Renderizar loop cuadro a cuadro
  useFrame(() => {
    effect.render(scene, camera);
  }, 1);

  return null;
};
