import { betterAuth } from "better-auth";
import { getPool } from "./db/pool";

export const auth = betterAuth({
  // Required Better Auth configuration
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  
  database: {
    type: "custom",
    async getUser(id: string) {
      try {
        const pool = getPool();
        const result = await pool.query(
          "SELECT id, email, first_name, last_name, role FROM users WHERE id = $1",
          [id]
        );
        return result.rows[0] || null;
      } catch (error) {
        console.error("Error in getUser:", error);
        throw error;
      }
    },
    async getUserByEmail(email: string) {
      try {
        const pool = getPool();
        const result = await pool.query(
          "SELECT id, email, first_name, last_name, role FROM users WHERE email = $1",
          [email]
        );
        return result.rows[0] || null;
      } catch (error) {
        console.error("Error in getUserByEmail:", error);
        throw error;
      }
    },
    async createUser(data: any) {
      try {
        const pool = getPool();
        const result = await pool.query(
          "INSERT INTO users (email, first_name, last_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, role",
          [data.email, data.firstName, data.lastName, 'user']
        );
        return result.rows[0];
      } catch (error) {
        console.error("Error in createUser:", error);
        throw error;
      }
    },
    async updateUser(id: string, data: any) {
      try {
        const pool = getPool();
        const result = await pool.query(
          "UPDATE users SET email = $1, first_name = $2, last_name = $3, updated_at = NOW() WHERE id = $4 RETURNING id, email, first_name, last_name, role",
          [data.email, data.firstName, data.lastName, id]
        );
        return result.rows[0];
      } catch (error) {
        console.error("Error in updateUser:", error);
        throw error;
      }
    },
    async linkAccount(data: any) {
      try {
        const pool = getPool();
        if (data.provider === 'google') {
          await pool.query(
            "UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2",
            [data.providerAccountId, data.userId]
          );
        } else if (data.provider === 'microsoft') {
          await pool.query(
            "UPDATE users SET microsoft_id = $1, updated_at = NOW() WHERE id = $2",
            [data.providerAccountId, data.userId]
          );
        }
      } catch (error) {
        console.error("Error in linkAccount:", error);
        throw error;
      }
    },
    async unlinkAccount(provider: string, providerAccountId: string) {
      try {
        const pool = getPool();
        if (provider === 'google') {
          await pool.query(
            "UPDATE users SET google_id = NULL, updated_at = NOW() WHERE google_id = $1",
            [providerAccountId]
          );
        } else if (provider === 'microsoft') {
          await pool.query(
            "UPDATE users SET microsoft_id = NULL, updated_at = NOW() WHERE microsoft_id = $1",
            [providerAccountId]
          );
        }
      } catch (error) {
        console.error("Error in unlinkAccount:", error);
        throw error;
      }
    },
    async getSession(sessionToken: string) {
      // For now, we'll use JWT tokens instead of sessions
      return null;
    },
    async createSession(data: any) {
      // For now, we'll use JWT tokens instead of sessions
      return null;
    },
    async updateSession(sessionToken: string, data: any) {
      // For now, we'll use JWT tokens instead of sessions
      return null;
    },
    async deleteSession(sessionToken: string) {
      // For now, we'll use JWT tokens instead of sessions
      return null;
    },
    async createVerificationToken(data: any) {
      // Not implemented for now
      return null;
    },
    async useVerificationToken(identifier: string, token: string) {
      // Not implemented for now
      return null;
    }
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline",
      prompt: "select_account+consent",
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
      prompt: "select_account",
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
  },
  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: any; profile: any }) {
      if (account?.provider === 'google' && profile) {
        // Handle Google profile data
        const googleProfile = profile as any;
        user.firstName = googleProfile.given_name || user.firstName;
        user.lastName = googleProfile.family_name || user.lastName;
        user.email = googleProfile.email || user.email;
      } else if (account?.provider === 'microsoft' && profile) {
        // Handle Microsoft profile data
        const msProfile = profile as any;
        user.firstName = msProfile.given_name || user.firstName;
        user.lastName = msProfile.family_name || user.lastName;
        user.email = msProfile.email || user.email;
      }
      return true;
    },
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Handle redirects after successful OAuth
      if (url.startsWith(baseUrl)) {
        // If the URL is relative to our base, redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
        return `${frontendUrl}/sign-in?success=true`;
      }
      return url;
    },
  },
});
