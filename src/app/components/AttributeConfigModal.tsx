"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Attribute = { id: number; name: string; image: string };

type DigimonLite = {
  id: number;
  name: string;
  image: string;
  attribute_id?: number | null;
};

export default function AttributeConfigModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [queue, setQueue] = useState<DigimonLite[]>([]);
  const [index, setIndex] = useState(0);
  const current = useMemo(
    () => (index < queue.length ? queue[index] : null),
    [queue, index]
  );

  useEffect(() => {
    if (!isOpen) return;
    // Carregar atributos
    fetch("/api/attributes")
      .then((r) => (r.ok ? r.json() : []))
      .then((arr: Attribute[]) => setAttributes(arr))
      .catch(() => {});
    // Carregar digimons com attribute_id nulo
    fetch("/api/digimons")
      .then((r) => (r.ok ? r.json() : []))
      .then((arr: DigimonLite[]) => {
        const list = arr.filter((d) => !d.attribute_id || d.attribute_id === 0);
        setQueue(list);
        setIndex(0);
      })
      .catch(() => {});
  }, [isOpen]);

  const assignAndNext = async (attributeId: number) => {
    if (!current) return;
    try {
      await fetch(`/api/digimons/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: current.name,
          level: 1,
          typeId: 1,
          attribute_id: attributeId,
        }),
      });
    } catch {}
    setIndex((i) => i + 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-full max-w-3xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-lg">Atribuir Atributo</h2>
          <button className="text-gray-300 hover:text-white" onClick={onClose}>
            ✕
          </button>
        </div>
        {current ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-3">
              <Image
                src={current.image || "/images/digimons/fallback1.jpg"}
                alt={current.name}
                width={240}
                height={240}
                className="rounded-lg object-contain bg-gray-800"
              />
              <div className="text-white font-semibold text-xl">
                {current.name}
              </div>
              <div className="text-sm text-gray-400">
                {index + 1} / {queue.length}
              </div>
            </div>
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-auto pr-2">
                {attributes.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => assignAndNext(a.id)}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-2 text-left"
                  >
                    <Image
                      src={a.image || "/images/icons/no-data-icon.png"}
                      alt={a.name}
                      width={28}
                      height={28}
                    />
                    <span className="text-gray-100 text-sm">{a.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-300 py-10">
            Todos os Digimons já possuem atributo.
          </div>
        )}
      </div>
    </div>
  );
}
