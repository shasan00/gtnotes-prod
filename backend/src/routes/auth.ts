import { Router } from "express";
import jwt from "jsonwebtoken";
import { auth } from "../auth";

const router = Router();

function createJwt(userId: string, role: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.sign({ sub: userId, role }, secret, { expiresIn: "7d" });
}

// Better Auth handles the OAuth flow, so we just need to handle the callback
// and create our JWT token for the frontend

// Google OAuth callback - Better Auth will handle the OAuth flow
router.get("/google/callback", async (req, res) => {
  try {
    // Better Auth will have processed the OAuth callback
    // We need to get the user from the session or token
    const user = req.user || req.session?.user;
    
    if (!user) {
      return res.redirect("/api/auth/google/failure");
    }

    const token = createJwt(user.id, user.role);
    const redirectUrl = process.env.GOOGLE_SUCCESS_REDIRECT || "http://localhost:8080/sign-in?token=" + encodeURIComponent(token);
    
    if (redirectUrl.includes("?")) {
      res.redirect(redirectUrl + (redirectUrl.endsWith("?") ? "" : "&") + "token=" + encodeURIComponent(token));
    } else {
      res.redirect(redirectUrl + "?token=" + encodeURIComponent(token));
    }
  } catch (error) {
    console.error("Google callback error:", error);
    res.redirect("/api/auth/google/failure");
  }
});

router.get("/google/failure", (_req, res) => {
  res.status(401).json({ error: "Google authentication failed" });
});

// Microsoft OAuth callback - Better Auth will handle the OAuth flow
router.get("/microsoft/callback", async (req, res) => {
  try {
    // Better Auth will have processed the OAuth callback
    // We need to get the user from the session or token
    const user = req.user || req.session?.user;
    
    if (!user) {
      return res.redirect("/api/auth/microsoft/failure");
    }

    const token = createJwt(user.id, user.role);
    const redirectUrl = process.env.MICROSOFT_SUCCESS_REDIRECT || "http://localhost:8080/sign-in?token=" + encodeURIComponent(token);
    
    if (redirectUrl.includes("?")) {
      res.redirect(redirectUrl + (redirectUrl.endsWith("?") ? "" : "&") + "token=" + encodeURIComponent(token));
    } else {
      res.redirect(redirectUrl + "?token=" + encodeURIComponent(token));
    }
  } catch (error) {
    console.error("Microsoft callback error:", error);
    res.redirect("/api/auth/microsoft/failure");
  }
});

router.get("/microsoft/failure", (_req, res) => {
  res.status(401).json({ error: "Microsoft authentication failed" });
});

export default router;


