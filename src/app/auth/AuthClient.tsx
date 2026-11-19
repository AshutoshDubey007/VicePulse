'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StripedSun } from '@/components/vice/StripedSun';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Check, 
  Github, 
  Sparkles, 
  User, 
  ShieldCheck 
} from 'lucide-react';

export const AuthClient: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-ink relative overflow-hidden font-body">
      
      {/* Background Graphic: Striped Sun & Palm Silhouette Overlays */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-30">
        <StripedSun size={600} />
      </div>

      {/* Main Auth Card: Cream Card with 3px Ink Border Over Striped Sun */}
      <div className="relative z-10 w-full max-w-md bg-cream text-ink border-3 border-ink shadow-[8px_8px_0px_#FF4FA0] p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="font-mono text-xs uppercase font-black px-2.5 py-1 bg-sun text-ink border-2 border-ink shadow-[2px_2px_0px_#1A0B2E] inline-block transform -rotate-2">
            LEONIDA WIRE TERMINAL
          </span>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-ink leading-none pt-1">
            {mode === 'signin' ? 'SCOUT SIGN IN' : 'ENLIST AS SCOUT'}
          </h1>
          <p className="font-body text-xs text-ink/80 max-w-xs mx-auto">
            {mode === 'signin'
              ? 'Access verified intelligence dossiers, saved map sectors, and subscriber alerts.'
              : 'Join 1,800+ independent field researchers tracking the secrets of Vice City.'}
          </p>
        </div>

        {/* Verification Success State */}
        {submitted ? (
          <div className="bg-ink text-cream p-6 border-2 border-ink text-center space-y-4 shadow-[4px_4px_0px_#19C7B8]">
            <div className="w-12 h-12 bg-teal text-ink border-2 border-ink flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[3px]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-2xl uppercase text-cream">VERIFICATION DISPATCHED</h3>
              <p className="font-body text-xs text-cream/80">
                A secure login link was transmitted to <strong className="text-sun">{email}</strong>. Check your inbox to confirm scout credentials.
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-mono uppercase text-orange hover:underline font-bold"
            >
              Use different email
            </button>
          </div>
        ) : (
          <>
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              {mode === 'signup' && (
                <div>
                  <label className="uppercase font-black text-ink block mb-1">
                    Callsign / Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/50 stroke-[2.5px]" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. LeonidaDrifter"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-cream border-2 border-ink text-ink placeholder-ink/40 font-bold focus:border-hot-pink outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="uppercase font-black text-ink block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/50 stroke-[2.5px]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="scout@vicepulse.net"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-cream border-2 border-ink text-ink placeholder-ink/40 font-bold focus:border-hot-pink outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="uppercase font-black text-ink block mb-1">
                  Security Passkey
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/50 stroke-[2.5px]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-cream border-2 border-ink text-ink placeholder-ink/40 font-bold focus:border-hot-pink outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-hot-pink hover:bg-hot-pink-hover text-ink font-mono text-xs uppercase font-black tracking-widest border-2 border-ink shadow-[3px_3px_0px_#1A0B2E] transition-all flex items-center justify-center gap-2"
              >
                <span>{mode === 'signin' ? 'ENTER THE WIRE' : 'ENLIST NEW RECON SCOUT'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
              </button>
            </form>

            {/* Social Logins */}
            <div className="space-y-3 pt-2 border-t-2 border-ink/20">
              <span className="text-[10px] uppercase font-black text-ink/60 text-center block">
                OR AUTHENTICATE WITH
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  className="p-2.5 bg-cream border-2 border-ink hover:bg-sun text-ink font-black uppercase flex items-center justify-center gap-2 shadow-[2px_2px_0px_#1A0B2E] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 stroke-[2.5px]" />
                  <span>Discord</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  className="p-2.5 bg-cream border-2 border-ink hover:bg-teal text-ink font-black uppercase flex items-center justify-center gap-2 shadow-[2px_2px_0px_#1A0B2E] transition-colors"
                >
                  <Github className="w-3.5 h-3.5 stroke-[2.5px]" />
                  <span>Reddit</span>
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-xs font-mono uppercase font-black text-orange hover:text-ink transition-colors"
              >
                {mode === 'signin' ? "Don't have an account? Enlist now" : 'Already have credentials? Sign in'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
