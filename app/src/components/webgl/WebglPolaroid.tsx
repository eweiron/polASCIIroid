"use client";

import { useRef, useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AsciiShader } from "./AsciiShader";
import { Foto } from "../../types";

interface WebglPolaroidProps {
  foto: Foto;
  isHover: boolean; 
}

export const WebglPolaroid: React.FC<WebglPolaroidProps> = ({
  foto,
  isHover,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const textura = useTexture(foto.src);

  // Instanciamos los uniforms una sola vez usando useMemo para que React no los recree en cada render
  const customUniforms = useMemo(
    () => ({
      tDiffuse: { value: textura },
      uHover: { value: 0.0 },
    }),
    [textura],
  );

  // Corrección de volteado de imagen nativo en WebGL
  useEffect(() => {
    if (textura) {
      textura.flipY = true;
      textura.needsUpdate = true;
    }
  }, [textura]);

  useFrame((state) => {
    // A) Animación suave del Shader para el Hover (El ASCII)
    if (materialRef.current) {
      // 🔥 CORREGIDO: Usamos 'isHover' (la prop real) en lugar de 'isHovered'
      const target = isHover ? 1.0 : 0.0;

      materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uHover.value,
        target,
        0.04,
      );
      materialRef.current.needsUpdate = true;
    }

    // B) Rastreo del DOM (El truco para la animación Framer Motion -> 3D)
    // 1. Leemos a la velocidad de la luz si esta foto es la que está abierta
    const activeId = document.body.getAttribute("data-selected-id");
    const isThisPhotoSelected = activeId === foto.id.toString();

    // 2. Si está abierta, seguimos al Modal. En cuanto le dan cerrar, seguimos a la Cuadrícula.
    let domTarget = isThisPhotoSelected
      ? document.getElementById(`modal-target-${foto.id}`)
      : document.getElementById(`canvas-target-${foto.id}`);

    // Fallback de seguridad pura
    if (!domTarget) {
      domTarget = document.getElementById(`canvas-target-${foto.id}`);
    }

    if (!domTarget || !meshRef.current) return;

    // Calculamos dónde está y cuánto mide en ESTE fotograma exacto
    const bounds = domTarget.getBoundingClientRect();

    // Obtenemos las medidas del Canvas contenedor global
    const canvasBounds = state.gl.domElement.getBoundingClientRect();

    // --- LA MATEMÁTICA DE CONVERSIÓN (Pixeles a Unidades 3D) ---
    // 1. Calcular Ancho y Alto en unidades 3D
    const width3D = (bounds.width / canvasBounds.width) * state.viewport.width;
    const height3D =
      (bounds.height / canvasBounds.height) * state.viewport.height;

    // Asignamos la escala a la malla en tiempo real mientras Framer Motion la encoge
    meshRef.current.scale.set(width3D, height3D, 1);

    // 2. Calcular Posición X y Y en unidades 3D
    const xCenterDOM = bounds.left + bounds.width / 2;
    const yCenterDOM = bounds.top + bounds.height / 2;

    const x3D =
      (xCenterDOM / canvasBounds.width) * state.viewport.width -
      state.viewport.width / 2;
    const y3D =
      -(yCenterDOM / canvasBounds.height) * state.viewport.height +
      state.viewport.height / 2;

    // Movemos la malla sincronizada con el cierre del modal
    meshRef.current.position.set(x3D, y3D, 0);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={AsciiShader.vertexShader}
        fragmentShader={AsciiShader.fragmentShader}
        uniforms={customUniforms} 
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};
