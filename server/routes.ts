import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { setupAuth } from "./auth";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

if (!TMDB_API_KEY) {
  throw new Error("TMDB_API_KEY environment variable is required");
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // User preferences route
  app.patch("/api/user/preferences", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = (req.user as any).id;
    const preferences = req.body;

    try {
      const user = await storage.updateUserPreferences(userId, preferences);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Failed to update preferences" });
    }
  });

  // Partner management routes
  app.post("/api/partner/request", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { receiverUsername } = req.body;
    const senderId = (req.user as any).id;

    try {
      // Check if receiver exists
      const receiver = await storage.getUserByUsername(receiverUsername);
      if (!receiver) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if sender is trying to partner with themselves
      if (receiver.id === senderId) {
        return res.status(400).json({ error: "Cannot partner with yourself" });
      }

      // Create partner request
      const request = await storage.createPartnerRequest({
        senderId,
        receiverUsername,
        status: 'pending',
      });

      res.json(request);
    } catch (error) {
      res.status(400).json({ error: "Failed to send partner request" });
    }
  });

  app.get("/api/partner/requests", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = (req.user as any).id;
    const requests = await storage.getPartnerRequests(userId);
    res.json(requests);
  });

  app.post("/api/partner/request/:id/respond", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { status } = req.body;
    const requestId = parseInt(req.params.id);
    const userId = (req.user as any).id;

    try {
      const request = await storage.updatePartnerRequest(requestId, status);

      if (status === 'accepted') {
        const sender = await storage.getUser(request.senderId);
        const receiver = await storage.getUserByUsername(request.receiverUsername);

        if (sender && receiver) {
          // Update both users with their partner IDs
          await storage.updateUserPartner(sender.id, receiver.id);
          await storage.updateUserPartner(receiver.id, sender.id);
        }
      }

      res.json(request);
    } catch (error) {
      res.status(400).json({ error: "Failed to respond to partner request" });
    }
  });

  // Movie routes
  app.get("/api/movies/discover", async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const user = req.isAuthenticated() ? req.user as any : null;

      // Build query parameters based on user preferences
      const params: any = {
        api_key: TMDB_API_KEY,
        language: "en-US",
        sort_by: "popularity.desc",
        include_adult: false,
        page,
        with_original_language: "en",
        "vote_count.gte": 100,
      };

      // Add genre filtering if user has preferences
      if (user?.preferences?.genres?.length) {
        const genreIds = await getGenreIds(user.preferences.genres);
        params.with_genres = genreIds.join('|');
      }

      const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, { params });

      if (!response.data.results?.length) {
        return res.status(404).json({ error: "No movies found" });
      }

      res.json(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
      res.status(500).json({ error: "Failed to fetch movies" });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: "en-US",
        },
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      res.status(500).json({ error: "Failed to fetch movie details" });
    }
  });

  app.post("/api/movies/swipe", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { tmdbId, liked } = req.body;
    const userId = (req.user as any).id;
    const user = await storage.getUser(userId);

    try {
      // Save the swipe
      const movie = await storage.addMovieSwipe({ userId, tmdbId, liked });

      // If the user liked the movie and has a partner, check for matches
      if (liked && user?.partnerId) {
        const matchingMovies = await storage.getMatchingMovies(userId, user.partnerId);

        // If this movie is in the matching movies, create a match
        if (matchingMovies.includes(tmdbId)) {
          // Get movie details for the notification
          const movieDetails = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
            params: {
              api_key: TMDB_API_KEY,
              language: "en-US",
            },
          });

          const match = await storage.createMatch({
            tmdbId,
            user1Id: userId,
            user2Id: user.partnerId,
          });

          return res.json({
            ...movie,
            match: true,
            movieTitle: movieDetails.data.title,
          });
        }
      }

      res.json({ ...movie, match: false });
    } catch (error) {
      res.status(400).json({ error: "Invalid swipe data" });
    }
  });

  app.get("/api/matches", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = (req.user as any).id;
    const matches = await storage.getMatches(userId);
    res.json(matches);
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to get TMDb genre IDs
async function getGenreIds(genreNames: string[]): Promise<number[]> {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
      params: { api_key: TMDB_API_KEY }
    });

    const genreMap = response.data.genres.reduce((acc: any, genre: any) => {
      acc[genre.name.toLowerCase()] = genre.id;
      return acc;
    }, {});

    return genreNames
      .map(name => genreMap[name.toLowerCase()])
      .filter(id => id !== undefined);
  } catch (error) {
    console.error('Error fetching genre IDs:', error);
    return [];
  }
}