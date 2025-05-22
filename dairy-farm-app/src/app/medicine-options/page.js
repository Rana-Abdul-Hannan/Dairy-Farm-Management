// src/app/medicine-options/page.js
'use client'; // Use client directive as we'll use Link component

import Link from 'next/link'; // Import Link for navigation

export default function MedicineOptionsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Medicine Records</h1> {/* Centered heading */}

      {/* Grid container for the options cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Responsive grid with 2 columns on medium screens */}

        {/* Add New Medicine Record Card */}
        <Link href="/medicine/new" className="block bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col items-center">
            {/* Icon/Emoji for Add */}
            <span className="text-4xl mb-2">➕</span> {/* Plus emoji */}
            <h2 className="text-xl font-semibold text-gray-800">Add New Record</h2>
            <p className="text-gray-600 text-sm">add a new medicine treatment record</p>
          </div>
        </Link>

        {/* View All Medicine Records Card */}
        <Link href="/medicine" className="block bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col items-center">
            {/* Icon/Emoji for View */}
            <span className="text-4xl mb-2">📋</span> {/* Clipboard emoji */}
            <h2 className="text-xl font-semibold text-gray-800">View All Records</h2>
            <p className="text-gray-600 text-sm">view, edit, or delete existing records</p>
          </div>
        </Link>

      </div>
       {/* Back to Dashboard Button */}
       <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
             ← Back to Dashboard
          </Link>
       </div>
    </div>
  );
}
