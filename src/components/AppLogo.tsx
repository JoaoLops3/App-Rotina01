interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 64, className = "" }: AppLogoProps) {
  return (
    <img
      src="/trilho-logo.png"
      alt="Trilho"
      width={size}
      height={size}
      decoding="async"
      className={`rounded-[22px] ${className}`}
      style={{ boxShadow: "0 0 40px rgba(52, 211, 153, 0.25)" }}
    />
  );
}
