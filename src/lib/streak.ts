import { User } from "@/types/user";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWatchedDate: string | null;
  streakStartDate: string | null;
  today: string;
  isStreakActive: boolean;
}

/**
 * Calculate user's movie watching streak
 */
export function calculateStreak(user: User | null): StreakData {
  if (!user || !user.watchedMovies || user.watchedMovies.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastWatchedDate: null,
      streakStartDate: null,
      today: new Date().toISOString().split('T')[0], // Get today's date in YYYY-MM-DD format
      isStreakActive: false,
    };
  }

  // Get the watch history from localStorage
  const watchHistoryKey = `watch_history_${user.id}`;
  let watchHistory: Record<string, string[]> = {};

  try {
    const storedHistory = localStorage.getItem(watchHistoryKey);
    if (storedHistory) {
      watchHistory = JSON.parse(storedHistory);
    }
  } catch (error) {
    console.error("Error parsing watch history:", error);
  }

  // Get today's date
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Default values if no streak data exists
  let currentStreak = 0;
  let longestStreak = 0;
  let lastWatchedDate: string | null = null;
  let streakStartDate: string | null = null;
  let isStreakActive = false;

  // Get stored streak data
  const streakDataKey = `streak_data_${user.id}`;
  let streakData: Partial<StreakData> = {};

  try {
    const storedStreakData = localStorage.getItem(streakDataKey);
    if (storedStreakData) {
      streakData = JSON.parse(storedStreakData);
      currentStreak = streakData.currentStreak || 0;
      longestStreak = streakData.longestStreak || 0;
      lastWatchedDate = streakData.lastWatchedDate || null;
      streakStartDate = streakData.streakStartDate || null;
    }
  } catch (error) {
    console.error("Error parsing streak data:", error);
  }

  // Check if we have watched movies today
  const watchedToday = watchHistory[todayStr] && watchHistory[todayStr].length > 0;

  // If user hasn't watched anything today
  if (!watchedToday) {
    // Check if they watched yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastWatchedDate === yesterdayStr) {
      // Streak is active but not yet extended today
      isStreakActive = true;
    } else if (lastWatchedDate && lastWatchedDate !== yesterdayStr) {
      // Streak is broken
      isStreakActive = false;

      // Only reset current streak if we're past yesterday (more than one day missed)
      if (new Date(lastWatchedDate) < yesterday) {
        currentStreak = 0;
        streakStartDate = null;
      }
    }
  } else {
    // User watched a movie today
    isStreakActive = true;

    // If this is first watch or streak was broken
    if (!lastWatchedDate || (lastWatchedDate && new Date(lastWatchedDate) < new Date(todayStr))) {
      // Check if watched yesterday to continue streak
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastWatchedDate === yesterdayStr) {
        // Continue streak
        currentStreak++;
      } else {
        // Start new streak
        currentStreak = 1;
        streakStartDate = todayStr;
      }

      // Update last watched date
      lastWatchedDate = todayStr;

      // Update longest streak if needed
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      // Save the updated streak data
      const updatedStreakData: StreakData = {
        currentStreak,
        longestStreak,
        lastWatchedDate,
        streakStartDate,
        today: todayStr,
        isStreakActive
      };

      localStorage.setItem(streakDataKey, JSON.stringify(updatedStreakData));
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastWatchedDate,
    streakStartDate,
    today: todayStr,
    isStreakActive
  };
}

/**
 * Record a movie watch in the history
 */
export function recordMovieWatch(userId: string, movieId: string): void {
  const today = new Date().toISOString().split('T')[0];
  const watchHistoryKey = `watch_history_${userId}`;

  try {
    // Get existing watch history
    let watchHistory: Record<string, string[]> = {};
    const storedHistory = localStorage.getItem(watchHistoryKey);

    if (storedHistory) {
      watchHistory = JSON.parse(storedHistory);
    }

    // Add today's watch
    if (!watchHistory[today]) {
      watchHistory[today] = [];
    }

    // Only add if not already in today's history
    if (!watchHistory[today].includes(movieId)) {
      watchHistory[today].push(movieId);
    }

    // Save updated history
    localStorage.setItem(watchHistoryKey, JSON.stringify(watchHistory));

    // Recalculate streak
    const streakData = calculateStreak({ id: userId, watchedMovies: [movieId] } as User);
    const streakDataKey = `streak_data_${userId}`;
    localStorage.setItem(streakDataKey, JSON.stringify(streakData));
  } catch (error) {
    console.error("Error recording movie watch:", error);
  }
}

/**
 * Get messages for streak milestones
 */
export function getStreakMilestoneMessage(streak: number): string | null {
  const milestones: Record<number, string> = {
    3: "Three days in a row! You're building a habit!",
    7: "Congrats on a week-long streak! Keep going!",
    14: "Two weeks strong! You're becoming a movie buff!",
    30: "Amazing! A month-long streak - that's dedication!",
    50: "50 days straight! You're a movie marathon master!",
    100: "Incredible 100-day streak! You're a true cinephile!",
    365: "A full year of movies every day! Legendary status achieved!"
  };

  return milestones[streak] || null;
}

/**
 * Check if streak has reached a new milestone today
 */
export function hasReachedMilestoneToday(streak: number): boolean {
  return [3, 7, 14, 30, 50, 100, 365].includes(streak);
}
