import { createAuthClient } from "better-auth/client";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const AUTH_BASE = `${API_BASE_URL.replace(/\/$/, '')}/api/auth`;
const SESSION_BASE = `${API_BASE_URL.replace(/\/$/, '')}/api/session`;

export const authClient = createAuthClient({
  baseURL: AUTH_BASE,
});

// Helper functions for authentication
export const signInWithGoogle = async () => {
  try {
    // First get the provider URLs
    const providersResponse = await fetch(`${SESSION_BASE}/providers`);
    if (!providersResponse.ok) {
      throw new Error('Failed to fetch provider URLs');
    }
    
    const providers = await providersResponse.json();
    const googleUrl = providers.google;
    
    if (!googleUrl) {
      throw new Error('Google provider URL not found');
    }
    
    // Redirect to the Google sign-in URL
    window.location.href = googleUrl;
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
};

export const signInWithMicrosoft = async () => {
  try {
    // First get the provider URLs
    const providersResponse = await fetch(`${SESSION_BASE}/providers`);
    if (!providersResponse.ok) {
      throw new Error('Failed to fetch provider URLs');
    }
    
    const providers = await providersResponse.json();
    const microsoftUrl = providers.microsoft;
    
    if (!microsoftUrl) {
      throw new Error('Microsoft provider URL not found');
    }
    
    // Redirect to the Microsoft sign-in URL
    window.location.href = microsoftUrl;
  } catch (error) {
    console.error("Microsoft sign in error:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    // Use the new session signout endpoint
    const response = await fetch(`${SESSION_BASE}/signout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Sign out failed');
    }
    
    // Also call the better-auth signout for cleanup
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
    // Use the new session endpoint
    const response = await fetch(`${SESSION_BASE}/me`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
};

