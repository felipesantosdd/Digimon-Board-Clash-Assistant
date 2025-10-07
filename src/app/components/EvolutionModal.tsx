"use client";

import { useState, useEffect } from "react";
import { Digimon } from "../database/database_type";
import { useSnackbar } from "notistack";

interface EvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  digimon: Digimon | null;
  allDigimons: Digimon[];
  onSaveEvolutions: (digimonId: number, evolutionIds: number[]) => void;
  onSaveDigimon?: (
    digimonId: number,
    data: { name: string; level: number; dp: number; typeId: number }
  ) => void;
}

const digimonTypes = [
  { id: 1, name: "Data" },
  { id: 2, name: "Vaccine" },
  { id: 3, name: "Virus" },
  { id: 4, name: "Free" },
  { id: 5, name: "Variable" },
  { id: 6, name: "Unknown" },
];

export default function EvolutionModal({
  isOpen,
  onClose,
  digimon,
  allDigimons,
  onSaveEvolutions,
  onSaveDigimon,
}: EvolutionModalProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedEvolutions, setSelectedEvolutions] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para edição do Digimon
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    level: 1,
    dp: 2000,
    typeId: 1,
  });

  useEffect(() => {
    if (digimon) {
      setSelectedEvolutions(digimon.evolution || []);
      setEditData({
        name: digimon.name,
        level: digimon.level,
        dp: digimon.dp,
        typeId: digimon.typeId,
      });
      setEditMode(false);
    }
  }, [digimon]);

  if (!isOpen || !digimon) return null;

  const handleEvolutionToggle = (evolutionId: number) => {
    setSelectedEvolutions((prev) => {
      if (prev.includes(evolutionId)) {
        return prev.filter((id) => id !== evolutionId);
      } else {
        return [...prev, evolutionId];
      }
    });
  };

  const handleSaveDigimonData = async () => {
    console.log("💾 Salvando dados do Digimon:", {
      digimonId: digimon.id,
      editData,
    });
    if (onSaveDigimon) {
      try {
        await onSaveDigimon(digimon.id, editData);
        setEditMode(false);
        enqueueSnackbar("Dados do Digimon salvos com sucesso!", {
          variant: "success",
        });
      } catch (error) {
        console.error("Erro ao salvar Digimon:", error);
        enqueueSnackbar("Erro ao salvar dados do Digimon", {
          variant: "error",
        });
      }
    }
  };

  const handleSave = () => {
    onSaveEvolutions(digimon.id, selectedEvolutions);
    onClose();
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log("🔄 handleEditChange:", { name, value, type: typeof value });

    setEditData((prev) => {
      const newData = {
        ...prev,
        [name]: ["level", "dp", "typeId"].includes(name)
          ? Number(value)
          : value,
      };
      console.log("📝 editData atualizado:", newData);
      return newData;
    });
  };

  // Filtrar Digimons que podem ser evoluções (não o próprio Digimon e apenas do nível seguinte)
  const possibleEvolutions = allDigimons.filter(
    (d) =>
      d.id !== digimon.id &&
      d.level === digimon.level + 1 &&
      d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Configurar Evoluções - {digimon.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-900">Dados do Digimon:</h3>
            {process.env.NODE_ENV === "development" && (
              <button
                onClick={() => setEditMode(!editMode)}
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editMode ? "Cancelar" : "✏️ Editar"}
              </button>
            )}
          </div>

          {editMode ? (
            // Modo de Edição
            <div className="space-y-3">
              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-gray-800 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Level */}
              <div>
                <label className="block text-xs font-medium text-gray-800 mb-2">
                  Level
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        handleEditChange({
                          target: { name: "level", value: level.toString() },
                        } as React.ChangeEvent<HTMLSelectElement>)
                      }
                      className={`px-2 py-1 rounded border-2 text-xs transition-all ${
                        editData.level === level
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* DP e Tipo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">
                    DP
                  </label>
                  <input
                    type="number"
                    name="dp"
                    value={editData.dp}
                    onChange={handleEditChange}
                    step="1000"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-2">
                    Tipo
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {digimonTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() =>
                          handleEditChange({
                            target: {
                              name: "typeId",
                              value: type.id.toString(),
                            },
                          } as React.ChangeEvent<HTMLSelectElement>)
                        }
                        className={`p-2 rounded border-2 transition-all flex flex-col items-center gap-1 ${
                          editData.typeId === type.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={editData.typeId === type.id}
                          onChange={() => {}}
                          className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span
                          className={`text-[10px] font-medium ${
                            editData.typeId === type.id
                              ? "text-blue-700"
                              : "text-gray-900"
                          }`}
                        >
                          {type.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveDigimonData}
                className="w-full px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                💾 Salvar Alterações
              </button>
            </div>
          ) : (
            // Modo de Visualização
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <img
                  src={`/images/digimons/${digimon.id
                    .toString()
                    .padStart(2, "0")}.png`}
                  alt={digimon.name}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ display: "none" }}
                >
                  <span className="text-2xl">🤖</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">
                  {editData.name}
                </p>
                <p className="text-sm text-gray-800">
                  Level {editData.level} • DP: {editData.dp} •{" "}
                  {digimonTypes.find((t) => t.id === editData.typeId)?.name}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">
              Selecionar Evoluções para Level {digimon.level + 1} (
              {selectedEvolutions.length} selecionadas):
            </h3>
            <div className="text-sm text-gray-700">
              {possibleEvolutions.length} Digimons disponíveis
            </div>
          </div>

          {/* Barra de pesquisa */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar Digimons para evolução..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {possibleEvolutions.length > 0 ? (
              possibleEvolutions.map((evolution) => (
                <div
                  key={evolution.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedEvolutions.includes(evolution.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleEvolutionToggle(evolution.id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedEvolutions.includes(evolution.id)}
                      onChange={() => handleEvolutionToggle(evolution.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-blue-100 rounded flex items-center justify-center relative overflow-hidden">
                      <img
                        src={`/images/digimons/${evolution.id
                          .toString()
                          .padStart(2, "0")}.png`}
                        alt={evolution.name}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback =
                            target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ display: "none" }}
                      >
                        <span className="text-lg">🤖</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-black">
                        {evolution.name}
                      </p>
                      <p className="text-xs text-gray-700">
                        Level {evolution.level} • DP: {evolution.dp}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="text-4xl mb-2">🔍</div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Nenhum Digimon encontrado
                </h4>
                <p className="text-gray-700">
                  {searchTerm
                    ? "Tente ajustar sua busca"
                    : `Não há Digimons de level ${
                        digimon.level + 1
                      } disponíveis`}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Salvar Evoluções
          </button>
        </div>
      </div>
    </div>
  );
}
