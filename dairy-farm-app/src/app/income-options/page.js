// src/app/income-options/page.js
'use client'; // Use client directive as we'll use Link component

import Link from 'next/link'; // Import Link for navigation

export default function IncomeOptionsPage() {
  return (
    <div className="container mx-auto p-4 max-w-sm"> {/* Added max-w-sm for a smaller container */}
      <h1 className="text-2xl font-bold mb-6 text-center">Income Options</h1>

      <div className="flex flex-col space-y-4"> {/* Flex column for vertical stacking, space-y for spacing */}
        {/* Link to View All Income Records */}
        <Link href="/income" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-center transition-colors duration-200"> {/* Button-like styling */}
          View All Income Records
        </Link>

        {/* Link to Add New Income Record */}
        <Link href="/income/new" className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded text-center transition-colors duration-200"> {/* Button-like styling */}
          Add New Income Record
        </Link>
      </div>
    </div>
  );
}
