"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/components/language-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getAchievementBasedRecommendations,
  MovieRecommendation,
  getNextAchievementForMovie
} from "@/lib/achievement-recommendations";
import { Achievement } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Star, BookmarkPlus, Calendar, Film, Clock, Award } from "lucide-react";

interface AchievementRecommendationsProps {
  className?: string;
  count?: number;
}

export default function AchievementRecommendations({
  className = "",
  count = 4
}: AchievementRecommendationsProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    if (user) {
      const recs = getAchievementBasedRecommendations(user, count);
      setRecommendations(recs);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user, count]);

  if (!isClient || !user) {
    return null;
  }

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Trophy className="h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('recommendations.noAchievements')}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            {t('recommendations.watchMoreMovies')}
          </p>
          <Button asChild>
            <Link href="/movies">{t('recommendations.browseMovies')}</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {t('recommendations.achievementRecommendations')}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t('recommendations.moviesThatHelp')}
          </p>
        </div>
        <Link href="/recommendations/achievements" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          {t('profile.viewAll')}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.movie.id} recommendation={rec} />
        ))}
      </div>
    </Card>
  );
}

interface RecommendationCardProps {
  recommendation: MovieRecommendation;
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [nextAchievement, setNextAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    if (user) {
      const achievement = getNextAchievementForMovie(user, recommendation.movie);
      setNextAchievement(achievement);
    }
  }, [user, recommendation.movie]);

  // Get icon based on primary reason type
  const getReasonIcon = (type: string) => {
    const icons = {
      'achievement': <Trophy className="h-4 w-4 text-yellow-500" />,
      'collection': <Film className="h-4 w-4 text-blue-500" />,
      'director': <Star className="h-4 w-4 text-purple-500" />,
      'era': <Calendar className="h-4 w-4 text-green-500" />,
      'streak': <Clock className="h-4 w-4 text-orange-500" />
    };

    return icons[type as keyof typeof icons] || <Award className="h-4 w-4" />;
  };

  const primaryReason = recommendation.reasons[0];

  return (
    <div className="border rounded-lg overflow-hidden flex flex-col h-full">
      <Link href={`/movie/${recommendation.movie.id}`} className="block relative aspect-[16/9]">
        <Image
          src={recommendation.movie.posterUrl}
          alt={recommendation.movie.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {nextAchievement && nextAchievement.unlocked && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <Trophy className="h-3 w-3 mr-1" />
            {t('recommendations.unlocks')}
          </div>
        )}
      </Link>

      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold mb-1">
          {recommendation.movie.title}
          <span className="text-zinc-500 text-sm ml-1">({recommendation.movie.year})</span>
        </h3>

        <div className="flex items-center gap-1 mb-3">
          {recommendation.movie.genre && recommendation.movie.genre.slice(0, 2).map(genre => (
            <Badge
              key={genre}
              variant="secondary"
              className="text-xs"
            >
              {genre}
            </Badge>
          ))}
        </div>

        <div className="space-y-2 mb-4 flex-grow">
          {recommendation.reasons.slice(0, 2).map((reason, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              {getReasonIcon(reason.type)}
              <span className="text-zinc-700 dark:text-zinc-300">{reason.message}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-2">
          <Button className="w-full" asChild>
            <Link href={`/movie/${recommendation.movie.id}`}>
              {t('recommendations.viewDetails')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
