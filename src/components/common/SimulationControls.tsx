import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Gauge } from 'lucide-react';
import { simulationService } from '../../services/simulationService';

interface SimulationControlsProps {
  isRunning: boolean;
  speed: number;
  mode?: string;
  onTogglePlay: () => void;
  onReset: () => void;
  onSpeedChange: (speed: 0.5 | 1 | 2 | 5 | 10) => void;
  onModeChange?: (mode: 'mimic_sequential' | 'clinical_stress' | 'hypotension_shock' | 'tachycardia_arrhythmia') => void;
  compact?: boolean;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  speed,
  mode = 'mimic_sequential',
  onTogglePlay,
  onReset,
  onSpeedChange,
  onModeChange,
  compact = false
}) => {
  const speeds: Array<0.5 | 1 | 2 | 5 | 10> = [0.5, 1, 2, 5, 10];

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-xs ${compact ? 'p-2.5' : 'p-4'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Play/Pause and Reset Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-sim-play-pause"
            onClick={onTogglePlay}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>START</span>
              </>
            )}
          </button>

          <button
            id="btn-sim-reset"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>RESET</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-200">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-xs font-medium text-slate-600">
              {isRunning ? 'Simulation Stream Active' : 'Simulation Paused'}
            </span>
          </div>
        </div>

        {/* Right: Speed Selection */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-500 font-semibold">Speed:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {speeds.map(s => (
                <button
                  key={s}
                  id={`btn-speed-${s}x`}
                  onClick={() => onSpeedChange(s)}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                    speed === s
                      ? 'bg-[#001f3f] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {onModeChange && !compact && (
            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Mode:</span>
              <select
                id="select-sim-mode"
                value={mode}
                onChange={e => onModeChange(e.target.value as any)}
                className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="mimic_sequential">Sequential MIMIC-IV Replay</option>
                <option value="clinical_stress">Clinical Stress Perturbation</option>
                <option value="hypotension_shock">Hypotension Shock Scenario</option>
                <option value="tachycardia_arrhythmia">Tachycardia Arrhythmia</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
