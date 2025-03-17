import { User } from "@/types/user";
import { getDirectorMovies, getMoviesByGenre, getMoviesByDecade } from "@/data/movies";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "milestone" | "collection" | "streak" | "special";
  progress: number;
  max: number;
  unlocked: boolean;
  unlockedAt?: string;
  level?: number;
}

const ACHIEVEMENT_TYPES = {
  MILESTONE: "milestone",
  COLLECTION: "collection",
  STREAK: "streak",
  SPECIAL: "special"
};

/**
 * Calculate achievements for a user
 */
export function calculateAchievements(user: User | null): Achievement[] {
  if (!user) return [];

  const achievements: Achievement[] = [];

  // Get the user's watched movies
  const watchedMovies = user.watchedMovies || [];

  // 1. Movies watched milestones
  const watchedCount = watchedMovies.length;

  const milestones = [
    { id: "watched-1", name: "First Steps", description: "Watch your first movie", max: 1, icon: "🎬" },
    { id: "watched-5", name: "Getting Started", description: "Watch 5 movies", max: 5, icon: "🎞️" },
    { id: "watched-10", name: "Movie Enthusiast", description: "Watch 10 movies", max: 10, icon: "🎦" },
    { id: "watched-25", name: "Film Buff", description: "Watch 25 movies", max: 25, icon: "🍿" },
    { id: "watched-50", name: "Movie Marathon", description: "Watch 50 movies", max: 50, icon: "🏆" },
    { id: "watched-100", name: "Movie Maestro", description: "Watch 100 movies", max: 100, icon: "🎭" },
    { id: "watched-250", name: "Film Fanatic", description: "Watch 250 movies", max: 250, icon: "💎" },
    { id: "watched-500", name: "Movie Master", description: "Watch 500 movies", max: 500, icon: "🌟" },
    { id: "watched-750", name: "Cinematic Legend", description: "Watch 750 movies", max: 750, icon: "👑" },
    { id: "watched-1000", name: "1001 Movies Conqueror", description: "Watch 1000 movies", max: 1000, icon: "🏅" },
    { id: "watched-1001", name: "Completed Journey", description: "Watch all 1001 movies", max: 1001, icon: "🌈" },
  ];

  // Add movie watching milestones
  milestones.forEach(milestone => {
    achievements.push({
      id: milestone.id,
      name: milestone.name,
      description: milestone.description,
      icon: milestone.icon,
      type: ACHIEVEMENT_TYPES.MILESTONE,
      progress: Math.min(watchedCount, milestone.max),
      max: milestone.max,
      unlocked: watchedCount >= milestone.max,
      unlockedAt: watchedCount >= milestone.max ? (user.joinedDate || new Date().toISOString()) : undefined
    });
  });

  // 2. Genre collection achievements
  const genres = ["Drama", "Comedy", "Action", "Romance", "Thriller", "Horror", "Sci-Fi", "Documentary"];

  genres.forEach(genre => {
    // Get count of watched movies by genre
    const genreMovies = getMoviesByGenre(genre);
    const watchedGenreMovies = genreMovies.filter(movie => watchedMovies.includes(movie.id));
    const genreCount = watchedGenreMovies.length;
    const genreTotal = genreMovies.length;

    // For most genres, we'll use a "level" system
    const levels = [5, 10, 25, 50, 100];
    let level = 0;
    let max = levels[0];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (genreCount >= levels[i]) {
        level = i + 1;
        max = levels[i];
        break;
      }
    }

    if (genreCount > 0) {
      const nextLevel = level < levels.length ? levels[level] : max;

      achievements.push({
        id: `genre-${genre.toLowerCase()}`,
        name: `${genre} Aficionado`,
        description: `Watch ${nextLevel} ${genre} movies`,
        icon: getGenreIcon(genre),
        type: ACHIEVEMENT_TYPES.COLLECTION,
        progress: genreCount,
        max: nextLevel,
        unlocked: level > 0,
        level: level,
        unlockedAt: level > 0 ? (user.joinedDate || new Date().toISOString()) : undefined
      });
    }
  });

  // 3. Director collection achievements
  const directors = ["Alfred Hitchcock", "Steven Spielberg", "Martin Scorsese", "Stanley Kubrick", "Akira Kurosawa"];

  directors.forEach(director => {
    const directorMovies = getDirectorMovies(director);
    const watchedDirectorMovies = directorMovies.filter(movie => watchedMovies.includes(movie.id));
    const directorCount = watchedDirectorMovies.length;
    const directorTotal = directorMovies.length;

    if (directorMovies.length > 0) {
      achievements.push({
        id: `director-${director.toLowerCase().replace(/\s/g, '-')}`,
        name: `${director.split(' ')[1]} Expert`,
        description: `Watch ${directorTotal} movies by ${director}`,
        icon: "🎬",
        type: ACHIEVEMENT_TYPES.COLLECTION,
        progress: directorCount,
        max: directorTotal,
        unlocked: directorCount === directorTotal && directorTotal > 0,
        unlockedAt: directorCount === directorTotal ? (user.joinedDate || new Date().toISOString()) : undefined
      });
    }
  });

  // 4. Era collection achievements
  const decades = [
    { id: "1920s", name: "Roaring 20s", start: 1920, end: 1929, icon: "🎩" },
    { id: "1930s", name: "Golden Age", start: 1930, end: 1939, icon: "🕰️" },
    { id: "1940s", name: "The Forties", start: 1940, end: 1949, icon: "📻" },
    { id: "1950s", name: "The Fifties", start: 1950, end: 1959, icon: "🏎️" },
    { id: "1960s", name: "The Sixties", start: 1960, end: 1969, icon: "☮️" },
    { id: "1970s", name: "The Seventies", start: 1970, end: 1979, icon: "🪩" },
    { id: "1980s", name: "The Eighties", start: 1980, end: 1989, icon: "🕹️" },
    { id: "1990s", name: "The Nineties", start: 1990, end: 1999, icon: "💽" },
    { id: "2000s", name: "The Aughts", start: 2000, end: 2009, icon: "📱" },
    { id: "2010s", name: "Twenty-Tens", start: 2010, end: 2019, icon: "📲" }
  ];

  decades.forEach(decade => {
    const decadeMovies = getMoviesByDecade(decade.start, decade.end);
    const watchedDecadeMovies = decadeMovies.filter(movie => watchedMovies.includes(movie.id));
    const decadeCount = watchedDecadeMovies.length;
    const decadeTotal = decadeMovies.length;
    const unlockThreshold = Math.min(10, decadeTotal);

    achievements.push({
      id: `era-${decade.id}`,
      name: `${decade.name} Explorer`,
      description: `Watch ${unlockThreshold} movies from ${decade.id}`,
      icon: decade.icon,
      type: ACHIEVEMENT_TYPES.COLLECTION,
      progress: decadeCount,
      max: unlockThreshold,
      unlocked: decadeCount >= unlockThreshold,
      unlockedAt: decadeCount >= unlockThreshold ? (user.joinedDate || new Date().toISOString()) : undefined
    });
  });

  // 5. Streak achievements
  // These will be calculated and updated by the streaks system
  const streakDataKey = `streak_data_${user.id}`;
  try {
    const streakData = localStorage.getItem(streakDataKey);
    if (streakData) {
      const data = JSON.parse(streakData);
      const streakMilestones = [3, 7, 14, 30, 50, 100];
      const currentStreak = data.currentStreak || 0;
      const longestStreak = data.longestStreak || 0;

      // Current streak achievements
      streakMilestones.forEach(milestone => {
        if (milestone <= Math.max(currentStreak, longestStreak)) {
          achievements.push({
            id: `streak-${milestone}`,
            name: getStreakAchievementName(milestone),
            description: `Maintain a movie watching streak for ${milestone} days`,
            icon: "🔥",
            type: ACHIEVEMENT_TYPES.STREAK,
            progress: Math.min(longestStreak, milestone),
            max: milestone,
            unlocked: longestStreak >= milestone,
            unlockedAt: longestStreak >= milestone ? (data.lastWatchedDate || new Date().toISOString()) : undefined
          });
        }
      });
    }
  } catch (error) {
    console.error("Error parsing streak data for achievements:", error);
  }

  // Sort achievements by unlocked (locked last) and then by progress percentage
  return achievements.sort((a, b) => {
    if (a.unlocked !== b.unlocked) {
      return a.unlocked ? -1 : 1;
    }

    const aProgress = a.progress / a.max;
    const bProgress = b.progress / b.max;

    return bProgress - aProgress;
  });
}

/**
 * Get an icon for a genre
 */
function getGenreIcon(genre: string): string {
  const icons: Record<string, string> = {
    "Drama": "🎭",
    "Comedy": "😂",
    "Action": "💥",
    "Romance": "❤️",
    "Thriller": "😰",
    "Horror": "👻",
    "Sci-Fi": "🚀",
    "Documentary": "📽️",
    "Western": "🤠",
    "Adventure": "🗺️",
    "Crime": "🔪",
    "Fantasy": "🧙",
    "Animation": "🧸",
    "Family": "👨‍👩‍👧‍👦",
    "Mystery": "🔍",
    "Biography": "📚",
    "Music": "🎵",
    "War": "⚔️",
    "History": "📜"
  };

  return icons[genre] || "🎬";
}

/**
 * Get a name for a streak achievement
 */
function getStreakAchievementName(days: number): string {
  const names: Record<number, string> = {
    3: "3-Day Streak",
    7: "Weekly Watcher",
    14: "Fortnight Cinephile",
    30: "Monthly Movie Buff",
    50: "The Committed",
    100: "Century Club"
  };

  return names[days] || `${days}-Day Streak`;
}
