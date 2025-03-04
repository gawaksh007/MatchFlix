import { User, InsertUser, Movie, InsertMovie, Match, InsertMatch, PartnerRequest, InsertPartnerRequest } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(id: number, preferences: User['preferences']): Promise<User>;
  updateUserPartner(userId: number, partnerId: number | null): Promise<User>;

  addMovieSwipe(movie: InsertMovie): Promise<Movie>;
  getMatchingMovies(user1Id: number, user2Id: number): Promise<number[]>;

  createMatch(match: InsertMatch): Promise<Match>;
  getMatches(userId: number): Promise<Match[]>;

  // Partner request methods
  createPartnerRequest(request: InsertPartnerRequest): Promise<PartnerRequest>;
  getPartnerRequests(userId: number): Promise<PartnerRequest[]>;
  updatePartnerRequest(id: number, status: 'accepted' | 'rejected'): Promise<PartnerRequest>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private movies: Map<number, Movie>;
  private matches: Map<number, Match>;
  private partnerRequests: Map<number, PartnerRequest>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.matches = new Map();
    this.partnerRequests = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, partnerId: null };
    this.users.set(id, user);
    return user;
  }

  async updateUserPreferences(id: number, preferences: User['preferences']): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, preferences };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserPartner(userId: number, partnerId: number | null): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, partnerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async addMovieSwipe(movie: InsertMovie): Promise<Movie> {
    const id = this.currentId++;
    const newMovie: Movie = { ...movie, id };
    this.movies.set(id, newMovie);
    return newMovie;
  }

  async getMatchingMovies(user1Id: number, user2Id: number): Promise<number[]> {
    const allMovies = Array.from(this.movies.values());
    const user1Likes = allMovies
      .filter(m => m.userId === user1Id && m.liked)
      .map(m => m.tmdbId);
    const user2Likes = allMovies
      .filter(m => m.userId === user2Id && m.liked)
      .map(m => m.tmdbId);

    return user1Likes.filter(id => user2Likes.includes(id));
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const id = this.currentId++;
    const newMatch: Match = { ...match, id };
    this.matches.set(id, newMatch);
    return newMatch;
  }

  async getMatches(userId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      m => m.user1Id === userId || m.user2Id === userId
    );
  }

  async createPartnerRequest(request: InsertPartnerRequest): Promise<PartnerRequest> {
    const id = this.currentId++;
    const newRequest: PartnerRequest = { ...request, id };
    this.partnerRequests.set(id, newRequest);
    return newRequest;
  }

  async getPartnerRequests(userId: number): Promise<PartnerRequest[]> {
    return Array.from(this.partnerRequests.values()).filter(
      req => req.senderId === userId || req.receiverUsername === (this.users.get(userId)?.username)
    );
  }

  async updatePartnerRequest(id: number, status: 'accepted' | 'rejected'): Promise<PartnerRequest> {
    const request = this.partnerRequests.get(id);
    if (!request) throw new Error("Partner request not found");

    const updatedRequest = { ...request, status };
    this.partnerRequests.set(id, updatedRequest);
    return updatedRequest;
  }
}

export const storage = new MemStorage();