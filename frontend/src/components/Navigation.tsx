import React from 'react';
import { 
  Activity, 
  PlayCircle, 
  CheckSquare, 
  Wrench, 
  FileText, 
  Terminal, 
  Cpu, 
  ListOrdered,
  Skull,
  GitBranch
} from 'lucide-react';
import { sound } from '../utils/soundEngine';

export type NavTab = 
  | 'overview' 
  | 'live-execution'
  | 'how-it-works'
  | 'approvals' 
  | 'agents'
  | 'tasks'
  | 'audit' 
  | 'tools'
  | 'attack-lab'
  | 'authorization'
  | 'technical'
  | 'demo-center';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingApprovalsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  pendingApprovalsCount,
}) => {
  const tabs = [
    { id: 'overview' as NavTab, label: 'Overview', icon: Activity },
    { id: 'live-execution' as NavTab, label: 'Live Execution', icon: PlayCircle, badge: 'REALTIME' },
    { id: 'how-it-works' as NavTab, label: 'How It Works', icon: GitBranch, badge: 'PIPELINE' },
    { id: 'approvals' as NavTab, label: 'Approval Center', icon: CheckSquare, count: pendingApprovalsCount },
    { id: 'agents' as NavTab, label: 'Agent Fleet', icon: Cpu },
    { id: 'tasks' as NavTab, label: 'Tasks History', icon: ListOrdered },
    { id: 'audit' as NavTab, label: 'Cryptographic Audit', icon: FileText },
    { id: 'tools' as NavTab, label: 'Sandbox Tools', icon: Wrench },
    { id: 'attack-lab' as NavTab, label: 'Vector Lab', icon: Skull, dangerBadge: 'DEFENSE' },
    { id: 'technical' as NavTab, label: 'System Spec', icon: Terminal },
  ];

  const handleTabClick = (tabId: NavTab) => {
    onSelectTab(tabId);
    sound.playClick();
  };

  return (
    <div className="w-full border-b border-white/10 bg-surface/90 backdrop-blur-xl px-6 sticky top-[57px] z-40">
      <div className="flex items-center gap-1.5 max-w-7xl mx-auto overflow-x-auto py-2.5 no-scrollbar">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => handleTabClick(t.id)}
              onMouseEnter={() => sound.playHover()}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-cyber-gold/15 text-cyber-gold border border-cyber-gold/40 shadow-glow-gold/25 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${
                isActive 
                  ? 'text-cyber-gold' 
                  : t.dangerBadge 
                  ? 'text-cyber-crimson/80' 
                  : 'text-slate-400'
              }`} />
              <span>{t.label}</span>

              {t.badge && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-cyber-gold/20 text-cyber-gold border border-cyber-gold/30 font-mono">
                  {t.badge}
                </span>
              )}

              {t.dangerBadge && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-500/20 text-cyber-crimson border border-cyber-crimson/30 font-mono animate-pulse">
                  {t.dangerBadge}
                </span>
              )}

              {typeof t.count === 'number' && t.count > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyber-crimson text-white animate-pulse shadow-glow-crimson font-mono">
                  {t.count} HOLD
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
