import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Discovery from '@/models/Discovery';
import NewsArticle from '@/models/NewsArticle';
import Vehicle from '@/models/Vehicle';
import GtaEntity from '@/models/GtaEntity';
import { parseSearchIntent, scoreDiscoveryRelevance } from '@/lib/search/intentParser';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q || q.length < 2) {
      return NextResponse.json({
        query: q,
        intent: null,
        results: {
          discoveries: [],
          news: [],
          vehicles: [],
          characters: [],
          locations: [],
        },
        totalCount: 0,
        fallback: null,
      });
    }

    await connectDB();
    const intent = parseSearchIntent(q);
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    // 1. Build category-aware discovery query
    let discoveryFilter: any;
    if (intent.detectedCategory && intent.isBroadCategorySearch) {
      // User specifically queried a category broadly (e.g. "easter egg", "rare vehicles", "wildlife")
      discoveryFilter = { category: intent.detectedCategory };
    } else if (intent.detectedCategory) {
      discoveryFilter = {
        $or: [
          { category: intent.detectedCategory },
          { title: regex },
          { description: regex },
          { locationName: regex },
          { district: regex },
        ],
      };
    } else {
      discoveryFilter = {
        $or: [{ title: regex }, { description: regex }, { locationName: regex }, { district: regex }],
      };
    }

    // 2. Fetch records concurrently with category intent gating
    const isCategorySpecific = Boolean(intent.detectedCategory && intent.isBroadCategorySearch);
    const isVehicleIntent = intent.detectedCategory === 'rare-vehicle' || intent.detectedEntityType === 'vehicle';
    const isCharacterIntent = intent.detectedEntityType === 'character';

    const [rawDiscoveries, news, vehicleSpawns, gtaEntities] = await Promise.all([
      // Discoveries
      Discovery.find(discoveryFilter)
        .select('title slug category district locationName coordinates verificationStatus description evidenceImages')
        .limit(30)
        .lean(),

      // News: Omit if user searched specifically for non-news category (e.g., "Easter egg")
      isCategorySpecific && intent.detectedCategory !== 'unusual-event'
        ? Promise.resolve([])
        : NewsArticle.find({
            status: 'published',
            $or: [{ title: regex }, { excerpt: regex }],
          })
            .select('title slug category publishedAt')
            .limit(5)
            .lean(),

      // Vehicle Spawns: Only query if general query or vehicle intent
      !isCategorySpecific || isVehicleIntent
        ? Vehicle.find({
            $or: [{ name: regex }, { modelName: regex }, { district: regex }, { vehicleClass: regex }],
          })
            .select('name modelName vehicleClass district rarity')
            .limit(6)
            .lean()
        : Promise.resolve([]),

      // Official GTA VI Entities
      GtaEntity.find({
        $or: [
          { 'name.en': regex },
          { slug: regex },
          { 'attributes.class.en': regex },
          { 'attributes.manufacturer.en': regex },
          { 'attributes.kind': regex },
        ],
      })
        .select('name slug type attributes reliability')
        .limit(10)
        .lean(),
    ]);

    // 3. Multi-tiered relevance scoring for discoveries
    let scoredDiscoveries = rawDiscoveries.map((d: any) => ({
      doc: d,
      score: scoreDiscoveryRelevance(d, intent),
    }));

    if (intent.detectedCategory) {
      // Filter out negative score items (wrong categories that merely mention the keyword)
      scoredDiscoveries = scoredDiscoveries.filter((item) => item.score > 0);
    }

    scoredDiscoveries.sort((a, b) => b.score - a.score);

    // Single-record integrity mapping for discoveries
    const formattedDiscoveries = scoredDiscoveries.slice(0, 8).map(({ doc: d }) => ({
      id: d._id.toString(),
      title: d.title,
      type: 'discovery',
      category: d.category,
      district: d.district,
      locationName: d.locationName,
      coordinates: d.coordinates,
      status: d.verificationStatus,
      thumbnail: d.evidenceImages?.[0]?.url || null,
      description: d.description,
      url: `/discoveries/${d.slug || d._id}`,
    }));

    // Format news
    const formattedNews = (news || []).map((n: any) => ({
      id: n._id.toString(),
      title: n.title,
      type: 'news',
      category: n.category,
      url: `/news/${n.slug}`,
    }));

    // Format vehicle spawns
    const formattedVehicleSpawns = (vehicleSpawns || []).map((v: any) => ({
      id: v._id.toString(),
      title: v.name,
      type: 'vehicle_spawn',
      vehicleClass: v.vehicleClass,
      district: v.district,
      rarity: v.rarity,
      url: `/vehicles`,
    }));

    // Group GTA entities by type with intent filtering
    const characters: any[] = [];
    const locations: any[] = [];
    const catalogueVehicles: any[] = [];
    const weaponsAndActivities: any[] = [];

    (gtaEntities || []).forEach((e: any) => {
      // Skip irrelevant entities when broad category search is active
      if (isCategorySpecific) {
        if (!isVehicleIntent && e.type === 'vehicle') return;
        if (!isCharacterIntent && e.type === 'character') return;
      }

      const name = typeof e.name === 'object' ? e.name.en : e.name;
      const base = {
        id: e._id.toString(),
        title: name,
        slug: e.slug,
        type: e.type,
      };

      if (e.type === 'character') {
        characters.push({
          ...base,
          alias: e.attributes?.alias,
          group: typeof e.attributes?.group === 'object' ? e.attributes?.group?.en : e.attributes?.group,
          url: `/news?q=${encodeURIComponent(name)}`,
        });
      } else if (e.type === 'location' || e.type === 'business') {
        locations.push({
          ...base,
          kind: e.attributes?.kind || e.type,
          area: typeof e.attributes?.area === 'object' ? e.attributes?.area?.en : e.attributes?.area,
          url: `/map?highlight=${e.slug}`,
        });
      } else if (e.type === 'vehicle') {
        catalogueVehicles.push({
          ...base,
          vehicleClass: typeof e.attributes?.class === 'object' ? e.attributes?.class?.en : e.attributes?.class,
          manufacturer: typeof e.attributes?.manufacturer === 'object' ? e.attributes?.manufacturer?.en : e.attributes?.manufacturer,
          url: `/vehicles?q=${encodeURIComponent(name)}`,
        });
      } else {
        weaponsAndActivities.push({
          ...base,
          kind: e.type,
          url: `/discoveries?q=${encodeURIComponent(name)}`,
        });
      }
    });

    const totalCount =
      formattedDiscoveries.length +
      formattedNews.length +
      formattedVehicleSpawns.length +
      characters.length +
      locations.length +
      catalogueVehicles.length +
      weaponsAndActivities.length;

    // Quality Fallback payload
    const categoryLabels: Record<string, string> = {
      'easter-egg': 'Easter Egg',
      'rare-vehicle': 'Rare Vehicle',
      'hidden-location': 'Hidden Location',
      'encounter': 'Random Encounter',
      'wildlife': 'Wildlife',
      'unusual-event': 'Activity & Mission',
    };

    const detectedLabel = intent.detectedCategory ? categoryLabels[intent.detectedCategory] : null;

    const fallback =
      totalCount === 0
        ? {
            message: detectedLabel
              ? `No matching ${detectedLabel} discoveries found yet.`
              : `No intelligence matches found for "${q.toUpperCase()}".`,
            suggestedCategories: [
              { id: 'easter-egg', label: 'Easter Eggs' },
              { id: 'hidden-location', label: 'Hidden Locations' },
              { id: 'rare-vehicle', label: 'Rare Vehicles' },
              { id: 'encounter', label: 'Random Encounters' },
              { id: 'wildlife', label: 'Wildlife' },
            ],
            clearUrl: '/discoveries',
          }
        : null;

    return NextResponse.json({
      query: q,
      intent: {
        detectedCategory: intent.detectedCategory,
        confidence: intent.categoryConfidence,
        isBroadCategorySearch: intent.isBroadCategorySearch,
      },
      totalCount,
      results: {
        discoveries: formattedDiscoveries,
        news: formattedNews,
        vehicles: [...formattedVehicleSpawns, ...catalogueVehicles],
        characters,
        locations,
        other: weaponsAndActivities,
      },
      fallback,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
