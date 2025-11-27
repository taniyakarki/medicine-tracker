export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Basic phone validation - at least 10 digits
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value: string | undefined | null): boolean => {
  return value !== undefined && value !== null && value.trim().length > 0;
};

export const validateTime = (time: string): boolean => {
  // HH:mm format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const validateDate = (date: string): boolean => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

export const validatePositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

export interface ValidationError {
  field: string;
  message: string;
}

export const validateMedicineForm = (data: {
  name?: string;
  type?: string;
  dosage?: string;
  unit?: string;
  frequency?: string;
  start_date?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!validateRequired(data.name)) {
    errors.push({ field: 'name', message: 'Medicine name is required' });
  }
  
  if (!validateRequired(data.type)) {
    errors.push({ field: 'type', message: 'Medicine type is required' });
  }
  
  if (!validateRequired(data.dosage)) {
    errors.push({ field: 'dosage', message: 'Dosage is required' });
  }
  
  if (!validateRequired(data.unit)) {
    errors.push({ field: 'unit', message: 'Unit is required' });
  }
  
  if (!validateRequired(data.frequency)) {
    errors.push({ field: 'frequency', message: 'Frequency is required' });
  }
  
  if (!validateRequired(data.start_date) || !validateDate(data.start_date!)) {
    errors.push({ field: 'start_date', message: 'Valid start date is required' });
  }
  
  return errors;
};

export const validateScheduleForm = (data: {
  time?: string;
  days_of_week?: number[];
  interval_hours?: number;
  frequency: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!validateRequired(data.time) || !validateTime(data.time!)) {
    errors.push({ field: 'time', message: 'Valid time is required (HH:mm format)' });
  }
  
  if (data.frequency === 'specific_days') {
    if (!data.days_of_week || data.days_of_week.length === 0) {
      errors.push({ field: 'days_of_week', message: 'At least one day must be selected' });
    }
  }
  
  if (data.frequency === 'interval') {
    if (!data.interval_hours || !validatePositiveNumber(data.interval_hours)) {
      errors.push({ field: 'interval_hours', message: 'Valid interval in hours is required' });
    }
  }
  
  return errors;
};

export const validateEmergencyContactForm = (data: {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!validateRequired(data.name)) {
    errors.push({ field: 'name', message: 'Contact name is required' });
  }
  
  if (!validateRequired(data.relationship)) {
    errors.push({ field: 'relationship', message: 'Relationship is required' });
  }
  
  if (!validateRequired(data.phone) || !validatePhone(data.phone!)) {
    errors.push({ field: 'phone', message: 'Valid phone number is required' });
  }
  
  if (data.email && !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }
  
  return errors;
};

