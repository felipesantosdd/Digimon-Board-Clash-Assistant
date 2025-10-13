/**
 * Capitaliza a primeira letra de uma string
 * @param str - String para capitalizar
 * @returns String com a primeira letra em maiúscula
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitaliza a primeira letra de cada palavra em uma string
 * @param str - String para capitalizar
 * @returns String com a primeira letra de cada palavra em maiúscula
 */
export function capitalizeWords(str: string): string {
  if (!str) return str;
  return str
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Converte o nível numérico para o nome do estágio
 * @param level - Nível do Digimon (0-8)
 * @returns Nome do estágio (Armor, Rookie, Champion, Ultimate, Mega, Ultra, Super Mega, Spirits)
 */
export function getLevelName(level: number): string {
  switch (level) {
    case 0:
      return "Armor";
    case 1:
      return "Rookie";
    case 2:
      return "Champion";
    case 3:
      return "Ultimate";
    case 4:
      return "Mega";
    case 5:
      return "Ultra";
    case 6:
      return "Super Mega";
    case 7:
      return "Mega"; // Raramente usado
    case 8:
      return "Spirits"; // Guerreiros Lendários (Digimon Frontier)
    default:
      return `Level ${level}`;
  }
}

/**
 * Tipos de Digimon e suas vantagens
 */
export const DIGIMON_TYPES = {
  DATA: 1,
  VACCINE: 2,
  VIRUS: 3,
  FREE: 4,
  VARIABLE: 5,
  UNKNOWN: 6,
} as const;

/**
 * Nomes dos tipos de Digimon
 */
export const DIGIMON_TYPE_NAMES = {
  [DIGIMON_TYPES.DATA]: "Data",
  [DIGIMON_TYPES.VACCINE]: "Vaccine",
  [DIGIMON_TYPES.VIRUS]: "Virus",
  [DIGIMON_TYPES.FREE]: "Free",
  [DIGIMON_TYPES.VARIABLE]: "Variable",
  [DIGIMON_TYPES.UNKNOWN]: "Unknown",
} as const;

/**
 * Cores dos tipos de Digimon (classes Tailwind)
 */
export const DIGIMON_TYPE_COLORS = {
  [DIGIMON_TYPES.DATA]: "bg-blue-600 text-white",
  [DIGIMON_TYPES.VACCINE]: "bg-green-600 text-white",
  [DIGIMON_TYPES.VIRUS]: "bg-purple-600 text-white",
  [DIGIMON_TYPES.FREE]: "bg-gray-100 text-gray-900",
  [DIGIMON_TYPES.VARIABLE]: "bg-gray-600 text-white",
  [DIGIMON_TYPES.UNKNOWN]: "bg-black text-white",
} as const;

/**
 * Retorna a classe de cor para um tipo de Digimon
 */
export function getTypeColor(typeId: number): string {
  return (
    DIGIMON_TYPE_COLORS[typeId as keyof typeof DIGIMON_TYPE_COLORS] ||
    "bg-gray-600"
  );
}

/**
 * Calcula a vantagem de tipo entre dois Digimons
 * @param attackerTypeId - ID do tipo do Digimon atacante
 * @param defenderTypeId - ID do tipo do Digimon defensor
 * @returns Vantagem: 1 = vantagem, 0 = neutro, -1 = desvantagem
 */
export function calculateTypeAdvantage(
  attackerTypeId: number,
  defenderTypeId: number
): number {
  // Apenas Vaccine, Virus e Data têm vantagens entre si
  const hasAdvantage: number[] = [
    DIGIMON_TYPES.VACCINE,
    DIGIMON_TYPES.VIRUS,
    DIGIMON_TYPES.DATA,
  ];

  if (
    !hasAdvantage.includes(attackerTypeId) ||
    !hasAdvantage.includes(defenderTypeId)
  ) {
    return 0; // Neutro para tipos especiais
  }

  // Vaccine > Virus > Data > Vaccine (pedra papel tesoura)
  if (
    attackerTypeId === DIGIMON_TYPES.VACCINE &&
    defenderTypeId === DIGIMON_TYPES.VIRUS
  ) {
    return 1; // Vaccine tem vantagem sobre Virus
  }
  if (
    attackerTypeId === DIGIMON_TYPES.VIRUS &&
    defenderTypeId === DIGIMON_TYPES.DATA
  ) {
    return 1; // Virus tem vantagem sobre Data
  }
  if (
    attackerTypeId === DIGIMON_TYPES.DATA &&
    defenderTypeId === DIGIMON_TYPES.VACCINE
  ) {
    return 1; // Data tem vantagem sobre Vaccine
  }

  // Casos de desvantagem (o inverso dos acima)
  if (
    attackerTypeId === DIGIMON_TYPES.VIRUS &&
    defenderTypeId === DIGIMON_TYPES.VACCINE
  ) {
    return -1; // Virus tem desvantagem contra Vaccine
  }
  if (
    attackerTypeId === DIGIMON_TYPES.DATA &&
    defenderTypeId === DIGIMON_TYPES.VIRUS
  ) {
    return -1; // Data tem desvantagem contra Virus
  }
  if (
    attackerTypeId === DIGIMON_TYPES.VACCINE &&
    defenderTypeId === DIGIMON_TYPES.DATA
  ) {
    return -1; // Vaccine tem desvantagem contra Data
  }

  return 0; // Neutro (mesmo tipo)
}

/**
 * Calcula o poder de ataque base de um Digimon
 * Poder = DP / 3 arredondado para cima em múltiplos de 100
 */
export function calculatePower(dp: number): number {
  const basePower = dp / 3;
  return Math.ceil(basePower / 100) * 100;
}

/**
 * Calcula o poder de ataque com bônus aplicado
 * Bônus de ataque = cada ponto aumenta 2% o poder
 */
export function calculatePowerWithBonus(dp: number, attackBonus: number = 0): number {
  const basePower = calculatePower(dp);
  
  if (!attackBonus || attackBonus === 0) return basePower;
  
  // Cada ponto de bônus = +2% de poder
  const bonusPercentage = attackBonus * 2;
  const powerWithBonus = basePower * (1 + bonusPercentage / 100);
  
  // Arredondar para múltiplo de 100
  return Math.round(powerWithBonus / 100) * 100;
}

/**
 * Atributos Elementais de Digimon
 */
export const DIGIMON_ATTRIBUTES = {
  NEUTRAL: 1,
  FIRE: 2,
  WATER: 3,
  ICE: 4,
  PLANT: 5,
  WIND: 6,
  EARTH: 7,
  THUNDER: 8,
  LIGHT: 9,
  DARK: 10,
  METAL: 11,
  UNKNOWN: 12,
} as const;

/**
 * Mapa de fraquezas de atributos (definido manualmente para evitar require/import)
 * Cada chave é o ID do atributo, o valor é o ID do atributo ao qual ele é fraco
 */
const ATTRIBUTE_WEAKNESSES: Record<number, number | null> = {
  1: null, // Neutro - sem fraqueza
  2: 3, // Fogo é fraco contra Água
  3: 5, // Água é fraco contra Planta
  4: 2, // Gelo é fraco contra Fogo
  5: 2, // Planta é fraco contra Fogo
  6: 4, // Vento é fraco contra Gelo
  7: 6, // Terra é fraco contra Vento
  8: 7, // Trovão é fraco contra Terra
  9: 10, // Luz é fraco contra Trevas
  10: 9, // Trevas é fraco contra Luz
  11: 8, // Metal é fraco contra Trovão
  12: null, // Desconhecido - sem fraqueza
};

/**
 * Calcula a vantagem de atributo elemental entre dois Digimons
 * @param attackerAttributeId - ID do atributo do Digimon atacante
 * @param defenderAttributeId - ID do atributo do Digimon defensor
 * @returns Vantagem: 1 = vantagem, 0 = neutro, -1 = desvantagem
 */
export function calculateAttributeAdvantage(
  attackerAttributeId: number | undefined,
  defenderAttributeId: number | undefined
): number {
  // Se algum dos atributos não está definido ou é "Unknown", retorna neutro
  if (
    !attackerAttributeId ||
    !defenderAttributeId ||
    attackerAttributeId === DIGIMON_ATTRIBUTES.UNKNOWN ||
    defenderAttributeId === DIGIMON_ATTRIBUTES.UNKNOWN
  ) {
    return 0;
  }

  // Se o atacante tem fraqueza ao defensor, atacante está em DESVANTAGEM
  if (ATTRIBUTE_WEAKNESSES[attackerAttributeId] === defenderAttributeId) {
    return -1;
  }

  // Se o defensor tem fraqueza ao atacante, atacante está em VANTAGEM
  if (ATTRIBUTE_WEAKNESSES[defenderAttributeId] === attackerAttributeId) {
    return 1;
  }

  return 0; // Neutro
}

/**
 * Aplica modificador de dano baseado na vantagem de tipo
 * @param baseDamage - Dano base
 * @param typeAdvantage - Vantagem de tipo (1, 0, ou -1)
 * @returns Dano modificado
 */
export function applyTypeAdvantageDamage(
  baseDamage: number,
  typeAdvantage: number
): number {
  if (typeAdvantage === 1) {
    return Math.round(baseDamage * 1.35); // +35% de vantagem
  } else if (typeAdvantage === -1) {
    return Math.round(baseDamage * 0.65); // -35% de desvantagem
  }
  return baseDamage; // Neutro
}

/**
 * Intervalos de HP e DP por nível
 */
export const LEVEL_STATS_RANGES = {
  0: { min: 1600, max: 2400 }, // Armor - mesmo range que Rookie
  1: { min: 1600, max: 2400 },
  2: { min: 4000, max: 6000 },
  3: { min: 6400, max: 9600 },
  4: { min: 10000, max: 14000 },
  5: { min: 15000, max: 18000 },
  6: { min: 19000, max: 24000 },
  7: { min: 19000, max: 24000 }, // Level 7 usa o mesmo range que Level 6
} as const;

/**
 * Gera HP e DP aleatórios dentro do intervalo do nível
 * @param level - Nível do Digimon (1-7)
 * @returns Objeto com HP e DP aleatórios (múltiplos de 100)
 */
export function generateRandomStats(level: number): { hp: number; dp: number } {
  const range =
    LEVEL_STATS_RANGES[level as keyof typeof LEVEL_STATS_RANGES] ||
    LEVEL_STATS_RANGES[1];

  // Gerar valor base aleatório
  const randomValue =
    Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

  // Arredondar para múltiplo de 100
  const roundedValue = Math.round(randomValue / 100) * 100;

  // HP e DP são iguais (sempre 100% do HP)
  return { hp: roundedValue, dp: roundedValue };
}

/**
 * Gera stats para boss (sempre valor máximo do nível)
 * @param level - Nível do Boss (1-7)
 * @returns Objeto com HP (máx × 3) e DP (máx)
 */
export function generateBossStats(level: number): { hp: number; dp: number } {
  const range =
    LEVEL_STATS_RANGES[level as keyof typeof LEVEL_STATS_RANGES] ||
    LEVEL_STATS_RANGES[1];

  const maxDp = range.max;
  const maxHp = maxDp * 3;

  return { hp: maxHp, dp: maxDp };
}

/**
 * Gera stats de Armor baseado no nível mais alto em jogo
 * Armor escala com o nível mais alto (incluindo boss)
 * @param highestLevel - Nível mais alto em jogo (Digimons + Boss)
 * @returns Objeto com HP e DP aleatórios baseados no range do nível mais alto
 *
 * Exemplos:
 * - Todos Level 1, sem boss → Armor usa range Level 1 (1.600-2.400)
 * - Todos Level 2, Boss Level 3 → Armor usa range Level 3 (6.400-9.600)
 * - Mix de níveis, Boss Level 5 → Armor usa range Level 5 (15.000-18.000)
 */
export function generateArmorStats(highestLevel: number): {
  hp: number;
  dp: number;
} {
  // Usar o range do nível mais alto em jogo
  const range =
    LEVEL_STATS_RANGES[highestLevel as keyof typeof LEVEL_STATS_RANGES] ||
    LEVEL_STATS_RANGES[1];

  const randomValue =
    Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

  const roundedValue = Math.round(randomValue / 100) * 100;

  console.log(
    `🛡️ [ARMOR] Nível mais alto: ${highestLevel}, Stats gerados: ${roundedValue}`
  );

  return { hp: roundedValue, dp: roundedValue };
}
