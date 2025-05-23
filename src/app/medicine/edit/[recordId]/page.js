// src/app/medicine/edit/[recordId]/page.js
'use client'; // This page needs client-side features (State, Effects, Navigation, API Calls)

import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useRouter, useParams } from 'next/navigation'; // Import useRouter and useParams hook
// Removed: import { ObjectId } from 'mongodb'; // No longer needed on the client side for display


export default function EditMedicinePage() {
  // Get the dynamic route parameters using the useParams hook
  const params = useParams();
  // Access the recordId (MongoDB _id string) from the params object
  const recordId = params.recordId;

  // State to hold the feed record's data for the form
  const [medicineRecordData, setMedicineRecordData] = useState({
    animalId: '', // Link to the animal ID (will store MongoDB ObjectId string)
    medicineName: '',
    dosage: '',
    administrationDate: '',
    administrationTime: '',
    notes: '',
  });

  // State to hold the list of animals fetched from the API (for the dropdown)
  const [animals, setAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true); // State for loading animals from API
  const [errorLoadingAnimals, setErrorLoadingAnimals] = useState(null); // State for error loading animals

  // State to indicate if data is loading (fetching) or saving (updating) or if an error occurred
  const [loadingMedicine, setLoadingMedicine] = useState(true); // Loading state for fetching feed data
  const [savingMedicine, setSavingMedicine] = useState(false); // Loading state for saving feed data
  const [error, setError] = useState(null); // General error state for fetch or save
  const [successSaving, setSuccessSaving] = useState(false); // State for successful saving


  // Get the router instance for navigation
  const router = useRouter();

  // Function to fetch the specific medicine record data from the API
  const fetchMedicineRecordData = async (id) => {
      setLoadingMedicine(true); // Start loading state for fetching
      setError(null); // Clear previous errors

      try {
        // --- API Call to fetch the specific medicine record data by ID ---
        const response = await fetch(`/api/medicine/${id}`); // GET request to dynamic API route

        if (!response.ok) {
          // If the response is not OK, throw an error
          const errorData = await response.json(); // Try to read error message from response body
          throw new Error(errorData.message || `Failed to fetch medicine record with ID ${id}`);
        }

        // If the response is OK, parse the JSON data
        const data = await response.json();

        // Set the state with the fetched medicine record data
        // Ensure all expected fields are present
         setMedicineRecordData({
            animalId: data.animalId || '', // Initialize animalId from loaded data (MongoDB ObjectId string)
            medicineName: data.medicineName || '',
            dosage: data.dosage || '', // Keep as is from API for input
            administrationDate: data.administrationDate || '', // Date should be inYYYY-MM-DD format
            administrationTime: data.administrationTime || '', // Time should be in HH:MM format
            notes: data.notes || '',
         });

        setLoadingMedicine(false); // Data loaded, stop loading state

      } catch (err) {
        console.error("Error fetching medicine record data:", err);
        setError(err.message || 'An unexpected error occurred while fetching data.'); // Set error state
        setLoadingMedicine(false); // Stop loading state on error
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
       console.error("Error fetching animals for medicine form:", err);
       setErrorLoadingAnimals(err.message || 'An unexpected error occurred while loading animals.'); // Set error state
     } finally {
       setLoadingAnimals(false); // Stop loading state regardless of success or failure
     }
   };


  // useEffect to load the medicine record and animals data when the page component mounts
  useEffect(() => {
    // Fetch medicine record data only if recordId is available
    if (recordId) {
      fetchMedicineRecordData(recordId);
    } else {
       setError("Medicine record ID not provided.");
       setLoadingMedicine(false);
    }
    // Fetch animals data regardless of recordId
    fetchAnimals();

  }, [recordId]); // Re-run this effect if recordId changes (though it won't for this page)

  // Function to handle input changes in the form
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setMedicineRecordData({
      ...medicineRecordData, // Spread existing data
      [name]: value, // Update the specific field by its name
    });
  };

  // Function to handle the form submission (saving edited data)
  const handleSubmit = async (event) => { // Made function async
    event.preventDefault(); // Prevent default form submission

     // Basic validation: Ensure an animal is selected and required fields are filled
    if (!medicineRecordData.animalId || !medicineRecordData.medicineName || !medicineRecordData.dosage || !medicineRecordData.administrationDate) {
        alert("Please select an animal and fill in all required fields (Medicine Name, Dosage, Date).");
        return; // Stop the submission if required fields are missing
    }

    setSavingMedicine(true); // Start saving state
    setError(null); // Clear previous errors
    setSuccessSaving(false); // Clear previous success

    // Prepare updated data to send to the API
    const updatedMedicineRecordData = {
        ...medicineRecordData, // Spread the current state
         // Ensure animalId is stored as a string (MongoDB ObjectId string)
        animalId: medicineRecordData.animalId,
         // Do NOT include the _id in the request body for PUT; it's in the URL
    };

    try {
        // --- API Call to update data ---
        const response = await fetch(`/api/medicine/${recordId}`, { // Use dynamic API route with recordId
            method: 'PUT', // Use PUT method for updates
            headers: {
                'Content-Type': 'application/json', // Tell the server we're sending JSON
            },
            body: JSON.stringify(updatedMedicineRecordData), // Send the updated medicine data as a JSON string
        });

        if (!response.ok) {
            // If the response is not OK, throw an error
            const errorData = await response.json(); // Try to read error message from response body
            throw new Error(errorData.message || `Failed to update medicine record with ID ${recordId}`);
        }

        // If the response is OK, the medicine record was updated successfully
        const result = await response.json(); // Parse the JSON response (optional)
        console.log('Medicine record updated successfully:', result);

        setSuccessSaving(true); // Set success state
        // Optional: Provide feedback to the user (e.g., a toast notification)
        // alert('Medicine record updated successfully!'); // Using alert for simplicity

        // Navigate back to the view medicine records page after saving
        router.push('/medicine');

    } catch (err) {
        console.error("Error updating medicine record:", err);
        setError(err.message || 'An unexpected error occurred while saving.'); // Set error state
    } finally {
        setSavingMedicine(false); // Stop saving state regardless of success or failure
    }
  };


  // Show loading state or error message for FETCHING data
  // Consider showing both loading states if needed
  if (loadingMedicine || loadingAnimals) {
    return <div className="text-center text-gray-600">Loading data...</div>;
  }

  // Show error message if fetching failed
  if (error && !loadingMedicine && !loadingAnimals) { // Only show error if not currently loading either feed or animals
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  // If data is loaded and no error, display the main container div
  // The form and the "not found" message are conditionally rendered INSIDE this container.
  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Edit Medicine Record (ID: {recordId})</h1>

      {/* Loading, Error, and Success Messages for SAVING */}
      {savingMedicine && <p className="text-center text-blue-600">Saving changes...</p>}
      {/* We handle fetch errors above, so this is primarily for save errors */}
      {error && !savingMedicine && <p className="text-center text-red-600">Error: {error}</p>}
      {successSaving && !savingMedicine && <p className="text-center text-green-600">Changes saved successfully!</p>}


      {/* The Edit Form - Conditionally render the form */}
      {/* Render the form if not loading feed data and no general error */}
      {!loadingMedicine && !error && (
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
                    value={medicineRecordData.animalId} // Connect to state
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

             {/* Medicine Name */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="medicineName">
                  Medicine Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="medicineName"
                  type="text"
                  placeholder="e.g. Antibiotic, Painkiller"
                  name="medicineName"
                  value={medicineRecordData.medicineName} // Connect to state
                  onChange={handleInputChange} // Use the generic handler
                  required // Make medicine name required
                />
              </div>

              {/* Dosage */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dosage">
                  Dosage
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="dosage"
                  type="text" // Dosage can be varied, use text
                  placeholder="e.g. 10 ml, 2 pills"
                  name="dosage"
                  value={medicineRecordData.dosage} // Connect to state
                  onChange={handleInputChange} // Use the generic handler
                  required // Make dosage required
                />
              </div>

              {/* Administration Date */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="administrationDate">
                  Date Administered
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="administrationDate"
                  type="date" // Use date type
                  name="administrationDate"
                  value={medicineRecordData.administrationDate} // Connect to state
                  onChange={handleInputChange} // Use the generic handler
                  required // Make date required
                />
              </div>

               {/* Administration Time (Optional but useful) */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="administrationTime">
                  Time Administered (Optional)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="administrationTime"
                  type="time" // Use time type
                  name="administrationTime"
                  value={medicineRecordData.administrationTime} // Connect to state
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
                 placeholder="e.g. Animal responded well"
                 name="notes"
                 rows="3"
                 value={medicineRecordData.notes} // Connect to state
                 onChange={handleInputChange} // Use the generic handler
               ></textarea>
             </div>


             {/* Submit Button */}
             <div className="flex items-center justify-between">
               <button
                 className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                 type="submit"
                 disabled={savingMedicine} // Disable button while saving
               >
                 {savingMedicine ? 'Saving...' : 'Save Changes'} {/* Button text changes */}
               </button>
                {/* Optional: Cancel button */}
                <button
                  type="button" // Important: use type="button" so it doesn't submit the form
                  className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                  onClick={() => router.push('/medicine')} // Navigate back to view page
                >
                  Cancel
                </button>
             </div>
           </form>
      )}
      {/* Message if record not found after loading or if there was a fetch error but form data is empty */}
       {/* We show this if not loading, no error, but feedRecordData is still in its initial empty state */}
       {!loadingMedicine && !error && medicineRecordData.medicineName === '' && (
           <p className="text-center text-red-600">Medicine record with ID {recordId} not found or could not be loaded.</p>
       )}
    </div>
  );
}
