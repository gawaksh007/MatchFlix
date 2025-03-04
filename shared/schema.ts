import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  partnerId: integer("partner_id"),
  preferences: jsonb("preferences").$type<{
    genres: string[];
    platforms: string[];
    favoriteActors: string[];
  }>(),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  tmdbId: integer("tmdb_id").notNull(),
  userId: integer("user_id").notNull(),
  liked: boolean("liked").notNull(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  tmdbId: integer("tmdb_id").notNull(),
  user1Id: integer("user1_id").notNull(),
  user2Id: integer("user2_id").notNull(),
});

// Partner connection requests
export const partnerRequests = pgTable("partner_requests", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverUsername: text("receiver_username").notNull(),
  status: text("status").notNull(), // 'pending' | 'accepted' | 'rejected'
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  preferences: true,
});

export const insertMovieSchema = createInsertSchema(movies);
export const insertMatchSchema = createInsertSchema(matches);
export const insertPartnerRequestSchema = createInsertSchema(partnerRequests);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type InsertPartnerRequest = z.infer<typeof insertPartnerRequestSchema>;
export type User = typeof users.$inferSelect;
export type Movie = typeof movies.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type PartnerRequest = typeof partnerRequests.$inferSelect;