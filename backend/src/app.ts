import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import notesRouter from "./routes/notes";
import { auth } from "./auth";

dotenv.config();

// Debug environment variables
console.log("Environment check:");
console.log("BETTER_AUTH_SECRET:", process.env.BETTER_AUTH_SECRET ? "SET" : "NOT SET");
console.log("BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL);
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");

const app = express();

// Define allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:8080",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "https://main.d2rs71o2mqiojg.amplifyapp.com",
  "https://*.amplifyapp.com",
];

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        // Handle wildcard patterns
        const baseDomain = allowedOrigin.replace('*.', '');
        return origin.endsWith(baseDomain);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Referer',
    'User-Agent',
    'Accept-Language',
    'Content-Language'
  ]
};

// Apply CORS globally
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Test database connection before mounting Better Auth
app.get("/api/test-db", async (_req, res) => {
  try {
    const { getPool } = await import("./db/pool");
    const pool = getPool();
    const result = await pool.query("SELECT 1 as test");
    res.json({ 
      status: "Database connection successful", 
      result: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database test failed:", error);
    res.status(500).json({ 
      status: "Database connection failed", 
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

// Better Auth middleware with explicit CORS and error handling
app.use("/api/auth", cors(corsOptions), async (req, res, next) => {
  try {
    console.log("Better Auth request:", req.method, req.path);
    const response = await auth.handler(req);
    
    // Handle the response from Better Auth
    if (response) {
      // Copy headers from Better Auth response
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      
      // Set status and send response
      res.status(response.status).send(response.body);
    } else {
      next();
    }
  } catch (error) {
    console.error("Better Auth handler error:", error);
    res.status(500).json({ error: "Better Auth handler failed" });
  }
});

// Session helper routes
app.use("/api/session", authRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Test CORS endpoint
app.get("/api/test-cors", (_req, res) => {
  res.json({ 
    status: "CORS test successful",
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins
  });
});

// Custom routes for user management and notes
app.use("/api/users", usersRouter);
app.use("/api/notes", notesRouter);

export { app };
