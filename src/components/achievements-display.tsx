"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/components/language-provider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Achievement, calculateAchievements } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { Lock, CheckCircle2, Trophy, Medal, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming Button is imported from ui/button
import Link from "next/link"; // Assuming Link is imported from next/link

interface AchievementsDisplayProps {
  className?: string;
  compact?: boolean;
}

export default function AchievementsDisplay({
  className = "",
  compact = false
}: AchievementsDisplayProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    setIsClient(true);
    if (user) {
      const userAchievements = calculateAchievements(user);
      setAchievements(userAchievements);
    }
  }, [user]);

  if (!isClient || !user) {
    return null;
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  // Filter achievements by type
  const filterAchievements = (type: string | null) => {
    if (!type || type === "all") return achievements;
    return achievements.filter(a => a.type === type);
  };

  const filteredAchievements = filterAchievements(activeTab === "all" ? null : activeTab);

  // For compact display
  if (compact) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            {t('achievements.recentUnlocked')}
          </h3>
          <Badge variant="outline" className="text-xs">
            {unlockedCount}/{totalCount}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {achievements
            .filter(a => a.unlocked)
            .slice(0, 3)
            .map(achievement => (
              <div
                key={achievement.id}
                className="flex flex-col items-center justify-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-md"
              >
                <div className="text-3xl mb-1">{achievement.icon}</div>
                <div className="text-xs text-center font-medium">{achievement.name}</div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {t('achievements.yourAchievements')}
        </h2>
        <Badge variant="outline">
          {completionPercentage}% {t('achievements.complete')}
        </Badge>
      </div>

      <div className="mb-4">
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
          <div
            className="bg-yellow-500 h-2 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {unlockedCount} {t('achievements.of')} {totalCount} {t('achievements.unlocked')}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start mb-4 overflow-x-auto">
          <TabsTrigger value="all">{t('achievements.all')}</TabsTrigger>
          <TabsTrigger value="milestone">{t('achievements.milestones')}</TabsTrigger>
          <TabsTrigger value="collection">{t('achievements.collections')}</TabsTrigger>
          <TabsTrigger value="streak">{t('achievements.streaks')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredAchievements.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add button to view achievement-based recommendations */}
      {!compact && (
        <div className="mt-6 flex justify-end">
          <Button asChild>
            <Link href="/recommendations/achievements">
              {t('achievements.viewRecommendations')}
            </Link>
          </Button>
        </div>
      )}
    </Card>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const { t } = useLanguage();
  const progress = Math.min(achievement.progress, achievement.max);
  const percentage = Math.round((progress / achievement.max) * 100);

  return (
    <div
      className={cn(
        "border rounded-lg p-4 relative",
        achievement.unlocked
          ? "bg-zinc-50 dark:bg-zinc-800"
          : "bg-zinc-50/50 dark:bg-zinc-800/30 opacity-70"
      )}
    >
      {/* Lock icon for locked achievements */}
      {!achievement.unlocked && (
        <div className="absolute top-2 right-2">
          <Lock className="h-4 w-4 text-zinc-400" />
        </div>
      )}

      {/* Achievement icon */}
      <div className="mb-3 flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="text-2xl">{achievement.icon}</div>
          <div>
            <h3 className="font-semibold text-sm">{achievement.name}</h3>
            {achievement.level && (
              <Badge
                variant="secondary"
                className="text-xs"
              >
                {t('achievements.level')} {achievement.level}
              </Badge>
            )}
          </div>
        </div>

        {achievement.unlocked && (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        )}
      </div>

      {/* Achievement description */}
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
        {achievement.description}
      </p>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>{progress}/{achievement.max}</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
          <div
            className={cn(
              "h-1.5 rounded-full",
              achievement.unlocked ? "bg-green-500" : "bg-blue-500"
            )}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Unlock date for unlocked achievements */}
      {achievement.unlocked && achievement.unlockedAt && (
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {t('achievements.unlockedOn')}: {new Date(achievement.unlockedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
