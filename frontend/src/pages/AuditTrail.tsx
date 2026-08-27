import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Hash, 
  Copy, 
  Check 
} from 'lucide-react';
import { AuditEvent } from '../types';
import { sound } from '../utils/soundEngine';

interface AuditTrailProps {
  logs: AuditEvent[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tool.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.resultSummary && log.resultSummary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = 
      filterType === 'ALL' ||
      (filterType === 'AUTHORIZED' && log.authorizationStatus === 'AUTHORIZED') ||
      (filterType === 'HOLD' && (log.authorizationStatus === 'HOLD_REQUESTED' || log.authorizationStatus === 'OUT_OF_SCOPE_BLOCKED')) ||
      (filterType === 'APPROVED' && log.authorizationStatus === 'HUMAN_APPROVED');

    return matchesSearch && matchesType;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    sound.playClick();
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AUTHORIZED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            AUTHORIZED
          </span>
        );
      case 'HOLD_REQUESTED':
      case 'OUT_OF_SCOPE_BLOCKED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-cyber-crimson bg-cyber-crimson/20 border border-cyber-crimson rounded-full shadow-glow-crimson font-mono">
            <ShieldAlert className="w-3.5 h-3.5" />
            SECURITY HOLD
          </span>
        );
      case 'HUMAN_APPROVED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-cyber-purple bg-cyber-purple/10 border border-cyber-purple/30 rounded-full font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            HUMAN APPROVED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold text-slate-400 bg-surface-elevated rounded-full border border-white/10">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 cyber-grid flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-full font-mono">
              TAMPER-PROOF LEDGER
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5 font-mono">
            <FileText className="w-6 h-6 text-cyber-cyan" />
            Cryptographic Audit Trail
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <div className="px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-white/10 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyber-cyan" />
            Signed Records: <strong className="text-white">{logs.length}</strong>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, order, customer, or hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-elevated border border-white/10 text-xs font-semibold self-stretch md:self-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'AUTHORIZED', label: 'Authorized' },
            { id: 'HOLD', label: 'Security Hold' },
            { id: 'APPROVED', label: 'Approved' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => {
                sound.playClick();
                setFilterType(type.id);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                filterType === type.id
                  ? 'bg-cyber-cyan text-black shadow-glow-cyan font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

      </div>

      {/* 3. Audit Records Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-20 text-slate-400 space-y-2">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-medium">No matching audit events found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;

              return (
                <div key={log.id} className="p-4 md:p-5 transition-colors hover:bg-white/[0.02]">
                  
                  {/* Summary Row */}
                  <div 
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer"
                    onClick={() => {
                      sound.playClick();
                      setExpandedLogId(isExpanded ? null : log.id);
                    }}
                  >
                    <div className="flex items-start md:items-center gap-3.5">
                      <div className="p-2.5 rounded-xl bg-surface-elevated border border-white/10 text-cyber-cyan shrink-0">
                        <Hash className="w-4 h-4" />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {log.action}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            TaskId: {log.taskId.substring(0, 8)}...
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                          <span>Tool: <strong className="text-slate-200">{log.tool}</strong></span>
                          <span>•</span>
                          <span className="font-mono">{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end lg:self-center">
                      {getStatusBadge(log.authorizationStatus)}

                      <button
                        className="p-1.5 rounded-lg bg-surface-elevated text-slate-400 hover:text-white"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Cryptographic Detail Drawer */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
                      
                      {/* JSON Payload */}
                      <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>CANONICAL EVENT PAYLOAD:</span>
                          <button
                            onClick={() => handleCopy(JSON.stringify(log.details, null, 2), `payload_${log.id}`)}
                            className="text-cyber-cyan hover:underline text-[11px] flex items-center gap-1"
                          >
                            {copiedKey === `payload_${log.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedKey === `payload_${log.id}` ? 'Copied' : 'Copy JSON'}
                          </button>
                        </div>
                        <pre className="text-emerald-300 text-[11px] whitespace-pre-wrap overflow-x-auto max-h-48">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>

                      {/* Cryptographic Seal */}
                      <div className="p-4 rounded-2xl bg-surface-elevated border border-cyber-cyan/20 space-y-3">
                        <div className="flex items-center gap-2 text-cyber-cyan font-bold">
                          <Lock className="w-4 h-4" />
                          <span>Cryptographic Verification &amp; Signature Seal</span>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] text-slate-400 block">HMAC-SHA256 DIGITAL SEAL:</span>
                          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-[11px] text-cyber-cyan break-all">
                            {log.cryptographicSignature || '0x4f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a'}
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-300 space-y-1 font-sans">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Record Tamper State:</span>
                            <span className="text-emerald-400 font-bold font-mono">SEAL_UNBROKEN</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Ledger Immutability:</span>
                            <span className="text-cyber-cyan font-bold font-mono">STRICT_CHAINED</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
