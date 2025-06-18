// src/app/animals/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react'; // Removed 'use' hook import as it's no longer needed for params
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

// Define Animal and HealthRecord interfaces (unchanged)
interface Animal {
  _id: string;
  name: string;
  identificationId: string;
  breed?: string;
  gender?: 'Male' | 'Female';
  dateOfBirth?: string;
  weight?: number;
}

interface HealthRecord {
  _id: string;
  animal: string;
  date: string;
  recordType: 'Vaccination' | 'Treatment' | 'Diagnosis' | 'Observation' | 'Other';
  description: string;
  vetName?: string;
  cost?: number;
  medications?: string[];
  notes?: string;
}

// Simplified prop type for params, as it will be directly the object in a client component
export default function AnimalDetailsPage({ params }: { params: { id: string } }) {
  // Directly access params.id since it's a client component
  const animalId = params.id; // This addresses the warning about params being a Promise

  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loadingAnimal, setLoadingAnimal] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication and redirect if not logged in
    if (!authLoading && !user) {
      toast.error('You need to be logged in to view animal details.');
      router.push('/login');
      return;
    }

    // Fetch data only if authenticated and not already loading
    if (user && token && animalId && !authLoading) {
      const fetchAnimalAndRecords = async () => {
        setLoadingAnimal(true);
        setLoadingRecords(true);
        setError(null); // Clear any previous errors

        try {
          // Fetch Animal Details
          const animalRes = await fetch(`/api/animals/${animalId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!animalRes.ok) {
            const errorData = await animalRes.json();
            if (animalRes.status === 404) {
              throw new Error('Animal not found or you do not have access.');
            } else if (animalRes.status === 401 || animalRes.status === 403) {
              // These statuses indicate unauthorized access
              throw new Error(errorData.message || 'Unauthorized access to animal details. Please log in again.');
            } else {
              throw new Error(errorData.message || 'Failed to fetch animal details.');
            }
          }
          const fetchedAnimal: Animal = await animalRes.json();
          setAnimal(fetchedAnimal);

          // Fetch Health Records
          const healthRecordsRes = await fetch(`/api/health-records?animalId=${animalId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!healthRecordsRes.ok) {
            const errorData = await healthRecordsRes.json();
            if (healthRecordsRes.status === 401 || healthRecordsRes.status === 403) {
                // These statuses indicate unauthorized access
              throw new Error(errorData.message || 'Unauthorized access to health records. Please log in again.');
            } else {
              throw new Error(errorData.message || 'Failed to fetch health records.');
            }
          }
          const fetchedHealthRecords: HealthRecord[] = await healthRecordsRes.json();
          // Sort health records by date in descending order (most recent first)
          fetchedHealthRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setHealthRecords(fetchedHealthRecords);

        } catch (err: any) {
          console.error('Error fetching data:', err);
          toast.error(err.message || 'An error occurred while fetching data.');
          setError(err.message || 'Failed to load data.');
          // Redirect to login if unauthorized or a critical error occurred
          if (err.message.includes('Unauthorized')) {
            router.push('/login');
          } else {
            // If it's another error, redirect to the animals list
            router.push('/animals');
          }
        } finally {
          setLoadingAnimal(false);
          setLoadingRecords(false);
        }
      };
      fetchAnimalAndRecords();
    }
  }, [authLoading, user, token, animalId, router]); // Dependencies for useEffect

  const handleDeleteHealthRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this health record?')) return;

    if (!user || !token) {
      toast.error('Authentication token missing. Please log in again.');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`/api/health-records/${recordId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete health record.');
      }

      toast.success('Health record deleted successfully!');
      // Update state to remove the deleted record
      setHealthRecords(prevRecords => prevRecords.filter(record => record._id !== recordId));
    } catch (error: any) {
      console.error('Error deleting health record:', error);
      toast.error(error.message || 'An error occurred while deleting the health record.');
    }
  };

  // Loading/Error/Not Found States
  if (authLoading || (loadingAnimal && loadingRecords) || (!user && !authLoading)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-700">
          {authLoading || (!user && !authLoading)
            ? 'Checking authentication...'
            : 'Loading animal details and health records...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col">
        <p className="text-red-500 text-lg">Error: {error}</p>
        <Link href="/animals" className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Back to Animals List
        </Link>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col">
        <p className="text-red-500 text-lg">Animal not found.</p>
        <Link href="/animals" className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Back to Animals List
        </Link>
      </div>
    );
  }

  // Main Content Display
  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{animal.name}</h1>
        <p className="text-xl text-gray-600">ID: {animal.identificationId}</p>
        <p className="text-lg text-gray-600">
          Breed: {animal.breed || 'N/A'} | Gender: {animal.gender || 'N/A'}
        </p>
        {animal.dateOfBirth && (
          <p className="text-lg text-gray-600">
            Date of Birth: {new Date(animal.dateOfBirth).toLocaleDateString()}
          </p>
        )}
        {animal.weight && (
          <p className="text-lg text-gray-600">Current Weight: {animal.weight} kg</p>
        )}

        <div className="mt-6 flex justify-center space-x-4">
          <Link
            href={`/animals/edit/${animal._id}`}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Edit Animal
          </Link>
          <Link
            href={`/animals/${animal._id}/health/add`}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Add New Health Record
          </Link>
        </div>
      </div>

      <hr className="my-8 border-gray-300" />

      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Health Records</h2>
      {healthRecords.length === 0 ? (
        <p className="text-center text-gray-600">No health records found for this animal. Add one above!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Description</th>
                <th className="py-3 px-6">Vet</th>
                <th className="py-3 px-6">Cost</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {healthRecords.map((record) => (
                <tr key={record._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="py-3 px-6">{record.recordType}</td>
                  <td className="py-3 px-6 max-w-xs overflow-hidden text-ellipsis">{record.description}</td>
                  <td className="py-3 px-6">{record.vetName || 'N/A'}</td>
                  <td className="py-3 px-6">
                    {record.cost !== undefined ? `$${record.cost.toFixed(2)}` : 'N/A'}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center space-x-2">
                      <Link
                        href={`/animals/${animalId}/health/${record._id}/edit`}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-xs transition duration-200"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteHealthRecord(record._id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs transition duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}