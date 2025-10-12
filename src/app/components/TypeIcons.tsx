import React from "react";

interface TypeIconProps {
  typeId: number;
  className?: string;
  size?: number;
}

export const TypeIcon: React.FC<TypeIconProps> = ({
  typeId,
  className = "",
  size = 24,
}) => {
  const iconProps = {
    width: size,
    height: size,
    className: `inline-block ${className}`,
    viewBox: "0 0 24 24",
  };

  switch (typeId) {
    case 1: // Data - Estrela de 8 pontas com pontos internos
      return (
        <img
          src={"/images/icons/data-icon.png"}
          alt="Data"
          className="w-[25px] h-[25px] object-cover"
          style={{
            filter:
              "drop-shadow(0 0 2px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 4px rgba(0, 0, 0, 0.6))",
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/icons/data-icon.png";
          }}
        />
      );

    case 2: // Vaccine - Forma orgânica com gota e pontos
      return (
        <img
          src={"/images/icons/vaccine-icon.png"}
          alt="Vaccine"
          className="w-[25px] h-[25px] object-cover"
          style={{
            filter:
              "drop-shadow(0 0 2px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 4px rgba(0, 0, 0, 0.6))",
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/icons/vaccine-icon.png";
          }}
        />
      );

    case 3: // Virus - Forma com chifre e linha lateral
      return (
        <img
          src={"/images/icons/virus-icon.png"}
          alt="Virus"
          className="w-[25px] h-[25px] object-cover"
          style={{
            filter:
              "drop-shadow(0 0 2px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 4px rgba(0, 0, 0, 0.6))",
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/icons/virus-icon.png";
          }}
        />
      );

    case 4: // Free - Estrela de 8 pontas
      return (
        <img
          src={"/images/icons/free-icon.png"}
          alt="Free"
          className="w-[25px] h-[25px] object-cover"
          style={{
            filter:
              "drop-shadow(0 0 2px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 4px rgba(0, 0, 0, 0.6))",
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/icons/free-icon.png";
          }}
        />
      );

    case 5: // Variable - Cubo 3D com face
      return (
        <img
          src={"/images/icons/variable-icon.png"}
          alt="Variable"
          className="w-[25px] h-[25px] object-cover"
          style={{
            filter:
              "drop-shadow(0 0 2px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 4px rgba(0, 0, 0, 0.6))",
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/icons/variable-icon.png";
          }}
        />
      );

    case 6: // Unknown - Forma circular com olhos triangulares
      return (
        <img
          src={"/images/icons/unknown-icon.png"}
          alt="Unknown"
          className="w-[25px] h-[25px] object-cover"
          style={{
            filter:
              "drop-shadow(0 0 2px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 4px rgba(0, 0, 0, 0.6))",
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/icons/unknown-icon.png";
          }}
        />
      );

    default:
      return (
        <img
          src={"/images/icons/no-data-icon.png"}
          alt="No Data"
          className="w-[25px] h-[25px] object-cover"
          style={{
            filter:
              "drop-shadow(0 0 2px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 4px rgba(0, 0, 0, 0.6))",
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/icons/no-data-icon.png";
          }}
        />
      );
  }
};

export default TypeIcon;
