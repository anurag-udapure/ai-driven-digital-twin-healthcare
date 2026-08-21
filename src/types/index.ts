export type PatientSex = 'M' | 'F';

export interface Patient {
  subject_id: number;
  gender: PatientSex;
  anchor_age: number;
  anchor_year: number;
  dod?: string | null;
  hadm_id: number;
  stay_id: number;
  admission_type: string;
  admission_location: string;
  insurance: string;
  care_unit: string;
  intime: string;
  outtime?: string;
  chief_complaint: string;
  baseline_condition: string;
}

export interface VitalSign {
  id: string;
  parameter: 'heart_rate' | 'spo2' | 'systolic_bp' | 'diastolic_bp' | 'mean_bp' | 'resp_rate' | 'temperature';
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
  source: 'MIMIC-IV Demo' | 'Simulated Real-Time Stream';
  minThreshold: number;
  maxThreshold: number;
}

export interface VitalHistoryPoint {
  timestamp: string;
  simulatedTime: string;
  heartRate: number;
  spo2: number;
  systolicBp: number;
  diastolicBp: number;
  meanBp: number;
  respRate: number;
  temperature: number;
  source: 'MIMIC-IV Demo' | 'Simulated Real-Time Stream';
}

export interface DiagnosisICD {
  subject_id: number;
  hadm_id: number;
  seq_num: number;
  icd_code: string;
  icd_version: 9 | 10;
  long_title: string;
  category: string;
}

export interface LabEvent {
  labevent_id: number;
  subject_id: number;
  hadm_id: number;
  itemid: number;
  label: string;
  category: string;
  charttime: string;
  valuenum: number;
  valueuom: string;
  flag: 'normal' | 'abnormal' | null;
  ref_range_lower?: number;
  ref_range_upper?: number;
}

export interface Prescription {
  subject_id: number;
  hadm_id: number;
  starttime: string;
  stoptime: string;
  drug: string;
  dose_val_rx: string;
  dose_unit_rx: string;
  route: string;
  status: string;
}

export interface AlertEvent {
  id: string;
  timestamp: string;
  subject_id: number;
  parameter: string;
  event: string;
  severity: 'information' | 'monitoring' | 'warning' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  source: 'MIMIC-IV Event' | 'Simulated Stream Threshold' | 'Clinical Rule Engine';
  valueText?: string;
  acknowledgedAt?: string;
  notes?: string;
}

export interface DigitalTwinState {
  subject_id: number;
  twin_status: 'Stable' | 'Monitoring' | 'Attention' | 'Critical';
  last_sync: string;
  cardiovascular_health: number; // 0-100 score
  pulmonary_health: number; // 0-100 score
  renal_metabolic_health: number; // 0-100 score
  systemic_stability: number; // 0-100 score
  parameters: {
    heart_rate: VitalSign;
    spo2: VitalSign;
    blood_pressure: {
      systolic: number;
      diastolic: number;
      mean: number;
      unit: string;
      status: 'normal' | 'warning' | 'critical';
      source: 'MIMIC-IV Demo' | 'Simulated Real-Time Stream';
    };
    resp_rate: VitalSign;
    temperature: VitalSign;
  };
  state_vector: {
    hr_norm: number;
    spo2_norm: number;
    bp_sys_norm: number;
    bp_dia_norm: number;
    rr_norm: number;
    temp_norm: number;
    lactate_risk: number;
    wbc_risk: number;
  };
}

export interface SimulationConfig {
  isRunning: boolean;
  speed: 0.5 | 1 | 2 | 5 | 10;
  mode: 'mimic_sequential' | 'clinical_stress' | 'hypotension_shock' | 'tachycardia_arrhythmia';
  currentTimeIndex: number;
  simulatedTime: string;
}

export interface BackendModelStatus {
  model_name: 'CNN-BiLSTM';
  endpoint_url: string;
  is_connected: boolean;
  last_ping: string | null;
  status_message: string;
  features_ready: boolean;
}
