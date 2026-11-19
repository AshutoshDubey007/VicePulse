'use client';

import React, { useEffect, useState, useRef } from 'react';

interface StatCounterProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  accent?: 'orange' | 'pink' | 'teal' | 'sun';
  className?: string;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  value,
  label,
  prefix = '',
  suffix = '',
  accent = 'orange',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const steps = 18;
          const duration = 900;
          const stepTime = duration / steps;
          let currentStep = 0;

          const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            const currentVal = Math.round(value * progress);
            setDisplayValue(currentVal);

            if (currentStep >= steps) {
              clearInterval(timer);
              setDisplayValue(value);
            }
          }, stepTime);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  const accentColorMap = {
    orange: 'text-orange',
    pink: 'text-hot-pink',
    teal: 'text-teal',
    sun: 'text-sun',
  };

  const shadowMap = {
    orange: 'shadow-[3px_3px_0px_#FF7A3D]',
    pink: 'shadow-[3px_3px_0px_#FF4FA0]',
    teal: 'shadow-[3px_3px_0px_#19C7B8]',
    sun: 'shadow-[3px_3px_0px_#FFE066]',
  };

  return (
    <div
      ref={ref}
      className={`bg-ink-card border-3 border-ink p-4 sm:p-5 text-center ${shadowMap[accent]} ${className}`}
    >
      <div className={`font-mono text-3xl sm:text-5xl font-black ${accentColorMap[accent]} tracking-tight leading-none`}>
        {prefix}
        {displayValue.toLocaleString()}
        {suffix}
      </div>
      <div className="font-mono text-[10px] sm:text-xs text-cream/80 uppercase font-black tracking-widest mt-2 border-t-2 border-ink pt-1.5">
        {label}
      </div>
    </div>
  );
};
