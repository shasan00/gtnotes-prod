import { createAuthClient } from "better-auth/client";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  basePath: "/api/auth",
});

// Helper functions for authentication
export const signInWithGoogle = async () => {
  try {
    const data = await authClient.signIn.social({
      provider: "google"
    });
    return data;
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
};

export const signInWithMicrosoft = async () => {
  try {
    const data = await authClient.signIn.social({
      provider: "microsoft"
    });
    return data;
  } catch (error) {
    console.error("Microsoft sign in error:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await authClient.signOut();
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

export const getSession = async () => {
  try {
    const session = await authClient.getSession();
    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
};
