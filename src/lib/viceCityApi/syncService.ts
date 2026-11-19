import connectDB from '@/lib/mongodb';
import { viceCityApi } from './client';
import GtaEntity from '@/models/GtaEntity';
import GtaMapFeature from '@/models/GtaMapFeature';
import ApiSyncState, { getOrCreateSyncState } from '@/models/ApiSyncState';
import Vehicle from '@/models/Vehicle';
import Discovery from '@/models/Discovery';
import NewsArticle from '@/models/NewsArticle';
import ProcessingLog from '@/models/ProcessingLog';
import type { GtaEntityType } from '@/types';

export interface SyncReport {
  success: boolean;
  plan: 'demo' | 'developer';
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  totalRecordsProcessed: number;
  imported: number;
  updated: number;
  collectionsSynced: Record<string, number>;
  mapFeaturesSynced: number;
  crossLinksEstablished: number;
  errors: string[];
}

export const SUPPORTED_COLLECTIONS: Array<{ name: string; type: GtaEntityType }> = [
  { name: 'locations', type: 'location' },
  { name: 'businesses', type: 'business' },
  { name: 'characters', type: 'character' },
  { name: 'manufacturers', type: 'manufacturer' },
  { name: 'vehicles', type: 'vehicle' },
  { name: 'weapons', type: 'weapon' },
  { name: 'activities', type: 'activity' },
  { name: 'radio-stations', type: 'radio-station' },
  { name: 'trailers', type: 'trailer' },
  { name: 'editions', type: 'edition' },
  { name: 'events', type: 'event' },
];

