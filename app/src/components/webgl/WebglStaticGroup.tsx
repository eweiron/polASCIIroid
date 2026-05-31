"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AsciiShader } from "./AsciiShader";
import { Foto } from "../../types";

interface WebglStaticGroupProps {
  fotos: Foto[];
  hoveredId: number | null;
}

// --- MAGIA NEGRA: Generador de Textura Atlas ---
// Esta función crea un Canvas 2D invisible y dibuja tus caracteres en fila
const createAsciiTexture = () => {
  const chars = " ._-+,:;~<>@#"; // Tu cadena de caracteres (de más oscuro a más claro)
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const fontSize = 64;
  canvas.height = fontSize;
  canvas.width = fontSize * chars.length;

  // Fondo negro puro
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Tipografía blanca, fuente monospace (puedes poner 'Courier New' o la de tu portafolio)
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], i * fontSize + fontSize / 2, fontSize / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  // Estas dos líneas evitan que WebGL vuelva borrosas las letras (las mantiene crispadas/pixeladas)
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;

  return { texture, count: chars.length };
};

const SingleWebglPolaroid = ({
  foto,
  index,
  asciiAtlas,
  isHovered,
}: {
  foto: Foto;
  index: number;
  isHovered: boolean;
  asciiAtlas: { texture: THREE.CanvasTexture; count: number };
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const textura = useTexture(foto.src);
  const { viewport } = useThree();

  useEffect(() => {
    if (textura) {
      // 1. Matamos el suavizado de la foto original
      textura.minFilter = THREE.NearestFilter;
      textura.magFilter = THREE.NearestFilter;
      textura.needsUpdate = true;
    }
  }, [textura]);

  useFrame(() => {
    if (materialRef.current) {
      // Usamos el isHovered que viene desde el HTML
      const target = isHovered ? 1.0 : 0.0;
      materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uHover.value,
        target,
        0.02,
      );
      materialRef.current.needsUpdate = true;
    }

    const domEl = document.getElementById(`canvas-target-${foto.id}`);
    if (domEl && meshRef.current) {
      const rect = domEl.getBoundingClientRect();
      const x =
        ((rect.left + rect.width / 2) / window.innerWidth) * viewport.width -
        viewport.width / 2;
      const y =
        -((rect.top + rect.height / 2) / window.innerHeight) * viewport.height +
        viewport.height / 2;
      meshRef.current.position.set(x, y, 0);

      const scaleX = (domEl.offsetWidth / window.innerWidth) * viewport.width;
      const scaleY =
        (domEl.offsetHeight / window.innerHeight) * viewport.height;
      meshRef.current.scale.set(scaleX, scaleY, 1);

      const isNegative = foto.rotate.startsWith("-");
      const num = parseInt(foto.rotate.replace(/\D/g, "")) || 0;
      const deg = isNegative ? -num : num;
      meshRef.current.rotation.z = deg * (-Math.PI / 180);
    }
  });

  return (
    <mesh ref={meshRef} dispose={null}>
      <planeGeometry args={[1, 1]} dispose={null} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={AsciiShader.vertexShader}
        fragmentShader={AsciiShader.fragmentShader}
        uniforms={{
          tDiffuse: { value: textura },
          uHover: { value: 0.0 },
          // Pasamos el atlas y la cantidad de letras al Shader
          tAscii: { value: asciiAtlas.texture },
          uCharCount: { value: asciiAtlas.count },
        }}
        depthWrite={false}
        depthTest={false}
        dispose={null}
      />
    </mesh>
  );
};

export const WebglStaticGroup: React.FC<WebglStaticGroupProps> = ({
  fotos,
  hoveredId,
}) => {
  // Generamos el atlas UNA SOLA VEZ cuando arranca el Canvas
  const asciiAtlas = useMemo(() => createAsciiTexture(), []);

  return (
    <group dispose={null}>
      {fotos.map((foto, index) => (
        <SingleWebglPolaroid
          key={foto.id}
          foto={foto}
          index={index}
          asciiAtlas={asciiAtlas}
          isHovered={hoveredId === foto.id}
        />
      ))}
    </group>
  );
};
