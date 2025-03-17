"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/components/language-provider";
import { Share2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
} from 'react-share';

interface ShareProgressCardProps {
  watchedCount: number;
  remainingCount: number;
  progressPercent: number;
  className?: string;
}

export default function ShareProgressCard({
  watchedCount,
  remainingCount,
  progressPercent,
  className = ""
}: ShareProgressCardProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Only set the URL after component mounts to avoid hydration mismatch
  useEffect(() => {
    setShareUrl(window.location.origin + '/profile?ref=share');
  }, []);

  // Create share messages
  const shareTitle = t('share.title', { name: user?.name || "User" });
  const shareMessage = t('share.message', {
    count: watchedCount,
    percent: progressPercent.toFixed(1),
    remaining: remainingCount
  });

  // Hashtags for Twitter
  const hashtags = ['1001Movies', 'MovieChallenge', 'FilmLovers'];

  const handleCopyLink = () => {
    const fullShareText = `${shareTitle}\n\n${shareMessage}\n\n${shareUrl}`;
    navigator.clipboard.writeText(fullShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('share.shareProgress')}</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              {t('share.shareNow')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('share.shareYourProgress')}</DialogTitle>
              <DialogDescription>
                {t('share.shareProgressDescription')}
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-zinc-50 rounded-md my-4">
              <p className="font-semibold">{shareTitle}</p>
              <p className="mt-2 text-sm text-zinc-700">{shareMessage}</p>
            </div>

            {shareUrl && (
              <div className="flex gap-4 justify-center my-4">
                <FacebookShareButton
                  url={shareUrl}
                  quote={`${shareTitle}\n\n${shareMessage}`}
                  hashtag="#1001Movies"
                >
                  <FacebookIcon size={40} round />
                </FacebookShareButton>

                <TwitterShareButton
                  url={shareUrl}
                  title={`${shareTitle}\n\n${shareMessage}`}
                  hashtags={hashtags}
                >
                  <TwitterIcon size={40} round />
                </TwitterShareButton>

                <LinkedinShareButton
                  url={shareUrl}
                  title={shareTitle}
                  summary={shareMessage}
                  source="1001 Movies Generator"
                >
                  <LinkedinIcon size={40} round />
                </LinkedinShareButton>

                <WhatsappShareButton
                  url={shareUrl}
                  title={`${shareTitle}\n\n${shareMessage}`}
                >
                  <WhatsappIcon size={40} round />
                </WhatsappShareButton>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleCopyLink}
                disabled={!shareUrl}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    {t('share.copied')}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    {t('share.copyLink')}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4 bg-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-blue-700 text-sm font-medium">{t('share.progress')}</span>
          <span className="text-blue-700 font-bold">{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-sm text-blue-700 mt-2">
          {t('share.watchedCount', { count: watchedCount, remaining: remainingCount })}
        </p>
      </div>
    </Card>
  );
}
