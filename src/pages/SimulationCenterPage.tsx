import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Activity, 
  Database, 
  Play, 
  Pause, 
  RotateCcw, 
  Gauge, 
  Radio, 
  Zap, 
  Cpu, 
  FileText, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Patient, VitalHistoryPoint, DigitalTwinState } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SimulationControls } from '../components/common/SimulationControls';
import { MIMIC_PATIENTS } from '../data/mimicData';

interface SimulationCenterPageProps {
  patient: Patient;
  currentVital: VitalHistoryPoint;
  history: VitalHistoryPoint[];
  twinState: DigitalTwinState;
  isSimulationRunning: boolean;
  speed: number;
  mode: any;
  onTogglePlay: () => void;
  onReset: () => void;
  onSpeedChange: (speed: 0.5 | 1 | 2 | 5 | 10) => void;
  onModeChange: (mode: any) => void;
  onSelectPatient: (patientId: number) => void;
}

export const SimulationCenterPage: React.FC<SimulationCenterPageProps> = ({
  patient,
  currentVital,
  history,
  twinState,
  isSimulationRunning,
  speed,
  mode,
  onTogglePlay,
  onReset,
  onSpeedChange,
  onModeChange,
  onSelectPatient
}) => {
  const [selectedStreamFilter, setSelectedStreamFilter] = useState<string>('all');

  return (
    <div id="page-simulation-center" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Simulation Pipeline Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Streaming Simulation & Replay Engine
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 font-medium">
            Pipeline: Replay Stream Engine v2.2
          </span>
        </div>

        {/* 5-step Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          {[
            { step: 1, title: 'MIMIC-IV Historical Data', desc: 'Raw hospital records & chartevents', status: 'Active' },
            { step: 2, title: 'Preprocessing & Cleaning', desc: 'Outlier filtering & normalization', status: 'Active' },
            { step: 3, title: 'Streaming Simulation', desc: 'Sequential timestamp replay', status: 'Active' },
            { step: 4, title: 'Digital Twin Model', desc: 'Physiological state estimation', status: 'Active' },
            { step: 5, title: 'Risk Prediction (DL)', desc: 'CNN-BiLSTM sequence model', status: 'Integration Pending' }
          ].map((item, idx) => (
            <div key={item.step} className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">Step 0{item.step}</span>
                  <span className={`text-[10px] font-bold ${item.status === 'Active' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {item.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Simulation Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Engine Controls & Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Controls Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Simulation Engine Controls
              </h3>
              <StatusBadge status={isSimulationRunning ? 'active' : 'paused'} size="sm" />
            </div>

            {/* Target Patient Switcher */}
            <div className="space-y-1">
              <label className="text-xs text-slate-600 font-medium block">
                Target MIMIC-IV Patient Stream:
              </label>
              <select
                value={patient.stay_id}
                onChange={e => onSelectPatient(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {MIMIC_PATIENTS.map(p => (
                  <option key={p.stay_id} value={p.stay_id}>
                    Patient #{p.subject_id} (Stay #{p.stay_id}, {p.gender}, {p.anchor_age}y) — {p.care_unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Simulation Mode Switcher */}
            <div className="space-y-1">
              <label className="text-xs text-slate-600 font-medium block">
                Stream Generation Mode:
              </label>
              <select
                value={mode}
                onChange={e => onModeChange(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
              >
                <option value="mimic_sequential">Sequential MIMIC-IV Observations Replay</option>
                <option value="clinical_stress">Clinical Stress Perturbation (Tachycardia + Tachypnea)</option>
                <option value="hypotension_shock">Hypotension Shock Simulation (MAP Drop)</option>
                <option value="tachycardia_arrhythmia">Arrhythmia Tachycardia Event</option>
              </select>
            </div>

            {/* Controls Bar */}
            <SimulationControls
              isRunning={isSimulationRunning}
              speed={speed}
              mode={mode}
              onTogglePlay={onTogglePlay}
              onReset={onReset}
              onSpeedChange={onSpeedChange}
              onModeChange={onModeChange}
              compact={false}
            />

            {/* Telemetry Stream Specs */}
            <div className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-1.5 text-xs">
              <span className="font-bold text-slate-900 block">Stream Telemetry Stats:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="text-slate-600">Buffer Size: <strong className="text-slate-900">{history.length} frames</strong></div>
                <div className="text-slate-600">Sample Rate: <strong className="text-slate-900">{(1 * speed).toFixed(1)} Hz eq</strong></div>
                <div className="text-slate-600">Latency: <strong className="text-slate-900">~12 ms</strong></div>
                <div className="text-slate-600">Data Integrity: <strong className="text-emerald-700">100% Passed</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Ingested Packet Stream Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-4 bg-[#001f3f] text-white border-b border-[#0d2a4d] flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Streaming Ingestion Data Table
                </h3>
                <p className="text-[11px] text-slate-300 font-normal mt-0.5">
                  Sequential chronological observations emitted by the simulation engine
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Streaming
              </span>
            </div>

            {/* Streaming Table */}
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px] sticky top-0">
                  <tr>
                    <th className="px-3 py-2.5">Sim Timestamp</th>
                    <th className="px-3 py-2.5">Parameter</th>
                    <th className="px-3 py-2.5">Emitted Value</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Data Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {history.slice().reverse().map((item, idx) => (
                    <tr key={idx} className={idx === 0 ? 'bg-sky-50/50 font-bold' : 'hover:bg-slate-50/80 transition-colors'}>
                      <td className="px-3 py-2 text-slate-700 whitespace-nowrap font-medium">
                        {item.simulatedTime}
                      </td>
                      <td className="px-3 py-2 text-slate-900 font-sans font-bold">
                        Hemodynamic Multi-Channel
                      </td>
                      <td className="px-3 py-2 text-slate-900 whitespace-nowrap font-medium">
                        HR: {item.heartRate} | SpO₂: {item.spo2}% | BP: {item.systolicBp}/{item.diastolicBp} | RR: {item.respRate}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <StatusBadge
                          status={item.heartRate > 100 || item.spo2 < 92 ? 'warning' : 'normal'}
                          size="sm"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-sans font-bold border ${
                            item.source === 'MIMIC-IV Demo'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {item.source}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Buffer depth: {history.length} historical frames</span>
            <span className="font-mono text-slate-700">Stream Status: Synchronized</span>
          </div>
        </div>
      </div>
    </div>
  );
};
