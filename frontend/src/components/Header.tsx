import React from 'react';
import { Shield, Cpu, Lock, Layers, Play, AlertTriangle, RotateCcw } from 'lucide-react';
import { api } from '../services/api';

interface HeaderProps {
  onNavigateToLive: () => void;
  onRefreshData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateToLive, onRefreshData }) => {
  const [isRunningSafe, setIsRunningSafe] = React.useState(false);
  const [isRunningRisky, setIsRunningRisky] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  const handleRunSafe = async () => {
    try {
      setIsRunningSafe(true);
      onNavigateToLive();
      await api.runSafeDemo();
      onRefreshData?.();
    } catch (err) {
      console.error('Error running safe demo', err);
    } finally {
      setIsRunningSafe(false);
    }
  };

  const handleRunRisky = async () => {
    try {
      setIsRunningRisky(true);
      onNavigateToLive();
      await api.runOutOfScopeDemo();
      onRefreshData?.();
    } catch (err) {
      console.error('Error running out-of-scope demo', err);
    } finally {
      setIsRunningRisky(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await api.resetDemo();
      onRefreshData?.();
    } catch (err) {
      console.error('Error resetting demo', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 glass-panel bg-background/80 px-6 py-3.5 backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/40 shadow-glow-cyan">
            <Shield className="w-5 h-5 text-cyber-cyan animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider text-white font-mono">
                SENTINEL<span className="text-cyber-cyan">.AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-widest text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 rounded">
                ENTERPRISE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-tight">
              Autonomy with a Boundary.
            </p>
          </div>
        </div>

        {/* System Telemetry Badges */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated/80 border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              AGENT ONLINE
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated/80 border border-cyber-cyan/20 shadow-glow-cyan/50">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan"></span>
            </span>
            <span className="text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyber-cyan" />
              ARMORIQ PROTECTED
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated/80 border border-white/10">
            <Layers className="w-3.5 h-3.5 text-cyber-purple" />
            <span className="text-slate-300">4 TOOLS CONNECTED</span>
          </div>
        </div>

        {/* Quick Demo Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunSafe}
            disabled={isRunningSafe}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-black bg-cyber-cyan hover:bg-cyber-cyan/90 transition-all rounded-lg font-mono shadow-glow-cyan hover:shadow-cyan-500/50 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            {isRunningSafe ? 'EXECUTING...' : 'RUN SAFE DEMO (₹4,200)'}
          </button>

          <button
            onClick={handleRunRisky}
            disabled={isRunningRisky}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-cyber-crimson hover:bg-cyber-crimson/90 transition-all rounded-lg font-mono shadow-glow-crimson hover:shadow-rose-500/50 disabled:opacity-50"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {isRunningRisky ? 'TESTING...' : 'TRIGGER OUT-OF-SCOPE (₹15,000)'}
          </button>

          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Reset Environment to Initial State"
            className="p-2 text-slate-400 hover:text-white bg-surface-elevated hover:bg-surface-border border border-white/10 rounded-lg transition-all"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-cyber-cyan' : ''}`} />
          </button>
        </div>

      </div>
    </header>
  );
};
