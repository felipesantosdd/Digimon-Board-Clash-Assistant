"use client";

import { GamePlayer, GameDigimon } from "@/types/game";
import { capitalize } from "@/lib/utils";
import DigimonCard from "./DigimonCard";

interface PlayerWithDigimonsProps {
  player: GamePlayer;
  onDigimonSelect: (digimon: GameDigimon, playerId: number) => void;
  showTypeAdvantages?: Map<number, number>; // digimonId -> advantage
}

export default function PlayerWithDigimons({
  player,
  onDigimonSelect,
  showTypeAdvantages,
}: PlayerWithDigimonsProps) {
  const aliveDigimons = player.digimons.filter((d) => d.currentHp > 0).length;

  return (
    <div className="bg-gray-700 rounded-lg p-2 sm:p-4 border-2 border-gray-600">
      {/* Header do Tamer */}
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-600">
        {player.avatar && (
          <img
            src={player.avatar}
            alt={player.name}
            className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-red-500"
          />
        )}
        <div>
          <p className="font-bold text-sm sm:text-lg text-white">
            {capitalize(player.name)}
          </p>
          <p className="text-xs sm:text-sm text-gray-400">
            {aliveDigimons} Digimons vivos
          </p>
        </div>
      </div>

      {/* Digimons do Tamer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {player.digimons.map((digimon) => {
          const advantage = showTypeAdvantages?.get(digimon.id);

          return (
            <DigimonCard
              key={digimon.id}
              digimon={digimon}
              onClick={() => onDigimonSelect(digimon, player.id)}
              showTypeAdvantage={
                advantage !== undefined && advantage !== 0
                  ? { advantage }
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
