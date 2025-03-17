"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es';

type LanguageContextType = {
  language: Language;
  changeLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

// English and Spanish translations
const translations = {
  en: {
    'nav.home': 'Home',
    'nav.todaysMovie': "Today's Movie",
    'nav.moviesLibrary': 'Movies Library',
    'nav.watchlist': 'Watchlist',
    'nav.statistics': 'Statistics',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.login': 'Login',
    'nav.logout': 'Logout',

    'movie.addToWatchlist': 'Add to Watchlist',
    'movie.inWatchlist': 'In Watchlist',
    'movie.markAsWatched': 'Mark as Watched',
    'movie.rateThisMovie': 'Rate this movie',
    'movie.youveWatched': "You've watched this movie!",
    'movie.remove': 'Remove',

    'watchlist.title': 'Your Watchlist',
    'watchlist.empty': 'Your watchlist is empty',
    'watchlist.viewDetails': 'View Details',

    // Profile page translations
    'profile.recommendedForYou': 'Recommended for You',
    'profile.viewAll': 'View all',
    'profile.title': '{name}\'s Profile',
    'profile.joinedOn': 'Joined on {date}',
    'profile.editProfileSettings': 'Edit Profile Settings',
    'profile.yourProgress': 'Your Progress',
    'profile.moviesWatched': 'Movies Watched',
    'profile.percentComplete': '{percent}% complete, {remaining} movies remaining',
    'profile.getTodaysMovie': 'Get Today\'s Movie',
    'profile.goToHome': 'Go to Home',
    'profile.yourRecentlyWatchedMovies': 'Your Recently Watched Movies',
    'profile.noMoviesWatched': 'You haven\'t watched any movies yet',
    'profile.getStarted': 'Get Started',

    'common.loading': 'Loading...',

    // Share feature translations
    'share.shareProgress': 'Share Your Progress',
    'share.shareNow': 'Share Now',
    'share.shareYourProgress': 'Share Your Progress',
    'share.shareProgressDescription': 'Let your friends know about your movie watching progress!',
    'share.title': '{name}\'s 1001 Movies Progress',
    'share.message': 'I\'ve watched {count} movies ({percent}%) from the "1001 Movies You Must See Before You Die" list. I have {remaining} movies left to watch!',
    'share.progress': 'Your Progress',
    'share.watchedCount': '{count} movies watched, {remaining} remaining',
    'share.copyLink': 'Copy link',
    'share.copied': 'Copied!',

    // Theme-related translations
    'settings.darkMode': 'Dark Mode',
    'settings.toggleTheme': 'Toggle theme',
    'settings.lightMode': 'Light Mode',
    'settings.systemTheme': 'Use System Theme',

    // Streak-related translations
    'streaks.currentStreak': 'Current Streak',
    'streaks.longestStreak': 'Longest Streak',
    'streaks.days': 'days',
    'streaks.since': 'Since',
    'streaks.watchedToday': 'Great job! You watched a movie today!',
    'streaks.keepTheStreak': 'Watch a movie today to keep your streak going!',
    'streaks.startNewStreak': 'Start a new streak by watching a movie today!',
    'streaks.milestone': 'Milestone Reached!',
    'streaks.streak': 'Streak',

    // Achievement-related translations
    'achievements.yourAchievements': 'Your Achievements',
    'achievements.recentUnlocked': 'Recent Achievements',
    'achievements.complete': 'complete',
    'achievements.unlocked': 'unlocked',
    'achievements.of': 'of',
    'achievements.all': 'All',
    'achievements.milestones': 'Milestones',
    'achievements.collections': 'Collections',
    'achievements.streaks': 'Streaks',
    'achievements.special': 'Special',
    'achievements.level': 'Level',
    'achievements.unlockedOn': 'Unlocked on',
    'achievements.viewRecommendations': 'View Achievement Recommendations',

    // Achievement recommendations translations
    'recommendations.achievementRecommendations': 'Achievement Recommendations',
    'recommendations.moviesThatHelp': 'Movies that will help you unlock achievements',
    'recommendations.noAchievements': 'No Recommendations Available',
    'recommendations.watchMoreMovies': 'Watch more movies to start getting personalized recommendations',
    'recommendations.browseMovies': 'Browse Movies',
    'recommendations.viewDetails': 'View Details',
    'recommendations.unlocks': 'Unlocks',
    'recommendations.personalizedForAchievements': 'Movies recommended based on your achievement progress',
    'recommendations.back': 'Back',
    'recommendations.browseAllMovies': 'Browse All Movies',
    'recommendations.yourProgress': 'Your Achievement Progress',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.todaysMovie': 'Película del Día',
    'nav.moviesLibrary': 'Biblioteca de Películas',
    'nav.watchlist': 'Lista de Seguimiento',
    'nav.statistics': 'Estadísticas',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configuración',
    'nav.login': 'Iniciar Sesión',
    'nav.logout': 'Cerrar Sesión',

    'movie.addToWatchlist': 'Añadir a Lista',
    'movie.inWatchlist': 'En Lista',
    'movie.markAsWatched': 'Marcar como Vista',
    'movie.rateThisMovie': 'Califica esta película',
    'movie.youveWatched': "¡Has visto esta película!",
    'movie.remove': 'Eliminar',

    'watchlist.title': 'Tu Lista de Seguimiento',
    'watchlist.empty': 'Tu lista de seguimiento está vacía',
    'watchlist.viewDetails': 'Ver Detalles',

    // Profile page translations
    'profile.recommendedForYou': 'Recomendado para Ti',
    'profile.viewAll': 'Ver todas',
    'profile.title': 'Perfil de {name}',
    'profile.joinedOn': 'Se unió el {date}',
    'profile.editProfileSettings': 'Editar Configuración de Perfil',
    'profile.yourProgress': 'Tu Progreso',
    'profile.moviesWatched': 'Películas Vistas',
    'profile.percentComplete': '{percent}% completado, {remaining} películas restantes',
    'profile.getTodaysMovie': 'Ver la Película de Hoy',
    'profile.goToHome': 'Ir al Inicio',
    'profile.yourRecentlyWatchedMovies': 'Películas Vistas Recientemente',
    'profile.noMoviesWatched': 'Aún no has visto ninguna película',
    'profile.getStarted': 'Comenzar',

    'common.loading': 'Cargando...',

    // Share feature translations in Spanish
    'share.shareProgress': 'Compartir Tu Progreso',
    'share.shareNow': 'Compartir Ahora',
    'share.shareYourProgress': 'Comparte Tu Progreso',
    'share.shareProgressDescription': '¡Muéstrale a tus amigos tu progreso en la lista de películas!',
    'share.title': 'Progreso de {name} en 1001 Películas',
    'share.message': 'He visto {count} películas ({percent}%) de la lista "1001 Películas que Debes Ver Antes de Morir". ¡Me quedan {remaining} películas por ver!',
    'share.progress': 'Tu Progreso',
    'share.watchedCount': '{count} películas vistas, {remaining} restantes',
    'share.copyLink': 'Copiar enlace',
    'share.copied': '¡Copiado!',

    // Theme-related translations in Spanish
    'settings.darkMode': 'Modo Oscuro',
    'settings.toggleTheme': 'Cambiar tema',
    'settings.lightMode': 'Modo Claro',
    'settings.systemTheme': 'Usar Tema del Sistema',

    // Streak-related translations in Spanish
    'streaks.currentStreak': 'Racha Actual',
    'streaks.longestStreak': 'Racha Más Larga',
    'streaks.days': 'días',
    'streaks.since': 'Desde',
    'streaks.watchedToday': '¡Buen trabajo! ¡Has visto una película hoy!',
    'streaks.keepTheStreak': '¡Ve una película hoy para mantener tu racha!',
    'streaks.startNewStreak': '¡Comienza una nueva racha viendo una película hoy!',
    'streaks.milestone': '¡Has Alcanzado un Hito!',
    'streaks.streak': 'Racha',

    // Achievement-related translations in Spanish
    'achievements.yourAchievements': 'Tus Logros',
    'achievements.recentUnlocked': 'Logros Recientes',
    'achievements.complete': 'completado',
    'achievements.unlocked': 'desbloqueados',
    'achievements.of': 'de',
    'achievements.all': 'Todos',
    'achievements.milestones': 'Hitos',
    'achievements.collections': 'Colecciones',
    'achievements.streaks': 'Rachas',
    'achievements.special': 'Especial',
    'achievements.level': 'Nivel',
    'achievements.unlockedOn': 'Desbloqueado el',
    'achievements.viewRecommendations': 'Ver Recomendaciones por Logros',

    // Achievement recommendations translations in Spanish
    'recommendations.achievementRecommendations': 'Recomendaciones por Logros',
    'recommendations.moviesThatHelp': 'Películas que te ayudarán a desbloquear logros',
    'recommendations.noAchievements': 'No Hay Recomendaciones Disponibles',
    'recommendations.watchMoreMovies': 'Mira más películas para comenzar a recibir recomendaciones personalizadas',
    'recommendations.browseMovies': 'Explorar Películas',
    'recommendations.viewDetails': 'Ver Detalles',
    'recommendations.unlocks': 'Desbloquea',
    'recommendations.personalizedForAchievements': 'Películas recomendadas basadas en tu progreso de logros',
    'recommendations.back': 'Atrás',
    'recommendations.browseAllMovies': 'Ver Todas las Películas',
    'recommendations.yourProgress': 'Tu Progreso de Logros',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  changeLanguage: () => {},
  t: (key) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state with a default value to avoid hydration issues
  const [language, setLanguage] = useState<Language>('en');
  const [isClient, setIsClient] = useState(false);

  // Initialize language after mount
  useEffect(() => {
    setIsClient(true);
    // Get preferred language from localStorage or browser settings
    const getInitialLanguage = (): Language => {
      // Check localStorage first
      const savedLanguage = localStorage.getItem('preferredLanguage');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
        return savedLanguage;
      }

      // Then check browser language
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'es') return 'es';

      return 'en'; // Default to English
    };

    setLanguage(getInitialLanguage());
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    if (isClient) {
      localStorage.setItem('preferredLanguage', newLanguage);
    }
  };

  // Translate function
  const t = (key: string, params?: Record<string, string | number>): string => {
    const translationObj = translations[language] as Record<string, string>;
    const translation = translationObj[key] || key;

    if (params) {
      return Object.entries(params).reduce((str, [key, value]) => {
        return str.replace(new RegExp(`{${key}}`, 'g'), String(value));
      }, translation);
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
