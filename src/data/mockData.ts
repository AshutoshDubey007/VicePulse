import { Discovery, RareVehicle, SourceRecord, UserProfile, Comment } from '@/types';

export const mockUsers: UserProfile[] = [
  {
    id: 'usr-1',
    username: 'NeonTracker_99',
    email: 'scout@vicepulse.net',
    role: 'investigator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Leonida cartography analyst & night radar scout. Specializing in Vice Beach backalleys and Keys floatplane routes.',
    reputation: 1840,
    badges: [
      { id: 'b-1', name: 'Leonida Cartographer', icon: 'Compass', description: 'Mapped over 25 verified world points across Vice City.' },
      { id: 'b-2', name: 'Night Owl', icon: 'Moon', description: 'First to log 10 nighttime-only world discoveries.' },
      { id: 'b-3', name: 'High Reliability', icon: 'ShieldCheck', description: 'Over 95% verification accuracy across all submissions.' }
    ],
    contributionsCount: 38,
    verifiedCount: 31,
    joinedDate: '2025-01-14',
    submittedDiscoveryIds: ['disc-1', 'disc-4', 'disc-9'],
    confirmedDiscoveryIds: ['disc-2', 'disc-3', 'disc-5', 'disc-6']
  },
  {
    id: 'usr-2',
    username: 'GatorWatch_Vic',
    email: 'swamp@vicepulse.net',
    role: 'scout',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'Grassrivers enthusiast. Tracking wildlife migration, smuggler docks, and abandoned sugar refineries in Ambrosia.',
    reputation: 920,
    badges: [
      { id: 'b-4', name: 'Swamp Scout', icon: 'Trees', description: 'Specialized in Grassrivers wetlands and mud rallies.' },
      { id: 'b-5', name: 'Eyewitness', icon: 'Eye', description: 'Submitted 15+ independent photo confirmations.' }
    ],
    contributionsCount: 19,
    verifiedCount: 14,
    joinedDate: '2025-02-02',
    submittedDiscoveryIds: ['disc-2', 'disc-5'],
    confirmedDiscoveryIds: ['disc-1', 'disc-7']
  },
  {
    id: 'usr-3',
    username: 'ViceAdmin_K',
    email: 'admin@vicepulse.net',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'VicePulse Lead Moderator & Data Auditor. Cross-referencing trailer geolocations with leaked test build telemetry.',
    reputation: 4950,
    badges: [
      { id: 'b-6', name: 'Chief Auditor', icon: 'CheckCircle', description: 'Supervised verification pipeline for VicePulse intelligence.' },
      { id: 'b-7', name: 'Founder', icon: 'Award', description: 'Core founder of the Leonida mapping project.' }
    ],
    contributionsCount: 82,
    verifiedCount: 79,
    joinedDate: '2024-12-01',
    submittedDiscoveryIds: ['disc-3', 'disc-7', 'disc-11'],
    confirmedDiscoveryIds: ['disc-1', 'disc-2', 'disc-4', 'disc-8']
  }
];

