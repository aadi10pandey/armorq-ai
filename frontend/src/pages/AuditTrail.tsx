import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Hash, 
  Eye,
  X
} from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditTrailProps {
  logs: AuditEvent[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditEvent | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tool.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resultSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.cryptographicSignature.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || log.authorizationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 cyber-grid flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded">
              IMMUTABLE TAMPER-EVIDENT LEDGER
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-400" />
            Cryptographic Audit Trail
          </h2>
        </div>

        <div className="text-xs font-mono text-slate-300 px-3 py-1.5 rounded-lg bg-surface-elevated border border-white/10">
          Total Sealed Events: <span className="text-cyber-cyan font-bold">{logs.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, tool, task or signature..."
            className="w-full pl-9 pr-3.5 py-2 text-xs font-mono rounded-lg bg-surface-elevated border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-mono rounded-lg bg-surface-elevated border border-white/10 text-slate-200 focus:outline-none focus:border-cyber-cyan"
          >
            <option value="ALL">All Statuses</option>
            <option value="AUTHORIZED">AUTHORIZED</option>
            <option value="HOLD_REQUESTED">HOLD_REQUESTED</option>
            <option value="HUMAN_APPROVED">HUMAN_APPROVED</option>
            <option value="HUMAN_REJECTED">HUMAN_REJECTED</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface-elevated/80 border-b border-white/10 text-slate-400">
              <tr>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">TASK & AGENT</th>
                <th className="py-3 px-4">ACTION & TOOL</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">RESULT SUMMARY</th>
                <th className="py-3 px-4">SEAL SIGNATURE</th>
                <th className="py-3 px-4 text-right">INSPECT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-white">{log.taskId}</div>
                      <div className="text-[10px] text-slate-500">{log.agentId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-cyber-cyan">{log.action}</div>
                      <div className="text-[10px] text-slate-400">{log.tool}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.authorizationStatus === 'AUTHORIZED' || log.authorizationStatus === 'HUMAN_APPROVED'
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                          : log.authorizationStatus === 'HOLD_REQUESTED'
                          ? 'text-cyber-crimson bg-rose-500/10 border border-cyber-crimson/30'
                          : 'text-slate-400 bg-white/5'
                      }`}>
                        {log.authorizationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-xs text-slate-200 max-w-xs truncate">
                      {log.resultSummary}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[10px] truncate max-w-[120px]">
                      {log.cryptographicSignature}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg bg-surface-elevated hover:bg-surface-border text-slate-400 hover:text-cyber-cyan border border-white/10 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Payload Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyber-cyan" />
                <h3 className="text-sm font-bold text-white">
                  Audit Event Inspector: {selectedLog.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-surface-elevated border border-white/5 space-y-1">
                <span className="text-slate-500 block text-[10px]">CRYPTOGRAPHIC SEAL:</span>
                <span className="text-cyber-cyan break-all">{selectedLog.cryptographicSignature}</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-elevated border border-white/5 space-y-1">
                <span className="text-slate-500 block text-[10px]">INTENT TOKEN (CSRG-IAP):</span>
                <span className="text-cyber-purple break-all">{selectedLog.intentToken}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-400 text-[11px] block">PAYLOAD DETAILS:</span>
              <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-emerald-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border text-white text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
