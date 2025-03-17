"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { recordMovieWatch } from "@/lib/streak"; // Add this import at the top

// Define user type
export interface User {
  id: string;
  name: string;
  email?: string;
  joinedDate: string;
  watchedMovies: string[];
  watchlist: string[]; // New watchlist field
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (name: string, email?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  markMovieAsWatched: (movieId: string) => void;
  removeMovieFromWatched: (movieId: string) => void;
  isMovieWatched: (movieId: string) => boolean;

  // New watchlist methods
  addToWatchlist: (movieId: string) => void;
  removeFromWatchlist: (movieId: string) => void;
  isInWatchlist: (movieId: string) => boolean;

  isAuthenticated: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
  markMovieAsWatched: () => {},
  removeMovieFromWatched: () => {},
  isMovieWatched: () => false,

  // Watchlist methods
  addToWatchlist: () => {},
  removeFromWatchlist: () => {},
  isInWatchlist: () => false,

  isAuthenticated: false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for user in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("movieUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function - in a real app, this would connect to a backend
  const login = async (name: string, email?: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create a new user
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      joinedDate: new Date().toISOString(),
      watchedMovies: [],
      watchlist: [] // Initialize empty watchlist
    };

    // Save to localStorage
    localStorage.setItem("movieUser", JSON.stringify(newUser));
    setUser(newUser);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("movieUser");
    setUser(null);
  };

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...userData
    };

    localStorage.setItem("movieUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Mark movie as watched
  const markMovieAsWatched = (movieId: string) => {
    if (!user) return;

    // Skip if already in watched list
    if (user.watchedMovies.includes(movieId)) return;

    const updatedUser = {
      ...user,
      watchedMovies: [...user.watchedMovies, movieId]
    };

    localStorage.setItem("movieUser", JSON.stringify(updatedUser));
    setUser(updatedUser);

    // Record the watch for streak tracking
    recordMovieWatch(updatedUser.id, movieId);
  };

  // Remove movie from watched list
  const removeMovieFromWatched = (movieId: string) => {
    if (!user) return;

    const updatedWatchedMovies = user.watchedMovies.filter(id => id !== movieId);
    const updatedUser = {
      ...user,
      watchedMovies: updatedWatchedMovies
    };

    localStorage.setItem("movieUser", JSON.stringify(updatedUser));
    setUser(updatedUser);

    // Also remove any ratings
    const ratingKey = `movie_rating_${movieId}`;
    localStorage.removeItem(ratingKey);
  };

  // Check if a movie is in the watched list
  const isMovieWatched = (movieId: string): boolean => {
    if (!user) return false;
    return user.watchedMovies.includes(movieId);
  };

  // Add to watchlist function
  const addToWatchlist = (movieId: string) => {
    if (!user) return;

    // Skip if already in watchlist
    if (user.watchlist?.includes(movieId)) return;

    const watchlist = [...(user.watchlist || []), movieId];
    const updatedUser = {
      ...user,
      watchlist
    };

    localStorage.setItem("movieUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Remove from watchlist function
  const removeFromWatchlist = (movieId: string) => {
    if (!user) return;

    if (!user.watchlist) return;

    const watchlist = user.watchlist.filter(id => id !== movieId);
    const updatedUser = {
      ...user,
      watchlist
    };

    localStorage.setItem("movieUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Check if movie is in watchlist
  const isInWatchlist = (movieId: string): boolean => {
    if (!user || !user.watchlist) return false;
    return user.watchlist.includes(movieId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateUser,
        markMovieAsWatched,
        removeMovieFromWatched,
        isMovieWatched,

        // Watchlist methods
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,

        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
