import { User } from "@/types/user";
import { Movie } from "@/types/movie";
import { movies } from "@/data/movies";
import { Achievement, calculateAchievements } from "@/lib/achievements";
import { getMoviesByGenre, getDirectorMovies, getMoviesByDecade } from "@/data/movies";

export interface RecommendationReason {
  type: 'achievement' | 'streak' | 'collection' | 'director' | 'era';
  message: string;
  achievementId?: string;
  priority: number; // Higher number = higher priority
}

export interface MovieRecommendation {
  movie: Movie;
  reasons: RecommendationReason[];
  score: number;
}

/**
 * Get movie recommendations based on achievements the user is close to unlocking
 */
export function getAchievementBasedRecommendations(
  user: User | null,
  count: number = 5
): MovieRecommendation[] {
  if (!user) return [];

  // Get user achievements
  const achievements = calculateAchievements(user);
  const watchedMovieIds = new Set(user.watchedMovies || []);

  // Create a map of unwatched movies
  const unwatchedMovies = movies.filter(movie => !watchedMovieIds.has(movie.id));

  // Create recommendations with reasons and scores
  const recommendations: MovieRecommendation[] = [];

  // Helper to add a recommendation
  const addRecommendation = (movie: Movie, reason: RecommendationReason) => {
    // Check if movie already exists in recommendations
    const existingRec = recommendations.find(rec => rec.movie.id === movie.id);

    if (existingRec) {
      // If the same reason type already exists, update it if this one has higher priority
      const existingReasonIndex = existingRec.reasons.findIndex(
        r => r.type === reason.type && r.achievementId === reason.achievementId
      );

      if (existingReasonIndex >= 0) {
        if (existingRec.reasons[existingReasonIndex].priority < reason.priority) {
          existingRec.reasons[existingReasonIndex] = reason;
          // Adjust score based on priority difference
          existingRec.score += (reason.priority - existingRec.reasons[existingReasonIndex].priority);
        }
      } else {
        // Add a new reason
        existingRec.reasons.push(reason);
        existingRec.score += reason.priority;
      }
    } else {
      // Create new recommendation
      recommendations.push({
        movie,
        reasons: [reason],
        score: reason.priority
      });
    }
  };

  // Find near-completion genre achievements
  const genreAchievements = achievements.filter(
    a => a.id.startsWith('genre-') && !a.unlocked && a.progress > 0
  );

  genreAchievements.forEach(achievement => {
    // Extract genre from achievement ID
    const genreMatch = achievement.id.match(/^genre-(.+)$/);
    if (!genreMatch) return;

    const genre = genreMatch[1].charAt(0).toUpperCase() + genreMatch[1].slice(1);

    // Calculate how close to unlocking (as percentage)
    const progressPercent = (achievement.progress / achievement.max) * 100;

    // Higher priority for nearly complete achievements
    const priority = progressPercent >= 80 ? 5 :
                    progressPercent >= 60 ? 4 :
                    progressPercent >= 40 ? 3 : 2;

    // Get unwatched movies from this genre
    const genreMovies = getMoviesByGenre(genre).filter(movie => !watchedMovieIds.has(movie.id));

    // Recommend up to 2 movies from each near-completion genre
    genreMovies.slice(0, 2).forEach(movie => {
      const remainingNeeded = achievement.max - achievement.progress;

      addRecommendation(movie, {
        type: 'collection',
        message: `Watch to progress your ${genre} collection (${remainingNeeded} more needed)`,
        achievementId: achievement.id,
        priority
      });
    });
  });

  // Find near-completion director achievements
  const directorAchievements = achievements.filter(
    a => a.id.startsWith('director-') && !a.unlocked && a.progress > 0
  );

  directorAchievements.forEach(achievement => {
    // Extract director name from achievement ID
    const directorMatch = achievement.id.match(/^director-(.+)$/);
    if (!directorMatch) return;

    const directorSlug = directorMatch[1];
    const director = directorSlug
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    // Calculate how close to unlocking (as percentage)
    const progressPercent = (achievement.progress / achievement.max) * 100;

    // Higher priority for nearly complete achievements
    const priority = progressPercent >= 75 ? 6 :
                    progressPercent >= 50 ? 5 :
                    progressPercent >= 25 ? 4 : 3;

    // Get unwatched movies from this director
    const directorMovies = getDirectorMovies(director).filter(movie => !watchedMovieIds.has(movie.id));

    // Recommend movies from this director
    directorMovies.forEach(movie => {
      const remainingNeeded = achievement.max - achievement.progress;

      addRecommendation(movie, {
        type: 'director',
        message: `Watch to complete your ${director.split(' ')[1]} filmography (${remainingNeeded} more needed)`,
        achievementId: achievement.id,
        priority
      });
    });
  });

  // Find near-completion era achievements
  const eraAchievements = achievements.filter(
    a => a.id.startsWith('era-') && !a.unlocked && a.progress > 0
  );

  eraAchievements.forEach(achievement => {
    // Extract era info from achievement ID
    const eraMatch = achievement.id.match(/^era-(\d{4})s$/);
    if (!eraMatch) return;

    const decadeStart = parseInt(eraMatch[1]);
    const decadeEnd = decadeStart + 9;

    // Calculate how close to unlocking (as percentage)
    const progressPercent = (achievement.progress / achievement.max) * 100;

    // Higher priority for nearly complete achievements
    const priority = progressPercent >= 80 ? 4 :
                    progressPercent >= 60 ? 3 :
                    progressPercent >= 40 ? 2 : 1;

    // Get unwatched movies from this era
    const eraMovies = getMoviesByDecade(decadeStart, decadeEnd).filter(movie => !watchedMovieIds.has(movie.id));

    // Recommend up to a few movies from this era
    eraMovies.slice(0, 2).forEach(movie => {
      const remainingNeeded = achievement.max - achievement.progress;

      addRecommendation(movie, {
        type: 'era',
        message: `Watch to explore more of the ${decadeStart}s (${remainingNeeded} more needed)`,
        achievementId: achievement.id,
        priority
      });
    });
  });

  // Sort recommendations by score (descending)
  const sortedRecommendations = recommendations.sort((a, b) => b.score - a.score);

  // Return the top N recommendations
  return sortedRecommendations.slice(0, count);
}

