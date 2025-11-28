export const formatTime = (time: string): string => {
  // time is in HH:mm format
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) {
    return "Today";
  } else if (isSameDay(date, yesterday)) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return `${formatDate(dateString)} at ${formatTime(
    date.toTimeString().slice(0, 5)
  )}`;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getStartOfDay = (date: Date = new Date()): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfDay = (date: Date = new Date()): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const getStartOfWeek = (date: Date = new Date()): Date => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day;
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfWeek = (date: Date = new Date()): Date => {
  const end = new Date(date);
  const day = end.getDay();
  const diff = end.getDate() + (6 - day);
  end.setDate(diff);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const getDayOfWeek = (date: Date): number => {
  return date.getDay(); // 0 = Sunday, 6 = Saturday
};

export const getDayName = (dayNumber: number): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayNumber];
};

export const getShortDayName = (dayNumber: number): string => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayNumber];
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMinutes = (date: Date, minutes: number): Date => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

export const getTimeUntil = (targetDate: Date): string => {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff < 0) {
    return "Overdue";
  }

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `in ${days} day${days > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `in ${hours} hour${hours > 1 ? "s" : ""}`;
  } else if (minutes > 0) {
    return `in ${minutes} min${minutes > 1 ? "s" : ""}`;
  } else {
    return "now";
  }
};

export const getTimeAgo = (targetDate: Date): string => {
  const now = new Date();
  const diff = now.getTime() - targetDate.getTime();

  if (diff < 0) {
    return "in the future";
  }

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  } else {
    return "just now";
  }
};

export const isOverdue = (scheduledTime: string): boolean => {
  return new Date(scheduledTime) < new Date();
};

export const isUpcomingSoon = (
  scheduledTime: string,
  minutesThreshold: number = 30
): boolean => {
  const scheduled = new Date(scheduledTime);
  const now = new Date();
  const diff = scheduled.getTime() - now.getTime();
  return diff > 0 && diff <= minutesThreshold * 60000;
};

export const combineDateAndTime = (date: Date, time: string): Date => {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

export const getNextOccurrence = (
  time: string,
  daysOfWeek?: number[]
): Date => {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);

  if (!daysOfWeek || daysOfWeek.length === 0) {
    // Daily - find next occurrence today or tomorrow
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  // Specific days - find next matching day
  const currentDay = now.getDay();
  let daysToAdd = 0;
  let found = false;

  for (let i = 0; i < 7; i++) {
    const checkDay = (currentDay + i) % 7;
    if (daysOfWeek.includes(checkDay)) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() + i);
      checkDate.setHours(hours, minutes, 0, 0);

      if (checkDate > now) {
        daysToAdd = i;
        found = true;
        break;
      }
    }
  }

  if (!found) {
    // If no future occurrence this week, find first day next week
    const firstDay = Math.min(...daysOfWeek);
    daysToAdd = (7 - currentDay + firstDay) % 7 || 7;
  }

  const next = new Date(now);
  next.setDate(next.getDate() + daysToAdd);
  next.setHours(hours, minutes, 0, 0);

  return next;
};
