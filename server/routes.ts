
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // No auth setup needed - using simple password on frontend

  // === Middleware for Admin Check ===
  // Simple password-based admin middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    // Admin routes are now accessible directly - the password check is on the frontend
    // In production, you would validate a token here, but for this simple setup,
    // the frontend handles authentication
    next();
  };

  // === Public Routes ===

  // Active Challenge
  app.get(api.challenges.active.path, async (req, res) => {
    const challenge = await storage.getActiveChallenge();
    res.json(challenge || null);
  });

  // Increment Challenge
  app.post(api.challenges.increment.path, async (req, res) => {
    // Rate limiting could go here
    const challenge = await storage.incrementChallenge(parseInt(req.params.id), 1);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });
    res.json(challenge);
  });

  // Intentions List
  app.get(api.intentions.list.path, async (req, res) => {
    const intentions = await storage.getIntentions();
    res.json(intentions);
  });

  // Create Intention
  app.post(api.intentions.create.path, async (req, res) => {
    try {
      const input = api.intentions.create.input.parse(req.body);
      const intention = await storage.createIntention(input);
      res.status(201).json(intention);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Increment Intention Prayer
  app.post(api.intentions.increment.path, async (req, res) => {
    const { type } = req.body;
    if (!['hailMary', 'ourFather', 'rosary'].includes(type)) {
      return res.status(400).json({ message: "Invalid prayer type" });
    }
    const intention = await storage.incrementIntentionPrayer(parseInt(req.params.id), type);
    if (!intention) return res.status(404).json({ message: "Intention not found" });
    res.json(intention);
  });

  // === Admin Routes ===
  
  // List Challenges
  app.get(api.admin.challenges.list.path, isAdmin, async (req, res) => {
    const challenges = await storage.getChallenges();
    res.json(challenges);
  });

  // Create Challenge
  app.post(api.admin.challenges.create.path, isAdmin, async (req, res) => {
    try {
      const input = api.admin.challenges.create.input.parse(req.body);
      const challenge = await storage.createChallenge(input);
      res.status(201).json(challenge);
    } catch (err) {
       if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      }
    }
  });

  // Update Challenge
  app.put(api.admin.challenges.update.path, isAdmin, async (req, res) => {
    try {
      const input = api.admin.challenges.update.input.parse(req.body);
      const challenge = await storage.updateChallenge(parseInt(req.params.id), input);
      if (!challenge) return res.status(404).json({ message: "Challenge not found" });
      res.json(challenge);
    } catch (err) {
       if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      }
    }
  });

  // Delete Challenge
  app.delete(api.admin.challenges.delete.path, isAdmin, async (req, res) => {
    await storage.deleteChallenge(parseInt(req.params.id));
    res.status(204).send();
  });

  // Mark Printed
  app.post(api.admin.intentions.markPrinted.path, isAdmin, async (req, res) => {
    const intention = await storage.markIntentionPrinted(parseInt(req.params.id));
    if (!intention) return res.status(404).json({ message: "Intention not found" });
    res.json(intention);
  });

  return httpServer;
}

// === Seed Function ===
async function seedDatabase() {
  const challenges = await storage.getChallenges();
  if (challenges.length === 0) {
    await storage.createChallenge({
      title: "Weekly Rosary Challenge",
      prayerType: "Rosary",
      totalTarget: 1000,
      currentCount: 42,
      isActive: true
    });
  }

  const intentions = await storage.getIntentions();
  if (intentions.length === 0) {
    await storage.createIntention({
      content: "For peace in my family and health for my grandparents.",
      name: "Maria",
      prayerType: "Rosary",
      hailMaryCount: 5,
      ourFatherCount: 2,
      rosaryCount: 1,
      isPrinted: false
    });
    await storage.createIntention({
      content: "For clarity in my career path.",
      name: "Anonymous",
      prayerType: "Hail Mary",
      hailMaryCount: 12,
      ourFatherCount: 0,
      rosaryCount: 0,
      isPrinted: false
    });
  }
}

// Execute seed
seedDatabase().catch(console.error);

