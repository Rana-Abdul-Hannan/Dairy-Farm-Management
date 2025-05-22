// src/app/feed/new/page.js
'use client'; // This page needs client-side features (State, Effects, API Calls)

import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useRouter } from 'next/navigation'; // Import useRouter for navigation after saving
// Removed: import { ObjectId } from 'mongodb'; // No longer needed on the client side


export default function AddNewFeedPage() {
  // State for form inputs
  const [selectedAnimalId, setSelectedAnimalId] = useState(''); // To link feed to an animal (will store MongoDB ObjectId string)
  const [feedType, setFeedType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [feedingDate, setFeedingDate] = useState('');
  const [feedingTime, setFeedingTime] = useState('');
  const [notes, setNotes] = useState('');

  // State to hold the list of animals fetched from the API (for the dropdown)
  const [animals, setAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true); // State for loading animals from API
  const [errorLoadingAnimals, setErrorLoadingAnimals] = useState(null); // State for error loading animals

  // State for loading and error feedback during API call to add feed
  const [addingFeed, setAddingFeed] = useState(false); // State for adding feed record
  const [errorAddingFeed, setErrorAddingFeed] = useState(null); // State for error adding feed
  const [successAddingFeed, setSuccessAddingFeed] = useState(false); // State for successful addition


  // Get the router instance (useful for redirecting after save)
  const router = useRouter();


  // useEffect to load animals from the API when the component mounts
  // We need animal data to populate the dropdown for linking feed records
  useEffect(() => {
    async function fetchAnimals() {
      setLoadingAnimals(true); // Start loading state for animals
      setErrorLoadingAnimals(null); // Clear previous errors

      try {
        // --- API Call to fetch animals ---
        // Assuming you have an API route for fetching animals at /api/animals
        const response = await fetch('/api/animals');

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
        setLoadingAnimals(false); // Stop loading state
      }
    }

    fetchAnimals(); // Call the async function to fetch animals
  }, []); // Empty dependency array means this runs once on mount

  // Function to handle form submission
  const handleSubmit = async (event) => { // Made function async to use await with fetch
    event.preventDefault(); // Prevent the default browser form submission (page refresh)

    // Basic validation: Ensure an animal is selected and required fields are filled
    if (!selectedAnimalId || !feedType || !quantity || !feedingDate) {
        alert("Please select an animal and fill in all required fields (Feed Type, Quantity, Date).");
        return; // Stop the submission if required fields are missing
    }

    // Gather feed data
    const newFeedRecordData = {
      // We no longer generate ID on the frontend; MongoDB will do it
      // Ensure animalId is stored as a string (MongoDB ObjectId string)
      animalId: selectedAnimalId,
      feedType: feedType,
      quantity: parseFloat(quantity), // Convert quantity to a number
      feedingDate: feedingDate,
      feedingTime: feedingTime,
      notes: notes,
    };

    setAddingFeed(true); // Start adding feed state
    setErrorAddingFeed(null); // Clear previous errors
    setSuccessAddingFeed(false); // Clear previous success

    try {
        // --- API Call to save feed record ---
        const response = await fetch('/api/feed', { // Use the /api/feed POST endpoint
            method: 'POST', // Use POST method
            headers: {
                'Content-Type': 'application/json', // Tell the server we're sending JSON
            },
            body: JSON.stringify(newFeedRecordData), // Send the feed data as a JSON string in the body
        });

        if (!response.ok) {
            // If the response is not OK (e.g., 400, 500 status), throw an error
            const errorData = await response.json(); // Try to read error message from response body
            throw new Error(errorData.message || 'Failed to add feed record');
        }

        // If the response is OK, the feed record was added successfully
        const result = await response.json(); // Parse the JSON response from the API
        console.log('Feed record added successfully:', result);

        setSuccessAddingFeed(true); // Set success state
        // Optional: Reset the form fields after successful submission
        setSelectedAnimalId('');
        setFeedType('');
        setQuantity('');
        setFeedingDate('');
        setFeedingTime('');
        setNotes('');

        // Optional: Provide feedback to the user (e.g., a toast notification)
        // alert('Feed record added successfully!'); // Using alert for simplicity

        // Optional: Navigate to the view feed page after successful submission
        // router.push('/feed'); // Uncomment this line when you update the view feed page

    } catch (err) {
        console.error("Error adding feed record:", err);
        setErrorAddingFeed(err.message || 'An unexpected error occurred.'); // Set error state
    } finally {
        setAddingFeed(false); // Stop adding feed state regardless of success or failure
    }
  };


  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Add New Feed Record</h1>

      {/* Loading, Error, and Success Messages for Adding Feed */}
      {addingFeed && <p className="text-center text-blue-600">Adding feed record...</p>}
      {errorAddingFeed && <p className="text-center text-red-600">Error: {errorAddingFeed}</p>}
      {successAddingFeed && <p className="text-center text-green-600">Feed record added successfully!</p>}


      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>

        {/* Select Animal */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="animalSelect">
            Select Animal
          </label>
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
              value={selectedAnimalId}
              onChange={(e) => setSelectedAnimalId(e.target.value)}
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
             value={feedType}
             onChange={(e) => setFeedType(e.target.value)}
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
             value={quantity}
             onChange={(e) => setQuantity(e.target.value)}
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
             value={feedingDate}
             onChange={(e) => setFeedingDate(e.target.value)}
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
             value={feedingTime}
             onChange={(e) => setFeedingTime(e.target.value)}
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
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>


        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={addingFeed} // Disable button while adding
          >
            {addingFeed ? 'Adding...' : 'Add Feed Record'} {/* Button text changes */}
          </button>
        </div>
      </form>
    </div>
  );
}
