import { useState, useEffect, useCallback, useRef } from 'react';
import { Medicine, MedicineWithNextDose } from '../../types/medicine';
import {
  getAllMedicines,
  getActiveMedicines,
  getActiveMedicinesWithNextDose,
  getAllMedicinesWithNextDose,
  getMedicineById,
  createMedicine as createMedicineDB,
  updateMedicine as updateMedicineDB,
  deleteMedicine as deleteMedicineDB,
} from '../database/models/medicine';
import { ensureUserExists } from '../database/models/user';

const CACHE_DURATION = 30000; // 30 seconds

export const useMedicines = (includeInactive: boolean = false) => {
  const [medicines, setMedicines] = useState<MedicineWithNextDose[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ data: MedicineWithNextDose[], timestamp: number } | null>(null);

  const loadMedicines = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Return cached data if fresh and not forcing refresh
    if (!forceRefresh && cacheRef.current && 
        (now - cacheRef.current.timestamp) < CACHE_DURATION) {
      setMedicines(cacheRef.current.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const user = await ensureUserExists();
      const data = includeInactive 
        ? await getAllMedicinesWithNextDose(user.id)
        : await getActiveMedicinesWithNextDose(user.id);
      
      // Update cache
      cacheRef.current = { data, timestamp: now };
      setMedicines(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medicines');
      console.error('Error loading medicines:', err);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    loadMedicines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createMedicine = useCallback(async (medicineData: Omit<Medicine, 'id' | 'created_at' | 'updated_at' | 'sync_flag'>) => {
    try {
      const user = await ensureUserExists();
      await createMedicineDB({ ...medicineData, user_id: user.id });
      await loadMedicines(true); // Force refresh after create
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create medicine');
    }
  }, [loadMedicines]);

  const updateMedicine = useCallback(async (id: string, medicineData: Partial<Medicine>) => {
    try {
      await updateMedicineDB(id, medicineData);
      await loadMedicines(true); // Force refresh after update
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update medicine');
    }
  }, [loadMedicines]);

  const deleteMedicine = useCallback(async (id: string) => {
    try {
      await deleteMedicineDB(id);
      await loadMedicines(true); // Force refresh after delete
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete medicine');
    }
  }, [loadMedicines]);

  return {
    medicines,
    loading,
    error,
    refresh: () => loadMedicines(true),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    medicine,
    loading,
    error,
    refresh: loadMedicine,
  };
};

