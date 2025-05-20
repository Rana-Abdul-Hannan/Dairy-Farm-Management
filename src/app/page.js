// src/app/page.js
'use client'; // Use client directive as we'll use Link component

import Link from 'next/link'; // Import Link for navigation

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8 text-center">Dairy Farm Dashboard</h1> {/* Centered heading */}

      {/* Grid container for the dashboard cards */}
      {/* Using a responsive grid: 2 columns on medium screens, 3 on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Added gap for spacing between cards */}

        {/* Cattle Card */}
        <Link href="/cattle-options" className="block bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200"> {/* Link wraps the entire card */}
          <div className="flex flex-col items-center">
            {/* Placeholder Icon/Emoji for Cattle */}
            <span className="text-4xl mb-2">🐄</span> {/* Cow emoji as icon */}
            <h2 className="text-xl font-semibold text-gray-800">Cattle</h2>
            <p className="text-gray-600 text-sm">cow profiles</p>
          </div>
        </Link>

        {/* Expenses Card */}
        <Link href="/expenses-options" className="block bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col items-center">
             {/* Placeholder Icon/Emoji for Expenses */}
            <span className="text-4xl mb-2">💸</span> {/* Money bag emoji */}
            <h2 className="text-xl font-semibold text-gray-800">Expenses</h2>
            <p className="text-gray-600 text-sm">total inputs</p>
          </div>
        </Link>

        {/* Inventory (Income) Card */}
         <Link href="/income-options" className="block bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col items-center">
             {/* Placeholder Icon/Emoji for Inventory */}
            <span className="text-4xl mb-2">📦</span> {/* Box emoji */}
            <h2 className="text-xl font-semibold text-gray-800">Inventory</h2> {/* Using "Inventory" as in the image */}
            <p className="text-gray-600 text-sm">income records</p> {/* Describing the content */}
          </div>
        </Link>

        {/* Medicine Card - Added */}
        <Link href="/medicine-options" className="block bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col items-center">
             {/* Icon/Emoji for Medicine */}
            <span className="text-4xl mb-2">💉</span> {/* Syringe emoji */}
            <h2 className="text-xl font-semibold text-gray-800">Medicine</h2>
            <p className="text-gray-600 text-sm">health treatments</p> {/* Description for Medicine */}
          </div>
        </Link>

        {/* Reports Card */}
        <Link href="/report" className="block bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col items-center">
             {/* Placeholder Icon/Emoji for Reports */}
            <span className="text-4xl mb-2">📊</span> {/* Bar chart emoji */}
            <h2 className="text-xl font-semibold text-gray-800">Reports</h2>
            <p className="text-gray-600 text-sm">books summary</p>
          </div>
        </Link>

        {/* Tips Card */}
         <Link href="/tips" className="block bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col items-center">
             {/* Icon/Emoji for Tips */}
            <span className="text-4xl mb-2">💡</span> {/* Lightbulb emoji */}
            <h2 className="text-xl font-semibold text-gray-800">Tips</h2> {/* Changed from Workers */}
            <p className="text-gray-600 text-sm">farming advice</p> {/* Changed description */}
          </div>
        </Link>

        {/* Feeds Card - Updated to link to Feed Options page */}
        {/* The link now goes to /feed-options */}
         <Link href="/feed-options" className="block bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col items-center">
             {/* Placeholder Icon/Emoji for Feeds */}
            <span className="text-4xl mb-2">🌾</span> {/* Sheaf of rice emoji */}
            <h2 className="text-xl font-semibold text-gray-800">Feeds</h2>
            <p className="text-gray-600 text-sm">Formulation</p> {/* Text from the image */}
          </div>
        </Link>

        {/* Add more cards for other sections as you create them */}

      </div>
    </div>
  );
}
