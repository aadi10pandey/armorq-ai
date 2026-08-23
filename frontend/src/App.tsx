import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { Onboarding } from './pages/Onboarding';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { Overview } from './pages/Overview';
import { LiveExecution } from './pages/LiveExecution';
import { AgentsList } from './pages/AgentsList';
import { TasksPage } from './pages/TasksPage';
import { ApprovalCenter } from './pages/ApprovalCenter';
import { AuthorizationScope } from './pages/AuthorizationScope';
import { ToolCenter } from './pages/ToolCenter';
import { AuditTrail } from './pages/AuditTrail';
import { TechnicalDetails } from './pages/TechnicalDetails';
import { DemoCenter } from './pages/DemoCenter';
import { api } from './services/api';
import { SystemMetrics, ApprovalRequest, AuditEvent, ToolInfo } from './types';

const WorkspaceApp: React.FC = () => {
  const { isAuthenticated, isLoading, isOnboarding, setIsOnboarding } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [tools, setTools] = useState<ToolInfo[]>([]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-cyber-cyan font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
          <span>AUTHENTICATING SECURE WORKSPACE...</span>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated Route
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // 2. Onboarding Experience for First-Time Users
  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between selection:bg-cyber-cyan selection:text-black">
        <Header onNavigateToLive={() => setActiveTab('live-execution')} />
        <Onboarding onComplete={() => setIsOnboarding(false)} />
        <footer className="border-t border-white/10 glass-panel py-4 px-6 text-center text-xs text-slate-400">
          SENTINEL AI — "Autonomy with a Boundary"
        </footer>
      </div>
    );
  }

  // 3. Authenticated Enterprise Workspace
  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-100 selection:bg-cyber-cyan selection:text-black">
      
      {/* Top Header */}
      <Header
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
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

      {/* Footer */}
      <footer className="border-t border-white/10 glass-panel py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            SENTINEL AI — "Autonomy with a Boundary"
          </div>
          <div>
            Automate India Grand Finale // ArmorIQ Track (Problem 1)
          </div>
        </div>
      </footer>

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
