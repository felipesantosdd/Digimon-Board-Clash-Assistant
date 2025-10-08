"use client";

import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import AddItemModal from "../AddItemModal";
import { Item } from "@/types/item";

export default function ItemsTab() {
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items");
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        console.error("Erro ao carregar itens");
      }
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemSuccess = () => {
    fetchItems();
    setEditingItem(null);
  };

  const handleEditItem = (item: Item) => {
    // Desabilitar edição em produção
    if (process.env.NODE_ENV === "production") {
      enqueueSnackbar("Edições não são permitidas em produção", {
        variant: "warning",
      });
      return;
    }

    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleDeleteItem = async (itemId: number, itemName: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${itemName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        enqueueSnackbar(`${itemName} excluído com sucesso!`, {
          variant: "success",
        });
      } else {
        const error = await response.json();
        enqueueSnackbar(`Erro: ${error.error}`, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Erro ao excluir item", { variant: "error" });
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEffectLabel = (effect: string) => {
    const effects: { [key: string]: string } = {
      heal_1000: "Curar 1000 HP",
      heal_2000: "Curar 2000 HP",
      heal_full: "Curar HP Completo",
      revive_half: "Reviver 50% HP",
      boost_dp_500: "DP +500",
      shield_turn: "Escudo 1 Turno",
      instant_evolution: "Evolução Instantânea",
      heal_cleanse: "Curar + Limpar",
    };
    return effects[effect] || effect;
  };

  const getEffectColor = (effect: string) => {
    if (effect.includes("heal")) return "bg-green-500";
    if (effect.includes("revive")) return "bg-yellow-500";
    if (effect.includes("boost")) return "bg-orange-500";
    if (effect.includes("shield")) return "bg-blue-500";
    if (effect.includes("evolution")) return "bg-purple-500";
    return "bg-gray-500";
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Biblioteca de Itens
          </h2>
          <p className="text-gray-300">Gerencie os itens disponíveis no jogo</p>
        </div>

        {/* Botão Adicionar - Apenas em Development */}
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={() => {
              setEditingItem(null);
              setIsAddModalOpen(true);
            }}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span className="text-xl">➕</span>
            Adicionar Item
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Buscar Item
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome do item..."
            className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Lista de Itens */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            Carregando Itens...
          </h3>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Imagem do Item */}
                <div className="relative h-40 bg-gradient-to-br from-purple-900 to-purple-700 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-32 h-32 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/items/fallback.svg";
                    }}
                  />
                </div>

                {/* Informações do Item */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.name}
                  </h3>

                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="mb-4">
                    <span
                      className={`${getEffectColor(
                        item.effect
                      )} text-white text-xs font-semibold px-2 py-1 rounded-full`}
                    >
                      {getEffectLabel(item.effect)}
                    </span>
                  </div>

                  {/* Botões de ação */}
                  <div className="space-y-2">
                    {process.env.NODE_ENV === "development" && (
                      <button
                        onClick={() => handleEditItem(item)}
                        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                    )}

                    {process.env.NODE_ENV === "development" && (
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="w-full px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                      >
                        🗑️ Excluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                Nenhum item encontrado
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Tente ajustar os filtros de busca"
                  : "Comece adicionando um novo item"}
              </p>
            </div>
          )}

          {/* Info */}
          {filteredItems.length > 0 && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="text-sm font-semibold text-white mb-2">
                📋 Total de Itens: {filteredItems.length}
              </h4>
              <p className="text-sm text-gray-400">
                Itens podem ser usados pelos Digimons durante as batalhas
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={handleAddItemSuccess}
        editingItem={editingItem}
      />
    </>
  );
}
