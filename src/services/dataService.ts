import mimicDataJson from '../data/mimic_iv_digital_twin_data.json';
import { MimicRawPatient } from '../types/mimicRaw';
import {
  Patient,
  DiagnosisICD,
  LabEvent,
  Prescription,
  VitalHistoryPoint,
  AlertEvent
} from '../types';

export interface MimicDatasetMetadata {
  dataset: string;
  purpose: string;
  patients_included: number;
  vital_sampling: string;
  simulation_note: string;
  model_status: string;
  null_policy: string;
  vital_item_mapping: Record<string, { field: string; label: string; unit: string }>;
}

export class DataService {
  private rawData: {
    metadata: MimicDatasetMetadata;
    patients: MimicRawPatient[];
  };

  constructor() {
    this.rawData = mimicDataJson as any;
  }

  public getMetadata(): MimicDatasetMetadata {
    return this.rawData.metadata;
  }

  public getRawPatients(): MimicRawPatient[] {
    return this.rawData.patients || [];
  }

  public getRawPatientById(identifier: number): MimicRawPatient | undefined {
    return this.rawData.patients.find(p => p.icu_stay.stay_id === identifier || p.subject_id === identifier);
  }

  public getPatients(): Patient[] {
    return this.rawData.patients.map((p) => {
      // Derive readable chief complaint & baseline from diagnoses
      const topDiag = p.diagnoses?.[0]?.description || 'Intensive Care Observation';
      const secondDiag = p.diagnoses?.[1]?.description || '';
      const chiefComplaint = secondDiag ? `${topDiag}; ${secondDiag}` : topDiag;

      // Extract anchor year from anchor_year_group (e.g. "2014 - 2016" -> 2014)
      const yearMatch = p.demographics.anchor_year_group?.match(/\d{4}/);
      const anchor_year = yearMatch ? parseInt(yearMatch[0], 10) : 2140;

      return {
        subject_id: p.subject_id,
        gender: p.demographics.gender,
        anchor_age: p.demographics.anchor_age,
        anchor_year: anchor_year,
        dod: p.admission.hospital_expire_flag === 1 ? p.icu_stay.outtime : null,
        hadm_id: p.admission.hadm_id,
        stay_id: p.icu_stay.stay_id,
        admission_type: p.admission.admission_type,
        admission_location: p.admission.admission_location,
        insurance: p.admission.insurance,
        care_unit: p.icu_stay.first_careunit || p.icu_stay.last_careunit || 'Intensive Care Unit',
        intime: p.icu_stay.intime,
        outtime: p.icu_stay.outtime,
        chief_complaint: chiefComplaint,
        baseline_condition: `${p.admission.race} • ${p.demographics.gender === 'F' ? 'Female' : 'Male'} • ${p.demographics.anchor_age}y • ${p.admission.admission_type}`
      };
    });
  }

  public getPatientById(identifier: number): Patient | undefined {
    const patients = this.getPatients();
    return patients.find(p => p.stay_id === identifier || p.subject_id === identifier);
  }

  public getCurrentVitals(identifier: number) {
    const p = this.getRawPatientById(identifier);
    return p ? p.current_vitals : null;
  }

  public getVitalsHistory(identifier: number): VitalHistoryPoint[] {
    const p = this.getRawPatientById(identifier);
    if (!p || !p.vitals_history) return [];

    let lastKnownHR = p.current_vitals.heart_rate ?? 80;
    let lastKnownSpO2 = p.current_vitals.spo2 ?? 98;
    let lastKnownSys = p.current_vitals.bp_systolic ?? 120;
    let lastKnownDia = p.current_vitals.bp_diastolic ?? 75;
    let lastKnownRR = p.current_vitals.respiratory_rate ?? 18;

    return p.vitals_history.map((vh, index) => {
      // Forward-fill null vitals or provide exact observation
      const hr = vh.heart_rate ?? lastKnownHR;
      const spo2 = vh.spo2 ?? lastKnownSpO2;
      const sys = vh.bp_systolic ?? lastKnownSys;
      const dia = vh.bp_diastolic ?? lastKnownDia;
      const rr = vh.respiratory_rate ?? lastKnownRR;
      const mean = vh.bp_mean ?? Math.round((sys + 2 * dia) / 3);

      if (vh.heart_rate != null) lastKnownHR = vh.heart_rate;
      if (vh.spo2 != null) lastKnownSpO2 = vh.spo2;
      if (vh.bp_systolic != null) lastKnownSys = vh.bp_systolic;
      if (vh.bp_diastolic != null) lastKnownDia = vh.bp_diastolic;
      if (vh.respiratory_rate != null) lastKnownRR = vh.respiratory_rate;

      // Extract time portion for display (HH:mm)
      let timeLabel = vh.timestamp;
      try {
        const d = new Date(vh.timestamp);
        timeLabel = d.toTimeString().substring(0, 5);
      } catch {
        timeLabel = `T+${index * 30}m`;
      }

      return {
        timestamp: timeLabel,
        simulatedTime: vh.timestamp.replace('T', ' '),
        heartRate: hr,
        spo2: spo2,
        systolicBp: sys,
        diastolicBp: dia,
        meanBp: mean,
        respRate: rr,
        temperature: 37.0,
        source: 'MIMIC-IV Demo' as const
      };
    });
  }

  public getLabs(identifier: number): LabEvent[] {
    const p = this.getRawPatientById(identifier);
    if (!p || !p.laboratory_results) return [];

    return p.laboratory_results.map((lab, idx) => ({
      labevent_id: 600000 + (p.icu_stay.stay_id % 10000) * 100 + idx,
      subject_id: p.subject_id,
      hadm_id: p.admission.hadm_id,
      itemid: 50000 + idx,
      label: lab.label,
      category: 'Clinical Chemistry / Hematology',
      charttime: lab.timestamp.replace('T', ' '),
      valuenum: lab.value ?? 0,
      valueuom: lab.unit,
      flag: lab.flag,
      ref_range_lower: lab.reference_low ?? undefined,
      ref_range_upper: lab.reference_high ?? undefined
    }));
  }

