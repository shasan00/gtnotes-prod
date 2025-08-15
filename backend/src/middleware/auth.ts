import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getPool } from "../db/pool";

export interface AuthRequest extends Request {
  user?: any;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "Missing token" });
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "Server misconfigured" });
  try {
    const payload = jwt.verify(token, secret) as { sub: string };
    const result = await getPool().query("SELECT * FROM users WHERE id = $1", [payload.sub]);
    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = result.rows[0];
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Middleware for checking if user is authenticated (using both session and JWT)
export function isAuthenticated(req: AuthRequest, res: Response, next: NextFunction) {
  // Check if user is authenticated via session (from Passport)
  if (req.user) {
    return next();
  }

  // Check if user is authenticated via JWT token
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  try {
    const payload = jwt.verify(token, secret) as { sub: string; role?: string };

    req.user = { id: payload.sub, role: payload.role };
    next();
    
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Middleware for checking if user is admin
export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
}


