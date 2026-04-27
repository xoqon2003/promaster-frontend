/**
 * `searchMapStore` — Search sahifasi uchun xarita va grid hover sinxronizatsiyasi.
 *
 * Task: T3.16
 *
 * Grid'dagi MasterCard hover → xaritada mos pin highlight.
 * Xaritadagi pin hover → grid'da mos MasterCard highlight.
 * Ikki komponent bitta store orqali muloqot qiladi (prop drilling yo'q).
 */
import { create } from 'zustand';

interface SearchMapState {
  /** Hozir hoverlangan usta ID'si. `null` — hover yo'q. */
  hoveredMasterId: string | null;

  setHoveredMasterId: (id: string | null) => void;
}

export const useSearchMapStore = create<SearchMapState>((set) => ({
  hoveredMasterId: null,
  setHoveredMasterId: (id) => set({ hoveredMasterId: id }),
}));