/**
 * Calculate the next achievement a user will unlock by watching a specific movie
 * @returns The most significant achievement that would be unlocked or progressed
 */
export function getNextAchievementForMovie(user: User | null, movie: Movie): Achievement | null {
  if (!user) return null;

  // Simulate adding this movie to the watched list
  const simulatedUser = {
    ...user,
    watchedMovies: [...(user.watchedMovies || []), movie.id]
  };

  // Get current and simulated achievements
  const currentAchievements = calculateAchievements(user);
  const simulatedAchievements = calculateAchievements(simulatedUser);

  // Find newly unlocked achievements
  const newlyUnlocked = simulatedAchievements.filter(
    simAch => {
      const currentAch = currentAchievements.find(ca => ca.id === simAch.id);
      return currentAch && !currentAch.unlocked && simAch.unlocked;
    }
  );

  if (newlyUnlocked.length > 0) {
    // Return most significant newly unlocked achievement
    // Prioritize milestone achievements first, then collections, then others
    const byType = {
      milestone: newlyUnlocked.filter(a => a.type === 'milestone'),
      collection: newlyUnlocked.filter(a => a.type === 'collection'),
      other: newlyUnlocked.filter(a => a.type !== 'milestone' && a.type !== 'collection')
    };

    return byType.milestone[0] || byType.collection[0] || newlyUnlocked[0];
  }

  // If no newly unlocked achievements, find the one with most progress
  const mostProgress = simulatedAchievements
    .filter(simAch => {
      const currentAch = currentAchievements.find(ca => ca.id === simAch.id);
      return currentAch && (simAch.progress > currentAch.progress) && !simAch.unlocked;
    })
    .sort((a, b) => {
      // Find the current versions
      const currentA = currentAchievements.find(ca => ca.id === a.id);
      const currentB = currentAchievements.find(ca => ca.id === b.id);

      if (!currentA || !currentB) return 0;

      // Calculate progress percentage difference
      const progressDiffA = (a.progress / a.max) - (currentA.progress / currentA.max);
      const progressDiffB = (b.progress / b.max) - (currentB.progress / currentB.max);

      return progressDiffB - progressDiffA;
    });

  return mostProgress[0] || null;
}
