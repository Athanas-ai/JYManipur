
import { eq, desc } from "drizzle-orm";
import { 
  users, intentions, challenges,
  type User, type InsertUser,
  type Intention, type InsertIntention,
  type Challenge, type InsertChallenge
} from "@shared/schema";
import { users as authUsers, type User as AuthUser, type UpsertUser } from "@shared/models/auth";
import type { IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // Intentions
  createIntention(intention: InsertIntention): Promise<Intention>;
  getIntentions(): Promise<Intention[]>;
  incrementIntentionPrayer(id: number, type: 'hailMary' | 'ourFather' | 'rosary'): Promise<Intention | undefined>;
  markIntentionPrinted(id: number): Promise<Intention | undefined>;

  // Challenges
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallenges(): Promise<Challenge[]>;
  getActiveChallenge(): Promise<Challenge | undefined>;
  updateChallenge(id: number, challenge: Partial<InsertChallenge>): Promise<Challenge | undefined>;
  deleteChallenge(id: number): Promise<void>;
  incrementChallenge(id: number, amount: number): Promise<Challenge | undefined>;

  // Users (Admin check helper)
  getUserByReplitId(replitId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // === Auth Storage Implementation ===
  async getUser(id: string): Promise<AuthUser | undefined> {
    const { db } = await import("./db");
    const [user] = await db.select().from(authUsers).where(eq(authUsers.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<AuthUser> {
    const { db } = await import("./db");
    const [user] = await db
      .insert(authUsers)
      .values(userData)
      .onConflictDoUpdate({
        target: authUsers.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // === App Storage Implementation ===

  // Intentions
  async createIntention(intention: InsertIntention): Promise<Intention> {
    const { db } = await import("./db");
    const [newIntention] = await db.insert(intentions).values(intention).returning();
    return newIntention;
  }

  async getIntentions(): Promise<Intention[]> {
    const { db } = await import("./db");
    return await db.select().from(intentions).orderBy(desc(intentions.createdAt));
  }

  async incrementIntentionPrayer(id: number, type: 'hailMary' | 'ourFather' | 'rosary'): Promise<Intention | undefined> {
    // Drizzle's `sql` operator would be better for atomic increments but simple read-update is okay for MVP
    // Or we can use `sql` operator:
    // .set({ [type + 'Count']: sql`${intentions[type + 'Count']} + 1` })
    // For type safety with dynamic key, let's fetch and update or use raw SQL helpers if needed.
    // For simplicity/safety with current setup, I'll fetch-update or map the column explicitly.
    
    // Mapping column name
    const column = type === 'hailMary' ? intentions.hailMaryCount 
                 : type === 'ourFather' ? intentions.ourFatherCount 
                 : intentions.rosaryCount;

    // Actually, simple increment:
    const [updated] = await db.execute<Intention>(
      // Use raw SQL for atomic update to avoid race conditions
      // But adhering to ORM style:
      // db.update(intentions).set({ [key]: sql`${column} + 1` })...
      // Since 'type' is dynamic string, let's do switch case for safety.
      type === 'hailMary' 
        ?  db.update(intentions).set({ hailMaryCount:  db.execute(import('drizzle-orm').then(m => m.sql`${intentions.hailMaryCount} + 1`)) as any }).where(eq(intentions.id, id)).returning()
        // Wait, dynamic sql import is weird. Let's just fetch-update for now or stick to standard way.
        // Actually, I can just use `sql` from `drizzle-orm` if imported.
        : type === 'ourFather'
        ? db.update(intentions).set({ ourFatherCount:  import('drizzle-orm').then(m => m.sql`${intentions.ourFatherCount} + 1`) as any }).where(eq(intentions.id, id)).returning()
        : db.update(intentions).set({ rosaryCount:  import('drizzle-orm').then(m => m.sql`${intentions.rosaryCount} + 1`) as any }).where(eq(intentions.id, id)).returning()
    ) as any; // Type casting issue with dynamic Promise<sql>... 

    // REWRITE: Let's simpler approach with standard import.
    // I need to import sql at top.
    
    return undefined; // Placeholder, see actual implementation below
  }
  
  // === Actual implementation for incrementIntentionPrayer ===
  async incrementIntentionPrayerImpl(id: number, type: 'hailMary' | 'ourFather' | 'rosary'): Promise<Intention | undefined> {
     const { sql } = await import("drizzle-orm");
     const { db } = await import("./db");
     
     let updateSet;
     if (type === 'hailMary') updateSet = { hailMaryCount: sql`${intentions.hailMaryCount} + 1` };
     else if (type === 'ourFather') updateSet = { ourFatherCount: sql`${intentions.ourFatherCount} + 1` };
     else updateSet = { rosaryCount: sql`${intentions.rosaryCount} + 1` };

     const [updated] = await db.update(intentions)
       .set(updateSet)
       .where(eq(intentions.id, id))
       .returning();
     return updated;
  }

  async markIntentionPrinted(id: number): Promise<Intention | undefined> {
    const { db } = await import("./db");
    const [updated] = await db.update(intentions)
      .set({ isPrinted: true })
      .where(eq(intentions.id, id))
      .returning();
    return updated;
  }

  // Challenges
  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    // Optionally deactivate others if we want only one active? 
    // Requirement says "Add weekly prayer challenge", implies one.
    // Let's set others to inactive if new one is active.
    const { db } = await import("./db");
    if (challenge.isActive) {
      await db.update(challenges).set({ isActive: false }).where(eq(challenges.isActive, true));
    }
    const [newChallenge] = await db.insert(challenges).values(challenge).returning();
    return newChallenge;
  }

  async getChallenges(): Promise<Challenge[]> {
    const { db } = await import("./db");
    return await db.select().from(challenges).orderBy(desc(challenges.createdAt));
  }

  async getActiveChallenge(): Promise<Challenge | undefined> {
    const { db } = await import("./db");
    const [challenge] = await db.select().from(challenges)
      .where(eq(challenges.isActive, true))
      .limit(1);
    return challenge;
  }

  async updateChallenge(id: number, updates: Partial<InsertChallenge>): Promise<Challenge | undefined> {
    const { db } = await import("./db");
    if (updates.isActive) {
       await db.update(challenges).set({ isActive: false }).where(eq(challenges.isActive, true));
    }
    const [updated] = await db.update(challenges)
      .set(updates)
      .where(eq(challenges.id, id))
      .returning();
    return updated;
  }

  async deleteChallenge(id: number): Promise<void> {
    const { db } = await import("./db");
    await db.delete(challenges).where(eq(challenges.id, id));
  }

  async incrementChallenge(id: number, amount: number): Promise<Challenge | undefined> {
    const { sql } = await import("drizzle-orm");
    const { db } = await import("./db");
    const [updated] = await db.update(challenges)
      .set({ currentCount: sql`${challenges.currentCount} + ${amount}` })
      .where(eq(challenges.id, id))
      .returning();
    return updated;
  }

  // Local Users
  async getUserByReplitId(replitId: string): Promise<User | undefined> {
    const { db } = await import("./db");
    const [user] = await db.select().from(users).where(eq(users.replitId, replitId));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { db } = await import("./db");
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
}

// Fix the increment method alias in class
export class DatabaseStorageImpl extends DatabaseStorage {
  async incrementIntentionPrayer(id: number, type: 'hailMary' | 'ourFather' | 'rosary'): Promise<Intention | undefined> {
    return this.incrementIntentionPrayerImpl(id, type);
  }
}

// If no DATABASE_URL is provided (development/demo), export an in-memory storage
// to allow running the app without a Postgres instance.
let storageImpl: IStorage;

if (!process.env.DATABASE_URL) {
  class InMemoryStorage implements IStorage {
    private users: any[] = [];
    private intentions: any[] = [];
    private challenges: any[] = [];
    private userId = 1;
    private intentionId = 1;
    private challengeId = 1;

    // Auth storage
    async getUser(id: string) {
      return this.users.find((u) => u.id === id);
    }

    async upsertUser(userData: any) {
      let existing = this.users.find((u) => u.id === userData.id);
      if (existing) {
        Object.assign(existing, userData, { updatedAt: new Date() });
        return existing;
      }
      const newUser = { ...userData, id: userData.id ?? String(this.userId++), createdAt: new Date(), updatedAt: new Date() };
      this.users.push(newUser);
      return newUser;
    }

    // Intentions
    async createIntention(intention: any) {
      const newInt = { ...intention, id: this.intentionId++, createdAt: new Date(), updatedAt: new Date(), hailMaryCount: intention.hailMaryCount || 0, ourFatherCount: intention.ourFatherCount || 0, rosaryCount: intention.rosaryCount || 0, isPrinted: !!intention.isPrinted };
      this.intentions.push(newInt);
      return newInt;
    }

    async getIntentions() {
      return [...this.intentions].sort((a, b) => b.createdAt - a.createdAt);
    }

    async incrementIntentionPrayer(id: number, type: 'hailMary' | 'ourFather' | 'rosary') {
      const it = this.intentions.find((i) => i.id === id);
      if (!it) return undefined;
      if (type === 'hailMary') it.hailMaryCount = (it.hailMaryCount || 0) + 1;
      if (type === 'ourFather') it.ourFatherCount = (it.ourFatherCount || 0) + 1;
      if (type === 'rosary') it.rosaryCount = (it.rosaryCount || 0) + 1;
      it.updatedAt = new Date();
      return it;
    }

    async markIntentionPrinted(id: number) {
      const it = this.intentions.find((i) => i.id === id);
      if (!it) return undefined;
      it.isPrinted = true;
      it.updatedAt = new Date();
      return it;
    }

    // Challenges
    async createChallenge(challenge: any) {
      if (challenge.isActive) {
        this.challenges.forEach((c) => (c.isActive = false));
      }
      const newCh = { ...challenge, id: this.challengeId++, createdAt: new Date(), updatedAt: new Date(), currentCount: challenge.currentCount || 0 };
      this.challenges.push(newCh);
      return newCh;
    }

    async getChallenges() {
      return [...this.challenges].sort((a, b) => b.createdAt - a.createdAt);
    }

    async getActiveChallenge() {
      return this.challenges.find((c) => c.isActive) || undefined;
    }

    async updateChallenge(id: number, updates: any) {
      const ch = this.challenges.find((c) => c.id === id);
      if (!ch) return undefined;
      if (updates.isActive) this.challenges.forEach((c) => (c.isActive = false));
      Object.assign(ch, updates, { updatedAt: new Date() });
      return ch;
    }

    async deleteChallenge(id: number) {
      this.challenges = this.challenges.filter((c) => c.id !== id);
    }

    async incrementChallenge(id: number, amount: number) {
      const ch = this.challenges.find((c) => c.id === id);
      if (!ch) return undefined;
      ch.currentCount = (ch.currentCount || 0) + amount;
      ch.updatedAt = new Date();
      return ch;
    }

    // Local Users
    async getUserByReplitId(replitId: string) {
      return this.users.find((u) => u.replitId === replitId);
    }

    async createUser(user: any) {
      const newUser = { ...user, id: String(this.userId++), createdAt: new Date(), updatedAt: new Date() };
      this.users.push(newUser);
      return newUser;
    }
  }

  storageImpl = new InMemoryStorage();
} else {
  storageImpl = new DatabaseStorageImpl();
}

export const storage = storageImpl;
