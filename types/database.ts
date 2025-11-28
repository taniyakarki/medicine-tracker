export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  blood_type?: string;
  allergies?: string;
  medical_conditions?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface Medicine {
  id: string;
  user_id: string;
  name: string;
  type: "pill" | "liquid" | "injection" | "inhaler" | "drops" | "other";
  dosage: string;
  unit: string;
  frequency: "daily" | "specific_days" | "interval";
  start_date: string;
  end_date?: string;
  notes?: string;
  image?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sync_flag: number;
}

export interface Schedule {
  id: string;
  medicine_id: string;
  time: string; // HH:mm format
  days_of_week?: string; // JSON array of numbers [0-6] for specific_days
  interval_hours?: number; // for interval frequency
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Dose {
  id: string;
  medicine_id: string;
  schedule_id: string;
  scheduled_time: string; // ISO datetime
  taken_time?: string; // ISO datetime
  status: "scheduled" | "taken" | "missed" | "skipped";
  notes?: string;
  created_at: string;
}

export interface MedicineGroup {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface MedicineGroupMember {
  id: string;
  group_id: string;
  medicine_id: string;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  priority: number;
  created_at: string;
}

export interface SharedUser {
  id: string;
  medicine_id: string;
  shared_with_user: string;
  permissions: string; // JSON: {can_view: bool, can_edit: bool, notify_on_miss: bool}
  created_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  sound: string;
  vibration: boolean;
  full_screen_enabled: boolean;
  remind_before_minutes: number;
  remind_after_missed_minutes: number;
  snooze_duration_minutes: number;
  created_at: string;
  updated_at: string;
}
