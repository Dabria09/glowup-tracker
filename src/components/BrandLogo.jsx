import gguLogoGlow from "@/assets/ggu-logo-glow.png";

export default function BrandLogo({
  alt = "Girls Glowing Up",
  className = "w-40 mx-auto mb-4",
  style,
}) {
  return (
    <img
      src={gguLogoGlow}
      alt={alt}
      className={className}
      style={style}
    />
  );
}
