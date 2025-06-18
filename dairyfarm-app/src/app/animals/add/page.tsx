// src/app/animals/add/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

// Assuming you have an Animal interface for your form data
interface AnimalFormData {
  name: string;
  identificationId: string;
  type: string; // Ensure this matches your backend model
  breed: string;
  gender: string;
  dateOfBirth: string; // Keep as string for input type="date"
  weight: number | '';
  healthStatus: string;
  isPregnant: boolean;
  expectedDeliveryDate: string;
  averageMilkProductionLiters: number | '';
}

export default function AddAnimalPage() {
  const { user, token, loading: authLoading } = useAuth(); // Correctly destructure 'token'
  const router = useRouter();
  const [formData, setFormData] = useState<AnimalFormData>({
    name: '',
    identificationId: '',
    type: '',
    breed: '',
    gender: '',
    dateOfBirth: '',
    weight: '',
    healthStatus: '',
    isPregnant: false,
    expectedDeliveryDate: '',
    averageMilkProductionLiters: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('You need to be logged in to add an animal.');
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user || !token) { // Use 'token' directly, not user.token
      toast.error('Authentication token missing. Please log in again.');
      router.push('/login');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/animals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Use 'token' directly
        },
        body: JSON.stringify({
          ...formData,
          weight: formData.weight === '' ? undefined : Number(formData.weight),
          averageMilkProductionLiters: formData.averageMilkProductionLiters === '' ? undefined : Number(formData.averageMilkProductionLiters),
          dateOfBirth: formData.dateOfBirth || undefined,
          expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add animal');
      }

      toast.success('Animal added successfully!');
      router.push('/animals'); // Redirect to animals list
    } catch (error: any) {
      console.error('Error adding animal:', error);
      toast.error(error.message || 'An error occurred while adding the animal.');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Add New Animal</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>

        {/* Identification ID */}
        <div>
          <label htmlFor="identificationId" className="block text-sm font-medium text-gray-700">Identification ID</label>
          <input
            type="text"
            id="identificationId"
            name="identificationId"
            value={formData.identificationId}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>

        {/* Type (e.g., Cow, Goat, etc.) */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
          >
            <option value="">Select Type</option>
            <option value="Cow">Cow</option>
            <option value="Goat">Goat</option>
            <option value="Buffalo">Buffalo</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Breed */}
        <div>
          <label htmlFor="breed" className="block text-sm font-medium text-gray-700">Breed</label>
          <input
            type="text"
            id="breed"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>

        {/* Weight */}
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            min="0"
            step="0.1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>

        {/* Health Status */}
        <div>
          <label htmlFor="healthStatus" className="block text-sm font-medium text-gray-700">Health Status</label>
          <input
            type="text"
            id="healthStatus"
            name="healthStatus"
            value={formData.healthStatus}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>

        {/* Is Pregnant */}
        <div className="flex items-center">
          <input
            id="isPregnant"
            name="isPregnant"
            type="checkbox"
            checked={formData.isPregnant}
            onChange={handleChange}
            className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
          />
          <label htmlFor="isPregnant" className="ml-2 block text-sm text-gray-900">Is Pregnant?</label>
        </div>

        {/* Expected Delivery Date (conditionally rendered) */}
        {formData.isPregnant && (
          <div>
            <label htmlFor="expectedDeliveryDate" className="block text-sm font-medium text-gray-700">Expected Delivery Date</label>
            <input
              type="date"
              id="expectedDeliveryDate"
              name="expectedDeliveryDate"
              value={formData.expectedDeliveryDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
        )}

        {/* Average Milk Production */}
        <div>
          <label htmlFor="averageMilkProductionLiters" className="block text-sm font-medium text-gray-700">Average Milk Production (Liters/day)</label>
          <input
            type="number"
            id="averageMilkProductionLiters"
            name="averageMilkProductionLiters"
            value={formData.averageMilkProductionLiters}
            onChange={handleChange}
            min="0"
            step="0.1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>


        <div className="flex justify-end space-x-3">
          <Link
            href="/animals"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Animal'}
          </button>
        </div>
      </form>
    </div>
  );
}