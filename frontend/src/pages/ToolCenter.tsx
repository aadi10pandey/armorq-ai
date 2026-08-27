import React, { useState } from 'react';
import { Wrench, Database, ShoppingBag, CreditCard, Send, CheckCircle2, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { ToolInfo } from '../types';
import { sound } from '../utils/soundEngine';

interface ToolCenterProps {
  tools: ToolInfo[];
  onNavigateToTechnical?: () => void;
}

export const ToolCenter: React.FC<ToolCenterProps> = ({ tools, onNavigateToTechnical }) => {
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  const getToolDisplayName = (name: string) => {
    switch (name) {
      case 'customer_database':
        return 'Customer Data';
      case 'order_service':
        return 'Orders';
      case 'payment_gateway_sandbox':
        return 'Payment Sandbox';
      case 'notification_service':
        return 'Notifications';
      default:
        return name;
    }
  };

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

  const getToolCapabilities = (name: string) => {
    switch (name) {
      case 'customer_database':
        return {
          allowed: ['Find customer by email/name', 'Look up account verification status'],
          approvalRequired: ['Update account bank payout details']
        };
      case 'order_service':
        return {
          allowed: ['Look up order by number', 'Validate warranty & return eligibility'],
          approvalRequired: ['Override 30-day return window']
        };
      case 'payment_gateway_sandbox':
        return {
          allowed: ['Disburse refunds up to ₹5,000'],
          approvalRequired: ['High-value refunds exceeding ₹5,000']
        };
      case 'notification_service':
        return {
          allowed: ['Send customer confirmation emails', 'Dispatch SMS transaction receipts'],
          approvalRequired: ['Bulk marketing campaign dispatch']
        };
      default:
        return {
          allowed: ['Standard tool execution'],
          approvalRequired: ['Administrative actions']
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 cyber-grid flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-cyber-purple bg-cyber-purple/10 border border-cyber-purple/30 rounded-full font-mono">
              TOOL REGISTRY
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-cyber-purple" />
            Connected Tools & Capabilities
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-300 px-4 py-2 rounded-xl bg-surface-elevated border border-white/10">
            System: <span className="text-emerald-400 font-bold">4/4 Tools Ready</span>
          </div>

          {onNavigateToTechnical && (
            <button
              onClick={() => {
                sound.playClick();
                onNavigateToTechnical();
              }}
              className="text-xs px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-300 hover:text-white border border-white/10 transition-all font-semibold"
            >
              Technical Plumbing
            </button>
          )}
        </div>
      </div>

      {/* 2. Human-Friendly Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const Icon = getToolIcon(tool.name);
          const displayName = getToolDisplayName(tool.name);
          const caps = getToolCapabilities(tool.name);
          const isExpanded = expandedTool === tool.name;

          return (
            <div
              key={tool.name}
              className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 space-y-4 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{displayName}</h3>
                    <span className="text-xs text-slate-400 font-medium">Enterprise Integration</span>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {tool.description}
              </p>

              {/* What the agent can do */}
              <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Agent Capabilities:
                </span>
                <ul className="space-y-1 text-slate-300">
                  {caps.allowed.map((c, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span> {c}
                    </li>
                  ))}
                  {caps.approvalRequired.map((c, i) => (
                    <li key={i} className="flex items-center gap-2 text-amber-300/90">
                      <span className="text-amber-400 font-bold">⚠</span> {c} (Requires Approval)
                    </li>
                  ))}
                </ul>
              </div>

              {/* Assigned Authority Scope */}
              <div className="p-3.5 rounded-2xl bg-surface-elevated/80 border border-white/5 space-y-1 text-xs">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold uppercase">
                  <Shield className="w-3 h-3 text-cyber-cyan" />
                  Authority Boundary:
                </span>
                <p className="text-slate-300 text-xs">{tool.authorizedScope}</p>
              </div>

              {/* Expandable Technical Details (Progressive Disclosure) */}
              <button
                onClick={() => {
                  sound.playClick();
                  setExpandedTool(isExpanded ? null : tool.name);
                }}
                className="w-full pt-1 flex items-center justify-between text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <span>Technical Details (MCP Server)</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {isExpanded && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
                  <div>Internal MCP Name: <span className="text-cyber-cyan">{tool.mcp}</span></div>
                  <div>Registered Methods: <span className="text-white">{tool.capabilities.join(', ')}</span></div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
