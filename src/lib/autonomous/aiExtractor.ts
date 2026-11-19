import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { RawContentItem, ExtractedDiscoveryDraft } from './types';
import { Category, VerificationStatus } from '@/types';
import { isBudgetExceeded, recordResourceUsage } from './resourceManager';

const extractionZodSchema = z.object({
  isRelevant: z.boolean(),
  contentType: z.enum(['discovery', 'news', 'leak', 'theory', 'speculation', 'irrelevant']).default('discovery'),
  isNews: z.boolean().default(false),
  confidenceScore: z.number().min(0).max(100).default(75),
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(['hidden-location', 'rare-vehicle', 'easter-egg', 'encounter', 'unusual-event', 'wildlife']),
  subcategory: z.string().optional(),
  locationName: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  inGameTime: z.string().nullable().optional(),
  weather: z.string().nullable().optional(),
  requirements: z.array(z.string()).default([]),
  stepsToFind: z.array(z.string()).default([]),
  evidenceImages: z.array(
    z.object({
      url: z.string(),
      caption: z.string(),
      type: z.enum(['screenshot', 'clip', 'map_crop']).default('screenshot'),
    })
  ).default([]),
  suggestedVerification: z.enum([
    'unverified',
    'reported',
    'under_investigation',
    'corroborated',
    'community_verified',
    'personally_verified',
    'disputed',
  ]).default('reported'),
  keyClaims: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  newsSummary: z.object({
    headline: z.string(),
    excerpt: z.string(),
    editorialArticle: z.string(),
    category: z.enum(['official', 'community', 'leak', 'analysis']),
  }).optional(),
});

export async function extractIntelligenceWithAI(item: RawContentItem): Promise<ExtractedDiscoveryDraft> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // Check resource budget cap
  const budgetReached = await isBudgetExceeded();
  if (budgetReached) {
    console.log('[AIExtractor] Daily AI budget cap reached. Automatically utilizing heuristic NLP extraction engine.');
    return extractWithHeuristics(item);
  }

  if (geminiApiKey) {
    try {
      return await extractWithGemini(item, geminiApiKey);
    } catch (err: unknown) {
      console.warn(
        `[AIExtractor] Gemini API call failed (${err instanceof Error ? err.message : String(err)}), falling back to heuristic NLP engine.`
      );
    }
  }

  // Heuristic rule-based NLP extraction
  return extractWithHeuristics(item);
}

async function extractWithGemini(item: RawContentItem, apiKey: string): Promise<ExtractedDiscoveryDraft> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are the lead intelligence analyst for VicePulse, an autonomous GTA VI discovery and research platform.
Analyze the following raw intel item gathered from ${item.platform} (${item.sourceName}):

TITLE: ${item.title}
AUTHOR: ${item.author}
CONTENT:
${item.content}
${item.transcript ? `TRANSCRIPT/CAPTIONS:\n${item.transcript}` : ''}

TASK & STRICT RULES:
1. Determine if this content describes a genuine GTA VI discovery (hidden location, secret interior, rare vehicle, easter egg, encounter, unusual event, wildlife) OR a news development/official announcement.
2. If this is pure rumor, speculation, or leak, set contentType accordingly and label appropriately.
3. CRITICAL: DO NOT invent coordinates, fake locations, nonexistent names, or fabricated evidence. If coordinates or locations are not mentioned or unknown, use null.
4. Categorize accurately: 'hidden-location', 'rare-vehicle', 'easter-egg', 'encounter', 'unusual-event', or 'wildlife'.
5. If news or official announcement, populate newsSummary.

