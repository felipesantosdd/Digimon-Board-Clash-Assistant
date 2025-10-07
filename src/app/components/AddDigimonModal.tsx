"use client";

import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";

interface DigimonType {
  id: number;
  name: string;
}

interface AddDigimonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDigimonModal({
  isOpen,
  onClose,
  onSuccess,
}: AddDigimonModalProps) {
  const { enqueueSnackbar } = useSnackbar();
  const digimonTypes: DigimonType[] = [
    { id: 1, name: "Data" },
    { id: 2, name: "Vaccine" },
    { id: 3, name: "Virus" },
    { id: 4, name: "Free" },
    { id: 5, name: "Variable" },
    { id: 6, name: "Unknown" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    level: 1,
    dp: 2000,
    typeId: 1,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form quando fechar
      setFormData({
        name: "",
        level: 1,
        dp: 2000,
        typeId: 1,
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/digimons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: `/images/digimons/${Math.floor(Math.random() * 100)
            .toString()
            .padStart(2, "0")}.png`,
          evolution: [],
        }),
      });

      if (response.ok) {
        enqueueSnackbar("Digimon adicionado com sucesso!", {
          variant: "success",
        });
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        enqueueSnackbar(`Erro: ${error.error || "Erro ao adicionar Digimon"}`, {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar Digimon:", error);
      enqueueSnackbar("Erro ao adicionar Digimon", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["level", "dp", "typeId"].includes(name) ? Number(value) : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-2xl font-bold">➕ Adicionar Novo Digimon</h2>
          {process.env.NODE_ENV === "development" && (
            <p className="text-green-100 text-sm mt-1">
              🛠️ Modo Desenvolvimento
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Digimon *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ex: Agumon"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Level *
            </label>
            <div className="grid grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: { name: "level", value: level.toString() },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                  className={`px-3 py-2 rounded-lg border-2 transition-all ${
                    formData.level === level
                      ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* DP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DP (Digimon Power) *
            </label>
            <input
              type="number"
              name="dp"
              value={formData.dp}
              onChange={handleChange}
              required
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {digimonTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: { name: "typeId", value: type.id.toString() },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.typeId === type.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.typeId === type.id}
                    onChange={() => {}}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <span
                    className={`text-sm font-medium ${
                      formData.typeId === type.id
                        ? "text-green-700"
                        : "text-gray-700"
                    }`}
                  >
                    {type.name}
                  </span>
                </button>
              ))}
            </div>
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
              className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Adicionando..." : "➕ Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
