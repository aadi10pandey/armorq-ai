import React from 'react';
import { Wrench, Database, ShoppingBag, CreditCard, Send, CheckCircle2, Shield } from 'lucide-react';
import { ToolInfo } from '../types';

interface ToolCenterProps {
  tools: ToolInfo[];
}

export const ToolCenter: React.FC<ToolCenterProps> = ({ tools }) => {
  const getToolIcon = (name: string) => {
    switch (name) {
      case 'customer_database':
        return Database;
      case 'order_service':
        return ShoppingBag;
      case 'payment_gateway_sandbox':
        return CreditCard;
      case 'notification_service':
        return Send;
      default:
        return Wrench;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 cyber-grid flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-cyber-purple bg-cyber-purple/10 border border-cyber-purple/30 rounded">
              SANDBOX TOOL ECOSYSTEM
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-cyber-purple" />
            Connected MCP Tool Registry
          </h2>
        </div>

        <div className="text-xs font-mono text-slate-300 px-3 py-1.5 rounded-lg bg-surface-elevated border border-white/10">
          Status: <span className="text-emerald-400 font-bold">4/4 MCP SERVERS HEALTHY</span>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const Icon = getToolIcon(tool.name);

          return (
            <div
              key={tool.name}
              className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-mono">{tool.name}</h3>
                    <span className="text-xs text-cyber-cyan font-mono">{tool.mcp}</span>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {tool.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {tool.description}
              </p>

              {/* Capabilities */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <span className="text-[10px] font-mono text-slate-400 block tracking-wider uppercase">
                  Supported Actions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tool.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-2 py-0.5 text-[11px] font-mono rounded bg-surface-elevated border border-white/10 text-slate-200"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Authorized Scope */}
              <div className="p-3 rounded-xl bg-surface-elevated/70 border border-white/5 space-y-1 text-xs font-mono">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-cyber-cyan" />
                  ASSIGNED AUTHORIZATION SCOPE:
                </span>
                <p className="text-slate-300 font-sans text-xs">{tool.authorizedScope}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
