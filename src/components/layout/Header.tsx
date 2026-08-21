import React from 'react';
import { Activity, Clock, ShieldAlert, ChevronDown, RefreshCw, Layers } from 'lucide-react';
import { MIMIC_PATIENTS } from '../../data/mimicData';
import { Patient } from '../../types';

interface HeaderProps {
  currentPatient: Patient;
  onSelectPatient: (patientId: number) => void;
  isSimulationRunning: boolean;
  simulatedTime: string;
  speed: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPatient,
  onSelectPatient,
  isSimulationRunning,
  simulatedTime,
  speed
}) => {
  // Format display time for historical replay (extract HH:MM or clean time representation)
  const displayTime = React.useMemo(() => {
    if (!simulatedTime) return '00:00';
    if (simulatedTime.includes(' ')) {
      const parts = simulatedTime.split(' ');
      return parts[1]?.substring(0, 5) || simulatedTime;
    }
    return simulatedTime.substring(0, 5);
  }, [simulatedTime]);

  return (
    <header className="bg-[#102a4c] border-b border-[#1b3f6e] text-white px-5 py-3 sticky top-0 z-30 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Title & System Identity */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-inner flex items-center justify-center border border-blue-400/30">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                AI-Driven Digital Twin
              </h1>
              <span
                id="badge-demo-development"
                className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40"
              >
                DEMO / DEVELOPMENT
              </span>
            </div>
            <p className="text-xs text-sky-200/70 font-medium">
              Smart Healthcare Monitoring System • MIMIC-IV Clinical Data & DL Simulation
            </p>
          </div>
        </div>

        {/* Middle/Right: Controls, Patient Selector & Status */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Patient Selector */}
          <div className="flex items-center gap-2 bg-[#183a62] border border-[#244f80] rounded-lg px-3 py-1.5 shadow-xs">
            <span className="text-xs text-sky-200/80 font-medium">Patient:</span>
            <div className="relative">
              <select
                id="select-mimic-patient"
                value={currentPatient.stay_id}
                onChange={e => onSelectPatient(Number(e.target.value))}
                className="appearance-none bg-transparent pr-7 text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                {MIMIC_PATIENTS.map(p => (
                  <option key={p.stay_id} value={p.stay_id} className="bg-[#071322] text-white">
                    Patient #{p.subject_id} • ICU Stay #{p.stay_id} ({p.gender}, {p.anchor_age}y) — {p.care_unit}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-sky-300/70 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* System Simulation Status */}
          <div
            id="system-status-indicator"
            className="flex items-center gap-2 bg-[#183a62]/90 border border-[#244f80] rounded-lg px-3 py-1.5 text-xs"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSimulationRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-200 font-medium">
              {isSimulationRunning ? 'Simulated Real-Time' : 'Simulation Paused'}
            </span>
            <span className="text-[10px] text-sky-200 font-mono bg-[#0b1c30] px-1.5 py-0.5 rounded border border-[#244f80]">
              {speed}x
            </span>
          </div>

          {/* Replay Timestamp */}
          <div className="hidden lg:flex items-center gap-2 bg-[#183a62]/80 border border-[#244f80] rounded-lg px-3 py-1.5 text-xs text-slate-200">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-sky-200/80 text-[11px]">Replay Time:</span>
            <span className="font-mono text-white font-medium">{displayTime}</span>
            <span className="text-[10px] text-sky-300/70 bg-[#0b1c30] px-1.5 py-0.5 rounded border border-[#244f80] font-sans font-semibold">
              Historical Data Replay
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
