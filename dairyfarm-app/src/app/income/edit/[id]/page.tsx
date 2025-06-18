// src/app/income/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react'; // Removed 'use' from import
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface Income {
  _id: string;
  source: string;
  amount: number;
  date: string;
  notes?: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

// Props for dynamic route segments in Next.js App Router
interface EditIncomePageProps {
  params: {
    id: string; // The income ID from the URL
  };
}

export default function EditIncomePage({ params }: EditIncomePageProps) {
  const { user, token, authFetch, loading: authLoading } = useAuth();
  const router = useRouter();

  // THIS IS THE CORRECT WAY FOR CLIENT COMPONENTS CURRENTLY:
  // Access params.id directly. The warning is a Next.js heads-up for future versions/Server Components.
  // Do NOT use `use(Promise.resolve(params))` here, as it causes a runtime error.
  const incomeId = params.id; // Get the ID directly from params

  const [source, setSource] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the specific income record on component mount
  useEffect(() => {
    if (!authLoading && (!user || !token || !authFetch)) {
      toast.error('You need to be logged in to edit income records.');
      router.push('/login');
      return;
    }

    if (user && token && authFetch && incomeId) {
      const fetchIncome = async () => {
        setLoadingData(true);
        setError(null);
        try {
          const res = await authFetch(`/api/income/${incomeId}`);

          if (!res.ok) {
            let errorData;
            try {
              errorData = await res.json();
            } catch (jsonError) {
              console.error('Failed to parse error response as JSON:', jsonError);
              throw new Error(`Server responded with non-JSON or empty body. Status: ${res.status}`);
            }
            throw new Error(errorData.message || `Failed to fetch income record. Status: ${res.status}`);
          }

          const income: Income = await res.json();
          setSource(income.source);
          setAmount(income.amount.toString());
          setDate(income.date.split('T')[0]); // Format for input type="date"
          setNotes(income.notes || '');
        } catch (err: any) {
          console.error('Error fetching income record for edit:', err);
          setError(err.message || 'Failed to load income record for editing.');
          toast.error(err.message || 'An error occurred while loading the record.');
          if (err.message.includes('not found') || err.message.includes('not authorized')) {
             router.push('/income'); // Redirect to list if record not found/authorized
          }
        } finally {
          setLoadingData(false);
        }
      };
      fetchIncome();
    }
  }, [authLoading, user, token, authFetch, incomeId, router]);

  const handleUpdateIncome = async (e: React.FormEvent) => {
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

    setLoadingUpdate(true);
    try {
      const res = await authFetch(`/api/income/${incomeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          amount: Number(amount),
          date,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON during update:', jsonError);
          throw new Error(`Server responded with non-JSON or empty body during update. Status: ${res.status}`);
        }
        throw new Error(errorData.message || `Failed to update income record. Status: ${res.status}`);
      }

      toast.success('Income record updated successfully!');
      router.push('/income');

    } catch (err: any) {
      console.error('Error updating income record:', err);
      toast.error(err.message || 'An error occurred while updating the income record.');
    } finally {
      setLoadingUpdate(false);
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

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-700">Loading income record...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 text-lg">Error: {error}</p>
        <Link href="/income" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Go back to Income List
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Edit Income Record</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-lg mx-auto">
        <form onSubmit={handleUpdateIncome} className="grid grid-cols-1 gap-4">
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
              disabled={loadingUpdate}
            >
              {loadingUpdate ? 'Updating...' : 'Update Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}