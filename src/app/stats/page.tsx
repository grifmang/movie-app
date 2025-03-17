"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import Link from "next/link";
import { movies } from "@/data/movies";

interface GenreCount {
  genre: string;
  count: number;
  percentage: number;
}

interface DirectorCount {
  director: string;
  count: number;
}

interface DecadeCount {
  decade: string;
  count: number;
}

interface Rating {
  movieId: string;
  rating: number;
}

export default function StatsPage() {
  const { user } = useAuth();
  const [watchedMovies, setWatchedMovies] = useState<any[]>([]);
  const [genreCounts, setGenreCounts] = useState<GenreCount[]>([]);
  const [directorCounts, setDirectorCounts] = useState<DirectorCount[]>([]);
  const [decadeCounts, setDecadeCounts] = useState<DecadeCount[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [watchedCount, setWatchedCount] = useState<number>(0);
  const [remainingCount, setRemainingCount] = useState<number>(0);
  const [ratings, setRatings] = useState<Rating[]>([]);

  // Calculate stats when user changes
  useEffect(() => {
    if (!user) return;

    const watchedIds = user.watchedMovies || [];
    setWatchedCount(watchedIds.length);
    setRemainingCount(1001 - watchedIds.length);

    // Get watched movies details
    const watched = movies.filter(movie => watchedIds.includes(movie.id));
    setWatchedMovies(watched);

    // Calculate ratings
    const userRatings: Rating[] = [];
    watchedIds.forEach(id => {
      const ratingKey = `movie_rating_${id}`;
      const savedRating = localStorage.getItem(ratingKey);
      if (savedRating) {
        userRatings.push({
          movieId: id,
          rating: parseInt(savedRating)
        });
      }
    });
    setRatings(userRatings);

    // Calculate average rating
    if (userRatings.length > 0) {
      const total = userRatings.reduce((sum, item) => sum + item.rating, 0);
      setAvgRating(total / userRatings.length);
    }

    // Count genres
    const genres: Record<string, number> = {};
    watched.forEach(movie => {
      movie.genre.forEach(genre => {
        genres[genre] = (genres[genre] || 0) + 1;
      });
    });

    const genreStats: GenreCount[] = Object.entries(genres)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: (count / watched.length) * 100
      }))
      .sort((a, b) => b.count - a.count);

    setGenreCounts(genreStats);

    // Count directors
    const directors: Record<string, number> = {};
    watched.forEach(movie => {
      directors[movie.director] = (directors[movie.director] || 0) + 1;
    });

    const directorStats: DirectorCount[] = Object.entries(directors)
      .map(([director, count]) => ({
        director,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);  // Top 5 directors

    setDirectorCounts(directorStats);

    // Count decades
    const decades: Record<string, number> = {};
    watched.forEach(movie => {
      const year = parseInt(movie.year);
      const decade = `${Math.floor(year / 10) * 10}s`;
      decades[decade] = (decades[decade] || 0) + 1;
    });

    const decadeStats: DecadeCount[] = Object.entries(decades)
      .map(([decade, count]) => ({
        decade,
        count
      }))
      .sort((a, b) => {
        // Extract the decade number for proper sorting
        const aNum = parseInt(a.decade);
        const bNum = parseInt(b.decade);
        return aNum - bNum;
      });

    setDecadeCounts(decadeStats);

  }, [user]);

  return (
    <ProtectedRoute>
      <div className="bg-zinc-50 text-zinc-900 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Movie Statistics</h1>
            <p className="text-zinc-600">
              Track your progress and analyze your movie watching habits
            </p>
          </div>

          {/* Progress overview */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Progress Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-medium text-blue-700 mb-1">Movies Watched</h3>
                <p className="text-3xl font-bold text-blue-900">{watchedCount}</p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-medium text-amber-700 mb-1">Movies Remaining</h3>
                <p className="text-3xl font-bold text-amber-900">{remainingCount}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-medium text-green-700 mb-1">Average Rating</h3>
                <p className="text-3xl font-bold text-green-900">
                  {ratings.length > 0 ? avgRating.toFixed(1) : "N/A"}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Overall Progress</h3>
              <div className="w-full bg-zinc-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{ width: `${(watchedCount / 1001) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-zinc-600 mt-1">
                {((watchedCount / 1001) * 100).toFixed(1)}% complete
              </p>
            </div>

            {/* Prediction */}
            {watchedCount > 0 && (
              <div className="mt-4 bg-zinc-100 p-4 rounded-lg">
                <h3 className="font-medium mb-1">At your current rate</h3>
                <p className="text-zinc-700">
                  {/* Assuming 1 movie per week */}
                  Estimated completion date:
                  {" "}
                  <span className="font-medium">
                    {new Date(
                      Date.now() + (remainingCount * 7 * 24 * 60 * 60 * 1000)
                    ).toLocaleDateString()}
                  </span>
                </p>
              </div>
            )}
          </Card>

          {/* Genre breakdown */}
          {genreCounts.length > 0 && (
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Genre Breakdown</h2>

              <div className="space-y-3">
                {genreCounts.map(genre => (
                  <div key={genre.genre}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{genre.genre}</span>
                      <span className="text-sm text-zinc-600">
                        {genre.count} ({genre.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${genre.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Top directors and decades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {directorCounts.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Top Directors</h2>
                <div className="space-y-4">
                  {directorCounts.map(director => (
                    <div key={director.director}>
                      <div className="flex justify-between">
                        <span className="font-medium">{director.director}</span>
                        <span className="bg-blue-100 text-blue-800 rounded-full px-2 text-sm">
                          {director.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {decadeCounts.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Movies by Decade</h2>
                <div className="space-y-3">
                  {decadeCounts.map(decade => (
                    <div key={decade.decade}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{decade.decade}</span>
                        <span className="text-sm text-zinc-600">{decade.count}</span>
                      </div>
                      <div className="w-full bg-zinc-200 rounded-full h-2.5">
                        <div
                          className="bg-amber-500 h-2.5 rounded-full"
                          style={{ width: `${(decade.count / watchedCount) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Highest rated movies */}
          {ratings.length > 0 && (
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Highest Rated Movies</h2>
              <div className="space-y-3">
                {ratings
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 5)
                  .map(rating => {
                    const movie = movies.find(m => m.id === rating.movieId);
                    if (!movie) return null;

                    return (
                      <div key={rating.movieId} className="flex justify-between items-center border-b pb-3">
                        <div>
                          <Link href={`/movie/${movie.id}`} className="font-medium hover:text-blue-600">
                            {movie.title} ({movie.year})
                          </Link>
                          <p className="text-sm text-zinc-600">Directed by {movie.director}</p>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-yellow-500">
                              {i < rating.rating ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-4">
                <Link href="/movies">
                  <Button variant="outline" className="w-full">
                    View All Movies
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
