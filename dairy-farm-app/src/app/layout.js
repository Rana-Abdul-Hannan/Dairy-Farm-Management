// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link'; // Import the Link component

// Configure Geist fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata for the application
export const metadata = {
  title: "Dairy Farm App", // Updated title
  description: "Manage your dairy farm efficiently", // Updated description
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Apply font variables and antialiased class to the body */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

        {/* Basic Navigation Header */}
        <header className="bg-green-700 text-white p-4"> {/* Tailwind classes for styling */}
          <div className="container mx-auto flex justify-between items-center"> {/* Container for centering and flex layout */}
            {/* App Title - Link to Home Page */}
            <Link href="/" className="text-xl font-bold hover:underline"> {/* Link to Home */}
              Dairy Farm App
            </Link>
            {/* Navigation Links - Cleared */}
            <nav>
              <ul className="flex space-x-4"> {/* Horizontal list with space */}
                {/* All previous navigation links have been removed */}
              </ul>
            </nav>
          </div>
        </header>

        {/* The main content area where pages (children) are rendered */}
        {/* Added top margin to separate content from the header */}
        <main className="container mx-auto mt-4 p-4"> {/* Added p-4 for consistent padding */}
           {children}
        </main>

      </body>
    </html>
  );
}
