import React from 'react';
import { 
  Activity, 
  PlayCircle, 
  CheckSquare, 
  ShieldCheck, 
  Wrench, 
  FileText, 
  Terminal,
  Sparkles 
} from 'lucide-react';

export type NavTab = 
  | 'overview' 
  | 'live-execution' 
  | 'approvals' 
  | 'authorization' 
  | 'tools' 
  | 'audit' 
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
    { id: 'live-execution' as NavTab, label: 'Live Execution', icon: PlayCircle, badge: 'HERO' },
    { id: 'approvals' as NavTab, label: 'Approvals', icon: CheckSquare, count: pendingApprovalsCount },
    { id: 'authorization' as NavTab, label: 'Authority Boundary', icon: ShieldCheck },
    { id: 'tools' as NavTab, label: 'Tools', icon: Wrench },
    { id: 'audit' as NavTab, label: 'Audit Trail', icon: FileText },
    { id: 'technical' as NavTab, label: 'Technical Details', icon: Terminal, judgeBadge: 'JUDGES' },
    { id: 'demo-center' as NavTab, label: 'Demo Guide', icon: Sparkles },
  ];

  return (
    <div className="w-full border-b border-white/10 bg-surface/60 backdrop-blur-md px-6">
      <div className="flex items-center gap-2 max-w-7xl mx-auto overflow-x-auto py-2.5 no-scrollbar">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 shadow-glow-cyan/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyber-cyan' : 'text-slate-400'}`} />
              <span>{t.label}</span>

              {t.badge && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30">
                  {t.badge}
                </span>
              )}

              {t.judgeBadge && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30">
                  {t.judgeBadge}
                </span>
              )}

              {typeof t.count === 'number' && t.count > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyber-crimson text-white animate-pulse shadow-glow-crimson">
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
