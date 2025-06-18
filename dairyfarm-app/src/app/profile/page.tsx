'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
      toast.error('You need to be logged in to view your profile.');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <p className="text-gray-700">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center py-10 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6 text-green-700">User Profile</h1>
        <div className="space-y-4">
          <p className="text-lg text-gray-800">
            <strong>Email:</strong> {user.email}
          </p>
          {/* Add more profile information here as needed */}
          <p className="text-md text-gray-600">
            This is a basic profile page. More options (e.g., change password) coming soon!
          </p>
        </div>
        <div className="mt-6">
          <Link href="/dashboard" className="text-green-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}