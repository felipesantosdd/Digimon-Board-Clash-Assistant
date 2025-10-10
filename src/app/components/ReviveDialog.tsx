"use client";

import { useState, useEffect, useRef } from "react";
import { useSnackbar } from "notistack";

interface ReviveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRevive: (success: boolean) => void;
  digimonName: string;
}

export default function ReviveDialog({
  isOpen,
  onClose,
  onRevive,
  digimonName,
}: ReviveDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [modifier, setModifier] = useState("");
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      setModifier("");
      setIsRolling(false);
      setDiceValue(100);
    }
  }, [isOpen]);

  // Desenhar D100 no canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = window.innerWidth < 640 ? 100 : 140;
    canvas.width = size;
    canvas.height = size;

    // Limpar canvas
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.43;

    // Desenhar círculo (D100)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);

    // Gradiente baseado no valor
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    if (diceValue <= 20) {
      // Sucesso garantido - dourado
      gradient.addColorStop(0, "#fbbf24");
      gradient.addColorStop(1, "#f59e0b");
    } else if (diceValue <= 50) {
      // Alto - verde
      gradient.addColorStop(0, "#22c55e");
      gradient.addColorStop(1, "#16a34a");
    } else if (diceValue <= 75) {
      // Médio - azul
      gradient.addColorStop(0, "#3b82f6");
      gradient.addColorStop(1, "#2563eb");
    } else {
      // Baixo/Falha - vermelho
      gradient.addColorStop(0, "#ef4444");
      gradient.addColorStop(1, "#dc2626");
    }

    ctx.fillStyle = gradient;
    ctx.fill();

    // Borda
    ctx.strokeStyle = isRolling ? "#ffffff" : "#374151";
    ctx.lineWidth = isRolling ? size * 0.036 : size * 0.021;
    ctx.stroke();

    // Número no centro
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${size * 0.29}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
    ctx.shadowBlur = 6;
    ctx.fillText(diceValue.toString(), centerX, centerY);
    ctx.shadowBlur = 0;

    // Label D100
    ctx.font = `bold ${size * 0.086}px Arial`;
    ctx.fillText("D100", centerX, centerY + radius + size * 0.107);
  }, [diceValue, isRolling]);

  const handleModifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Permitir apenas números e limitar a 100
    if (value === "" || (/^\d+$/.test(value) && parseInt(value, 10) <= 100)) {
      setModifier(value);
    }
  };

  const attemptRevive = () => {
    setIsRolling(true);

    const baseChance = 15; // Reduzido de 20% para 15%
    const modifierValue = modifier ? parseInt(modifier, 10) : 0;
    const totalChance = baseChance + modifierValue;

    // Animação de rolagem do dado
    let count = 0;
    const rollInterval = setInterval(() => {
      // Mostrar valores aleatórios durante a rolagem
      setDiceValue(Math.floor(Math.random() * 100) + 1);
      count++;

      if (count >= 20) {
        clearInterval(rollInterval);

        // Valor final
        const roll = Math.floor(Math.random() * 100) + 1;
        setDiceValue(roll);
        const success = roll <= totalChance;

        setIsRolling(false);

        // Feedback
        if (success) {
          enqueueSnackbar(
            `🌟 SUCESSO! Rolou ${roll}/${totalChance} - ${digimonName} reviveu!`,
            { variant: "success" }
          );
        } else {
          enqueueSnackbar(
            `💔 FALHOU! Rolou ${roll}/${totalChance} - ${digimonName} não reviveu...`,
            { variant: "error" }
          );
        }

        // Esperar um pouco antes de fechar
        setTimeout(() => {
          onRevive(success);
          onClose();
        }, 1500);
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isRolling) {
      attemptRevive();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  const baseChance = 15; // Reduzido de 20% para 15%
  const modifierValue = modifier ? parseInt(modifier, 10) : 0;
  const totalChance = Math.min(baseChance + modifierValue, 100);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[96vh] overflow-y-auto border-2 border-yellow-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-3 sm:px-6 py-2 sm:py-4 rounded-t-lg sticky top-0 z-10">
          <h3 className="text-base sm:text-xl font-bold flex items-center gap-2">
            <span className="text-lg sm:text-2xl">✨</span>
            Reviver Digimon
          </h3>
          <p className="text-xs sm:text-sm text-yellow-100 mt-0.5 sm:mt-1">
            {digimonName}
          </p>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
          {/* Explicação */}
          <div className="bg-gray-700 rounded-lg p-2 sm:p-4 border border-gray-600">
            <p className="text-gray-300 text-xs sm:text-sm text-center">
              💀 Este Digimon está morto. Você pode tentar revivê-lo, mas a
              chance base é de apenas{" "}
              <span className="text-yellow-400 font-bold">15%</span>.
            </p>
            <p className="text-orange-400 text-[10px] sm:text-xs text-center mt-1 sm:mt-2 font-semibold">
              ⚠️ Apenas UMA tentativa de reviver por turno!
            </p>
          </div>

          {/* Campo de Modificador */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1 sm:mb-2">
              Modificador de Chance (0-100%)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              value={modifier}
              onChange={handleModifierChange}
              onKeyDown={handleKeyDown}
              placeholder="Ex: 15"
              disabled={isRolling}
              autoFocus
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 text-white text-lg sm:text-xl font-bold text-center rounded-lg border-2 border-gray-600 focus:border-yellow-500 focus:outline-none transition-colors disabled:opacity-50"
            />
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1 text-center">
              Adiciona % extra à chance base (máx: 100)
            </p>
          </div>

          {/* Cálculo da Chance */}
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-2 sm:p-4 border-2 border-yellow-500 shadow-lg">
            <div className="space-y-2 sm:space-y-3">
              {/* Chance Base */}
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-gray-400">Chance Base:</span>
                <span className="text-white font-bold">{baseChance}%</span>
              </div>

              {/* Modificador */}
              {modifierValue > 0 && (
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-400">Modificador:</span>
                  <span className="text-yellow-400 font-bold">
                    +{modifierValue}%
                  </span>
                </div>
              )}

              {/* Separador */}
              <div className="border-t border-gray-600"></div>

              {/* Chance Total */}
              <div className="text-center pt-1 sm:pt-2">
                <div className="text-[10px] sm:text-xs text-gray-400 mb-1 sm:mb-2">
                  ✨ CHANCE TOTAL ✨
                </div>
                <div className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {totalChance}%
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                  Precisa rolar ≤ {totalChance} em um D100
                </div>
              </div>

              {/* Barra de Chance Visual */}
              <div className="w-full bg-gray-600 rounded-full h-2 sm:h-3 overflow-hidden border border-gray-500 mt-2">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${totalChance}%` }}
                />
              </div>
            </div>
          </div>

          {/* D100 Visual */}
          <div className="bg-gray-700 rounded-lg p-2 sm:p-4 border border-gray-600">
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <p className="text-gray-300 text-xs sm:text-sm font-semibold">
                🎲 Dado de 100 Faces
              </p>
              <canvas
                ref={canvasRef}
                className={`transition-transform duration-100 ${
                  isRolling ? "animate-spin" : ""
                }`}
                style={{
                  width: window.innerWidth < 640 ? "100px" : "140px",
                  height: window.innerWidth < 640 ? "100px" : "140px",
                }}
              />
              {isRolling && (
                <p className="text-yellow-400 font-bold animate-pulse text-xs sm:text-sm">
                  Rolando o destino...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 px-3 sm:px-6 py-2 sm:py-4 rounded-b-lg border-t border-gray-700 flex gap-2 sm:gap-3">
          <button
            onClick={onClose}
            disabled={isRolling}
            className="flex-1 px-2 sm:px-4 py-2 bg-gray-700 text-white text-xs sm:text-base font-semibold rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={attemptRevive}
            disabled={isRolling}
            className={`flex-1 px-2 sm:px-4 py-2 text-xs sm:text-base font-semibold rounded-lg transition-all ${
              isRolling
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105"
            }`}
          >
            {isRolling ? "⏳ Rolando..." : "✨ Tentar Reviver"}
          </button>
        </div>
      </div>
    </div>
  );
}
