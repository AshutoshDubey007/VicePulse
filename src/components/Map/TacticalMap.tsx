'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Discovery } from '@/types';
import { CATEGORY_MARKER_CONFIG } from './MapAbstraction';
import {
  isTileWithinDayBounds,
  getGtaTileUrl,
  discoveryToInGame,
  getInGameGridCode,
  WORLD_SIZE,
  HALF_WORLD,
  MIN_ZOOM,
  MAX_ZOOM,
  OCEAN_TILE_COLOR,
} from '@/lib/map/coordinateAdapter';
import {
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  RotateCcw,
  Layers,
  Compass,
  MapPin,
  ExternalLink,
  Info,
  Check,
  Building2,
  Radio,
} from 'lucide-react';

export interface GtaDbLandmarkItem {
  _id?: string;
  gtadbId: string;
  name: string;
  category: string;
  tags?: string[];
  inGameCoordinates: { x: number; y: number; z?: number };
  realWorldName?: string;
  realWorldCoordinates?: { lat: number; lng: number };
  photos?: {
    inGame?: { url: string; width?: number; height?: number } | null;
    realWorld?: { url: string; width?: number; height?: number } | null;
  };
  color?: string;
  isEnterable?: boolean;
  status?: string;
  attribution?: string;
}

interface TacticalMapProps {
  discoveries: Discovery[];
  selectedDiscovery: Discovery | null;
  onSelectDiscovery: (discovery: Discovery | null) => void;
  selectedLandmark?: GtaDbLandmarkItem | null;
  onSelectLandmark?: (landmark: GtaDbLandmarkItem | null) => void;
  showGtadbLayer?: boolean;
  onToggleGtadbLayer?: (show: boolean) => void;
  onLocationSelected?: (coords: { lng: number; lat: number; x: number; y: number; grid: string }) => void;
}

// Custom Leaflet CRS for GTADB GTA VI community map
// World size: 32768 x 32768 meters centered on (0, 0).
// At zoom 0: map is 1024 x 1024 pixels (scale = 1/32).
// At zoom 5: map is 32768 x 32768 pixels (scale = 1 px/meter).
const Gta6CRS = L.Util.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1 / 32, 512, -1 / 32, 512),
  scale: function (zoom: number) {
    return Math.pow(2, zoom);
  },
  zoom: function (scale: number) {
    return Math.log(scale) / Math.LN2;
  },
  infinite: false,
});

