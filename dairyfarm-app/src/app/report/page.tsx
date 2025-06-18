// src/app/report/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components (required for react-chartjs-2)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Income {
  _id: string;
  source: string;
  amount: number;
  date: string; // Assuming a date string
  user: string; // User ID
}

interface Expense {
  _id: string;
  category: string;
  amount: number;
  date: string; // Assuming a date string
  user: string; // User ID
}

export default function ReportPage() {
  const { user, loading, authFetch } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reportLoading, setReportLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!user || loading) return; // Wait for user to be loaded

      setReportLoading(true);
      setError(null);

      try {
        const incomeResponse = await authFetch('/income');
        if (incomeResponse && Array.isArray(incomeResponse)) {
          setIncomes(incomeResponse);
        } else {
          toast.error('Failed to fetch income data or data format is incorrect.');
        }

        const expenseResponse = await authFetch('/expense');
        if (expenseResponse && Array.isArray(expenseResponse)) {
          setExpenses(expenseResponse);
        } else {
          toast.error('Failed to fetch expense data or data format is incorrect.');
        }
      } catch (err: any) {
        console.error('Error fetching report data:', err);
        setError(err.message || 'Failed to fetch report data.');
        toast.error('Error fetching report data: ' + (err.message || 'Unknown error'));
      } finally {
        setReportLoading(false);
      }
    };

    fetchReportData();
  }, [user, loading, authFetch]);

  // --- Data Processing for Report and Chart ---
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfitLoss = totalIncome - totalExpenses;

  // Prepare data for the chart (e.g., monthly summary)
  // This is a simple example, you might want more sophisticated grouping
  const getMonthlyData = (data: (Income | Expense)[]) => {
    const monthlyMap: { [key: string]: number } = {};
    data.forEach(item => {
      const month = new Date(item.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyMap[month] = (monthlyMap[month] || 0) + item.amount;
    });
    return monthlyMap;
  };

  const monthlyIncomes = getMonthlyData(incomes);
  const monthlyExpenses = getMonthlyData(expenses);

  const allMonths = Array.from(new Set([...Object.keys(monthlyIncomes), ...Object.keys(monthlyExpenses)]))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()); // Sort by date

  const chartData = {
    labels: allMonths,
    datasets: [
      {
        label: 'Income',
        data: allMonths.map(month => monthlyIncomes[month] || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: allMonths.map(month => monthlyExpenses[month] || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Income vs. Expenses',
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Amount ($)'
            }
        }
    }
  };

  if (loading || reportLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-700">Generating report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center text-red-600">
        <h1 className="text-2xl font-bold mb-4">Error Loading Report</h1>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Financial Report</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-center">
        <div className="bg-green-100 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-green-800">Total Income</h2>
          <p className="text-4xl font-bold text-green-600 mt-2">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-red-100 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-red-800">Total Expenses</h2>
          <p className="text-4xl font-bold text-red-600 mt-2">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className={`p-6 rounded-lg shadow-md ${netProfitLoss >= 0 ? 'bg-blue-100' : 'bg-yellow-100'}`}>
          <h2 className="text-2xl font-semibold text-blue-800">Net Profit/Loss</h2>
          <p className={`text-4xl font-bold mt-2 ${netProfitLoss >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
            ${netProfitLoss.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Income Details</h2>
        {incomes.length === 0 ? (
          <p className="text-center text-gray-600">No income records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Source</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Amount</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b text-sm text-gray-800">{item.source}</td>
                    <td className="py-3 px-4 border-b text-sm text-gray-800">${item.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 border-b text-sm text-gray-800">{new Date(item.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Expense Details</h2>
        {expenses.length === 0 ? (
          <p className="text-center text-gray-600">No expense records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Category</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Amount</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b text-sm text-gray-800">{item.category}</td>
                    <td className="py-3 px-4 border-b text-sm text-gray-800">${item.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 border-b text-sm text-gray-800">{new Date(item.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {allMonths.length > 0 && (
        <div className="mt-12 p-6 bg-gray-50 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Financial Overview Chart</h2>
          <div className="max-w-4xl mx-auto">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}