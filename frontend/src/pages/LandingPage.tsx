import React, { useState } from 'react';
import { 
  Shield, 
  ArrowRight, 
  Lock, 
  Cpu, 
  ShieldCheck,
  ShieldAlert, 
  UserCheck,
  Zap,
  Key,
  FileCheck,
  Flame
} from 'lucide-react';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../hooks/useAuth';
import { ParticleShieldCanvas } from '../animations/ParticleShieldCanvas';
import { ArchitecturePipeline } from '../components/ArchitecturePipeline';
import { sound } from '../utils/soundEngine';

export const LandingPage: React.FC = () => {
  const { login } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState(false);

  const openAuth = (mode: 'login' | 'register') => {
    sound.playClick();
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleInstantDemoLogin = async () => {
    try {
      sound.playClick();
      setIsDemoLoggingIn(true);
      await login('aditya@sentinel.internal', 'Password@123');
      sound.playVerified();
    } catch (err) {
      console.error('Demo login error', err);
      sound.playHoldAlert();
    } finally {
      setIsDemoLoggingIn(false);
    }
  };

  const marqueeItems = [
    'AUTONOMY WITH A BOUNDARY',
    'ARMORIQ CRYPTOGRAPHIC PROTOCOL',
    'ZERO TOOL LEAKAGE GUARANTEE',
    'SHA-256 MERKLE TREES',
    'CSRG-IAP INTENT TOKENS',
    'REAL-TIME PROXY INTERCEPTION',
    'HUMAN-IN-THE-LOOP CONTROL',
    'IMMUTABLE AUDIT LEDGER'
  ];

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 flex flex-col justify-between selection:bg-cyber-gold selection:text-black relative overflow-x-hidden">
      
      {/* Background Interactive Particle Canvas */}
      <ParticleShieldCanvas />

      {/* Top Navbar */}
      <nav className="border-b border-white/10 glass-panel bg-[#05070B]/90 px-6 md:px-12 py-4 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyber-gold/15 border border-cyber-gold/40 flex items-center justify-center shadow-glow-gold/20">
              <Shield className="w-5 h-5 text-cyber-gold" />
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-white font-mono">
                SENTINEL <span className="text-cyber-gold">AI</span>
              </span>
              <span className="ml-2 px-2 py-0.5 text-[9px] font-bold text-cyber-gold bg-cyber-gold/10 border border-cyber-gold/30 rounded font-mono">
                GRAND FINALE EDITION
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuth('login')}
              onMouseEnter={() => sound.playHover()}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl border border-transparent transition-all"
            >
              Sign In
            </button>
            <button
              onClick={handleInstantDemoLogin}
              disabled={isDemoLoggingIn}
              onMouseEnter={() => sound.playHover()}
              className="px-5 py-2 text-xs font-black text-black bg-cyber-gold hover:bg-cyber-yellow rounded-xl shadow-glow-gold transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isDemoLoggingIn ? 'Launching...' : 'Enter Live Workspace'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Kinetic Infinite Marquee Ticker */}
      <div className="border-y border-cyber-gold/15 bg-surface/60 backdrop-blur-md py-2 overflow-hidden whitespace-nowrap relative z-10">
        <div className="flex gap-8 animate-[scanline_25s_linear_infinite]" style={{ animationDuration: '24s' }}>
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} className="flex items-center gap-3 text-[11px] font-mono font-bold tracking-widest text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-gold" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Hero Body */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16 space-y-16 relative z-10">
        
        {/* Section 1: 30-Second Value Proposition */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyber-gold/10 border border-cyber-gold/30 text-cyber-gold text-xs font-bold">
            <Zap className="w-3.5 h-3.5 fill-cyber-gold" />
            Automate India Hackathon Grand Finale — ArmorIQ Track
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.06] uppercase font-mono">
            Autonomy with a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-yellow via-cyber-gold to-amber-500 glow-text-gold">Boundary.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Autonomous AI agents possess unprecedented power to disburse refunds and execute settlement APIs. <strong>SENTINEL AI</strong> binds agent workflows to cryptographic parameter limits powered by <strong>ArmorIQ</strong> — mathematically preventing financial loss.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handleInstantDemoLogin}
              disabled={isDemoLoggingIn}
              onMouseEnter={() => sound.playHover()}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-cyber-gold hover:bg-cyber-yellow text-black font-black text-xs shadow-glow-gold hover:scale-105 transition-all tracking-wider uppercase"
            >
              <span>{isDemoLoggingIn ? 'CONNECTING...' : 'ENTER LIVE WORKSPACE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => openAuth('register')}
              onMouseEnter={() => sound.playHover()}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-surface-elevated hover:bg-surface-charcoal text-white font-bold text-xs border border-white/10 hover:border-cyber-gold/40 transition-all tracking-wider uppercase"
            >
              <Key className="w-4 h-4 text-cyber-gold" />
              CREATE WORKSPACE ACCOUNT
            </button>
          </div>
        </div>

        {/* Section 2: Visual Side-by-Side (Problem vs Solution) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          {/* Danger Side: Unconstrained Agent */}
          <div className="p-6 md:p-7 rounded-3xl bg-surface-elevated/90 border border-cyber-crimson/40 shadow-glow-crimson/15 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
              <div className="flex items-center gap-2 text-cyber-crimson font-bold text-sm">
                <Flame className="w-5 h-5" />
                <span>UNCONSTRAINED AI AGENT</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                HIGH RISK OF LEAKAGE
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 font-mono">
                <span className="text-[10px] text-slate-500">PROMPT INJECTION / LOGIC DRIFT:</span>
                <p className="text-rose-300">"Refund order ORD-9934 for Rahul Verma (₹15,000)"</p>
              </div>
              <div className="flex items-center gap-2 text-rose-300">
                <span className="text-cyber-crimson font-bold">✕</span>
                <span>Naive prompt guard easily bypassed by adversarial jailbreak.</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300">
                <span className="text-cyber-crimson font-bold">✕</span>
                <span>Direct payment settlement API executes unchecked.</span>
              </div>
              <div className="flex items-center gap-2 text-cyber-crimson font-bold pt-1">
                <span>Result: Catastrophic ₹15,000 unauthorized loss.</span>
              </div>
            </div>
          </div>

          {/* Secure Side: Sentinel AI + ArmorIQ */}
          <div className="p-6 md:p-7 rounded-3xl bg-surface-elevated/90 border border-cyber-gold/40 shadow-glow-gold/20 space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-gold/20 pb-3">
              <div className="flex items-center gap-2 text-cyber-gold font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>SENTINEL AI + ARMORIQ</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                ZERO-LEAKAGE GUARANTEE
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 font-mono">
                <span className="text-[10px] text-slate-500">CRYPTOGRAPHIC BOUNDARY ENFORCED:</span>
                <p className="text-emerald-300">CSRG-IAP Intent Token ceiling: ≤ ₹5,000</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Action hashed into SHA-256 binary Merkle tree before execution.</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>ArmorIQ Proxy BLOCKS ₹15,000 disbursement before touching payment API.</span>
              </div>
              <div className="flex items-center gap-2 text-cyber-gold font-bold pt-1">
                <span>Result: Immediate cryptographic HOLD $\rightarrow$ Human Supervisor Approval.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Section 3: Interactive How It Works Architecture Pipeline */}
        <div className="max-w-6xl mx-auto pt-4">
          <ArchitecturePipeline />
        </div>

        {/* Section 4: 4 Core Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 hover:border-cyber-gold/40 transition-all">
            <div className="p-3 rounded-2xl bg-cyber-gold/10 text-cyber-gold w-fit border border-cyber-gold/30">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Input-Driven Planning</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accepts natural language objectives. Dynamically resolves customer entities and builds structured multi-step plans.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-cyber-gold/20 space-y-3 hover:border-cyber-gold/50 transition-all">
            <div className="p-3 rounded-2xl bg-cyber-gold/10 text-cyber-gold w-fit border border-cyber-gold/30">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">SHA-256 Merkle Bounds</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every workflow step is cryptographically hashed and minted into a tamper-evident CSRG-IAP boundary token.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 hover:border-cyber-gold/40 transition-all">
            <div className="p-3 rounded-2xl bg-cyber-gold/10 text-cyber-gold w-fit border border-cyber-gold/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Proxy Interception</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Out-of-scope calls are intercepted at the gateway layer before the sandbox payment system is ever invoked.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 hover:border-cyber-gold/40 transition-all">
            <div className="p-3 rounded-2xl bg-cyber-gold/10 text-cyber-gold w-fit border border-cyber-gold/30">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Immutable Audit Trail</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every plan creation, step invocation, security hold, and supervisor decision is sealed with HMAC-SHA256 digital signatures.
            </p>
          </div>

        </div>

      </main>

      {/* Clean Modern Footer */}
      <footer className="border-t border-white/10 glass-panel py-6 px-6 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber-gold animate-ping" />
            SENTINEL AI // "Autonomy with a Boundary"
          </div>
          <div className="text-slate-500">
            Automate India Grand Finale · Powered by ArmorIQ Cryptographic Authorization
          </div>
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
