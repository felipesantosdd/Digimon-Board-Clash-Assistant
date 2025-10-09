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
 * @param level - Nível do Digimon (1-7)
 * @returns Nome do estágio (Rookie, Champion, Ultimate, Mega)
 */
export function getLevelName(level: number): string {
  switch (level) {
    case 1:
      return "Rookie";
    case 2:
      return "Champion";
    case 3:
      return "Ultimate";
    case 4:
    case 5:
    case 6:
    case 7:
      return "Mega";
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
