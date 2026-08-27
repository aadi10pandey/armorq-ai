import React, { useState } from 'react';
import { Play, ShieldAlert, RotateCcw, Zap, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../utils/soundEngine';
import { triggerShockwave } from '../animations/ParticleShieldCanvas';

interface DemoPresentationBarProps {
  onNavigateToLive: () => void;
  onRefreshData: () => void;
}

export const DemoPresentationBar: React.FC<DemoPresentationBarProps> = ({
  onNavigateToLive,
  onRefreshData,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRunSafe = async () => {
    try {
      setIsRunning(true);
      setActiveStep(1);
      setStatusMessage('Executing Safe Autonomous Scenario (Priya Sharma · ₹4,200)...');
      sound.playClick();
      onNavigateToLive();
      await api.runSafeDemo();
      sound.playVerified();
      triggerShockwave('verified');
      setStatusMessage('Safe Autonomous Refund settled successfully within ₹5,000 ceiling.');
      onRefreshData();
    } catch (err) {
      console.error('Failed to run safe demo', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunOutOfScope = async () => {
    try {
      setIsRunning(true);
      setActiveStep(2);
      setStatusMessage('Executing Out-of-Scope Scenario (Rahul Verma · ₹15,000)...');
      sound.playClick();
      onNavigateToLive();
      await api.runOutOfScopeDemo();
      sound.playHoldAlert();
      triggerShockwave('danger');
      setStatusMessage('Cryptographic Boundary Reached! Action placed in HOLD pending Human Approval.');
      onRefreshData();
    } catch (err) {
      console.error('Failed to run risky demo', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsRunning(true);
      setActiveStep(null);
      setStatusMessage('Resetting demo sandbox & ledger...');
      sound.playClick();
      await api.resetDemo();
      setStatusMessage('Demo environment reset to fresh baseline.');
      onRefreshData();
    } catch (err) {
      console.error('Failed to reset demo', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full bg-[#0B0E17]/95 border-b border-cyber-gold/20 px-4 py-2.5 backdrop-blur-xl relative z-40 shadow-glow-gold/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left: Presentation Badge */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyber-gold/15 border border-cyber-gold/40 text-cyber-gold font-bold font-mono text-[10px] uppercase tracking-wider">
            <Zap className="w-3 h-3 fill-cyber-gold" />
            Judge Live Demo Bar
          </span>
          <span className="text-slate-300 font-medium hidden sm:inline text-[11px]">
            Execute verified real backend scenarios:
          </span>
        </div>

        {/* Middle: Scenario Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Step 1: Safe Autonomous Run */}
          <button
            onClick={handleRunSafe}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              activeStep === 1
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-glow-emerald'
                : 'bg-surface-elevated hover:bg-surface-charcoal border-white/10 hover:border-emerald-500/50 text-slate-200 hover:text-white'
            }`}
          >
            <Play className="w-3 h-3 fill-current text-emerald-400" />
            <span>1. Safe Refund (₹4,200)</span>
            <span className="text-[10px] opacity-75 font-mono">Autonomous</span>
          </button>

          {/* Step 2: Out-of-Scope Interception */}
          <button
            onClick={handleRunOutOfScope}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              activeStep === 2
                ? 'bg-cyber-crimson text-white border-rose-400 shadow-glow-crimson'
                : 'bg-surface-elevated hover:bg-surface-charcoal border-white/10 hover:border-rose-500/50 text-slate-200 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-cyber-crimson" />
            <span>2. Out-of-Scope (₹15,000)</span>
            <span className="text-[10px] opacity-75 font-mono">Triggers Hold</span>
          </button>

          {/* Step 3: Reset Sandbox */}
          <button
            onClick={handleReset}
            disabled={isRunning}
            title="Reset sandbox DB & ledger"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-charcoal border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-[11px] font-medium transition-all"
          >
            <RotateCcw className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>
        </div>

        {/* Right: Live Status String */}
        {statusMessage && (
          <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-mono truncate max-w-xs md:max-w-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyber-gold shrink-0" />
            <span className="truncate">{statusMessage}</span>
          </div>
        )}

      </div>
    </div>
  );
};
