'use client'; // This is a Client Component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { IExpense } from '@/models/Expense'; // Import the Expense interface

// Define the type for the component's props, which include params from Next.js dynamic routes
interface EditExpensePageProps {
  params: {
    id: string; // The expense ID from the URL (e.g., /expense/edit/123)
  };
}

const EditExpensePage = ({ params }: EditExpensePageProps) => {
  const router = useRouter();
  const { authFetch } = useAuth();
  const { id: expenseId } = params; // Extract the expense ID from the URL params

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    category: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true); // Initial loading for fetching data
  const [submitting, setSubmitting] = useState(false); // Loading for form submission

  // Effect to fetch the existing expense data when the component mounts
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const response: IExpense = await authFetch(`/expense/${expenseId}`, { method: 'GET' });
        // Format date from ISO string to 'YYYY-MM-DD' for input type="date"
        const formattedDate = response.date ? new Date(response.date).toISOString().split('T')[0] : '';
        setFormData({
          description: response.description || '',
          amount: response.amount ? String(response.amount) : '',
          date: formattedDate,
          category: response.category || '',
          notes: response.notes || '',
        });
      } catch (error: any) {
        console.error('Failed to fetch expense:', error);
        toast.error(error.message || 'Error fetching expense details.');
        router.push('/expense'); // Redirect if expense not found or error
      } finally {
        setLoading(false);
      }
    };

    if (expenseId) {
      fetchExpense();
    }
  }, [expenseId, authFetch, router]); // Depend on expenseId, authFetch, and router

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Basic client-side validation
    if (!formData.description || !formData.amount || !formData.date) {
      toast.error('Please fill in description, amount, and date.');
      setSubmitting(false);
      return;
    }

    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast.error('Amount must be a positive number.');
      setSubmitting(false);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
      };

      await authFetch(`/expense/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      toast.success('Expense updated successfully!');
      router.push('/expense'); // Redirect to the main expense list page
    } catch (error: any) {
      console.error('Failed to update expense:', error);
      toast.error(error.message || 'Error updating expense.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Edit Expense</h1>
        <p>Loading expense details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Expense</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Description:
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
              Amount ($):
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              step="0.01"
              required
            />
          </div>

          {/* Date */}
          <div className="mb-4">
            <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">
              Date:
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* Category (Optional) */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
              Category:
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Notes (Optional) */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">
              Notes:
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Expense'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/expense')}
              className="ml-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpensePage;