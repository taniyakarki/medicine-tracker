import { Medicine, Schedule, Dose } from './database';

export type MedicineType = 'pill' | 'liquid' | 'injection' | 'inhaler' | 'drops' | 'other';
export type FrequencyType = 'daily' | 'specific_days' | 'interval';
export type DoseStatus = 'scheduled' | 'taken' | 'missed' | 'skipped';

export interface MedicineWithSchedules extends Medicine {
  schedules: Schedule[];
}

export interface MedicineWithNextDose extends Medicine {
  nextDose?: {
    schedule_id: string;
    scheduled_time: string;
    time: string;
  };
}

export interface DoseWithMedicine extends Dose {
  medicine: Medicine;
}

export interface DailyProgress {
  date: string;
  total: number;
  taken: number;
  missed: number;
  skipped: number;
  percentage: number;
}

export interface MedicineStats {
  totalMedicines: number;
  activeMedicines: number;
  todayTotal: number;
  todayTaken: number;
  todayMissed: number;
  weeklyAdherence: number;
  currentStreak: number;
}

