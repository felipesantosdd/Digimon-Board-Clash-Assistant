/**
 * Utilitário para normalizar caminhos de imagem
 */

export function getTamerImagePath(image: string | null | undefined): string {
  // Se não tem imagem, usar fallback
  if (!image) {
    return "/images/tamers/fallback.svg";
  }

  // Se já é um caminho completo (começa com /)
  if (image.startsWith("/")) {
    return image;
  }

  // Se é apenas um número/nome, usar WebP (otimizado)
  return `/images/tamers/${image}.webp`;
}

export function getDigimonImagePath(image: string): string {
  // Se já é um caminho completo (começa com /)
  if (image.startsWith("/")) {
    return image;
  }

  // Se é apenas um número/nome, usar WebP (otimizado)
  return `/images/digimons/${image}.webp`;
}

export function getItemImagePath(image: string): string {
  // Se já é um caminho completo (começa com /)
  if (image.startsWith("/")) {
    return image;
  }

  // Se é apenas um nome, usar WebP (otimizado)
  return `/images/items/${image}.webp`;
}
