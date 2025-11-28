import { useState, useEffect, useCallback, useRef } from 'react';
import { DoseWithMedicine, MedicineStats } from '../../types/medicine';
import {
  getTodayDoses,
  getUpcomingDoses,
  getRecentDoseActivity,
  getDoseStats,
  markDoseAsTaken as markDoseAsTakenDB,
  markDoseAsSkipped as markDoseAsSkippedDB,
} from '../database/models/dose';
import { getActiveMedicineCount } from '../database/models/medicine';
import { ensureUserExists } from '../database/models/user';
import { getStartOfDay, getEndOfDay, getStartOfWeek, getEndOfWeek } from '../utils/date-helpers';

const CACHE_DURATION = 30000; // 30 seconds

export const useTodayDoses = () => {
  const [doses, setDoses] = useState<DoseWithMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ data: DoseWithMedicine[], timestamp: number } | null>(null);

  const loadDoses = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Return cached data if fresh
    if (!forceRefresh && cacheRef.current && 
        (now - cacheRef.current.timestamp) < CACHE_DURATION) {
      setDoses(cacheRef.current.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const user = await ensureUserExists();
      const data = await getTodayDoses(user.id);
      
      // Update cache
      cacheRef.current = { data, timestamp: now };
      setDoses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load doses');
      console.error('Error loading doses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    doses,
    loading,
    error,
    refresh: () => loadDoses(true),
  };
};

export const useUpcomingDoses = (hours: number = 24) => {
  const [doses, setDoses] = useState<DoseWithMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ data: DoseWithMedicine[], timestamp: number } | null>(null);

  const loadDoses = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Return cached data if fresh
    if (!forceRefresh && cacheRef.current && 
        (now - cacheRef.current.timestamp) < CACHE_DURATION) {
      setDoses(cacheRef.current.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const user = await ensureUserExists();
      const data = await getUpcomingDoses(user.id, hours);
      
      // Update cache
      cacheRef.current = { data, timestamp: now };
      setDoses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load upcoming doses');
      console.error('Error loading upcoming doses:', err);
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    loadDoses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    doses,
    loading,
    error,
    refresh: () => loadDoses(true),
  };
};

export const useRecentActivity = (limit: number = 5) => {
  const [activity, setActivity] = useState<DoseWithMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ data: DoseWithMedicine[], timestamp: number } | null>(null);

  const loadActivity = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Return cached data if fresh
    if (!forceRefresh && cacheRef.current && 
        (now - cacheRef.current.timestamp) < CACHE_DURATION) {
      setActivity(cacheRef.current.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const user = await ensureUserExists();
      const data = await getRecentDoseActivity(user.id, limit);
      
      // Update cache
      cacheRef.current = { data, timestamp: now };
      setActivity(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity');
      console.error('Error loading activity:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    activity,
    loading,
    error,
    refresh: () => loadActivity(true),
  };
};

export const useMedicineStats = () => {
  const [stats, setStats] = useState<MedicineStats>({
    totalMedicines: 0,
    activeMedicines: 0,
    todayTotal: 0,
    todayTaken: 0,
    todayMissed: 0,
    weeklyAdherence: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ data: MedicineStats, timestamp: number } | null>(null);

  const loadStats = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Return cached data if fresh
    if (!forceRefresh && cacheRef.current && 
        (now - cacheRef.current.timestamp) < CACHE_DURATION) {
      setStats(cacheRef.current.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const user = await ensureUserExists();

      // Get today's stats
      const today = new Date();
      const todayStart = getStartOfDay(today).toISOString();
      const todayEnd = getEndOfDay(today).toISOString();
      const todayStats = await getDoseStats(user.id, todayStart, todayEnd);

      // Get weekly stats
      const weekStart = getStartOfWeek(today).toISOString();
      const weekEnd = getEndOfWeek(today).toISOString();
      const weekStats = await getDoseStats(user.id, weekStart, weekEnd);

      // Get medicine counts
      const activeMedicines = await getActiveMedicineCount(user.id);

      // Calculate weekly adherence
      const weeklyAdherence =
        weekStats.total > 0 ? (weekStats.taken / weekStats.total) * 100 : 0;

      const newStats = {
        totalMedicines: activeMedicines,
        activeMedicines,
        todayTotal: todayStats.total,
        todayTaken: todayStats.taken,
        todayMissed: todayStats.missed,
        weeklyAdherence,
        currentStreak: 0, // TODO: Calculate streak
      };

      // Update cache
      cacheRef.current = { data: newStats, timestamp: now };
      setStats(newStats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    stats,
    loading,
    error,
    refresh: () => loadStats(true),
  };
};

export const useDoseActions = () => {
  const markAsTaken = useCallback(async (doseId: string, notes?: string) => {
    try {
      await markDoseAsTakenDB(doseId, notes);
    } catch (error) {
      throw new Error('Failed to mark dose as taken');
    }
  }, []);

  const markAsSkipped = useCallback(async (doseId: string, notes?: string) => {
    try {
      await markDoseAsSkippedDB(doseId, notes);
    } catch (error) {
      throw new Error('Failed to mark dose as skipped');
    }
  }, []);

  return {
    markAsTaken,
    markAsSkipped,
  };
};

