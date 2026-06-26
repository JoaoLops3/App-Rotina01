import type { AvatarStyle } from "../types/avatar";

const DICEBEAR_BASE = "https://api.dicebear.com/10.x";

// Fundo sólido embutido no SVG para o avatar renderizar igual em qualquer lugar
// (header, perfil, grid), sem depender do que estiver atrás dele. O DiceBear
// escolhe uma cor da lista de forma determinística pelo seed.
const BACKGROUND_COLORS = "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf";

export function buildAvatarUrl(style: AvatarStyle, seed: string): string {
  return `${DICEBEAR_BASE}/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${BACKGROUND_COLORS}`;
}
