// src/app/animals/new/page.js
'use client'; // Add this line at the very top

import { useState } from 'react'; // Import useState
import { useRouter } from 'next/navigation'; // Import useRouter for navigation (optional, but good for future redirects)


export default function AddNewAnimalPage() {
  // Declare state variables for each form field, including breed, sellable, and ownerName
  const [animalType, setAnimalType] = useState('');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [dob, setDob] = useState('');
  const [tagNumber, setTagNumber] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [ownership, setOwnership] = useState('');
  const [isSellable, setIsSellable] = useState(false); // State for sellable status (boolean)
  const [ownerName, setOwnerName] = useState(''); // Added state for owner name

  // State for loading and error feedback during API call
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);


  // Get the router instance (optional for now, but useful later)
  const router = useRouter();

  // Function to handle form submission
  const handleSubmit = async (event) => { // Made function async to use await with fetch
    event.preventDefault(); // Prevent the default browser form submission (page refresh)

    // Basic validation: Ensure required fields are filled (add more as needed)
    if (!animalType || !weight || !dob || !tagNumber || !ownership) {
        alert("Please fill in all required fields (Animal Type, Weight, DOB, Tag Number, Ownership).");
        return; // Stop the submission if required fields are missing
    }

    // Gather all the data from the state variables
    const newAnimalData = {
      // We no longer generate ID on the frontend; MongoDB will do it
      animalType: animalType,
      breed: breed,
      weight: parseFloat(weight), // Convert weight to a number
      dob: dob,
      tagNumber: tagNumber,
      extraInfo: extraInfo,
      ownership: ownership,
      // Include isSellable only if ownership is 'farm'
      isSellable: ownership === 'farm' ? isSellable : false,
      // Include ownerName only if ownership is 'other'
      ownerName: ownership === 'other' ? ownerName : '',
    };

    setLoading(true); // Start loading state
    setError(null); // Clear previous errors
    setSuccess(false); // Clear previous success

    try {
        // --- API Call to save data ---
        const response = await fetch('/api/animals', {
            method: 'POST', // Use POST method
            headers: {
                'Content-Type': 'application/json', // Tell the server we're sending JSON
            },
            body: JSON.stringify(newAnimalData), // Send the animal data as a JSON string in the body
        });

        if (!response.ok) {
            // If the response is not OK (e.g., 400, 500 status), throw an error
            const errorData = await response.json(); // Try to read error message from response body
            throw new Error(errorData.message || 'Failed to add animal');
        }

        // If the response is OK, the animal was added successfully
        const result = await response.json(); // Parse the JSON response from the API
        console.log('Animal added successfully:', result);

        setSuccess(true); // Set success state
        // Optional: Reset the form fields after successful submission
        setAnimalType('');
        setBreed('');
        setWeight('');
        setDob('');
        setTagNumber('');
        setExtraInfo('');
        setOwnership('');
        setIsSellable(false);
        setOwnerName('');

        // Optional: Navigate to the view page after successful submission
        // router.push('/animals'); // Uncomment this line when you update the view page

    } catch (err) {
        console.error("Error adding animal:", err);
        setError(err.message || 'An unexpected error occurred.'); // Set error state
    } finally {
        setLoading(false); // Stop loading state regardless of success or failure
    }

    // --- End API Call Logic ---
  };

  // Handler for the sellable checkbox
  const handleSellableChange = (event) => {
    setIsSellable(event.target.checked); // Checkboxes use 'checked' instead of 'value'
  };

   // Handler for the owner name input
   const handleOwnerNameChange = (event) => {
     setOwnerName(event.target.value);
   };


  return (
    // Using some basic Tailwind classes for layout and appearance
    <div className="container mx-auto p-4 max-w-md"> {/* Added max-w-md to limit form width */}
      <h1 className="text-2xl font-bold mb-6 text-center">Add New Animal</h1> {/* Centered heading */}

      {/* Loading, Error, and Success Messages */}
      {loading && <p className="text-center text-blue-600">Adding animal...</p>}
      {error && <p className="text-center text-red-600">Error: {error}</p>}
      {success && <p className="text-center text-green-600">Animal added successfully!</p>}


      {/* The Form Element - Added onSubmit={handleSubmit} */}
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}> {/* Basic form styling */}
        {/* Animal Type */}
        <div className="mb-4"> {/* Margin bottom for spacing */}
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="animalType">
            Animal Type
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="animalType"
            type="text"
            placeholder="e.g. Cow, Calf"
            name="animalType" // Important for form data
            value={animalType} // --- Connect value to state ---
            onChange={(e) => setAnimalType(e.target.value)} // --- Update state on change ---
            required // Make required
          />
        </div>

         {/* Breed */}
         <div className="mb-4"> {/* Added input field for Breed */}
           <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="breed">
             Breed
           </label>
           <input
             className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
             id="breed"
             type="text"
             placeholder="e.g. Holstein, Jersey"
             name="breed" // Important for form data
             value={breed} // Connect value to state
             onChange={(e) => setBreed(e.target.value)} // Update state on change
           />
         </div>


        {/* Weight */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="weight">
            Weight (kg)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="weight"
            type="number" // Use type="number" for numerical input
            placeholder="e.g. 500"
            name="weight"
            value={weight} // Connect value to state
            onChange={(e) => setWeight(e.target.value)} // Update state on change
            required // Make required
          />
        </div>

        {/* Date of Birth */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dob">
            Date of Birth
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="dob"
            type="date" // Use type="date" for a calendar picker
            name="dob"
            value={dob} // Connect value to state
            onChange={(e) => setDob(e.target.value)} // Update state on change
            required // Make required
          />
        </div>

        {/* Tag Number */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tagNumber">
            Tag Number
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="tagNumber"
            type="text"
            placeholder="e.g. 123ABC"
            name="tagNumber"
            value={tagNumber} // Connect value to state
            onChange={(e) => setTagNumber(e.target.value)} // Update state on change
            required // Make required
          />
        </div>

        {/* Extra Info */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="extraInfo">
            Extra Info (Color, Identification, etc.)
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="extraInfo"
            placeholder="e.g. Brown patches, scar on left leg"
            name="extraInfo"
            rows="3" // Give it a bit more height
            value={extraInfo} // Connect value to state
            onChange={(e) => setExtraInfo(e.target.value)} // Update state on change
          ></textarea>
        </div>

        {/* Ownership Status */}
        <div className="mb-4"> {/* Changed mb-6 to mb-4 for spacing before potential sellable checkbox */}
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ownership">
            Ownership
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="ownership"
            name="ownership"
            value={ownership} // Connect value to state
            onChange={(e) => {
              setOwnership(e.target.value);
              // Reset sellable and ownerName if ownership changes
              setIsSellable(false);
              setOwnerName('');
            }} // Update state on change and reset related fields
            required // Make required
          >
            <option value="">Select Ownership</option> {/* Default option */}
            <option value="farm">Farm Owned</option>
            <option value="other">Not Farm Owned</option>
          </select>
        </div>

        {/* Sellable Status (conditionally displayed) */}
        {ownership === 'farm' && ( // Only show this div if ownership is 'farm'
          <div className="mb-6 flex items-center"> {/* Flex for checkbox and label alignment */}
            <input
              className="mr-2 leading-tight" // Margin right for spacing
              id="isSellable"
              type="checkbox" // Use type="checkbox"
              name="isSellable"
              checked={isSellable} // Checkboxes use 'checked' instead of 'value'
              onChange={handleSellableChange} // Use the dedicated handler
            />
            <label className="block text-gray-700 text-sm font-bold" htmlFor="isSellable">
              Available for Sale
            </label>
          </div>
        )}

        {/* Owner Name (conditionally displayed) */}
        {ownership === 'other' && ( // Only show this div if ownership is 'other'
          <div className="mb-6"> {/* Margin bottom for spacing */}
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ownerName">
              Owner Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="ownerName"
              type="text"
              placeholder="e.g. John Doe"
              name="ownerName" // Important for form data
              value={ownerName} // Connect value to state
              onChange={handleOwnerNameChange} // Use the dedicated handler
              required={ownership === 'other'} // Make required only if ownership is 'other'
            />
          </div>
        )}


        {/* Submit Button */}
        <div className="flex items-center justify-between"> {/* Flex container to align button */}
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit" // This is the button that submits the form
            disabled={loading} // Disable button while loading
          >
            {loading ? 'Adding...' : 'Add Animal'} {/* Button text changes based on loading state */}
          </button>
        </div>
      </form>
    </div>
  );
}
