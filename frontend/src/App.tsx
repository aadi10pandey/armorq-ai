import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { Overview } from './pages/Overview';
import { LiveExecution } from './pages/LiveExecution';
import { ApprovalCenter } from './pages/ApprovalCenter';
import { AuthorizationScope } from './pages/AuthorizationScope';
import { ToolCenter } from './pages/ToolCenter';
import { AuditTrail } from './pages/AuditTrail';
import { TechnicalDetails } from './pages/TechnicalDetails';
import { DemoCenter } from './pages/DemoCenter';
import { api } from './services/api';
import { SystemMetrics, ApprovalRequest, AuditEvent, ToolInfo } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [tools, setTools] = useState<ToolInfo[]>([]);

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [loadData]);

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
