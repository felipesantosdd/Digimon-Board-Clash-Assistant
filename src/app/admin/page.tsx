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

type TabType = "digimons" | "items";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("digimons");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800 shadow-md border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">
                Digimon Board Clash - Admin
              </h1>
            </Link>

            <div className="flex gap-4">
              <Link href="/digimons">
                <button className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                  Ver Digimons
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-6 py-6">
        {/* Aviso de Produção */}
        {process.env.NODE_ENV === "production" && (
          <div className="bg-yellow-900 border-2 border-yellow-600 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="text-yellow-400 font-bold text-lg">
                  Modo Produção
                </h3>
                <p className="text-yellow-200 text-sm">
                  Edições estão desabilitadas. Apenas visualização disponível.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg shadow-md p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("digimons")}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "digimons"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              🤖 Digimons
            </button>
            <button
              onClick={() => setActiveTab("items")}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "items"
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              🎒 Itens
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "digimons" && <DigimonsTab />}
        {activeTab === "items" && <ItemsTab />}
      </div>
    </div>
  );
}
