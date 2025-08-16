import { Router } from "express";
import jwt from "jsonwebtoken";
import { auth } from "../auth";

const router = Router();

function createJwt(userId: string, role: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.sign({ sub: userId, role }, secret, { expiresIn: "7d" });
}

// Get current user session
router.get("/me", async (req, res) => {
  try {
    const session = await auth.api.getSession(req);
    
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Create JWT token for frontend
    const token = createJwt(session.user.id, session.user.role);
    
    res.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        role: session.user.role,
      },
      token
    });
  } catch (error) {
    console.error("Get session error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Sign out
router.post("/signout", async (req, res) => {
  try {
    await auth.api.signOut(req, res);
    res.json({ success: true });
  } catch (error) {
    console.error("Sign out error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get OAuth URLs for frontend
router.get("/providers", (_req, res) => {
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  
  res.json({
    google: `${baseUrl}/api/auth/signin/google`,
    microsoft: `${baseUrl}/api/auth/signin/microsoft`,
  });
});

export default router;


