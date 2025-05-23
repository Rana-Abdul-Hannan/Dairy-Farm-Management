// src/app/expenses/new/page.js
'use client'; // This page needs client-side features (State, Effects, API Calls)

import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useRouter } from 'next/navigation'; // Import useRouter for navigation after saving
// Removed: import { ObjectId } from 'mongodb'; // No longer needed on the client side


export default function AddNewExpensePage() {
  // State for form inputs
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(''); // Use string for input value initially
  const [category, setCategory] = useState('');
  const [selectedAnimalId, setSelectedAnimalId] = useState(''); // Optional: link to an animal (will store MongoDB ObjectId string)
  const [notes, setNotes] = useState('');

  // State to hold the list of animals fetched from the API (for the dropdown)
  const [animals, setAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true); // State for loading animals from API
  const [errorLoadingAnimals, setErrorLoadingAnimals] = useState(null); // State for error loading animals

  // State for loading and error feedback during API call to add expense
  const [addingExpense, setAddingExpense] = useState(false); // State for adding expense record
  const [errorAddingExpense, setErrorAddingExpense] = useState(null); // State for error adding expense
  const [successAddingExpense, setSuccessAddingExpense] = useState(false); // State for successful addition


  // Get the router instance (useful for redirecting after save)
  const router = useRouter();


  // useEffect to load animals from the API when the component mounts
  // We need animal data to populate the dropdown for optional linking
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
        console.error("Error fetching animals for expense form:", err);
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

    // Basic validation: Ensure required fields are filled
    if (!date || !description || !amount || !category) {
        alert("Please fill in all required fields (Date, Description, Amount, Category).");
        return; // Stop the submission if required fields are missing
    }

    // Gather expense data
    const newExpenseRecordData = {
      // We no longer generate ID on the frontend; MongoDB will do it
      date: date,
      description: description,
      amount: parseFloat(amount), // Convert amount to a number
      category: category,
      // Ensure animalId is stored as a string (MongoDB ObjectId string) or null if none selected
      animalId: selectedAnimalId || null,
      notes: notes,
    };

    setAddingExpense(true); // Start adding expense state
    setErrorAddingExpense(null); // Clear previous errors
    setSuccessAddingExpense(false); // Clear previous success

    try {
        // --- API Call to save expense record ---
        const response = await fetch('/api/expenses', { // Use the /api/expenses POST endpoint
            method: 'POST', // Use POST method
            headers: {
                'Content-Type': 'application/json', // Tell the server we're sending JSON
            },
            body: JSON.stringify(newExpenseRecordData), // Send the expense data as a JSON string in the body
        });

        if (!response.ok) {
            // If the response is not OK (e.g., 400, 500 status), throw an error
            const errorData = await response.json(); // Try to read error message from response body
            throw new Error(errorData.message || 'Failed to add expense record');
        }

        // If the response is OK, the expense record was added successfully
        const result = await response.json(); // Parse the JSON response from the API
        console.log('Expense record added successfully:', result);

        setSuccessAddingExpense(true); // Set success state
        // Optional: Reset the form fields after successful submission
        setDate('');
        setDescription('');
        setAmount('');
        setCategory('');
        setSelectedAnimalId('');
        setNotes('');

        // Optional: Provide feedback to the user (e.g., a toast notification)
        // alert('Expense record added successfully!'); // Using alert for simplicity

        // Optional: Navigate to the view expenses page after successful submission
        // router.push('/expenses'); // Uncomment this line when you update the view expenses page

    } catch (err) {
        console.error("Error adding expense record:", err);
        setErrorAddingExpense(err.message || 'An unexpected error occurred.'); // Set error state
    } finally {
        setAddingExpense(false); // Stop adding expense state regardless of success or failure
    }
  };


  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Add New Expense</h1>

      {/* Loading, Error, and Success Messages for Adding Expense */}
      {addingExpense && <p className="text-center text-blue-600">Adding expense record...</p>}
      {errorAddingExpense && <p className="text-center text-red-600">Error: {errorAddingExpense}</p>}
      {successAddingExpense && <p className="text-center text-green-600">Expense record added successfully!</p>}


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
            value={date}
            onChange={(e) => setDate(e.target.value)}
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
             placeholder="e.g. Vet visit for injured cow"
             name="description"
             value={description}
             onChange={(e) => setDescription(e.target.value)}
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
             placeholder="e.g. 150.75"
             name="amount"
             value={amount}
             onChange={(e) => setAmount(e.target.value)}
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
             value={category}
             onChange={(e) => setCategory(e.target.value)}
             required // Make category required
           >
             <option value="">-- Select a Category --</option>
             <option value="feed">Feed</option>
             <option value="veterinary">Veterinary</option>
             <option value="supplies">Supplies</option>
             <option value="labor">Labor</option>
             <option value="equipment">Equipment</option>
             <option value="other">Other</option>
           </select>
         </div>

        {/* Select Animal (Optional) */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="animalSelect">
            Related Animal (Optional)
          </label>
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
              value={selectedAnimalId}
              onChange={(e) => setSelectedAnimalId(e.target.value)}
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
            placeholder="e.g. Follow-up needed next week"
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
            disabled={addingExpense} // Disable button while adding
          >
            {addingExpense ? 'Adding...' : 'Add Expense'} {/* Button text changes */}
          </button>
        </div>
      </form>
    </div>
  );
}
