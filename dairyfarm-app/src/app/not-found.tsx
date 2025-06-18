import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center py-12 px-4 text-center">
      <h1 className="text-6xl font-bold text-green-700 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
      <p className="text-lg text-gray-600 mb-8">
        Oops! The page you're looking for does not exist.
      </p>
      <Link href="/dashboard" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
        Go to Dashboard
      </Link>
      <Link href="/" className="mt-4 text-green-600 hover:underline">
        Return to Home (Login/Dashboard)
      </Link>
    </div>
  );
}