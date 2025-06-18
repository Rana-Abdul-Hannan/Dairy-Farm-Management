// src/app/income/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AddIncomePage() {
  const { user, token, authFetch } = useAuth();
  const router = useRouter();

  const [source, setSource] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token || !authFetch) {
      toast.error('Authentication token missing. Please log in again.');
      router.push('/login');
      return;
    }

    if (!source || amount === '' || !date) {
      toast.error('Please fill in all required fields (Source, Amount, Date).');
      return;
    }

    setLoadingSubmit(true);
    try {
      const res = await authFetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          amount: Number(amount),
          date,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json(); // Assuming JSON error response
        throw new Error(errorData.message || 'Failed to add income record.');
      }

      toast.success('Income record added successfully!');
      router.push('/income'); // Redirect back to the main income list page

    } catch (err: any) {
      console.error('Error adding income record:', err);
      toast.error(err.message || 'An error occurred while adding the income record.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-700">Redirecting to login...</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Add New Income</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-lg mx-auto">
        <form onSubmit={handleAddIncome} className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700">
              Source <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <Link href="/income" className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loadingSubmit}
            >
              {loadingSubmit ? 'Adding...' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}