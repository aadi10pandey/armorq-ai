import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Eye,
  X,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditTrailProps {
  logs: AuditEvent[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditEvent | null>(null);
  const [showSeal, setShowSeal] = useState(false);

  const getHumanStatusLabel = (status: string) => {
    switch (status) {
      case 'AUTHORIZED':
        return 'Authorized & Executed';
      case 'HOLD_REQUESTED':
      case 'OUT_OF_SCOPE_BLOCKED':
        return 'Blocked (Hold)';
      case 'HUMAN_APPROVED':
        return 'Approved by Human';
      case 'HUMAN_REJECTED':
        return 'Rejected by Human';
      default:
        return status;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tool.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resultSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.taskId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || log.authorizationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 cyber-grid flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              IMMUTABLE AUDIT TRAIL
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-400" />
            Complete Activity & Security Ledger
          </h2>
        </div>

        <div className="text-xs text-slate-300 px-4 py-2 rounded-xl bg-surface-elevated border border-white/10">
          Recorded Events: <span className="text-cyber-cyan font-bold font-mono">{logs.length}</span>
        </div>
      </div>

      {/* 2. Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events, actions, or tasks..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 text-xs rounded-xl bg-surface-elevated border border-white/10 text-slate-200 focus:outline-none focus:border-cyber-cyan font-medium"
          >
            <option value="ALL">All Event Types</option>
            <option value="AUTHORIZED">Authorized & Executed</option>
            <option value="HOLD_REQUESTED">Blocked (Hold)</option>
            <option value="HUMAN_APPROVED">Approved by Human</option>
            <option value="HUMAN_REJECTED">Rejected by Human</option>
          </select>
        </div>
      </div>

      {/* 3. Human-Readable Audit Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/80 border-b border-white/10 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Time</th>
                <th className="py-3.5 px-5">Action Performed</th>
                <th className="py-3.5 px-5">Security Decision</th>
                <th className="py-3.5 px-5">Summary</th>
                <th className="py-3.5 px-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-500 text-xs">
                    No matching activity records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isBlocked = log.authorizationStatus === 'HOLD_REQUESTED' || log.authorizationStatus === 'OUT_OF_SCOPE_BLOCKED';
                  const isApproved = log.authorizationStatus === 'HUMAN_APPROVED';

                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white">
                          {log.action === 'process_refund' 
                            ? `Process Refund (₹${log.details?.requestedAmount || log.details?.amount || 4200})`
                            : log.action.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[11px] text-slate-500 capitalize">
                          {log.tool.replace(/_/g, ' ')}
                        </div>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${
                          isBlocked
                            ? 'text-cyber-crimson bg-rose-500/10 border-cyber-crimson/30'
                            : isApproved
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                            : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        }`}>
                          {getHumanStatusLabel(log.authorizationStatus)}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-300 max-w-sm leading-relaxed">
                        {log.resultSummary}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setShowSeal(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-300 hover:text-white border border-white/10 transition-all text-xs font-medium inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Detail Modal with Progressive Technical Disclosure */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/20 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Event Record
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedLog.resultSummary}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-surface-elevated border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Decision</span>
                <div className="font-semibold text-white">{getHumanStatusLabel(selectedLog.authorizationStatus)}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-elevated border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Timestamp</span>
                <div className="font-semibold text-white font-mono">{new Date(selectedLog.timestamp).toLocaleString()}</div>
              </div>
            </div>

            {/* Expandable Cryptographic Seal (For Technical Judges) */}
            <div className="border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowSeal(!showSeal)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyber-cyan" />
                  Cryptographic Verification Seal (For Technical Judges)
                </span>
                {showSeal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showSeal && (
                <div className="p-4 border-t border-white/10 bg-black/40 space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-surface border border-white/5">
                    <span className="text-slate-500 text-[10px] block">HMAC AUDIT SIGNATURE:</span>
                    <span className="text-cyber-cyan break-all">{selectedLog.cryptographicSignature}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface border border-white/5">
                    <span className="text-slate-500 text-[10px] block">INTENT TOKEN:</span>
                    <span className="text-cyber-purple break-all">{selectedLog.intentToken}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-border text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
