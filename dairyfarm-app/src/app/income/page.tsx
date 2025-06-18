// src/app/income/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link'; // Import Link for navigation
import { useAuth } from '@/context/AuthContext';

// Define the Income interface (ensure this matches your Mongoose model)
interface Income {
  _id: string;
  source: string;
  amount: number;
  date: string; // Storing as string (YYYY-MM-DD) for form input
  notes?: string;
  user: string; // User ID string (MongoDB ObjectId as string)
  createdAt: string;
  updatedAt: string;
}

export default function IncomePage() {
  const { user, token, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();

  const [incomeRecords, setIncomeRecords] = useState<Income[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to handle API response errors more robustly
  const handleApiResponse = async (res: Response) => {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    } else {
      const errorText = await res.text();
      console.error('Non-JSON response received:', errorText);
      throw new Error(`Server error: Received unexpected response format (Status: ${res.status}). Please check server logs. Raw response: ${errorText.substring(0, 200)}...`);
    }
  };

  // 1. Fetch Income Records on component mount
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('You need to be logged in to view income records.');
      router.push('/login');
      return;
    }

    if (user && token && authFetch) {
      const fetchIncome = async () => {
        setLoadingData(true);
        setError(null);
        try {
          const res = await authFetch('/api/income');

          if (!res.ok) {
            const errorData = await handleApiResponse(res);
            throw new Error(errorData.message || 'Failed to fetch income records.');
          }

          const data: Income[] = await res.json();
          // Sort by date (descending) and then by createdAt (descending)
          data.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA !== dateB) {
                return dateB - dateA;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setIncomeRecords(data);
        } catch (err: any) {
          console.error('Error fetching income records:', err);
          if (err.message.includes('Authentication required.') || err.message.includes('Token expired')) {
            // These errors are typically handled by AuthContext,
            // which should trigger a logout/redirect. No need for a separate toast here.
          } else if (err.message.includes('Unexpected response format')) {
            toast.error('A server configuration issue occurred. Please try again later or contact support.');
          } else {
            toast.error(err.message || 'An error occurred while fetching income records.');
          }
          setError(err.message || 'Failed to load income records.');
        } finally {
          setLoadingData(false);
        }
      };
      fetchIncome();
    }
  }, [authLoading, user, token, router, authFetch]);

  // 2. Handle Delete Income
  const handleDeleteIncome = async (incomeId: string) => {
    if (!confirm('Are you sure you want to delete this income record?')) return;

    if (!user || !token || !authFetch) {
      toast.error('Authentication token missing. Please log in again.');
      router.push('/login');
      return;
    }

    try {
      const res = await authFetch(`/api/income/${incomeId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await handleApiResponse(res);
        throw new Error(errorData.message || 'Failed to delete income record.');
      }

      toast.success('Income record deleted successfully!');
      setIncomeRecords(prevRecords => prevRecords.filter(record => record._id !== incomeId));
    } catch (error: any) {
      console.error('Error deleting income record:', error);
      if (!error.message.includes('Authentication required.') && !error.message.includes('Token expired')) {
        toast.error(error.message || 'An error occurred while deleting the income record.');
      }
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-700">Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Manage Income</h1>

      {/* Button to navigate to Add Income Page */}
      <div className="text-center mb-8">
        <Link href="/income/add" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          Add New Income
        </Link>
      </div>

      {/* Income Records List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">All Income Records</h2>
        {loadingData ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-4 text-gray-600">Loading income records...</p>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center py-8">Error: {error}</p>
        ) : incomeRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No income records found. Add one above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomeRecords.map((income) => (
                  <tr key={income._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(income.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {income.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${income.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                      {income.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Changed to Link to the dedicated edit page */}
                      <button
                        onClick={() => router.push(`/income/edit/${income._id}`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteIncome(income._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}