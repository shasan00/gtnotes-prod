import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import notesRouter from "./routes/notes";
import passport from "passport";
import session from "express-session";
import { configureGoogleStrategy, initializePassport } from "./services/googleStrategy";
import { configureMicrosoftStrategy } from "./services/microsoftStrategy";

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));

app.use(express.json());
app.use(cookieParser());

// minimal session for passport; we don't use cookie sessions client-side
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
  })
);

initializePassport();
configureGoogleStrategy();
configureMicrosoftStrategy();
app.use(passport.initialize());
app.use(passport.session());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/notes", notesRouter);

export { app };
