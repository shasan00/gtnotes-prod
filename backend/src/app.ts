import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
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

// IMPORTANT: Mount Better Auth handler BEFORE express.json() middleware
// This prevents the "pending" issue mentioned in the docs
app.all("/api/auth/*", toNodeHandler(auth));

// NOW mount express middleware AFTER Better Auth handler
app.use(express.json());
app.use(cookieParser());

// Test database connection
app.get("/api/test-db", async (_req, res) => {
  try {
    console.log("Testing database connection...");
    const { getPool } = await import("./db/pool");
    const pool = getPool();
    
    console.log("Pool created, testing query...");
    const result = await pool.query("SELECT 1 as test, NOW() as timestamp");
    
    console.log("Query successful:", result.rows[0]);
    res.json({ 
      status: "Database connection successful", 
      result: result.rows[0],
      timestamp: new Date().toISOString(),
      message: "Database is accessible from Lambda"
    });
  } catch (error) {
    console.error("Database test failed:", error);
    
    // Provide more detailed error information
    let errorDetails = "Unknown error";
    if (error instanceof Error) {
      errorDetails = error.message;
      if (error.cause) {
        errorDetails += ` (Cause: ${error.cause})`;
      }
    }
    
    res.status(500).json({ 
      status: "Database connection failed", 
      error: errorDetails,
      timestamp: new Date().toISOString(),
      message: "Check VPC, security groups, and database accessibility"
    });
  }
});

// Test Better Auth initialization separately
app.get("/api/test-auth", async (_req, res) => {
  try {
    console.log("Testing Better Auth initialization...");
    
    // Test if auth object can be created without database connection
    const { auth } = await import("./auth");
    
    res.json({ 
      status: "Better Auth initialization successful", 
      timestamp: new Date().toISOString(),
      message: "Better Auth object created successfully"
    });
  } catch (error) {
    console.error("Better Auth test failed:", error);
    
    let errorDetails = "Unknown error";
    if (error instanceof Error) {
      errorDetails = error.message;
    }
    
    res.status(500).json({ 
      status: "Better Auth initialization failed", 
      error: errorDetails,
      timestamp: new Date().toISOString(),
      message: "Better Auth configuration issue"
    });
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
