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
