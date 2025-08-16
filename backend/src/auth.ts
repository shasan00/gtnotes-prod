import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  // Required Better Auth configuration
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  
  // Use built-in PostgreSQL adapter
  database: new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: {
      rejectUnauthorized: false, // Always attempt SSL, but don't reject self-signed certs in dev/test
    },
  }),
  
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
