export interface Movie {
  id: string;
  title: string;
  year: string;
  director: string;
  country: string;
  genre: string[];
  posterUrl: string;
  synopsis: string;
  imdbId?: string;

  // Extended details
  runtime?: string;
  awards?: string[];
  cast?: string[];
  rating?: string;
  language?: string;
  releaseDate?: string;
  cinematography?: string;
  musicBy?: string;
}

export interface MovieWithUserData extends Movie {
  isWatched: boolean;
  userRating?: number;
}
