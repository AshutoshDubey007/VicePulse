import { 
  Discovery, 
  RareVehicle, 
  SourceRecord, 
  UserProfile, 
  Comment, 
  Category, 
  VerificationStatus,
  SourceStatus,
  SourcePlatform
} from '@/types';
import { connectToDatabase } from '@/lib/mongodb';
import DiscoveryModel from '@/models/Discovery';
import SourceModel from '@/models/Source';
import VehicleModel from '@/models/Vehicle';
import CommentModel from '@/models/Comment';
import ResearchSource from '@/models/ResearchSource';
import { parseSearchIntent, scoreDiscoveryRelevance } from '@/lib/search/intentParser';

// Optional dev fixtures - strictly isolated and disabled by default
const ENABLE_FIXTURES = process.env.ENABLE_DEV_FIXTURES === 'true';

// Production Store - strictly backed by MongoDB Atlas with zero dummy fallback
class IntelligenceStore {
  private inMemoryDiscoveries: Discovery[] = [];
  private inMemoryComments: Comment[] = [];

  constructor() {
    if (ENABLE_FIXTURES) {
      try {
        const { mockDiscoveries, mockComments } = require('@/data/mockData');
        this.inMemoryDiscoveries = mockDiscoveries || [];
        this.inMemoryComments = mockComments || [];
      } catch {
        // Ignored
      }
    }
  }

  // Discoveries
  async getDiscoveries(params?: {
    category?: string;
    status?: string;
    search?: string;
    district?: string;
    featured?: boolean;
    sort?: 'newest' | 'confirmed' | 'disputed' | 'trending';
    page?: number;
    limit?: number;
  }): Promise<{ items: Discovery[]; total: number; page: number; totalPages: number }> {
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const query: Record<string, unknown> = {};
        const searchIntent = params?.search ? parseSearchIntent(params.search) : null;

        if (params?.category && params.category !== 'all') {
          query.category = params.category;
        } else if (searchIntent?.detectedCategory && searchIntent.isBroadCategorySearch) {
          // Intent recognition: User searched broadly for a category (e.g. "easter egg", "rare vehicles")
          query.category = searchIntent.detectedCategory;
        }

        if (params?.status && params.status !== 'all') {
          if (params.status === 'verified_only') {
            query.verificationStatus = { $in: ['community_verified', 'personally_verified', 'corroborated'] };
          } else {
            query.verificationStatus = params.status;
          }
        }

        if (params?.search) {
          const searchRegex = { $regex: params.search, $options: 'i' };
          const orConditions: any[] = [
            { title: searchRegex },
            { description: searchRegex },
            { locationName: searchRegex },
            { district: searchRegex },
            { tags: { $in: [new RegExp(params.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')] } },
          ];

          if (searchIntent?.detectedCategory) {
            orConditions.push({ category: searchIntent.detectedCategory });
          }

          // If query already has a category filter, keep both
          if (query.category) {
            query.$and = [{ category: query.category }, { $or: orConditions }];
            delete query.category;
          } else {
            query.$or = orConditions;
          }
        }

        if (params?.district && params.district !== 'all') {
          query.district = params.district;
        }
        if (params?.featured) {
          query.featured = true;
        }

        let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
        if (params?.sort === 'confirmed') sortOption = { confirmationsCount: -1 };
        if (params?.sort === 'disputed') sortOption = { disputeCount: -1 };
        if (params?.sort === 'trending') sortOption = { confirmationsCount: -1, createdAt: -1 };

        const page = params?.page || 1;
        const limit = params?.limit || 20;
        const skip = (page - 1) * limit;

        if (searchIntent && params?.search) {
          // Multi-tiered ranking for search queries: fetch candidates and score by relevance
          const candidates = await DiscoveryModel.find(query).limit(100).lean();
          let scored = candidates.map((doc: any) => {
            const score = scoreDiscoveryRelevance(doc, searchIntent);
            return { doc, score };
          });

          // Filter out heavily penalized / irrelevant items if an explicit intent exists
          if (searchIntent.detectedCategory) {
            scored = scored.filter((item) => item.score > 0);
          }

          // Sort strictly by relevance score descending, tie-break by confirmations and date
          scored.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            const bConf = b.doc.confirmationsCount || 0;
            const aConf = a.doc.confirmationsCount || 0;
            if (bConf !== aConf) return bConf - aConf;
            return new Date(b.doc.createdAt || 0).getTime() - new Date(a.doc.createdAt || 0).getTime();
          });

          const total = scored.length;
          const pagedItems = scored.slice(skip, skip + limit).map((s) => ({
            ...s.doc,
            id: s.doc._id?.toString() || s.doc.id,
          }));

          return {
            items: pagedItems as unknown as Discovery[],
            total,
            page,
            totalPages: total > 0 ? Math.ceil(total / limit) : 0,
          };
        }

        const [items, total] = await Promise.all([
          DiscoveryModel.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
          DiscoveryModel.countDocuments(query),
        ]);

        if (items) {
          return {
            items: items.map((doc: any) => ({
              ...doc,
              id: doc._id?.toString() || doc.id,
            })) as unknown as Discovery[],
            total,
            page,
            totalPages: total > 0 ? Math.ceil(total / limit) : 0,
          };
        }
      } catch (e) {
        console.warn('[Store] MongoDB query failed:', e);
      }
    }

    // Only if dev fixtures are explicitly enabled
    if (ENABLE_FIXTURES && this.inMemoryDiscoveries.length > 0) {
      let filtered = [...this.inMemoryDiscoveries];
      if (params?.category && params.category !== 'all') {
        filtered = filtered.filter((d) => d.category === params.category);
      }
      return {
        items: filtered.slice(0, params?.limit || 20),
        total: filtered.length,
        page: 1,
        totalPages: Math.ceil(filtered.length / (params?.limit || 20)),
      };
    }

    return {
      items: [],
      total: 0,
      page: params?.page || 1,
      totalPages: 0,
    };
  }

