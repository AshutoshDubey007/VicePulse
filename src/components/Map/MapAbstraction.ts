import { Category, VerificationStatus } from '@/types';

// Map coordinate abstraction layer
export interface MapPoint {
  id: string;
  title: string;
  category: Category;
  verificationStatus: VerificationStatus;
  lat: number;
  lng: number;
  gridCode: string;
  district: string;
  imageUrl: string;
  confirmations: number;
}

// Flat GTA marketing poster category pin configuration with SVG icons
export const CATEGORY_MARKER_CONFIG: Record<
  Category,
  {
    color: string;
    borderColor: string;
    label: string;
    iconSvg: string;
  }
> = {
  'hidden-location': {
    color: '#FF8247', // VicePulse Orange
    borderColor: '#111114',
    label: 'Hidden Location',
    iconSvg: `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="currentColor"/>`,
  },
  'rare-vehicle': {
    color: '#FF4FA0', // Hot Pink
    borderColor: '#111114',
    label: 'Rare Vehicle',
    iconSvg: `<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" fill="currentColor"/>`,
  },
  'easter-egg': {
    color: '#FFE066', // Sun Yellow
    borderColor: '#111114',
    label: 'Easter Egg',
    iconSvg: `<path d="M12 2l2.4 7.2h7.6l-6 4.8 2.3 7.2-6.3-4.6-6.3 4.6 2.3-7.2-6-4.8h7.6z" fill="currentColor"/>`,
  },
  'encounter': {
    color: '#19C7B8', // Teal
    borderColor: '#111114',
    label: 'Random Encounter',
    iconSvg: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>`,
  },
  'unusual-event': {
    color: '#FF6384', // Coral Pink / Anomaly Flare
    borderColor: '#111114',
    label: 'Unusual Activity',
    iconSvg: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>`,
  },
  'wildlife': {
    color: '#10B981', // Emerald Lime
    borderColor: '#111114',
    label: 'Wildlife',
    iconSvg: `<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12c-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5zm0-7c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z" fill="currentColor"/>`,
  },
};

// Default map center: Vice City Metropolitan Area / Biscayne Bay analog
export const DEFAULT_MAP_CENTER: [number, number] = [-80.45, 25.68];
export const DEFAULT_MAP_ZOOM = 10;
