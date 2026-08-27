import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Radar, 
  Sliders, 
  Zap
} from 'lucide-react';
import { sound } from '../utils/soundEngine';

interface RadarBlip {
  id: string;
  label: string;
  amount: number;
  angle: number; // in degrees
  distancePercent: number; // 0 to 100
  status: 'SAFE' | 'HOLD' | 'BLOCKED';
}

interface InterceptionRadarProps {
  maxLimit?: number;
  onLimitChange?: (newLimit: number) => void;
}

export const InterceptionRadar: React.FC<InterceptionRadarProps> = ({
  maxLimit = 5000,
  onLimitChange
}) => {
  const [currentLimit, setCurrentLimit] = useState<number>(maxLimit);
  const [selectedBlip, setSelectedBlip] = useState<RadarBlip | null>(null);

  useEffect(() => {
    setCurrentLimit(maxLimit);
  }, [maxLimit]);

  const blips: RadarBlip[] = [
    { id: '1', label: 'Priya Sharma (ORD-8821)', amount: 4200, angle: 45, distancePercent: 28, status: 'SAFE' },
    { id: '2', label: 'Anita Desai (ORD-4821)', amount: 15000, angle: 160, distancePercent: 82, status: 'HOLD' },
    { id: '3', label: 'Rahul Verma (ORD-9934)', amount: 15000, angle: 290, distancePercent: 85, status: 'HOLD' },
    { id: '4', label: 'Rohan Gupta (ORD-3190)', amount: 2800, angle: 210, distancePercent: 18, status: 'SAFE' },
    { id: '5', label: 'Injection Probe (Adversarial)', amount: 99000, angle: 340, distancePercent: 96, status: 'BLOCKED' },
  ];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentLimit(val);
    onLimitChange?.(val);
  };

  const handleBlipClick = (blip: RadarBlip) => {
    setSelectedBlip(blip);
    sound.playRadarBlip();
  };

  // Safe boundary radius scale based on currentLimit (₹1,000 to ₹50,000 maps to 15% - 75% radius)
  const safeRadiusPercent = Math.min(Math.max((currentLimit / 25000) * 50 + 10, 15), 75);

  return (
    <div className="glass-panel p-6 md:p-7 rounded-3xl border border-white/10 space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 shadow-glow-cyan/20">
            <Radar className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Threat & Interception Radar HUD
            </h3>
            <p className="text-xs text-slate-400">
              Live spatial projection of agent actions against configured authority boundaries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-surface-elevated border border-white/10 text-slate-300">
            Authority Ceiling: <strong className="text-cyber-cyan font-mono">₹{currentLimit.toLocaleString('en-IN')}</strong>
          </span>
        </div>
      </div>

      {/* Main Radar Display & Controls Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Left: Interactive Circular Radar (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-surface-elevated/70 border-2 border-cyber-cyan/30 flex items-center justify-center overflow-hidden shadow-2xl">
            
            {/* Concentric Distance Rings */}
            <div className="absolute inset-4 rounded-full border border-white/5" />
            <div className="absolute inset-12 rounded-full border border-white/5" />
            <div className="absolute inset-20 rounded-full border border-white/5" />
            <div className="absolute inset-28 rounded-full border border-white/5" />

            {/* Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-cyber-cyan/20" />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-cyber-cyan/20" />

            {/* Dynamic Safe Boundary Zone Ring */}
            <motion.div
              animate={{ width: `${safeRadiusPercent * 2}%`, height: `${safeRadiusPercent * 2}%` }}
              transition={{ type: 'spring', damping: 20 }}
              className="absolute rounded-full bg-emerald-500/10 border-2 border-emerald-500/50 shadow-glow-emerald/20 flex items-center justify-center pointer-events-none"
            >
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider absolute top-1 font-mono">
                Safe Autonomous Zone
              </span>
            </motion.div>

            {/* Rotating Radar Sweep Beam */}
            <div 
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg, rgba(0, 240, 255, 0.35) 0deg, rgba(0, 240, 255, 0.05) 45deg, transparent 90deg, transparent 360deg)',
                animation: 'spin 4s linear infinite',
              }}
            />

            {/* Center Agent Core */}
            <div className="relative z-20 w-8 h-8 rounded-full bg-cyber-cyan text-black flex items-center justify-center font-bold text-xs shadow-glow-cyan">
              <Zap className="w-4 h-4 fill-black" />
            </div>

            {/* Radar Blips */}
            {blips.map((blip) => {
              const rad = (blip.angle * Math.PI) / 180;
              const radiusPixels = (blip.distancePercent / 100) * 125;
              const x = Math.cos(rad) * radiusPixels;
              const y = Math.sin(rad) * radiusPixels;

              // Check if blip falls inside or outside the current dynamic threshold
              const isCurrentlySafe = blip.amount <= currentLimit;

              return (
                <motion.button
                  key={blip.id}
                  whileHover={{ scale: 1.4 }}
                  onClick={() => handleBlipClick(blip)}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className={`absolute z-30 w-5 h-5 -ml-2.5 -mt-2.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isCurrentlySafe
                      ? 'bg-emerald-500 text-black shadow-glow-emerald'
                      : 'bg-cyber-crimson text-white shadow-glow-crimson animate-pulse'
                  }`}
                  title={`${blip.label}: ₹${blip.amount.toLocaleString('en-IN')}`}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                </motion.button>
              );
            })}

          </div>

          <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Inside Safe Boundary
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-crimson inline-block" /> Out-of-Scope (HOLD)
            </span>
          </div>
        </div>

        {/* Right: Dynamic Interactive Limit Tuning Slider & Blip Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Dynamic Boundary Tuning Slider */}
          <div className="p-4 rounded-2xl bg-surface-elevated/90 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyber-cyan" /> Adjust Authority Boundary
              </span>
              <span className="text-cyber-cyan font-bold font-mono text-sm">
                ₹{currentLimit.toLocaleString('en-IN')}
              </span>
            </div>

            <input
              type="range"
              min={1000}
              max={30000}
              step={500}
              value={currentLimit}
              onChange={handleSliderChange}
              className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>₹1,000 (Strict)</span>
              <span>₹15,000</span>
              <span>₹30,000 (Permissive)</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Drag slider to watch the radar safe-zone circle resize and dynamically reclassify transactions in real-time.
            </p>
          </div>

          {/* Selected Blip Telemetry */}
          {selectedBlip ? (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              selectedBlip.amount <= currentLimit
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'glass-panel-danger border-cyber-crimson/50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{selectedBlip.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedBlip.amount <= currentLimit
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-cyber-crimson'
                }`}>
                  {selectedBlip.amount <= currentLimit ? 'AUTHORIZED' : 'HELD IN PROXY'}
                </span>
              </div>

              <div className="text-sm font-bold font-mono text-white">
                Requested: ₹{selectedBlip.amount.toLocaleString('en-IN')}
              </div>

              <p className="text-[11px] text-slate-300">
                {selectedBlip.amount <= currentLimit
                  ? 'Within current authorized boundary. Agent executes autonomously.'
                  : `Exceeds current limit by ₹${(selectedBlip.amount - currentLimit).toLocaleString('en-IN')}. ArmorIQ intercepts before payment execution.`}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-surface/50 border border-white/5 text-center text-slate-500 text-xs py-6">
              Click any radar blip dot to inspect transaction telemetry.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
