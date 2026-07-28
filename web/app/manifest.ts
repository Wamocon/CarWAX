import type { MetadataRoute } from 'next';
import { brand } from '@/lib/data/site';

/**
 * In der Türkei läuft ein sehr großer Teil des Verkehrs über Android-Telefone,
 * und „zum Startbildschirm hinzufügen" ist dort ein üblicher Weg. Ohne Manifest
 * landet dabei ein namenloses Lesezeichen mit weißem Kasten auf dem Homescreen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.legalName} Antalya`,
    short_name: brand.displayName,
    description:
      'Seramik kaplama, PPF, detaylı araç bakımı ve tekne bakımı. Antalya’da dört şube.',
    start_url: '/tr',
    display: 'standalone',
    background_color: '#0b0f16',
    theme_color: '#0b0f16',
    lang: 'tr',
    dir: 'ltr',
    categories: ['business', 'lifestyle'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