export const TacticalMap: React.FC<TacticalMapProps> = ({
  discoveries,
  selectedDiscovery,
  onSelectDiscovery,
  selectedLandmark,
  onSelectLandmark,
  showGtadbLayer: externalShowGtadbLayer,
  onToggleGtadbLayer,
  onLocationSelected,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const discoveriesLayerRef = useRef<L.LayerGroup | null>(null);
  const gtadbLayerRef = useRef<L.LayerGroup | null>(null);
  const discoveryMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const landmarkMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1.2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [internalShowGtadb, setInternalShowGtadb] = useState(false);
  const [gtadbLandmarks, setGtadbLandmarks] = useState<GtaDbLandmarkItem[]>([]);
  const [loadingLandmarks, setLoadingLandmarks] = useState(false);
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [cursorTelemetry, setCursorTelemetry] = useState<{
    x: number;
    y: number;
    grid: string;
  } | null>(null);

  const showGtadb = externalShowGtadbLayer !== undefined ? externalShowGtadbLayer : internalShowGtadb;

  const handleToggleGtadb = (val: boolean) => {
    if (onToggleGtadbLayer) {
      onToggleGtadbLayer(val);
    } else {
      setInternalShowGtadb(val);
    }
  };

  // Fetch GTADB reference landmarks on demand when layer is toggled on
  useEffect(() => {
    if (showGtadb && gtadbLandmarks.length === 0 && !loadingLandmarks) {
      setLoadingLandmarks(true);
      fetch('/api/map/gtadb-landmarks?limit=600')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.landmarks) {
            setGtadbLandmarks(data.landmarks);
          }
        })
        .catch((err) => console.warn('[TacticalMap] Failed to load GTADB landmarks:', err))
        .finally(() => setLoadingLandmarks(false));
    }
  }, [showGtadb, gtadbLandmarks.length, loadingLandmarks]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create custom GTADB TileLayer
    const GtaTileLayerClass = L.TileLayer.extend({
      getTileUrl: function (coords: { z: number; x: number; y: number }) {
        return getGtaTileUrl(coords.z, coords.x, coords.y);
      },
    });

    const gtaTileLayer = new (GtaTileLayerClass as any)('', {
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      tileSize: 256,
      noWrap: true,
      bounds: [
        [-HALF_WORLD, -HALF_WORLD],
        [HALF_WORLD, HALF_WORLD],
      ],
      attribution: 'GTA VI Map Tiles © gtadb.org (CC BY 4.0)',
    });

    const discoveriesLayer = L.layerGroup();
    const gtadbLayer = L.layerGroup();

    discoveriesLayerRef.current = discoveriesLayer;
    gtadbLayerRef.current = gtadbLayer;

    // Initialize Map with custom CRS
    const map = L.map(mapContainerRef.current, {
      crs: Gta6CRS,
      minZoom: 0,
      maxZoom: 5,
      zoomSnap: 0.1,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 100,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [
        [-17500, -17500],
        [17500, 17500],
      ],
      maxBoundsViscosity: 0.85,
      layers: [gtaTileLayer, discoveriesLayer],
    });

    // Default view: Centered slightly north-west of Vice City Downtown to show entire Leonida landmass
    map.setView([1000, -2200], 1.2);

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const inGameX = Math.round(e.latlng.lng);
      const inGameY = Math.round(e.latlng.lat);
      const grid = getInGameGridCode(inGameX, inGameY);
      setCursorTelemetry({ x: inGameX, y: inGameY, grid });
    });

    map.on('mouseout', () => {
      setCursorTelemetry(null);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      const inGameX = Math.round(e.latlng.lng);
      const inGameY = Math.round(e.latlng.lat);
      const grid = getInGameGridCode(inGameX, inGameY);

      if (onLocationSelected) {
        onLocationSelected({
          lng: e.latlng.lng,
          lat: e.latlng.lat,
          x: inGameX,
          y: inGameY,
          grid,
        });
      }
    });

    mapRef.current = map;
    setMapLoaded(true);

    // Resize observer for responsive layout
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [onLocationSelected]);

  // Sync GTADB layer visibility
  useEffect(() => {
    if (!mapRef.current || !gtadbLayerRef.current) return;
    if (showGtadb) {
      if (!mapRef.current.hasLayer(gtadbLayerRef.current)) {
        mapRef.current.addLayer(gtadbLayerRef.current);
      }
    } else {
      if (mapRef.current.hasLayer(gtadbLayerRef.current)) {
        mapRef.current.removeLayer(gtadbLayerRef.current);
      }
    }
  }, [showGtadb]);

  // Render Primary Markers: VicePulse Discoveries
  useEffect(() => {
    if (!mapRef.current || !discoveriesLayerRef.current) return;

    discoveriesLayerRef.current.clearLayers();
    discoveryMarkersRef.current.clear();

    discoveries.forEach((d) => {
      if (!d.coordinates || typeof d.coordinates.lat !== 'number' || typeof d.coordinates.lng !== 'number') {
        return;
      }

      // Convert coordinates to in-game meters via coordinate adapter
      const inGame = discoveryToInGame(d.coordinates.lng, d.coordinates.lat);
      const config = CATEGORY_MARKER_CONFIG[d.category] || {
        color: '#FF8247',
        label: 'Discovery',
      };

      const isSelected = selectedDiscovery?.id === d.id;

      const safeTitle = (d.title || '').replace(/"/g, '&quot;');
      // Custom HTML Pin Marker with Neon Glow
      const iconHtml = `
        <div class="vicepulse-pin group ${isSelected ? 'selected' : ''}" data-testid="discovery-pin" data-discovery-id="${d.id}" title="${safeTitle}" style="--marker-color: ${config.color}">
          <div class="pulse-ring"></div>
          <div class="pin-core">
            <span class="category-dot" style="background-color: ${config.color}"></span>
          </div>
          <div class="pin-badge font-mono">${d.coordinates.inGameGrid || 'PULSE'}</div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([inGame.y, inGame.x], {
        icon: customIcon,
        title: d.title,
        zIndexOffset: isSelected ? 1000 : 500,
      });

      // Sleek popup tooltip on hover
      marker.bindTooltip(
        `
        <div class="p-2 bg-[#1C1B20] text-[#F4F0E8] border border-[#28272F] rounded-xs font-mono text-xs shadow-xl space-y-1">
          <div class="flex items-center gap-1.5 text-[10px] font-bold" style="color: ${config.color}">
            <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${config.color}"></span>
            <span>${config.label.toUpperCase()}</span>
            <span class="text-[#9B969F]">• ${d.district || 'LEONIDA'}</span>
          </div>
          <div class="font-display text-sm leading-tight text-[#F4F0E8]">${safeTitle}</div>
          <div class="text-[10px] text-[#9B969F]">GRID: <span class="text-orange font-bold">${d.coordinates.inGameGrid || 'TACTICAL'}</span></div>
        </div>
      `,
        { direction: 'top', offset: [0, -18], opacity: 0.98, className: 'vicepulse-leaflet-tooltip' }
      );

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectDiscovery(d);
        if (onSelectLandmark) onSelectLandmark(null);
      });

      discoveriesLayerRef.current?.addLayer(marker);
      discoveryMarkersRef.current.set(d.id, marker);
    });
  }, [discoveries, selectedDiscovery, onSelectDiscovery, onSelectLandmark]);

  // Render Secondary Reference Markers: GTADB Landmarks
  useEffect(() => {
    if (!mapRef.current || !gtadbLayerRef.current) return;

    gtadbLayerRef.current.clearLayers();
    landmarkMarkersRef.current.clear();

    if (!showGtadb) return;

    gtadbLandmarks.forEach((l) => {
      if (!l.inGameCoordinates || l.inGameCoordinates.x === null || l.inGameCoordinates.y === null) {
        return;
      }

      const isSelected = selectedLandmark?.gtadbId === l.gtadbId;
      const safeName = (l.name || '').replace(/"/g, '&quot;');

      // Minimalist geometric reference dot pin
      const iconHtml = `
        <div class="gtadb-reference-pin ${isSelected ? 'selected' : ''}" data-testid="gtadb-pin" data-landmark-id="${l.gtadbId}" title="${safeName}">
          <div class="diamond-dot ${l.isEnterable ? 'enterable' : ''}"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-gtadb-marker',
        html: iconHtml,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([l.inGameCoordinates.y, l.inGameCoordinates.x], {
        icon: customIcon,
        zIndexOffset: isSelected ? 800 : 100,
      });

      marker.bindTooltip(
        `
        <div class="p-2 bg-[#111114] text-[#F4F0E8] border border-cyan-500/40 rounded-xs font-mono text-xs shadow-xl space-y-1">
          <div class="flex items-center gap-1.5 text-[9px] text-cyan-400 font-bold uppercase">
            <span>[GTADB REFERENCE ${l.gtadbId}]</span>
            <span>• ${l.category}</span>
          </div>
          <div class="font-display text-xs text-[#F4F0E8]">${safeName}</div>
          ${l.realWorldName ? `<div class="text-[10px] text-[#9B969F]">RL: ${l.realWorldName.replace(/"/g, '&quot;')}</div>` : ''}
          <div class="text-[9px] text-[#9B969F]">X: ${l.inGameCoordinates.x.toFixed(0)}, Y: ${l.inGameCoordinates.y.toFixed(0)}</div>
        </div>
      `,
        { direction: 'top', offset: [0, -10], opacity: 0.95, className: 'vicepulse-leaflet-tooltip' }
      );

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onSelectLandmark) onSelectLandmark(l);
        onSelectDiscovery(null);
      });

      gtadbLayerRef.current?.addLayer(marker);
      landmarkMarkersRef.current.set(l.gtadbId, marker);
    });
  }, [gtadbLandmarks, showGtadb, selectedLandmark, onSelectLandmark, onSelectDiscovery]);

  // Center on selected discovery smoothly
  useEffect(() => {
    if (!mapRef.current || !selectedDiscovery) return;
    const inGame = discoveryToInGame(selectedDiscovery.coordinates.lng, selectedDiscovery.coordinates.lat);
    mapRef.current.panTo([inGame.y, inGame.x], {
      animate: true,
      duration: 0.8,
    });
  }, [selectedDiscovery]);

  // Center on selected GTADB landmark smoothly
  useEffect(() => {
    if (!mapRef.current || !selectedLandmark?.inGameCoordinates) return;
    mapRef.current.panTo([selectedLandmark.inGameCoordinates.y, selectedLandmark.inGameCoordinates.x], {
      animate: true,
      duration: 0.8,
    });
  }, [selectedLandmark]);

  // Zoom controls
  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleResetView = () => {
    mapRef.current?.flyTo([1000, -2200], 1.2, {
      duration: 1.0,
    });
  };

  const toggleFullscreen = () => {
    const el = mapContainerRef.current?.parentElement;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.warn);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.warn);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#111114] overflow-hidden select-none">
      
      {/* 1. ACTUAL LEAFLET MAP CANVAS */}
      <div
        ref={mapContainerRef}
        data-testid="TacticalMapCanvas"
        className="w-full h-full bg-[#111114] cursor-grab active:cursor-grabbing"
        style={{
          backgroundColor: '#111114',
          backgroundImage: 'radial-gradient(circle at center, #1b3542 0%, #111114 100%)',
        }}
      />

      {/* 2. TOP RIGHT FLOATING CONTROLS (Zoom, Reset, Fullscreen, Layers) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        
        {/* Layer Toggles & Reference Landmarks Switch */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLayerMenuOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xs border text-xs font-mono font-bold uppercase shadow-2xl transition-all ${
              showGtadb
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 hover:bg-cyan-900/80'
                : 'bg-[#1C1B20]/95 text-[#F4F0E8] border-[#28272F] hover:border-orange hover:text-orange'
            }`}
            title="Toggle Map Layers"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">LAYERS</span>
            {showGtadb && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
          </button>

          {/* Layer Options Dropdown Menu */}
          {layerMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#1C1B20]/95 backdrop-blur-md border border-[#28272F] rounded-xs shadow-2xl p-3 space-y-3 z-30 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#28272F]">
                <span className="text-[11px] uppercase tracking-wider text-[#9B969F] font-bold">
                  TACTICAL LAYERS
                </span>
                <span className="text-[10px] text-teal">GTA VI COMMUNITY</span>
              </div>

              {/* Primary Layer: VicePulse Discoveries */}
              <div className="flex items-center justify-between p-2 rounded-xs bg-[#111114] border border-orange/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange"></span>
                  <div className="space-y-0.5">
                    <span className="text-[#F4F0E8] font-bold">VicePulse Discoveries</span>
                    <span className="block text-[10px] text-[#9B969F]">Primary verified evidence</span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 bg-orange/20 text-orange text-[10px] font-bold rounded-xs">
                  {discoveries.length}
                </span>
              </div>

              {/* Secondary Reference Layer: GTADB Landmarks */}
              <label className="flex items-start justify-between p-2 rounded-xs bg-[#111114] border border-[#28272F] hover:border-cyan-500/50 cursor-pointer transition-colors">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={showGtadb}
                    onChange={(e) => handleToggleGtadb(e.target.checked)}
                    className="mt-1 rounded-xs border-[#28272F] text-cyan-500 focus:ring-0 bg-[#1C1B20] cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-300 font-bold">GTADB Landmarks</span>
                      <span className="text-[9px] px-1 py-0.2 bg-cyan-950 text-cyan-400 rounded-xs border border-cyan-800">
                        REF
                      </span>
                    </div>
                    <span className="block text-[10px] text-[#9B969F] leading-snug">
                      Community GTA VI mapping project (3,754 reference locations)
                    </span>
                    {loadingLandmarks && (
                      <span className="block text-[9px] text-cyan-400 animate-pulse">
                        Loading GTADB points...
                      </span>
                    )}
                  </div>
                </div>
              </label>

              <div className="pt-1 text-[9px] text-[#9B969F]/80 leading-relaxed border-t border-[#28272F]">
                Tiles & landmarks licensed under{' '}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
                >
                  CC BY 4.0
                </a>
                .
              </div>
            </div>
          )}
        </div>

        {/* Action Controls Group: Zoom In, Zoom Out, Reset, Fullscreen */}
        <div className="flex flex-col bg-[#1C1B20]/95 backdrop-blur-md border border-[#28272F] rounded-xs shadow-2xl divide-y divide-[#28272F]">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2.5 text-[#F4F0E8] hover:text-orange hover:bg-[#111114] transition-colors"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2.5 text-[#F4F0E8] hover:text-orange hover:bg-[#111114] transition-colors"
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="p-2.5 text-[#F4F0E8] hover:text-orange hover:bg-[#111114] transition-colors"
            title="Reset View"
            aria-label="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 text-[#F4F0E8] hover:text-orange hover:bg-[#111114] transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. BOTTOM LEFT TELEMETRY HUD & ATTRIBUTION BADGE */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col sm:flex-row items-start sm:items-center gap-3 pointer-events-auto">
        
        {/* Live Cursor Telemetry HUD */}
        {cursorTelemetry && (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xs bg-[#1C1B20]/90 backdrop-blur-md border border-[#28272F] font-mono text-[11px] text-[#F4F0E8] shadow-xl">
            <Radio className="w-3.5 h-3.5 text-orange animate-pulse" />
            <span>GRID: <strong className="text-orange">{cursorTelemetry.grid}</strong></span>
            <span className="text-[#9B969F]">•</span>
            <span>X: <strong className="text-teal">{cursorTelemetry.x}m</strong></span>
            <span>Y: <strong className="text-teal">{cursorTelemetry.y}m</strong></span>
            <span className="text-[#9B969F]">•</span>
            <span>ZOOM: <strong className="text-[#F4F0E8]">{currentZoom.toFixed(1)}x</strong></span>
          </div>
        )}

        {/* Legal Attribution Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#1C1B20]/90 backdrop-blur-md border border-[#28272F] font-mono text-[10px] text-[#9B969F] shadow-xl">
          <span>Map Tiles & Data:</span>
          <a
            href="https://map.gtadb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-0.5"
          >
            <span>GTADB (CC BY 4.0)</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <span className="text-[#9B969F]/60">|</span>
          <span>MIT Engine</span>
        </div>
      </div>

      {/* Global CSS for Custom Markers */}
      <style jsx global>{`
        /* Leaflet Container Styling */
        .leaflet-container {
          background-color: #111114 !important;
          font-family: inherit;
        }

        .custom-leaflet-marker,
        .custom-gtadb-marker {
          background: transparent !important;
          border: none !important;
          cursor: pointer !important;
          pointer-events: auto !important;
        }

        /* VicePulse Primary Markers */
        .vicepulse-pin {
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transform-origin: center center;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .vicepulse-pin:hover {
          transform: scale(1.25);
          z-index: 1000 !important;
        }
        .vicepulse-pin.selected {
          transform: scale(1.35);
          z-index: 1001 !important;
        }
        .vicepulse-pin .pulse-ring {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background-color: var(--marker-color, #FF8247);
          opacity: 0.35;
          animation: markerPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .vicepulse-pin .pin-core {
          position: relative;
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          background-color: #111114;
          border: 2px solid var(--marker-color, #FF8247);
          box-shadow: 0 0 10px var(--marker-color, #FF8247), 0 4px 6px rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vicepulse-pin .category-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
        }
        .vicepulse-pin .pin-badge {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: #111114;
          color: #F4F0E8;
          border: 1px solid #28272F;
          font-size: 8px;
          padding: 1px 4px;
          border-radius: 2px;
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.6);
        }

        /* GTADB Secondary Reference Markers */
        .gtadb-reference-pin {
          position: relative;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transform-origin: center center;
          transition: transform 0.15s ease;
        }
        .gtadb-reference-pin:hover {
          transform: scale(1.5);
          z-index: 900 !important;
        }
        .gtadb-reference-pin.selected {
          transform: scale(1.75);
          z-index: 901 !important;
        }
        .gtadb-reference-pin .diamond-dot {
          width: 8px;
          height: 8px;
          transform: rotate(45deg);
          background-color: #38BDF8;
          border: 1.5px solid #111114;
          box-shadow: 0 0 6px rgba(56, 189, 248, 0.85);
          pointer-events: auto;
        }
        .gtadb-reference-pin .diamond-dot.enterable {
          background-color: #A855F7;
          box-shadow: 0 0 6px rgba(168, 85, 247, 0.85);
        }

        @keyframes markerPing {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        /* Leaflet Tooltip Custom Styling */
        .vicepulse-leaflet-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .vicepulse-leaflet-tooltip::before {
          display: none !important;
        }
      `}</style>
    </div>
  );
};
