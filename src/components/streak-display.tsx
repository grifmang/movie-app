"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/components/language-provider";
import { Card } from "@/components/ui/card";
import { calculateStreak, getStreakMilestoneMessage, StreakData } from "@/lib/streak";
import { CalendarDaysIcon, FlameIcon, TrophyIcon, AlertCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  className?: string;
  variant?: "card" | "inline" | "compact";
}

export default function StreakDisplay({
  className = "",
  variant = "card"
}: StreakDisplayProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (user) {
      const data = calculateStreak(user);
      setStreakData(data);
    }
  }, [user]);

  if (!isClient || !streakData || !user) {
    return null;
  }

  // For compact/inline displays, return a simpler version
  if (variant === "inline" || variant === "compact") {
    return (
      <div className={cn(
        "flex items-center gap-1.5",
        variant === "compact" ? "text-sm" : "text-base",
        className
      )}>
        <FlameIcon className={cn(
          "h-4 w-4",
          streakData.isStreakActive ? "text-orange-500" : "text-gray-400"
        )} />
        <span className="font-semibold">{streakData.currentStreak}</span>
        <span className="text-zinc-500 dark:text-zinc-400">
          {t('streaks.days')}
        </span>
      </div>
    );
  }

  // Get milestone message if applicable
  const milestoneMessage = getStreakMilestoneMessage(streakData.currentStreak);

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <FlameIcon className={cn(
              "mr-2 h-5 w-5",
              streakData.isStreakActive ? "text-orange-500" : "text-gray-400"
            )} />
            {t('streaks.currentStreak')}
          </h3>
          <div className="mt-1 text-3xl font-bold">
            {streakData.currentStreak}
            <span className="ml-1 text-base font-normal text-zinc-500 dark:text-zinc-400">
              {t('streaks.days')}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center justify-end">
            <TrophyIcon className="h-4 w-4 mr-1 text-yellow-500" />
            {t('streaks.longestStreak')}: <span className="font-semibold ml-1">{streakData.longestStreak}</span>
          </div>

          {streakData.streakStartDate && (
            <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center justify-end mt-1">
              <CalendarDaysIcon className="h-4 w-4 mr-1" />
              {t('streaks.since')}: <span className="font-semibold ml-1">
                {new Date(streakData.streakStartDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Streak status */}
      <div className={cn(
        "mt-4 p-3 rounded-md text-sm",
        streakData.isStreakActive
          ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
          : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
      )}>
        {streakData.isStreakActive ? (
          streakData.lastWatchedDate === streakData.today ? (
            <p className="flex items-center">
              <FlameIcon className="h-4 w-4 mr-2 text-orange-500" />
              {t('streaks.watchedToday')}
            </p>
          ) : (
            <p className="flex items-center">
              <AlertCircleIcon className="h-4 w-4 mr-2 text-amber-500" />
              {t('streaks.keepTheStreak')}
            </p>
          )
        ) : (
          <p className="flex items-center">
            <AlertCircleIcon className="h-4 w-4 mr-2" />
            {t('streaks.startNewStreak')}
          </p>
        )}
      </div>

      {/* Milestone message */}
      {milestoneMessage && (
        <div className="mt-3 p-3 bg-blue-50 text-blue-700 rounded-md text-sm dark:bg-blue-900/20 dark:text-blue-400">
          <p className="flex items-center">
            <TrophyIcon className="h-4 w-4 mr-2 text-yellow-500" />
            {milestoneMessage}
          </p>
        </div>
      )}
    </Card>
  );
}
