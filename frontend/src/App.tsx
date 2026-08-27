import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { Onboarding } from './pages/Onboarding';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { DemoPresentationBar } from './components/DemoPresentationBar';
import { ArchitecturePipeline } from './components/ArchitecturePipeline';
import { Overview } from './pages/Overview';
import { LiveExecution } from './pages/LiveExecution';
import { AttackLab } from './pages/AttackLab';
import { AgentsList } from './pages/AgentsList';
import { TasksPage } from './pages/TasksPage';
import { ApprovalCenter } from './pages/ApprovalCenter';
import { AuthorizationScope } from './pages/AuthorizationScope';
import { ToolCenter } from './pages/ToolCenter';
import { AuditTrail } from './pages/AuditTrail';
import { TechnicalDetails } from './pages/TechnicalDetails';
import { DemoCenter } from './pages/DemoCenter';
import { ParticleShieldCanvas } from './animations/ParticleShieldCanvas';
import { VibeCursor } from './components/VibeCursor';
import { CommandPalette } from './components/CommandPalette';
import { api } from './services/api';
import { SystemMetrics, ApprovalRequest, AuditEvent, ToolInfo } from './types';

const WorkspaceApp: React.FC = () => {
  const { isAuthenticated, isLoading, isOnboarding, setIsOnboarding } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [m, a, l, t] = await Promise.all([
        api.getMetrics().catch(() => null),
        api.getPendingApprovals().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getTools().catch(() => []),
      ]);

      if (m) setMetrics(m);
      setApprovals(a);
      setAuditLogs(l);
      setTools(t);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Global hotkey for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070B] flex items-center justify-center text-cyber-gold font-mono text-xs relative overflow-hidden">
        <div className="aurora-bg" />
        <ParticleShieldCanvas />
        <VibeCursor />
        <div className="flex items-center gap-3 relative z-10 p-6 rounded-3xl glass-panel-gold border border-cyber-gold/40 shadow-glow-gold">
          <div className="w-5 h-5 border-2 border-cyber-gold border-t-transparent rounded-full animate-spin" />
          <span className="font-bold tracking-wider uppercase">INITIALIZING SENTINEL CONTROL PLANE...</span>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated Route (Product Landing / Value Prop)
  if (!isAuthenticated) {
    return (
      <>
        <VibeCursor />
        <LandingPage />
      </>
    );
  }

  // 2. Onboarding Experience for First-Time Users
  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-[#05070B] flex flex-col justify-between selection:bg-cyber-gold selection:text-black relative overflow-hidden">
        <div className="aurora-bg" />
        <ParticleShieldCanvas />
        <VibeCursor />
        <Header onNavigateToLive={() => setActiveTab('live-execution')} />
        <Onboarding onComplete={() => setIsOnboarding(false)} />
        <footer className="border-t border-white/10 glass-panel py-4 px-6 text-center text-xs text-slate-400 relative z-10 font-mono">
          SENTINEL AI — "Autonomy with a Boundary"
        </footer>
      </div>
    );
  }

  // 3. Authenticated Enterprise Workspace
  return (
    <div className="min-h-screen flex flex-col bg-[#05070B] text-slate-100 selection:bg-cyber-gold selection:text-black relative overflow-hidden">
      
      {/* Vibe Ambient Aurora Mesh & Interactive Particles */}
      <div className="aurora-bg" />
      <ParticleShieldCanvas />
      
      {/* Interactive Cyber Cursor & Spotlight */}
      <VibeCursor />

      {/* Top Header */}
      <Header
        onNavigateToLive={() => setActiveTab('live-execution')}
        onRefreshData={loadData}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Judge Live Presentation Bar */}
      <DemoPresentationBar 
        onNavigateToLive={() => setActiveTab('live-execution')}
        onRefreshData={loadData}
      />

      {/* Navigation Tab Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingApprovalsCount={approvals.filter(a => a.status === 'PENDING').length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 relative z-10">
        {activeTab === 'overview' && (
          <Overview
            metrics={metrics}
            recentLogs={auditLogs}
            onNavigateToLive={() => setActiveTab('live-execution')}
            onNavigateToApprovals={() => setActiveTab('approvals')}
            onNavigateToAudit={() => setActiveTab('audit')}
          />
        )}

        {activeTab === 'live-execution' && (
          <LiveExecution onRefreshData={loadData} />
        )}

        {activeTab === 'how-it-works' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 cyber-grid">
              <h2 className="text-2xl font-bold text-white font-mono mb-2">
                System Architecture &amp; Lifecycle
              </h2>
              <p className="text-xs text-slate-400">
                Visual explanation of how natural language intent transitions through SHA-256 Merkle plans, signed CSRG-IAP tokens, and proxy verification gates.
              </p>
            </div>
            <ArchitecturePipeline />
          </div>
        )}

        {activeTab === 'attack-lab' && (
          <AttackLab />
        )}

        {activeTab === 'agents' && (
          <AgentsList />
        )}

        {activeTab === 'tasks' && (
          <TasksPage onNavigateToLive={() => setActiveTab('live-execution')} />
        )}

        {activeTab === 'approvals' && (
          <ApprovalCenter
            approvals={approvals}
            onRefresh={loadData}
            onNavigateToLive={() => setActiveTab('live-execution')}
          />
        )}

        {activeTab === 'authorization' && (
          <AuthorizationScope 
            onNavigateToTechnical={() => setActiveTab('technical')}
          />
        )}

        {activeTab === 'tools' && (
          <ToolCenter 
            tools={tools} 
            onNavigateToTechnical={() => setActiveTab('technical')}
          />
        )}

        {activeTab === 'audit' && (
          <AuditTrail logs={auditLogs} />
        )}

        {activeTab === 'technical' && (
          <TechnicalDetails metrics={metrics} />
        )}

        {activeTab === 'demo-center' && (
          <DemoCenter
            onNavigateToLive={() => setActiveTab('live-execution')}
            onNavigateToApprovals={() => setActiveTab('approvals')}
            onRefresh={loadData}
          />
        )}
      </main>

      {/* Clean Modern Footer */}
      <footer className="border-t border-white/10 glass-panel py-5 px-6 text-center text-xs text-slate-400 relative z-10 font-mono text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber-gold animate-ping" />
            SENTINEL AI // "Autonomy with a Boundary"
          </div>
          <div className="text-slate-500">
            Automate India Grand Finale · Powered by ArmorIQ Cryptographic Authorization
          </div>
        </div>
      </footer>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
        onRunSafeDemo={async () => {
          setActiveTab('live-execution');
          await api.runSafeDemo();
          loadData();
        }}
        onRunRiskyDemo={async () => {
          setActiveTab('live-execution');
          await api.runOutOfScopeDemo();
          loadData();
        }}
        onResetDemo={async () => {
          await api.resetDemo();
          loadData();
        }}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WorkspaceApp />
    </AuthProvider>
  );
};
