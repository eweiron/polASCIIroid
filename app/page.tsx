"use client";

import { useState } from "react";
import { MatrixCanvas } from "./src/components/UI/MatrixCanvas";
import { FOTOS_MOCK } from "./src/models/constantes";
import { Foto } from "./src/types";
import { motion, AnimatePresence } from "framer-motion";
import { useEscapeKey } from "./src/hooks/useEscapeKey";
import dynamic from "next/dynamic";

// Importación dinámica aislada para WebGL
const SceneContainer = dynamic(
  () =>
    import("../app/src/components/webgl/SceneContainer").then(
      (mod) => mod.SceneContainer,
    ),
  { ssr: false },
) as any;

export default function Home() {
  const [fotoSeleccionada, setFotoSeleccionada] = useState<Foto | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [modalInfo, setModalInfo] = useState(false);
  useEscapeKey(() => setFotoSeleccionada(null), !!fotoSeleccionada);
  const handleOpenModal = (foto: Foto) => {
    // Le clavamos un aviso al HTML crudo antes de que React parpadee
    document.body.setAttribute("data-selected-id", foto.id.toString());
    setFotoSeleccionada(foto);
  };

  const handleCloseModal = () => {
    // Borramos el aviso instantáneamente
    document.body.removeAttribute("data-selected-id");
    setFotoSeleccionada(null);
  };

  // Actualizamos el Escape Key para usar la función maestra
  useEscapeKey(() => {
    if (fotoSeleccionada) handleCloseModal();
    if (modalInfo) setModalInfo(false);
  }, !!fotoSeleccionada || modalInfo);

  return (
    <main className="w-full h-screen bg-[#121212] text-white font-mono overflow-hidden relative">
      {/* Canvas Único Global de Fondo */}
      {/* TEXTURA LATERAL IZQUIERDA */}
      <div
        className="fixed top-0 left-0 w-1/3 md:w-[400px] h-full z-0 pointer-events-none opacity-40 mix-blend-screen contrast-150 grayscale"
        style={{
          backgroundImage: "url('/gnrl/fondo-textura.webp')",
          // LA MAGIA:
          backgroundSize: "contain",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
        }}
      />
      {/* TEXTURA LATERAL DERECHA (ESPEJO) */}
      <div
        className="fixed top-0 right-0 w-1/3 md:w-[400px] h-full z-0 pointer-events-none opacity-40 mix-blend-screen contrast-150 grayscale transform -scale-x-100"
        style={{
          backgroundImage: "url('/gnrl/fondo-textura.webp')",
          // LA MAGIA:
          backgroundSize: "contain",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
        }}
      />
      <SceneContainer fotos={FOTOS_MOCK} hoveredId={hoveredId} />
      {/* Capa HTML encima del Canvas */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        <header className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
          <div
            className="text-xs tracking-widest cursor-pointer hover:opacity-70"
            onClick={() => setModalInfo(true)}
          >
            INFO
          </div>
          <div className="text-sm font-bold tracking-[0.3em]">AARON YÁÑEZ</div>
          <div className="text-xs tracking-widest cursor-pointer hover:opacity-70">
            POLAROIDS
          </div>
        </header>

        {/* El contenedor con la rejilla de tus fotos */}
        <div className="w-full h-full pointer-events-auto">
          <MatrixCanvas
            onSelectFoto={handleOpenModal}
            onHoverFoto={(id) => setHoveredId(id)}
          />
        </div>
      </div>
      {/* Render condicional de la vista de Detalle (Modal) */}
      <AnimatePresence>
        {fotoSeleccionada && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
            onClick={handleCloseModal}
          >
            <div className="absolute inset-0 w-screen h-screen bg-[#121212] z-0 overflow-hidden">
              <img
                src="/gnrl/fondo-textura.webp"
                alt="textura de fondo"
                // object-cover Estira la imagen horizontal y verticalmente sin deformarla hasta que no quede un solo pixel vacío.
                className="absolute inset-0 w-full h-full object-cover grayscale"
              />
            </div>

            {/* Botón ESC (Lo subimos de z-index para que esté por encima del cristal) */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute top-6 right-6 text-xs tracking-widest border border-white/20 px-2 py-1 hover:bg-white hover:text-black transition-colors z-50"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseModal();
              }}
            >
              [ESC]
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                layout: { type: "spring", stiffness: 300, damping: 30 },
              }}
              layoutId={`polaroid-${fotoSeleccionada.id}`}
              className="relative z-10 bg-white p-4 pb-12 shadow-2xl max-w-lg w-full text-black flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                id={`modal-target-${fotoSeleccionada.id}`}
                className="w-full aspect-square bg-gray-200 overflow-hidden"
              >
                <img
                  src={fotoSeleccionada.srcHighRes || fotoSeleccionada.src}
                  alt={fotoSeleccionada.titulo}
                  className="w-full h-full object-cover filter contrast-125 saturate-75"
                />
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[10px] sm:text-xs font-mono leading-relaxed uppercase tracking-wider text-gray-800"
              >
                <p>
                  <span className="font-bold text-black">TITULO:</span>{" "}
                  {fotoSeleccionada.titulo}
                </p>
                <p>
                  <span className="font-bold text-black">FECHA:</span>{" "}
                  {fotoSeleccionada.fecha}
                </p>
                <p>
                  <span className="font-bold text-black">UBICACION:</span>{" "}
                  {fotoSeleccionada.ubicacion}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* === MODAL DE SEMBLANZA / INFO =========================================== */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {modalInfo && (
          <motion.div
            key="info-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-lg pointer-events-auto"
            onClick={() => setModalInfo(false)}
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute top-6 right-6 text-xs tracking-widest border border-white/20 px-2 py-1 hover:bg-white hover:text-black transition-colors z-[110]"
              onClick={(e) => {
                e.stopPropagation();
                setModalInfo(false);
              }}
            >
              [ESC]
            </motion.button>

            {/* Contenedor del Texto */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-2xl max-h-[80vh] bg-[#121212] border border-white/20 p-8 md:p-12 overflow-y-auto shadow-2xl custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl md:text-2xl font-bold tracking-[0.3em] mb-8 border-b border-white/20 pb-4">
                PolASCIIroid
              </h2>

              <div className="space-y-6 text-sm md:text-base leading-relaxed text-gray-300 font-mono tracking-wide">
                <p>
                  La Polaroid es un objeto único e irrepetible, al ver una
                  interactuas con los mismos fotones que interactuaron con la
                  materia ese mismo día. La red social iguala todo bajo un mismo
                  estándar; este sitio busca la regresar esta presencia de
                  singularidad a mis polaroids, junto a ser un espacio digital
                  donde puedo compartir mis fotografías.
                </p>
                <p>
                  Esta plataforma web interactiva está diseñada como una mirada
                  a mi archivo personal de fotografía instantánea (Polaroid). El
                  proyecto contrapone la saturación visual de las redes sociales
                  actuales mediante un mecanismo de revelado digital: cada
                  imagen se presenta inicialmente como un bloque de arte ASCII,
                  requiriendo la interacción consciente del usuario (click) para
                  ser observada, emulando así el tiempo de espera físico del
                  revelado químico.
                </p>
                <p>
                  Todas estas fotografías han sido realizadas con mi polaroid
                  OneStep+ y con papel fotografico i-Type, durante el 2025 y
                  2026, este archivo es profundamente personal, es una vista a
                  los momentos validoso de mi vida, los cuales han corrido la
                  suerte de ser inmortalizados por que ese día llevaba la cámara
                  instantánea.
                </p>
                <p>
                  El presente proyecto fue creado en JS con React 19, con Next.
                  Empleando librerías como Three JS y Framer Motion.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
