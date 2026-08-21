import { BackendModelStatus, Patient, VitalHistoryPoint, LabEvent } from '../types';

export interface CNNBiLSTMFeaturePayload {
  patient_id: number;
  sequence_length: number; // e.g. 24 hours
  features: {
    demographics: {
      age: number;
      gender_encoded: number; // 0 for F, 1 for M
    };
    time_series_matrix: {
      timestamps: string[];
      heart_rate: number[];
      spo2: number[];
      systolic_bp: number[];
      diastolic_bp: number[];
      mean_bp: number[];
      respiratory_rate: number[];
      temperature: number[];
    };
    static_labs: {
      wbc: number | null;
      creatinine: number | null;
      lactate: number | null;
      glucose: number | null;
      bun: number | null;
    };
  };
  model_parameters: {
    cnn_filters: number;
    kernel_size: number;
    bilstm_units: number;
    dropout: number;
    dense_layers: number[];
  };
}

class ApiService {
  private backendUrl: string = 'http://localhost:8000';
  private modelStatus: BackendModelStatus = {
    model_name: 'CNN-BiLSTM',
    endpoint_url: 'http://localhost:8000/api/v1/predict-digital-twin',
    is_connected: false,
    last_ping: null,
    status_message: 'Model Integration Pending: No local Python/ML backend detected on port 8000',
    features_ready: true
  };

  public getModelStatus(): BackendModelStatus {
    return { ...this.modelStatus };
  }

  public setBackendUrl(url: string) {
    this.backendUrl = url;
    this.modelStatus.endpoint_url = `${url}/api/v1/predict-digital-twin`;
  }

  public getBackendUrl(): string {
    return this.backendUrl;
  }

  public formatFeaturePayload(
    patient: Patient,
    history: VitalHistoryPoint[],
    labs: LabEvent[]
  ): CNNBiLSTMFeaturePayload {
    const getLabVal = (labelSubstring: string) => {
      const match = labs.find(l => l.subject_id === patient.subject_id && l.label.toLowerCase().includes(labelSubstring.toLowerCase()));
      return match ? match.valuenum : null;
    };

    return {
      patient_id: patient.subject_id,
      sequence_length: history.length,
      features: {
        demographics: {
          age: patient.anchor_age,
          gender_encoded: patient.gender === 'M' ? 1 : 0
        },
        time_series_matrix: {
          timestamps: history.map(h => h.simulatedTime),
          heart_rate: history.map(h => h.heartRate),
          spo2: history.map(h => h.spo2),
          systolic_bp: history.map(h => h.systolicBp),
          diastolic_bp: history.map(h => h.diastolicBp),
          mean_bp: history.map(h => h.meanBp),
          respiratory_rate: history.map(h => h.respRate),
          temperature: history.map(h => h.temperature)
        },
        static_labs: {
          wbc: getLabVal('white blood') || getLabVal('wbc'),
          creatinine: getLabVal('creatinine'),
          lactate: getLabVal('lactate'),
          glucose: getLabVal('glucose'),
          bun: getLabVal('urea') || getLabVal('bun')
        }
      },
      model_parameters: {
        cnn_filters: 64,
        kernel_size: 3,
        bilstm_units: 128,
        dropout: 0.25,
        dense_layers: [64, 32, 1]
      }
    };
  }

  public async testBackendConnection(url?: string): Promise<{ success: boolean; message: string }> {
    const target = url || this.backendUrl;
    try {
      // Graceful timeout check without crashing the browser
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const res = await fetch(`${target}/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.modelStatus.is_connected = true;
        this.modelStatus.last_ping = new Date().toLocaleTimeString();
        this.modelStatus.status_message = 'Connected to Python DL Inference Engine';
        return { success: true, message: 'Successfully connected to backend service!' };
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      this.modelStatus.is_connected = false;
      this.modelStatus.last_ping = new Date().toLocaleTimeString();
      this.modelStatus.status_message = 'Backend offline. Academic frontend prototype active in decoupled simulation mode.';
      return { 
        success: false, 
        message: 'No active Python server detected at ' + target + '. Frontend running in verified decoupled simulation mode.' 
      };
    }
  }
}

export const apiService = new ApiService();
