// src/components/UI/Polaroid.tsx
"use client";

import React, { useState } from "react";
import { Foto } from "../../types";
import { motion } from "framer-motion";

interface PolaroidProps {
  foto: Foto;
  onClick: (foto: Foto) => void;
  onHover: (id: number | null) => void;
}

export const Polaroid: React.FC<PolaroidProps> = ({
  foto,
  onClick,
  onHover,
}) => {
  return (
    <motion.div
      layoutId={`polaroid-${foto.id}`}
      onClick={() => onClick(foto)}
      onMouseEnter={() => onHover(foto.id)}
      onMouseLeave={() => onHover(null)}

      className={`relative ${foto.rotate} w-full max-w-[280px] md:max-w-[360px] shadow-2xl cursor-pointer transition-all duration-300
    bg-transparent border-white
    border-[12px] border-b-[64px] md:border-[18px] md:border-b-[96px]`}
    >
      <div
        id={`canvas-target-${foto.id}`}
        className="w-full aspect-square relative"
      >
      </div>
    </motion.div>
  );
};
