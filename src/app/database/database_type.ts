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
  evolution: number[];
  type?: DigimonType;
  active?: boolean;
  boss?: boolean;
  hp?: number;
  atk?: number;
  def?: number;
  attribute_id?: number;
};

export type DigimonType = {
  id: number;
  name: string;
  weakness: number | null;
};
