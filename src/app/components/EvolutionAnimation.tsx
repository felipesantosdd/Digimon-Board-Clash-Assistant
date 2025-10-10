"use client";

import { useState, useEffect } from "react";
import { capitalize } from "@/lib/utils";

interface EvolutionAnimationProps {
  isOpen: boolean;
  digimonName: string;
  digimonImage: string;
  evolutionImage?: string;
  evolutionName?: string;
  possibleEvolutions?: Array<{ id: number; name: string; image: string }>;
  onComplete: () => void;
}

export default function EvolutionAnimation({
  isOpen,
  digimonName,
  digimonImage,
  evolutionImage,
  evolutionName,
  possibleEvolutions = [],
  onComplete,
}: EvolutionAnimationProps) {
  const [stage, setStage] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [canClose, setCanClose] = useState(false);
  const [rotations, setRotations] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Lista de imagens: Digimon original + evoluções possíveis
  const allImages = [digimonImage, ...possibleEvolutions.map((e) => e.image)];

  // Encontrar o índice da evolução final (índice +1 porque o original está no índice 0)
  const finalEvolutionIndex =
    evolutionImage && possibleEvolutions.length > 0
      ? possibleEvolutions.findIndex((e) => e.image === evolutionImage) + 1 // +1 porque o original está no índice 0
      : -1;

  useEffect(() => {
    if (!isOpen) {
      setStage(0);
      setCurrentImageIndex(0);
      setCanClose(false);
      setRotations(0);
      setImageError(false);
      return;
    }

    // Resetar erro ao abrir
    setImageError(false);

    // Sequência de animação
    const timers: NodeJS.Timeout[] = [];

    // Stage 1: Brilho inicial (500ms)
    timers.push(setTimeout(() => setStage(1), 500));

    // Stage 2: Inicia rotação após 3s
    timers.push(setTimeout(() => setStage(2), 3000));

    // Durante a rotação, trocar imagens a cada giro (360 graus)
    if (allImages.length > 0) {
      // Criar sequência que alterna entre o Digimon original e suas evoluções possíveis
      const totalRotations = 12; // Reduzido para 12 rotações
      const sequence: number[] = [];

      // Preencher sequência alternando entre original (0) e evoluções (1+)
      for (let i = 0; i < totalRotations - 1; i++) {
        if (i % 2 === 0) {
          // Posições pares: Digimon original (índice 0)
          sequence.push(0);
        } else {
          // Posições ímpares: Uma evolução aleatória (índice 1+)
          const evolutionIndex =
            Math.floor(Math.random() * possibleEvolutions.length) + 1;
          sequence.push(evolutionIndex);
        }
      }

      // Garantir que a última é a evolução final
      if (finalEvolutionIndex >= 0) {
        sequence.push(finalEvolutionIndex);
      } else if (possibleEvolutions.length > 0) {
        // Se não encontrou, usar uma evolução aleatória
        const randomEvolutionIndex =
          Math.floor(Math.random() * possibleEvolutions.length) + 1;
        sequence.push(randomEvolutionIndex);
      } else {
        // Se não há evoluções, manter o original
        sequence.push(0);
      }

      // Aplicar sequência - trocar a imagem no meio da rotação (180°)
      sequence.forEach((index, i) => {
        // Inicia a rotação
        timers.push(
          setTimeout(() => {
            setRotations(i + 1);
          }, 3000 + i * 500)
        );

        // Troca a imagem no meio da rotação (quando está a 180°)
        timers.push(
          setTimeout(() => {
            setCurrentImageIndex(index);
          }, 3000 + i * 500 + 250) // 250ms = metade da rotação (180°)
        );
      });
    }

    // Stage 3: Para rotação e mostra evolução final (9s = 3s parado + 6s rotação)
    timers.push(
      setTimeout(() => {
        setStage(3);
        // Garantir que mostra a evolução final
        if (finalEvolutionIndex >= 0) {
          setCurrentImageIndex(finalEvolutionIndex);
        }
      }, 9000)
    );

    // Permitir fechar (9.5s)
    timers.push(setTimeout(() => setCanClose(true), 9500));

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [
    isOpen,
    possibleEvolutions.length,
    allImages.length,
    finalEvolutionIndex,
  ]);

  const handleClose = () => {
    if (canClose) {
      onComplete();
      setStage(0);
      setCurrentImageIndex(0);
      setCanClose(false);
      setRotations(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-[100] backdrop-blur-md">
      {/* Container central para Digimon e efeitos */}
      <div className="flex-1 flex items-center justify-center relative w-full px-4 sm:px-8">
        <div className="relative">
          {/* Círculos de luz pulsante - FUNDO */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 opacity-30 blur-3xl animate-pulse ${
                stage >= 2 ? "scale-150" : "scale-100"
              } transition-transform duration-1000`}
            />
          </div>

          {/* Imagem do Digimon */}
          <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-6">
            <div
              className={`relative w-48 h-48 sm:w-64 sm:h-64 transition-all ${
                stage >= 2 && stage < 3 ? "scale-110" : "scale-100"
              }`}
              style={{
                transformStyle: "preserve-3d",
                // Rotação vertical (apenas eixo Y)
                transform:
                  stage === 1
                    ? "scale(1) rotateY(0deg)" // Parado inicial
                    : stage === 2
                    ? `scale(1.1) rotateY(${rotations * 360}deg)` // Rotação vertical
                    : stage === 3
                    ? `scale(1) rotateY(${rotations * 360}deg)` // Para na posição final
                    : "scale(1) rotateY(0deg)", // Estado padrão
                transition:
                  stage === 1
                    ? "transform 0.5s ease-out" // Transição inicial
                    : stage === 2
                    ? "transform 0.5s ease-in-out" // Velocidade original (500ms)
                    : stage === 3
                    ? "transform 0.5s ease-out" // Para suavemente
                    : "transform 0.3s ease-out", // Estado final
              }}
            >
              <img
                src={
                  stage === 1
                    ? digimonImage // Stage 1: Digimon original
                    : stage === 2 || stage === 3
                    ? allImages[currentImageIndex] || digimonImage // Stage 2/3: Evoluções
                    : digimonImage
                }
                alt={
                  stage === 3 && evolutionName
                    ? evolutionName
                    : stage === 2
                    ? "???"
                    : currentImageIndex === 0
                    ? digimonName
                    : possibleEvolutions[currentImageIndex - 1]?.name || "???"
                }
                onClick={handleClose}
                onError={() => {
                  console.error("❌ [EVOLVE] Erro ao carregar imagem:", {
                    stage,
                    currentImageIndex,
                    image: allImages[currentImageIndex],
                  });
                  setImageError(true);
                }}
                className={`w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] ${
                  canClose ? "cursor-pointer" : "cursor-default"
                }`}
              />

              {/* Fallback se houver erro de imagem */}
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-6xl mb-2">❓</div>
                    <p className="text-white text-sm">Imagem não encontrada</p>
                  </div>
                </div>
              )}

              {/* Raios de luz que aparecem e desaparecem */}
              {stage >= 1 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Raios de luz dinâmicos */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={`light-${i}`}
                      className="absolute w-0.5 sm:w-1 h-full bg-gradient-to-t from-transparent via-yellow-400 to-transparent opacity-0 animate-pulse"
                      style={{
                        transform: `rotate(${i * 45}deg)`,
                        animationDelay: `${i * 200}ms`,
                        animationDuration: '1.5s',
                        animationIterationCount: 'infinite',
                        animationTimingFunction: 'ease-in-out',
                      }}
                    />
                  ))}
                  
                  {/* Raios adicionais com diferentes ângulos e timing */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={`light-extra-${i}`}
                      className="absolute w-0.5 sm:w-1 h-full bg-gradient-to-t from-transparent via-orange-400 to-transparent opacity-0 animate-pulse"
                      style={{
                        transform: `rotate(${i * 60 + 22.5}deg)`,
                        animationDelay: `${i * 300 + 100}ms`,
                        animationDuration: '2s',
                        animationIterationCount: 'infinite',
                        animationTimingFunction: 'ease-in-out',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Textos no final da página */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 text-center space-y-2 sm:space-y-4 w-full max-w-2xl px-4">
        <h2
          className={`text-2xl sm:text-4xl font-bold text-white transition-all duration-500 ${
            stage >= 1 ? "scale-110" : "scale-100"
          }`}
          style={{
            textShadow:
              stage >= 2
                ? "0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 200, 0, 0.6)"
                : "0 0 10px rgba(0, 0, 0, 0.5)",
          }}
        >
          {stage === 3 && evolutionName
            ? capitalize(evolutionName)
            : stage === 2
            ? currentImageIndex === 0
              ? capitalize(digimonName)
              : possibleEvolutions[currentImageIndex - 1]?.name
              ? capitalize(possibleEvolutions[currentImageIndex - 1].name)
              : "???"
            : capitalize(digimonName)}
        </h2>
        <p
          className={`text-lg sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent transition-opacity duration-500 ${
            stage >= 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          {stage === 1 && "Preparando evolução..."}
          {stage === 2 && "DIGIEVOLUÇÃO!"}
          {stage === 3 &&
            evolutionName &&
            `✨ ${capitalize(evolutionName)}! ✨`}
        </p>
        {canClose && (
          <p className="text-sm sm:text-lg text-yellow-400 animate-pulse">
            👆 Clique para continuar
          </p>
        )}
      </div>
    </div>
  );
}
