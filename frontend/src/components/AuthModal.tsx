import React, { useState } from 'react';
import { Shield, Lock, Mail, User, Building, X, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { sound } from '../utils/soundEngine';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('Administrator');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    sound.playClick();

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, organization, role });
      }
      sound.playVerified();
      onClose();
    } catch (err: any) {
      sound.playHoldAlert();
      setError(err.response?.data?.error || err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    sound.playClick();
    setEmail('aditya@sentinel.internal');
    setPassword('Password@123');
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md p-7 rounded-3xl glass-panel border border-white/20 shadow-2xl space-y-6 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {mode === 'login' ? 'Sign In to Sentinel AI' : 'Create Your Account'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'login' ? 'Access your AI agent control workspace' : 'Start with your secure enterprise workspace'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-elevated border border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { sound.playClick(); setMode('login'); setError(null); }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-cyber-cyan text-black shadow-glow-cyan font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { sound.playClick(); setMode('register'); setError(null); }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-cyber-cyan text-black shadow-glow-cyan font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-cyber-crimson/40 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-cyber-crimson mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aditya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Organization</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Enterprise Corp"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-slate-200 focus:outline-none focus:border-cyber-cyan"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Manager">Operations Manager</option>
                  <option value="Developer">AI / Software Engineer</option>
                  <option value="Operations">Support Lead</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aditya@sentinel.internal"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-cyber-cyan hover:bg-cyber-cyan/90 text-black font-black text-xs shadow-glow-cyan transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 tracking-wider uppercase"
          >
            {isSubmitting ? 'Verifying...' : mode === 'login' ? 'Sign In' : 'Create Workspace'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Demo Pre-fill */}
        <div className="pt-2 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="text-[11px] text-cyber-cyan hover:underline inline-flex items-center gap-1.5 font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Click here to fill Demo Account credentials
          </button>
        </div>

      </div>
    </div>
  );
};