export async function runViceCityApiSync(): Promise<SyncReport> {
  const startedAt = new Date();
  const errors: string[] = [];
  const collectionsSynced: Record<string, number> = {};
  let totalImported = 0;
  let totalUpdated = 0;
  let mapFeaturesSynced = 0;
  let crossLinksEstablished = 0;

  await connectDB();
  const syncState = await getOrCreateSyncState();

  syncState.status = 'syncing';
  await syncState.save();

  console.log('[ViceCitySync] Starting comprehensive GTA VI API synchronization...');

  // 1. Check API index and plan
  let apiMeta: any = {};
  let planType: 'demo' | 'developer' = viceCityApi.getPlanType();

  try {
    const indexRes = await viceCityApi.getIndex();
    apiMeta = indexRes.meta || {};
    if (indexRes.meta?.plan === 'demo') {
      planType = 'demo';
    } else if (indexRes.meta?.plan === 'developer') {
      planType = 'developer';
    }
  } catch (err: any) {
    errors.push(`API Connectivity Warning: ${err.message}`);
  }

  // 2. Sync all supported collections
  for (const col of SUPPORTED_COLLECTIONS) {
    try {
      console.log(`[ViceCitySync] Fetching collection: ${col.name}...`);
      let pageCursor: string | undefined = undefined;
      let hasMore = true;
      let colCount = 0;

      while (hasMore) {
        const res = await viceCityApi.getCollection(col.name, {
          limit: 50,
          cursor: pageCursor,
          lang: 'en',
        });

        const items = Array.isArray(res.data) ? res.data : [];
        if (items.length === 0) break;

        for (const item of items) {
          const externalId = item.id || `${col.type}.${item.slug}`;
          const slug = item.slug || item.id?.split('.').pop() || 'unknown';

          // Standardize name
          const nameObj = typeof item.name === 'object' && item.name !== null
            ? item.name
            : { en: String(item.name || slug) };

          // Standardize summary
          const summaryObj = typeof item.summary === 'object' && item.summary !== null
            ? item.summary
            : item.summary ? { en: String(item.summary) } : null;

          const existing = await GtaEntity.findOne({ externalId });

          if (existing) {
            // Update without overwriting user enrichment
            existing.name = nameObj;
            if (summaryObj) existing.summary = summaryObj;
            existing.attributes = { ...existing.attributes, ...(item.attributes || {}) };
            existing.relations = item.relations || existing.relations;
            existing.reliability = item.reliability || existing.reliability;
            existing.sources = item.sources || existing.sources;
            existing.lastSyncedAt = new Date();
            existing.syncStatus = 'synced';
            await existing.save();
            totalUpdated++;
          } else {
            // Insert new record
            await GtaEntity.create({
              source: 'vice-city.app',
              externalId,
              type: col.type,
              slug,
              name: nameObj,
              summary: summaryObj,
              attributes: item.attributes || {},
              relations: item.relations || [],
              reliability: item.reliability || 'official',
              spoiler: item.spoiler || false,
              verifiedInGame: item.verified_in_game || false,
              sources: item.sources || [],
              syncStatus: 'synced',
              lastSyncedAt: new Date(),
            });
            totalImported++;
          }
          colCount++;
        }

        // Pagination check
        if (res.links?.next_cursor && res.links.next_cursor !== pageCursor) {
          pageCursor = res.links.next_cursor;
        } else {
          hasMore = false;
        }
      }

      collectionsSynced[col.name] = colCount;
      console.log(`[ViceCitySync] Collection ${col.name} synced (${colCount} records).`);
    } catch (colErr: any) {
      const msg = `Error syncing collection '${col.name}': ${colErr.message}`;
      console.warn(`[ViceCitySync] ${msg}`);
      errors.push(msg);
    }
  }

  // 3. Sync GeoJSON Map Layers (Districts & Landmarks)
  const mapLayers: Array<'districts' | 'landmarks'> = ['districts', 'landmarks'];
  for (const layer of mapLayers) {
    try {
      console.log(`[ViceCitySync] Attempting to fetch map layer: ${layer}...`);
      const mapRes = await viceCityApi.getMapLayer(layer);
      const features = mapRes.data?.features || [];

      for (const feat of features) {
        const featureId = feat.id || feat.properties?.slug || feat.properties?.name || String(Math.random());
        await GtaMapFeature.findOneAndUpdate(
          { layer, featureId: String(featureId) },
          {
            $set: {
              layer,
              featureId: String(featureId),
              source: 'vice-city.app',
              properties: feat.properties || {},
              geometry: feat.geometry,
              bbox: feat.bbox,
              lastSyncedAt: new Date(),
            },
          },
          { upsert: true, new: true }
        );
        mapFeaturesSynced++;
      }
      console.log(`[ViceCitySync] Map layer ${layer} synced with ${features.length} features.`);
    } catch (mapErr: any) {
      if (mapErr.status === 403) {
        console.log(`[ViceCitySync] Notice: Map layer '${layer}' requires Developer Key (mn_live_...). Using existing / fallback map data.`);
      } else {
        errors.push(`Map layer '${layer}' error: ${mapErr.message}`);
      }
    }
  }

  // 4. Automatic Relationships & Cross-Linking
  try {
    console.log('[ViceCitySync] Performing automatic relationship linking...');
    
    // A. Link Community Rare Vehicles to API Catalogue
    const rareVehicles = await Vehicle.find({ gtaEntityId: { $exists: false } });
    for (const v of rareVehicles) {
      // Find matching vehicle catalogue entity
      const match = await GtaEntity.findOne({
        type: 'vehicle',
        $or: [
          { 'name.en': { $regex: new RegExp(v.name.replace(/[^\w\s]/g, '').trim(), 'i') } },
          { slug: { $regex: new RegExp(v.modelName.replace(/[^\w\s]/g, '').trim(), 'i') } },
        ],
      });

      if (match) {
        v.gtaEntityId = match._id;
        v.apiSlug = match.slug;
        if (!v.manufacturer && match.attributes?.manufacturer?.en) {
          v.manufacturer = match.attributes.manufacturer.en;
        }
        if (!v.realInspiration && match.attributes?.inspiration?.en) {
          v.realInspiration = match.attributes.inspiration.en;
        }
        await v.save();
        crossLinksEstablished++;
      }
    }

    // B. Link Discoveries referencing known locations/districts/vehicles
    const discoveries = await Discovery.find({ relatedEntityIds: { $size: 0 } }).limit(50);
    const allLocations = await GtaEntity.find({ type: { $in: ['location', 'business'] } }).select('slug name').lean();
    const allVehicles = await GtaEntity.find({ type: 'vehicle' }).select('slug name').lean();

    for (const d of discoveries) {
      const text = `${d.title} ${d.description} ${d.locationName} ${d.district}`.toLowerCase();
      const linkedIds: any[] = [];
      const foundVehicles: string[] = [];
      const foundLocations: string[] = [];

      for (const loc of allLocations) {
        const locName = (typeof loc.name === 'object' ? loc.name?.en : loc.name)?.toLowerCase();
        if (locName && locName.length > 3 && text.includes(locName)) {
          linkedIds.push(loc._id);
          foundLocations.push(locName);
        }
      }

      for (const veh of allVehicles) {
        const vehName = (typeof veh.name === 'object' ? veh.name?.en : veh.name)?.toLowerCase();
        if (vehName && vehName.length > 3 && text.includes(vehName)) {
          linkedIds.push(veh._id);
          foundVehicles.push(vehName);
        }
      }

      if (linkedIds.length > 0) {
        d.relatedEntityIds = linkedIds;
        if (foundVehicles.length > 0) d.relatedVehicles = [...new Set([...(d.relatedVehicles || []), ...foundVehicles])];
        if (foundLocations.length > 0) d.relatedLandmarks = [...new Set([...(d.relatedLandmarks || []), ...foundLocations])];
        await d.save();
        crossLinksEstablished++;
      }
    }
  } catch (relErr: any) {
    errors.push(`Cross-linking error: ${relErr.message}`);
  }

  // 5. Update ApiSyncState
  const completedAt = new Date();
  const durationMs = completedAt.getTime() - startedAt.getTime();
  const totalProcessed = totalImported + totalUpdated;

  syncState.status = errors.length > 0 && totalProcessed === 0 ? 'failed' : 'completed';
  syncState.plan = planType;
  syncState.lastSuccessfulSync = completedAt;
  syncState.totalApiRecords = await GtaEntity.countDocuments({ source: 'vice-city.app' });
  syncState.importedRecords += totalImported;
  syncState.updatedRecords += totalUpdated;
  syncState.collectionCounts = collectionsSynced;
  syncState.syncDurationMs = durationMs;
  if (errors.length > 0) syncState.lastError = errors[0];

  syncState.history.unshift({
    startedAt,
    completedAt,
    status: syncState.status === 'completed' ? 'completed' : 'failed',
    recordsProcessed: totalProcessed,
    error: errors[0] || undefined,
  });

  if (syncState.history.length > 20) {
    syncState.history = syncState.history.slice(0, 20);
  }

  await syncState.save();

  // Log to ProcessingLog
  await ProcessingLog.create({
    level: errors.length > 0 ? 'warn' : 'info',
    phase: 'publish',
    message: `ViceCity API Sync complete: +${totalImported} imported, ${totalUpdated} updated, ${mapFeaturesSynced} map features, ${crossLinksEstablished} relationships linked (${durationMs}ms)`,
  });

  console.log(`[ViceCitySync] Sync successfully completed in ${durationMs}ms.`);

  return {
    success: true,
    plan: planType,
    startedAt,
    completedAt,
    durationMs,
    totalRecordsProcessed: totalProcessed,
    imported: totalImported,
    updated: totalUpdated,
    collectionsSynced,
    mapFeaturesSynced,
    crossLinksEstablished,
    errors,
  };
}
