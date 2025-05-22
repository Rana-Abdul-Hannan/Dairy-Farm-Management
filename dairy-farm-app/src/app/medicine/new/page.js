// src/app/medicine/new/page.js
'use client'; // This page needs client-side features (State, Effects, API Calls)

import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useRouter } from 'next/navigation'; // Import useRouter for navigation after saving
// Removed: import { ObjectId } from 'mongodb'; // No longer needed on the client side


export default function AddNewMedicinePage() {
  // State for form inputs
  const [selectedAnimalId, setSelectedAnimalId] = useState(''); // To link medicine to an animal (will store MongoDB ObjectId string)
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [administrationDate, setAdministrationDate] = useState('');
  const [administrationTime, setAdministrationTime] = useState('');
  const [notes, setNotes] = useState('');

  // State to hold the list of animals fetched from the API (for the dropdown)
  const [animals, setAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true); // State for loading animals from API
  const [errorLoadingAnimals, setErrorLoadingAnimals] = useState(null); // State for error loading animals

  // State for loading and error feedback during API call to add medicine
  const [addingMedicine, setAddingMedicine] = useState(false); // State for adding medicine record
  const [errorAddingMedicine, setErrorAddingMedicine] = useState(null); // State for error adding medicine
  const [successAddingMedicine, setSuccessAddingMedicine] = useState(false); // State for successful addition


  // Get the router instance (useful for redirecting after save)
  const router = useRouter();


  // useEffect to load animals from the API when the component mounts
  // We need animal data to populate the dropdown for linking medicine records
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
        console.error("Error fetching animals for medicine form:", err);
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
    if (!selectedAnimalId || !medicineName || !dosage || !administrationDate) {
        alert("Please select an animal and fill in all required fields (Medicine Name, Dosage, Date).");
        return; // Stop the submission if required fields are missing
    }

    // Gather medicine data
    const newMedicineRecordData = {
      // We no longer generate ID on the frontend; MongoDB will do it
      // Ensure animalId is stored as a string (MongoDB ObjectId string)
      animalId: selectedAnimalId,
      medicineName: medicineName,
      dosage: dosage, // Dosage can be text (e.g., "2 pills", "500 mg")
      administrationDate: administrationDate,
      administrationTime: administrationTime,
      notes: notes,
    };

    setAddingMedicine(true); // Start adding medicine state
    setErrorAddingMedicine(null); // Clear previous errors
    setSuccessAddingMedicine(false); // Clear previous success

    try {
        // --- API Call to save medicine record ---
        const response = await fetch('/api/medicine', { // Use the /api/medicine POST endpoint
            method: 'POST', // Use POST method
            headers: {
                'Content-Type': 'application/json', // Tell the server we're sending JSON
            },
            body: JSON.stringify(newMedicineRecordData), // Send the medicine data as a JSON string in the body
        });

        if (!response.ok) {
            // If the response is not OK (e.g., 400, 500 status), throw an error
            const errorData = await response.json(); // Try to read error message from response body
            throw new Error(errorData.message || 'Failed to add medicine record');
        }

        // If the response is OK, the medicine record was added successfully
        const result = await response.json(); // Parse the JSON response from the API
        console.log('Medicine record added successfully:', result);

        setSuccessAddingMedicine(true); // Set success state
        // Optional: Reset the form fields after successful submission
        setSelectedAnimalId('');
        setMedicineName('');
        setDosage('');
        setAdministrationDate('');
        setAdministrationTime('');
        setNotes('');

        // Optional: Provide feedback to the user (e.g., a toast notification)
        // alert('Medicine record added successfully!'); // Using alert for simplicity

        // Optional: Navigate to the view medicine page after successful submission
        // router.push('/medicine'); // Uncomment this line when you update the view medicine page

    } catch (err) {
        console.error("Error adding medicine record:", err);
        setErrorAddingMedicine(err.message || 'An unexpected error occurred.'); // Set error state
    } finally {
        setAddingMedicine(false); // Stop adding medicine state regardless of success or failure
    }
  };


  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Add New Medicine Record</h1>

      {/* Loading, Error, and Success Messages for Adding Medicine */}
      {addingMedicine && <p className="text-center text-blue-600">Adding medicine record...</p>}
      {errorAddingMedicine && <p className="text-center text-red-600">Error: {errorAddingMedicine}</p>}
      {successAddingMedicine && <p className="text-center text-green-600">Medicine record added successfully!</p>}


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
             value={medicineName}
             onChange={(e) => setMedicineName(e.target.value)}
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
             value={dosage}
             onChange={(e) => setDosage(e.target.value)}
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
             value={administrationDate}
             onChange={(e) => setAdministrationDate(e.target.value)}
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
             value={administrationTime}
             onChange={(e) => setAdministrationTime(e.target.value)}
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
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>


        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={addingMedicine} // Disable button while adding
          >
            {addingMedicine ? 'Adding...' : 'Add Medicine Record'} {/* Button text changes */}
          </button>
        </div>
      </form>
    </div>
  );
}
