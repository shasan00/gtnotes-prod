"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureGoogleStrategy = configureGoogleStrategy;
exports.initializePassport = initializePassport;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const pool_1 = require("../db/pool");
function configureGoogleStrategy() {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/api/auth/google/callback";
    if (!clientID || !clientSecret) {
        console.warn("Google OAuth env vars not set; Google auth disabled");
        return;
    }
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID,
        clientSecret,
        callbackURL,
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const googleId = profile.id;
            console.log("profile", profile);
            const email = profile.emails && profile.emails[0]?.value ? profile.emails[0].value.toLowerCase() : null;
            const firstName = profile.name?.givenName || null;
            const lastName = profile.name?.familyName || null;
            if (!googleId) {
                return done(new Error("Missing Google ID in profile"));
            }
            const pool = (0, pool_1.getPool)();
            // if user exists with google_id will return 
            const byGoogle = await pool.query("select id, email, first_name, last_name, role from users where google_id=$1", [googleId]);
            if (byGoogle.rowCount && byGoogle.rowCount > 0) {
                return done(null, byGoogle.rows[0]);
            }
            if (email) {
                // if user exists by email, merge by setting google_id
                const byEmail = await pool.query("select id, email, first_name, last_name, role from users where email=$1", [email]);
                if (byEmail.rowCount && byEmail.rowCount > 0) {
                    const existing = byEmail.rows[0];
                    await pool.query("update users set google_id=$1, updated_at=now() where id=$2", [googleId, existing.id]);
                    return done(null, existing);
                }
            }
            // creates new user
            const insert = await pool.query("insert into users (email, google_id, first_name, last_name) values ($1,$2,$3,$4) returning id, email, first_name, last_name, role", [email, googleId, firstName, lastName]);
            return done(null, insert.rows[0]);
        }
        catch (err) {
            return done(err);
        }
    }));
}
function initializePassport() {
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const res = await (0, pool_1.getPool)().query("select id, email, first_name, last_name from users where id=$1", [id]);
            done(null, res.rows[0] || null);
        }
        catch (e) {
            done(e);
        }
    });
}
exports.default = passport_1.default;
