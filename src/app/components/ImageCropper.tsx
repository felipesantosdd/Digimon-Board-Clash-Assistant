"use client";

import { useState, useCallback, useMemo } from "react";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
  cropShape?: "rect" | "round";
  outputSize?: number; // Tamanho máximo da saída em pixels
  quality?: number; // Qualidade da compressão (0-1)
}

export default function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  cropShape = "rect",
  outputSize = 512,
  quality = 0.92,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Memoizar props para evitar re-renders desnecessários
  const memoizedProps = useMemo(
    () => ({
      image: image?.substring(0, 50),
      aspectRatio,
      cropShape,
      outputSize,
      quality,
    }),
    [image, aspectRatio, cropShape, outputSize, quality]
  );

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropAreaChange = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = useCallback(async () => {
    console.log("🎯 Botão de recortar clicado!");
    console.log("📏 Área de recorte:", croppedAreaPixels);

    if (!croppedAreaPixels) {
      console.warn("⚠️ Nenhuma área selecionada!");
      return;
    }

    try {
      console.log("✂️ Iniciando recorte e otimização...");
      const croppedImage = await getCroppedImg(
        image,
        croppedAreaPixels,
        outputSize,
        quality
      );
      onCropComplete(croppedImage);
    } catch (e) {
      console.error("❌ Erro ao recortar imagem:", e);
    }
  }, [croppedAreaPixels, image, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex flex-col items-center justify-center z-[60]">
      <div className="w-full max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gray-800 rounded-t-lg p-4">
          <h3 className="text-xl font-bold text-white">✂️ Ajustar Imagem</h3>
          <p className="text-sm text-gray-400 mt-1">
            Arraste para posicionar e use o controle para dar zoom
          </p>
        </div>

        {/* Cropper */}
        <div className="relative h-96 bg-gray-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape={cropShape}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaChange}
            showGrid={true}
          />
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-b-lg p-4 space-y-4">
          {/* Zoom Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Zoom: {zoom.toFixed(1)}x
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={createCroppedImage}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              ✂️ Recortar e Usar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Função auxiliar para criar a imagem recortada e otimizada
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  maxSize: number = 512,
  quality: number = 0.92
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Não foi possível obter o contexto do canvas");
  }

  // Calcular dimensões redimensionadas mantendo a proporção
  let outputWidth = pixelCrop.width;
  let outputHeight = pixelCrop.height;

  if (outputWidth > maxSize || outputHeight > maxSize) {
    const ratio = Math.min(maxSize / outputWidth, maxSize / outputHeight);
    outputWidth = Math.round(outputWidth * ratio);
    outputHeight = Math.round(outputHeight * ratio);
    console.log(
      `🔄 Redimensionando de ${pixelCrop.width}x${pixelCrop.height} para ${outputWidth}x${outputHeight}`
    );
  }

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  // Aplicar suavização para melhor qualidade ao redimensionar
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Desenhar a imagem recortada e redimensionada
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  // Converter para WebP (formato web otimizado) ou JPEG se não suportado
  return new Promise((resolve, reject) => {
    // Tentar WebP primeiro (melhor compressão)
    canvas.toBlob(
      (blob) => {
        if (blob) {
          console.log(
            `📦 WebP: ${outputWidth}x${outputHeight}px, ${(
              blob.size / 1024
            ).toFixed(2)}KB (qualidade: ${quality})`
          );
          resolve(blob);
        } else {
          // Fallback para JPEG se navegador não suportar WebP
          console.log("⚠️ WebP não suportado, usando JPEG");
          canvas.toBlob(
            (jpegBlob) => {
              if (jpegBlob) {
                console.log(
                  `📦 JPEG: ${outputWidth}x${outputHeight}px, ${(
                    jpegBlob.size / 1024
                  ).toFixed(2)}KB (qualidade: ${quality})`
                );
                resolve(jpegBlob);
              } else {
                reject(new Error("Falha ao criar blob da imagem"));
              }
            },
            "image/jpeg",
            quality
          );
        }
      },
      "image/webp",
      quality
    );
  });
}

// Função auxiliar para criar elemento de imagem
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}
