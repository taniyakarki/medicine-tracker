import { useState, useEffect, useCallback } from 'react';
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

export const useTodayDoses = () => {
  const [doses, setDoses] = useState<DoseWithMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDoses = useCallback(async () => {
    try {
      setLoading(true);
      const user = await ensureUserExists();
      const data = await getTodayDoses(user.id);
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
  }, [loadDoses]);

  return {
    doses,
    loading,
    error,
    refresh: loadDoses,
  };
};

export const useUpcomingDoses = (hours: number = 24) => {
  const [doses, setDoses] = useState<DoseWithMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDoses = useCallback(async () => {
    try {
      setLoading(true);
      const user = await ensureUserExists();
      const data = await getUpcomingDoses(user.id, hours);
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
  }, [loadDoses]);

  return {
    doses,
    loading,
    error,
    refresh: loadDoses,
  };
};

export const useRecentActivity = (limit: number = 5) => {
  const [activity, setActivity] = useState<DoseWithMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivity = useCallback(async () => {
    try {
      setLoading(true);
      const user = await ensureUserExists();
      const data = await getRecentDoseActivity(user.id, limit);
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
  }, [loadActivity]);

  return {
    activity,
    loading,
    error,
    refresh: loadActivity,
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

  const loadStats = useCallback(async () => {
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

      setStats({
        totalMedicines: activeMedicines,
        activeMedicines,
        todayTotal: todayStats.total,
        todayTaken: todayStats.taken,
        todayMissed: todayStats.missed,
        weeklyAdherence,
        currentStreak: 0, // TODO: Calculate streak
      });
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
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  };
};

export const useDoseActions = () => {
  const markAsTaken = async (doseId: string, notes?: string) => {
    try {
      await markDoseAsTakenDB(doseId, notes);
    } catch (error) {
      throw new Error('Failed to mark dose as taken');
    }
  };

  const markAsSkipped = async (doseId: string, notes?: string) => {
    try {
      await markDoseAsSkippedDB(doseId, notes);
    } catch (error) {
      throw new Error('Failed to mark dose as skipped');
    }
  };

  return {
    markAsTaken,
    markAsSkipped,
  };
};