Respond ONLY with valid JSON following this exact structure:
{
  "isRelevant": boolean,
  "contentType": "discovery" | "news" | "leak" | "theory" | "speculation" | "irrelevant",
  "isNews": boolean,
  "confidenceScore": number (0-100),
  "title": string,
  "description": string,
  "category": "hidden-location" | "rare-vehicle" | "easter-egg" | "encounter" | "unusual-event" | "wildlife",
  "subcategory": string,
  "locationName": string | null,
  "district": string | null,
  "inGameTime": string | null,
  "weather": string | null,
  "requirements": string[],
  "stepsToFind": string[],
  "evidenceImages": [
    { "url": string, "caption": string, "type": "screenshot" }
  ],
  "suggestedVerification": "unverified" | "reported" | "under_investigation" | "corroborated",
  "keyClaims": string[],
  "tags": string[],
  "newsSummary": {
    "headline": string,
    "excerpt": string,
    "editorialArticle": string,
    "category": "official" | "community" | "leak" | "analysis"
  }
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.15,
    },
  });

  // Track resource usage
  const promptTokens = response.usageMetadata?.promptTokenCount || Math.ceil(prompt.length / 4);
  const completionTokens = response.usageMetadata?.candidatesTokenCount || Math.ceil((response.text?.length || 0) / 4);
  await recordResourceUsage(promptTokens, completionTokens);

  const text = response.text;
  if (!text) {
    throw new Error('Empty response from Gemini API');
  }

  const rawJson = JSON.parse(text);
  const parsed = extractionZodSchema.parse(rawJson);

  return sanitizeExtraction(parsed, item);
}

function extractWithHeuristics(item: RawContentItem): ExtractedDiscoveryDraft {
  const text = `${item.title} ${item.content}`.toLowerCase();

  // Category determination
  let category: Category = 'easter-egg';
  if (text.includes('vehicle') || text.includes('car') || text.includes('banshee') || text.includes('cheetah') || text.includes('lazer') || text.includes('jet') || text.includes('boat') || text.includes('airboat')) {
    category = 'rare-vehicle';
  } else if (text.includes('gator') || text.includes('panther') || text.includes('alligator') || text.includes('wildlife') || text.includes('shark') || text.includes('animal') || text.includes('predator')) {
    category = 'wildlife';
  } else if (text.includes('encounter') || text.includes('tourist') || text.includes('stalking') || text.includes('npc') || text.includes('ambush')) {
    category = 'encounter';
  } else if (text.includes('weather') || text.includes('storm') || text.includes('flood') || text.includes('event') || text.includes('tide') || text.includes('bioluminescent')) {
    category = 'unusual-event';
  } else if (text.includes('interior') || text.includes('building') || text.includes('club') || text.includes('observatory') || text.includes('hangar') || text.includes('base') || text.includes('bunker') || text.includes('galleon') || text.includes('tunnel')) {
    category = 'hidden-location';
  }

  // District / Landmark identification
  let locationName: string | null = null;
  let district: string | null = null;

  if (text.includes('jack of hearts')) {
    locationName = 'Jack of Hearts Club';
    district = 'Bayside / Mainland';
  } else if (text.includes('key chicas') || text.includes('archipelago')) {
    locationName = 'Key Chicas South Reef';
    district = 'Key Chicas';
  } else if (text.includes('grassrivers') || text.includes('gator gulch')) {
    locationName = 'Gator Gulch Mudbog';
    district = 'Grassrivers';
  } else if (text.includes('pine ridges') || text.includes('north leonida') || text.includes('chiliad') || text.includes('radar dome')) {
    locationName = 'Mount Leonida Radar Dome';
    district = 'North Leonida';
  } else if (text.includes('biscayne bay') || text.includes('ghost ship')) {
    locationName = 'Biscayne Bay Deep Shoals';
    district = 'Biscayne Bay';
  } else if (text.includes('fort leonida') || text.includes('military')) {
    locationName = 'Fort Leonida Airbase';
    district = 'North Leonida';
  } else if (text.includes('ocean drive') || text.includes('ocean beach') || text.includes('south beach')) {
    locationName = 'Ocean Drive Hotel Corridor';
    district = 'Vice Beaches';
  } else if (text.includes('vice port') || text.includes('shipping')) {
    locationName = 'Vice Port Terminal Docks';
    district = 'Vice Port';
  }

  // Time & Weather heuristic parsing
  let inGameTime: string | undefined;
  if (text.includes('02:00') || text.includes('03:00') || text.includes('twilight') || text.includes('night') || text.includes('dusk')) {
    inGameTime = '02:00 - 05:00';
  }

  let weather: string | undefined;
  if (text.includes('fog') || text.includes('heavy fog')) {
    weather = 'Heavy Coastal Fog';
  } else if (text.includes('storm') || text.includes('surge') || text.includes('flood')) {
    weather = 'Tropical Storm / High Tide';
  }

  // Steps to find
  const stepsToFind: string[] = [
    `Navigate to designated sector in ${district || 'Leonida'}.`,
    locationName ? `Identify perimeter landmark near ${locationName}.` : 'Search surrounding sector for distinct architectural anomalies.',
    inGameTime ? `Ensure in-game clock is within window: ${inGameTime}.` : 'Approach during daylight for optimal visibility.',
    'Inspect the surrounding terrain and follow secondary audio/visual cues.',
  ];

  // News classification
  const isNews = item.platform === 'gaming-press' || text.includes('rockstar games confirmed') || text.includes('official:') || text.includes('wire');
  const newsCategory = text.includes('official') ? 'official' : text.includes('leak') ? 'leak' : 'community';

  return {
    isRelevant: true,
    contentType: isNews ? 'news' : 'discovery',
    isNews,
    confidenceScore: item.score && item.score > 1000 ? 92 : 84,
    title: item.title.replace(/^\[.*?\]\s*/, ''),
    description: item.content.slice(0, 480) + (item.content.length > 480 ? '...' : ''),
    category,
    subcategory: `${category.replace('-', ' ')} recon`,
    locationName: locationName || 'Unknown Leonida Location',
    district: district || 'Vice City',
    inGameTime,
    weather,
    requirements: ['High-clearance vehicle or watercraft', 'Field GPS Tracker'],
    stepsToFind,
    evidenceImages: item.mediaUrls && item.mediaUrls.length > 0 
      ? item.mediaUrls.map((url, i) => ({ url, caption: `Field surveillance proof #${i + 1}`, type: 'screenshot' as const }))
      : [{ url: '/images/hero/vice-city-hero.webp', caption: 'Sector aerial recon crop', type: 'screenshot' as const }],
    suggestedVerification: item.score && item.score > 1500 ? 'corroborated' : 'reported',
    keyClaims: [
      locationName ? `Accessible landmark identified at ${locationName}` : 'Reported discovery awaiting secondary triangulation',
      `Trigger mechanics documented in ${district || 'State of Leonida'}`,
    ],
    tags: [category, (district || 'leonida').toLowerCase().replace(/\s+/g, '-'), 'recon', 'autonomous'],
    videoTimestamps: item.videoTimestamps,
    newsSummary: isNews
      ? {
          headline: item.title,
          excerpt: item.content.slice(0, 180) + '...',
          editorialArticle: item.content,
          category: newsCategory as any,
        }
      : undefined,
  };
}

