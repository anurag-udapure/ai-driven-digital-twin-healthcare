export interface MimicRawPatient {
  subject_id: number;
  demographics: {
    gender: 'M' | 'F';
    anchor_age: number;
    anchor_year_group: string;
  };
  admission: {
    hadm_id: number;
    admission_type: string;
    admission_location: string;
    discharge_location: string;
    insurance: string;
    marital_status: string;
    race: string;
    hospital_expire_flag: number;
  };
  icu_stay: {
    stay_id: number;
    hadm_id: number;
    first_careunit: string;
    last_careunit: string;
    intime: string;
    outtime: string;
    length_of_stay_days: number;
  };
  current_vitals: {
    heart_rate: number | null;
    spo2: number | null;
    respiratory_rate: number | null;
    bp_systolic: number | null;
    bp_diastolic: number | null;
    bp_mean: number | null;
  };
  vitals_history: Array<{
    timestamp: string;
    heart_rate: number | null;
    spo2: number | null;
    respiratory_rate: number | null;
    bp_systolic: number | null;
    bp_diastolic: number | null;
    bp_mean: number | null;
  }>;
  laboratory_results: Array<{
    timestamp: string;
    test: string;
    label: string;
    value: number | null;
    unit: string;
    reference_low: number | null;
    reference_high: number | null;
    flag: 'abnormal' | null;
  }>;
  diagnoses: Array<{
    icd_code: string;
    icd_version: number;
    description: string;
  }>;
  medications: Array<{
    drug: string;
    starttime: string;
    stoptime: string;
    dose: string;
    dose_unit: string;
    route: string;
  }>;
  risk_prediction: {
    model: string;
    status: string;
    prediction: null | any;
    risk_score: null | number;
  };
}
