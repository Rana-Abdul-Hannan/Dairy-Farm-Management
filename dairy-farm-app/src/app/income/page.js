// src/app/income/page.js
'use client'; // This page needs client-side features (State, Effects, Navigation, API Calls)

import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useRouter } from 'next/navigation'; // Import useRouter hook for navigation
// Removed: import { ObjectId } from 'mongodb'; // No longer needed on the client side for display


export default function ViewIncomePage() {
  // State to hold the list of income records fetched from the API
  const [incomeRecords, setIncomeRecords] = useState([]);
  // State to hold the list of animals fetched from the API (needed to display animal names/tags)
  const [animals, setAnimals] = useState([]);

  // State for loading and error feedback during API calls
  const [loadingIncome, setLoadingIncome] = useState(true); // Loading state for income records
  const [errorIncome, setErrorIncome] = useState(null); // Error state for income records

  const [loadingAnimals, setLoadingAnimals] = useState(true); // Loading state for animals
  const [errorAnimals, setErrorAnimals] = useState(null); // Error state for animals


  // Get the router instance for navigation
  const router = useRouter();

  // Function to fetch income record data from the API
  const fetchIncomeRecords = async () => {
    setLoadingIncome(true); // Start loading state for income
    setErrorIncome(null); // Clear previous errors

    try {
      // --- API Call to fetch income records ---
      const response = await fetch('/api/income'); // Make GET request to the API route

      if (!response.ok) {
        // If the response is not OK, throw an error
        const errorData = await response.json(); // Try to read error message from response body
        throw new Error(errorData.message || 'Failed to fetch income records');
      }

      // If the response is OK, parse the JSON data
      const data = await response.json();
      setIncomeRecords(data); // Update state with fetched income records

    } catch (err) {
      console.error("Error fetching income records:", err);
      setErrorIncome(err.message || 'An unexpected error occurred while fetching income records.'); // Set error state
    } finally {
      setLoadingIncome(false); // Stop loading state regardless of success or failure
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
    fetchIncomeRecords(); // Fetch income records
    fetchAnimals(); // Fetch animals (needed to display linked animal info)
  }, []); // Empty dependency array means this effect runs only once after the initial render


  // Helper function to find an animal by its MongoDB _id
  const findAnimalById = (animalId) => {
    // Ensure animals array is not null or undefined before calling find
    // Compare the MongoDB _id string
    return animals?.find(animal => String(animal._id) === String(animalId));
  };


  // Function to handle deleting an income record
  const handleDeleteIncome = async (recordId) => { // Made function async
    console.log(`Attempting to delete income record with ID: ${recordId}`);

    // Optional: Add a confirmation dialog before deleting
    const confirmDelete = confirm("Are you sure you want to delete this income record?");
    if (!confirmDelete) {
        console.log("Deletion cancelled by user.");
        return; // Stop if user cancels
    }

    // Set loading state for deletion (optional, could use a different state)
    // setLoadingIncome(true); // This might make the whole list disappear/flicker
    // A better approach for deletion might be a separate deleting state per item or a global one that doesn't hide the list

    setErrorIncome(null); // Clear previous errors


    try {
        // --- API Call to delete data ---
        const response = await fetch(`/api/income/${recordId}`, { // Use dynamic API route with recordId (MongoDB _id)
            method: 'DELETE', // Use DELETE method
            // No body needed for DELETE requests
        });

        if (!response.ok) {
            // If the response is not OK, throw an error
            const errorData = await response.json(); // Try to read error message from response body
            throw new Error(errorData.message || 'Failed to delete income record');
        }

        // If the response is OK, the income record was deleted successfully
        const result = await response.json(); // Parse the JSON response (optional, but good practice)
        console.log('Income record deleted successfully:', result);

        // --- Update UI by refetching the list ---
        // Instead of manually filtering the state (which can be complex with async ops),
        // it's simpler and more reliable to refetch the entire list from the API.
        fetchIncomeRecords(); // Call the fetch function again to get the updated list

    } catch (err) {
        console.error("Error deleting income record:", err);
        setErrorIncome(err.message || 'An unexpected error occurred during deletion.'); // Set error state
        // setLoadingIncome(false); // Stop loading on error if you used a loading state for deletion
    }
    // Note: Loading state for successful deletion is handled by fetchIncomeRecords()
  };

  // Function to handle clicking the Edit button for an income record
  // Now passing the MongoDB _id
  const handleEditIncome = (recordId) => {
    console.log(`Edit button clicked for income record with ID: ${recordId}`);
    // Navigate to the income edit page, including the recordId (MongoDB _id) in the URL
    // We use the dynamic route /income/edit/[recordId]
    router.push(`/income/edit/${recordId}`);
    // TODO: Update the edit page to fetch data by MongoDB _id and use PUT for saving
  };


  // Show loading state or error message if necessary
  // Consider showing both loading states if needed
  if (loadingIncome || loadingAnimals) {
    return <div className="text-center text-gray-600">Loading income records and animals...</div>;
  }

  if (errorIncome || errorAnimals) {
      // Combine error messages if both failed, or show specific one
      const combinedError = errorIncome && errorAnimals ? `Error loading income records: ${errorIncome} | Error loading animals: ${errorAnimals}` : errorIncome || errorAnimals;
      return <div className="text-center text-red-600">Error: {combinedError}</div>;
  }


  // If data is loaded and no error, display the list
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">All Income Records</h1>

      {/* Display the list of income records */}
      {incomeRecords.length === 0 ? (
        // Show a message if there are no income records saved
        <p className="text-gray-600 text-center">No income records added yet. Add one from the "Add New Income Record" page.</p>
      ) : (
        // Map over the incomeRecords array to display each record
        <div className="space-y-4"> {/* Add space between income record items */}
          {incomeRecords.map((record) => {
            // Find the animal associated with this income record (if any) using MongoDB _id
            const animal = record.animalId ? findAnimalById(record.animalId) : null;

            return (
              // Card for each income record
              // Use the MongoDB _id as the key
              // record._id is an ObjectId object, convert to string for key
              <div key={record._id.toString()} className="bg-white shadow rounded-lg p-4 border border-gray-200">

                {/* Display MongoDB _id for debugging/verification */}
                 <p className="text-xs text-gray-500">ID: {record._id.toString()}</p>


                {/* Income Details */}
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

                {/* Edit/Delete buttons for income records */}
                <div className="mt-4 flex justify-end space-x-3"> {/* Align buttons to the right */}
                   {/* Edit Income button - Pass MongoDB _id */}
                   <button
                     className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                     onClick={() => handleEditIncome(record._id.toString())} // Pass the MongoDB _id as string
                   >
                     Edit
                   </button>
                   {/* Delete Income button - Pass MongoDB _id */}
                   <button
                     className="text-red-600 hover:text-red-800 font-medium text-sm"
                     onClick={() => handleDeleteIncome(record._id.toString())} // Pass the MongoDB _id as string
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
