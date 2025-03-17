import { Movie } from "@/types/movie";
import { User } from "@/context/auth-context";
import { movies, getMovieById } from "@/data/movies";

interface GenrePreference {
  genre: string;
  count: number;
  score: number;
}

interface DirectorPreference {
  director: string;
  count: number;
  score: number;
}

/**
 * Analyses user's watched movies to determine genre preferences
 */
export function analyzeUserPreferences(user: User | null): {
  genrePreferences: GenrePreference[];
  directorPreferences: DirectorPreference[];
} {
  if (!user || !user.watchedMovies || user.watchedMovies.length === 0) {
    return {
      genrePreferences: [],
      directorPreferences: []
    };
  }

  // Get user's watched movies
  const watchedMovies = user.watchedMovies
    .map(id => getMovieById(id))
    .filter(Boolean) as Movie[];

  // Calculate ratings
  const movieRatings: Record<string, number> = {};
  watchedMovies.forEach(movie => {
    const ratingKey = `movie_rating_${movie.id}`;
    const ratingStr = localStorage.getItem(ratingKey);
    if (ratingStr) {
      movieRatings[movie.id] = parseInt(ratingStr);
    } else {
      // Default rating for watched but unrated movies
      movieRatings[movie.id] = 3;
    }
  });

  // Calculate genre preferences
  const genreCounts: Record<string, { count: number; totalRating: number }> = {};
  watchedMovies.forEach(movie => {
    const rating = movieRatings[movie.id] || 3;

    movie.genre.forEach(genre => {
      if (!genreCounts[genre]) {
        genreCounts[genre] = { count: 0, totalRating: 0 };
      }
      genreCounts[genre].count += 1;
      genreCounts[genre].totalRating += rating;
    });
  });

  const genrePreferences: GenrePreference[] = Object.entries(genreCounts)
    .map(([genre, { count, totalRating }]) => ({
      genre,
      count,
      score: totalRating / count
    }))
    .sort((a, b) => b.score - a.score);

  // Calculate director preferences
  const directorCounts: Record<string, { count: number; totalRating: number }> = {};
  watchedMovies.forEach(movie => {
    const rating = movieRatings[movie.id] || 3;

    const director = movie.director;
    if (!directorCounts[director]) {
      directorCounts[director] = { count: 0, totalRating: 0 };
    }
    directorCounts[director].count += 1;
    directorCounts[director].totalRating += rating;
  });

  const directorPreferences: DirectorPreference[] = Object.entries(directorCounts)
    .map(([director, { count, totalRating }]) => ({
      director,
      count,
      score: totalRating / count
    }))
    .sort((a, b) => b.score - a.score);

  return {
    genrePreferences,
    directorPreferences
  };
}

/**
 * Calculate a recommendation score for a movie based on user preferences
 */
function calculateMovieScore(
  movie: Movie,
  genrePreferences: GenrePreference[],
  directorPreferences: DirectorPreference[],
  watchedMovieIds: string[]
): number {
  // Skip already watched movies
  if (watchedMovieIds.includes(movie.id)) {
    return -1;
  }

  let score = 0;

  // Genre score - more weight to preferred genres
  const genreMap = new Map(genrePreferences.map(g => [g.genre, g.score]));
  movie.genre.forEach(genre => {
    if (genreMap.has(genre)) {
      score += genreMap.get(genre)! * 2; // Double weight for genres
    }
  });

  // Director score
  const directorMap = new Map(directorPreferences.map(d => [d.director, d.score]));
  if (directorMap.has(movie.director)) {
    score += directorMap.get(movie.director)! * 1.5; // 1.5 weight for directors
  }

  return score;
}

/**
 * Get movie recommendations based on user preferences
 */
export function getRecommendations(
  user: User | null,
  count: number = 6
): Movie[] {
  if (!user || !user.watchedMovies || user.watchedMovies.length === 0) {
    // If no watch history, return random movies
    return getRandomRecommendations(count);
  }

  const { genrePreferences, directorPreferences } = analyzeUserPreferences(user);

  // Score all unwatched movies
  const watchedMovieIds = user.watchedMovies;
  const scoredMovies = movies
    .filter(movie => !watchedMovieIds.includes(movie.id))
    .map(movie => ({
      movie,
      score: calculateMovieScore(
        movie,
        genrePreferences,
        directorPreferences,
        watchedMovieIds
      )
    }))
    .sort((a, b) => b.score - a.score);

  // Return top N recommendations
  return scoredMovies.slice(0, count).map(item => item.movie);
}

/**
 * Get random movie recommendations
 */
function getRandomRecommendations(count: number): Movie[] {
  const shuffled = [...movies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
