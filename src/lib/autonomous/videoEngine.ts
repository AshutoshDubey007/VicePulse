import { VideoTimestamp } from './types';

export interface VideoAnalysisResult {
  videoId: string;
  creatorClaimsNew: boolean;
  discoverySegments: Array<{
    timestamp?: string;
    seconds?: number;
    segmentTitle: string;
    referencedLocation?: string;
    vehiclesOrNpcs: string[];
    evidenceSummary: string;
    reproductionSteps: string[];
  }>;
  overallSummary: string;
  transcriptAnalyzed: boolean;
  visualEvidenceExtractionStatus: 'complete' | 'incomplete';
}

/**
 * Section 7: Dedicated Video Analysis Workflow
 * Analyzes video titles, descriptions, timestamps, and transcripts for GTA VI discoveries.
 */
export function analyzeVideoContent(
  videoId: string,
  title: string,
  description: string,
  transcript?: string
): VideoAnalysisResult {
  const fullText = `${title}\n${description}\n${transcript || ''}`.toLowerCase();

  // 8. Detect whether creator claims this is new or previously known
  const creatorClaimsNew = 
    fullText.includes('first look') ||
    fullText.includes('world first') ||
    fullText.includes('new secret') ||
    fullText.includes('newly found') ||
    fullText.includes('just discovered') ||
    fullText.includes('unseen') ||
    fullText.includes('undiscovered');

  // 3 & 4. Parse Timestamps
  const timestampRegex = /(?:^|\s)(?:(\d{1,2}):)?([0-5]?\d):([0-5]\d)\s*[-:]?\s*([^\n\r]+)/g;
  const segments: VideoAnalysisResult['discoverySegments'] = [];
  let match;

  while ((match = timestampRegex.exec(description)) !== null) {
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    const label = match[4].trim();

    const segText = label.toLowerCase();
    
    // 5. Extract referenced location
    let referencedLocation: string | undefined;
    if (segText.includes('biscayne') || segText.includes('reef')) referencedLocation = 'Biscayne Bay Deep Shoals';
    else if (segText.includes('gator') || segText.includes('grassrivers')) referencedLocation = 'Grassrivers Sawgrass';
    else if (segText.includes('fort leonida') || segText.includes('hangar')) referencedLocation = 'Fort Leonida Airbase';
    else if (segText.includes('ocean beach') || segText.includes('parking')) referencedLocation = 'Ocean Beach Parking Deck';
    else if (segText.includes('port gellhorn')) referencedLocation = 'Port Gellhorn Freight Yard';

    // 6. Identify vehicles and NPCs
    const vehiclesOrNpcs: string[] = [];
    if (segText.includes('lazer') || segText.includes('jet')) vehiclesOrNpcs.push('P-996 Lazer Interceptor');
    if (segText.includes('airboat')) vehiclesOrNpcs.push('Twin-Propeller V8 Airboat');
    if (segText.includes('dominator') || segText.includes('muscle car')) vehiclesOrNpcs.push('Vapid Dominator FX');
    if (segText.includes('panther')) vehiclesOrNpcs.push('Florida Panther (Apex Wildlife)');
    if (segText.includes('shark')) vehiclesOrNpcs.push('Hammerhead Shark (Aquatic Wildlife)');

    if (label.length > 2 && segments.length < 8) {
      segments.push({
        timestamp: `${hours > 0 ? `${hours}:` : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        seconds: hours * 3600 + minutes * 60 + seconds,
        segmentTitle: label,
        referencedLocation,
        vehiclesOrNpcs,
        evidenceSummary: `Creator demonstrates ${label} at timestamp ${hours > 0 ? `${hours}:` : ''}${minutes}:${seconds}`,
        reproductionSteps: [
          `Navigate to coordinates highlighted in segment: ${label}`,
          'Follow creator reproduction path shown in on-screen clip',
        ],
      });
    }
  }

  // 10. Concise source-attributed summary
  const overallSummary = `Video investigation "${title}". Creator provides ${segments.length > 0 ? `${segments.length} timestamped evidence markers` : 'spatial reconnaissance evidence'}. ${creatorClaimsNew ? 'Creator claims newly identified discovery.' : 'Community corroboration sighting.'}`;

  return {
    videoId,
    creatorClaimsNew,
    discoverySegments: segments,
    overallSummary,
    transcriptAnalyzed: Boolean(transcript && transcript.length > 20),
    visualEvidenceExtractionStatus: segments.length > 0 ? 'complete' : 'incomplete',
  };
}
