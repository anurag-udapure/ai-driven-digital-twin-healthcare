import React, { useState } from 'react';
import { 
  History, 
  User, 
  FileText, 
  Activity, 
  FlaskConical, 
  Pill, 
  Calendar, 
  Building, 
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle
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
import { Patient, DiagnosisICD, LabEvent, Prescription, VitalHistoryPoint } from '../types';
import { MIMIC_PATIENTS, MIMIC_DIAGNOSES, MIMIC_LABS, MIMIC_PRESCRIPTIONS, MIMIC_HISTORICAL_TIMESERIES } from '../data/mimicData';
import { StatusBadge } from '../components/common/StatusBadge';

interface PatientHistoryPageProps {
  selectedPatient: Patient;
  onSelectPatient: (patientId: number) => void;
}

export const PatientHistoryPage: React.FC<PatientHistoryPageProps> = ({
  selectedPatient,
  onSelectPatient
}) => {
  const [activeTab, setActiveTab] = useState<'vitals' | 'diagnoses' | 'labs' | 'prescriptions' | 'table'>('vitals');
  const [labCategoryFilter, setLabCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const patientHistoricalPoints = MIMIC_HISTORICAL_TIMESERIES[selectedPatient.stay_id] || MIMIC_HISTORICAL_TIMESERIES[selectedPatient.subject_id] || [];
  const patientDiagnoses = MIMIC_DIAGNOSES.filter(d => (d.hadm_id ? d.hadm_id === selectedPatient.hadm_id : d.subject_id === selectedPatient.subject_id));
  const patientLabs = MIMIC_LABS.filter(l => (l.hadm_id ? l.hadm_id === selectedPatient.hadm_id : l.subject_id === selectedPatient.subject_id));
  const patientPrescriptions = MIMIC_PRESCRIPTIONS.filter(p => (p.hadm_id ? p.hadm_id === selectedPatient.hadm_id : p.subject_id === selectedPatient.subject_id));

  const filteredLabs = patientLabs.filter(l => {
    if (labCategoryFilter !== 'all' && l.category !== labCategoryFilter) return false;
    if (searchTerm.trim() && !l.label.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div id="page-patient-history" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Patient Header & Quick Selector */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Electronic Health Record & History
            </h2>
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
              MIMIC-IV Demo 2.2 Dataset
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Subject ID: <strong className="text-slate-800">#{selectedPatient.subject_id}</strong> • Stay ID: #{selectedPatient.stay_id} • Care Unit: {selectedPatient.care_unit}
          </p>
        </div>

        {/* Patient Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Select Record:</span>
          <select
            value={selectedPatient.stay_id}
            onChange={e => onSelectPatient(Number(e.target.value))}
            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {MIMIC_PATIENTS.map(p => (
              <option key={p.stay_id} value={p.stay_id}>
                Patient #{p.subject_id} (Stay #{p.stay_id}, {p.gender}, {p.anchor_age}y) — {p.care_unit}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Structured Patient Meta Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-400 block mb-1">Patient Details</span>
          <div className="text-sm font-bold text-slate-900">
            {selectedPatient.anchor_age} yrs • {selectedPatient.gender === 'M' ? 'Male' : 'Female'}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Anchor Year: {selectedPatient.anchor_year}</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-400 block mb-1">Admission Info</span>
          <div className="text-sm font-bold text-slate-900">{selectedPatient.admission_type}</div>
          <span className="text-[11px] text-slate-500 font-medium">From: {selectedPatient.admission_location}</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-400 block mb-1">ICU Stay & Care Unit</span>
          <div className="text-sm font-bold text-slate-900">{selectedPatient.care_unit}</div>
          <span className="text-[11px] text-slate-500 font-mono">In: {selectedPatient.intime.substring(0, 10)}</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-400 block mb-1">Insurance / Payer</span>
          <div className="text-sm font-bold text-slate-900">{selectedPatient.insurance}</div>
          <span className="text-[11px] text-slate-500 font-medium">HADM: #{selectedPatient.hadm_id}</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-1.5 shadow-xs flex flex-wrap items-center gap-1.5">
        {[
          { id: 'vitals', label: 'Vital Signs History (Chartevents)', icon: <Activity className="w-3.5 h-3.5" /> },
          { id: 'diagnoses', label: 'ICD-10 Diagnoses', icon: <FileText className="w-3.5 h-3.5" />, count: patientDiagnoses.length },
          { id: 'labs', label: 'Laboratory Panels (Labevents)', icon: <FlaskConical className="w-3.5 h-3.5" />, count: patientLabs.length },
          { id: 'prescriptions', label: 'Medications (Prescriptions)', icon: <Pill className="w-3.5 h-3.5" />, count: patientPrescriptions.length },
          { id: 'table', label: 'Unified History Log', icon: <History className="w-3.5 h-3.5" /> }
        ].map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#001f3f] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === tab.id ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {/* 1. Vital Signs History Tab */}
      {activeTab === 'vitals' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                MIMIC-IV Retrospective Vital Time Series (24-Hour Observation Window)
              </h3>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                Ground-truth observations logged in chartevents table for Subject #{selectedPatient.subject_id}
              </p>
            </div>
            <span className="text-[10px] font-bold bg-sky-50 text-sky-800 px-2 py-0.5 rounded-md border border-sky-200">
              Source: MIMIC-IV Demo
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patientHistoricalPoints} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[40, 180]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#001f3f', color: '#fff', fontSize: '11px', borderRadius: '8px', border: '1px solid #113059' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#e11d48" strokeWidth={2} />
                <Line type="monotone" dataKey="spo2" name="SpO₂ (%)" stroke="#0284c7" strokeWidth={2} />
                <Line type="monotone" dataKey="systolicBp" name="Systolic BP (mmHg)" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="diastolicBp" name="Diastolic BP (mmHg)" stroke="#a5b4fc" strokeWidth={1.5} />
                <Line type="monotone" dataKey="respRate" name="Resp Rate (bpm)" stroke="#0d9488" strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 2. Diagnoses Tab */}
      {activeTab === 'diagnoses' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 bg-[#001f3f] text-white border-b border-[#0d2a4d] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              ICD-9 / ICD-10 Diagnoses (from diagnoses_icd table)
            </h3>
            <span className="text-xs text-slate-300 font-mono">HADM ID #{selectedPatient.hadm_id}</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Seq</th>
                <th className="px-4 py-3">ICD Code</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Clinical Diagnosis Description</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Data Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientDiagnoses.map((d, idx) => (
                <tr key={`${d.icd_code}-${d.seq_num}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-500 font-medium">{d.seq_num}</td>
                  <td className="px-4 py-3 font-mono font-bold text-sky-800">{d.icd_code}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 font-bold text-slate-700">
                      {d.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{d.long_title}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">ICD-{d.icd_version}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-sky-50 text-sky-800 border border-sky-200 font-medium">
                      MIMIC-IV Demo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Laboratory Panels Tab */}
      {activeTab === 'labs' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden space-y-0">
          <div className="p-4 bg-[#001f3f] text-white border-b border-[#0d2a4d] flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Clinical Laboratory Measurements (from labevents table)
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter lab name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="text-xs bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Charttime</th>
                <th className="px-4 py-3">Item / Test</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Result Value</th>
                <th className="px-4 py-3">Reference Range</th>
                <th className="px-4 py-3">Flag</th>
                <th className="px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLabs.map((lab, idx) => (
                <tr key={`${lab.labevent_id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-600 font-medium">{lab.charttime}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{lab.label}</td>
                  <td className="px-4 py-3 text-slate-500 font-medium">{lab.category}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {lab.valuenum} {lab.valueuom}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500">
                    {lab.ref_range_lower !== undefined ? `${lab.ref_range_lower} - ${lab.ref_range_upper} ${lab.valueuom}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={lab.flag === 'abnormal' ? 'warning' : 'normal'}
                      label={lab.flag === 'abnormal' ? 'Abnormal' : 'Normal'}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-sky-50 text-sky-800 border border-sky-200 font-medium">
                      MIMIC-IV Demo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 bg-[#001f3f] text-white border-b border-[#0d2a4d] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Medication Administration & MAR (from prescriptions table)
            </h3>
            <span className="text-xs text-slate-300 font-mono">HADM ID #{selectedPatient.hadm_id}</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Drug Name</th>
                <th className="px-4 py-3">Dose</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Start Time</th>
                <th className="px-4 py-3">Stop Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientPrescriptions.map((rx, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{rx.drug}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">
                    {rx.dose_val_rx} {rx.dose_unit_rx}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 font-medium">{rx.route}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{rx.starttime}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{rx.stoptime}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status="active" label={rx.status} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-sky-50 text-sky-800 border border-sky-200 font-medium">
                      MIMIC-IV Demo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Unified History Log Table */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 bg-[#001f3f] text-white border-b border-[#0d2a4d] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Chronological Observation Table (Unified Chartevents & Clinical Events)
            </h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Parameter / Event</th>
                <th className="px-4 py-3">Observed Value</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {patientHistoricalPoints.map((pt, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-600 font-medium">{pt.simulatedTime}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    Hemodynamic Panel (HR, SpO2, BP, RR)
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-800">
                    HR: {pt.heartRate} bpm | SpO₂: {pt.spo2}% | BP: {pt.systolicBp}/{pt.diastolicBp} mmHg | RR: {pt.respRate} bpm
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={pt.heartRate > 100 || pt.spo2 < 92 ? 'warning' : 'normal'}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                      {pt.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
