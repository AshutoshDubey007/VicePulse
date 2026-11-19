/**
 * VicePulse SEO, Brand & Discoverability Configuration
 */

export const siteConfig = {
  name: 'VicePulse',
  legalName: 'VicePulse Autonomous Intelligence Network',
  shortName: 'VicePulse',
  tagline: 'Autonomous GTA VI Discovery & Research Intelligence Engine',
  description:
    'Investigative intelligence platform cataloging verified hidden locations, rare vehicles, easter eggs, and random encounters across GTA VI and the State of Leonida.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/images/hero/vice-city-hero.webp',
  social: {
    x: 'https://x.com/VicePulseHQ',
    youtube: 'https://youtube.com/@VicePulseHQ',
    reddit: 'https://reddit.com/r/VicePulse',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || '',
    bing: process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
  },
  creator: 'VicePulse Autonomous Cartography & Research Unit',
  publisher: 'VicePulse Network',
};

export const CATEGORY_SEO_DATA: Record<
  string,
  {
    title: string;
    description: string;
    h1: string;
    intro: string;
  }
> = {
  'hidden-location': {
    title: 'Hidden Locations in GTA VI – Secret Interiors & Bunkers',
    description:
      'Explore verified hidden locations, secret interiors, submerged wrecks, and underground bunkers discovered in GTA VI across the State of Leonida.',
    h1: 'Hidden Locations in GTA VI',
    intro:
      'Catalog of documented hidden interiors, locked facilities, Cold War bunkers, and underwater shipwrecks discovered throughout Vice City and greater Leonida.',
  },
  'rare-vehicle': {
    title: 'Rare Vehicles in GTA VI – Spawns, Supercars & Exotic Rides',
    description:
      'Track confirmed rare vehicle spawn points, exotic supercars, aircraft, and secret boat locations discovered by the GTA VI community.',
    h1: 'Rare Vehicles in GTA VI',
    intro:
      'Database of rare vehicle spawns, unique vehicle variants, military prototypes, and hidden maritime vessels with coordinate provenance.',
  },
  'easter-egg': {
    title: 'GTA VI Easter Eggs – Lore Tributes, Secrets & Radio Signals',
    description:
      'Uncover cryptic easter eggs, historical lore references, anomalous radio signals, and mystery clues uncovered throughout GTA VI.',
    h1: 'GTA VI Easter Eggs & Secrets',
    intro:
      'Documented easter eggs, satirical billboards, paranormal signals, and historical tributes hidden across Vice City and rural Leonida.',
  },
  'encounter': {
    title: 'Random Encounters in GTA VI – Dynamic NPC Events & Oddities',
    description:
      'Documented dynamic random encounters, highway events, bizarre NPC interactions, and emergent gameplay moments in GTA VI.',
    h1: 'GTA VI Random Encounters',
    intro:
      'Chronicle of verified roadside emergencies, unusual civilian interactions, and spontaneous world events occurring throughout Leonida.',
  },
  'unusual-event': {
    title: 'Secret Activities & Events in GTA VI – Night Races & Contraband',
    description:
      'Find secret night events, contraband drops, illegal street races, and clandestine activities happening across GTA VI.',
    h1: 'Secret Activities & Events in GTA VI',
    intro:
      'Guide to time-sensitive events, secret nighttime gatherings, air-drop contraband recoveries, and covert side activities.',
  },
  'wildlife': {
    title: 'Wildlife Discoveries in GTA VI – Apex Predators & Rare Fauna',
    description:
      'Track rare wildlife sightings, apex predators, wetland species, and animal behaviors across the Grassrivers and Leonida wilderness.',
    h1: 'GTA VI Wildlife Discoveries',
    intro:
      'Ecological survey of Leonida fauna, apex alligator habitats, rare panther sightings, and maritime wildlife behaviors.',
  },
};
