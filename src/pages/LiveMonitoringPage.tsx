import React, { useEffect, useRef, useState } from 'react';
import { 
  Activity, 
  Heart, 
  Wind, 
  Thermometer, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Maximize2,
  AlertCircle,
  RefreshCw,
  Gauge
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Patient, VitalHistoryPoint, DigitalTwinState } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SimulationControls } from '../components/common/SimulationControls';

interface LiveMonitoringPageProps {
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
}

export const LiveMonitoringPage: React.FC<LiveMonitoringPageProps> = ({
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
  onModeChange
}) => {
  const [selectedRange, setSelectedRange] = useState<'30s' | '1m' | '5m' | '15m'>('5m');
  const [alarmAudioMuted, setAlarmAudioMuted] = useState(true);
  const ecgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated ECG Sweep Canvas for high-fidelity clinical telemetry display
  useEffect(() => {
    const canvas = ecgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    // Draw background telemetry grid
    const drawGrid = () => {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;

      for (let gx = 0; gx < width; gx += 20) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 20) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }
    };

    drawGrid();

    let step = 0;
    const render = () => {
      if (isSimulationRunning) {
        // Clear a small vertical slice ahead of cursor (sweep bar)
        ctx.fillStyle = '#090d16';
        ctx.fillRect(x, 0, 12, height);

        // Re-draw faint grid behind erased area
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.5;
        for (let gx = Math.floor(x / 20) * 20; gx < x + 15; gx += 20) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, height);
          ctx.stroke();
        }

        // Calculate Lead II ECG waveform amplitude
        // P-Q-R-S-T wave generation based on current Heart Rate
        const hr = currentVital.heartRate || 75;
        const cycleLength = Math.max(20, Math.floor(2400 / hr));
        const phase = step % cycleLength;
        let yOffset = 0;

        if (phase === Math.floor(cycleLength * 0.15)) {
          yOffset = -6; // P wave
        } else if (phase === Math.floor(cycleLength * 0.3)) {
          yOffset = 4; // Q wave
        } else if (phase === Math.floor(cycleLength * 0.35)) {
          yOffset = -36; // R spike
        } else if (phase === Math.floor(cycleLength * 0.4)) {
          yOffset = 12; // S dip
        } else if (phase === Math.floor(cycleLength * 0.6)) {
          yOffset = -10; // T wave
        } else {
          yOffset = (Math.random() - 0.5) * 1.5; // Baseline micro-noise
        }

        const currentY = midY + yOffset;

        ctx.fillStyle = '#22c55e';
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(x, currentY, 1.2, 0, Math.PI * 2);
        ctx.fill();

        x = (x + 2) % width;
        step++;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSimulationRunning, currentVital.heartRate]);

  const displayHistory = React.useMemo(() => {
    if (selectedRange === '30s') return history.slice(-6);
    if (selectedRange === '1m') return history.slice(-12);
    if (selectedRange === '5m') return history.slice(-25);
    return history;
  }, [history, selectedRange]);

  return (
    <div id="page-live-monitoring" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Clinical Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              ICU Live Telemetry & Waveform Monitor
            </h2>
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
              BED 04 • {patient.care_unit}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Patient #{patient.subject_id} ({patient.gender}, {patient.anchor_age}y) • Stream Source: <strong className="text-slate-800 font-semibold">{currentVital.source}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {(['30s', '1m', '5m', '15m'] as const).map(r => (
              <button
                key={r}
                id={`btn-range-${r}`}
                onClick={() => setSelectedRange(r)}
                className={`px-3 py-1 rounded-md font-bold cursor-pointer transition-all ${
                  selectedRange === r
                    ? 'bg-[#001f3f] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAlarmAudioMuted(!alarmAudioMuted)}
            className={`p-2 rounded-lg border text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all ${
              alarmAudioMuted
                ? 'bg-slate-100 text-slate-600 border-slate-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
            title={alarmAudioMuted ? 'Alarm audio silenced' : 'Alarm audio active'}
          >
            {alarmAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{alarmAudioMuted ? 'Muted' : 'Audible'}</span>
          </button>
        </div>
      </div>

      {/* Simulation Controls Component */}
      <SimulationControls
        isRunning={isSimulationRunning}
        speed={speed}
        mode={mode}
        onTogglePlay={onTogglePlay}
        onReset={onReset}
        onSpeedChange={onSpeedChange}
        onModeChange={onModeChange}
      />

      {/* High-Density Telemetry Screen (Navy/Black ICU Display) */}
      <div className="bg-[#050c1a] rounded-xl border border-[#0d2647] p-4.5 shadow-xl text-white space-y-4">
        {/* Top Strip: ECG Lead II Waveform */}
        <div className="bg-[#09152a] rounded-lg border border-[#113059] p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">
                ECG Lead II • Real-Time R-R Sweep (25 mm/s)
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400">Gain: <strong className="text-white">x1.0</strong></span>
              <span className="text-slate-400">Filter: <strong className="text-white">0.5-40 Hz</strong></span>
              <span className="text-emerald-400 font-bold">HR: {currentVital.heartRate} bpm</span>
            </div>
          </div>
          <div className="w-full h-24 rounded-md bg-[#050c18] border border-[#113059] overflow-hidden relative shadow-inner">
            <canvas ref={ecgCanvasRef} width={1100} height={96} className="w-full h-full block" />
          </div>
        </div>

        {/* 4 Multi-Parameter Real-Time Interactive Clinical Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 1. Heart Rate Chart */}
          <div className="bg-[#09152a] rounded-lg border border-[#113059] p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between border-b border-[#113059] pb-2.5 mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold font-mono tracking-wider text-rose-400 uppercase">
                  Heart Rate (HR)
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">{currentVital.heartRate}</span>
                <span className="text-xs font-mono text-slate-400">bpm</span>
                <StatusBadge status={currentVital.heartRate > 100 ? 'warning' : 'normal'} size="sm" />
              </div>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayHistory} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#132742" vertical={false} />
                  <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[40, 150]} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#001f3f', borderColor: '#082a52', fontSize: '11px', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="pt-2 border-t border-[#113059] flex items-center justify-between text-[11px] text-slate-400">
              <span>Reference Range: 60–100 bpm</span>
              <span className="font-mono">{currentVital.simulatedTime}</span>
            </div>
          </div>

          {/* 2. SpO2 Oxygenation Chart */}
          <div className="bg-[#09152a] rounded-lg border border-[#113059] p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between border-b border-[#113059] pb-2.5 mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold font-mono tracking-wider text-sky-400 uppercase">
                  Oxygen Saturation (SpO₂)
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">{currentVital.spo2}</span>
                <span className="text-xs font-mono text-slate-400">%</span>
                <StatusBadge status={currentVital.spo2 < 90 ? 'critical' : currentVital.spo2 < 95 ? 'warning' : 'normal'} size="sm" />
              </div>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayHistory} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#132742" vertical={false} />
                  <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[75, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#001f3f', borderColor: '#082a52', fontSize: '11px', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="spo2" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="pt-2 border-t border-[#113059] flex items-center justify-between text-[11px] text-slate-400">
              <span>Reference Range: ≥ 95%</span>
              <span className="font-mono">{currentVital.simulatedTime}</span>
            </div>
          </div>

          {/* 3. Blood Pressure Chart (SBP, DBP, MAP) */}
          <div className="bg-[#09152a] rounded-lg border border-[#113059] p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between border-b border-[#113059] pb-2.5 mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold font-mono tracking-wider text-indigo-400 uppercase">
                  Arterial / NIBP Blood Pressure
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">
                  {currentVital.systolicBp}/{currentVital.diastolicBp}
                </span>
                <span className="text-xs font-mono text-slate-400">({currentVital.meanBp} MAP)</span>
                <StatusBadge status={currentVital.systolicBp > 140 ? 'warning' : 'normal'} size="sm" />
              </div>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayHistory} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#132742" vertical={false} />
                  <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[40, 180]} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#001f3f', borderColor: '#082a52', fontSize: '11px', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="systolicBp" name="Systolic" stroke="#818cf8" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="diastolicBp" name="Diastolic" stroke="#a5b4fc" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="meanBp" name="MAP" stroke="#fbbf24" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="pt-2 border-t border-[#113059] flex items-center justify-between text-[11px] text-slate-400">
              <span>Reference Range: 90–130 / 60–85 mmHg</span>
              <span className="font-mono">{currentVital.simulatedTime}</span>
            </div>
          </div>

          {/* 4. Respiratory Rate Chart */}
          <div className="bg-[#09152a] rounded-lg border border-[#113059] p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between border-b border-[#113059] pb-2.5 mb-2">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold font-mono tracking-wider text-teal-400 uppercase">
                  Respiratory Rate (RR)
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">{currentVital.respRate}</span>
                <span className="text-xs font-mono text-slate-400">bpm</span>
                <StatusBadge status={currentVital.respRate > 22 ? 'warning' : 'normal'} size="sm" />
              </div>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayHistory} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#132742" vertical={false} />
                  <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[8, 36]} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#001f3f', borderColor: '#082a52', fontSize: '11px', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="respRate" stroke="#2dd4bf" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="pt-2 border-t border-[#113059] flex items-center justify-between text-[11px] text-slate-400">
              <span>Reference Range: 12–20 bpm</span>
              <span className="font-mono">{currentVital.simulatedTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
