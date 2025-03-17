"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LoginForm from "@/components/login-form";
import AchievementsDisplay from "@/components/achievements-display";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-full md:w-1/2 flex justify-center">
                <Image
                  src="/images/movie-cover.jpg"
                  alt="Movie App Banner"
                  width={400}
                  height={300}
                  className="rounded-lg shadow-lg object-cover"
                />
              </div>
              <div className="w-full md:w-1/2">
                <h1 className="text-3xl font-bold mb-4">
                  1001 Movies You Must See Before You Die
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  Track your progress, find new films to watch, and share your journey
                  through cinema history.
                </p>
                {isAuthenticated ? (
                  <Button asChild>
                    <Link href="/movie">Get Today's Movie</Link>
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Sign in to start tracking your progress.
                    </p>
                    <LoginForm />
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-2">Track Your Progress</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Mark movies as watched and see how far you've come.
              </p>
              <Button variant="outline" asChild>
                <Link href="/profile">View Profile</Link>
              </Button>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-2">Discover Movies</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Browse through the complete collection of must-see films.
              </p>
              <Button variant="outline" asChild>
                <Link href="/movies">Browse Library</Link>
              </Button>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {isClient && isAuthenticated && (
              <>
                <Card className="overflow-hidden">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-4">
                    <h3 className="font-semibold">Welcome back, {user?.name || 'User'}</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                      Continue your movie journey where you left off.
                    </p>
                    <Button size="sm" asChild className="w-full">
                      <Link href="/profile">Go to Profile</Link>
                    </Button>
                  </div>
                </Card>

                {/* Add Achievements Display */}
                <AchievementsDisplay compact />
              </>
            )}

            <Card className="p-4">
              <h3 className="font-semibold mb-2">About the Challenge</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Based on the book "1001 Movies You Must See Before You Die", this app helps
                you track your progress through this iconic list of films.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