export const mockDiscoveries: Discovery[] = [
  {
    id: 'disc-1',
    title: 'Submerged 1980s Smuggler Cessna & Coral Cargo',
    slug: 'submerged-1980s-smuggler-cessna',
    category: 'hidden-location',
    subcategory: 'Underwater Shipwreck / Plane Wreck',
    locationName: 'Key Chicas Shoals',
    district: 'The Keys',
    coordinates: {
      lat: 25.540,
      lng: -80.220,
      inGameGrid: 'KC-48.2'
    },
    inGameCoordinates: {
      x: -271.2,
      y: -2333.7
    },
    coordinateProvenance: {
      system: 'gtadb_v6',
      originalCoords: [-271.2, -2333.7],
      source: 'VicePulse Scuba Survey'
    },
    description: 'An intact twin-engine prop plane rested on a coral reef ledge in clear turquoise water. Hull markings match 1986 Colombian cartel contraband flights. Inside the cockpit, vintage aeronautical charts and waterlogged lockboxes remain visible.',
    stepsToFind: [
      'Take a submersible or scuba gear south-southwest from Key Chicas Marina.',
      'Head towards the shallow reef plateau approximately 400m past the navigation buoy.',
      'Look for the sun glint reflecting off the dual aluminium propellers between two brain coral mounds.'
    ],
    inGameTime: '09:00 - 16:00 (optimal sunlight underwater)',
    weather: 'Clear / Calm Waters',
    requirements: ['Scuba Gear or Reef Glider Boat', 'Deep dive oxygen booster recommended'],
    evidenceImages: [
      {
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
        caption: 'Scuba diver visual approach towards the twin-engine wreck on the coral reef.',
        type: 'screenshot'
      },
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        caption: 'Cockpit instruments overgrown with sea fans and reef sponges.',
        type: 'screenshot'
      }
    ],
    source: {
      platform: 'reddit',
      url: 'https://reddit.com/r/GTA6/comments/sample-smuggler-plane',
      author: 'u/LeonidaScubaScout',
      timestamp: '2025-02-18T14:32:00Z'
    },
    verificationStatus: 'community_verified',
    verificationReason: 'Verified by 47 independent field scouts with geolocated coordinate screenshots matches.',
    confirmationsCount: 47,
    confirmedBy: ['usr-1', 'usr-3', 'scout-12', 'scout-88'],
    disputeCount: 1,
    disputes: [
      {
        id: 'disp-1',
        reason: 'Water depth reported as 12m, but low tide makes it 8m with propeller breaking surface.',
        reportedBy: 'usr-2',
        createdAt: '2025-02-19T08:12:00Z'
      }
    ],
    tags: ['The Keys', 'Underwater', 'Smuggling', 'Wreck', 'Lootable'],
    submittedBy: {
      id: 'usr-1',
      username: 'NeonTracker_99',
      role: 'investigator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    },
    createdAt: '2025-02-18T14:32:00Z',
    updatedAt: '2025-02-19T11:00:00Z',
    featured: true
  },
  {
    id: 'disc-2',
    title: 'Bravado Banshee GTS Retro Prototype in Storage Yard',
    slug: 'bravado-banshee-gts-retro-prototype',
    category: 'rare-vehicle',
    subcategory: 'Classic Sports Car',
    locationName: 'Port Gellhorn Freight Depot',
    district: 'Port Gellhorn',
    coordinates: {
      lat: 25.421,
      lng: -81.231,
      inGameGrid: 'PG-12.8'
    },
    description: 'A custom metallic sunset-copper Banshee GTS with dual white racing stripes parked behind a locked chainlink fence inside warehouse row 7. Features unique tuned exhaust note and custom interior dash clock.',
    stepsToFind: [
      'Enter Port Gellhorn industrial sector after midnight.',
      'Locate Container Warehouse 7 near the gantry cranes.',
      'Crawl under the detached security fence on the southern loading dock or hop the dumpster.'
    ],
    inGameTime: '01:00 - 03:30 AM',
    weather: 'Light Rain / Overcast',
    requirements: ['Lockpick or Bolt Cutters', 'Evade roving security patrol guard'],
    evidenceImages: [
      {
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
        caption: 'Rear angle of the sunset-copper Banshee under sodium vapor lamps.',
        type: 'screenshot'
      },
      {
        url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
        caption: 'Interior vintage woodgrain dashboard with working analogue dials.',
        type: 'screenshot'
      }
    ],
    source: {
      platform: 'youtube',
      url: 'https://youtube.com/watch?v=sample-banshee-depot',
      author: 'ViceRacer_TV',
      timestamp: '2025-02-15T22:15:00Z'
    },
    verificationStatus: 'personally_verified',
    verificationReason: 'Lead auditor replicated spawn sequence twice under thunderstorm weather.',
    confirmationsCount: 68,
    confirmedBy: ['usr-1', 'usr-2', 'usr-3', 'racer_x'],
    disputeCount: 0,
    disputes: [],
    tags: ['Port Gellhorn', 'Banshee', 'Rare Spawn', 'Exotic Car', 'Night Only'],
    submittedBy: {
      id: 'usr-2',
      username: 'GatorWatch_Vic',
      role: 'scout',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
    },
    createdAt: '2025-02-15T22:15:00Z',
    updatedAt: '2025-02-18T09:40:00Z',
    featured: true
  },
  {
    id: 'disc-3',
    title: 'Ocean Beach Art Deco Hotel Penthouse Bloodbath Callback',
    slug: 'ocean-beach-hotel-penthouse-chainsaw-homage',
    category: 'easter-egg',
    subcategory: 'Scarface & Vice City 2002 Homage',
    locationName: 'The Montgomery Hotel, Room 3c',
    district: 'Vice Beach',
    coordinates: {
      lat: 25.782,
      lng: -80.131,
      inGameGrid: 'VB-03.1'
    },
    description: 'A direct homage to GTA: Vice City Apartment 3c and the classic 1983 chainsaw scene. Pink tiled bathroom with faint rust/blood splatter around the bathtub, accompanied by an old buzzing power tool and a Hawaiian shirt hung on the door frame.',
    stepsToFind: [
      'Walk into the art deco alley behind Ocean Drive between 10th and 11th Street.',
      'Take the exterior fire escape stairs up to the second floor.',
      'Push open the unlatched service door leading into Room 3c.'
    ],
    inGameTime: 'Any time',
    weather: 'Any weather',
    requirements: ['None / Free Exploration'],
    evidenceImages: [
      {
        url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
        caption: 'Art deco exterior of the Montgomery with neon signage reflecting on wet pavement.',
        type: 'screenshot'
      },
      {
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
        caption: 'Tiled bathroom interior with vintage chainsaw prop resting on edge of tub.',
        type: 'screenshot'
      }
    ],
    source: {
      platform: 'tiktok',
      url: 'https://tiktok.com/@vicecitysecrets/video/sample-scarface-room',
      author: '@vicecitysecrets',
      timestamp: '2025-02-10T19:00:00Z'
    },
    verificationStatus: 'community_verified',
    verificationReason: 'Cross-checked with trailer background architecture and corroborated by 84 community scouts.',
    confirmationsCount: 84,
    confirmedBy: ['usr-1', 'usr-2', 'usr-3'],
    disputeCount: 0,
    disputes: [],
    tags: ['Vice Beach', 'Scarface', 'Easter Egg', 'Classic Lore', 'Interior'],
    submittedBy: {
      id: 'usr-3',
      username: 'ViceAdmin_K',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
    },
    createdAt: '2025-02-10T19:00:00Z',
    updatedAt: '2025-02-12T16:20:00Z',
    featured: true
  },
  {
    id: 'disc-4',
    title: 'Midnight Airboat Drag Races & Mud Pit Camp',
    slug: 'midnight-airboat-drag-races-grassrivers',
    category: 'encounter',
    subcategory: 'Dynamic NPC Gathering',
    locationName: 'Gator Gulch Landing',
    district: 'Grassrivers',
    coordinates: {
      lat: 25.612,
      lng: -80.642,
      inGameGrid: 'GR-88.5'
    },
    description: 'An unsanctioned underground gathering of airboat enthusiasts, swamp buggy racers, and backwoods gamblers. Twin-supercharged airboats blast down narrow mangrove canals under red warning flares with heavy country-techno blasting from truck stereos.',
    stepsToFind: [
      'Travel deep into western Grassrivers towards the power transmission towers.',
      'Listen for loud supercharger whines and follow orange smoke signals rising above the sawgrass.',
      'Approach on foot or in an all-terrain vehicle to avoid getting stuck in muck.'
    ],
    inGameTime: '23:30 - 04:00 AM on in-game weekends',
    weather: 'Clear or Foggy Night',
    requirements: ['High ground clearance vehicle or fan boat', 'Unarmed approach to avoid NPC hostility'],
    evidenceImages: [
      {
        url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
        caption: 'Campfire and modified fan boats lined along the sawgrass bank.',
        type: 'screenshot'
      }
    ],
    source: {
      platform: 'discord',
      url: 'https://discord.gg/leonida-mappers/msg-7729',
      author: 'MudDawg#4040',
      timestamp: '2025-02-14T03:22:00Z'
    },
    verificationStatus: 'under_investigation',
    verificationReason: 'Coordinates verified, but exact spawn trigger rules currently under investigation by telemetry crew.',
    confirmationsCount: 29,
    confirmedBy: ['usr-1', 'usr-2'],
    disputeCount: 2,
    disputes: [
      {
        id: 'disp-2',
        reason: 'Failed to trigger on Tuesday in-game night; seems restricted to Friday/Saturday night cycles.',
        reportedBy: 'scout_jax',
        createdAt: '2025-02-16T11:20:00Z'
      }
    ],
    tags: ['Grassrivers', 'Airboats', 'Races', 'Dynamic Event', 'NPC Gathering'],
    submittedBy: {
      id: 'usr-1',
      username: 'NeonTracker_99',
      role: 'investigator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    },
    createdAt: '2025-02-14T03:22:00Z',
    updatedAt: '2025-02-17T18:05:00Z',
    featured: false
  },
  {
    id: 'disc-5',
    title: 'The Ambrosia Sugar Mill Cryptid "Skunk Ape" Howls',
    slug: 'ambrosia-sugar-mill-cryptid-skunk-ape',
    category: 'unusual-event',
    subcategory: 'Paranormal / Urban Legend',
    locationName: 'Old Sol Ambrosia Sugar Mill #4',
    district: 'Ambrosia',
    coordinates: {
      lat: 25.889,
      lng: -80.952,
      inGameGrid: 'AM-31.4'
    },
    description: 'Distinct guttural roaring and heavy snapping branches audible inside the overgrown perimeter of the decommissioned sugar mill. Large bi-pedal tracks leading into the cooling vat ruins, accompanied by thermal camera silhouettes spotted by scouts.',
    stepsToFind: [
      'Camp outside Sugar Mill #4 silo during dense swamp fog.',
      'Equip night-vision goggles or directional audio headset.',
      'Wait for the church bell toll from nearby rural chapel before the low-frequency acoustic event begins.'
    ],
    inGameTime: '03:15 - 04:00 AM',
    weather: 'Heavy Swamp Fog / Humidity 95%+',
    requirements: ['Night vision optics', 'Directional microphone'],
    evidenceImages: [
      {
        url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
        caption: 'Overgrown rusted iron framework of the Ambrosia Mill at twilight.',
        type: 'screenshot'
      },
      {
        url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
        caption: 'Silhouetted movement photographed behind dense cypress grove.',
        type: 'screenshot'
      }
    ],
    source: {
      platform: 'reddit',
      url: 'https://reddit.com/r/GTA6/comments/ambrosia-skunk-ape-audio',
      author: 'u/SwampCryptidHunter',
      timestamp: '2025-02-11T05:00:00Z'
    },
    verificationStatus: 'under_investigation',
    verificationReason: 'Audio recordings confirmed genuine; physical entity model has not yet been rendered in clear light.',
    confirmationsCount: 35,
    confirmedBy: ['usr-2', 'usr-3'],
    disputeCount: 3,
    disputes: [
      {
        id: 'disp-3',
        reason: 'Sounds might just be an ambient gator bellows sound bank trigger rather than a unique cryptid.',
        reportedBy: 'usr-1',
        createdAt: '2025-02-13T10:15:00Z'
      }
    ],
    tags: ['Ambrosia', 'Cryptid', 'Skunk Ape', 'Audio Mystery', 'Spooky'],
    submittedBy: {
      id: 'usr-2',
      username: 'GatorWatch_Vic',
      role: 'scout',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
    },
    createdAt: '2025-02-11T05:00:00Z',
    updatedAt: '2025-02-15T12:00:00Z',
    featured: false
  },
  {
    id: 'disc-6',
    title: 'Venetia Bay Ultra-Luxury Superyacht "The Delphine" Boarding Hatch',
    slug: 'venetia-bay-superyacht-delphine-secret-hatch',
    category: 'hidden-location',
    subcategory: 'Infiltratable Yacht / Interior',
    locationName: 'Venetia Bay Deepwater Anchorage',
    district: 'Venetia Bay',
    coordinates: {
      lat: 25.751,
      lng: -80.178,
      inGameGrid: 'VB-19.0'
    },
    description: 'A 280-foot private mega-yacht anchored off Starfish Island. While the main boarding gangway is guarded by armed private security, an underwater dive tender hatch is unlocked on the port keel allowing stealth entry into the lower wine cellar and VIP master suite.',
    stepsToFind: [
      'Take a jet ski or swim out to the outer anchorage at Venetia Bay.',
      'Dive beneath the illuminated port side of hull near the stabilization fin.',
      'Interact with the emergency hydrostatic release lever on the dive tender hatch.'
    ],
    inGameTime: '21:00 - 05:00 (VIP cocktail party happening on top deck)',
    weather: 'Clear / Calm',
    requirements: ['Rebreather or Stealth Diving Suit', 'Silenced weapon or taser for interior guards'],
    evidenceImages: [
      {
        url: '/images/vehicles/jetmax.webp',
        caption: 'The Delphine illuminated with violet neon lights anchored off the marina.',
        type: 'screenshot'
      }
    ],
    source: {
      platform: 'gaming-press',
      url: 'https://kotaku.com/sample-gta-6-yacht-infiltration',
      author: 'Staff Editor J. Rodriguez',
      timestamp: '2025-02-08T18:45:00Z'
    },
    verificationStatus: 'personally_verified',
    verificationReason: 'Verified by VicePulse staff auditor with video documentation of full interior tour.',
    confirmationsCount: 52,
    confirmedBy: ['usr-1', 'usr-3', 'auditor-4'],
    disputeCount: 0,
    disputes: [],
    tags: ['Venetia Bay', 'Superyacht', 'Infiltration', 'VIP Interior', 'Stealth'],
    submittedBy: {
      id: 'usr-3',
      username: 'ViceAdmin_K',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
    },
    createdAt: '2025-02-08T18:45:00Z',
    updatedAt: '2025-02-14T20:10:00Z',
    featured: true
  },
  {
    id: 'disc-7',
    title: 'Grotti Cheetah Classic 1988 in Ocean Drive Underground Garage',
    slug: 'grotti-cheetah-classic-1988-underground',
    category: 'rare-vehicle',
    subcategory: 'Vintage Exotic Supercar',
    locationName: 'The Marquee Condominiums Garage B2',
    district: 'Vice Beach',
    coordinates: {
      lat: 25.795,
      lng: -80.128,
      inGameGrid: 'VB-07.4'
    },
    description: 'An all-white Grotti Cheetah Classic (Miami Vice Testarossa spec) tucked inside a private parking bay on basement level 2. Features authentic pop-up headlights and customized gold BBS wire wheels.',
    stepsToFind: [
      'Drive an upscale luxury vehicle to trigger the automated security barrier at Marquee Condos.',
      'Descend two levels down the spiral parking ramp to Level B2, Bay #41.',
      'Use high stealth or disable the security guard sitting in the glass monitoring kiosk.'
    ],
    inGameTime: '18:00 - 22:00',
    weather: 'Clear Sunset',
    requirements: ['High-end car to fool security scanner or bypass keycard'],
    evidenceImages: [
      {
        url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
        caption: 'White vintage wedge supercar reflecting pastel sunset hues.',
        type: 'screenshot'
      }
    ],
    source: {
      platform: 'youtube',
      url: 'https://youtube.com/watch?v=sample-cheetah-classic',
      author: 'LeonidaCarCulture',
      timestamp: '2025-02-05T16:10:00Z'
    },
    verificationStatus: 'community_verified',
    verificationReason: 'Confirmed by 73 scouts; vehicle persistently respawns every 4 in-game calendar days.',
    confirmationsCount: 73,
    confirmedBy: ['usr-1', 'usr-2', 'usr-3'],
    disputeCount: 0,
    disputes: [],
    tags: ['Vice Beach', 'Cheetah', 'Grotti', 'Miami Vice', 'Testarossa', 'Rare Vehicle'],
    submittedBy: {
      id: 'usr-1',
      username: 'NeonTracker_99',
      role: 'investigator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    },
    createdAt: '2025-02-05T16:10:00Z',
    updatedAt: '2025-02-10T14:15:00Z',
    featured: false
  },
  {
    id: 'disc-8',
    title: 'Neon Palms 24/7 Arcade Playable Vintage "Degenatron" Cabinets',
    slug: 'neon-palms-arcade-playable-degenatron-cabinets',
    category: 'easter-egg',
    subcategory: 'Playable Mini-Game Easter Egg',
    locationName: 'Neon Palms Family Amusement Arcade',
    district: 'Little Haiti',
    coordinates: {
      lat: 25.811,
      lng: -80.198,
      inGameGrid: 'LH-14.3'
    },
    description: 'Inside the neon-drenched retro arcade in Little Haiti, two 1980s Degenatron arcade cabinets ("Defender of the Faith" and "Monkey\'s Paradise") are fully interactive and playable with working vector CRT filters and chiptune sound effects.',
    stepsToFind: [
      'Head to Little Haiti commercial strip corner of 54th St.',
      'Walk into Neon Palms Arcade (open 24 hours).',
      'Walk to the back row near the coin change machine; press action key at Cabinet #04 or #05.'
    ],
    inGameTime: '24/7 (Any time)',
    weather: 'Any weather',
    requirements: ['\$1 in-game quarter per play'],
    evidenceImages: [
      {
        url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
        caption: 'Rows of glowing neon cabinets inside the Little Haiti arcade.',
        type: 'screenshot'
      }
    ],
    source: {
      platform: 'x-twitter',
      url: 'https://twitter.com/ViceIntel/status/sample-degenatron',
      author: '@ViceIntel',
      timestamp: '2025-02-02T20:00:00Z'
    },
    verificationStatus: 'personally_verified',
    verificationReason: 'Verified by VicePulse staff auditor with in-game high score verification.',
    confirmationsCount: 112,
    confirmedBy: ['usr-1', 'usr-2', 'usr-3', 'retro_fan'],
    disputeCount: 0,
    disputes: [],
    tags: ['Little Haiti', 'Arcade', 'Degenatron', 'Minigame', 'Retro 80s'],
    submittedBy: {
      id: 'usr-3',
      username: 'ViceAdmin_K',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
    },
    createdAt: '2025-02-02T20:00:00Z',
    updatedAt: '2025-02-04T12:00:00Z',
    featured: false
  },
  {
    id: 'disc-9',
    title: 'The "Florida Man" Pet Gator Leash Incident on Ocean Drive',
    slug: 'florida-man-pet-gator-leash-ocean-drive',
    category: 'encounter',
    subcategory: 'World Satire / Random NPC Script',
    locationName: 'Lummus Park Boardwalk',
    district: 'Vice Beach',
    coordinates: {
      lat: 25.779,
      lng: -80.130,
      inGameGrid: 'VB-02.9'
    },
    description: 'A shirtless NPC wearing pink flamingo swim trunks walking a six-foot alligator on a neon pink leash. If tourists photograph him, he poses aggressively with a can of Pisswasser beer or threatens to toss the gator in a municipal fountain.',
    stepsToFind: [
      'Stroll down Lummus Park boardwalk during peak afternoon beach hours.',
      'Watch for a crowd of cell-phone recording pedestrians reacting in shock.',
      'Follow him down towards 8th Street crosswalk.'
    ],
    inGameTime: '13:00 - 17:00',
    weather: 'Sunny / Hot Beach Weather',
    requirements: ['None / Free World Event'],
    evidenceImages: [
      {
        url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
        caption: 'Bystanders crowding near palm trees on Ocean Drive boardwalk.',
        type: 'screenshot'
      }
    ],
    source: {
      platform: 'tiktok',
      url: 'https://tiktok.com/@leonidaman/video/sample-gator-walk',
      author: '@leonidaman',
      timestamp: '2025-01-29T15:20:00Z'
    },
    verificationStatus: 'community_verified',
    verificationReason: 'Over 90 community recordings submitted on TikTok and Reddit confirming recurring event.',
    confirmationsCount: 96,
    confirmedBy: ['usr-1', 'usr-2'],
    disputeCount: 0,
    disputes: [],
    tags: ['Vice Beach', 'Leonida Man', 'Alligator', 'Satire', 'Funny'],
    submittedBy: {
      id: 'usr-1',
      username: 'NeonTracker_99',
      role: 'investigator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    },
    createdAt: '2025-01-29T15:20:00Z',
    updatedAt: '2025-02-01T17:30:00Z',
    featured: false
  },
  {
    id: 'disc-10',
    title: 'Abandoned Cold War Nike-Hercules Missile Silo Bunkers',
    slug: 'cold-war-nike-hercules-missile-silo-bunkers',
    category: 'hidden-location',
    subcategory: 'Military Relic / Underground Facility',
    locationName: 'Leonard County Pine Flatwoods',
    district: 'Leonard County',
    coordinates: {
      lat: 25.921,
      lng: -80.450,
      inGameGrid: 'LC-62.1'
    },
    description: 'An overgrown 1960s surface-to-air missile installation hidden inside protected pine scrub. Concrete launch pads cracked with wild vegetation lead to a reinforced blast door that can be breached using shaped charges to access three underground bunker chambers.',
    stepsToFind: [
      'Follow the unpaved logging trail 2 miles west off State Road 41.',
      'Look for rusted perimeter signs warning of military federal jurisdiction.',
      'Descend the blast bunker ventilation shaft on the northern earthen mound.'
    ],
    inGameTime: 'Any time',
    weather: 'Any weather',
    requirements: ['High-explosive charge or acetylene torch', 'Flashlight / Tactical Weapon Light'],
    evidenceImages: [
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        caption: 'Overgrown concrete blast doors leading into the underground missile silos.',
        type: 'screenshot'
      }
    ],
    source: {
      platform: 'reddit',
      url: 'https://reddit.com/r/GTA6/comments/cold-war-bunker-found',
      author: 'u/BunkerBuster_9',
      timestamp: '2025-01-22T11:45:00Z'
    },
    verificationStatus: 'community_verified',
    verificationReason: 'Geolocated with satellite maps; bunker interior layout confirmed by multiple scouts.',
    confirmationsCount: 61,
    confirmedBy: ['usr-1', 'usr-3'],
    disputeCount: 1,
    disputes: [
      {
        id: 'disp-4',
        reason: 'Third chamber appears blocked by cave-in rubble; cannot reach missile bay without future mission progression.',
        reportedBy: 'usr-2',
        createdAt: '2025-01-25T14:10:00Z'
      }
    ],
    tags: ['Leonard County', 'Bunker', 'Military', 'Underground', 'Secret'],
    submittedBy: {
      id: 'usr-2',
      username: 'GatorWatch_Vic',
      role: 'scout',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
    },
    createdAt: '2025-01-22T11:45:00Z',
    updatedAt: '2025-01-26T19:00:00Z',
    featured: false
  },
  {
    id: 'disc-11',
    title: 'Secret Offshore Drug Submersible Docking Grotto',
    slug: 'secret-offshore-drug-submersible-grotto',
    category: 'hidden-location',
    subcategory: 'Hidden Smuggler Sea Cave',
    locationName: 'Waning Sands Sea Cliffs',
    district: 'Waning Sands',
    coordinates: {
      lat: 25.321,
      lng: -81.412,
      inGameGrid: 'WS-09.7'
    },
    description: 'A sea cavern accessible only via low tide or underwater swim. Inside lies a clandestine dry dock holding a customized fiberglass narco-submarine equipped with dual diesel-electric engines and communication scramblers.',
    stepsToFind: [
      'Wait for low tide (watch the tide gauge marker at Waning Sands Pier).',
      'Pilot a dinghy or jet ski under the jagged limestone arch at the western cape.',
      'Swim through the 15-meter submerged siphon tunnel into the hidden illuminated grotto.'
    ],
    inGameTime: '02:00 - 05:00 AM (guard shift change)',
    weather: 'Low Tide / Foggy',
    requirements: ['Underwater breather', 'Night vision or flare gun'],
    evidenceImages: [
      {
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
        caption: 'The semi-submersible hull docked inside the limestone cavern pool.',
        type: 'screenshot'
      }
    ],
    source: {
      platform: 'youtube',
      url: 'https://youtube.com/watch?v=sample-narco-grotto',
      author: 'BadgerGoodger_Leonida',
      timestamp: '2025-01-18T19:30:00Z'
    },
    verificationStatus: 'personally_verified',
    verificationReason: 'Verified on-stream by lead investigator with complete interior traversal.',
    confirmationsCount: 88,
    confirmedBy: ['usr-1', 'usr-2', 'usr-3'],
    disputeCount: 0,
    disputes: [],
    tags: ['Waning Sands', 'Sea Cave', 'Submersible', 'Smuggler', 'Loot'],
    submittedBy: {
      id: 'usr-3',
      username: 'ViceAdmin_K',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
    },
    createdAt: '2025-01-18T19:30:00Z',
    updatedAt: '2025-01-20T10:15:00Z',
    featured: false
  },
  {
    id: 'disc-12',
    title: 'Unmarked Highway Patrol Interceptor Unlocked Behind Hamlet Station',
    slug: 'unmarked-highway-patrol-interceptor-hamlet',
    category: 'rare-vehicle',
    subcategory: 'Police Interceptor',
    locationName: 'Leonida Highway Patrol Substation 4',
    district: 'Hamlet',
    coordinates: {
      lat: 25.689,
      lng: -80.521,
      inGameGrid: 'HM-55.2'
    },
    description: 'An all-black Bravado Buffalo STX Interceptor with stealth low-profile emergency lightbars inside the windshield and front grill. Key is left on the center console; equipped with police radio scanner receiver.',
    stepsToFind: [
      'Circle behind the Hamlet rural substation through the impound lot gravel road.',
      'Wait for the shift sergeant to enter the administrative trailer.',
      'Open the driver door of the middle black cruiser parked beneath the metal carport.'
    ],
    inGameTime: '12:00 - 13:00 (Lunch shift change)',
    weather: 'Any weather',
    requirements: ['High stealth / crouch walk to avoid security camera detection'],
    evidenceImages: [
      {
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
        caption: 'Blacked-out police interceptor parked in substation carport.',
        type: 'screenshot'
      }
    ],
    source: {
      platform: 'discord',
      url: 'https://discord.gg/vice-scouts/msg-9921',
      author: 'SpeedTrap#1337',
      timestamp: '2025-01-15T13:40:00Z'
    },
    verificationStatus: 'unverified',
    verificationReason: 'Awaiting second scout confirmation; some players report car locked with alarm active.',
    confirmationsCount: 14,
    confirmedBy: ['scout_red'],
    disputeCount: 4,
    disputes: [
      {
        id: 'disp-5',
        reason: 'Alarm triggered immediately on approach during evening hours; timing must be strictly lunch break.',
        reportedBy: 'usr-1',
        createdAt: '2025-01-17T15:20:00Z'
      }
    ],
    tags: ['Hamlet', 'Police', 'Buffalo STX', 'Interceptor', 'Fast Car'],
    submittedBy: {
      id: 'usr-1',
      username: 'NeonTracker_99',
      role: 'investigator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    },
    createdAt: '2025-01-15T13:40:00Z',
    updatedAt: '2025-01-17T18:00:00Z',
    featured: false
  },
  {
    id: 'disc-13',
    title: 'Albino Bull Gator Breeding Den & Mangrove Nest',
    slug: 'albino-bull-gator-breeding-den',
    category: 'wildlife',
    subcategory: 'Legendary Fauna / Apex Predator',
    locationName: 'Grassrivers Mangrove Basin',
    district: 'Grassrivers',
    coordinates: {
      lat: 25.680,
      lng: -80.360,
      inGameGrid: 'GR-18.4'
    },
    inGameCoordinates: {
      x: -1617.3,
      y: -860.0
    },
    coordinateProvenance: {
      system: 'gtadb_v6',
      originalCoords: [-1617.3, -860.0],
      source: 'VicePulse Field Scout Video Corroboration'
    },
    description: 'A 15-foot albino bull alligator fiercely defending an isolated mangrove hammock nest. Highly aggressive behavior trigger when approaching within 20 meters. Unique ivory scales and red iris markings.',
    stepsToFind: [
      'Navigate by airboat into the dense interior mangrove maze west of Gator Gulch.',
      'Cut engine near the submerged cypress stump cluster marked with white egret roosts.',
      'Listen for the deep sub-bass territorial rumble in the water.'
    ],
    inGameTime: 'Dawn & Dusk (05:30 - 07:00 / 18:30 - 20:00)',
    weather: 'Humid Fog / Light Drizzle',
    requirements: ['Airboat', 'High-powered tranquilizer or hunting rifle'],
    evidenceImages: [
      {
        url: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?auto=format&fit=crop&w=1200&q=80',
        caption: 'Massive white alligator lurking in murky mangrove backwaters.',
        type: 'screenshot'
      }
    ],
    source: {
      platform: 'youtube',
      url: 'https://youtube.com/watch?v=sample-albino-gator-gta6',
      author: 'SwampScout_Leonida',
      timestamp: '2025-02-14T08:15:00Z'
    },
    verificationStatus: 'community_verified',
    verificationReason: 'Verified by 28 scout captures; consistent spawn in Grassrivers dawn hours.',
    confirmationsCount: 42,
    confirmedBy: ['usr-1', 'usr-2'],
    disputeCount: 0,
    disputes: [],
    tags: ['Wildlife', 'Alligator', 'Albino', 'Grassrivers', 'Apex Predator'],
    submittedBy: {
      id: 'usr-2',
      username: 'GatorWatch_Vic',
      role: 'scout',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
    },
    createdAt: '2025-02-14T08:15:00Z',
    updatedAt: '2025-02-15T12:00:00Z',
    featured: true
  },
  {
    id: 'disc-14',
    title: 'Roseate Spoonbill & Flamingo Coral Atoll',
    slug: 'roseate-spoonbill-coral-atoll',
    category: 'wildlife',
    subcategory: 'Migratory Avian Colony',
    locationName: 'Key Chicas Southern Flats',
    district: 'The Keys',
    coordinates: {
      lat: 25.510,
      lng: -80.270,
      inGameGrid: 'KC-03.9'
    },
    inGameCoordinates: {
      x: -751.9,
      y: -2649.5
    },
    coordinateProvenance: {
      system: 'gtadb_v6',
      originalCoords: [-751.9, -2649.5],
      source: 'Trailer 1 Wildlife Analysis'
    },
    description: 'Flocks of dozens of vibrant pink roseate spoonbills and Caribbean flamingos feeding in crystal shallow shoals. Disperses into the sky when boats produce loud acoustic wakes.',
    stepsToFind: [
      'Take a shallow-draft skiff or jet ski to the sand spit 1.2km south of Bonefish Cay.',
      'Approach under low throttle to avoid startling the flock before photographic capture.'
    ],
    inGameTime: '10:00 - 15:00 (High daylight)',
    weather: 'Clear / Low Tide',
    requirements: ['Binoculars or high-magnification telephoto camera'],
    evidenceImages: [
      {
        url: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&fit=crop&w=1200&q=80',
        caption: 'Pink flamingo and spoonbill flock across shallow Key Chicas sandbars.',
        type: 'screenshot'
      }
    ],
    source: {
      platform: 'reddit',
      url: 'https://reddit.com/r/GTA6/comments/sample-flamingo-flock',
      author: 'u/AvianAuditor_Vic',
      timestamp: '2025-02-16T11:20:00Z'
    },
    verificationStatus: 'personally_verified',
    verificationReason: 'Permanent ecological spawn location corroborating Trailer 1 beach flight shot.',
    confirmationsCount: 51,
    confirmedBy: ['usr-1', 'usr-3'],
    disputeCount: 0,
    disputes: [],
    tags: ['Wildlife', 'Flamingo', 'Birds', 'Key Chicas', 'Photomode'],
    submittedBy: {
      id: 'usr-1',
      username: 'NeonTracker_99',
      role: 'investigator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    },
    createdAt: '2025-02-16T11:20:00Z',
    updatedAt: '2025-02-17T09:30:00Z',
    featured: false
  }
];

export const mockRareVehicles: RareVehicle[] = [
  {
    id: 'veh-1',
    name: 'Bravado Banshee GTS Retro',
    modelName: 'Banshee GTS Spec-R',
    vehicleClass: 'sports',
    description: 'Iconic copper-orange sports coupe tuned for high-speed runs down Vice Beach strip. Equipped with high-output twin-turbo V10 and retro alloy rims.',
    reportedLocation: 'Port Gellhorn Freight Depot Row 7',
    district: 'Port Gellhorn',
    coordinates: { lat: 25.421, lng: -81.231, inGameGrid: 'PG-12.8' },
    spawnConditions: {
      time: '01:00 - 03:30 AM',
      weather: 'Light Rain / Overcast',
      storyProgression: 'Available from early chapter'
    },
    evidenceImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    verificationStatus: 'personally_verified',
    confirmationsCount: 68,
    rarity: 'Legendary',
    speedRating: 94,
    accelerationRating: 90
  },
  {
    id: 'veh-2',
    name: 'Grotti Cheetah Classic 1988',
    modelName: 'Cheetah Classic Berlinetta',
    vehicleClass: 'classic',
    description: 'The definitive 1980s Miami supercar. White wedge styling, straked door air intakes, pop-up lights and screaming high-revving flat-12 engine.',
    reportedLocation: 'The Marquee Condominiums Garage B2',
    district: 'Vice Beach',
    coordinates: { lat: 25.795, lng: -80.128, inGameGrid: 'VB-07.4' },
    spawnConditions: {
      time: '18:00 - 22:00',
      weather: 'Sunset / Clear',
      storyProgression: 'Respawns every 4 in-game days'
    },
    evidenceImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80',
    verificationStatus: 'community_verified',
    confirmationsCount: 73,
    rarity: 'Legendary',
    speedRating: 88,
    accelerationRating: 86
  },
  {
    id: 'veh-3',
    name: 'Pegassi Torero XO Veloce',
    modelName: 'Torero XO Hypercar',
    vehicleClass: 'super',
    description: 'Cutting-edge hypercar spotted parked on private helipad driveway of Starfish Island mansion. Scissors doors and carbon aerodynamic wings.',
    reportedLocation: 'Starfish Island West Villa #12',
    district: 'Vice City Mainland',
    coordinates: { lat: 25.771, lng: -80.162, inGameGrid: 'SI-04.1' },
    spawnConditions: {
      time: '14:00 - 18:00 on Weekends',
      weather: 'Clear Blue Skies',
      storyProgression: 'Mid-to-late story progression'
    },
    evidenceImage: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1000&q=80',
    verificationStatus: 'community_verified',
    confirmationsCount: 54,
    rarity: 'Rare',
    speedRating: 98,
    accelerationRating: 96
  },
  {
    id: 'veh-4',
    name: 'Vapid Sandstorm 6x6 Swamp Monster',
    modelName: 'Sandstorm Heavy Duty 6x6',
    vehicleClass: 'offroad',
    description: 'Massive lifted six-wheel all-terrain truck equipped with snorkel exhaust, double recovery winches, and massive 44-inch mud tires for conquering Grassrivers bogs.',
    reportedLocation: 'Ambrosia Mud Rally Grounds',
    district: 'Ambrosia',
    coordinates: { lat: 25.845, lng: -80.890, inGameGrid: 'AM-77.9' },
    spawnConditions: {
      time: '20:00 - 02:00 AM',
      weather: 'Heavy Thunderstorm / Muddy',
      storyProgression: 'Win Ambrosia Swamp Bog Challenge'
    },
    evidenceImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
    verificationStatus: 'community_verified',
    confirmationsCount: 41,
    rarity: 'Rare',
    speedRating: 65,
    accelerationRating: 82
  },
  {
    id: 'veh-5',
    name: 'Shitzu Jetmax 38 Offshore Cigarette Boat',
    modelName: 'Jetmax 38 Twin V8',
    vehicleClass: 'watercraft',
    description: 'Dual high-output marinized big block V8 speedboat in hot pink and ocean teal racing livery. Capable of outrunning Coast Guard patrol cutters.',
    reportedLocation: 'Vice Beach North Marina Slip 14',
    district: 'Vice Beach',
    coordinates: { lat: 25.808, lng: -80.125, inGameGrid: 'VB-91.0' },
    spawnConditions: {
      time: '11:00 - 15:00',
      weather: 'Calm Water / High Sun',
      storyProgression: 'Available after unlocking boat slips'
    },
    evidenceImage: '/images/vehicles/jetmax.webp',
    verificationStatus: 'personally_verified',
    confirmationsCount: 62,
    rarity: 'Rare',
    speedRating: 92,
    accelerationRating: 88
  },
  {
    id: 'veh-6',
    name: 'Mammoth Dodo Seaplane (Smuggler Spec)',
    modelName: 'Dodo Amphibian Floatplane',
    vehicleClass: 'aircraft',
    description: 'Faded matte olive green single-engine amphibian aircraft moored on a hidden canal dock in the Keys. Cargo cabin stripped for maximum payload.',
    reportedLocation: 'Key Chicas Hidden Lagoon Dock',
    district: 'The Keys',
    coordinates: { lat: 24.570, lng: -81.760, inGameGrid: 'KC-15.3' },
    spawnConditions: {
      time: '05:30 - 07:00 AM (Sunrise)',
      weather: 'Morning Mist / Fog',
      storyProgression: 'Any time with pilot license qualification'
    },
    evidenceImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80',
    verificationStatus: 'community_verified',
    confirmationsCount: 49,
    rarity: 'Secret',
    speedRating: 72,
    accelerationRating: 70
  }
];

export const mockSources: SourceRecord[] = [
  {
    id: 'src-1',
    originalUrl: 'https://reddit.com/r/GTA6/comments/sample-smuggler-plane',
    platform: 'reddit',
    author: 'u/LeonidaScubaScout',
    contentTitle: 'Found a submerged twin-engine plane in Key Chicas matching trailer 1 flightpath',
    dateDiscovered: '2025-02-18T14:32:00Z',
    datePublished: '2025-02-18T14:00:00Z',
    extractedDiscoveries: ['disc-1'],
    status: 'published',
    reliabilityNotes: 'High quality in-game coordinates and multiple angles provided. Subreddit verified.',
    reliabilityScore: 5
  },
  {
    id: 'src-2',
    originalUrl: 'https://youtube.com/watch?v=sample-banshee-depot',
    platform: 'youtube',
    author: 'ViceRacer_TV',
    contentTitle: 'GTA VI - SECRET BANSHEE GTS SPAWN LOCATION IN PORT GELLHORN!',
    dateDiscovered: '2025-02-15T22:15:00Z',
    datePublished: '2025-02-15T21:30:00Z',
    extractedDiscoveries: ['disc-2'],
    status: 'published',
    reliabilityNotes: 'Video shows clear timestamped route and entrance technique. Fully reproducible.',
    reliabilityScore: 5
  },
  {
    id: 'src-3',
    originalUrl: 'https://tiktok.com/@vicecitysecrets/video/sample-scarface-room',
    platform: 'tiktok',
    author: '@vicecitysecrets',
    contentTitle: 'Rockstar put the Scarface chainsaw room in Vice Beach!',
    dateDiscovered: '2025-02-10T19:00:00Z',
    datePublished: '2025-02-10T18:40:00Z',
    extractedDiscoveries: ['disc-3'],
    status: 'published',
    reliabilityNotes: 'Short clip with landmark confirmation. Corroborated with Vice Beach exterior facade.',
    reliabilityScore: 4
  },
  {
    id: 'src-4',
    originalUrl: 'https://discord.gg/leonida-mappers/msg-7729',
    platform: 'discord',
    author: 'MudDawg#4040',
    contentTitle: 'Airboat night races event triggers at Gator Gulch on weekend cycles',
    dateDiscovered: '2025-02-14T03:22:00Z',
    datePublished: '2025-02-14T03:00:00Z',
    extractedDiscoveries: ['disc-4'],
    status: 'needs_review',
    reliabilityNotes: 'Requires further testing regarding exact day-of-week clock schedule.',
    reliabilityScore: 3
  },
  {
    id: 'src-5',
    originalUrl: 'https://reddit.com/r/GTA6/comments/ambrosia-skunk-ape-audio',
    platform: 'reddit',
    author: 'u/SwampCryptidHunter',
    contentTitle: 'Unexplained audio files and roar triggers recorded at abandoned sugar mill in Ambrosia',
    dateDiscovered: '2025-02-11T05:00:00Z',
    datePublished: '2025-02-11T04:20:00Z',
    extractedDiscoveries: ['disc-5'],
    status: 'processing',
    reliabilityNotes: 'Audio spectra matches swamp wildlife frequency, investigating if unique NPC model spawns.',
    reliabilityScore: 3
  },
  {
    id: 'src-6',
    originalUrl: 'https://kotaku.com/sample-gta-6-yacht-infiltration',
    platform: 'gaming-press',
    author: 'J. Rodriguez',
    contentTitle: 'We Snuck Aboard The Delphine: GTA 6’s Most Exclusive Mega-Yacht',
    dateDiscovered: '2025-02-08T18:45:00Z',
    datePublished: '2025-02-08T17:00:00Z',
    extractedDiscoveries: ['disc-6'],
    status: 'published',
    reliabilityNotes: 'Press review build preview with complete photographic coverage.',
    reliabilityScore: 5
  },
  {
    id: 'src-7',
    originalUrl: 'https://instagram.com/p/sample-miami-alligator',
    platform: 'instagram',
    author: '@vice_pulse_leaks',
    contentTitle: 'Wild clip of Florida man walking alligator down Lummus Park boardwalk',
    dateDiscovered: '2025-01-30T10:00:00Z',
    datePublished: '2025-01-29T23:00:00Z',
    extractedDiscoveries: ['disc-9'],
    status: 'published',
    reliabilityNotes: 'Authentic NPC behavior clip, confirmed in general population.',
    reliabilityScore: 4
  },
  {
    id: 'src-8',
    originalUrl: 'https://reddit.com/r/GTA6/comments/fake-aliens-pyramid',
    platform: 'reddit',
    author: 'u/ClickbaitDan',
    contentTitle: 'SECRET ALIEN PYRAMID FOUND IN GRASSRIVERS (PROOF!!)',
    dateDiscovered: '2025-02-16T12:00:00Z',
    datePublished: '2025-02-16T11:00:00Z',
    extractedDiscoveries: [],
    status: 'rejected',
    reliabilityNotes: 'Debunked: Modded GTA V map asset swap pasted onto fake Vice City radar HUD.',
    reliabilityScore: 1
  }
];

export const mockComments: Comment[] = [
  {
    id: 'com-1',
    discoveryId: 'disc-1',
    username: 'GatorWatch_Vic',
    userRole: 'scout',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    content: 'Confirmed this location at 11:30 AM in-game. Water visibility was pristine. Note that hammerhead sharks occasionally circle 50m east of the tail fin.',
    createdAt: '2025-02-18T18:22:00Z',
    isFieldScoutNote: true
  },
  {
    id: 'com-2',
    discoveryId: 'disc-1',
    username: 'ViceAdmin_K',
    userRole: 'admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    content: 'Audited coordinates and verified against satellite reef telemetry. Status upgraded to Community Verified.',
    createdAt: '2025-02-19T09:15:00Z',
    isFieldScoutNote: false
  },
  {
    id: 'com-3',
    discoveryId: 'disc-2',
    username: 'NeonTracker_99',
    userRole: 'investigator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    content: 'Make sure you bring bolt cutters. If you shoot the lock off with an unsuppressed weapon, two Port Gellhorn police cruisers spawn within 15 seconds.',
    createdAt: '2025-02-16T04:10:00Z',
    isFieldScoutNote: true
  },
  {
    id: 'com-4',
    discoveryId: 'disc-3',
    username: 'RetroGamer_86',
    userRole: 'scout',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
    content: 'Such an incredible homage to Apartment 3c from 2002! The Hawaiian shirt hanging on the door is identical to Tommy Vercetti’s.',
    createdAt: '2025-02-11T14:45:00Z',
    isFieldScoutNote: false
  }
];
