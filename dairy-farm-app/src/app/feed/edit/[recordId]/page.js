// src/app/feed/edit/[recordId]/page.js
'use client'; // This page needs client-side features (State, Effects, Navigation, API Calls)

import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useRouter, useParams } from 'next/navigation'; // Import useRouter and useParams hook
// Removed: import { ObjectId } from 'mongodb'; // No longer needed on the client side for display


export default function EditFeedPage() {
  // Get the dynamic route parameters using the useParams hook
  const params = useParams();
  // Access the recordId (MongoDB _id string) from the params object
  const recordId = params.recordId;

  // State to hold the feed record's data for the form
  const [feedRecordData, setFeedRecordData] = useState({
    animalId: '', // Link to the animal ID (will store MongoDB ObjectId string)
    feedType: '',
    quantity: '', // Keep as string for input value initially
    feedingDate: '',
    feedingTime: '',
    notes: '',
  });

  // State to hold the list of animals fetched from the API (for the dropdown)
  const [animals, setAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true); // State for loading animals from API
  const [errorLoadingAnimals, setErrorLoadingAnimals] = useState(null); // State for error loading animals

  // State to indicate if data is loading (fetching) or saving (updating) or if an error occurred
  const [loadingFeed, setLoadingFeed] = useState(true); // Loading state for fetching feed data
  const [savingFeed, setSavingFeed] = useState(false); // Loading state for saving feed data
  const [error, setError] = useState(null); // General error state for fetch or save
  const [successSaving, setSuccessSaving] = useState(false); // State for successful saving


  // Get the router instance for navigation
  const router = useRouter();

  // Function to fetch the specific feed record data from the API
  const fetchFeedRecordData = async (id) => {
      setLoadingFeed(true); // Start loading state for fetching
      setError(null); // Clear previous errors

      try {
        // --- API Call to fetch the specific feed record data by ID ---
        const response = await fetch(`/api/feed/${id}`); // GET request to dynamic API route

        if (!response.ok) {
          // If the response is not OK, throw an error
          const errorData = await response.json(); // Try to read error message from response body
          throw new Error(errorData.message || `Failed to fetch feed record with ID ${id}`);
        }

        // If the response is OK, parse the JSON data
        const data = await response.json();

        // Set the state with the fetched feed record data
        // Ensure all expected fields are present
         setFeedRecordData({
            animalId: data.animalId || '', // Initialize animalId from loaded data (MongoDB ObjectId string)
            feedType: data.feedType || '',
            quantity: data.quantity || '', // Keep as is from API for input
            feedingDate: data.feedingDate || '', // Date should be inYYYY-MM-DD format
            feedingTime: data.feedingTime || '', // Time should be in HH:MM format
            notes: data.notes || '',
         });

        setLoadingFeed(false); // Data loaded, stop loading state

      } catch (err) {
        console.error("Error fetching feed record data:", err);
        setError(err.message || 'An unexpected error occurred while fetching data.'); // Set error state
        setLoadingFeed(false); // Stop loading state on error
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
       console.error("Error fetching animals for feed form:", err);
       setErrorLoadingAnimals(err.message || 'An unexpected error occurred while loading animals.'); // Set error state
     } finally {
       setLoadingAnimals(false); // Stop loading state regardless of success or failure
     }
   };


  // useEffect to load the feed record and animals data when the page component mounts
  useEffect(() => {
    // Fetch feed record data only if recordId is available
    if (recordId) {
      fetchFeedRecordData(recordId);
    } else {
       setError("Feed record ID not provided.");
       setLoadingFeed(false);
    }
    // Fetch animals data regardless of recordId
    fetchAnimals();

  }, [recordId]); // Re-run this effect if recordId changes (though it won't for this page)

  // Function to handle input changes in the form
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFeedRecordData({
      ...feedRecordData, // Spread existing data
      [name]: value, // Update the specific field by its name
    });
  };

  // Function to handle the form submission (saving edited data)
  const handleSubmit = async (event) => { // Made function async
    event.preventDefault(); // Prevent default form submission

     // Basic validation: Ensure an animal is selected and required fields are filled
    if (!feedRecordData.animalId || !feedRecordData.feedType || !feedRecordData.quantity || !feedRecordData.feedingDate) {
        alert("Please select an animal and fill in all required fields (Feed Type, Quantity, Date).");
        return; // Stop the submission if required fields are missing
    }

    setSavingFeed(true); // Start saving state
    setError(null); // Clear previous errors
    setSuccessSaving(false); // Clear previous success

    // Prepare updated data to send to the API
    const updatedFeedRecordData = {
        ...feedRecordData, // Spread the current state
        // Convert quantity to a number before sending to the API
        quantity: parseFloat(feedRecordData.quantity),
         // Ensure animalId is stored as a string (MongoDB ObjectId string)
        animalId: feedRecordData.animalId,
         // Do NOT include the _id in the request body for PUT; it's in the URL
    };

    try {
        // --- API Call to update data ---
        const response = await fetch(`/api/feed/${recordId}`, { // Use dynamic API route with recordId
            method: 'PUT', // Use PUT method for updates
            headers: {
                'Content-Type': 'application/json', // Tell the server we're sending JSON
            },
            body: JSON.stringify(updatedFeedRecordData), // Send the updated feed data as a JSON string
        });

        if (!response.ok) {
            // If the response is not OK, throw an error
            const errorData = await response.json(); // Try to read error message from response body
            throw new Error(errorData.message || `Failed to update feed record with ID ${recordId}`);
        }

        // If the response is OK, the feed record was updated successfully
        const result = await response.json(); // Parse the JSON response (optional)
        console.log('Feed record updated successfully:', result);

        setSuccessSaving(true); // Set success state
        // Optional: Provide feedback to the user (e.g., a toast notification)
        // alert('Feed record updated successfully!'); // Using alert for simplicity

        // Navigate back to the view feed records page after saving
        router.push('/feed');

    } catch (err) {
        console.error("Error updating feed record:", err);
        setError(err.message || 'An unexpected error occurred while saving.'); // Set error state
    } finally {
        setSavingFeed(false); // Stop saving state regardless of success or failure
    }
  };


  // Show loading state or error message for FETCHING data
  // Consider showing both loading states if needed
  if (loadingFeed || loadingAnimals) {
    return <div className="text-center text-gray-600">Loading data...</div>;
  }

  // Show error message if fetching failed
  if (error && !loadingFeed && !loadingAnimals) { // Only show error if not currently loading either feed or animals
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  // If data is loaded and no error, display the main container div
  // The form and the "not found" message are conditionally rendered INSIDE this container.
  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Edit Feed Record (ID: {recordId})</h1>

      {/* Loading, Error, and Success Messages for SAVING */}
      {savingFeed && <p className="text-center text-blue-600">Saving changes...</p>}
      {/* We handle fetch errors above, so this is primarily for save errors */}
      {error && !savingFeed && <p className="text-center text-red-600">Error: {error}</p>}
      {successSaving && !savingFeed && <p className="text-center text-green-600">Changes saved successfully!</p>}


      {/* The Edit Form - Conditionally render the form */}
      {/* Render the form if not loading feed data and no general error */}
      {!loadingFeed && !error && (
           <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>

             {/* Select Animal */}
             <div className="mb-4">
               <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="animalSelect">
                 Select Animal
               </label>
                {/* Display animal select dropdown */}
                {loadingAnimals ? (
                   <p className="text-gray-600">Loading animals...</p>
                ) : errorLoadingAnimals ? ( // Show error if loading animals failed
                   <p className="text-red-600">Error loading animals: {errorLoadingAnimals}</p>
                ) : animals.length === 0 ? (
                   <p className="text-red-600">No animals available. Add animals first.</p>
                ) : (
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="animalSelect"
                    name="animalId"
                    value={feedRecordData.animalId} // Connect to state
                    onChange={handleInputChange} // Use the generic handler
                    required // Make animal selection required
                  >
                    <option value="">-- Select an Animal --</option>
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

             {/* Feed Type */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="feedType">
                  Feed Type
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="feedType"
                  type="text"
                  placeholder="e.g. Hay, Grain"
                  name="feedType"
                  value={feedRecordData.feedType} // Connect to state
                  onChange={handleInputChange} // Use the generic handler
                  required // Make feed type required
                />
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
                  Quantity (kg or other unit)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="quantity"
                  type="number" // Use number type
                  placeholder="e.g. 5"
                  name="quantity"
                  value={feedRecordData.quantity} // Connect to state
                  onChange={handleInputChange} // Use the generic handler
                  required // Make quantity required
                  step="0.01" // Allow decimal values
                />
              </div>

              {/* Feeding Date */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="feedingDate">
                  Date
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="feedingDate"
                  type="date" // Use date type
                  name="feedingDate"
                  value={feedRecordData.feedingDate} // Connect to state
                  onChange={handleInputChange} // Use the generic handler
                  required // Make date required
                />
              </div>

               {/* Feeding Time (Optional but useful) */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="feedingTime">
                  Time (Optional)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="feedingTime"
                  type="time" // Use time type
                  name="feedingTime"
                  value={feedRecordData.feedingTime} // Connect to state
                  onChange={handleInputChange} // Use the generic handler
                />
              </div>


             {/* Notes */}
             <div className="mb-6">
               <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                 Notes (Optional)
               </label>
               <textarea
                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                 id="notes"
                 placeholder="e.g. Animal ate well"
                 name="notes"
                 rows="3"
                 value={feedRecordData.notes} // Connect to state
                 onChange={handleInputChange} // Use the generic handler
               ></textarea>
             </div>


             {/* Submit Button */}
             <div className="flex items-center justify-between">
               <button
                 className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                 type="submit"
                 disabled={savingFeed} // Disable button while saving
               >
                 {savingFeed ? 'Saving...' : 'Save Changes'} {/* Button text changes */}
               </button>
                {/* Optional: Cancel button */}
                <button
                  type="button" // Important: use type="button" so it doesn't submit the form
                  className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                  onClick={() => router.push('/feed')} // Navigate back to view page
                >
                  Cancel
                </button>
             </div>
           </form>
      )}
      {/* Message if record not found after loading or if there was a fetch error but form data is empty */}
       {/* We show this if not loading, no error, but feedRecordData is still in its initial empty state */}
       {!loadingFeed && !error && feedRecordData.feedType === '' && (
           <p className="text-center text-red-600">Feed record with ID {recordId} not found or could not be loaded.</p>
       )}
    </div>
  );
}
