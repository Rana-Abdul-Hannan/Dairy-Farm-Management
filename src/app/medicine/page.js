// src/app/medicine/page.js
'use client'; // This page needs client-side features (State, Effects, Navigation, API Calls)

import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useRouter } from 'next/navigation'; // Import useRouter hook for navigation
// Removed: import { ObjectId } from 'mongodb'; // No longer needed on the client side for display


export default function ViewMedicinePage() {
  // State to hold the list of medicine records fetched from the API
  const [medicineRecords, setMedicineRecords] = useState([]);
  // State to hold the list of animals fetched from the API (needed to display animal names/tags)
  const [animals, setAnimals] = useState([]);

  // State for loading and error feedback during API calls
  const [loadingMedicine, setLoadingMedicine] = useState(true); // Loading state for medicine records
  const [errorMedicine, setErrorMedicine] = useState(null); // Error state for medicine records

  const [loadingAnimals, setLoadingAnimals] = useState(true); // Loading state for animals
  const [errorAnimals, setErrorAnimals] = useState(null); // Error state for animals


  // Get the router instance for navigation
  const router = useRouter();

  // Function to fetch medicine record data from the API
  const fetchMedicineRecords = async () => {
    setLoadingMedicine(true); // Start loading state for medicine
    setErrorMedicine(null); // Clear previous errors

    try {
      // --- API Call to fetch medicine records ---
      const response = await fetch('/api/medicine'); // Make GET request to the API route

      if (!response.ok) {
        // If the response is not OK, throw an error
        const errorData = await response.json(); // Try to read error message from response body
        throw new Error(errorData.message || 'Failed to fetch medicine records');
      }

      // If the response is OK, parse the JSON data
      const data = await response.json();
      setMedicineRecords(data); // Update state with fetched medicine records

    } catch (err) {
      console.error("Error fetching medicine records:", err);
      setErrorMedicine(err.message || 'An unexpected error occurred while fetching medicine records.'); // Set error state
    } finally {
      setLoadingMedicine(false); // Stop loading state regardless of success or failure
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
    fetchMedicineRecords(); // Fetch medicine records
    fetchAnimals(); // Fetch animals (needed to display linked animal info)
  }, []); // Empty dependency array means this effect runs only once after the initial render


  // Helper function to find an animal by its MongoDB _id
  const findAnimalById = (animalId) => {
    // Ensure animals array is not null or undefined before calling find
    // Compare the MongoDB _id string
    return animals?.find(animal => String(animal._id) === String(animalId));
  };


  // Function to handle deleting a medicine record
  const handleDeleteMedicine = async (recordId) => { // Made function async
    console.log(`Attempting to delete medicine record with ID: ${recordId}`);

    // Optional: Add a confirmation dialog before deleting
    const confirmDelete = confirm("Are you sure you want to delete this medicine record?");
    if (!confirmDelete) {
        console.log("Deletion cancelled by user.");
        return; // Stop if user cancels
    }

    // Set loading state for deletion (optional, could use a different state)
    // setLoadingMedicine(true); // This might make the whole list disappear/flicker
    // A better approach for deletion might be a separate deleting state per item or a global one that doesn't hide the list

    setErrorMedicine(null); // Clear previous errors


    try {
        // --- API Call to delete data ---
        const response = await fetch(`/api/medicine/${recordId}`, { // Use dynamic API route with recordId (MongoDB _id)
            method: 'DELETE', // Use DELETE method
            // No body needed for DELETE requests
        });

        if (!response.ok) {
            // If the response is not OK, throw an error
            const errorData = await response.json(); // Try to read error message from response body
            throw new Error(errorData.message || 'Failed to delete medicine record');
        }

        // If the response is OK, the medicine record was deleted successfully
        const result = await response.json(); // Parse the JSON response (optional, but good practice)
        console.log('Medicine record deleted successfully:', result);

        // --- Update UI by refetching the list ---
        // Instead of manually filtering the state (which can be complex with async ops),
        // it's simpler and more reliable to refetch the entire list from the API.
        fetchMedicineRecords(); // Call the fetch function again to get the updated list

    } catch (err) {
        console.error("Error deleting medicine record:", err);
        setErrorMedicine(err.message || 'An unexpected error occurred during deletion.'); // Set error state
        // setLoadingMedicine(false); // Stop loading on error if you used a loading state for deletion
    }
    // Note: Loading state for successful deletion is handled by fetchMedicineRecords()
  };

  // Function to handle clicking the Edit button for a medicine record
  // Now passing the MongoDB _id
  const handleEditMedicine = (recordId) => {
    console.log(`Edit button clicked for medicine record with ID: ${recordId}`);
    // Navigate to the medicine edit page, including the recordId (MongoDB _id) in the URL
    // We use the dynamic route /medicine/edit/[recordId]
    router.push(`/medicine/edit/${recordId}`);
    // TODO: Update the edit page to fetch data by MongoDB _id and use PUT for saving
  };


  // Show loading state or error message if necessary
  // Consider showing both loading states if needed
  if (loadingMedicine || loadingAnimals) {
    return <div className="text-center text-gray-600">Loading medicine records and animals...</div>;
  }

  if (errorMedicine || errorAnimals) {
      // Combine error messages if both failed, or show specific one
      const combinedError = errorMedicine && errorAnimals ? `Error loading medicine records: ${errorMedicine} | Error loading animals: ${errorAnimals}` : errorMedicine || errorAnimals;
      return <div className="text-center text-red-600">Error: {combinedError}</div>;
  }


  // If data is loaded and no error, display the list
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">All Medicine Records</h1>

      {/* Display the list of medicine records */}
      {medicineRecords.length === 0 ? (
        // Show a message if there are no medicine records saved
        <p className="text-gray-600 text-center">No medicine records added yet. Add one from the "Add New Medicine Record" page.</p>
      ) : (
        // Map over the medicineRecords array to display each record
        <div className="space-y-4"> {/* Add space between medicine record items */}
          {medicineRecords.map((record) => {
            // Find the animal associated with this medicine record using MongoDB _id
            const animal = findAnimalById(record.animalId);

            return (
              // Card for each medicine record
              // Use the MongoDB _id as the key
              // record._id is an ObjectId object, convert to string for key
              <div key={record._id.toString()} className="bg-white shadow rounded-lg p-4 border border-gray-200">
                {/* Display Animal Info if found */}
                {animal ? (
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Animal: {animal.animalType || 'Unnamed Animal'} (Tag: {animal.tagNumber || 'N/A'})
                  </h2>
                ) : (
                  // Handle case where linked animal is not found (e.g., deleted animal)
                  <h2 className="text-lg font-semibold text-red-600 mb-2">Linked Animal Not Found (ID: {record.animalId})</h2>
                )}

                {/* Display MongoDB _id for debugging/verification */}
                 <p className="text-xs text-gray-500">ID: {record._id.toString()}</p>


                {/* Medicine Details */}
                <div className="text-sm text-gray-700 space-y-1">
                  <p><span className="font-semibold">Medicine:</span> {record.medicineName || 'N/A'}</p>
                  <p><span className="font-semibold">Dosage:</span> {record.dosage || 'N/A'}</p>
                  <p><span className="font-semibold">Date:</span> {record.administrationDate || 'N/A'}</p>
                  {record.administrationTime && ( // Only display time if it exists
                     <p><span className="font-semibold">Time:</span> {record.administrationTime}</p>
                  )}
                </div>

                {/* Notes */}
                {record.notes && (
                   <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-700">
                     <span className="font-semibold">Notes:</span> {record.notes}
                   </div>
                )}

                {/* Edit/Delete buttons for medicine records */}
                <div className="mt-4 flex justify-end space-x-3"> {/* Align buttons to the right */}
                   {/* Edit Medicine button - Pass MongoDB _id */}
                   <button
                     className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                     onClick={() => handleEditMedicine(record._id.toString())} // Pass the MongoDB _id as string
                   >
                     Edit
                   </button>
                   {/* Delete Medicine button - Pass MongoDB _id */}
                   <button
                     className="text-red-600 hover:text-red-800 font-medium text-sm"
                     onClick={() => handleDeleteMedicine(record._id.toString())} // Pass the MongoDB _id as string
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
