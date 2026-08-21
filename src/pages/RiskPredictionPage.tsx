import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Layers, 
  Cpu, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Code, 
  FileJson, 
  RefreshCw, 
  ExternalLink,
  ShieldAlert,
  Server,
  Zap
} from 'lucide-react';
import { Patient, VitalHistoryPoint } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PipelineFlow } from '../components/common/PipelineFlow';
import { apiService } from '../services/apiService';
import { MIMIC_LABS } from '../data/mimicData';

interface RiskPredictionPageProps {
  patient: Patient;
  currentVital: VitalHistoryPoint;
  history: VitalHistoryPoint[];
}

export const RiskPredictionPage: React.FC<RiskPredictionPageProps> = ({
  patient,
  currentVital,
  history
}) => {
  const [backendUrl, setBackendUrl] = useState(apiService.getBackendUrl());
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'features' | 'api_schema'>('architecture');

  const modelStatus = apiService.getModelStatus();
  const featurePayload = apiService.formatFeaturePayload(patient, history, MIMIC_LABS);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);
    try {
      const res = await apiService.testBackendConnection(backendUrl);
      setConnectionResult(res);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div id="page-risk-prediction" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Architecture Pipeline Visualizer */}
      <PipelineFlow id="risk-architecture-pipeline" activeStage={4} />

      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Deep Learning Clinical Risk Prediction
            </h2>
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
              Model: CNN-BiLSTM
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Temporal feature extraction and risk scoring architecture for patient #{patient.subject_id}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status="pending" label="Status: Integration Pending" size="lg" />
        </div>
      </div>

      {/* Strict Academic Integrity Notice */}
      <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4.5 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900 text-sm">Academic Prototype & Data Integrity Policy</h4>
          <p className="text-amber-900/90 leading-relaxed">
            In adherence to scientific rigor and clinical software standards, this prototype <strong>does not fabricate model performance metrics</strong> (such as synthetic accuracy, precision, recall, or AUC scores) or generate ungrounded diagnostic claims.
          </p>
          <p className="text-amber-900/90 font-mono text-[11px] pt-1">
            Output state: <strong>Prediction unavailable — CNN-BiLSTM integration pending.</strong>
          </p>
        </div>
      </div>

      {/* Main Grid: Input Features & Model Specification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Parameters & Extracted Clinical Features (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Input Feature Tensor (24-Step Vector)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-medium">
              Sequence Length: {history.length}
            </span>
          </div>

          {/* Demographics & Static Features */}
          <div className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-900 block">1. Demographic & Baseline Inputs</span>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">Subject ID</span>
                <span className="font-bold text-slate-800">{patient.subject_id}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">Age (Years)</span>
                <span className="font-bold text-slate-800">{patient.anchor_age}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">Gender Encoded</span>
                <span className="font-bold text-slate-800">{patient.gender === 'M' ? '1 (Male)' : '0 (Female)'}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Physiological Channels */}
          <div className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-900 block">2. Dynamic Multi-Channel Time-Series Features</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">Heart Rate Channel</span>
                <span className="font-semibold text-slate-800">Current: {currentVital.heartRate} bpm</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">SpO₂ Channel</span>
                <span className="font-semibold text-slate-800">Current: {currentVital.spo2}%</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">Blood Pressure (SBP/DBP)</span>
                <span className="font-semibold text-slate-800">Current: {currentVital.systolicBp}/{currentVital.diastolicBp}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">Respiratory Rate</span>
                <span className="font-semibold text-slate-800">Current: {currentVital.respRate} bpm</span>
              </div>
            </div>
          </div>

          {/* Static Laboratory Panels */}
          <div className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-900 block">3. MIMIC-IV Clinical Chemistry / Lab Panels</span>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">WBC</span>
                <span className="font-bold text-slate-800">{featurePayload.features.static_labs.wbc ?? 'N/A'} K/uL</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">Creatinine</span>
                <span className="font-bold text-slate-800">{featurePayload.features.static_labs.creatinine ?? 'N/A'} mg/dL</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-sans font-medium">Lactate</span>
                <span className="font-bold text-slate-800">{featurePayload.features.static_labs.lactate ?? 'N/A'} mmol/L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Model Architecture Blueprint & Prediction Output Area (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Prediction Area (Ready for Backend Model Output) */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Model Prediction Output Area
                </h3>
              </div>
              <span className="text-xs font-mono font-medium text-slate-500">Target: Hemodynamic Instability Risk</span>
            </div>

            {/* Prediction Placeholder */}
            <div className="p-6 bg-slate-50/80 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">
                Prediction Unavailable — Model Integration Pending
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Connect your Python PyTorch / TensorFlow service running the trained CNN-BiLSTM weight checkpoint to stream live risk scores and anomaly detection probabilities.
              </p>
            </div>

            {/* Architecture Details Blueprint */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Target Model Pipeline: CNN-BiLSTM
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-700">
                <div className="p-2.5 bg-sky-50/60 rounded-lg border border-sky-100">
                  <strong className="block text-sky-950 mb-1">1D-CNN Layer</strong>
                  <p className="text-[11px] text-sky-900/80 leading-tight">
                    Spatial feature extraction across local vital correlations (Filters: 64, Kernel: 3).
                  </p>
                </div>
                <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100">
                  <strong className="block text-blue-950 mb-1">BiLSTM Layer</strong>
                  <p className="text-[11px] text-blue-900/80 leading-tight">
                    Bidirectional temporal memory tracking physiological trajectories (Units: 128).
                  </p>
                </div>
                <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100">
                  <strong className="block text-emerald-950 mb-1">Attention & Dense</strong>
                  <p className="text-[11px] text-emerald-900/80 leading-tight">
                    Feature weighting and calibrated sigmoid risk classification score.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Backend Connection & API Integration Hook */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Python Backend Integration Hook
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 font-medium">FastAPI / Flask Connector</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-600 font-medium block">
                Backend Endpoint URL:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={backendUrl}
                  onChange={e => setBackendUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="flex-1 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="px-3.5 py-2 bg-[#001f3f] hover:bg-[#002f5e] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {isTestingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  <span>Test Hook</span>
                </button>
              </div>

              {connectionResult && (
                <div
                  className={`p-2.5 rounded-lg text-xs border ${
                    connectionResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {connectionResult.message}
                </div>
              )}
            </div>

            {/* Inspect JSON Payload preview */}
            <details className="mt-2 text-xs">
              <summary className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer select-none">
                View Formatted Feature Tensor JSON (Payload for /predict)
              </summary>
              <pre className="mt-2 p-3 bg-[#001f3f] text-slate-200 rounded-lg text-[10px] font-mono overflow-x-auto max-h-48 border border-[#0d2a4d]">
                {JSON.stringify(featurePayload, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};
