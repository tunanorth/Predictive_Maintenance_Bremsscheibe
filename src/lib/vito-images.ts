// Vito images: served from /vitos/ (place vito1.avif, vito2.webp, vito3.jpg in public/vitos/ for build)
const VITO_IMAGES: string[] = ['/vitos/vito1.avif', '/vitos/vito2.webp', '/vitos/vito3.jpg'];

export function getVitoImageForIndex(index: number): string {
  return VITO_IMAGES[index % VITO_IMAGES.length];
}

export function getVitoImageForId(id: string): string {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return VITO_IMAGES[hash % VITO_IMAGES.length];
}
