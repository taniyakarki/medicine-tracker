import { useState, useEffect, useCallback, useRef } from 'react';
import { DoseWithMedicine, MedicineStats } from '../../types/medicine';
import {
  getTodayDoses,
  getUpcomingDoses,
  getRecentDoseActivity,
  getDoseStats,
  markDoseAsTaken as markDoseAsTakenDB,
  markDoseAsSkipped as markDoseAsSkippedDB,
  calculateStreak,
  getCalendarMonthData,
} from '../database/models/dose';
import { getActiveMedicineCount } from '../database/models/medicine';
import { ensureUserExists } from '../database/models/user';
import { getStartOfDay, getEndOfDay, getStartOfWeek, getEndOfWeek } from '../utils/date-helpers';
import { isCacheValid } from '../utils/performance-helpers';
import { formatErrorMessage, logError } from '../utils/error-helpers';

const CACHE_DURATION = 30000; // 30 seconds

export const useTodayDoses = () => {
  const [doses, setDoses] = useState<DoseWithMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ data: DoseWithMedicine[], timestamp: number } | null>(null);

  const loadDoses = useCallback(async (forceRefresh = false) => {
    // Return cached data if fresh
    if (!forceRefresh && cacheRef.current && 
        isCacheValid(cacheRef.current.timestamp, CACHE_DURATION)) {
      setDoses(cacheRef.current.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const user = await ensureUserExists();
      const data = await getTodayDoses(user.id);
      
      // Update cache
      cacheRef.current = { data, timestamp: Date.now() };
      setDoses(data);
      setError(null);
    } catch (err) {
      const message = formatErrorMessage(err, 'Failed to load doses');
      setError(message);
      logError('useTodayDoses.loadDoses', err);
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
    // Return cached data if fresh
    if (!forceRefresh && cacheRef.current && 
        isCacheValid(cacheRef.current.timestamp, CACHE_DURATION)) {
      setDoses(cacheRef.current.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const user = await ensureUserExists();
      const data = await getUpcomingDoses(user.id, hours);
      
      // Update cache
      cacheRef.current = { data, timestamp: Date.now() };
      setDoses(data);
      setError(null);
    } catch (err) {
      const message = formatErrorMessage(err, 'Failed to load upcoming doses');
      setError(message);
      logError('useUpcomingDoses.loadDoses', err, { hours });
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
    // Return cached data if fresh
    if (!forceRefresh && cacheRef.current && 
        isCacheValid(cacheRef.current.timestamp, CACHE_DURATION)) {
      setActivity(cacheRef.current.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const user = await ensureUserExists();
      const data = await getRecentDoseActivity(user.id, limit);
      
      // Update cache
      cacheRef.current = { data, timestamp: Date.now() };
      setActivity(data);
      setError(null);
    } catch (err) {
      const message = formatErrorMessage(err, 'Failed to load activity');
      setError(message);
      logError('useRecentActivity.loadActivity', err, { limit });
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
    // Return cached data if fresh
    if (!forceRefresh && cacheRef.current && 
        isCacheValid(cacheRef.current.timestamp, CACHE_DURATION)) {
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

      // Calculate current streak
      const currentStreak = await calculateStreak(user.id);

      const newStats = {
        totalMedicines: activeMedicines,
        activeMedicines,
        todayTotal: todayStats.total,
        todayTaken: todayStats.taken,
        todayMissed: todayStats.missed,
        weeklyAdherence,
        currentStreak,
      };

      // Update cache
      cacheRef.current = { data: newStats, timestamp: Date.now() };
      setStats(newStats);
      setError(null);
    } catch (err) {
      const message = formatErrorMessage(err, 'Failed to load stats');
      setError(message);
      logError('useMedicineStats.loadStats', err);
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
      logError('useDoseActions.markAsTaken', error, { doseId, notes });
      throw new Error(formatErrorMessage(error, 'Failed to mark dose as taken'));
    }
  }, []);

  const markAsSkipped = useCallback(async (doseId: string, notes?: string) => {
    try {
      await markDoseAsSkippedDB(doseId, notes);
    } catch (error) {
      logError('useDoseActions.markAsSkipped', error, { doseId, notes });
      throw new Error(formatErrorMessage(error, 'Failed to mark dose as skipped'));
    }
  }, []);

  return {
    markAsTaken,
    markAsSkipped,
  };
};

export const useCalendarData = (month: Date) => {
  const [data, setData] = useState<Array<{
    date: string;
    total: number;
    taken: number;
    missed: number;
    skipped: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const user = await ensureUserExists();
      const year = month.getFullYear();
      const monthIndex = month.getMonth();
      const calendarData = await getCalendarMonthData(user.id, year, monthIndex);
      setData(calendarData);
      setError(null);
    } catch (err) {
      const message = formatErrorMessage(err, 'Failed to load calendar data');
      setError(message);
      logError('useCalendarData.loadData', err, { year: month.getFullYear(), month: month.getMonth() });
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh: loadData,
  };
};

