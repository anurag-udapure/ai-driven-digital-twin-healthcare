import React, { useState } from 'react';
import { 
  UserCheck, 
  Heart, 
  Wind, 
  Activity, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Info, 
  Layers, 
  ShieldCheck,
  Brain,
  Sliders,
  Cpu
} from 'lucide-react';
import { Patient, VitalHistoryPoint, DigitalTwinState } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PipelineFlow } from '../components/common/PipelineFlow';

interface DigitalTwinPageProps {
  patient: Patient;
  currentVital: VitalHistoryPoint;
  twinState: DigitalTwinState;
  onNavigateTo: (page: any) => void;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({
  patient,
  currentVital,
  twinState,
  onNavigateTo
}) => {
  const [activeSubsystem, setActiveSubsystem] = useState<'all' | 'cardio' | 'pulm' | 'renal' | 'systemic'>('all');

  return (
    <div id="page-digital-twin" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Architecture Pipeline Visualizer */}
      <PipelineFlow id="digital-twin-pipeline" activeStage={5} />

      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Physiological Digital Twin Model
            </h2>
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
              Subject #{patient.subject_id}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Synchronized patient state representation continuously estimated from MIMIC-IV demo features & live telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Overall Twin State</span>
            <StatusBadge status={twinState.twin_status.toLowerCase() as any} label={twinState.twin_status} size="lg" />
          </div>
        </div>
      </div>

      {/* Main Digital Twin Anatomy & Subsystem Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Clean Anatomical & Subsystem Schematic (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Digital Twin Anatomical Representation
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono font-medium">
                Last Sync: {twinState.last_sync}
              </span>
            </div>

            {/* Clean Medical Schematic Container with Connected Nodes */}
            <div className="relative bg-slate-50 border border-slate-200/80 rounded-xl p-6 flex flex-col items-center justify-center min-h-[380px]">
              {/* Central Human Silhouette Representation */}
              <div className="relative w-48 h-80 flex flex-col items-center justify-center">
                {/* SVG Anatomical Human Outline */}
                <svg viewBox="0 0 200 360" className="w-full h-full text-slate-300 drop-shadow-xs">
                  {/* Head */}
                  <circle cx="100" cy="40" r="28" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
                  {/* Neck */}
                  <path d="M92 68 L92 82 L108 82 L108 68 Z" fill="#cbd5e1" />
                  {/* Torso */}
                  <path
                    d="M60 82 L140 82 L130 200 L70 200 Z"
                    fill="#e2e8f0"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Left Arm */}
                  <path d="M58 82 L32 180 L44 185 L66 100 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
                  {/* Right Arm */}
                  <path d="M142 82 L168 180 L156 185 L134 100 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
                  {/* Legs */}
                  <path d="M72 200 L68 330 L88 330 L96 210 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
                  <path d="M128 200 L132 330 L112 330 L104 210 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />

                  {/* Organ Node Markers */}
                  {/* Brain / Neurological */}
                  <circle cx="100" cy="40" r="6" fill="#6366f1" className="animate-pulse" />
                  {/* Lungs */}
                  <ellipse cx="85" cy="115" rx="10" ry="16" fill="#0284c7" opacity="0.8" />
                  <ellipse cx="115" cy="115" rx="10" ry="16" fill="#0284c7" opacity="0.8" />
                  {/* Heart */}
                  <circle cx="95" cy="120" r="8" fill="#e11d48" className="animate-ping" style={{ animationDuration: '1.5s' }} />
                  <circle cx="95" cy="120" r="8" fill="#e11d48" />
                  {/* Kidneys */}
                  <ellipse cx="88" cy="165" rx="6" ry="9" fill="#10b981" opacity="0.8" />
                  <ellipse cx="112" cy="165" rx="6" ry="9" fill="#10b981" opacity="0.8" />
                </svg>

                {/* Overlaid Data Callouts linked to anatomical nodes */}
                {/* 1. Heart Rate Node */}
                <div className="absolute -left-12 top-16 bg-white border border-slate-200/90 rounded-lg p-2 shadow-xs text-xs space-y-0.5 w-32">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700">
                    <Heart className="w-3 h-3 text-rose-600" />
                    <span>Cardiac Channel</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900">{currentVital.heartRate} bpm</div>
                  <div className="text-[10px] text-slate-500 font-medium">Ref: 60–100 bpm</div>
                </div>

