"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import MobileNav from "./mobile-nav";
import { useLanguage } from "./language-provider";
import LanguageSwitcher from "./language-switcher";
import { ThemeToggleButton } from "./theme-toggle";
// Import the streak display component
import StreakDisplay from "./streak-display";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Navigation routes based on authentication state
  const routes = isAuthenticated
    ? [
        { path: "/", label: t('nav.home') },
        { path: "/movie", label: t('nav.todaysMovie') },
        { path: "/movies", label: t('nav.moviesLibrary') },
        { path: "/watchlist", label: t('nav.watchlist') },
        { path: "/stats", label: t('nav.statistics') },
        { path: "/profile", label: t('nav.profile') },
        { path: "/settings", label: t('nav.settings') }
      ]
    : [
        { path: "/", label: t('nav.home') },
        { path: "/login", label: t('nav.login') }
      ];

  return (
    <nav className="bg-white border-b border-zinc-200 py-4 sticky top-0 z-10 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
      <div className="container mx-auto px-4 max-w-6xl flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-zinc-900 hover:text-blue-600 transition-colors dark:text-white dark:hover:text-blue-400"
        >
          <span className="hidden sm:inline">1001 Movies Generator</span>
          <span className="sm:hidden">1001 Movies</span>
        </Link>

        <div className="flex items-center space-x-3">
          {/* Theme toggle */}
          <ThemeToggleButton />

          {/* Language selector */}
          <LanguageSwitcher />

          {/* Mobile menu */}
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={`
                text-sm font-medium hover:text-blue-600 transition-colors dark:hover:text-blue-400
                ${pathname === route.path
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-zinc-700 dark:text-zinc-300'}
              `}
            >
              {route.label}
            </Link>
          ))}

          {isAuthenticated && (
            <>
              <div className="hidden md:block">
                <StreakDisplay variant="compact" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="ml-2"
              >
                {t('nav.logout')}
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
