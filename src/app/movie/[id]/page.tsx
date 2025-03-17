"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getMovieById } from "@/data/movies";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/components/language-provider";
import ProtectedRoute from "@/components/protected-route";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import WatchlistButton from "@/components/watchlist-button";
import AchievementRecommendations from "@/components/achievement-recommendations";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from 'react-share';

export default function MovieDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, markMovieAsWatched, removeMovieFromWatched, isMovieWatched } = useAuth();
  const { t } = useLanguage();

  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isWatched, setIsWatched] = useState(false);
  const [movie, setMovie] = useState(getMovieById(id as string));
  const [isClient, setIsClient] = useState(false);

  // Set isClient after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // If movie not found, redirect to movies page
  useEffect(() => {
    if (!movie) {
      router.push("/movies");
    }
  }, [movie, router]);

  // Check if the movie is already watched and has a rating
  useEffect(() => {
    if (!user || !movie) return;

    // Check if the movie is in the user's watched list
    setIsWatched(isMovieWatched(movie.id));

    // Check if the movie has a rating
    const ratingKey = `movie_rating_${movie.id}`;
    const savedRating = localStorage.getItem(ratingKey);
    if (savedRating) {
      setSelectedRating(parseInt(savedRating));
    }
  }, [movie, user, isMovieWatched, movie?.id]);

  if (!movie) {
    return null; // Will redirect in useEffect
  }

  const handleRateMovie = (rating: number) => {
    setSelectedRating(rating);

    // For demonstration, we'll just store it in localStorage
    if (user) {
      const ratingKey = `movie_rating_${movie.id}`;
      localStorage.setItem(ratingKey, rating.toString());

      // Also mark as watched if not already
      if (!isWatched) {
        handleMarkAsWatched();
      }
    }
  };

  const handleMarkAsWatched = () => {
    markMovieAsWatched(movie.id);
    setIsWatched(true);
  };

  const handleUnmarkAsWatched = () => {
    removeMovieFromWatched(movie.id);
    setIsWatched(false);
    setSelectedRating(null);
  };

  // For social sharing
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `Check out ${movie.title} from 1001 Movies Generator!`;

  return (
    <ProtectedRoute>
      <div className="bg-zinc-50 text-zinc-900 py-8 dark:bg-zinc-900 dark:text-zinc-50">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back button */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Movies
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Movie poster */}
            <div className="md:col-span-1">
              <div className="relative aspect-[2/3] w-full max-w-[300px] mx-auto md:max-w-none overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={movie.posterUrl}
                  alt={`${movie.title} poster`}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                  className="hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {isWatched ? (
                  <>
                    <div className="bg-green-100 p-3 rounded-md flex justify-between items-center dark:bg-green-900/20">
                      <p className="text-green-700 font-medium dark:text-green-400">{t('movie.youveWatched')}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={handleUnmarkAsWatched}
                      >
                        {t('movie.remove')}
                      </Button>
                    </div>

                    <p className="text-sm font-medium mb-2">{t('movie.rateThisMovie')}:</p>
                    <div className="flex gap-2 mb-4 justify-center md:justify-start">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant={selectedRating === rating ? "default" : "outline"}
                          className={`rounded-full h-10 w-10 p-0 ${
                            selectedRating === rating ? "bg-blue-600" : ""
                          }`}
                          onClick={() => handleRateMovie(rating)}
                        >
                          {rating}
                        </Button>
                      ))}
                    </div>
                  </>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleMarkAsWatched}
                    className="w-full"
                  >
                    {t('movie.markAsWatched')}
                  </Button>
                )}

                {/* Watchlist button */}
                <div className="mt-4">
                  <WatchlistButton movieId={movie.id} className="w-full" />
                </div>

                {/* Share buttons */}
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2 text-center md:text-left">Share this movie:</p>
                  <div className="flex space-x-2 justify-center md:justify-start">
                    <FacebookShareButton url={shareUrl} quote={shareTitle}>
                      <FacebookIcon size={40} round />
                    </FacebookShareButton>

                    <TwitterShareButton url={shareUrl} title={shareTitle}>
                      <TwitterIcon size={40} round />
                    </TwitterShareButton>

                    <WhatsappShareButton url={shareUrl} title={shareTitle}>
                      <WhatsappIcon size={40} round />
                    </WhatsappShareButton>
                  </div>
                </div>

                {/* IMDb link */}
                {movie.imdbId && (
                  <Link
                    href={`https://www.imdb.com/title/${movie.imdbId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2"
                  >
                    <Button variant="outline" className="w-full">
                      View on IMDb
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Movie details */}
            <div className="md:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 mt-6 md:mt-0">
                {movie.title}
                <span className="text-zinc-400 ml-2">({movie.year})</span>
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genre && movie.genre.map(genre => (
                  <span
                    key={genre}
                    className="bg-zinc-100 px-3 py-1 rounded-md text-sm dark:bg-zinc-800"
                  >
                    {genre}
                  </span>
                ))}
                {movie.runtime && (
                  <span className="bg-zinc-100 px-3 py-1 rounded-md text-sm dark:bg-zinc-800">
                    {movie.runtime}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h2 className="text-sm text-zinc-500 dark:text-zinc-400">Director</h2>
                  <p className="font-medium">{movie.director}</p>
                </div>

                <div>
                  <h2 className="text-sm text-zinc-500 dark:text-zinc-400">Country</h2>
                  <p className="font-medium">{movie.country}</p>
                </div>

                {movie.releaseDate && (
                  <div>
                    <h2 className="text-sm text-zinc-500 dark:text-zinc-400">Release Date</h2>
                    <p className="font-medium">{movie.releaseDate}</p>
                  </div>
                )}

                {movie.rating && (
                  <div>
                    <h2 className="text-sm text-zinc-500 dark:text-zinc-400">Rating</h2>
                    <p className="font-medium">{movie.rating}</p>
                  </div>
                )}

                {movie.language && (
                  <div>
                    <h2 className="text-sm text-zinc-500 dark:text-zinc-400">Language</h2>
                    <p className="font-medium">{movie.language}</p>
                  </div>
                )}

                {movie.cinematography && (
                  <div>
                    <h2 className="text-sm text-zinc-500 dark:text-zinc-400">Cinematography</h2>
                    <p className="font-medium">{movie.cinematography}</p>
                  </div>
                )}

                {movie.musicBy && (
                  <div>
                    <h2 className="text-sm text-zinc-500 dark:text-zinc-400">Music By</h2>
                    <p className="font-medium">{movie.musicBy}</p>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
                <p className="text-base leading-relaxed">{movie.synopsis}</p>
              </div>

              {movie.cast && movie.cast.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Cast</h2>
                  <div className="flex flex-wrap gap-2">
                    {movie.cast.map(actor => (
                      <span
                        key={actor}
                        className="bg-zinc-100 px-3 py-2 rounded-md text-sm dark:bg-zinc-800"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movie.awards && movie.awards.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Awards</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {movie.awards.map((award, index) => (
                      <li key={index}>{award}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Achievement Recommendations */}
          {isClient && (
            <div className="mt-12">
              <AchievementRecommendations />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
