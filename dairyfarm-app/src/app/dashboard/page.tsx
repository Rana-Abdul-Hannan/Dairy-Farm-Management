// src/app/dashboard/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      toast.error('You need to be logged in to view the dashboard.');
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-700">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome, {user.name}!</h1>
      <p className="text-lg text-gray-700 mb-8">
        This is your central hub for managing your dairy farm operations.
      </p>

      <div className="flex justify-center flex-wrap gap-6">
        {/* Main button to navigate to Animals List */}
        <Link
          href="/animals"
          className="group relative flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-10 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[250px]"
        >
          <svg className="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xl">Manage Animals</span>
          <span className="absolute bottom-2 opacity-0 group-hover:opacity-100 text-sm transition-opacity duration-300">View & Add</span>
        </Link>

        {/* Link to Income Page */}
        <Link
          href="/income"
          className="group relative flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-10 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[250px]"
        >
          <svg className="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V3m0 9v3m0-10A8 8 0 113 12a8 8 0 019-9z" />
          </svg>
          <span className="text-xl">Manage Income</span>
          <span className="absolute bottom-2 opacity-0 group-hover:opacity-100 text-sm transition-opacity duration-300">Track Earnings</span>
        </Link>

        {/* Link to Expense Page */}
        <Link
          href="/expense"
          className="group relative flex flex-col items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-10 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[250px]"
        >
          {/* Icon for Expenses - A common choice is a "minus" or "receipt" icon */}
          <svg className="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-6 6l-6-6m6 6l-6-6m6 6l-6-6m6-6a2 2 0 012-2h4a2 2 0 012 2v16a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2z" />
          </svg>
          <span className="text-xl">Manage Expenses</span>
          <span className="absolute bottom-2 opacity-0 group-hover:opacity-100 text-sm transition-opacity duration-300">Track Spending</span>
        </Link>

        {/* NEW: Link to Tips Page */}
        <Link
          href="/tips"
          className="group relative flex flex-col items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 px-10 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[250px]"
        >
          {/* Icon for Tips/Insights - A common choice is a "lightbulb" or "book" icon */}
          <svg className="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1m-1.636 6.364l-.707-.707M12 21v-1m-6.364-1.636l.707-.707M3 12H4m1.636-6.364l.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-xl">Farm Tips & AI</span>
          <span className="absolute bottom-2 opacity-0 group-hover:opacity-100 text-sm transition-opacity duration-300">Get Expert Advice</span>
        </Link>

        {/* NEW: Link to Report Page */}
        <Link
          href="/report"
          className="group relative flex flex-col items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-6 px-10 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[250px]"
        >
          {/* Icon for Report - A common choice is a "chart" or "document" icon */}
          <svg className="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2V6a2 2 0 012-2h2a2 2 0 012 2v13a2 2 0 002 2h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2V9a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-xl">View Reports</span>
          <span className="absolute bottom-2 opacity-0 group-hover:opacity-100 text-sm transition-opacity duration-300">Analyze Finances</span>
        </Link>
      </div>
    </div>
  );
}