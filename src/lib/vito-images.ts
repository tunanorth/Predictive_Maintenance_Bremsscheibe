// Vito vehicle images from project folder vitos/ (or public/vitos/ if you copy them there)
import vito1 from '../../vitos/vito1.avif';
import vito2 from '../../vitos/vito2.webp';
import vito3 from '../../vitos/vito3.jpg';

const VITO_IMAGES: string[] = [vito1, vito2, vito3];

export function getVitoImageForIndex(index: number): string {
  return VITO_IMAGES[index % VITO_IMAGES.length];
}

export function getVitoImageForId(id: string): string {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return VITO_IMAGES[hash % VITO_IMAGES.length];
}