                {/* 2. Pulmonary Node (SpO2 & RR) */}
                <div className="absolute -right-12 top-16 bg-white border border-slate-200/90 rounded-lg p-2 shadow-xs text-xs space-y-0.5 w-34">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-sky-700">
                    <Wind className="w-3 h-3 text-sky-600" />
                    <span>Pulmonary Channel</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900">
                    {currentVital.spo2}% • {currentVital.respRate} bpm
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Ref: 95–100% • 12–20 bpm</div>
                </div>

                {/* 3. Hemodynamics / Blood Pressure Node */}
                <div className="absolute -left-12 bottom-16 bg-white border border-slate-200/90 rounded-lg p-2 shadow-xs text-xs space-y-0.5 w-34">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-700">
                    <Activity className="w-3 h-3 text-indigo-600" />
                    <span>Hemodynamics</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900">
                    {currentVital.systolicBp}/{currentVital.diastolicBp} mmHg
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Ref MAP: 70–105 mmHg</div>
                </div>

                {/* 4. Renal & Metabolic Node */}
                <div className="absolute -right-12 bottom-16 bg-white border border-slate-200/90 rounded-lg p-2 shadow-xs text-xs space-y-0.5 w-32">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Metabolic Labs</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900">
                    MIMIC Panel
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Lab Events Synced</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>State Representation: Continuous Multi-Channel Stream Mapping</span>
            <span className="font-mono font-semibold text-slate-800">Mode: Historical Replay</span>
          </div>
        </div>

        {/* Right: Subsystems Detailed Assessment & State Vector (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Subsystem Health Cards */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Physiological Subsystem Status
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Grounded on Observed Vitals</span>
            </div>

            <div className="space-y-3">
              {/* Cardiovascular */}
              <div className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-slate-900">Cardiovascular Subsystem</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    currentVital.heartRate >= 60 && currentVital.heartRate <= 100 && currentVital.systolicBp >= 90 && currentVital.systolicBp <= 140
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {currentVital.heartRate >= 60 && currentVital.heartRate <= 100 ? 'Within Reference' : 'Monitoring'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  HR: {currentVital.heartRate} bpm (Ref: 60–100) • BP: {currentVital.systolicBp}/{currentVital.diastolicBp} mmHg (MAP: {currentVital.meanBp} mmHg)
                </p>
              </div>

              {/* Pulmonary */}
              <div className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-slate-900">Pulmonary Subsystem</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    currentVital.spo2 >= 95 && currentVital.respRate >= 12 && currentVital.respRate <= 20
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {currentVital.spo2 >= 95 ? 'Within Reference' : 'Low SpO₂'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  SpO₂: {currentVital.spo2}% (Ref: 95–100%) • Resp Rate: {currentVital.respRate} bpm (Ref: 12–20 bpm)
                </p>
              </div>

              {/* Renal / Metabolic */}
              <div className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold text-slate-900">Renal & Metabolic Subsystem</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                    MIMIC Lab Profile
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-normal">
                  Grounded on MIMIC-IV laboratory chemistry panels (Creatinine, BUN, Glucose, Electrolytes)
                </p>
              </div>
            </div>
          </div>

          {/* Real-Time State Vector Representation (Tensor Ready) */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Normalized Twin State Vector
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                8-D Float32 Tensor
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">HR_NORM</span>
                <span className="font-bold text-slate-900">{twinState.state_vector.hr_norm}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">SPO2_NORM</span>
                <span className="font-bold text-slate-900">{twinState.state_vector.spo2_norm}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">BP_SYS_NORM</span>
                <span className="font-bold text-slate-900">{twinState.state_vector.bp_sys_norm}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">BP_DIA_NORM</span>
                <span className="font-bold text-slate-900">{twinState.state_vector.bp_dia_norm}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">RR_NORM</span>
                <span className="font-bold text-slate-900">{twinState.state_vector.rr_norm}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">TEMP_NORM</span>
                <span className="font-bold text-slate-900">{twinState.state_vector.temp_norm}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">LACTATE_RISK</span>
                <span className="font-bold text-slate-900">{twinState.state_vector.lactate_risk}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">WBC_RISK</span>
                <span className="font-bold text-slate-900">{twinState.state_vector.wbc_risk}</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-600 bg-sky-50/70 p-2.5 rounded-lg border border-sky-200/70 flex items-center justify-between">
              <span>Ready for forward-pass evaluation by deep learning sequence models</span>
              <button
                onClick={() => onNavigateTo('risk_prediction')}
                className="text-blue-700 hover:text-blue-900 font-bold cursor-pointer transition-colors"
              >
                Inspect ML Layer →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
