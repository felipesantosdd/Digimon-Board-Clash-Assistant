"use client";

import { useState, useEffect } from "react";
import { capitalize } from "@/lib/utils";

interface EvolutionAnimationProps {
  isOpen: boolean;
  digimonName: string;
  digimonImage: string;
  onComplete: () => void;
}

export default function EvolutionAnimation({
  isOpen,
  digimonName,
  digimonImage,
  onComplete,
}: EvolutionAnimationProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStage(0);
      return;
    }

    // Sequência de animação
    const timers = [
      setTimeout(() => setStage(1), 500), // Brilho inicial
      setTimeout(() => setStage(2), 1500), // Luz intensa
      setTimeout(() => setStage(3), 2500), // Transição
      setTimeout(() => {
        onComplete();
        setStage(0);
      }, 3500), // Completar
    ];

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100] backdrop-blur-md">
      <div className="relative">
        {/* Círculos de luz pulsante */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-96 h-96 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 opacity-30 blur-3xl animate-pulse ${
              stage >= 2 ? "scale-150" : "scale-100"
            } transition-transform duration-1000`}
          />
        </div>

        {/* Imagem do Digimon */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div
            className={`relative w-64 h-64 transition-all duration-1000 ${
              stage >= 2 ? "scale-110 brightness-200" : "scale-100"
            }`}
          >
            <img
              src={digimonImage}
              alt={digimonName}
              className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]"
              style={{
                filter:
                  stage >= 2
                    ? "brightness(2) contrast(1.2) saturate(1.5)"
                    : "brightness(1)",
              }}
            />

            {/* Partículas de luz */}
            {stage >= 1 && (
              <>
                <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-orange-400 rounded-full animate-ping animation-delay-200" />
                <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-ping animation-delay-400" />
                <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-yellow-300 rounded-full animate-ping animation-delay-600" />
                <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-orange-300 rounded-full animate-ping animation-delay-800" />
              </>
            )}
          </div>

          {/* Texto */}
          <div className="text-center space-y-2">
            <h2
              className={`text-4xl font-bold text-white transition-all duration-500 ${
                stage >= 1 ? "scale-110" : "scale-100"
              }`}
              style={{
                textShadow:
                  stage >= 2
                    ? "0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 200, 0, 0.6)"
                    : "0 0 10px rgba(0, 0, 0, 0.5)",
              }}
            >
              {capitalize(digimonName)}
            </h2>
            <p
              className={`text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent transition-opacity duration-500 ${
                stage >= 1 ? "opacity-100" : "opacity-0"
              }`}
            >
              {stage === 1 && "Está evoluindo..."}
              {stage === 2 && "DIGIEVOLUÇÃO!"}
              {stage === 3 && "✨ Evolução completa! ✨"}
            </p>
          </div>

          {/* Raios de luz */}
          {stage >= 2 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-full bg-gradient-to-t from-transparent via-yellow-400 to-transparent opacity-40 animate-pulse"
                  style={{
                    transform: `rotate(${i * 30}deg)`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
