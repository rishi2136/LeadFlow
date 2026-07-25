import { Router, Request, Response } from "express";
import {UserModel as User, IUser }from "../models/User";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent";
}

declare module "express-session" {
  interface SessionData {
    user?: UserSession;
  }
}

// Default seed memory accounts
const seedUsers = [
  {
    id: "user_1",
    name: "Alexander Wright",
    email: "admin@leadflow.io",
    password: "password123",
    role: "admin" as const,
  },
  {
    id: "user_2",
    name: "Sarah LeadManager",
    email: "sarah@leadflow.io",
    password: "password123",
    role: "agent" as const,
  },
];

const router = Router();

// Get current session user
router.get("/me", (req: Request, res: Response) => {
  if (req.session && req.session.user) {
    return res.json({
      authenticated: true,
      user: req.session.user,
      sessionId: req.sessionID,
    });
  }
  return res.json({
    authenticated: false,
    user: null,
  });
});

// Login endpoint
router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = seedUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    // Demo fallback for test credentials
    if (password === "password123" || password === "admin123") {
      const demoUser: UserSession = {
        id: `user_demo_${Date.now()}`,
        name: email.split("@")[0].toUpperCase() || "Admin User",
        email,
        role: "admin",
      };
      req.session.user = demoUser;
      return res.json({
        authenticated: true,
        user: demoUser,
        message: "Login successful (Demo Mode)",
      });
    }
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const sessionUser: UserSession = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  req.session.user = sessionUser;
  return res.json({
    authenticated: true,
    user: sessionUser,
    message: "Authentication successful.",
  });
});



// Register endpoint
router.post("/register", (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  const existingUser = User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ data: {name: existingUser.name, email: existingUser.email } });
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name,
    email,
    password,
    role: "admin" as const,
  };
  seedUsers.push(newUser);

  const sessionUser: UserSession = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };

  req.session.user = sessionUser;
  return res.status(201).json({
    authenticated: true,
    user: sessionUser,
    message: "Account registered successfully.",
  });
});

// Logout endpoint
router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed." });
    }
    res.clearCookie("connect.sid");
    return res.json({ authenticated: false, message: "Logged out successfully." });
  });
});

export default router;
