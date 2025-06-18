// src/app/animals/[id]/health/[recordId]/edit/page.tsx <-- IMPORTANT: Ensure folder structure is src/app/animals/[id]/health/[recordId]/edit/
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// Define the HealthRecord interface (should match your IHealthRecord from backend)
interface HealthRecord {
  _id: string;
  animal: string | { _id: string; name: string; identificationId: string; owner: string }; // Can be populated or just ID
  date: string; // ISO string from backend
  recordType: 'Vaccination' | 'Treatment' | 'Diagnosis' | 'Observation' | 'Other';
  description: string;
  vetName?: string;
  cost?: number;
  medications?: string[];
  notes?: string;
}

// Define the Animal interface (only what's needed for context/display)
interface Animal {
  _id: string;
  name: string;
  identificationId: string;
}

// Updated prop type to match the [id] dynamic segment for animal
export default function EditHealthRecordPage({ params }: { params: { id: string, recordId: string } }) {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  // Changed from params.animalId to params.id to match the dynamic segment name
  const animalId = params.id;
  const recordId = params.recordId;

  const [healthRecord, setHealthRecord] = useState<HealthRecord | null>(null);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Form states (initialized with empty or default values, will be set by fetched data)
  const [date, setDate] = useState('');
  const [recordType, setRecordType] = useState<'Vaccination' | 'Treatment' | 'Diagnosis' | 'Observation' | 'Other'>('Treatment');
  const [description, setDescription] = useState('');
  const [vetName, setVetName] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('You need to be logged in to edit health records.');
      router.push('/login');
      return;
    }

    if (user && token && animalId && recordId) {
      const fetchData = async () => {
        try {
          setLoadingData(true);
          // Fetch animal details
          const animalRes = await fetch(`/api/animals/${animalId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!animalRes.ok) {
            const errorData = await animalRes.json();
            throw new Error(errorData.message || 'Failed to fetch animal details.');
          }
          const fetchedAnimal: Animal = await animalRes.json();
          setAnimal(fetchedAnimal);

          // Fetch health record details
          const healthRes = await fetch(`/api/health-records/${recordId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!healthRes.ok) {
            const errorData = await healthRes.json();
            throw new Error(errorData.message || 'Failed to fetch health record.');
          }
          const fetchedHealthRecord: HealthRecord = await healthRes.json();

          // Check if the health record belongs to the correct animal
          if (typeof fetchedHealthRecord.animal === 'object' && fetchedHealthRecord.animal !== null) {
            if (fetchedHealthRecord.animal._id.toString() !== animalId) {
              throw new Error('Health record does not belong to the specified animal.');
            }
          } else if (fetchedHealthRecord.animal.toString() !== animalId) { // if animal is just an ID string
              throw new Error('Health record does not belong to the specified animal.');
          }


          setHealthRecord(fetchedHealthRecord);

          // Populate form fields with fetched data
          setDate(new Date(fetchedHealthRecord.date).toISOString().split('T')[0]);
          setRecordType(fetchedHealthRecord.recordType);
          setDescription(fetchedHealthRecord.description);
          setVetName(fetchedHealthRecord.vetName || '');
          setCost(fetchedHealthRecord.cost !== undefined ? fetchedHealthRecord.cost : '');
          setMedications(fetchedHealthRecord.medications || []);
          setNotes(fetchedHealthRecord.notes || '');

        } catch (error: any) {
          console.error('Error fetching data for health record:', error);
          toast.error(error.message || 'An error occurred while fetching data. Redirecting.');
          router.push(`/animals/${animalId}`); // Go back to animal details
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [authLoading, user, token, animalId, recordId, router]);

  const handleAddMedication = () => {
    if (newMedication.trim() && !medications.includes(newMedication.trim())) {
      setMedications([...medications, newMedication.trim()]);
      setNewMedication('');
    }
  };

  const handleRemoveMedication = (medToRemove: string) => {
    setMedications(medications.filter(med => med !== medToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token) {
      toast.error('Authentication token missing. Please log in again.');
      router.push('/login');
      return;
    }

    if (!date || !recordType || !description) {
      toast.error('Please fill in all required fields (Date, Record Type, Description).');
      return;
    }

    setLoadingSubmit(true);
    try {
      const res = await fetch(`/api/health-records/${recordId}`, {
        method: 'PUT', // Use PUT for updating
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          animal: animalId, // Ensure animal ID is sent, even if not changing
          date,
          recordType,
          description,
          vetName: vetName || undefined,
          cost: cost === '' ? undefined : Number(cost),
          medications: medications.length > 0 ? medications : undefined,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update health record');
      }

      toast.success('Health record updated successfully!');
      router.push(`/animals/${animalId}`); // Redirect back to animal details page
    } catch (error: any) {
      console.error('Error updating health record:', error);
      toast.error(error.message || 'An error occurred while updating the health record.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (authLoading || loadingData || (!user && !authLoading)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-700">Loading health record data...</p>
      </div>
    );
  }

  if (!healthRecord || !animal) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col">
        <p className="text-red-500 text-lg">Health record or associated animal not found.</p>
        <Link href={`/animals/${animalId}`} className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Back to Animal Details
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Edit Health Record for {animal.name} ({animal.identificationId})
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div>
          <label htmlFor="recordType" className="block text-gray-700 text-sm font-bold mb-2">
            Record Type <span className="text-red-500">*</span>
          </label>
          <select
            id="recordType"
            value={recordType}
            onChange={(e) => setRecordType(e.target.value as any)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="Treatment">Treatment</option>
            <option value="Vaccination">Vaccination</option>
            <option value="Diagnosis">Diagnosis</option>
            <option value="Observation">Observation</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Fever, administered antibiotics. OR Rabies vaccination."
            required
          />
        </div>

        <div>
          <label htmlFor="vetName" className="block text-gray-700 text-sm font-bold mb-2">
            Veterinarian Name (Optional)
          </label>
          <input
            type="text"
            id="vetName"
            value={vetName}
            onChange={(e) => setVetName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Dr. Smith"
          />
        </div>

        <div>
          <label htmlFor="cost" className="block text-gray-700 text-sm font-bold mb-2">
            Cost (Optional)
          </label>
          <input
            type="number"
            id="cost"
            value={cost}
            onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., 50.00"
            step="0.01"
            min="0"
          />
        </div>

        {/* Medications Input */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Medications (Optional)
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMedication();
                }
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
              placeholder="Add medication (e.g., Amoxicillin)"
            />
            <button
              type="button"
              onClick={handleAddMedication}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {medications.map((med, index) => (
              <span
                key={index}
                className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full flex items-center"
              >
                {med}
                <button
                  type="button"
                  onClick={() => handleRemoveMedication(med)}
                  className="ml-2 text-red-500 hover:text-red-700 font-bold leading-none focus:outline-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Any other relevant information..."
          />
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            type="submit"
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              loadingSubmit ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loadingSubmit}
          >
            {loadingSubmit ? 'Updating...' : 'Update Record'}
          </button>
          <Link
            href={`/animals/${animalId}`}
            className="inline-block align-baseline font-bold text-sm text-gray-500 hover:text-gray-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}