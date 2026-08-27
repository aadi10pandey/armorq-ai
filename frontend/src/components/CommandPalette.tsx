import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Play, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Terminal, 
  RotateCcw, 
  ArrowRight,
  Activity,
  PlayCircle,
  CheckSquare,
  ShieldCheck,
  Wrench,
  FileText,
  Sparkles,
  Skull
} from 'lucide-react';
import { NavTab } from './Navigation';
import { sound } from '../utils/soundEngine';

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Actions' | 'Settings';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  badge?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  onRunSafeDemo: () => void;
  onRunRiskyDemo: () => void;
  onResetDemo: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onRunSafeDemo,
  onRunRiskyDemo,
  onResetDemo,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(sound.getSoundEnabled());
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      sound.playClick();
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    // Actions
    {
      id: 'action-safe',
      category: 'Actions',
      title: 'Execute Safe Workflow (₹4,200)',
      subtitle: 'Runs standard task within authorized boundary',
      icon: Play,
      action: () => { onRunSafeDemo(); onClose(); },
      badge: 'SAFE'
    },
    {
      id: 'action-risky',
      category: 'Actions',
      title: 'Trigger Out-of-Scope Action (₹15,000)',
      subtitle: 'Demonstrates real-time proxy interception into HOLD',
      icon: ShieldAlert,
      action: () => { onRunRiskyDemo(); onClose(); },
      badge: 'HOLD'
    },
    {
      id: 'action-attack',
      category: 'Actions',
      title: 'Open Security Sandbox Lab',
      subtitle: 'Simulate prompt injections and boundary bypass attempts',
      icon: Skull,
      action: () => { onNavigate('attack-lab' as NavTab); onClose(); },
      badge: 'SIMULATOR'
    },
    {
      id: 'action-reset',
      category: 'Actions',
      title: 'Reset Environment',
      subtitle: 'Restore clean sandbox state and clear holds',
      icon: RotateCcw,
      action: () => { onResetDemo(); onClose(); }
    },
    {
      id: 'action-sound',
      category: 'Settings',
      title: soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects',
      subtitle: 'Toggle tactile UI audio synthesizer',
      icon: soundEnabled ? VolumeX : Volume2,
      action: () => {
        const next = sound.toggleSound();
        setSoundEnabled(next);
      }
    },

    // Navigation
    {
      id: 'nav-overview',
      category: 'Navigation',
      title: 'Dashboard',
      subtitle: 'System overview and live telemetry',
      icon: Activity,
      action: () => { onNavigate('overview'); onClose(); }
    },
    {
      id: 'nav-live',
      category: 'Navigation',
      title: 'Live Execution Monitor',
      subtitle: 'Real-time agent stream and Merkle tree visualizer',
      icon: PlayCircle,
      action: () => { onNavigate('live-execution'); onClose(); },
      badge: 'LIVE'
    },
    {
      id: 'nav-approvals',
      category: 'Navigation',
      title: 'Approval Center',
      subtitle: 'Review and decide on intercepted tasks',
      icon: CheckSquare,
      action: () => { onNavigate('approvals'); onClose(); }
    },
    {
      id: 'nav-scope',
      category: 'Navigation',
      title: 'Authority Scope',
      subtitle: 'Inspect authorized vs restricted agent capabilities',
      icon: ShieldCheck,
      action: () => { onNavigate('authorization'); onClose(); }
    },
    {
      id: 'nav-tools',
      category: 'Navigation',
      title: 'Connected Tools Registry',
      subtitle: 'Inspect sandboxed databases and payment tools',
      icon: Wrench,
      action: () => { onNavigate('tools'); onClose(); }
    },
    {
      id: 'nav-audit',
      category: 'Navigation',
      title: 'Immutable Audit Ledger',
      subtitle: 'Search cryptographically signed event records',
      icon: FileText,
      action: () => { onNavigate('audit'); onClose(); }
    },
    {
      id: 'nav-tech',
      category: 'Navigation',
      title: 'Architecture & Cryptography',
      subtitle: 'ArmorIQ protocol specifications and Merkle engine',
      icon: Terminal,
      action: () => { onNavigate('technical'); onClose(); }
    },
    {
      id: 'nav-demo',
      category: 'Navigation',
      title: 'Interactive Tour',
      subtitle: 'Step-by-step product walkthrough',
      icon: Sparkles,
      action: () => { onNavigate('demo-center'); onClose(); }
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const term = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(term) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(term)) ||
      cmd.category.toLowerCase().includes(term)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      sound.playHover();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      sound.playHover();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md">
          <div className="fixed inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            className="w-full max-w-2xl glass-panel p-4 rounded-3xl border border-cyber-cyan/40 shadow-glow-cyan/20 space-y-4 relative z-10 text-xs"
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center border-b border-white/10 pb-3">
              <Search className="w-5 h-5 text-cyber-cyan ml-2 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search pages... (e.g. 'Security Sandbox', 'Audit', 'Live Execution')"
                className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono">
                ESC
              </span>
            </div>

            {/* Command List */}
            <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
              {filteredCommands.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  No commands matching "{query}"
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  const isSelected = selectedIndex === idx;

                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all text-left ${
                        isSelected
                          ? 'glass-panel-glow border-cyber-cyan/50 bg-surface-elevated text-white'
                          : 'bg-surface/40 border border-transparent text-slate-300 hover:bg-surface-elevated/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${
                          isSelected ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/40' : 'bg-white/5 text-slate-400 border-white/10'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-white flex items-center gap-2">
                            {cmd.title}
                            {cmd.badge && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 font-mono">
                                {cmd.badge}
                              </span>
                            )}
                          </div>
                          {cmd.subtitle && (
                            <div className="text-[10px] text-slate-400">
                              {cmd.subtitle}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono uppercase">
                          {cmd.category}
                        </span>
                        <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyber-cyan' : 'text-slate-600'}`} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Hotkey Legend */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-500 font-mono">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <span className="text-cyber-cyan font-bold">Sentinel Control Center</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
