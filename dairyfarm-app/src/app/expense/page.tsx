'use client'; // This is a Client Component

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IExpense } from '@/models/Expense'; // Import the Expense interface

// Define types for state management
interface ExpenseRecord extends IExpense {
  _id: string; // Ensure _id is present for fetched documents
}

const ExpensePage = () => {
  const { authFetch, loading: authLoading } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to fetch expenses from the API
  const fetchExpenses = async () => {
    if (authLoading) return; // Don't fetch until auth context is ready

    setLoading(true);
    try {
      // Use authFetch to get all expenses
      // The type of 'response' here will now correctly be 'any' (or 'ExpenseRecord[]')
      // due to the AuthContextType update below.
      const response: ExpenseRecord[] = await authFetch('/expense', { method: 'GET' });
      setExpenses(response); // This line will now be valid
    } catch (error: any) {
      console.error('Failed to fetch expenses:', error);
      toast.error(error.message || 'Error fetching expenses.');
      // If unauthorized, authFetch already handles logout/redirect
    } finally {
      setLoading(false);
    }
  };

  // Function to handle expense deletion
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await authFetch(`/expense/${id}`, { method: 'DELETE' });
      toast.success('Expense deleted successfully!');
      // Filter out the deleted expense from the current list
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense._id !== id));
    } catch (error: any) {
      console.error('Failed to delete expense:', error);
      toast.error(error.message || 'Error deleting expense.');
    }
  };

  useEffect(() => {
    // Only fetch if auth context is not loading and a token exists
    // (authFetch will handle redirect if no token, but this prevents unnecessary calls)
    if (!authLoading) {
      fetchExpenses();
    }
  }, [authLoading]); // Re-run when authLoading state changes

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Expenses</h1>
        <p>Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Expenses</h1>

      <div className="mb-6">
        <Link href="/expense/add" passHref>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out">
            Add New Expense
          </button>
        </Link>
      </div>

      {expenses.length === 0 ? (
        <p className="text-gray-600">No expense records found. Add your first expense!</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Description</th>
                <th className="py-3 px-6 text-left">Amount</th>
                <th className="py-3 px-6 text-left">Date</th>
                <th className="py-3 px-6 text-left">Category</th>
                <th className="py-3 px-6 text-left">Notes</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {expenses.map((expense) => (
                <tr key={expense._id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{expense.description}</td>
                  <td className="py-3 px-6 text-left">${expense.amount.toFixed(2)}</td>
                  <td className="py-3 px-6 text-left">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-left">{expense.category || '-'}</td>
                  <td className="py-3 px-6 text-left">{expense.notes || '-'}</td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center space-x-3">
                      <Link href={`/expense/edit/${expense._id}`} passHref>
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-lg text-xs transition duration-300 ease-in-out">
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg text-xs transition duration-300 ease-in-out"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpensePage;