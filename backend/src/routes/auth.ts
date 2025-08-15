import { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";

const router = Router();

function createJwt(userId: string, role: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.sign({ sub: userId, role }, secret, { expiresIn: "7d" });
}

// Deprecated traditional auth endpoints intentionally removed

router.get("/google/signup", (req, res) => {
  // Begin Google OAuth signup flow
  return passport.authenticate("google", { scope: ["profile", "email"], state: "signup" })(req, res);
});

router.get("/google/login", (req, res) => {
  // Begin Google OAuth login flow
  return passport.authenticate("google", { scope: ["profile", "email"], state: "login" })(req, res);
});

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/api/auth/google/failure" }),
  async (req: any, res) => {
    // At this point req.user is the user record
    const user = req.user;
    const token = createJwt(user.id, user.role);
    // Redirect back to frontend with token so the SPA can store it
    const redirectUrl = process.env.GOOGLE_SUCCESS_REDIRECT || "http://localhost:8080/sign-in?token=" + encodeURIComponent(token);
    if (redirectUrl.includes("?")) {
      res.redirect(redirectUrl + (redirectUrl.endsWith("?") ? "" : "&") + "token=" + encodeURIComponent(token));
    } else {
      res.redirect(redirectUrl + "?token=" + encodeURIComponent(token));
    }
  }
);

router.get("/google/failure", (_req, res) => {
  res.status(401).json({ error: "Google authentication failed" });
});

// Microsoft OAuth endpoints
router.get("/microsoft/signup", (req, res) => {
  return passport.authenticate("microsoft", { scope: ["openid", "profile", "email", "User.Read"], state: "signup" })(req, res);
});

router.get("/microsoft/login", (req, res) => {
  return passport.authenticate("microsoft", { scope: ["openid", "profile", "email", "User.Read"], state: "login" })(req, res);
});

router.get(
  "/microsoft/callback",
  passport.authenticate("microsoft", { session: false, failureRedirect: "/api/auth/microsoft/failure" }),
  async (req: any, res) => {
    const user = req.user;
    const token = createJwt(user.id, user.role);
    const redirectUrl = process.env.MICROSOFT_SUCCESS_REDIRECT || "http://localhost:8080/sign-in?token=" + encodeURIComponent(token);
    if (redirectUrl.includes("?")) {
      res.redirect(redirectUrl + (redirectUrl.endsWith("?") ? "" : "&") + "token=" + encodeURIComponent(token));
    } else {
      res.redirect(redirectUrl + "?token=" + encodeURIComponent(token));
    }
  }
);

router.get("/microsoft/failure", (_req, res) => {
  res.status(401).json({ error: "Microsoft authentication failed" });
});

export default router;