  public getDiagnoses(identifier: number): DiagnosisICD[] {
    const p = this.getRawPatientById(identifier);
    if (!p || !p.diagnoses) return [];

    return p.diagnoses.map((diag, idx) => ({
      subject_id: p.subject_id,
      hadm_id: p.admission.hadm_id,
      seq_num: idx + 1,
      icd_code: diag.icd_code,
      icd_version: (diag.icd_version === 9 ? 9 : 10) as 9 | 10,
      long_title: diag.description,
      category: this.categorizeIcd(diag.icd_code, diag.description)
    }));
  }

  public getMedications(identifier: number): Prescription[] {
    const p = this.getRawPatientById(identifier);
    if (!p || !p.medications) return [];

    return p.medications.map(med => ({
      subject_id: p.subject_id,
      hadm_id: p.admission.hadm_id,
      starttime: med.starttime.replace('T', ' '),
      stoptime: med.stoptime,
      drug: med.drug,
      dose_val_rx: med.dose,
      dose_unit_rx: med.dose_unit,
      route: med.route,
      status: 'Active / Administered'
    }));
  }

  public getInitialAlerts(): AlertEvent[] {
    const alerts: AlertEvent[] = [];
    const patients = this.getRawPatients();

    patients.forEach((p) => {
      // Check lab abnormalities for initial alerts
      p.laboratory_results.forEach((lab, lIdx) => {
        if (lab.flag === 'abnormal') {
          alerts.push({
            id: `ALT-MIMIC-LAB-${p.icu_stay.stay_id}-${lIdx}`,
            timestamp: lab.timestamp.replace('T', ' '),
            subject_id: p.subject_id,
            parameter: lab.label,
            event: `Abnormal Laboratory Event: ${lab.label} = ${lab.value} ${lab.unit} (Ref: ${lab.reference_low ?? '—'}–${lab.reference_high ?? '—'} ${lab.unit})`,
            severity: lab.test === 'creatinine' && (lab.value || 0) > 3.5 ? 'critical' : 'warning',
            status: 'active',
            source: 'MIMIC-IV Event',
            valueText: `${lab.value} ${lab.unit}`,
            notes: `Recorded in MIMIC-IV Clinical Database Demo 2.2 for Subject #${p.subject_id} (Stay #${p.icu_stay.stay_id})`
          });
        }
      });

      // Check current vitals for critical values
      if (p.current_vitals.heart_rate && (p.current_vitals.heart_rate > 130 || p.current_vitals.heart_rate < 50)) {
        alerts.push({
          id: `ALT-MIMIC-VIT-HR-${p.icu_stay.stay_id}`,
          timestamp: p.icu_stay.intime.replace('T', ' '),
          subject_id: p.subject_id,
          parameter: 'Heart Rate',
          event: `Extreme Heart Rate: ${p.current_vitals.heart_rate} bpm`,
          severity: 'critical',
          status: 'active',
          source: 'MIMIC-IV Event',
          valueText: `${p.current_vitals.heart_rate} bpm`,
          notes: `MIMIC-IV ICU arrival / observed threshold event for Stay #${p.icu_stay.stay_id}`
        });
      }

      if (p.current_vitals.bp_systolic && p.current_vitals.bp_systolic < 70) {
        alerts.push({
          id: `ALT-MIMIC-VIT-BP-${p.icu_stay.stay_id}`,
          timestamp: p.icu_stay.intime.replace('T', ' '),
          subject_id: p.subject_id,
          parameter: 'Blood Pressure Shock',
          event: `Severe hypotension observed: SBP ${p.current_vitals.bp_systolic} mmHg`,
          severity: 'critical',
          status: 'active',
          source: 'MIMIC-IV Event',
          valueText: `${p.current_vitals.bp_systolic}/${p.current_vitals.bp_diastolic} mmHg`,
          notes: `MIMIC-IV hemodynamic instability finding for Stay #${p.icu_stay.stay_id}`
        });
      }
    });

    return alerts;
  }

  private categorizeIcd(code: string, desc: string): string {
    const c = code.toUpperCase();
    const d = desc.toLowerCase();
    if (c.startsWith('I') || d.includes('heart') || d.includes('infarction') || d.includes('cardiac')) return 'Cardiovascular';
    if (c.startsWith('J') || d.includes('respiratory') || d.includes('pneumon') || d.includes('hypoxia')) return 'Pulmonary';
    if (c.startsWith('N') || d.includes('kidney') || d.includes('renal')) return 'Renal';
    if (c.startsWith('K') || d.includes('liver') || d.includes('cirrhosis') || d.includes('peritoneum')) return 'Gastrointestinal';
    if (c.startsWith('A') || c.startsWith('B') || d.includes('sepsis')) return 'Infectious / Sepsis';
    if (c.startsWith('D') || d.includes('anemia') || d.includes('hemoglobin')) return 'Hematologic';
    if (c.startsWith('C') || d.includes('tumor') || d.includes('myeloma') || d.includes('malignant')) return 'Oncology';
    if (c.startsWith('E') || d.includes('diabetes') || d.includes('metabolic')) return 'Endocrine / Metabolic';
    if (c.startsWith('G') || d.includes('encephalopathy') || d.includes('brain')) return 'Neurologic';
    if (c.startsWith('T') || c.startsWith('R') || d.includes('shock') || d.includes('wound')) return 'Critical Care / Shock';
    return 'Clinical Observation';
  }
}

export const dataService = new DataService();
