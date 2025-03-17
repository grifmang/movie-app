"use client";

import Link from "next/link";
import Image from "next/image";
import { movies } from "@/data/movies";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/components/language-provider";
import { useEffect, useState } from "react";
import RecommendationSection from "@/components/recommendations-section";
import ShareProgressCard from "@/components/share-progress-card";
import { useRouter } from "next/navigation";
// Import streak display
import StreakDisplay from "@/components/streak-display";
// Import achievements display
import AchievementsDisplay from "@/components/achievements-display";
// Import AchievementRecommendations
import AchievementRecommendations from "@/components/achievement-recommendations";

interface UserReview {
  movieId: string;
  rating: number;
  text?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, removeMovieFromWatched } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [watchedMoviesDetails, setWatchedMoviesDetails] = useState<typeof movies>([]);
  const [progressData, setProgressData] = useState({
    count: 0,
    total: 1001,
    percent: 0
  });

  useEffect(() => {
    setIsClient(true);

    if (user) {
      // Calculate progress
      const watchedCount = user.watchedMovies.length || 0;
      const totalMovies = 1001;
      const progressPercentage = (watchedCount / totalMovies) * 100;

      setProgressData({
        count: watchedCount,
        total: totalMovies,
        percent: progressPercentage
      });

      // Get the watched movies' details
      const moviesDetails = movies.filter(movie => user.watchedMovies.includes(movie.id));
      setWatchedMoviesDetails(moviesDetails);

      // For demo purposes, we'll get ratings from localStorage
      const ratings: UserReview[] = [];

      // Check each movie if it has a rating
      user.watchedMovies.forEach(movieId => {
        const ratingKey = `movie_rating_${movieId}`;
        const rating = localStorage.getItem(ratingKey);

        if (rating) {
          ratings.push({
            movieId,
            rating: parseInt(rating),
            text: `You rated this movie ${rating}/5 stars.`
          });
        } else {
          // If watched but not rated
          ratings.push({
            movieId,
            rating: 0,
            text: "You watched this movie but haven't rated it yet."
          });
        }
      });

      setReviews(ratings);
    }
  }, [user]);

  const handleRemoveMovie = (movieId: string) => {
    if (isClient && confirm("Are you sure you want to remove this movie from your watched list?")) {
      removeMovieFromWatched(movieId);
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-zinc-50 text-zinc-900 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {t('profile.title', { name: user?.name || "User" })}
            </h1>
            {isClient && (
              <p className="text-zinc-600 mb-2">
                {t('profile.joinedOn', {
                  date: user?.joinedDate
                    ? new Date(user.joinedDate).toLocaleDateString()
                    : new Date().toLocaleDateString()
                })}
              </p>
            )}
            <Link
              href="/settings"
              className="text-blue-600 hover:underline text-sm"
            >
              {t('profile.editProfileSettings')}
            </Link>
          </header>

          {/* Progress section with sharing */}
          <h2 className="text-2xl font-semibold mb-4">{t('profile.yourProgress')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Progress Card */}
            <Card className="p-6">
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{t('profile.moviesWatched')}</span>
                  <span className="font-semibold">{progressData.count} / {progressData.total}</span>
                </div>

                <div className="w-full bg-zinc-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${progressData.percent}%` }}
                  ></div>
                </div>

                <p className="mt-2 text-sm text-zinc-600">
                  {t('profile.percentComplete', {
                    percent: progressData.percent.toFixed(1),
                    remaining: progressData.total - progressData.count
                  })}
                </p>
              </div>

              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/movie">
                    {t('profile.getTodaysMovie')}
                  </Link>
                </Button>

                <Button variant="outline" asChild>
                  <Link href="/">
                    {t('profile.goToHome')}
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Share Progress Card */}
            {isClient && (
              <ShareProgressCard
                watchedCount={progressData.count}
                remainingCount={progressData.total - progressData.count}
                progressPercent={progressData.percent}
              />
            )}
          </div>

          {/* Streak display - add this section before the Recommendations Section */}
          {isClient && (
            <div className="mb-8">
              <StreakDisplay />
            </div>
          )}

          {/* Achievements - add this section before the Recommendations Section */}
          {isClient && (
            <div className="mb-8">
              <AchievementsDisplay />
            </div>
          )}

          {/* Achievement Recommendations */}
          {isClient && (
            <div className="mb-8">
              <AchievementRecommendations />
            </div>
          )}

          {/* Recommendations Section */}
          <div className="mb-12">
            <RecommendationSection count={4} />
          </div>

          {/* Recently Watched Movies */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">{t('profile.yourRecentlyWatchedMovies')}</h2>

            {watchedMoviesDetails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {watchedMoviesDetails.map(movie => {
                  const review = reviews.find(r => r.movieId === movie.id);

                  return (
                    <Card key={movie.id} className="overflow-hidden">
                      <div className="flex">
                        <div className="relative w-1/3 h-[180px]">
                          <Image
                            src={movie.posterUrl}
                            alt={`${movie.title} poster`}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>

                        <div className="p-4 w-2/3">
                          <div className="flex justify-between">
                            <h3 className="font-semibold text-lg mb-1">
                              {movie.title} ({movie.year})
                            </h3>
                            <button
                              onClick={() => handleRemoveMovie(movie.id)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              {t('movie.remove')}
                            </button>
                          </div>

                          <div className="flex items-center gap-1 mb-2">
                            {review && review.rating > 0 && (
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className="text-yellow-500">
                                    {i < review.rating ? "★" : "☆"}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {review?.text && (
                            <p className="text-sm text-zinc-600 line-clamp-3">
                              {review.text}
                            </p>
                          )}

                          <div className="mt-2">
                            <Link
                              href={`/movie/${movie.id}`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {t('watchlist.viewDetails')}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p>{t('profile.noMoviesWatched')}</p>
                <Button className="mt-4" asChild>
                  <Link href="/movie">{t('profile.getStarted')}</Link>
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
