// src/app/expenses/page.js
'use client'; // This page needs client-side features (State, Effects, Navigation, API Calls)

import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useRouter } from 'next/navigation'; // Import useRouter hook for navigation
// Removed: import { ObjectId } from 'mongodb'; // No longer needed on the client side for display


export default function ViewExpensesPage() {
  // State to hold the list of expense records fetched from the API
  const [expenseRecords, setExpenseRecords] = useState([]);
  // State to hold the list of animals fetched from the API (needed to display animal names/tags)
  const [animals, setAnimals] = useState([]);

  // State for loading and error feedback during API calls
  const [loadingExpenses, setLoadingExpenses] = useState(true); // Loading state for expense records
  const [errorExpenses, setErrorExpenses] = useState(null); // Error state for expense records

  const [loadingAnimals, setLoadingAnimals] = useState(true); // Loading state for animals
  const [errorAnimals, setErrorAnimals] = useState(null); // Error state for animals


  // Get the router instance for navigation
  const router = useRouter();

  // Function to fetch expense record data from the API
  const fetchExpenseRecords = async () => {
    setLoadingExpenses(true); // Start loading state for expenses
    setErrorExpenses(null); // Clear previous errors

    try {
      // --- API Call to fetch expense records ---
      const response = await fetch('/api/expenses'); // Make GET request to the API route

      if (!response.ok) {
        // If the response is not OK, throw an error
        const errorData = await response.json(); // Try to read error message from response body
        throw new Error(errorData.message || 'Failed to fetch expense records');
      }

      // If the response is OK, parse the JSON data
      const data = await response.json();
      setExpenseRecords(data); // Update state with fetched expense records

    } catch (err) {
      console.error("Error fetching expense records:", err);
      setErrorExpenses(err.message || 'An unexpected error occurred while fetching expense records.'); // Set error state
    } finally {
      setLoadingExpenses(false); // Stop loading state regardless of success or failure
    }
  };

  // Function to fetch animal data from the API
   const fetchAnimals = async () => {
     setLoadingAnimals(true); // Start loading state for animals
     setErrorAnimals(null); // Clear previous errors

     try {
       // --- API Call to fetch animals ---
       const response = await fetch('/api/animals'); // Make GET request to the API route

       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Failed to fetch animals');
       }

       const data = await response.json();
       setAnimals(data); // Update state with fetched animals

     } catch (err) {
       console.error("Error fetching animals:", err);
       setErrorAnimals(err.message || 'An unexpected error occurred while fetching animals.'); // Set error state
     } finally {
       setLoadingAnimals(false); // Stop loading state regardless of success or failure
     }
   };


  // useEffect to fetch data from the APIs when the component loads
  useEffect(() => {
    fetchExpenseRecords(); // Fetch expense records
    fetchAnimals(); // Fetch animals (needed to display linked animal info)
  }, []); // Empty dependency array means this effect runs only once after the initial render


  // Helper function to find an animal by its MongoDB _id
  const findAnimalById = (animalId) => {
    // Ensure animals array is not null or undefined before calling find
    // Compare the MongoDB _id string
    return animals?.find(animal => String(animal._id) === String(animalId));
  };


  // Function to handle deleting an expense record
  const handleDeleteExpense = async (recordId) => { // Made function async
    console.log(`Attempting to delete expense record with ID: ${recordId}`);

    // Optional: Add a confirmation dialog before deleting
    const confirmDelete = confirm("Are you sure you want to delete this expense record?");
    if (!confirmDelete) {
        console.log("Deletion cancelled by user.");
        return; // Stop if user cancels
    }

    // Set loading state for deletion (optional, could use a different state)
    // setLoadingExpenses(true); // This might make the whole list disappear/flicker
    // A better approach for deletion might be a separate deleting state per item or a global one that doesn't hide the list

    setErrorExpenses(null); // Clear previous errors


    try {
        // --- API Call to delete data ---
        const response = await fetch(`/api/expenses/${recordId}`, { // Use dynamic API route with recordId (MongoDB _id)
            method: 'DELETE', // Use DELETE method
            // No body needed for DELETE requests
        });

        if (!response.ok) {
            // If the response is not OK, throw an error
            const errorData = await response.json(); // Try to read error message from response body
            throw new Error(errorData.message || 'Failed to delete expense record');
        }

        // If the response is OK, the expense record was deleted successfully
        const result = await response.json(); // Parse the JSON response (optional, but good practice)
        console.log('Expense record deleted successfully:', result);

        // --- Update UI by refetching the list ---
        // Instead of manually filtering the state (which can be complex with async ops),
        // it's simpler and more reliable to refetch the entire list from the API.
        fetchExpenseRecords(); // Call the fetch function again to get the updated list

    } catch (err) {
        console.error("Error deleting expense record:", err);
        setErrorExpenses(err.message || 'An unexpected error occurred during deletion.'); // Set error state
        // setLoadingExpenses(false); // Stop loading on error if you used a loading state for deletion
    }
    // Note: Loading state for successful deletion is handled by fetchExpenseRecords()
  };

  // Function to handle clicking the Edit button for an expense record
  // Now passing the MongoDB _id
  const handleEditExpense = (recordId) => {
    console.log(`Edit button clicked for expense record with ID: ${recordId}`);
    // Navigate to the expense edit page, including the recordId (MongoDB _id) in the URL
    // We use the dynamic route /expenses/edit/[recordId]
    router.push(`/expenses/edit/${recordId}`);
    // TODO: Update the edit page to fetch data by MongoDB _id and use PUT for saving
  };


  // Show loading state or error message if necessary
  // Consider showing both loading states if needed
  if (loadingExpenses || loadingAnimals) {
    return <div className="text-center text-gray-600">Loading expense records and animals...</div>;
  }

  if (errorExpenses || errorAnimals) {
      // Combine error messages if both failed, or show specific one
      const combinedError = errorExpenses && errorAnimals ? `Error loading expense records: ${errorExpenses} | Error loading animals: ${errorAnimals}` : errorExpenses || errorAnimals;
      return <div className="text-center text-red-600">Error: {combinedError}</div>;
  }


  // If data is loaded and no error, display the list
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">All Expense Records</h1>

      {/* Display the list of expense records */}
      {expenseRecords.length === 0 ? (
        // Show a message if there are no expense records saved
        <p className="text-gray-600 text-center">No expense records added yet. Add one from the "Add New Expense" page.</p>
      ) : (
        // Map over the expenseRecords array to display each record
        <div className="space-y-4"> {/* Add space between expense record items */}
          {expenseRecords.map((record) => {
            // Find the animal associated with this expense record (if any) using MongoDB _id
            const animal = record.animalId ? findAnimalById(record.animalId) : null;

            return (
              // Card for each expense record
              // Use the MongoDB _id as the key
              // record._id is an ObjectId object, convert to string for key
              <div key={record._id.toString()} className="bg-white shadow rounded-lg p-4 border border-gray-200">

                {/* Display MongoDB _id for debugging/verification */}
                 <p className="text-xs text-gray-500">ID: {record._id.toString()}</p>


                {/* Expense Details */}
                <div className="text-sm text-gray-700 space-y-1">
                  <p><span className="font-semibold">Date:</span> {record.date || 'N/A'}</p>
                  <p><span className="font-semibold">Description:</span> {record.description || 'N/A'}</p>
                  <p><span className="font-semibold">Amount:</span> ${record.amount ? record.amount.toFixed(2) : '0.00'}</p> {/* Format as currency */}
                  <p><span className="font-semibold">Category:</span> {record.category || 'N/A'}</p>

                  {/* Display Linked Animal Info if found */}
                  {animal ? (
                    <p><span className="font-semibold">Related Animal:</span> {animal.animalType || 'Unnamed Animal'} (Tag: {animal.tagNumber || 'N/A'})</p>
                  ) : (
                    // Optionally show something if no animal is linked
                    // <p><span className="font-semibold">Related Animal:</span> None</p>
                    null // Or just show nothing if no animal
                  )}
                </div>

                {/* Notes */}
                {record.notes && (
                   <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-700">
                     <span className="font-semibold">Notes:</span> {record.notes}
                   </div>
                )}

                {/* Edit/Delete buttons for expense records */}
                <div className="mt-4 flex justify-end space-x-3"> {/* Align buttons to the right */}
                   {/* Edit Expense button - Pass MongoDB _id */}
                   <button
                     className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                     onClick={() => handleEditExpense(record._id.toString())} // Pass the MongoDB _id as string
                   >
                     Edit
                   </button>
                   {/* Delete Expense button - Pass MongoDB _id */}
                   <button
                     className="text-red-600 hover:text-red-800 font-medium text-sm"
                     onClick={() => handleDeleteExpense(record._id.toString())} // Pass the MongoDB _id as string
                   >
                     Delete
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
