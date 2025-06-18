// src/app/login/page.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Destructure `user`, `loading`, and `login` from the AuthContext.
  // Note: `authFetch` is not needed here as we are doing a direct `fetch` for login.
  const { user, loading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in and not loading, redirect to dashboard
    if (!loading && user) {
      router.push('/dashboard');
      toast('You are already logged in.'); // Changed from toast.info to toast()
    }
  }, [user, loading, router]); // Dependency array to re-run effect when these values change

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsSubmitting(true); // Set submitting state to true to disable button
    try {
      // Step 1: Make an API call to your backend login endpoint
      // This is a standard fetch call, not using authFetch, as we are getting a token
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Send email and password to backend
      });

      const data = await res.json(); // Parse the JSON response from the backend

      if (!res.ok) {
        // If the HTTP response status is not OK (e.g., 401, 500),
        // throw an error with the message provided by the backend, or a generic one.
        throw new Error(data.message || 'Login failed. Please try again.');
      }

      // Step 2: If the API login is successful (res.ok is true),
      // use the `token` and `user` data received from the backend response
      // to call the `AuthContext`'s `login` function.
      // This function then stores the token and user in localStorage and updates context state.
      login(data.token, data.user); // Pass the token and user object as expected by AuthContext's login

      toast.success('Login successful!'); // Show success notification
      router.push('/dashboard'); // Redirect user to the dashboard page
    } catch (error: any) {
      // Catch any errors during the fetch or if an error was thrown above
      console.error('Login error:', error); // Log the detailed error to the console
      toast.error(error.message || 'Login failed. Please check your credentials and try again.'); // Show error notification to the user
    } finally {
      // This block always executes, regardless of success or error
      setIsSubmitting(false); // Reset submitting state
    }
  };

  if (loading) {
    // Show a loading indicator while AuthContext is initializing
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }

  // If `user` is truthy (meaning the user is logged in), render nothing or a redirect message.
  // The useEffect handles the actual redirection.
  if (user) {
    return null; // Don't render the login form if the user is already authenticated
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-lg shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={isSubmitting} // Disable button while submitting
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
          <div className="text-sm text-center">
            Or{' '}
            <Link href="/register" className="font-medium text-green-600 hover:text-green-500">
              create a new account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}