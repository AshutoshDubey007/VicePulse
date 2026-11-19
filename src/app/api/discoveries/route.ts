import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { z } from 'zod';

const createDiscoverySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.enum(['hidden-location', 'rare-vehicle', 'easter-egg', 'encounter', 'unusual-event']),
  subcategory: z.string().optional(),
  locationName: z.string().min(2, 'Location name is required'),
  district: z.string().min(2, 'District is required'),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
    inGameGrid: z.string().optional(),
  }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  stepsToFind: z.array(z.string()).optional(),
  inGameTime: z.string().optional(),
  weather: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  evidenceImages: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
    type: z.enum(['screenshot', 'clip', 'map_crop']).default('screenshot'),
  })).min(1, 'At least one evidence image is required'),
  source: z.object({
    platform: z.enum(['reddit', 'youtube', 'tiktok', 'instagram', 'discord', 'gaming-press', 'x-twitter']),
    url: z.string(),
    author: z.string(),
    timestamp: z.string().optional(),
  }),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const district = searchParams.get('district') || undefined;
    const featured = searchParams.get('featured') === 'true';
    const sort = (searchParams.get('sort') as any) || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await store.getDiscoveries({
      category,
      status,
      search,
      district,
      featured,
      sort,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch discoveries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createDiscoverySchema.parse(body);

    const newDiscovery = await store.createDiscovery(validated);

    return NextResponse.json(newDiscovery, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to submit discovery' }, { status: 500 });
  }
}
