"use client";

import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import EditTamerModal from "../EditTamerModal";

interface Tamer {
  id: number;
  name: string;
  image: string;
}

export default function TamersTab() {
  const { enqueueSnackbar } = useSnackbar();
  const [tamers, setTamers] = useState<Tamer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTamer, setEditingTamer] = useState<Tamer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchTamers();
  }, []);

  const fetchTamers = async () => {
    try {
      const response = await fetch("/api/tamers");
      if (response.ok) {
        const data = await response.json();
        setTamers(data);
      }
    } catch {
      enqueueSnackbar("Erro ao carregar Tamers", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tamer: Tamer) => {
    setEditingTamer(tamer);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    enqueueSnackbar("Tamer atualizado com sucesso!", { variant: "success" });
    setIsEditModalOpen(false);
    setEditingTamer(null);
    fetchTamers();
  };

  const handleDelete = async (tamer: Tamer) => {
    if (!confirm(`Tem certeza que deseja deletar o Tamer "${tamer.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tamers/${tamer.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        enqueueSnackbar(`Tamer "${tamer.name}" deletado com sucesso!`, {
          variant: "success",
        });
        fetchTamers();
      } else {
        const error = await response.json();
        enqueueSnackbar(error.error || "Erro ao deletar Tamer", {
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar("Erro ao deletar Tamer", { variant: "error" });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-300">Carregando Tamers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">
          👤 Gerenciar Tamers (Avatares)
        </h2>
        <div className="text-sm text-gray-400">
          Total: <span className="font-bold text-white">{tamers.length}</span>{" "}
          Tamers
        </div>
      </div>

      {/* Grid de Tamers */}
      {tamers.length === 0 ? (
        <div className="text-center py-12 bg-gray-700 rounded-lg">
          <div className="text-6xl mb-4">👤</div>
          <p className="text-gray-300">Nenhum Tamer cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tamers.map((tamer) => (
            <div
              key={tamer.id}
              className="bg-gray-700 rounded-lg border-2 border-gray-600 overflow-hidden hover:border-gray-500 transition-all group"
            >
              {/* Imagem do Tamer */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-600 to-gray-800 overflow-hidden">
                <img
                  src={tamer.image}
                  alt={tamer.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/tamers/fallback.svg";
                  }}
                />

                {/* Overlay com ID */}
                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-mono text-white">
                  ID: {tamer.id}
                </div>
              </div>

              {/* Info e Ações */}
              <div className="p-4">
                {/* Nome */}
                <h3 className="text-lg font-bold text-white mb-3 text-center truncate">
                  {tamer.name}
                </h3>

                {/* Botões de Ação */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleEdit(tamer)}
                    className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>✏️</span>
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(tamer)}
                    className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🗑️</span>
                    <span>Deletar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aviso de Produção */}
      {process.env.NODE_ENV === "production" && (
        <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4 text-center">
          <p className="text-yellow-300 font-semibold">
            ⚠️ Exclusão de Tamers está desabilitada em produção
          </p>
        </div>
      )}

      {/* Modal de Edição */}
      <EditTamerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTamer(null);
        }}
        tamer={editingTamer}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

