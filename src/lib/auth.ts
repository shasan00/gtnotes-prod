import { createAuthClient } from "better-auth/client";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const AUTH_BASE = `${API_BASE_URL.replace(/\/$/, '')}/api/auth`;

export const authClient = createAuthClient({
  baseURL: AUTH_BASE,
});

// Helper functions for authentication
export const signInWithGoogle = async () => {
  try {
    const data = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/sign-in?success=true",
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
      provider: "microsoft",
      callbackURL: "/sign-in?success=true",
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

export const fullSignOut = async () => {
  try {
    await signOut();
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
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
