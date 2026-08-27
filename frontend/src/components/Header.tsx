import React, { useState } from 'react';
import { 
  Shield, 
  Cpu, 
  Lock, 
  Layers, 
  Play, 
  AlertTriangle, 
  RotateCcw, 
  LogOut, 
  Volume2, 
  VolumeX, 
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { sound } from '../utils/soundEngine';
import { triggerShockwave } from '../animations/ParticleShieldCanvas';

interface HeaderProps {
  onNavigateToLive: () => void;
  onRefreshData?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onNavigateToLive, 
  onRefreshData,
  onOpenCommandPalette 
}) => {
  const { user, logout, activeAgent } = useAuth();
  const [isRunningSafe, setIsRunningSafe] = useState(false);
  const [isRunningRisky, setIsRunningRisky] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(sound.getSoundEnabled());

  const handleToggleSound = () => {
    const next = sound.toggleSound();
    setSoundEnabled(next);
  };

  const handleRunSafe = async () => {
    try {
      setIsRunningSafe(true);
      sound.playClick();
      onNavigateToLive();
      await api.runSafeDemo();
      sound.playVerified();
      triggerShockwave('verified');
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
      sound.playClick();
      onNavigateToLive();
      await api.runOutOfScopeDemo();
      sound.playHoldAlert();
      triggerShockwave('danger');
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
      sound.playClick();
      await api.resetDemo();
      sound.playVerified();
      triggerShockwave('default');
      onRefreshData?.();
    } catch (err) {
      console.error('Error resetting demo', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 glass-panel bg-[#05070B]/90 px-6 py-3 backdrop-blur-2xl">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        
        {/* Brand with Gold Shield */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-cyber-gold/15 border border-cyber-gold/40 shadow-glow-gold/25">
            <Shield className="w-5 h-5 text-cyber-gold" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyber-gold animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider text-white font-mono">
                SENTINEL <span className="text-cyber-gold">AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest text-cyber-gold bg-cyber-gold/10 border border-cyber-gold/30 rounded font-mono uppercase">
                CONTROL PLANE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-tight">
              Autonomy with a Boundary.
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2.5 text-xs">
          
          {/* Agent Status */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-white/10 shadow-sm">
            <div className="flex items-end gap-1 h-3.5">
              <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-full" />
              <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_1.2s_ease-in-out_infinite] h-2" />
              <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-3" />
            </div>
            <span className="text-slate-200 font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              {activeAgent?.name || 'Refund Operations Agent'}
            </span>
          </div>

          {/* Protection Boundary Status */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-cyber-gold/30 shadow-glow-gold/15">
            <Lock className="w-3.5 h-3.5 text-cyber-gold" />
            <span className="text-slate-200 font-medium font-sans">
              Ceiling: <strong className="text-cyber-gold font-mono">≤ ₹{(activeAgent?.maxRefundLimit || 5000).toLocaleString('en-IN')}</strong>
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-white/10">
            <Layers className="w-3.5 h-3.5 text-cyber-gold" />
            <span className="text-slate-300 font-medium">4 MCP Tools Connected</span>
          </div>
        </div>

        {/* Quick Controls */}
        <div className="flex items-center gap-2">
          
          {/* Command Palette Trigger */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              title="Open Command Palette (Ctrl+K)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-surface-elevated hover:bg-surface-border border border-white/10 rounded-xl transition-all font-mono shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-cyber-gold" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="px-1.5 py-0.2 text-[9px] bg-white/10 rounded border border-white/15">
                Ctrl+K
              </kbd>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-cyber-gold/15 border-cyber-gold/40 text-cyber-gold shadow-glow-gold/20'
                : 'bg-surface-elevated border-white/10 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Quick Demo Triggers */}
          <button
            onClick={handleRunSafe}
            disabled={isRunningSafe}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-black bg-cyber-gold hover:bg-cyber-yellow transition-all rounded-xl shadow-glow-gold disabled:opacity-50 tracking-wider uppercase"
          >
            <Play className="w-3 h-3 fill-black" />
            {isRunningSafe ? 'Running...' : 'Safe Run'}
          </button>

          <button
            onClick={handleRunRisky}
            disabled={isRunningRisky}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-white bg-cyber-crimson hover:bg-cyber-crimson/90 transition-all rounded-xl shadow-glow-crimson disabled:opacity-50 tracking-wider uppercase"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {isRunningRisky ? 'Testing...' : 'Hold Test'}
          </button>

          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Reset Environment"
            className="p-2 text-slate-400 hover:text-white bg-surface-elevated hover:bg-surface-border border border-white/10 rounded-xl transition-all"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-cyber-gold' : ''}`} />
          </button>

          {/* User Account & Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="hidden 2xl:block text-right text-xs">
                <div className="font-bold text-white truncate max-w-[120px]">{user.name}</div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.organization}</div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  logout();
                }}
                title="Log Out"
                className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-400 hover:text-rose-400 border border-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
