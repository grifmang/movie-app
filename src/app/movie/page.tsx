"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getRandomMovie } from "@/data/movies";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/context/auth-context";

export default function MoviePage() {
  const movie = getRandomMovie();
  const { user, markMovieAsWatched, isMovieWatched, removeMovieFromWatched } = useAuth();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isWatched, setIsWatched] = useState(false);

  // Check if the movie is already watched and has a rating
  useEffect(() => {
    if (!user) return;

    // Check if the movie is in the user's watched list
    setIsWatched(isMovieWatched(movie.id));

    // Check if the movie has a rating
    const ratingKey = `movie_rating_${movie.id}`;
    const savedRating = localStorage.getItem(ratingKey);
    if (savedRating) {
      setSelectedRating(parseInt(savedRating));
    }
  }, [movie.id, user, isMovieWatched]);

  const handleRateMovie = (rating: number) => {
    setSelectedRating(rating);
    // In a real app, we would save this to a database
    console.log(`Rated ${movie.title} ${rating} stars`);

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

  return (
    <ProtectedRoute>
      <div className="bg-zinc-50 text-zinc-900 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <header className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">
              Your Daily Movie
            </h1>
            <p className="text-zinc-600">
              From the 1001 Movies You Must See Before You Die list
            </p>
          </header>

          <Card className="overflow-hidden border border-zinc-200 shadow-md">
            <div className="md:grid md:grid-cols-3 gap-6">
              <div className="relative h-[400px] md:h-full">
                <Image
                  src={movie.posterUrl}
                  alt={`${movie.title} poster`}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>

              <div className="col-span-2 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{movie.title} ({movie.year})</h2>
                  <div className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-sm font-semibold">
                    #{movie.id}/1001
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-zinc-600 mb-2">Directed by</p>
                  <p className="font-semibold">{movie.director}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-zinc-600 mb-2">Country</p>
                  <p className="font-semibold">{movie.country}</p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-zinc-600 mb-2">Genre</p>
                  <div className="flex flex-wrap gap-2">
                    {movie.genre.map((genre, index) => (
                      <span
                        key={index}
                        className="bg-zinc-100 px-2 py-1 rounded-md text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-zinc-600 mb-2">Synopsis</p>
                  <p className="text-base">{movie.synopsis}</p>
                </div>

                <div className="mb-6">
                  {isWatched ? (
                    <div className="bg-green-100 p-3 rounded-md mb-4 flex justify-between items-center">
                      <p className="text-green-700">You've watched this movie!</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={handleUnmarkAsWatched}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleMarkAsWatched}
                      className="w-full mb-4"
                    >
                      Mark as Watched
                    </Button>
                  )}

                  <p className="text-sm text-zinc-600 mb-2">Rate this movie</p>
                  <div className="flex gap-2">
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
                </div>

                {movie.imdbId && (
                  <Link
                    href={`https://www.imdb.com/title/${movie.imdbId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      View on IMDb
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-zinc-600 mb-4">
              Come back tomorrow for your next movie recommendation!
            </p>
            <Link href="/profile">
              <Button variant="outline">
                View your profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
