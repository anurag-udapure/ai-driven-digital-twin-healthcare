import { dataService } from '../services/dataService';
import { Patient, DiagnosisICD, LabEvent, Prescription, VitalHistoryPoint, AlertEvent } from '../types';

export const MIMIC_PATIENTS: Patient[] = dataService.getPatients();

export const MIMIC_DIAGNOSES: DiagnosisICD[] = MIMIC_PATIENTS.flatMap(p => dataService.getDiagnoses(p.stay_id));

export const MIMIC_LABS: LabEvent[] = MIMIC_PATIENTS.flatMap(p => dataService.getLabs(p.stay_id));

export const MIMIC_PRESCRIPTIONS: Prescription[] = MIMIC_PATIENTS.flatMap(p => dataService.getMedications(p.stay_id));

export const MIMIC_HISTORICAL_TIMESERIES: Record<number, VitalHistoryPoint[]> = MIMIC_PATIENTS.reduce((acc, p) => {
  const vh = dataService.getVitalsHistory(p.stay_id);
  acc[p.stay_id] = vh;
  acc[p.subject_id] = vh;
  return acc;
}, {} as Record<number, VitalHistoryPoint[]>);

export const INITIAL_ALERTS: AlertEvent[] = dataService.getInitialAlerts();
