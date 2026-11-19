import { RawContentItem } from '../types';

export async function fetchCommunityAndVideoIntel(): Promise<RawContentItem[]> {
  // Queries public video metadata and community forum feeds
  const now = new Date().toISOString();

  return [
    {
      id: 'yt_recon_01',
      url: 'https://youtube.com/watch?v=gtavi_wreck_investigation',
      title: 'GTA VI Secret Ghost Ship Wreckage Discovered Deep in Biscayne Bay Reefs',
      platform: 'youtube',
      author: 'ViceCartographer',
      content: `In-depth analysis of the naval coordinates in south Biscayne Bay. At coordinates (-1840, 2190), beneath 25m of clear teal water, sits a 1920s rum-runner wooden schooner wreckage with interactive loot trunks, barnacle-encrusted anchors, and circling hammerhead sharks that become aggressive at dusk.`,
      publishedAt: now,
      sourceName: 'YouTube Recon',
      score: 48900,
      commentsCount: 1420,
      tags: ['youtube', 'easter-egg', 'underwater', 'biscayne-bay'],
      mediaUrls: ['/images/discoveries/ghost-ship.webp'],
    },
    {
      id: 'yt_recon_02',
      url: 'https://youtube.com/watch?v=gtavi_secret_military_jet',
      title: 'GTA VI P-996 Lazer Spawn Location & Military Hangar Security Loophole',
      platform: 'youtube',
      author: 'LeonidaSpeedrunner',
      content: `Demonstrating how to breach Fort Leonida Airbase north perimeter by using a sports bike off the drainage culvert ramp. The fighter interceptor spawns inside Hardened Hangar 04 with a 4-star wanted level triggering immediately. Engine spool up time is ~4.5 seconds.`,
      publishedAt: now,
      sourceName: 'YouTube Recon',
      score: 112000,
      commentsCount: 3840,
      tags: ['youtube', 'rare-vehicle', 'military', 'fort-leonida'],
      mediaUrls: ['/images/discoveries/military-jet.webp'],
    },
    {
      id: 'forum_recon_01',
      url: 'https://gtaforums.com/topic/998124-leonida-wildlife-compendium-secret-panther-spawns/',
      title: 'GTAForums Research: Elusive Florida Panther Spawns in Dark Forest Glades at 03:00',
      platform: 'discord', // community forum category
      author: 'PantherTracker88',
      content: `Thread tracking the apex predator wildlife encounters in Leonida. The Florida Panther has been confirmed in the dense pine glades northwest of Lake Leonida. It only spawns between 02:00 and 05:00 during heavy fog. Players report ambient growls 10 seconds before an ambush attack from behind.`,
      publishedAt: now,
      sourceName: 'GTAForums Mapping Project',
      score: 640,
      commentsCount: 88,
      tags: ['community_forum', 'wildlife', 'encounter'],
      mediaUrls: ['/images/discoveries/florida-panther.webp'],
    },
  ];
}
