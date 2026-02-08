
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  replitId: text("replit_id").unique(), // From Replit Auth
  username: text("username"),
  email: text("email"),
  role: text("role").default("user"), // 'admin' or 'user'
  createdAt: timestamp("created_at").defaultNow(),
});

export const intentions = pgTable("intentions", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  name: text("name"), // Optional name or "Anonymous"
  prayerType: text("prayer_type"), // Optional dropdown value
  hailMaryCount: integer("hail_mary_count").default(0),
  ourFatherCount: integer("our_father_count").default(0),
  rosaryCount: integer("rosary_count").default(0),
  isPrinted: boolean("is_printed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  prayerType: text("prayer_type").notNull(),
  totalTarget: integer("total_target").notNull(),
  currentCount: integer("current_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertIntentionSchema = createInsertSchema(intentions).omit({ 
  id: true, 
  createdAt: true,
  hailMaryCount: true,
  ourFatherCount: true,
  rosaryCount: true,
  isPrinted: true
});
export const insertChallengeSchema = createInsertSchema(challenges).omit({ 
  id: true, 
  createdAt: true,
  currentCount: true 
});

// === TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Intention = typeof intentions.$inferSelect;
export type InsertIntention = z.infer<typeof insertIntentionSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

// API Request/Response Types
export type CreateIntentionRequest = InsertIntention;
export type CreateChallengeRequest = InsertChallenge;

export type IncrementChallengeRequest = { amount: number };
export type IncrementIntentionPrayerRequest = { type: 'hailMary' | 'ourFather' | 'rosary' };

export type IntentionResponse = Intention;
export type ChallengeResponse = Challenge;
