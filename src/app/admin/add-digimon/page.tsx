"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DigimonType {
  id: number;
  name: string;
}

export default function AddDigimonPage() {
  const router = useRouter();
  const [digimonTypes, setDigimonTypes] = useState<DigimonType[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    level: 1,
    dp: 2000,
    typeId: 1,
  });

  // Carregar tipos de Digimon
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch("/api/digimons");
        if (response.ok) {
          const data = await response.json();
          // Extrair tipos únicos
          const types = Array.from(
            new Set(data.map((d: any) => d.typeId))
          ).map((typeId) => {
            const digimon = data.find((d: any) => d.typeId === typeId);
            return {
              id: typeId as number,
              name: digimon?.type?.name || "Unknown",
            };
          });
          setDigimonTypes(types);
        }
      } catch (error) {
        console.error("Erro ao carregar tipos:", error);
      }
    };

    fetchTypes();
  }, []);

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
          evolution: [], // Nova criação começa sem evoluções
        }),
      });

      if (response.ok) {
        alert("✅ Digimon adicionado com sucesso!");
        router.push("/admin");
      } else {
        const error = await response.json();
        alert(`❌ Erro: ${error.error || "Erro ao adicionar Digimon"}`);
      }
    } catch (error) {
      console.error("Erro ao adicionar Digimon:", error);
      alert("❌ Erro ao adicionar Digimon");
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
      [name]: ["level", "dp", "typeId"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  // Bloquear em produção
  if (process.env.NODE_ENV === "production") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Esta página está disponível apenas em desenvolvimento
          </p>
          <Link href="/admin">
            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Voltar para Admin
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin">
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors">
                ← Adicionar Novo Digimon
              </h1>
            </Link>

            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-semibold">
              🛠️ Modo Desenvolvimento
            </div>
          </div>
        </div>
      </header>

      {/* Formulário */}
      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Informações do Digimon
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Imagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Imagem *
              </label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                placeholder="Ex: /images/digimons/99.png"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: /images/digimons/XX.png
              </p>
            </div>

            {/* Level e DP */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level *
                </label>
                <input
                  type="number"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  required
                  min="1"
                  max="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                name="typeId"
                value={formData.typeId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {digimonTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Link href="/admin" className="flex-1">
                <button
                  type="button"
                  className="w-full px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Adicionando..." : "➕ Adicionar Digimon"}
              </button>
            </div>
          </form>

          {/* Aviso */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Atenção:</strong> Esta funcionalidade só funciona em
              desenvolvimento. Em produção, o banco é somente leitura (JSON).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

