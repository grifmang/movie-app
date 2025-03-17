"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "./language-provider";
import { Movie } from "@/types/movie";
import { getRecommendations, analyzeUserPreferences } from "@/lib/recommendations";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface RecommendationsProps {
  count?: number;
}

export default function RecommendationSection({ count = 4 }: RecommendationsProps) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get recommendations based on user preferences
    const movieRecs = getRecommendations(user, count);
    setRecommendations(movieRecs);
    setLoading(false);
  }, [user, count]);

  // If not authenticated, show simplified message
  if (!isAuthenticated) {
    return null;
  }

  // Get user preferences for explanation
  const { genrePreferences } = analyzeUserPreferences(user);
  const topGenres = genrePreferences.slice(0, 3).map(g => g.genre);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('profile.recommendedForYou')}</h2>
        <Link href="/movies" className="text-sm text-blue-600 hover:underline">
          {t('profile.viewAll')}
        </Link>
      </div>

      {topGenres.length > 0 && (
        <p className="text-sm text-zinc-600">
          {t('profile.basedOnInterest', { genres: topGenres.join(", ") })}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommendations.map((movie) => (
            <Link key={movie.id} href={`/movie/${movie.id}`}>
              <Card className="h-full overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
                <div className="relative aspect-[2/3]">
                  <Image
                    src={movie.posterUrl}
                    alt={`${movie.title} poster`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
                  <p className="text-xs text-zinc-500">{movie.year}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
