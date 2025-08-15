import passport from "passport";
import { getPool } from "../db/pool";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";


const MicrosoftPassport = require("passport-microsoft"); // idk if needed

type VerifyCallback = (error: any, user?: any) => void;

interface MicrosoftProfileName {
  givenName?: string;
  familyName?: string;
}

interface MicrosoftEmailValue {
  value: string;
}

interface MicrosoftProfile {
  id: string;
  name?: MicrosoftProfileName;
  emails?: MicrosoftEmailValue[];
}

export function configureMicrosoftStrategy(): void {
  const clientID = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;
  const tenant = process.env.MS_TENANT_ID || "common";
  const callbackURL = process.env.MS_REDIRECT_URI || "http://localhost:4000/api/auth/microsoft/callback";

  if (!clientID || !clientSecret) {
    console.warn("Microsoft OAuth env vars not set; Microsoft auth disabled");
    return;
  }

  passport.use(
    new MicrosoftStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        tenant,
        scope: ["openid", "profile", "email", "User.Read"],
      },
      async (_accessToken: string, _refreshToken: string, profile: MicrosoftProfile, done: VerifyCallback) => {
        try {
          const microsoftId = profile.id;
          const email = profile.emails && profile.emails[0]?.value ? profile.emails[0].value.toLowerCase() : null;
          const firstName = profile.name?.givenName || null;
          const lastName = profile.name?.familyName || null;

          if (!microsoftId) {
            return done(new Error("Missing Microsoft ID in profile"));
          }

          const pool = getPool();

          // if user exists with microsoft_id return it
          const byMicrosoft = await pool.query(
            "select id, email, first_name, last_name, role from users where microsoft_id=$1",
            [microsoftId]
          );
          if (byMicrosoft.rowCount && byMicrosoft.rowCount > 0) {
            return done(null, byMicrosoft.rows[0]);
          }

          if (email) {
            // if user exists by email, merge by setting microsoft_id
            const byEmail = await pool.query(
              "select id, email, first_name, last_name, role from users where email=$1",
              [email]
            );
            if (byEmail.rowCount && byEmail.rowCount > 0) {
              const existing = byEmail.rows[0];
              await pool.query("update users set microsoft_id=$1, updated_at=now() where id=$2", [microsoftId, existing.id]);
              return done(null, existing);
            }
          }

          // create new user
          const insert = await pool.query(
            "insert into users (email, microsoft_id, first_name, last_name) values ($1,$2,$3,$4) returning id, email, first_name, last_name, role",
            [email, microsoftId, firstName, lastName]
          );
          return done(null, insert.rows[0]);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}


