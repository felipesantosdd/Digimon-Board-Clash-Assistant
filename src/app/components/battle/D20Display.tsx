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

    const size = 100;
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

    // Gradiente do dado
    const gradient = ctx.createLinearGradient(-30, -30, 30, 30);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#e0e0e0");
    ctx.fillStyle = gradient;

    // Desenhar icosaedro simplificado (D20)
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5;
      const x = Math.cos(angle) * 35;
      const y = Math.sin(angle) * 35;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Desenhar número
    if (value > 0 && !isRolling) {
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.font = "bold 32px Arial";
      ctx.fillStyle =
        value === 20 ? "#FFD700" : value === 1 ? "#FF0000" : "#333";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(value.toString(), 0, 0);
    } else if (isRolling) {
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#666";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", 0, 0);
    }

    ctx.restore();
  }, [value, isRolling]);

  return (
    <div className="flex flex-col items-center gap-2">
      {label && <p className="text-sm text-gray-400 font-semibold">{label}</p>}

      <canvas
        ref={canvasRef}
        className={`transition-transform ${isRolling ? "animate-spin" : ""}`}
        style={{ width: "100px", height: "100px" }}
      />

      {!isRolling && value === 0 && (
        <p className="text-gray-400 text-sm">Aguardando...</p>
      )}

      {!isRolling && value > 0 && damageDealt !== undefined && (
        <div className="bg-gray-600 rounded p-2 text-center w-full">
          <p className="text-xs text-gray-400">Dano Causado</p>
          <p className="text-xl font-bold text-blue-400">
            {damageDealt.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
