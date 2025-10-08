"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Digimon } from "../database/database_type";
import EvolutionLineModal from "../components/EvolutionLineModal";
import { capitalize, getLevelName } from "@/lib/utils";

export default function DigimonsPage() {
  const [digimons, setDigimons] = useState<Digimon[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [selectedDigimon, setSelectedDigimon] = useState<Digimon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Carregar Digimons da API
  useEffect(() => {
    const fetchDigimons = async () => {
      try {
        const response = await fetch("/api/digimons");
        if (response.ok) {
          const data = await response.json();
          setDigimons(data);
        } else {
          console.error("Erro ao carregar Digimons");
        }
      } catch (error) {
        console.error("Erro ao carregar Digimons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDigimons();
  }, []);

  const getTypeName = (typeId: number) => {
    const types: { [key: number]: string } = {
      1: "Data",
      2: "Vaccine",
      3: "Virus",
      4: "Free",
      5: "Variable",
      6: "Unknown",
    };
    return types[typeId] || "Unknown";
  };

  const getTypeColor = (typeId: number) => {
    const colors: { [key: number]: string } = {
      1: "bg-blue-500", // Data
      2: "bg-green-500", // Vaccine
      3: "bg-purple-500", // Virus
      4: "bg-gray-500", // Free
      5: "bg-yellow-500", // Variable
      6: "bg-red-500", // Unknown
    };
    return colors[typeId] || "bg-gray-500";
  };

  const handleImageError = (digimonId: number) => {
    setImageErrors((prev) => new Set(prev).add(digimonId));
  };

  const getImageSrc = (digimon: { id: number }) => {
    if (imageErrors.has(digimon.id)) {
      return "/images/digimons/fallback.svg";
    }
    return `/images/digimons/${digimon.id.toString().padStart(2, "0")}.png`;
  };

  const handleDigimonClick = (digimon: Digimon) => {
    console.log("🔍 Digimon selecionado:", {
      id: digimon.id,
      nome: digimon.name,
    });
    setSelectedDigimon(digimon);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800 shadow-md border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Nome do Sistema */}
            <Link href="/">
              <h1 className="text-2xl font-bold text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">
                Digimon Board Clash
              </h1>
            </Link>

            {/* Botões de Navegação */}
            <div className="flex gap-4">
              <Link href="/digimons">
                <button className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                  Digimons
                </button>
              </Link>
              {process.env.NODE_ENV === "development" && (
                <Link href="/admin">
                  <button className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md">
                    Admin
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            📚 Biblioteca de Digimons
          </h2>
          <p className="text-gray-300">
            Explore todos os Digimons disponíveis e suas linhas evolutivas
          </p>
        </div>

        {/* Barra de Pesquisa */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar Digimon por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
              🔍
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                ✖
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Carregando Digimons...
            </h3>
            <p className="text-gray-400">
              Aguarde enquanto buscamos os dados do banco
            </p>
          </div>
        ) : (
          <>
            {/* Se estiver pesquisando, mostrar resultados em grid simples */}
            {searchTerm ? (
              <>
                {/* Contador de resultados */}
                <div className="mb-4 text-gray-400 text-sm">
                  {
                    digimons.filter((d) =>
                      d.name.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length
                  }{" "}
                  {digimons.filter((d) =>
                    d.name.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 1
                    ? "resultado encontrado"
                    : "resultados encontrados"}
                </div>

                {/* Grid de Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {digimons
                    .filter((d) =>
                      d.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((digimon) => (
                      <div
                        key={digimon.id}
                        onClick={() => handleDigimonClick(digimon)}
                        className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                      >
                        {/* Imagem do Digimon */}
                        <div className="relative h-56 bg-gradient-to-br from-orange-100 to-blue-100 overflow-hidden">
                          <Image
                            src={getImageSrc(digimon)}
                            alt={digimon.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={() => handleImageError(digimon.id)}
                          />
                          {/* Indicador de fallback */}
                          {imageErrors.has(digimon.id) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100">
                              <div className="text-center text-orange-600">
                                <div className="text-4xl mb-2">🥚</div>
                                <div className="text-xs text-orange-500">
                                  Aguardando evolução...
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Informações do Digimon */}
                        <div className="p-4">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {capitalize(digimon.name)}
                          </h3>

                          <div className="space-y-2">
                            {/* Tipo */}
                            <div className="flex items-center gap-2">
                              <span
                                className={`${getTypeColor(
                                  digimon.typeId
                                )} text-white text-xs font-semibold px-3 py-1 rounded-full`}
                              >
                                {getTypeName(digimon.typeId)}
                              </span>
                            </div>

                            {/* Level e DP */}
                            <div className="flex justify-between text-sm text-gray-300">
                              <span className="font-semibold">
                                <span className="text-blue-400">
                                  {getLevelName(digimon.level)}
                                </span>
                              </span>
                              <span className="font-semibold">
                                DP:{" "}
                                <span className="text-orange-400">
                                  {digimon.dp}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Mensagem quando não há resultados */}
                {digimons.filter((d) =>
                  d.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-300 text-lg">
                      Nenhum Digimon encontrado com &quot;{searchTerm}&quot;
                    </p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Limpar Pesquisa
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Seções por Nível */
              <div className="space-y-12">
                {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                  const digimonsInLevel = digimons.filter(
                    (d) => d.level === level
                  );

                  if (digimonsInLevel.length === 0) return null;

                  return (
                    <div key={level}>
                      {/* Cabeçalho da Seção */}
                      <div className="flex items-center gap-4 mb-6">
                        <h3 className="text-3xl font-bold text-white">
                          {getLevelName(level)}
                        </h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
                        <span className="text-gray-400 text-sm">
                          {digimonsInLevel.length}{" "}
                          {digimonsInLevel.length === 1
                            ? "Digimon"
                            : "Digimons"}
                        </span>
                      </div>

                      {/* Grid de Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {digimonsInLevel.map((digimon) => (
                          <div
                            key={digimon.id}
                            onClick={() => handleDigimonClick(digimon)}
                            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                          >
                            {/* Imagem do Digimon */}
                            <div className="relative h-56 bg-gradient-to-br from-orange-100 to-blue-100 overflow-hidden">
                              <Image
                                src={getImageSrc(digimon)}
                                alt={digimon.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                onError={() => handleImageError(digimon.id)}
                              />
                              {/* Indicador de fallback */}
                              {imageErrors.has(digimon.id) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100">
                                  <div className="text-center text-orange-600">
                                    <div className="text-4xl mb-2">🥚</div>
                                    <div className="text-xs text-orange-500">
                                      Aguardando evolução...
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Informações do Digimon */}
                            <div className="p-4">
                              <h3 className="text-xl font-bold text-white mb-2">
                                {capitalize(digimon.name)}
                              </h3>

                              <div className="space-y-2">
                                {/* Tipo */}
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`${getTypeColor(
                                      digimon.typeId
                                    )} text-white text-xs font-semibold px-3 py-1 rounded-full`}
                                  >
                                    {getTypeName(digimon.typeId)}
                                  </span>
                                </div>

                                {/* DP */}
                                <div className="flex justify-between text-sm text-gray-300">
                                  <span className="font-semibold">
                                    DP:{" "}
                                    <span className="text-orange-400">
                                      {digimon.dp}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Linha Evolutiva */}
      <EvolutionLineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        digimon={selectedDigimon}
        allDigimons={digimons}
      />
    </div>
  );
}