  async getDiscoveryById(idOrSlug: string): Promise<Discovery | null> {
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const item = await DiscoveryModel.findOne({
          $or: [{ slug: idOrSlug }, { _id: idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? idOrSlug : null }, { id: idOrSlug }],
        }).lean();
        if (item) {
          const doc = item as any;
          return {
            ...doc,
            id: doc._id?.toString() || doc.id,
          } as unknown as Discovery;
        }
      } catch (e) {
        console.warn('[Store] DB lookup failed:', e);
      }
    }

    if (ENABLE_FIXTURES) {
      return this.inMemoryDiscoveries.find((d) => d.id === idOrSlug || d.slug === idOrSlug) || null;
    }

    return null;
  }

  async createDiscovery(data: Partial<Discovery>): Promise<Discovery> {
    const id = `disc-${Date.now()}`;
    const slug = data.title
      ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : `discovery-${id}`;

    const newDiscovery: Discovery = {
      id,
      title: data.title || 'Untitled Field Report',
      slug,
      category: (data.category as Category) || 'hidden-location',
      subcategory: data.subcategory || 'Uncategorized Discovery',
      locationName: data.locationName || 'State of Leonida',
      district: data.district || 'Leonida',
      coordinates: data.coordinates || { lat: 0, lng: 0, inGameGrid: 'LOCATION_PENDING' },
      description: data.description || '',
      stepsToFind: data.stepsToFind || [],
      inGameTime: data.inGameTime,
      weather: data.weather,
      requirements: data.requirements,
      evidenceImages: data.evidenceImages || [],
      source: data.source || {
        platform: 'reddit',
        url: '',
        author: 'Anonymous',
        timestamp: new Date().toISOString(),
      },
      verificationStatus: (data.verificationStatus as VerificationStatus) || 'unverified',
      verificationReason: data.verificationReason,
      confirmationsCount: 1,
      confirmedBy: [data.submittedBy?.id || 'usr-anon'],
      disputeCount: 0,
      disputes: [],
      tags: data.tags || ['Leonida'],
      submittedBy: data.submittedBy || {
        id: 'usr-anon',
        username: 'FieldScout',
        role: 'scout',
        avatar: '/images/hero/vice-city-hero.webp',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featured: false,
    };

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await DiscoveryModel.create(newDiscovery);
      } catch (e) {
        console.warn('[Store] DB creation error:', e);
      }
    }

    return newDiscovery;
  }

  async updateDiscovery(id: string, updates: Partial<Discovery>): Promise<Discovery | null> {
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const updated = await DiscoveryModel.findOneAndUpdate(
          { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
          updates,
          { new: true }
        ).lean();
        if (updated) {
          const doc = updated as any;
          return { ...doc, id: doc._id?.toString() || doc.id } as unknown as Discovery;
        }
      } catch (e) {
        console.warn('[Store] DB update error:', e);
      }
    }
    return null;
  }

  async confirmDiscovery(id: string, username: string = 'ActiveScout'): Promise<{ success: boolean; count: number }> {
    const discovery = await this.getDiscoveryById(id);
    if (!discovery) return { success: false, count: 0 };

    if (!discovery.confirmedBy.includes(username)) {
      discovery.confirmedBy.push(username);
      discovery.confirmationsCount += 1;
      
      if (discovery.confirmationsCount >= 10 && discovery.verificationStatus === 'unverified') {
        discovery.verificationStatus = 'community_verified';
        discovery.verificationReason = `Promoted to Community Verified after ${discovery.confirmationsCount} independent confirmations.`;
      }

      await this.updateDiscovery(discovery.id, {
        confirmedBy: discovery.confirmedBy,
        confirmationsCount: discovery.confirmationsCount,
        verificationStatus: discovery.verificationStatus,
        verificationReason: discovery.verificationReason,
      });
    }

    return { success: true, count: discovery.confirmationsCount };
  }

  async disputeDiscovery(id: string, reason: string, reportedBy: string): Promise<{ success: boolean; disputeCount: number }> {
    const discovery = await this.getDiscoveryById(id);
    if (!discovery) return { success: false, disputeCount: 0 };

    const dispute = {
      id: `disp-${Date.now()}`,
      reason,
      reportedBy: reportedBy || 'Scout_FieldObserver',
      createdAt: new Date().toISOString(),
    };

    discovery.disputes.push(dispute);
    discovery.disputeCount += 1;

    if (discovery.disputeCount >= 3) {
      discovery.verificationStatus = 'disputed';
      discovery.verificationReason = `Marked disputed due to ${discovery.disputeCount} community inconsistency reports.`;
    } else if (discovery.disputeCount >= 1 && discovery.verificationStatus === 'community_verified') {
      discovery.verificationStatus = 'under_investigation';
      discovery.verificationReason = 'Under investigation following newly filed community discrepancy report.';
    }

    await this.updateDiscovery(discovery.id, {
      disputes: discovery.disputes,
      disputeCount: discovery.disputeCount,
      verificationStatus: discovery.verificationStatus,
      verificationReason: discovery.verificationReason,
    });

    return { success: true, disputeCount: discovery.disputeCount };
  }

  // Comments
  async getComments(discoveryId: string): Promise<Comment[]> {
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const docs = await CommentModel.find({ discoveryId }).sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) {
          return docs.map((d: any) => ({ ...d, id: d._id?.toString() || d.id })) as unknown as Comment[];
        }
      } catch (e) {
        console.warn('[Store] DB comments lookup failed:', e);
      }
    }

    if (ENABLE_FIXTURES) {
      return this.inMemoryComments.filter((c) => c.discoveryId === discoveryId);
    }

    return [];
  }

  async addComment(discoveryId: string, commentData: Partial<Comment>): Promise<Comment> {
    const newComment: Comment = {
      id: `com-${Date.now()}`,
      discoveryId,
      username: commentData.username || 'FieldScout',
      userRole: commentData.userRole || 'scout',
      avatar: commentData.avatar || '/images/hero/vice-city-hero.webp',
      content: commentData.content || '',
      createdAt: new Date().toISOString(),
      isFieldScoutNote: commentData.isFieldScoutNote || false,
      evidenceUrl: commentData.evidenceUrl,
    };

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await CommentModel.create(newComment);
      } catch (e) {
        console.warn('[Store] DB comment error:', e);
      }
    }

    return newComment;
  }

  // Rare Vehicles - strictly sourced from DiscoveryModel (category: 'rare-vehicle') or VehicleModel
  async getVehicles(params?: { class?: string; search?: string }): Promise<RareVehicle[]> {
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const query: Record<string, unknown> = { category: 'rare-vehicle' };
        if (params?.search) {
          query.$or = [
            { title: { $regex: params.search, $options: 'i' } },
            { description: { $regex: params.search, $options: 'i' } },
            { locationName: { $regex: params.search, $options: 'i' } },
            { district: { $regex: params.search, $options: 'i' } },
          ];
        }
        const docs = await DiscoveryModel.find(query).sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) {
          return docs.map((d: any) => ({
            id: d._id?.toString() || d.id,
            name: d.title,
            modelName: d.subcategory || d.title,
            vehicleClass: (d.subcategory?.toLowerCase() || 'sports') as any,
            reportedLocation: d.locationName || 'Leonida',
            district: d.district || 'Leonida',
            coordinates: d.coordinates || { lat: 0, lng: 0 },
            spawnConditions: {
              time: d.inGameTime || 'Any',
              weather: d.weather || 'Any',
            },
            evidenceImage: d.evidenceImages?.[0]?.url || '/images/hero/vice-city-hero.webp',
            verificationStatus: d.verificationStatus || 'unverified',
            confirmationsCount: d.confirmationsCount || 0,
            rarity: 'Rare' as const,
            description: d.description || '',
          })) as RareVehicle[];
        }
        return [];
      } catch (err) {
        console.warn('[Store] getVehicles DB query error:', err);
      }
    }

    return [];
  }

  // Sources - strictly sourced from real DB records
  async getSources(params?: { platform?: string; status?: string; search?: string; limit?: number }): Promise<SourceRecord[]> {
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const query: Record<string, unknown> = {};
        if (params?.platform && params.platform !== 'all') {
          query.platform = params.platform;
        }
        if (params?.status && params.status !== 'all') {
          query.status = params.status;
        }
        if (params?.search) {
          query.$or = [
            { contentTitle: { $regex: params.search, $options: 'i' } },
            { author: { $regex: params.search, $options: 'i' } },
            { name: { $regex: params.search, $options: 'i' } },
          ];
        }
        const limit = params?.limit || 20;
        const docs = await SourceModel.find(query).sort({ dateDiscovered: -1 }).limit(limit).lean();
        if (docs && docs.length > 0) {
          return docs.map((s: any) => ({
            ...s,
            id: s._id?.toString() || s.id,
          })) as unknown as SourceRecord[];
        }
        return [];
      } catch (e) {
        console.warn('[Store] getSources DB error:', e);
      }
    }

    return [];
  }

  async createSource(data: Partial<SourceRecord>): Promise<SourceRecord> {
    const newSource: SourceRecord = {
      id: `src-${Date.now()}`,
      originalUrl: data.originalUrl || '',
      platform: (data.platform as SourcePlatform) || 'reddit',
      author: data.author || 'Anonymous',
      contentTitle: data.contentTitle || 'New GTA VI Lead',
      dateDiscovered: new Date().toISOString(),
      datePublished: data.datePublished || new Date().toISOString(),
      extractedDiscoveries: data.extractedDiscoveries || [],
      status: (data.status as SourceStatus) || 'new',
      reliabilityNotes: data.reliabilityNotes || 'Awaiting initial intake.',
      reliabilityScore: data.reliabilityScore || 3,
    };

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await SourceModel.create(newSource);
      } catch (e) {
        console.warn('[Store] createSource DB error:', e);
      }
    }

    return newSource;
  }

  async updateSource(id: string, updates: Partial<SourceRecord>): Promise<SourceRecord | null> {
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const doc = await SourceModel.findOneAndUpdate(
          { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
          updates,
          { new: true }
        ).lean();
        if (doc) {
          const s = doc as any;
          return { ...s, id: s._id?.toString() || s.id } as SourceRecord;
        }
      } catch (e) {
        console.warn('[Store] updateSource DB error:', e);
      }
    }
    return null;
  }

  // User lookup - returns active scout session
  async getUser(usernameOrId: string): Promise<UserProfile | null> {
    return {
      id: usernameOrId || 'usr_active_scout',
      username: usernameOrId === 'NeonTracker_99' ? 'FieldScout' : (usernameOrId || 'FieldScout'),
      email: 'scout@vicepulse.net',
      role: 'scout',
      avatar: '/images/hero/vice-city-hero.webp',
      bio: 'Leonida field scout documenting world discoveries and coordinates.',
      reputation: 10,
      badges: [],
      contributionsCount: 0,
      verifiedCount: 0,
      joinedDate: '2026-01-01',
      submittedDiscoveryIds: [],
      confirmedDiscoveryIds: [],
    };
  }

  // Real Platform Statistics from MongoDB Atlas (Zero fake stats)
  async getStats() {
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const [total, verified, pending, disputed, vehiclesCount, sourcesCount, districts] = await Promise.all([
          DiscoveryModel.countDocuments(),
          DiscoveryModel.countDocuments({
            verificationStatus: { $in: ['community_verified', 'personally_verified', 'corroborated'] },
          }),
          DiscoveryModel.countDocuments({
            verificationStatus: { $in: ['unverified', 'reported', 'under_investigation'] },
          }),
          DiscoveryModel.countDocuments({ verificationStatus: 'disputed' }),
          DiscoveryModel.countDocuments({ category: 'rare-vehicle' }),
          ResearchSource.countDocuments(),
          DiscoveryModel.distinct('district'),
        ]);

        return {
          totalDiscoveries: total,
          verifiedDiscoveries: verified,
          pendingVerification: pending,
          disputedDiscoveries: disputed,
          rareVehiclesTracked: vehiclesCount,
          intelligenceSources: sourcesCount,
          activeScouts: 0,
          districtsCovered: districts.filter(Boolean).length,
        };
      } catch (e) {
        console.warn('[Store] getStats DB error:', e);
      }
    }

    return {
      totalDiscoveries: 0,
      verifiedDiscoveries: 0,
      pendingVerification: 0,
      disputedDiscoveries: 0,
      rareVehiclesTracked: 0,
      intelligenceSources: 0,
      activeScouts: 0,
      districtsCovered: 0,
    };
  }

  // GTADB Reference Landmarks
  async getGtaDbLandmarks(params?: {
    category?: string;
    enterable?: boolean;
    status?: string;
    search?: string;
    limit?: number;
  }): Promise<{ items: any[]; total: number }> {
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const GtaDbLandmark = (await import('@/models/GtaDbLandmark')).default;
        const filter: any = {
          'inGameCoordinates.x': { $exists: true, $ne: null },
          'inGameCoordinates.y': { $exists: true, $ne: null },
        };
        if (params?.category && params.category !== 'all') {
          filter.category = params.category;
        }
        if (params?.enterable !== undefined) {
          filter.isEnterable = params.enterable;
        }
        if (params?.status && params.status !== 'all') {
          filter.status = params.status;
        }
        if (params?.search && params.search.trim()) {
          const q = params.search.trim();
          filter.$or = [
            { name: { $regex: q, $options: 'i' } },
            { realWorldName: { $regex: q, $options: 'i' } },
            { gtadbId: { $regex: `^${q}`, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } },
          ];
        }
        const limit = Math.min(params?.limit || 300, 1000);
        const [items, total] = await Promise.all([
          GtaDbLandmark.find(filter).limit(limit).lean(),
          GtaDbLandmark.countDocuments(filter),
        ]);
        return { items, total };
      } catch (e) {
        console.warn('[Store] getGtaDbLandmarks error:', e);
      }
    }
    return { items: [], total: 0 };
  }
}

// Global Singleton
const globalStore = global as unknown as { intelligenceStore?: IntelligenceStore };
export const store = globalStore.intelligenceStore || new IntelligenceStore();
if (process.env.NODE_ENV !== 'production') {
  globalStore.intelligenceStore = store;
}
