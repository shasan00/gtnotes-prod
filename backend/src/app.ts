import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import notesRouter from "./routes/notes";
import { auth } from "./auth";

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));

app.use(express.json());
app.use(cookieParser());

// Better Auth middleware - this handles all OAuth flows automatically
app.use("/api/auth", auth.handler());

// Session helper routes (non-conflicting)
app.use("/api/session", authRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Custom routes for user management and notes
app.use("/api/users", usersRouter);
app.use("/api/notes", notesRouter);

export { app };
