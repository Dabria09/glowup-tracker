const GGU_LOGO_SRC = "https://media.base44.com/images/public/6a0e12a89992f9565c11e330/dc218d2c4_Untitleddesign.png";

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