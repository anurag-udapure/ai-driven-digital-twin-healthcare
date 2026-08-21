import { MIMIC_PATIENTS, MIMIC_HISTORICAL_TIMESERIES } from '../data/mimicData';
import { VitalHistoryPoint, DigitalTwinState, AlertEvent, Patient } from '../types';

export type SimulationListener = (data: {
  patient: Patient;
  currentVital: VitalHistoryPoint;
  history: VitalHistoryPoint[];
  twinState: DigitalTwinState;
  newAlert?: AlertEvent;
}) => void;

class SimulationService {
  private currentPatientId: number = MIMIC_PATIENTS[0]?.stay_id || MIMIC_PATIENTS[0]?.subject_id || 10039708;
  private isRunning: boolean = true;
  private speed: number = 1;
  private timeIndex: number = 0;
  private timer: number | null = null;
  private listeners: Set<SimulationListener> = new Set();
  private mode: 'mimic_sequential' | 'clinical_stress' | 'hypotension_shock' | 'tachycardia_arrhythmia' = 'mimic_sequential';
  
  // Real-time dynamic buffer
  private patientBuffers: Map<number, VitalHistoryPoint[]> = new Map();
  private simulatedTimeOffset: number = 0; // seconds

  constructor() {
    this.initBuffers();
    this.startLoop();
  }

  private initBuffers() {
    MIMIC_PATIENTS.forEach(p => {
      const hist = MIMIC_HISTORICAL_TIMESERIES[p.stay_id] || MIMIC_HISTORICAL_TIMESERIES[p.subject_id] || [];
      // Initialize with up to first 8 historical points
      const initialSlice = hist.slice(0, Math.min(8, hist.length));
      this.patientBuffers.set(p.stay_id, [...initialSlice]);
      this.patientBuffers.set(p.subject_id, [...initialSlice]);
    });
  }

  public setPatient(patientId: number) {
    this.currentPatientId = patientId;
    this.timeIndex = 0;
    this.simulatedTimeOffset = 0;
    this.notifyListeners();
  }

  public getSelectedPatient(): Patient {
    const p = MIMIC_PATIENTS.find(pt => pt.stay_id === this.currentPatientId || pt.subject_id === this.currentPatientId);
    return p || MIMIC_PATIENTS[0];
  }

  public setSpeed(speed: 0.5 | 1 | 2 | 5 | 10) {
    this.speed = speed;
    this.restartLoop();
  }

  public getSpeed(): number {
    return this.speed;
  }

  public setMode(mode: 'mimic_sequential' | 'clinical_stress' | 'hypotension_shock' | 'tachycardia_arrhythmia') {
    this.mode = mode;
  }

  public getMode() {
    return this.mode;
  }

  public isSimulationRunning(): boolean {
    return this.isRunning;
  }

