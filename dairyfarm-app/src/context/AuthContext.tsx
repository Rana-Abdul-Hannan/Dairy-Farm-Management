// src/context/AuthContext.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: { _id: string; email: string; name?: string } | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: { _id: string; email: string; name?: string }) => void;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- FIX APPLIED HERE ---
export function AuthProvider({ children }: { children: ReactNode }) {
// --- END FIX ---
  const [user, setUser] = useState<{ _id: string; email: string; name?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const baseUrl = '/api';

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (typeof parsedUser === 'object' && parsedUser !== null && parsedUser._id) {
          setToken(storedToken);
          setUser(parsedUser);
        } else {
          console.warn("Malformed user data in localStorage, clearing.");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (e) {
        console.error("Failed to parse user data from localStorage:", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: { _id: string; email: string; name?: string }) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    toast.success('Logged in successfully!');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully!');
    router.push('/login');
  }, [router]);

  const authFetch = useCallback(async (url: string, options?: RequestInit) => {
    if (!token) {
      toast.error('You need to be logged in to perform this action.');
      router.push('/login');
      throw new Error('Authentication required.');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options?.headers,
      'Authorization': `Bearer ${token}`,
    };

    try {
      const response = await fetch(baseUrl + url, { ...options, headers });

      if (response.status === 401) {
          let errorData: { message?: string } = {};
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
              try {
                  errorData = await response.json();
              } catch (e) {
                  console.error('Failed to parse 401 response as JSON:', e);
                  errorData.message = 'Unauthorized response, but message unparseable.';
              }
          } else {
              errorData.message = await response.text();
              console.error('Non-JSON 401 response:', errorData.message.substring(0, 200));
          }

          if (errorData.message && errorData.message.includes('token expired')) {
              toast.error('Your session has expired. Please log in again.');
              logout();
              throw new Error('Token expired, user logged out.');
          }
          if (errorData.message && errorData.message.includes('invalid token')) {
              toast.error('Invalid authentication token. Please log in again.');
              logout();
              throw new Error('Invalid token, user logged out.');
          }
          throw new Error(errorData.message || 'Unauthorized access.');
      }

      if (!response.ok) {
          let errorData: { message?: string } = {};
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
              try {
                  errorData = await response.json();
              } catch (e) {
                  console.error('Failed to parse non-OK JSON response:', e);
                  errorData.message = `API Error: ${response.status}, message unparseable.`;
              }
          } else {
              const rawErrorText = await response.text();
              console.error(`Non-JSON non-OK response from API (Status: ${response.status}):`, rawErrorText.substring(0, 200));
              throw new Error(`Server responded with non-JSON content. Status: ${response.status}.`);
          }
          throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
          return await response.json();
      } else {
          console.warn('Successful API response was not JSON:', await response.text().then(text => text.substring(0, 200)));
          return response;
      }

    } catch (error: any) {
      console.error("AuthFetch error:", error);
      if (error instanceof Error && (
          error.message.includes('Authentication required.') ||
          error.message.includes('Token expired') ||
          error.message.includes('Invalid token') ||
          error.message.includes('Unauthorized access')
      )) {
          throw error;
      }
      toast.error(error.message || 'An unexpected error occurred during API call.');
      throw error;
    }
  }, [token, logout, router, baseUrl]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}