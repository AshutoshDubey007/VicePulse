'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  number: number;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  return (
    <nav aria-label="Progress Stepper" className={`w-full ${className}`}>
      <ol className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <li key={step.number} className="w-full">
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(step.number)}
                disabled={!onStepClick || (!isCompleted && !isActive)}
                className={`w-full p-2.5 sm:p-3 text-left border-2 font-mono transition-all flex flex-col justify-between min-h-[58px] ${
                  isActive
                    ? 'bg-orange text-ink border-ink shadow-[3px_3px_0px_#1A0B2E]'
                    : isCompleted
                    ? 'bg-teal text-ink border-ink shadow-[2px_2px_0px_#1A0B2E] cursor-pointer'
                    : 'bg-ink-card text-cream/50 border-ink/60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    STEP {step.number}
                  </span>
                  {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                </div>
                <span className="text-xs font-black uppercase tracking-wide truncate">
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
