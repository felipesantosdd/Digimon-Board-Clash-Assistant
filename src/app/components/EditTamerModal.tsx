"use client";

import { useState, useEffect, useRef } from "react";
import { useSnackbar } from "notistack";
import ImageCropper from "./ImageCropper";
import { getTamerImagePath } from "@/lib/image-utils";

interface Tamer {
  id: number;
  name: string;
  image: string;
}

interface EditTamerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tamer: Tamer | null;
  onSuccess: () => void;
}

export default function EditTamerModal({
  isOpen,
  onClose,
  tamer,
  onSuccess,
}: EditTamerModalProps) {
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tamer) {
      setFormData({
        name: tamer.name,
      });
      setImagePreview("");
      setImageFile(null);
    }
  }, [tamer]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("📸 Arquivo selecionado:", file.name, file.size, "bytes");

      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        enqueueSnackbar("Por favor, selecione apenas arquivos de imagem", {
          variant: "error",
        });
        return;
      }

      // Validar tamanho (máx 5MB para permitir crop)
      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar("Imagem muito grande! Máximo 5MB", {
          variant: "error",
        });
        return;
      }

      console.log("🎨 Abrindo cropper...");
      // Criar preview para crop
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setShowCropper(true);
        console.log("✅ Cropper aberto");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    console.log("✂️ Imagem recortada:", croppedBlob.size, "bytes");

    // Converter blob para File (WebP ou JPEG)
    const extension = croppedBlob.type === "image/webp" ? "webp" : "jpg";
    const croppedFile = new File([croppedBlob], `cropped-image.${extension}`, {
      type: croppedBlob.type,
    });
    setImageFile(croppedFile);
    console.log("📁 Arquivo criado:", croppedFile.name, croppedFile.size);

    // Criar preview da imagem recortada
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      console.log("🖼️ Preview criado com sucesso");
    };
    reader.readAsDataURL(croppedBlob);

    setShowCropper(false);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop("");
    // Limpar o input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tamer) return;

    setLoading(true);

    try {
      let imagePath = tamer.image;

      // Se há uma nova imagem, fazer upload
      if (imageFile) {
        console.log("📤 Fazendo upload da imagem...");
        const formDataUpload = new FormData();
        formDataUpload.append("file", imageFile);
        formDataUpload.append("type", "tamer");
        formDataUpload.append("oldImage", tamer.image); // Imagem antiga para deletar

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        console.log("📥 Resposta do upload:", uploadResponse.status);

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imagePath = uploadResult.path;
          console.log("✅ Imagem enviada com sucesso:", imagePath);
        } else {
          const errorText = await uploadResponse.text();
          console.error("❌ Erro no upload:", errorText);
          throw new Error("Erro ao fazer upload da imagem");
        }
      }

      console.log("💾 Atualizando tamer com dados:", {
        name: formData.name,
        image: imagePath,
      });

      // Atualizar o tamer
      const response = await fetch(`/api/tamers/${tamer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          image: imagePath,
        }),
      });

      console.log("📥 Resposta da API:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Tamer atualizado:", result);
        enqueueSnackbar("Tamer atualizado com sucesso!", {
          variant: "success",
        });
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        console.error("❌ Erro da API:", error);
        enqueueSnackbar(`Erro: ${error.error}`, { variant: "error" });
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar tamer:", error);
      enqueueSnackbar("Erro ao atualizar tamer", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen || !tamer) return null;

  return (
    <>
      {showCropper && imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          cropShape="round"
          outputSize={256}
          quality={0.9}
        />
      )}

      {!showCropper && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-2xl font-bold">✏️ Editar Tamer</h2>
              <p className="text-blue-100 text-sm mt-1">
                Atualize o nome e a imagem do jogador
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Imagem do Tamer
                </label>
                <div className="flex flex-col items-center gap-3">
                  {/* Input oculto */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {/* Preview - Clicável */}
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("🖱️ Imagem clicada!");
                      console.log("📎 Ref atual:", fileInputRef.current);
                      if (fileInputRef.current) {
                        console.log("✅ Ref existe, chamando click()");
                        fileInputRef.current.click();
                      } else {
                        console.error("❌ Ref não encontrado!");
                      }
                    }}
                    className="relative w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden cursor-pointer group hover:ring-4 hover:ring-blue-500/50 transition-all"
                    title="Clique para alterar a imagem"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={getTamerImagePath(tamer.image)}
                        alt={tamer.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full bg-gray-700"></div>`;
                          }
                        }}
                      />
                    )}

                    {/* Overlay com ícone ao hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center">
                      <span className="text-4xl opacity-0 group-hover:opacity-100 transition-opacity">
                        📷
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 text-center">
                    Clique na imagem para alterar
                    <br />
                    PNG, JPG ou SVG (máx 2MB)
                  </p>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Nome do Tamer *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Tai"
                  className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Salvando..." : "💾 Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
