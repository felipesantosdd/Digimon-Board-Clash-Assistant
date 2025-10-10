"use client";

import { useEffect, useRef } from "react";

interface D20DisplayProps {
  value: number;
  isRolling: boolean;
  label?: string;
  damageDealt?: number;
}

export default function D20Display({
  value,
  isRolling,
  label,
  damageDealt,
}: D20DisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = window.innerWidth < 640 ? 60 : 100;
    canvas.width = size;
    canvas.height = size;

    // Limpar canvas
    ctx.clearRect(0, 0, size, size);

    // Não desenhar se não há valor e não está rolando
    if (value === 0 && !isRolling) return;

    // Desenhar D20
    ctx.save();
    ctx.translate(size / 2, size / 2);

    // Sombra
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Constantes responsivas
    const radius = size * 0.35;
    const fontSize = size * 0.32;
    const rollFontSize = size * 0.2;
    const lineWidth = size * 0.02;

    // Gradiente do dado
    const gradientSize = radius * 0.86; // ~30 para 100px, ~18 para 60px
    const gradient = ctx.createLinearGradient(
      -gradientSize,
      -gradientSize,
      gradientSize,
      gradientSize
    );
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#e0e0e0");
    ctx.fillStyle = gradient;

    // Desenhar icosaedro simplificado (D20)
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Desenhar número
    if (value > 0 && !isRolling) {
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle =
        value === 20 ? "#FFD700" : value === 1 ? "#FF0000" : "#333";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(value.toString(), 0, 0);
    } else if (isRolling) {
      ctx.font = `bold ${rollFontSize}px Arial`;
      ctx.fillStyle = "#666";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", 0, 0);
    }

    ctx.restore();
  }, [value, isRolling]);

  return (
    <div className="flex flex-col items-center">
      {label && (
        <p className="text-xs sm:text-sm text-gray-400 font-semibold">
          {label}
        </p>
      )}

      <canvas
        ref={canvasRef}
        className={`w-[60px] h-[60px] sm:w-[100px] sm:h-[100px] transition-transform ${
          isRolling ? "animate-spin" : ""
        }`}
      />

      {!isRolling && value === 0 && (
        <p className="text-gray-400 text-xs sm:text-sm">Aguardando...</p>
      )}

      {!isRolling && value > 0 && damageDealt !== undefined && (
        <div className="bg-gray-600 rounded p-1.5 sm:p-2 text-center w-full">
          <p className="text-[10px] sm:text-xs text-gray-400">Dano</p>
          <p className="text-sm sm:text-xl font-bold text-blue-400">
            {damageDealt >= 1000
              ? `${Math.floor(damageDealt / 1000)}k`
              : damageDealt.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
