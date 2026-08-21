import React, { useState } from 'react';
import { 
  User, 
  Activity, 
  Heart, 
  Wind, 
  Thermometer, 
  BrainCircuit, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Info,
  Calendar,
  Building,
  Shield,
  FileText
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Patient, VitalHistoryPoint, DigitalTwinState, AlertEvent } from '../types';
import { VitalCard } from '../components/common/VitalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { PipelineFlow } from '../components/common/PipelineFlow';
import { SimulationControls } from '../components/common/SimulationControls';

interface DashboardPageProps {
  patient: Patient;
  currentVital: VitalHistoryPoint;
  history: VitalHistoryPoint[];
  twinState: DigitalTwinState;
  alerts: AlertEvent[];
  isSimulationRunning: boolean;
  speed: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onSpeedChange: (speed: 0.5 | 1 | 2 | 5 | 10) => void;
  onNavigateTo: (page: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  patient,
  currentVital,
  history,
  twinState,
  alerts,
  isSimulationRunning,
  speed,
  onTogglePlay,
  onReset,
  onSpeedChange,
  onNavigateTo
}) => {
  const [chartTimeWindow, setChartTimeWindow] = useState<'1m' | '5m' | '15m' | 'all'>('15m');
  const [selectedVitalChart, setSelectedVitalChart] = useState<'all' | 'hr' | 'spo2' | 'bp' | 'rr'>('all');

  const filteredHistory = React.useMemo(() => {
    if (chartTimeWindow === '1m') return history.slice(-6);
    if (chartTimeWindow === '5m') return history.slice(-15);
    if (chartTimeWindow === '15m') return history.slice(-30);
    return history;
  }, [history, chartTimeWindow]);

  const recentAlerts = alerts.filter(a => a.subject_id === patient.subject_id).slice(0, 4);

  return (
    <div id="page-dashboard" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Quick System & Pipeline Overview */}
      <PipelineFlow id="dashboard-architecture-pipeline" activeStage={5} />

      {/* Compact Digital Twin Explanation */}
      <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-3.5 text-xs text-sky-950 flex items-start gap-3 shadow-2xs">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-sky-950 text-xs">What is the Digital Twin?</h4>
            <p className="text-sky-900/90 text-[11px] leading-relaxed mt-0.5">
              A digital representation of the selected patient based on clinical data and simulated physiological observations.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-sky-900/80 shrink-0">
            <span className="px-2 py-0.5 rounded bg-white border border-sky-200 font-medium">
              Source: <strong>MIMIC-IV Demo</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-sky-200 font-medium">
              Mode: <strong>Historical Data Replay</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-sky-200 font-medium">
              Model: <strong>CNN-BiLSTM (Pending)</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Patient Overview & Simulation Quick Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Patient Overview Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-800 font-bold text-sm shadow-2xs">
                  {patient.gender === 'M' ? 'M' : 'F'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      MIMIC-IV Patient #{patient.subject_id}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-sky-50 text-sky-800 border border-sky-200 font-bold">
                      Stay #{patient.stay_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Admission #{patient.hadm_id} • Anchor Year {patient.anchor_year}
                  </p>
                </div>
              </div>
              <StatusBadge status={twinState.twin_status.toLowerCase() as any} label={`State: ${twinState.twin_status}`} size="md" />
            </div>

            {/* Structured Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-3">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 block text-[11px] font-medium">Demographics</span>
                <span className="font-bold text-slate-800">{patient.anchor_age} yrs • {patient.gender === 'M' ? 'Male' : 'Female'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 block text-[11px] font-medium">Care Unit</span>
                <span className="font-bold text-slate-800">{patient.care_unit}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 block text-[11px] font-medium">Admission Type</span>
                <span className="font-bold text-slate-800">{patient.admission_type}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 block text-[11px] font-medium">Insurance</span>
                <span className="font-bold text-slate-800">{patient.insurance}</span>
              </div>
            </div>

            {/* Clinical Baseline Summary */}
            <div className="p-3 bg-slate-50/90 rounded-lg border border-slate-200/80 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-0.5">Clinical Condition / Chief Complaint:</span>
              <p className="text-slate-600 leading-relaxed font-normal">{patient.chief_complaint}</p>
              <p className="text-slate-500 mt-1 text-[11px] italic">Baseline: {patient.baseline_condition}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              ICU Intime: <span className="font-mono text-slate-800 font-semibold">{patient.intime}</span>
            </span>
            <button
              onClick={() => onNavigateTo('patient_history')}
              className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer transition-colors"
            >
              View Full Clinical History →
            </button>
          </div>
        </div>

        {/* Quick Simulation & Digital Twin Summary (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Simulation Controller */}
          <SimulationControls
            isRunning={isSimulationRunning}
            speed={speed}
            onTogglePlay={onTogglePlay}
            onReset={onReset}
            onSpeedChange={onSpeedChange}
            compact={false}
          />

          {/* Digital Twin Status Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Digital Twin Status</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500 font-medium">
                  {currentVital.timestamp ? `Time: ${currentVital.timestamp}` : '00:00'}
                </span>
              </div>

              {/* Clean Status Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-medium">Patient State</span>
                  <span className="font-bold text-slate-800">Monitoring</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-medium">Monitoring Status</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isSimulationRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {isSimulationRunning ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-medium">Last Update</span>
                  <span className="font-bold text-slate-800 font-mono">{currentVital.timestamp || '00:00'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-medium">Data Source</span>
                  <span className="font-bold text-slate-800">MIMIC-IV Demo</span>
                </div>
              </div>

              <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Current Mode:</span>
                <span className="font-bold text-slate-800 text-[11px]">Historical Data Replay</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Physiological State Vector</span>
              <button
                onClick={() => onNavigateTo('digital_twin')}
                className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer text-xs transition-colors"
              >
                Inspect Twin Model →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Current Vitals Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Current Physiological Vitals</h3>
            <span className="text-slate-400 text-xs">• Real-Time Stream Observations</span>
          </div>
          <span className="text-xs text-slate-500">
            Source: <span className="font-semibold text-slate-700">{currentVital.source}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <VitalCard
            id="vital-card-hr"
            parameter="heart_rate"
            name="Heart Rate"
            value={currentVital.heartRate}
            unit="bpm"
            status={currentVital.heartRate > 100 || currentVital.heartRate < 55 ? 'warning' : 'normal'}
            source={currentVital.source}
            minRange={60}
            maxRange={100}
            trend={currentVital.heartRate > 90 ? 'up' : 'stable'}
            sparklineData={history.map(h => h.heartRate)}
          />

          <VitalCard
            id="vital-card-spo2"
            parameter="spo2"
            name="Oxygen Saturation"
            subLabel="Pulse Oximetry (SpO₂)"
            value={currentVital.spo2}
            unit="%"
            status={currentVital.spo2 < 90 ? 'critical' : currentVital.spo2 < 95 ? 'warning' : 'normal'}
            source={currentVital.source}
            minRange={95}
            maxRange={100}
            trend={currentVital.spo2 < 93 ? 'down' : 'stable'}
            sparklineData={history.map(h => h.spo2)}
          />

          <VitalCard
            id="vital-card-bp"
            parameter="blood_pressure"
            name="Blood Pressure"
            subLabel={`MAP: ${currentVital.meanBp} mmHg`}
            value={`${currentVital.systolicBp}/${currentVital.diastolicBp}`}
            unit="mmHg"
            status={currentVital.systolicBp > 140 || currentVital.systolicBp < 90 ? 'warning' : 'normal'}
            source={currentVital.source}
            minRange="90/60"
            maxRange="130/85"
            trend={currentVital.systolicBp > 135 ? 'up' : 'stable'}
            sparklineData={history.map(h => h.systolicBp)}
          />

          <VitalCard
            id="vital-card-rr"
            parameter="resp_rate"
            name="Respiratory Rate"
            value={currentVital.respRate}
            unit="bpm"
            status={currentVital.respRate > 22 || currentVital.respRate < 10 ? 'warning' : 'normal'}
            source={currentVital.source}
            minRange={12}
            maxRange={20}
            trend={currentVital.respRate > 20 ? 'up' : 'stable'}
            sparklineData={history.map(h => h.respRate)}
          />

          <VitalCard
            id="vital-card-temp"
            parameter="temperature"
            name="Body Temp"
            value={currentVital.temperature}
            unit="°C"
            status={currentVital.temperature > 38.0 ? 'warning' : 'normal'}
            source={currentVital.source}
            minRange={36.5}
            maxRange={37.5}
            trend="stable"
            sparklineData={history.map(h => h.temperature)}
          />
        </div>
      </div>

      {/* Real-Time Time-Series Multi-Vital Monitoring Chart */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Real-Time Physiological Stream Trends
            </h3>
            <p className="text-[11px] text-slate-500 font-normal">
              Dynamic multi-channel telemetry time series from MIMIC-IV and simulated real-time stream
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter buttons for time window */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              {(['1m', '5m', '15m', 'all'] as const).map(w => (
                <button
                  key={w}
                  id={`btn-time-window-${w}`}
                  onClick={() => setChartTimeWindow(w)}
                  className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-all ${
                    chartTimeWindow === w
                      ? 'bg-[#001f3f] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {w === 'all' ? 'All (Buffer)' : w}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigateTo('live_monitoring')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-200 cursor-pointer transition-colors"
            >
              Full ICU Live View →
            </button>
          </div>
        </div>

        {/* Time-Series Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#001f3f',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #082a52',
                  fontSize: '12px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
                }}
                labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="heartRate"
                name="Heart Rate (bpm)"
                stroke="#e11d48"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="spo2"
                name="SpO₂ (%)"
                stroke="#0284c7"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="systolicBp"
                name="Systolic BP (mmHg)"
                stroke="#6366f1"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="respRate"
                name="Resp Rate (bpm)"
                stroke="#0d9488"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section: Risk Summary (CNN-BiLSTM) & Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Risk Prediction
                </h3>
              </div>
              <StatusBadge status="pending" label="Integration Pending" size="sm" />
            </div>

            {/* Model Specification Details */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Model:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  CNN-BiLSTM
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="font-bold text-amber-700">Integration Pending</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Input:</span>
                <span className="font-semibold text-slate-700">Vitals + Clinical Features</span>
              </div>
            </div>

            {/* Prediction Output Status */}
            <div className="mt-3 p-3.5 bg-amber-50/70 border border-dashed border-amber-300 rounded-lg text-center space-y-1">
              <span className="text-xs font-bold text-amber-950 block">
                Prediction: Unavailable
              </span>
              <p className="text-[11px] text-amber-900/85 leading-relaxed">
                Model integration pending — Connect Python PyTorch/TensorFlow backend for live inference.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px] font-medium">Backend Hook: Ready</span>
            <button
              onClick={() => onNavigateTo('risk_prediction')}
              className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer text-xs transition-colors"
            >
              Inspect ML Specification →
            </button>
          </div>
        </div>

        {/* Recent Events & Alerts (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Recent Events & Clinical Alerts
                </h3>
              </div>
              <button
                onClick={() => onNavigateTo('alerts')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
              >
                View All ({alerts.length}) →
              </button>
            </div>

            {/* Alert List */}
            <div className="space-y-2">
              {recentAlerts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200/60">
                  No active clinical alerts for this patient.
                </div>
              ) : (
                recentAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                      alert.severity === 'critical'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : alert.severity === 'warning'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={alert.severity as any} size="sm" />
                        <span className="font-bold text-slate-900">{alert.parameter}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {alert.timestamp.substring(11, 19) || alert.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-snug font-normal">{alert.event}</p>
                      {alert.valueText && (
                        <p className="text-slate-600 font-mono text-[10px] font-semibold">{alert.valueText}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200/80 shrink-0 shadow-2xs">
                      {alert.source}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Automated rule engine + MIMIC-IV retrospective chartevents</span>
            <span className="font-mono text-[11px] font-semibold text-slate-700">{alerts.length} Total Events Logged</span>
          </div>
        </div>
      </div>
    </div>
  );
};
