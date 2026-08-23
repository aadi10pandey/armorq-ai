import React, { useState } from 'react';
import { 
  Shield, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Cpu, 
  CheckCircle2, 
  ShieldAlert, 
  FileText,
  UserCheck
} from 'lucide-react';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../hooks/useAuth';

export const LandingPage: React.FC = () => {
  const { login } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState(false);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleInstantDemoLogin = async () => {
    try {
      setIsDemoLoggingIn(true);
      await login('aditya@sentinel.internal', 'Password@123');
    } catch (err) {
      console.error('Demo login error', err);
    } finally {
      setIsDemoLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col justify-between selection:bg-cyber-cyan selection:text-black">
      
      {/* Top Navbar */}
      <nav className="border-b border-white/10 glass-panel bg-background/80 px-6 md:px-12 py-4 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/40 flex items-center justify-center shadow-glow-cyan">
              <Shield className="w-5 h-5 text-cyber-cyan" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wider text-white">
                SENTINEL <span className="text-cyber-cyan font-mono">AI</span>
              </span>
              <span className="ml-2 px-2 py-0.5 text-[9px] font-bold text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 rounded">
                ENTERPRISE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuth('login')}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl border border-transparent transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuth('register')}
              className="px-5 py-2 text-xs font-semibold text-black bg-cyber-cyan hover:bg-cyber-cyan/90 rounded-xl shadow-glow-cyan transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Body */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 space-y-16">
        
        {/* Main Pitch */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            Automate India Grand Finale — ArmorIQ Track (Problem 1)
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Autonomy with a Boundary.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Give your AI agents enough authority to work completely independently, while mathematically preventing them from ever exceeding your rules.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => openAuth('register')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-cyber-cyan hover:bg-cyber-cyan/90 text-black font-bold text-xs shadow-glow-cyan hover:scale-105 transition-all"
            >
              CREATE YOUR AGENT
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleInstantDemoLogin}
              disabled={isDemoLoggingIn}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-surface-elevated hover:bg-surface-border text-white font-semibold text-xs border border-white/10 hover:border-white/30 transition-all"
            >
              <UserCheck className="w-4 h-4 text-cyber-cyan" />
              {isDemoLoggingIn ? 'Logging In...' : 'EXPLORE DEMO ACCOUNT (1-CLICK)'}
            </button>
          </div>
        </div>

        {/* 4 Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
            <div className="p-3 rounded-2xl bg-cyber-cyan/10 text-cyber-cyan w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Input-Driven Agents</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enter any natural language instruction. The AI agent interprets intent, inspects sandbox data, and builds an actionable multi-step plan.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-cyber-purple/30 space-y-3 shadow-glow-purple/10">
            <div className="p-3 rounded-2xl bg-cyber-purple/10 text-cyber-purple w-fit">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">ArmorIQ Authority Bound</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every plan is cryptographically hashed with Merkle roots and verified against authorized limits (e.g. ₹5,000) at the proxy layer.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-cyber-crimson/30 space-y-3 shadow-glow-crimson/10">
            <div className="p-3 rounded-2xl bg-cyber-crimson/10 text-cyber-crimson w-fit">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Zero-Leakage Interception</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When an action exceeds authority (e.g. ₹15,000 refund), ArmorIQ halts it in HOLD before the payment tool is ever executed.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Human Approval & Audit</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Human supervisors review and approve high-risk actions to resume execution, with every event recorded in an immutable ledger.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 glass-panel py-6 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>SENTINEL AI // Enterprise Autonomous Agent Control Plane</div>
          <div>Powered by ArmorIQ Cryptographic Intent Verification</div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

    </div>
  );
};
