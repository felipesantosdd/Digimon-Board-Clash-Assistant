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
