'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ViceImage } from '@/components/vice/ViceImage';
import { Discovery, Comment } from '@/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { 
  MapPin, 
  Clock, 
  CloudRain, 
  ExternalLink, 
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Send,
  ChevronRight,
  Compass,
  FileText,
  Share2
} from 'lucide-react';

interface DiscoveryDetailClientProps {
  discovery: Discovery;
  comments: Comment[];
  similarDiscoveries: Discovery[];
}

export const DiscoveryDetailClient: React.FC<DiscoveryDetailClientProps> = ({
  discovery,
  comments: initialComments,
  similarDiscoveries,
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [confirmCount, setConfirmCount] = useState(discovery.confirmationsCount || 0);
  const [confirmed, setConfirmed] = useState(false);

  // Determine if location is known
  const hasValidLocation =
    discovery.coordinates &&
    typeof discovery.coordinates.lat === 'number' &&
    discovery.coordinates.lat !== 0 &&
    discovery.coordinates.inGameGrid !== 'LOCATION_PENDING';

  // Determine if environmental conditions are known
  const hasConditions = Boolean(
    (discovery.inGameTime && discovery.inGameTime !== 'Any time' && discovery.inGameTime !== 'Any') ||
    (discovery.weather && discovery.weather !== 'Any weather' && discovery.weather !== 'Any') ||
    (discovery.requirements && discovery.requirements.length > 0)
  );

  // Evidence images & video
  const images = discovery.evidenceImages || [];
  const primaryImage = images.length > 0 ? images[0].url : undefined;

  const handleConfirm = async () => {
    if (confirmed) return;
    try {
      const res = await fetch(`/api/discoveries/${discovery.id}/confirm`, { method: 'POST' });
      if (res.ok) {
        setConfirmed(true);
        setConfirmCount((c) => c + 1);
      }
    } catch (e) {
      console.warn('Confirm error:', e);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/discoveries/${discovery.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setComments([data.comment, ...comments]);
          setCommentText('');
        }
      }
    } catch (e) {
      console.warn('Comment error:', e);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 font-body text-[#F4F0E8] min-h-screen">
      
      {/* 1. BREADCRUMBS NAVIGATION (Section 1) */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-mono text-[#9B969F]">
        <Link href="/" className="hover:text-[#F4F0E8] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#9B969F]/60" />
        <Link href="/discoveries" className="hover:text-[#F4F0E8] transition-colors">
          Discoveries
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#9B969F]/60" />
        <Link
          href={`/discoveries/${discovery.category}`}
          className="hover:text-[#F4F0E8] uppercase transition-colors"
        >
          {discovery.category.replace('-', ' ')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#9B969F]/60" />
        <span className="text-[#F4F0E8] truncate max-w-[200px] sm:max-w-xs font-bold" aria-current="page">
          {discovery.title}
        </span>
      </nav>

      {/* 2. HEADER: Category, Verification Status, Title & Metadata */}
      <header className="space-y-4 border-b border-[#28272F] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/discoveries/${discovery.category}`}
            className="font-mono text-xs uppercase font-bold text-orange tracking-wider px-2 py-0.5 bg-[#1C1B20] border border-[#28272F] hover:border-orange rounded-xs transition-colors"
          >
            {discovery.category.replace('-', ' ')}
          </Link>
          <VerificationBadge status={discovery.verificationStatus} size="md" />
        </div>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#F4F0E8] leading-[0.98]">
          {discovery.title}
        </h1>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#9B969F]">
          {discovery.createdAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange" />
              <span>Updated {new Date(discovery.createdAt).toLocaleDateString()}</span>
            </span>
          )}

          {hasValidLocation ? (
            <Link
              href={`/map?lat=${discovery.coordinates.lat}&lng=${discovery.coordinates.lng}`}
              className="flex items-center gap-1.5 text-cream hover:text-orange transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-orange" />
              <span>{discovery.locationName} ({discovery.district})</span>
            </Link>
          ) : (
            <span className="text-[#9B969F]/70">Location not identified</span>
          )}

          <span className="text-teal font-bold">
            {confirmCount} Player Confirmations
          </span>
        </div>
      </header>

      {/* 3. PRIMARY EVIDENCE IMAGE */}
      {primaryImage && (
        <figure className="relative w-full h-72 sm:h-96 bg-[#111114] border border-[#28272F] rounded-sm overflow-hidden">
          <ViceImage
            src={primaryImage}
            alt={`${discovery.title} – GTA VI Evidence`}
            category={discovery.category}
            fill
            priority
            className="object-cover"
          />
          <figcaption className="sr-only">
            Evidence image representing {discovery.title} in GTA VI.
          </figcaption>
        </figure>
      )}

      {/* 4. AEO SECTION: What was discovered? (Overview) */}
      <section className="space-y-3">
        <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
          What Was Discovered?
        </h2>
        <div className="font-body text-sm sm:text-base text-[#F4F0E8]/90 leading-relaxed whitespace-pre-line bg-[#1C1B20]/60 border border-[#28272F]/60 p-4 rounded-sm">
          {discovery.description}
        </div>
      </section>

      {/* 5. AEO SECTION: Where is it located? */}
      <section className="space-y-3 border-t border-[#28272F] pt-6">
        <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
          Where Is It Located in Leonida?
        </h2>
        {hasValidLocation ? (
          <div className="p-4 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[#9B969F] block text-[10px] uppercase">Sector / District:</span>
                <span className="text-[#F4F0E8] font-bold text-sm">{discovery.district}</span>
              </div>
              <div>
                <span className="text-[#9B969F] block text-[10px] uppercase">Landmark:</span>
                <span className="text-[#F4F0E8] font-bold text-sm">{discovery.locationName}</span>
              </div>
              <div>
                <span className="text-[#9B969F] block text-[10px] uppercase">Tactical Grid Sector:</span>
                <span className="text-orange font-bold text-sm">
                  {discovery.coordinates?.inGameGrid || 'GRID'}
                </span>
              </div>
              <div>
                <span className="text-[#9B969F] block text-[10px] uppercase">Map Coordinates:</span>
                <span className="text-[#F4F0E8] text-sm">
                  {discovery.coordinates.lat.toFixed(4)}°N, {discovery.coordinates.lng.toFixed(4)}°W
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#28272F]">
              <Link
                href={`/map?lat=${discovery.coordinates.lat}&lng=${discovery.coordinates.lng}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange hover:bg-orange-hover text-[#111114] text-xs font-bold uppercase rounded-xs transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore on Interactive Tactical Map</span>
              </Link>
            </div>
          </div>
        ) : (
          <p className="font-mono text-xs text-[#9B969F] p-4 bg-[#1C1B20] border border-[#28272F] rounded-sm">
            Location coordinates are currently unconfirmed. Autonomous research scouts and community players are triangulating position markers.
          </p>
        )}
      </section>

      {/* 6. AEO SECTION: How do you find it? */}
      {discovery.stepsToFind && discovery.stepsToFind.length > 0 && (
        <section className="space-y-4 border-t border-[#28272F] pt-6">
          <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
            How Do You Find It?
          </h2>
          <ol className="space-y-2.5">
            {discovery.stepsToFind.map((step, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 bg-[#1C1B20] border border-[#28272F] rounded-sm text-xs sm:text-sm text-[#F4F0E8]/90 leading-relaxed"
              >
                <span className="font-mono font-bold text-orange shrink-0">
                  Step {idx + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 7. Conditions & Prerequisites */}
      {hasConditions && (
        <section className="space-y-3 border-t border-[#28272F] pt-6">
          <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
            Conditions & Timing Requirements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            {discovery.inGameTime && (
              <div className="p-3 bg-[#1C1B20] border border-[#28272F] rounded-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange" />
                <div>
                  <span className="text-[#9B969F] block text-[10px] uppercase">In-Game Time</span>
                  <span className="text-[#F4F0E8] font-bold">{discovery.inGameTime}</span>
                </div>
              </div>
            )}
            {discovery.weather && (
              <div className="p-3 bg-[#1C1B20] border border-[#28272F] rounded-sm flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-teal" />
                <div>
                  <span className="text-[#9B969F] block text-[10px] uppercase">Weather Condition</span>
                  <span className="text-[#F4F0E8] font-bold">{discovery.weather}</span>
                </div>
              </div>
            )}
            {discovery.requirements && discovery.requirements.length > 0 && (
              <div className="sm:col-span-2 p-3 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-1">
                <span className="text-[#9B969F] block text-[10px] uppercase">Prerequisites</span>
                <span className="text-[#F4F0E8]">{discovery.requirements.join(', ')}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 8. AEO SECTION: What evidence supports this discovery? */}
      <section className="space-y-3 border-t border-[#28272F] pt-6">
        <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
          What Evidence Supports This Discovery?
        </h2>
        <div className="p-4 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#9B969F]">Verification Status:</span>
            <VerificationBadge status={discovery.verificationStatus} size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#9B969F]">Primary Source Platform:</span>
            <span className="uppercase text-[#F4F0E8] font-bold">{discovery.source?.platform || 'Community Submission'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#9B969F]">Reported By:</span>
            <span className="text-[#F4F0E8] font-bold">{discovery.source?.author || 'Anonymous Scout'}</span>
          </div>
          {discovery.source?.url && (
            <div className="flex items-center justify-between pt-1 border-t border-[#28272F]">
              <span className="text-[#9B969F]">Source URL:</span>
              <a
                href={discovery.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-orange hover:underline font-bold"
              >
                <span>External Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
          <div className="pt-2 text-[11px] text-[#9B969F] leading-relaxed">
            Read our transparent <Link href="/methodology" className="text-orange hover:underline">Verification Methodology</Link> to understand how discoveries are validated.
          </div>
        </div>
      </section>

      {/* 9. CONFIRMATION BUTTON */}
      <section className="p-4 bg-[#1C1B20] border border-[#28272F] rounded-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-display text-lg uppercase text-[#F4F0E8]">
            Have You Verified This In-Game?
          </h3>
          <p className="font-body text-xs text-[#9B969F]">
            Community confirmations help validate report accuracy and elevate verification status.
          </p>
        </div>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={confirmed}
          className={`px-4 py-2 text-xs font-mono uppercase font-bold rounded-xs transition-colors flex items-center justify-center gap-2 ${
            confirmed
              ? 'bg-teal/20 text-teal border border-teal/40 cursor-default'
              : 'bg-orange hover:bg-orange-hover text-[#111114]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{confirmed ? 'Confirmed By You' : `Confirm Discovery (${confirmCount})`}</span>
        </button>
      </section>

      {/* 10. RELATED DISCOVERIES INTERNAL LINKING */}
      {similarDiscoveries && similarDiscoveries.length > 0 && (
        <section className="space-y-4 border-t border-[#28272F] pt-6">
          <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
            Related Discoveries in {discovery.district}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similarDiscoveries.map((sim) => (
              <Link
                key={sim.id || sim.slug}
                href={`/discoveries/${sim.slug || sim.id}`}
                className="p-3 bg-[#1C1B20] border border-[#28272F] hover:border-orange rounded-sm space-y-2 group transition-colors block"
              >
                <span className="font-mono text-[9px] uppercase font-bold text-orange">
                  {sim.category.replace('-', ' ')}
                </span>
                <h4 className="font-display text-sm text-[#F4F0E8] group-hover:text-orange line-clamp-2">
                  {sim.title}
                </h4>
                <div className="text-[10px] font-mono text-[#9B969F]">
                  {sim.district}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 11. COMMENTS / DISCUSSION */}
      <section className="space-y-4 border-t border-[#28272F] pt-6">
        <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
          Field Scout Notes ({comments.length})
        </h2>

        {/* Comment input form */}
        <form onSubmit={handleAddComment} className="space-y-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share additional location notes, landmark observations, or timing clues..."
            rows={3}
            className="w-full bg-[#1C1B20] border border-[#28272F] rounded-sm p-3 text-xs font-mono text-[#F4F0E8] placeholder-[#9B969F]/60 focus:outline-none focus:border-orange transition-colors"
          />
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="px-4 py-2 bg-[#1C1B20] border border-[#28272F] hover:border-orange text-orange font-mono text-xs uppercase font-bold rounded-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submittingComment ? 'Transmitting...' : 'Post Scout Note'}</span>
          </button>
        </form>

        {/* Comments list */}
        {comments.length > 0 && (
          <div className="space-y-3 pt-2">
            {comments.map((c) => (
              <div key={c.id} className="p-3 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#9B969F]">
                  <span className="text-[#F4F0E8] font-bold">{c.username || 'Anonymous Scout'}</span>
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="font-body text-xs text-[#F4F0E8]/90 leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>

    </article>
  );
};
