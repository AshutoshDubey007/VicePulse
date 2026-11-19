import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'VicePulse — GTA VI Intelligence Network';
    const category = searchParams.get('category') || 'DISCOVERY';
    const badge = searchParams.get('badge') || 'VERIFIED INTEL';

    // Category accent colors
    const colors: Record<string, string> = {
      'hidden-location': '#FF8247',
      'rare-vehicle': '#FF4FA0',
      'easter-egg': '#FFE066',
      'encounter': '#19C7B8',
      'unusual-event': '#FF6384',
      'wildlife': '#10B981',
      news: '#FF8247',
    };

    const accentColor = colors[category] || '#FF8247';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#111114',
            padding: '60px 80px',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Background Grid Pattern Accent */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '8px',
              backgroundColor: accentColor,
            }}
          />

          {/* Top Brand Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span
                style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  letterSpacing: '-1px',
                  color: '#F4F0E8',
                }}
              >
                VICEPULSE
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  color: '#9B969F',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                }}
              >
                // GTA VI INTEL
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: `${accentColor}20`,
                border: `1.5px solid ${accentColor}`,
                padding: '6px 16px',
                borderRadius: '4px',
                fontSize: '13px',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: accentColor,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {badge}
            </div>
          </div>

          {/* Center Title & Category Tag */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxWidth: '980px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: accentColor,
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: accentColor,
                }}
              />
              {category.replace('-', ' ')}
            </div>

            <h1
              style={{
                fontSize: title.length > 60 ? '48px' : '58px',
                fontWeight: 900,
                lineHeight: 1.15,
                color: '#F4F0E8',
                letterSpacing: '-0.5px',
                margin: 0,
              }}
            >
              {title}
            </h1>
          </div>

          {/* Bottom Telemetry Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #28272F',
              paddingTop: '24px',
              width: '100%',
              fontSize: '13px',
              fontFamily: 'monospace',
              color: '#9B969F',
            }}
          >
            <div>AUTONOMOUS CARTOGRAPHY & RESEARCH UNIT // LEONIDA</div>
            <div>VICEPULSE.NET</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate OG image: ${e.message}`, { status: 500 });
  }
}
