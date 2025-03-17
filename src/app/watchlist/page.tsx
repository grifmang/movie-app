"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/protected-route";
import Link from "next/link";
import Image from "next/image";
import { getMovieById } from "@/data/movies";
import { Movie } from "@/types/movie";
import WatchlistButton from "@/components/watchlist-button";

export default function WatchlistPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.watchlist) {
      setWatchlistMovies([]);
      setIsLoading(false);
      return;
    }

    // Get movie details for each ID in the watchlist
    const movies = user.watchlist
      .map(id => getMovieById(id))
      .filter(Boolean) as Movie[];

    setWatchlistMovies(movies);
    setIsLoading(false);
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="bg-zinc-50 text-zinc-900 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">{t('watchlist.title')}</h1>
            <p className="text-zinc-600">
              {t('watchlist.subtitle')}
            </p>
          </header>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
          ) : watchlistMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {watchlistMovies.map(movie => (
                <Card key={movie.id} className="overflow-hidden h-full flex flex-col">
                  <Link href={`/movie/${movie.id}`} className="flex-shrink-0">
                    <div className="relative h-48 sm:h-64">
                      <Image
                        src={movie.posterUrl}
                        alt={`${movie.title} poster`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  <div className="p-4 flex flex-col flex-grow">
                    <Link href={`/movie/${movie.id}`}>
                      <h2 className="font-bold text-lg mb-1 hover:text-blue-600 transition-colors">
                        {movie.title} ({movie.year})
                      </h2>
                    </Link>

                    <p className="text-sm text-zinc-600 mb-3 line-clamp-2">
                      {movie.director}
                    </p>

                    <div className="mt-auto flex gap-2">
                      <WatchlistButton
                        movieId={movie.id}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      />

                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <Link href={`/movie/${movie.id}`}>
                          {t('watchlist.viewDetails')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{t('watchlist.empty')}</h3>
              <p className="text-zinc-600 mb-6">
                {t('watchlist.emptyDescription')}
              </p>
              <Button asChild>
                <Link href="/movies">
                  {t('watchlist.browseMovies')}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
