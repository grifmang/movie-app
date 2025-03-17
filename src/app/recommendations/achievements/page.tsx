"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/components/language-provider";
import ProtectedRoute from "@/components/protected-route";
import AchievementRecommendations from "@/components/achievement-recommendations";
import AchievementsDisplay from "@/components/achievements-display";
import { Trophy } from "lucide-react";
import Link from "next/link";

export default function AchievementRecommendationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <ProtectedRoute>
      <div className="bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Trophy className="h-7 w-7 text-yellow-500" />
              {t('recommendations.achievementRecommendations')}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {t('recommendations.personalizedForAchievements')}
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                {t('recommendations.back')}
              </Button>
              <Button asChild>
                <Link href="/movies">
                  {t('recommendations.browseAllMovies')}
                </Link>
              </Button>
            </div>
          </header>

          {isClient && (
            <div className="grid grid-cols-1 gap-6">
              {/* Main recommendations with larger count */}
              <AchievementRecommendations count={8} />

              {/* Display compact achievements for reference */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {t('recommendations.yourProgress')}
                </h2>
                <AchievementsDisplay compact />
              </Card>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
