import connectDB from '@/lib/mongodb';
import ResearchQuery from '@/models/ResearchQuery';
import { Category } from '@/types';
import { GoogleGenAI } from '@google/genai';

interface GeneratedQueryCandidate {
  query: string;
  category: Category | 'all';
  priority: 'high' | 'normal' | 'low';
}

export async function expandResearchQueriesFromDiscovery(
  discoveryTitle: string,
  category: Category,
  locationOrDistrict?: string
): Promise<string[]> {
  await connectDB();

  const geminiApiKey = process.env.GEMINI_API_KEY;
  let candidates: GeneratedQueryCandidate[] = [];

  if (geminiApiKey) {
    try {
      candidates = await generateWithGemini(discoveryTitle, category, locationOrDistrict, geminiApiKey);
    } catch (err) {
      console.warn('[QueryGenerator] Gemini expansion failed, using NLP expansion engine:', err);
    }
  }

  if (candidates.length === 0) {
    candidates = generateWithHeuristics(discoveryTitle, category, locationOrDistrict);
  }

  const savedQueries: string[] = [];

  for (const item of candidates) {
    const normalized = item.query.trim().replace(/\s+/g, ' ');
    if (normalized.length < 5) continue;

    try {
      // Upsert without duplicate conflict
      const doc = await ResearchQuery.findOneAndUpdate(
        { query: { $regex: new RegExp(`^${escapeRegex(normalized)}$`, 'i') } },
        {
          $setOnInsert: {
            query: normalized,
            category: item.category,
            origin: 'ai_generated',
            createdFrom: discoveryTitle,
            priority: item.priority,
            frequencyHours: item.priority === 'high' ? 3 : 6,
            enabled: true,
            relevanceScore: 90,
            itemsFoundCount: 0,
          },
        },
        { upsert: true, new: true }
      );
      if (doc) {
        savedQueries.push(doc.query);
      }
    } catch {
      // Duplicate ignore
    }
  }

  return savedQueries;
}

async function generateWithGemini(
  discoveryTitle: string,
  category: Category,
  locationOrDistrict: string | undefined,
  apiKey: string
): Promise<GeneratedQueryCandidate[]> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are the lead intelligence researcher for VicePulse, tracking GTA VI game discoveries.
A new player discovery has just been identified:
TITLE: "${discoveryTitle}"
CATEGORY: "${category}"
DISTRICT: "${locationOrDistrict || 'Leonida'}"

Generate 4 to 6 specific, natural search query variations that will uncover corroborating videos, forum threads, or player clips on YouTube and Reddit.
Focus on:
1. Specific location names, vehicle models, or secret interiors mentioned
2. Search terms players would use when uploading clips
3. Variations between "GTA 6" and "GTA VI"

Respond ONLY with valid JSON array:
[
  { "query": string, "category": "${category}", "priority": "high" | "normal" }
]`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const text = response.text?.trim() || '[]';
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) {
    return parsed.map((p: any) => ({
      query: String(p.query),
      category,
      priority: p.priority === 'high' ? 'high' : 'normal',
    }));
  }

  return [];
}

function generateWithHeuristics(
  discoveryTitle: string,
  category: Category,
  locationOrDistrict?: string
): GeneratedQueryCandidate[] {
  // Strip common stop words
  const cleanTitle = discoveryTitle
    .replace(/\b(gta\s*6|gta\s*vi|grand\s*theft\s*auto\s*6|found|discovered|new|secret|how\s*to)\b/gi, '')
    .trim();

  const words = cleanTitle.split(/\s+/).filter((w) => w.length > 2);
  const coreSubject = words.slice(0, 3).join(' ');

  const queries: GeneratedQueryCandidate[] = [
    {
      query: `GTA 6 ${coreSubject} location`,
      category,
      priority: 'high',
    },
    {
      query: `GTA VI ${coreSubject} easter egg`,
      category,
      priority: 'normal',
    },
    {
      query: `GTA 6 ${cleanTitle} guide`,
      category,
      priority: 'normal',
    },
  ];

  if (locationOrDistrict) {
    queries.push({
      query: `GTA VI ${locationOrDistrict} ${coreSubject}`,
      category,
      priority: 'high',
    });
  }

  return queries;
}

export async function penalizeLowYieldQueries(): Promise<void> {
  await connectDB();
  // Deprioritize queries that ran more than 3 times with 0 items found
  await ResearchQuery.updateMany(
    {
      itemsFoundCount: 0,
      priority: 'high',
      lastRunAt: { $exists: true },
    },
    {
      $set: { priority: 'normal', relevanceScore: 70 },
    }
  );
}

function escapeRegex(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
