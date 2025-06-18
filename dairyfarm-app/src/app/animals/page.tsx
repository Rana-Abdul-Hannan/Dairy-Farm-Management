// src/app/animals/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Assuming correct path to AuthContext

interface Animal {
  _id: string;
  name: string;
  type: string;
  breed: string;
  gender: string;
  dateOfBirth?: string;
  identificationId: string;
  owner: string; // Should be ObjectId in schema, string here for frontend
  notes?: string;
  weightKg?: number;
  healthStatus: string;
  lastVetVisit?: string;
  lastMilking?: string;
  averageMilkProductionLiters?: number;
  isPregnant?: boolean;
  expectedDeliveryDate?: string;
  vaccinations?: string[];
  imageURL?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AnimalsPage() {
  const { user, token, loading: authLoading } = useAuth(); // <--- This line is key
  const router = useRouter();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('You need to be logged in to view animals.');
      router.push('/login');
      return;
    }

    if (user && token) { // Ensure token is available before fetching
      const fetchAnimals = async () => {
        try {
          setDataLoading(true);
          const res = await fetch('/api/animals', {
            headers: {
              'Authorization': `Bearer ${token}`, // <--- Use 'token' directly here
            },
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to fetch animals');
          }

          const fetchedAnimals = await res.json();
          setAnimals(fetchedAnimals);
        } catch (error: any) {
          console.error('Error fetching animals:', error);
          toast.error(error.message || 'An error occurred while fetching animals.');
        } finally {
          setDataLoading(false);
        }
      };
      fetchAnimals();
    }
  }, [user, token, authLoading, router]); // Add token to dependency array

  const handleDelete = async (animalId: string) => {
    if (!window.confirm('Are you sure you want to delete this animal?')) {
      return;
    }

    if (!token) {
      toast.error('Authentication token missing. Please log in again.');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`/api/animals/${animalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // <--- Use 'token' directly here
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete animal');
      }

      toast.success('Animal deleted successfully!');
      // Filter out the deleted animal from the state
      setAnimals(prevAnimals => prevAnimals.filter(animal => animal._id !== animalId));
    } catch (error: any) {
      console.error('Error deleting animal:', error);
      toast.error(error.message || 'An error occurred while deleting the animal.');
    }
  };


  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-700">Loading authentication...</p>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-700">Loading animals...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">My Animals</h1>
      <div className="flex justify-end mb-4">
        <Link href="/animals/add" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Add New Animal
        </Link>
      </div>
      {animals.length === 0 ? (
        <p className="text-center text-gray-600">No animals found. Add one above!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animals.map((animal) => (
            <div key={animal._id} className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{animal.name} ({animal.type})</h2>
                <p className="text-gray-600">ID: {animal.identificationId}</p>
                <p className="text-gray-600">Breed: {animal.breed}</p>
                <p className="text-gray-600">Gender: {animal.gender}</p>
                {animal.dateOfBirth && <p className="text-gray-600">DoB: {new Date(animal.dateOfBirth).toLocaleDateString()}</p>}
                {animal.healthStatus && <p className="text-gray-600">Health: {animal.healthStatus}</p>}
                {animal.isPregnant && <p className="text-gray-600 text-sm font-bold text-pink-600">Pregnant (Expected Delivery: {animal.expectedDeliveryDate ? new Date(animal.expectedDeliveryDate).toLocaleDateString() : 'N/A'})</p>}
                {animal.imageURL && <img src={animal.imageURL} alt={animal.name} className="w-full h-40 object-cover mt-4 rounded" />}
                {/* Add more fields as desired */}
              </div>
              <div className="mt-4 flex flex-col space-y-2">
                <Link
                  href={`/animals/${animal._id}`}
                  className="bg-blue-500 hover:bg-blue-700 text-white text-center font-bold py-2 px-4 rounded transition duration-200"
                >
                  View Details
                </Link>
                <Link
                  href={`/animals/edit/${animal._id}`}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white text-center font-bold py-2 px-4 rounded transition duration-200"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(animal._id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200"
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