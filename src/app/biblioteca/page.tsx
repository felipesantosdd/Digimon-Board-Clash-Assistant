"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Importação dinâmica para evitar problemas de SSR
const DigimonsTab = dynamic(() => import("../components/admin/DigimonsTab"), {
  ssr: false,
});
const ItemsTab = dynamic(() => import("../components/admin/ItemsTab"), {
  ssr: false,
});
const BossesTab = dynamic(() => import("../components/admin/BossesTab"), {
  ssr: false,
});
const BossDropsTab = dynamic(() => import("../components/admin/BossDropsTab"), {
  ssr: false,
});
const EffectsTab = dynamic(() => import("../components/admin/EffectsTab"), {
  ssr: false,
});
const TamersTab = dynamic(() => import("../components/admin/TamersTab"), {
  ssr: false,
});

type TabType = "digimons" | "items" | "bosses" | "drops" | "effects" | "tamers";

export default function BibliotecaPage() {
  const [activeTab, setActiveTab] = useState<TabType>("digimons");

  // Detectar se está em produção
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800 shadow-md border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">
                📚 Digimon Board Clash - Biblioteca
              </h1>
            </Link>

            <div className="flex gap-4">
              <Link href="/">
                <button className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                  🏠 Início
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-6 py-6">
        {/* Aviso de Modo Visualização (Produção) */}
        {isProduction && (
          <div className="bg-blue-900 border-2 border-blue-600 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👁️</span>
              <div>
                <h3 className="text-blue-400 font-bold text-lg">
                  Modo Visualização
                </h3>
                <p className="text-blue-200 text-sm">
                  Você está navegando pela biblioteca de recursos do jogo.
                  Edições não estão disponíveis.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg shadow-md p-2 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <button
              onClick={() => setActiveTab("digimons")}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "digimons"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              🤖 Digimons
            </button>
            <button
              onClick={() => setActiveTab("items")}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "items"
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              🎒 Itens
            </button>
            <button
              onClick={() => setActiveTab("effects")}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "effects"
                  ? "bg-yellow-600 text-white shadow-md"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              ✨ Efeitos
            </button>
            <button
              onClick={() => setActiveTab("bosses")}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "bosses"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              🐉 Bosses
            </button>
            <button
              onClick={() => setActiveTab("drops")}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "drops"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              🎁 Drops
            </button>
            <button
              onClick={() => setActiveTab("tamers")}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "tamers"
                  ? "bg-orange-600 text-white shadow-md"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              👤 Tamers
            </button>
          </div>
        </div>

        {/* Tab Content - Passa a prop isProduction para cada tab */}
        {activeTab === "digimons" && (
          <DigimonsTab isProduction={isProduction} />
        )}
        {activeTab === "items" && <ItemsTab isProduction={isProduction} />}
        {activeTab === "effects" && <EffectsTab isProduction={isProduction} />}
        {activeTab === "bosses" && <BossesTab isProduction={isProduction} />}
        {activeTab === "drops" && <BossDropsTab isProduction={isProduction} />}
        {activeTab === "tamers" && <TamersTab isProduction={isProduction} />}
      </div>
    </div>
  );
}
