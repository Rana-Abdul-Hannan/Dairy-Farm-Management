// src/app/income/edit/[recordId]/page.js
'use client'; // This page needs client-side features (State, Effects, Navigation, API Calls)

import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useRouter, useParams } from 'next/navigation'; // Import useRouter and useParams hook
// Removed: import { ObjectId } from 'mongodb'; // No longer needed on the client side for display


export default function EditIncomePage() {
  // Get the dynamic route parameters using the useParams hook
  const params = useParams();
  // Access the recordId (MongoDB _id string) from the params object
  const recordId = params.recordId;

  // State to hold the income record's data for the form
  const [incomeRecordData, setIncomeRecordData] = useState({
    date: '',
    description: '',
    amount: '', // Use string for input value initially
    category: '',
    animalId: '', // Optional: link to an animal (will store MongoDB ObjectId string)
    notes: '',
  });

  // State to hold the list of animals fetched from the API (for the dropdown)
  const [animals, setAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true); // State for loading animals from API
  const [errorLoadingAnimals, setErrorLoadingAnimals] = useState(null); // State for error loading animals

  // State to indicate if data is loading (fetching) or saving (updating) or if an error occurred
  const [loadingIncome, setLoadingIncome] = useState(true); // Loading state for fetching income data
  const [savingIncome, setSavingIncome] = useState(false); // Loading state for saving income data
  const [error, setError] = useState(null); // General error state for fetch or save
  const [successSaving, setSuccessSaving] = useState(false); // State for successful saving


  // Get the router instance for navigation
  const router = useRouter();

  // Function to fetch the specific income record data from the API
  const fetchIncomeRecordData = async (id) => {
      setLoadingIncome(true); // Start loading state for fetching
      setError(null); // Clear previous errors

      try {
        // --- API Call to fetch the specific income record data by ID ---
        const response = await fetch(`/api/income/${id}`); // GET request to dynamic API route

        if (!response.ok) {
          // If the response is not OK, throw an error
          const errorData = await response.json(); // Try to read error message from response body
          throw new Error(errorData.message || `Failed to fetch income record with ID ${id}`);
        }

        // If the response is OK, parse the JSON data
        const data = await response.json();

        // Set the state with the fetched income record data
        // Ensure all expected fields are present
         setIncomeRecordData({
            date: data.date || '',
            description: data.description || '',
            amount: data.amount || '', // Keep as is from API for input (number or string)
            category: data.category || '',
            animalId: data.animalId || '', // Initialize animalId from loaded data (MongoDB ObjectId string or null)
            notes: data.notes || '',
         });

        setLoadingIncome(false); // Data loaded, stop loading state

      } catch (err) {
        console.error("Error fetching income record data:", err);
        setError(err.message || 'An unexpected error occurred while fetching data.'); // Set error state
        setLoadingIncome(false); // Stop loading state on error
      }
  };

   // Function to fetch animal data from the API (for the dropdown)
   const fetchAnimals = async () => {
     setLoadingAnimals(true); // Start loading state for animals
     setErrorLoadingAnimals(null); // Clear previous errors

     try {
       // --- API Call to fetch animals ---
       const response = await fetch('/api/animals'); // Make GET request to the API route

       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Failed to fetch animals for dropdown');
       }

       const data = await response.json();
       setAnimals(data); // Update state with fetched animals

     } catch (err) {
       console.error("Error fetching animals for income form:", err);
       setErrorLoadingAnimals(err.message || 'An unexpected error occurred while loading animals.'); // Set error state
     } finally {
       setLoadingAnimals(false); // Stop loading state regardless of success or failure
     }
   };


  // useEffect to load the income record and animals data when the page component mounts
  useEffect(() => {
    // Fetch income record data only if recordId is available
    if (recordId) {
      fetchIncomeRecordData(recordId);
    } else {
       setError("Income record ID not provided.");
       setLoadingIncome(false);
    }
    // Fetch animals data regardless of recordId
    fetchAnimals();

  }, [recordId]); // Re-run this effect if recordId changes (though it won't for this page)

  // Function to handle input changes in the form
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setIncomeRecordData({
      ...incomeRecordData, // Spread existing data
      [name]: value, // Update the specific field by its name
    });
  };

  // Function to handle the form submission (saving edited data)
  const handleSubmit = async (event) => { // Made function async
    event.preventDefault(); // Prevent default form submission

     // Basic validation: Ensure required fields are filled
    if (!incomeRecordData.date || !incomeRecordData.description || !incomeRecordData.amount || !incomeRecordData.category) {
        alert("Please fill in all required fields (Date, Description, Amount, Category).");
        return; // Stop the submission if required fields are missing
    }

    setSavingIncome(true); // Start saving state
    setError(null); // Clear previous errors
    setSuccessSaving(false); // Clear previous success

    // Prepare updated data to send to the API
    const updatedIncomeRecordData = {
        ...incomeRecordData, // Spread the current state
        // Convert amount to a number before sending to the API
        amount: parseFloat(incomeRecordData.amount),
         // Ensure animalId is stored as a string (MongoDB ObjectId string) or null if none selected
        animalId: incomeRecordData.animalId || null,
         // Do NOT include the _id in the request body for PUT; it's in the URL
    };

    try {
        // --- API Call to update data ---
        const response = await fetch(`/api/income/${recordId}`, { // Use dynamic API route with recordId
            method: 'PUT', // Use PUT method for updates
            headers: {
                'Content-Type': 'application/json', // Tell the server we're sending JSON
            },
            body: JSON.stringify(updatedIncomeRecordData), // Send the updated income data as a JSON string
        });

        if (!response.ok) {
            // If the response is not OK, throw an error
            const errorData = await response.json(); // Try to read error message from response body
            throw new Error(errorData.message || `Failed to update income record with ID ${recordId}`);
        }

        // If the response is OK, the income record was updated successfully
        const result = await response.json(); // Parse the JSON response (optional)
        console.log('Income record updated successfully:', result);

        setSuccessSaving(true); // Set success state
        // Optional: Provide feedback to the user (e.g., a toast notification)
        // alert('Income record updated successfully!'); // Using alert for simplicity

        // Navigate back to the view income records page after saving
        router.push('/income');

    } catch (err) {
        console.error("Error updating income record:", err);
        setError(err.message || 'An unexpected error occurred while saving.'); // Set error state
    } finally {
        setSavingIncome(false); // Stop saving state regardless of success or failure
    }
  };


  // Show loading state or error message if necessary
  // Consider showing both loading states if needed
  if (loadingIncome || loadingAnimals) {
    return <div className="text-center text-gray-600">Loading data...</div>;
  }

  if (error && !loadingIncome && !loadingAnimals) { // Only show error if not currently loading either income or animals
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  // If data is loaded and no error, display the main container div
  // The form and the "not found" message are conditionally rendered INSIDE this container.
  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Edit Income Record (ID: {recordId})</h1>

      {/* Loading, Error, and Success Messages for SAVING */}
      {savingIncome && <p className="text-center text-blue-600">Saving changes...</p>}
      {/* We handle fetch errors above, so this is primarily for save errors */}
      {error && !savingIncome && <p className="text-center text-red-600">Error: {error}</p>}
      {successSaving && !savingIncome && <p className="text-center text-green-600">Changes saved successfully!</p>}


      {/* The Edit Form - Conditionally render the form */}
      {/* Render the form if not loading income data and no general error */}
      {!loadingIncome && !error && (
           <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>

             {/* Date */}
             <div className="mb-4">
               <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                 Date
               </label>
               <input
                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                 id="date"
                 type="date" // Use date type
                 name="date"
                 value={incomeRecordData.date} // Connect to state
                 onChange={handleInputChange} // Use the generic handler
                 required // Make date required
               />
             </div>

             {/* Description */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="description"
                  type="text"
                  placeholder="e.g. Milk sales, Calf sale"
                  name="description"
                  value={incomeRecordData.description} // Connect to state
                  onChange={handleInputChange} // Use the generic handler
                  required // Make description required
                />
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                  Amount ($) {/* Or your local currency */}
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="amount"
                  type="number" // Use number type for amount
                  placeholder="e.g. 500.00"
                  name="amount"
                  value={incomeRecordData.amount} // Connect to state
                  onChange={handleInputChange} // Use the generic handler
                  step="0.01" // Allow decimal values
                  required // Make amount required
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                  Category
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="category"
                  name="category"
                  value={incomeRecordData.category} // Connect to state
                  onChange={handleInputChange} // Use the generic handler
                  required // Make category required
                >
                  <option value="">-- Select a Category --</option>
                  <option value="milk-sales">Milk Sales</option>
                  <option value="animal-sales">Animal Sales</option>
                  <option value="other">Other</option>
                </select>
              </div>

             {/* Select Animal (Optional) */}
             <div className="mb-4">
               <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="animalSelect">
                 Related Animal (Optional)
               </label>
                 {/* Display animal select dropdown */}
                 {loadingAnimals ? (
                    <p className="text-gray-600">Loading animals...</p>
                 ) : errorLoadingAnimals ? ( // Show error if loading animals failed
                    <p className="text-red-600">Error loading animals: {errorLoadingAnimals}</p>
                 ) : animals.length === 0 ? (
                    <p className="text-gray-600">No animals available to link. Add animals first.</p>
                 ) : (
                   <select
                     className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                     id="animalSelect"
                     name="animalId"
                     value={incomeRecordData.animalId} // Connect to state
                     onChange={handleInputChange} // Use the generic handler
                   >
                     <option value="">-- Select an Animal (Optional) --</option>
                     {/* Map over the animals array to create options */}
                     {/* Use animal._id.toString() for the value as it's the MongoDB ID */}
                     {animals.map(animal => (
                       <option key={animal._id.toString()} value={animal._id.toString()}>
                         {animal.animalType || 'Unnamed Animal'} (Tag: {animal.tagNumber || 'N/A'})
                       </option>
                     ))}
                   </select>
                 )}
             </div>


             {/* Notes */}
             <div className="mb-6">
               <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                 Notes (Optional)
               </label>
               <textarea
                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                 id="notes"
                 placeholder="e.g. Sold to local buyer"
                 name="notes"
                 rows="3"
                 value={incomeRecordData.notes} // Connect to state
                 onChange={handleInputChange} // Use the generic handler
               ></textarea>
             </div>


             {/* Submit Button */}
             <div className="flex items-center justify-between">
               <button
                 className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                 type="submit"
                 disabled={savingIncome} // Disable button while saving
               >
                 {savingIncome ? 'Saving...' : 'Save Changes'} {/* Button text changes */}
               </button>
                {/* Optional: Cancel button */}
                <button
                  type="button" // Important: use type="button" so it doesn't submit the form
                  className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                  onClick={() => router.push('/income')} // Navigate back to view page
                >
                  Cancel
                </button>
             </div>
           </form>
      )}
      {/* Message if record not found after loading or if there was a fetch error but form data is empty */}
       {/* We show this if not loading, no error, but incomeRecordData is still in its initial empty state */}
       {!loadingIncome && !error && incomeRecordData.description === '' && (
           <p className="text-center text-red-600">Income record with ID {recordId} not found or could not be loaded.</p>
       )}
    </div>
  );
}
