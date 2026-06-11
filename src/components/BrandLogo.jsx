const GGU_LOGO_SRC = "/ggu-logo-glow.png";

export default function BrandLogo({
  alt = "Girls Glowing Up",
  className = "w-40 mx-auto mb-4",
  style,
}) {
  return (
    <img
      src={GGU_LOGO_SRC}
      alt={alt}
      className={className}
      style={style}
    />
  );
}