  public start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startLoop();
      this.notifyListeners();
    }
  }

  public pause() {
    this.isRunning = false;
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.notifyListeners();
  }

  public reset() {
    this.timeIndex = 0;
    this.simulatedTimeOffset = 0;
    this.initBuffers();
    this.notifyListeners();
  }

  public subscribe(listener: SimulationListener): () => void {
    this.listeners.add(listener);
    // Send immediate initial snapshot
    listener(this.getCurrentSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private startLoop() {
    if (this.timer) {
      window.clearInterval(this.timer);
    }
    const intervalMs = Math.max(150, Math.floor(1500 / this.speed));
    this.timer = window.setInterval(() => {
      if (this.isRunning) {
        this.tick();
      }
    }, intervalMs);
  }

  private restartLoop() {
    if (this.isRunning) {
      this.startLoop();
    }
  }

  private tick() {
    const patient = this.getSelectedPatient();
    const hist = MIMIC_HISTORICAL_TIMESERIES[patient.stay_id] || MIMIC_HISTORICAL_TIMESERIES[patient.subject_id] || [];
    const buffer = this.patientBuffers.get(patient.stay_id) || this.patientBuffers.get(patient.subject_id) || [];
    
    this.timeIndex++;
    this.simulatedTimeOffset += 60; // 1 simulated min per step

    let newPoint: VitalHistoryPoint;
    let newAlert: AlertEvent | undefined = undefined;

    if (this.mode === 'mimic_sequential' && this.timeIndex < hist.length) {
      // Replaying authentic MIMIC-IV observation sequence
      const base = hist[this.timeIndex];
      // Subtle micro-variations for continuous clinical physiological display
      const microJitter = (Math.random() - 0.5) * 1.2;
      newPoint = {
        timestamp: this.formatTime(this.simulatedTimeOffset),
        simulatedTime: base.simulatedTime,
        heartRate: Math.round(base.heartRate + microJitter),
        spo2: Math.min(100, Math.max(80, Math.round(base.spo2 + (Math.random() - 0.5) * 0.5))),
        systolicBp: Math.round(base.systolicBp + microJitter * 1.5),
        diastolicBp: Math.round(base.diastolicBp + microJitter),
        meanBp: Math.round((base.systolicBp + 2 * base.diastolicBp) / 3),
        respRate: Math.round(base.respRate + (Math.random() - 0.5) * 0.8),
        temperature: Number((base.temperature + (Math.random() - 0.5) * 0.05).toFixed(1)),
        source: 'MIMIC-IV Demo'
      };
    } else {
      // Continuous stream or perturbation mode
      const lastPoint = buffer[buffer.length - 1] || hist[0] || {
        timestamp: '00:00',
        simulatedTime: patient.intime,
        heartRate: 80,
        spo2: 97,
        systolicBp: 125,
        diastolicBp: 80,
        meanBp: 95,
        respRate: 16,
        temperature: 37.0,
        source: 'Simulated Real-Time Stream'
      };

      let hrTarget = lastPoint.heartRate;
      let spo2Target = lastPoint.spo2;
      let sysTarget = lastPoint.systolicBp;
      let diaTarget = lastPoint.diastolicBp;
      let rrTarget = lastPoint.respRate;
      let tempTarget = lastPoint.temperature;

      if (this.mode === 'clinical_stress') {
        hrTarget = Math.min(135, hrTarget + 2);
        spo2Target = Math.max(88, spo2Target - 1);
        sysTarget = Math.min(168, sysTarget + 2);
        rrTarget = Math.min(28, rrTarget + 1);
      } else if (this.mode === 'hypotension_shock') {
        sysTarget = Math.max(78, sysTarget - 3);
        diaTarget = Math.max(45, diaTarget - 2);
        hrTarget = Math.min(125, hrTarget + 1.5);
      } else if (this.mode === 'tachycardia_arrhythmia') {
        hrTarget = Math.min(148, hrTarget + 4 + (Math.random() * 6 - 3));
      } else {
        // Natural physiological homeostasis drift
        const targetHR = patient.subject_id === 10001884 ? 94 : patient.subject_id === 10000980 ? 82 : 78;
        const targetSpO2 = patient.subject_id === 10001884 ? 92 : 97;
        const targetSys = patient.subject_id === 10000032 ? 102 : 128;
        
        hrTarget = hrTarget + (targetHR - hrTarget) * 0.1 + (Math.random() - 0.5) * 2;
        spo2Target = spo2Target + (targetSpO2 - spo2Target) * 0.1 + (Math.random() - 0.5) * 0.5;
        sysTarget = sysTarget + (targetSys - sysTarget) * 0.1 + (Math.random() - 0.5) * 2.5;
        diaTarget = Math.round(sysTarget * 0.62);
        rrTarget = Math.max(12, Math.min(32, Math.round(rrTarget + (Math.random() - 0.5) * 1)));
        tempTarget = Number((36.8 + (Math.random() - 0.5) * 0.2).toFixed(1));
      }

      newPoint = {
        timestamp: this.formatTime(this.simulatedTimeOffset),
        simulatedTime: this.computeSimulatedDate(patient.intime, this.simulatedTimeOffset),
        heartRate: Math.round(hrTarget),
        spo2: Math.min(100, Math.max(75, Math.round(spo2Target))),
        systolicBp: Math.round(sysTarget),
        diastolicBp: Math.round(diaTarget),
        meanBp: Math.round((sysTarget + 2 * diaTarget) / 3),
        respRate: Math.round(rrTarget),
        temperature: tempTarget,
        source: 'Simulated Real-Time Stream'
      };

      // Check for stream generated alert thresholds
      if (newPoint.spo2 < 90) {
        newAlert = {
          id: `ALT-SIM-${Date.now()}`,
          timestamp: newPoint.simulatedTime,
          subject_id: patient.subject_id,
          parameter: 'SpO2 Hypoxia',
          event: `Simulated SpO2 level dropped to ${newPoint.spo2}% (< 90%)`,
          severity: 'critical',
          status: 'active',
          source: 'Simulated Stream Threshold',
          valueText: `SpO2: ${newPoint.spo2}%`,
          notes: 'Automatic simulated threshold alarm triggered'
        };
      } else if (newPoint.heartRate > 120) {
        newAlert = {
          id: `ALT-SIM-${Date.now()}`,
          timestamp: newPoint.simulatedTime,
          subject_id: patient.subject_id,
          parameter: 'Heart Rate Tachycardia',
          event: `Tachycardia detected (${newPoint.heartRate} bpm > 120 bpm)`,
          severity: 'warning',
          status: 'active',
          source: 'Simulated Stream Threshold',
          valueText: `HR: ${newPoint.heartRate} bpm`,
          notes: 'Elevated cardiac rate detected in streaming buffer'
        };
      }
    }

    buffer.push(newPoint);
    // Keep max 50 recent points in buffer for performance
    if (buffer.length > 50) {
      buffer.shift();
    }
    this.patientBuffers.set(patient.stay_id, buffer);
    this.patientBuffers.set(patient.subject_id, buffer);

    this.notifyListeners(newAlert);
  }

  private formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const hrs = Math.floor(mins / 60);
    const displayMins = mins % 60;
    return `${hrs.toString().padStart(2, '0')}:${displayMins.toString().padStart(2, '0')}`;
  }

  private computeSimulatedDate(baseDateStr: string, offsetSecs: number): string {
    try {
      const base = new Date(baseDateStr.replace(' ', 'T'));
      const sim = new Date(base.getTime() + offsetSecs * 1000);
      return sim.toISOString().replace('T', ' ').substring(0, 19);
    } catch {
      return baseDateStr;
    }
  }

  private computeTwinState(patient: Patient, latest: VitalHistoryPoint): DigitalTwinState {
    // Determine physiological health scores (0-100) based on clinical ranges
    // Cardiovascular: HR 60-100, SBP 90-130, DBP 60-85
    let cvScore = 100;
    if (latest.heartRate > 100 || latest.heartRate < 60) cvScore -= Math.abs(latest.heartRate - 80) * 0.8;
    if (latest.systolicBp > 140 || latest.systolicBp < 90) cvScore -= Math.abs(latest.systolicBp - 120) * 0.6;
    cvScore = Math.max(20, Math.min(100, Math.round(cvScore)));

    // Pulmonary: SpO2 >= 95, RR 12-20
    let pulmScore = 100;
    if (latest.spo2 < 95) pulmScore -= (95 - latest.spo2) * 8;
    if (latest.respRate > 20 || latest.respRate < 12) pulmScore -= Math.abs(latest.respRate - 16) * 3;
    pulmScore = Math.max(15, Math.min(100, Math.round(pulmScore)));

    // Renal / Metabolic based on patient baseline condition
    let renalScore = patient.subject_id === 10000980 ? 68 : patient.subject_id === 10000032 ? 55 : 88;
    let systemicScore = Math.round((cvScore + pulmScore + renalScore) / 3);

    let twin_status: 'Stable' | 'Monitoring' | 'Attention' | 'Critical' = 'Stable';
    if (systemicScore < 50 || latest.spo2 < 88 || latest.systolicBp < 85) {
      twin_status = 'Critical';
    } else if (systemicScore < 70 || latest.spo2 < 92 || latest.heartRate > 115 || latest.systolicBp > 150) {
      twin_status = 'Attention';
    } else if (systemicScore < 85 || latest.spo2 < 95 || latest.heartRate > 100) {
      twin_status = 'Monitoring';
    }

    return {
      subject_id: patient.subject_id,
      twin_status,
      last_sync: latest.simulatedTime,
      cardiovascular_health: cvScore,
      pulmonary_health: pulmScore,
      renal_metabolic_health: renalScore,
      systemic_stability: systemicScore,
      parameters: {
        heart_rate: {
          id: 'hr-param',
          parameter: 'heart_rate',
          name: 'Heart Rate',
          value: latest.heartRate,
          unit: 'bpm',
          timestamp: latest.simulatedTime,
          status: latest.heartRate > 100 || latest.heartRate < 55 ? 'warning' : 'normal',
          source: latest.source,
          minThreshold: 60,
          maxThreshold: 100
        },
        spo2: {
          id: 'spo2-param',
          parameter: 'spo2',
          name: 'Oxygen Saturation (SpO₂)',
          value: latest.spo2,
          unit: '%',
          timestamp: latest.simulatedTime,
          status: latest.spo2 < 90 ? 'critical' : latest.spo2 < 95 ? 'warning' : 'normal',
          source: latest.source,
          minThreshold: 95,
          maxThreshold: 100
        },
        blood_pressure: {
          systolic: latest.systolicBp,
          diastolic: latest.diastolicBp,
          mean: latest.meanBp,
          unit: 'mmHg',
          status: (latest.systolicBp > 140 || latest.systolicBp < 90) ? 'warning' : 'normal',
          source: latest.source
        },
        resp_rate: {
          id: 'rr-param',
          parameter: 'resp_rate',
          name: 'Respiratory Rate',
          value: latest.respRate,
          unit: 'bpm',
          timestamp: latest.simulatedTime,
          status: latest.respRate > 22 || latest.respRate < 10 ? 'warning' : 'normal',
          source: latest.source,
          minThreshold: 12,
          maxThreshold: 20
        },
        temperature: {
          id: 'temp-param',
          parameter: 'temperature',
          name: 'Temperature',
          value: latest.temperature,
          unit: '°C',
          timestamp: latest.simulatedTime,
          status: latest.temperature > 38.0 ? 'warning' : 'normal',
          source: latest.source,
          minThreshold: 36.5,
          maxThreshold: 37.5
        }
      },
      state_vector: {
        hr_norm: Number((latest.heartRate / 100).toFixed(3)),
        spo2_norm: Number((latest.spo2 / 100).toFixed(3)),
        bp_sys_norm: Number((latest.systolicBp / 140).toFixed(3)),
        bp_dia_norm: Number((latest.diastolicBp / 90).toFixed(3)),
        rr_norm: Number((latest.respRate / 20).toFixed(3)),
        temp_norm: Number((latest.temperature / 37.0).toFixed(3)),
        lactate_risk: patient.subject_id === 10001884 ? 0.65 : 0.22,
        wbc_risk: patient.subject_id === 10001884 ? 0.78 : 0.35
      }
    };
  }

  public getCurrentSnapshot() {
    const patient = this.getSelectedPatient();
    const buffer = this.patientBuffers.get(patient.stay_id) || this.patientBuffers.get(patient.subject_id) || [];
    const latest = buffer[buffer.length - 1] || {
      timestamp: '00:00',
      simulatedTime: patient.intime,
      heartRate: 80,
      spo2: 97,
      systolicBp: 125,
      diastolicBp: 80,
      meanBp: 95,
      respRate: 16,
      temperature: 37.0,
      source: 'MIMIC-IV Demo' as const
    };
    const twinState = this.computeTwinState(patient, latest);

    return {
      patient,
      currentVital: latest,
      history: [...buffer],
      twinState
    };
  }

  private notifyListeners(newAlert?: AlertEvent) {
    const snapshot = this.getCurrentSnapshot();
    this.listeners.forEach(listener => {
      listener({
        ...snapshot,
        newAlert
      });
    });
  }
}

export const simulationService = new SimulationService();
