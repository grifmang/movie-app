"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "./language-provider";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface WatchlistButtonProps {
  movieId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export default function WatchlistButton({
  movieId,
  variant = "outline",
  size = "default",
  className = "",
  showText = true
}: WatchlistButtonProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useAuth();
  const { t } = useLanguage();
  const [isAdded, setIsAdded] = useState(false);

  // Check if the movie is in the watchlist
  useEffect(() => {
    setIsAdded(isInWatchlist(movieId));
  }, [movieId, isInWatchlist]);

  const handleToggleWatchlist = () => {
    if (isAdded) {
      removeFromWatchlist(movieId);
      setIsAdded(false);
    } else {
      addToWatchlist(movieId);
      setIsAdded(true);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleWatchlist}
      className={`flex items-center gap-2 ${className}`}
      title={isAdded ? t('movie.inWatchlist') : t('movie.addToWatchlist')}
    >
      {isAdded ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showText && (
        <span>{isAdded ? t('movie.inWatchlist') : t('movie.addToWatchlist')}</span>
      )}
    </Button>
  );
}
