// src/app/report/page.js
'use client'; // This page needs client-side features (Local Storage, State, Effects)

import { useState, useEffect } from 'react'; // Import useState and useEffect

export default function RevenueReportPage() {
  // State to hold all loaded records
  const [allIncomeRecords, setAllIncomeRecords] = useState([]);
  const [allExpenseRecords, setAllExpenseRecords] = useState([]);
   // State to hold the list of animals (needed to display animal names/tags for linked records)
  const [animals, setAnimals] = useState([]);

  // State for filter criteria
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // For filtering both income and expense categories

  // State to hold the filtered records
  const [filteredIncome, setFilteredIncome] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  // State to hold the calculated totals for the filtered data
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netRevenue, setNetRevenue] = useState(0);

  // State for loading/error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   // Helper function to find an animal by its ID
  const findAnimalById = (animalId) => {
    // Convert animalId to string for comparison as Local Storage IDs are saved as strings
    // Ensure animals array is not null or undefined before calling find
    return animals?.find(animal => String(animal.id) === String(animalId));
  };


  // useEffect to load ALL data from Local Storage initially
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load income records
        const storedIncomeRecords = localStorage.getItem('incomeRecords');
        const incomeRecordsArray = storedIncomeRecords ? JSON.parse(storedIncomeRecords) : [];
        setAllIncomeRecords(incomeRecordsArray);

        // Load expense records
        const storedExpenseRecords = localStorage.getItem('expenseRecords');
        const expenseRecordsArray = storedExpenseRecords ? JSON.parse(storedExpenseRecords) : [];
        setAllExpenseRecords(expenseRecordsArray);

         // Load animal data (needed for linking)
        const storedAnimals = localStorage.getItem('animals');
        if (storedAnimals) {
          setAnimals(JSON.parse(storedAnimals));
        }


        setLoading(false); // Data loaded

      } catch (err) {
        console.error("Error loading data from Local Storage:", err);
        setError("Error loading data for report.");
        setLoading(false); // Stop loading on error
      }
    } else {
       setLoading(false); // Not in a browser environment, stop loading
    }
  }, []); // Empty dependency array means this runs only once on mount to load ALL data

  // useEffect to filter data and recalculate totals whenever filters or all data change
  useEffect(() => {
      // Apply date filter
      const incomeFilteredByDate = allIncomeRecords.filter(record => {
          const recordDate = new Date(record.date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;

          if (start && recordDate < start) return false;
          if (end && recordDate > end) return false;
          return true;
      });

       const expensesFilteredByDate = allExpenseRecords.filter(record => {
          const recordDate = new Date(record.date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;

          if (start && recordDate < start) return false;
          if (end && recordDate > end) return false;
          return true;
      });


      // Apply category filter
      const incomeFiltered = selectedCategory
        ? incomeFilteredByDate.filter(record => record.category === selectedCategory)
        : incomeFilteredByDate;

      const expensesFiltered = selectedCategory
        ? expensesFilteredByDate.filter(record => record.category === selectedCategory)
        : expensesFilteredByDate;

      setFilteredIncome(incomeFiltered);
      setFilteredExpenses(expensesFiltered);

      // Recalculate totals based on filtered data
      const incomeSum = incomeFiltered.reduce((sum, record) => sum + (record.amount || 0), 0);
      setTotalIncome(incomeSum);

      const expenseSum = expensesFiltered.reduce((sum, record) => sum + (record.amount || 0), 0);
      setTotalExpenses(expenseSum);

      setNetRevenue(incomeSum - expenseSum);

  }, [allIncomeRecords, allExpenseRecords, startDate, endDate, selectedCategory]); // Re-run this effect when any of these dependencies change

  // Function to group records by category for breakdown
  const groupByCategory = (records) => {
      return records.reduce((acc, record) => {
          const category = record.category || 'Uncategorized';
          if (!acc[category]) {
              acc[category] = [];
          }
          acc[category].push(record);
          return acc;
      }, {});
  };

  const incomeBreakdown = groupByCategory(filteredIncome);
  const expenseBreakdown = groupByCategory(filteredExpenses);

  // Get all unique categories from both income and expenses for the filter dropdown
  const allCategories = [
      ...new Set([
          ...allIncomeRecords.map(record => record.category).filter(Boolean), // Filter out empty strings/nulls
          ...allExpenseRecords.map(record => record.category).filter(Boolean)
      ])
  ].sort(); // Sort categories alphabetically


  // Show loading state or error message if necessary
  if (loading) {
    return <div className="text-center text-gray-600">Generating report...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  // Display the report
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Revenue Report</h1>

       {/* Filter Controls */}
       <div className="bg-white shadow-md rounded px-8 pt-6 pb-4 mb-6">
           <h2 className="text-xl font-bold mb-4">Filter Report</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Responsive grid for filters */}
               {/* Start Date Filter */}
               <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                       Start Date
                   </label>
                   <input
                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                       id="startDate"
                       type="date"
                       value={startDate}
                       onChange={(e) => setStartDate(e.target.value)}
                   />
               </div>
               {/* End Date Filter */}
               <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                       End Date
                   </label>
                   <input
                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                       id="endDate"
                       type="date"
                       value={endDate}
                       onChange={(e) => setEndDate(e.target.value)}
                   />
               </div>
               {/* Category Filter */}
               <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryFilter">
                       Category
                   </label>
                   <select
                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                       id="categoryFilter"
                       value={selectedCategory}
                       onChange={(e) => setSelectedCategory(e.target.value)}
                   >
                       <option value="">All Categories</option>
                       {allCategories.map(category => (
                           <option key={category} value={category}>{category}</option>
                       ))}
                   </select>
               </div>
           </div>
            {/* Clear Filters Button */}
            <div className="mt-4 text-right">
                <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
                    onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setSelectedCategory('');
                    }}
                >
                    Clear Filters
                </button>
            </div>
       </div>


      {/* Summary Totals */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6"> {/* Increased bottom margin */}
        <h2 className="text-xl font-bold mb-4">Summary</h2>
        <div className="mb-4">
          <p className="text-gray-700 text-lg"><span className="font-semibold">Total Income:</span> <span className="text-green-600">${totalIncome.toFixed(2)}</span></p>
        </div>
        <div className="mb-6">
          <p className="text-gray-700 text-lg"><span className="font-semibold">Total Expenses:</span> <span className="text-red-600">${totalExpenses.toFixed(2)}</span></p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          {/* Display Net Revenue - color based on positive/negative */}
          <p className="text-gray-700 text-xl font-bold">
            Net Revenue: {' '}
            <span className={netRevenue >= 0 ? 'text-green-600' : 'text-red-600'}>
              ${netRevenue.toFixed(2)}
            </span>
          </p>
        </div>
      </div>

       {/* Detailed Breakdowns */}
       <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
           <h2 className="text-xl font-bold mb-4">Detailed Breakdown</h2>

           {/* Income Breakdown */}
           <div className="mb-6">
               <h3 className="text-lg font-semibold mb-2 text-green-700">Income Details ({filteredIncome.length} records)</h3>
               {Object.keys(incomeBreakdown).length === 0 ? (
                   <p className="text-gray-600 text-sm">No income records found for the selected filters.</p>
               ) : (
                   Object.keys(incomeBreakdown).map(category => (
                       <div key={category} className="mb-4 border-b border-gray-200 pb-2">
                           <h4 className="font-semibold text-gray-800">{category} ({incomeBreakdown[category].length} records)</h4>
                           <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                               {incomeBreakdown[category].map(record => {
                                   const animal = record.animalId ? findAnimalById(record.animalId) : null;
                                   return (
                                       <li key={record.id}>
                                           {record.date}: {record.description} - ${record.amount.toFixed(2)}
                                           {animal && ` (Animal: ${animal.animalType || 'Unnamed'} Tag: ${animal.tagNumber || 'N/A'})`}
                                            {record.notes && ` [Notes: ${record.notes}]`}
                                       </li>
                                   );
                               })}
                           </ul>
                           {/* Category Subtotal */}
                           <p className="text-sm font-semibold text-gray-800 mt-1">
                               Subtotal: ${incomeBreakdown[category].reduce((sum, rec) => sum + (rec.amount || 0), 0).toFixed(2)}
                           </p>
                       </div>
                   ))
               )}
           </div>

           {/* Expense Breakdown */}
           <div>
               <h3 className="text-lg font-semibold mb-2 text-red-700">Expense Details ({filteredExpenses.length} records)</h3>
                {Object.keys(expenseBreakdown).length === 0 ? (
                   <p className="text-gray-600 text-sm">No expense records found for the selected filters.</p>
               ) : (
                   Object.keys(expenseBreakdown).map(category => (
                       <div key={category} className="mb-4 border-b border-gray-200 pb-2">
                           <h4 className="font-semibold text-gray-800">{category} ({expenseBreakdown[category].length} records)</h4>
                            <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                               {expenseBreakdown[category].map(record => {
                                    const animal = record.animalId ? findAnimalById(record.animalId) : null;
                                   return (
                                       <li key={record.id}>
                                           {record.date}: {record.description} - ${record.amount.toFixed(2)}
                                           {animal && ` (Animal: ${animal.animalType || 'Unnamed'} Tag: ${animal.tagNumber || 'N/A'})`}
                                            {record.notes && ` [Notes: ${record.notes}]`}
                                       </li>
                                   );
                               })}
                           </ul>
                           {/* Category Subtotal */}
                           <p className="text-sm font-semibold text-gray-800 mt-1">
                               Subtotal: ${expenseBreakdown[category].reduce((sum, rec) => sum + (rec.amount || 0), 0).toFixed(2)}
                           </p>
                       </div>
                   ))
               )}
           </div>
       </div>

    </div>
  );
}
