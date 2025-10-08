"use client";

import { useState, useEffect, useRef } from "react";
import { useSnackbar } from "notistack";

interface DamageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (damage: number) => void;
  digimonName: string;
}

export default function DamageDialog({
  isOpen,
  onClose,
  onConfirm,
  digimonName,
}: DamageDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [damageInput, setDamageInput] = useState("");
  const [diceValue, setDiceValue] = useState(20);
  const [isRolling, setIsRolling] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDamageInput("");
      setDiceValue(20);
      setIsRolling(false);
    }
  }, [isOpen]);

  // Desenhar D20 no canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 120;
    canvas.width = size;
    canvas.height = size;

    // Limpar canvas
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 50;

    // Desenhar hexágono (representação simplificada do D20)
    const sides = 6;
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();

    // Gradiente baseado no valor
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    if (diceValue === 20) {
      // Crítico - dourado
      gradient.addColorStop(0, "#fbbf24");
      gradient.addColorStop(1, "#f59e0b");
    } else if (diceValue === 1) {
      // Falha crítica - vermelho
      gradient.addColorStop(0, "#ef4444");
      gradient.addColorStop(1, "#dc2626");
    } else if (diceValue >= 15) {
      // Alto - verde
      gradient.addColorStop(0, "#22c55e");
      gradient.addColorStop(1, "#16a34a");
    } else if (diceValue >= 10) {
      // Médio - azul
      gradient.addColorStop(0, "#3b82f6");
      gradient.addColorStop(1, "#2563eb");
    } else {
      // Baixo - cinza
      gradient.addColorStop(0, "#6b7280");
      gradient.addColorStop(1, "#4b5563");
    }

    ctx.fillStyle = gradient;
    ctx.fill();

    // Borda
    ctx.strokeStyle = isRolling ? "#ffffff" : "#374151";
    ctx.lineWidth = isRolling ? 4 : 2;
    ctx.stroke();

    // Linhas internas (para dar efeito 3D)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();

    // Número no centro
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 4;
    ctx.fillText(diceValue.toString(), centerX, centerY);
    ctx.shadowBlur = 0;
  }, [diceValue, isRolling]);

  const rollDice = () => {
    setIsRolling(true);

    // Animação de rolagem
    let count = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 20) + 1);
      count++;

      if (count >= 15) {
        clearInterval(rollInterval);
        const finalValue = Math.floor(Math.random() * 20) + 1;
        setDiceValue(finalValue);
        setIsRolling(false);

        // Feedback baseado no resultado
        if (finalValue === 20) {
          enqueueSnackbar("🎉 CRÍTICO! Rolou 20!", { variant: "success" });
        } else if (finalValue === 1) {
          enqueueSnackbar("💀 Falha crítica... Rolou 1!", { variant: "error" });
        }
      }
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Permitir apenas números e limitar a 2 dígitos
    if (value === "" || /^\d{1,2}$/.test(value)) {
      setDamageInput(value);
    }
  };

  const handleConfirm = () => {
    if (damageInput === "" || damageInput === "0") {
      return;
    }

    // Aplicar dano final calculado com multiplicador do D20
    onConfirm(finalDamage);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  const baseDamage = damageInput ? parseInt(damageInput, 10) * 1000 : 0;
  const diceMultiplier = diceValue * 0.05; // Cada número = 5%
  const finalDamage = Math.round(baseDamage * diceMultiplier);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl max-w-sm w-full border-2 border-red-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-t-lg">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">⚔️</span>
            Aplicar Dano
          </h3>
          <p className="text-sm text-red-100 mt-1">{digimonName}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Digite o valor (será multiplicado por 1000)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={damageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ex: 5"
              autoFocus
              className="w-full px-4 py-3 bg-gray-700 text-white text-2xl font-bold text-center rounded-lg border-2 border-gray-600 focus:border-red-500 focus:outline-none transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1 text-center">
              Máximo: 99 (99.000 de dano)
            </p>
          </div>

          {/* D20 */}
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <div className="flex flex-col items-center gap-3">
              <canvas
                ref={canvasRef}
                className={`transition-transform duration-100 ${
                  isRolling ? "animate-spin" : ""
                }`}
                style={{ width: "120px", height: "120px" }}
              />
              <button
                type="button"
                onClick={rollDice}
                disabled={isRolling}
                className={`px-6 py-2 font-bold rounded-lg transition-all ${
                  isRolling
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105"
                }`}
              >
                {isRolling ? "🎲 Rolando..." : "🎲 Rolar D20"}
              </button>
            </div>
          </div>

          {/* Cálculo do Dano Final */}
          {damageInput && (
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 border-2 border-red-500 shadow-lg">
              <div className="space-y-3">
                {/* Dano Base */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Dano Base:</span>
                  <span className="text-white font-bold">
                    {baseDamage.toLocaleString()}
                  </span>
                </div>

                {/* Multiplicador do Dado */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">D20 ({diceValue}):</span>
                  <span className="text-purple-400 font-bold">
                    ×{diceMultiplier.toFixed(2)} (
                    {(diceMultiplier * 100).toFixed(0)}%)
                  </span>
                </div>

                {/* Separador */}
                <div className="border-t border-gray-600"></div>

                {/* Dano Final */}
                <div className="text-center pt-2">
                  <div className="text-xs text-gray-400 mb-2">
                    💥 DANO FINAL 💥
                  </div>
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    {finalDamage.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">pontos</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-900 px-6 py-4 rounded-b-lg border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!damageInput || damageInput === "0"}
            className={`flex-1 px-4 py-2 font-semibold rounded-lg transition-all ${
              damageInput && damageInput !== "0"
                ? "bg-red-600 text-white hover:bg-red-700 transform hover:scale-105"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            ⚔️ Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
