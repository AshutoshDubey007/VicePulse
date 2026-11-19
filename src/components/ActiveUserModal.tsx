'use client';

import React, { useState, useEffect } from 'react';
import { ViceImage } from '@/components/vice/ViceImage';
import { UserProfile } from '@/types';
import { Award, RefreshCw, X, Check } from 'lucide-react';

interface ActiveUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChanged?: (user: UserProfile) => void;
  currentUser?: UserProfile | null;
  onUserChange?: (user: UserProfile) => void;
}

export const ActiveUserModal: React.FC<ActiveUserModalProps> = ({ 
  isOpen, 
  onClose, 
  onUserChanged,
  currentUser: propUser,
  onUserChange 
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(propUser || null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propUser) setCurrentUser(propUser);
  }, [propUser]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setCurrentUser(data.user);
          if (data.availableUsers) setAvailableUsers(data.availableUsers);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const switchUser = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        if (onUserChanged) onUserChanged(data.user);
        if (onUserChange) onUserChange(data.user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-none animate-fadeIn font-body">
      <div className="bg-ink-card border-3 border-ink w-full max-w-md shadow-[6px_6px_0px_#1A0B2E] overflow-hidden relative text-cream">
        {/* Header bar */}
        <div className="bg-ink px-5 py-3.5 border-b-2 border-ink flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-orange" />
            <span className="font-display tracking-wider text-xl uppercase text-cream text-shadow-hard">
              SCOUT CREDENTIALS
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-cream/60 hover:text-cream p-1"
          >
            <X className="w-5 h-5 stroke-[2.5px]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {currentUser && (
            <div className="bg-ink border-2 border-ink p-4 relative shadow-[3px_3px_0px_#1A0B2E]">
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 shrink-0 border-2 border-orange overflow-hidden bg-ink shadow-[2px_2px_0px_#1A0B2E]">
                  <ViceImage
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    fallbackSrc="/images/avatars/scout-1.webp"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-2xl text-cream tracking-wide text-shadow-hard">
                      {currentUser.username}
                    </span>
                    <span className="font-mono text-[10px] uppercase font-black px-1.5 py-0.5 bg-orange text-ink border border-ink">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-cream/70 line-clamp-2 font-body">{currentUser.bio}</p>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-cream/90 pt-1 font-bold">
                    <span>REP: <strong className="text-orange">{currentUser.reputation}</strong></span>
                    <span>VERIFIED: <strong className="text-teal">{currentUser.verifiedCount}</strong></span>
                    <span>LOGS: <strong className="text-sun">{currentUser.contributionsCount}</strong></span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="mt-4 pt-3 border-t-2 border-ink-border">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cream/70 font-black block mb-2">
                  ACTIVE COMMENDATIONS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.badges?.map((badge) => (
                    <span
                      key={badge.id}
                      className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-ink border border-ink text-sun font-bold"
                      title={badge.description}
                    >
                      <Award className="w-3.5 h-3.5 text-orange stroke-[2.5px]" />
                      {badge.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Switch scout identity simulation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-orange flex items-center gap-1.5 font-black">
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5px]" />
                Switch Scout Identity:
              </label>
              <span className="text-[10px] font-mono text-teal font-extrabold">MULTI-ROLE TESTING</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {availableUsers.map((u) => {
                const isActive = currentUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => switchUser(u.id)}
                    disabled={loading || isActive}
                    className={`flex items-center justify-between p-2.5 text-left border-2 transition-all text-xs font-mono font-bold ${
                      isActive
                        ? 'bg-sun text-ink border-ink shadow-[2px_2px_0px_#1A0B2E]'
                        : 'bg-ink border-ink text-cream hover:bg-ink-border'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-7 h-7 overflow-hidden border border-ink">
                        <ViceImage src={u.avatar} alt={u.username} fallbackSrc="/images/avatars/scout-1.webp" fill className="object-cover" />
                      </div>
                      <div>
                        <div className="font-bold">{u.username}</div>
                        <div className="text-[10px] uppercase text-cream/70">Role: {u.role}</div>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="flex items-center gap-1 text-ink text-[10px] uppercase font-black">
                        <Check className="w-3.5 h-3.5 stroke-[3px]" /> ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] text-cream/60 uppercase hover:text-sun">
                        Switch →
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-ink p-3 border-2 border-ink text-[11px] font-mono text-cream/80">
            <p>
              [ROLE CLEARANCE NOTE]: Switch to <span className="text-orange font-bold">ViceAdmin_K (admin)</span> to access moderation powers in the Admin Verification Dashboard, or stay as <span className="text-teal font-bold">NeonTracker_99 (investigator)</span> for field scouting.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-ink px-6 py-3 border-t-2 border-ink flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono uppercase bg-orange hover:bg-orange-hover text-ink font-black border-2 border-ink shadow-[2px_2px_0px_#FF4FA0]"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
