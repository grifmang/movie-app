"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { movies } from "@/data/movies";
import { Input } from "@/components/ui/input";
import WatchlistButton from "@/components/watchlist-button";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/components/language-provider";

export default function MoviesPage() {
  const { user, isAuthenticated, isMovieWatched } = useAuth();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set isClient after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Extract unique genres from movies
  const allGenres = Array.from(
    new Set(
      movies.flatMap(movie => movie.genre || [])
    )
  ).filter(Boolean).sort();

  // Extract unique decades from movies
  const decades = Array.from(
    new Set(
      movies.map(movie => Math.floor(movie.year / 10) * 10)
    )
  ).sort((a, b) => a - b);

  // Filter movies based on search and filters
  const filteredMovies = movies.filter(movie => {
    // Search term filter
    const matchesSearch = searchTerm
      ? movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (movie.director && movie.director.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    // Genre filter
    const matchesGenre = genreFilter
      ? movie.genre && movie.genre.includes(genreFilter)
      : true;

    // Year filter (by decade)
    const matchesYear = yearFilter
      ? movie.year >= yearFilter && movie.year < yearFilter + 10
      : true;

    return matchesSearch && matchesGenre && matchesYear;
  });

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Movie Library</h1>

        {/* Search and filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder="Search by title or director..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <select
              className="w-full p-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800"
              value={genreFilter || ""}
              onChange={(e) => setGenreFilter(e.target.value || null)}
            >
              <option value="">All Genres</option>
              {allGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="w-full p-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800"
              value={yearFilter || ""}
              onChange={(e) => setYearFilter(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">All Decades</option>
              {decades.map((decade) => (
                <option key={decade} value={decade}>
                  {decade}s
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Showing {filteredMovies.length} of {movies.length} movies
        </p>

        {/* Movie grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => {
            const isWatched = isClient && isAuthenticated ? isMovieWatched(movie.id) : false;

            return (
              <Card key={movie.id} className="overflow-hidden flex flex-col h-full">
                <Link href={`/movie/${movie.id}`} className="block relative aspect-[2/3]">
                  <Image
                    src={movie.posterUrl}
                    alt={`${movie.title} poster`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform hover:scale-105"
                  />
                  {isWatched && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Watched
                    </div>
                  )}
                </Link>
                <div className="p-4 flex-grow flex flex-col">
                  <h2 className="font-semibold mb-1 line-clamp-1">{movie.title}</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                    {movie.year} • {movie.director}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {movie.genre && movie.genre.slice(0, 2).map((genre) => (
                      <span
                        key={genre}
                        className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto pt-2 flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/movie/${movie.id}`}>View</Link>
                    </Button>
                    {isClient && isAuthenticated && (
                      <WatchlistButton movieId={movie.id} variant="outline" />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
