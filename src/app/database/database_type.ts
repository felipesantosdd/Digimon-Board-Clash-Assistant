export type User = {
  id: number;
  nome: string;
  avatar: string;
};

export type Digimon = {
  id: number;
  name: string;
  image: string;
  typeId: number;
  level: number;
  dp: number;
  evolution: number[];
  type?: DigimonType;
};

export type DigimonType = {
  id: number;
  name: string;
  weakness: number | null;
};
