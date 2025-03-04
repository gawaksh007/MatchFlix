import axios from "axios";

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
}

export const tmdb = {
  getImageUrl: (path: string | null, size: "w500" | "original" = "w500") => {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
  },

  getMovies: async (page: number = 1): Promise<Movie[]> => {
    try {
      const response = await axios.get(`/api/movies/discover?page=${page}`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching movies:', error);
      return [];
    }
  },

  getMovieDetails: async (id: number): Promise<Movie | null> => {
    try {
      const response = await axios.get(`/api/movies/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  }
};