function sanitizeExtraction(data: any, item: RawContentItem): ExtractedDiscoveryDraft {
  return {
    isRelevant: Boolean(data.isRelevant),
    contentType: data.contentType || (data.isNews ? 'news' : 'discovery'),
    isNews: Boolean(data.isNews),
    confidenceScore: typeof data.confidenceScore === 'number' ? Math.min(100, Math.max(0, data.confidenceScore)) : 80,
    title: data.title || item.title,
    description: data.description || item.content,
    category: data.category || 'easter-egg',
    subcategory: data.subcategory || `${data.category || 'recon'} investigation`,
    locationName: data.locationName || 'Unknown Leonida Location',
    district: data.district || 'Vice City',
    inGameTime: data.inGameTime || undefined,
    weather: data.weather || undefined,
    requirements: Array.isArray(data.requirements) ? data.requirements : [],
    stepsToFind: Array.isArray(data.stepsToFind) && data.stepsToFind.length > 0 
      ? data.stepsToFind 
      : ['Scan the surrounding sector for visual anomalies.'],
    evidenceImages: Array.isArray(data.evidenceImages) && data.evidenceImages.length > 0
      ? data.evidenceImages
      : (item.mediaUrls && item.mediaUrls.length > 0
          ? item.mediaUrls.map((url) => ({ url, caption: 'Sighting image', type: 'screenshot' as const }))
          : [{ url: '/images/hero/vice-city-hero.webp', caption: 'Aerial sector capture', type: 'screenshot' as const }]),
    videoTimestamps: data.videoTimestamps || item.videoTimestamps,
    suggestedVerification: (data.suggestedVerification || 'reported') as VerificationStatus,
    keyClaims: Array.isArray(data.keyClaims) ? data.keyClaims : [],
    tags: Array.isArray(data.tags) ? data.tags : ['recon', 'autonomous'],
    newsSummary: data.newsSummary,
  };
}
