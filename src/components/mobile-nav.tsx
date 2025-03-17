"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "./language-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

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
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        className="p-2 rounded-md text-zinc-600 hover:bg-zinc-100"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isOpen ? (
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M4 6H20M4 12H20M4 18H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold">Menu</h2>
            <button
              className="p-2 rounded-md text-zinc-600 hover:bg-zinc-100"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="p-4">
            <nav className="flex flex-col space-y-6">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`text-lg font-medium ${
                    pathname === route.path ? "text-blue-600" : "text-zinc-800"
                  }`}
                >
                  {route.label}
                </Link>
              ))}

              {isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full mt-4"
                >
                  {t('nav.logout')}
                </Button>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
