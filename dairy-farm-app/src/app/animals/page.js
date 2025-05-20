// src/app/animals/page.js
'use client'; // This page needs client-side features (State, Effects, Navigation)

import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useRouter } from 'next/navigation'; // Import useRouter hook for navigation
// Removed: import { ObjectId } from 'mongodb'; // No longer needed on the client side


export default function ViewAnimalsPage() {
  // State to hold the list of animals fetched from the API
  const [animals, setAnimals] = useState([]);

  // State for loading and error feedback during API call
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the router instance for navigation
  const router = useRouter();

  // Function to fetch animal data from the API
  // Moved fetch logic into a function so it can be called again after deletion
  const fetchAnimals = async () => {
    setLoading(true); // Start loading state
    setError(null); // Clear previous errors

    try {
      // --- API Call to fetch data ---
      const response = await fetch('/api/animals'); // Make GET request to the API route

      if (!response.ok) {
        // If the response is not OK, throw an error
        const errorData = await response.json(); // Try to read error message from response body
        throw new Error(errorData.message || 'Failed to fetch animals');
      }

      // If the response is OK, parse the JSON data
      const data = await response.json();
      setAnimals(data); // Update state with fetched animals

    } catch (err) {
      console.error("Error fetching animals:", err);
      setError(err.message || 'An unexpected error occurred.'); // Set error state
    } finally {
      setLoading(false); // Stop loading state regardless of success or failure
    }
  };


  // useEffect to fetch animal data from the API when the component loads
  useEffect(() => {
    fetchAnimals(); // Call the async function to fetch data
  }, []); // The empty dependency array [] means this effect runs only once after the initial render

  // Function to handle deleting an animal
  const handleDeleteAnimal = async (animalId) => { // Made function async
    console.log(`Attempting to delete animal with ID: ${animalId}`);

    // Optional: Add a confirmation dialog before deleting
    const confirmDelete = confirm("Are you sure you want to delete this animal record?");
    if (!confirmDelete) {
        console.log("Deletion cancelled by user.");
        return; // Stop if user cancels
    }


    setLoading(true); // Start loading state (can show a loading indicator over the list)
    setError(null); // Clear previous errors

    try {
        // --- API Call to delete data ---
        const response = await fetch(`/api/animals/${animalId}`, { // Use dynamic API route with animalId
            method: 'DELETE', // Use DELETE method
            // No body needed for DELETE requests
        });

        if (!response.ok) {
            // If the response is not OK, throw an error
            const errorData = await response.json(); // Try to read error message from response body
            throw new Error(errorData.message || 'Failed to delete animal');
        }

        // If the response is OK, the animal was deleted successfully
        const result = await response.json(); // Parse the JSON response (optional, but good practice)
        console.log('Animal deleted successfully:', result);

        // --- Update UI by refetching the list ---
        // Instead of manually filtering the state (which can be complex with async ops),
        // it's simpler and more reliable to refetch the entire list from the API.
        fetchAnimals(); // Call the fetch function again to get the updated list

    } catch (err) {
        console.error("Error deleting animal:", err);
        setError(err.message || 'An unexpected error occurred during deletion.'); // Set error state
        setLoading(false); // Stop loading on error
    }
    // Note: setLoading(false) for success is handled by fetchAnimals()
  };

  // Function to handle clicking the Edit button (will be updated later to use API)
  // Now passing the MongoDB _id
  const handleEditAnimal = (animalId) => {
    console.log(`Edit button clicked for animal with ID: ${animalId}`);
    // Navigate to the edit page, including the animalId (MongoDB _id) in the URL
    // We use the dynamic route /animals/edit/[animalId]
    router.push(`/animals/edit/${animalId}`);
    // TODO: Update the edit page to fetch data by MongoDB _id and use PUT for saving
  };

  // Function to handle clicking the Buy button (still uses owner name from fetched data)
  const handleBuyAnimal = (ownerName) => {
    // Show an alert with the contact information
    // NOTE: Using alert() is generally discouraged in production apps for better UI/UX.
    // A modal or dedicated contact form would be better in a real application.
    alert(`Contact: ${ownerName || 'Owner name not available'}`);
  };


  // Show loading state or error message if necessary
  if (loading) {
    return <div className="text-center text-gray-600">Loading animals...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  // If data is loaded and no error, display the list
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">All Animals</h1>

      {/* Display the list of animals */}
      {animals.length === 0 ? (
        // Show a message if there are no animals saved
        <p className="text-gray-600 text-center">No animals added yet. Add one from the "Add Animal" page.</p>
      ) : (
        // Map over the animals array to display each animal as a card
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Responsive grid layout */}
          {animals.map((animal) => (
            // Card for each animal
            // Use the MongoDB _id as the key
            // animal._id is an ObjectId object, convert to string for key
            <div key={animal._id.toString()} className="bg-white shadow-md rounded-lg p-6 border border-gray-200"> {/* Card styling */}
              {/* Animal Type/Name - Styled to look like a title */}
              <h2 className="text-xl font-bold text-gray-800 mb-2">{animal.animalType || 'Unnamed Animal'}</h2>

              {/* Animal Details */}
              <div className="text-sm text-gray-700 space-y-1"> {/* Spacing for detail lines */}
                <p><span className="font-semibold">Breed:</span> {animal.breed || 'N/A'}</p>
                {/* Display MongoDB _id for debugging/verification */}
                 <p className="text-xs text-gray-500">ID: {animal._id.toString()}</p>
                <p><span className="font-semibold">Tag #:</span> {animal.tagNumber || 'N/A'}</p>
                <p><span className="font-semibold">Weight:</span> {animal.weight ? `${animal.weight} kg` : 'N/A'}</p>
                <p><span className="font-semibold">DOB:</span> {animal.dob || 'N/A'}</p>
                <p><span className="font-semibold">Ownership:</span> {animal.ownership || 'N/A'}</p>
                 {/* Display Sellable Status */}
                 {animal.ownership === 'farm' && ( // Only display if farm owned
                    <p><span className="font-semibold">Sellable:</span> {animal.isSellable ? 'Yes' : 'No'}</p>
                 )}
                 {/* Display Owner Name */}
                 {animal.ownership === 'other' && ( // Only display if not farm owned
                    <p><span className="font-semibold">Owner:</span> {animal.ownerName || 'N/A'}</p>
                 )}
              </div>

              {/* Buttons */}
              <div className="mt-4 flex justify-end space-x-3"> {/* Align buttons to the right */}
                 {/* Edit button - Pass MongoDB _id */}
                 <button
                   className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                   onClick={() => handleEditAnimal(animal._id.toString())} // Pass the MongoDB _id as string
                 >
                   Edit
                 </button>

                 {/* Buy button (conditionally displayed) */}
                 {animal.ownership === 'other' && animal.ownerName && ( // Only show if not farm owned AND owner name exists
                    <button
                      className="text-green-600 hover:text-green-800 font-medium text-sm"
                      onClick={() => handleBuyAnimal(animal.ownerName)} // Call the buy handler with owner name
                    >
                      Buy
                    </button>
                 )}

                 {/* Delete button - Pass MongoDB _id */}
                 <button
                   className="text-red-600 hover:text-red-800 font-medium text-sm"
                   onClick={() => handleDeleteAnimal(animal._id.toString())} // Pass the MongoDB _id as string
                 >
                   Delete
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
