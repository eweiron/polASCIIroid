export interface Foto {
  id: number;
  src: string;
  srcHighRes?: string;
  titulo: string;
  fecha: string;
  ubicacion: string;
  categoria: "polaroids" | "pintura" | "boneka";
  top: string; // Ej: "10%"
  left: string; // Ej: "15%"
  rotate: string; // Ej: "-rotate-3" o "rotate-2"
}
