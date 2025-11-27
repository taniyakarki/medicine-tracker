import { useState, useEffect, useCallback } from 'react';
import { Medicine, MedicineWithNextDose } from '../../types/medicine';
import {
  getAllMedicines,
  getActiveMedicines,
  getActiveMedicinesWithNextDose,
  getMedicineById,
  createMedicine as createMedicineDB,
  updateMedicine as updateMedicineDB,
  deleteMedicine as deleteMedicineDB,
} from '../database/models/medicine';
import { ensureUserExists } from '../database/models/user';

export const useMedicines = () => {
  const [medicines, setMedicines] = useState<MedicineWithNextDose[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const user = await ensureUserExists();
      const data = await getActiveMedicinesWithNextDose(user.id);
      setMedicines(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medicines');
      console.error('Error loading medicines:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  const createMedicine = async (medicineData: Omit<Medicine, 'id' | 'created_at' | 'updated_at' | 'sync_flag'>) => {
    try {
      const user = await ensureUserExists();
      await createMedicineDB({ ...medicineData, user_id: user.id });
      await loadMedicines();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create medicine');
    }
  };

  const updateMedicine = async (id: string, medicineData: Partial<Medicine>) => {
    try {
      await updateMedicineDB(id, medicineData);
      await loadMedicines();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update medicine');
    }
  };

  const deleteMedicine = async (id: string) => {
    try {
      await deleteMedicineDB(id);
      await loadMedicines();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete medicine');
    }
  };

  return {
    medicines,
    loading,
    error,
    refresh: loadMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
  };
};

export const useMedicine = (id: string) => {
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMedicine = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMedicineById(id);
      setMedicine(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medicine');
      console.error('Error loading medicine:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMedicine();
  }, [loadMedicine]);

  return {
    medicine,
    loading,
    error,
    refresh: loadMedicine,
  };
};

