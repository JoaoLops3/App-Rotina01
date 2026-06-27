import { useEffect, useState } from "react";
import { User } from "lucide-react";
import type { AvatarProps } from "../types/avatar";
import { buildAvatarUrl } from "../lib/avatar-url";

export function Avatar({
  seed,
  style = "toon-head",
  size,
  alt = "Avatar ilustrado do perfil",
  className = "",
}: AvatarProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );

  const url = buildAvatarUrl(style, seed);

  useEffect(() => {
    setStatus("loading");
  }, [url]);

  // Sem `size`, o avatar preenche 100% do container (responsivo). Com `size`,
  // fixa as dimensões em px. Em ambos os casos a imagem cobre toda a área.
  const sizeStyle = size ? { width: size, height: size } : undefined;

  return (
    <div
      className={`relative block aspect-square overflow-hidden ${className}`}
      style={sizeStyle}
    >
      {status === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-white/10" />
      )}

      {status === "error" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-primary">
          <User className="h-1/2 w-1/2 text-obsidian-400" strokeWidth={1.5} />
        </div>
      ) : (
        <img
          src={url}
          alt={alt}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: status === "loaded" ? 1 : 0 }}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
    </div>
  );
}
