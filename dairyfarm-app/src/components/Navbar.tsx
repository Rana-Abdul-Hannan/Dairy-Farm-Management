'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully!');
    router.push('/login');
  };

  const showNavbar = user || (pathname !== '/login' && pathname !== '/register');

  if (!showNavbar) {
    return null;
  }

  return (
    <nav className="bg-green-700 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* The brand logo/text. When logged in, it can lead to Profile or Dashboard.
            Let's make it go to Profile if that's the primary navigation point now. */}
        {user ? (
          <Link href="/profile" className="text-white text-2xl font-bold"> {/* Changed to /profile */}
            DairyFarm App
          </Link>
        ) : (
          <Link href="/login" className="text-white text-2xl font-bold">
            DairyFarm App
          </Link>
        )}
        <ul className="flex space-x-6">
          {user ? ( // Only show these links if the user is logged in
            <>
              {/* Profile Link (always show if logged in) */}
              <li>
                <Link href="/profile" className={`text-white hover:text-green-200 ${pathname === '/profile' ? 'font-bold' : ''}`}>
                  Profile
                </Link>
              </li>

              {/* User Email (optional, good for visibility) */}
              <li>
                <span className="text-white">Hello, {user.email}</span>
              </li>

              {/* Logout Button (always show if logged in) */}
              <li>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-green-200 focus:outline-none"
                >
                  Logout
                </button>
              </li>
            </>
          ) : ( // Show these links if the user is NOT logged in
            <>
              {pathname !== '/login' && (
                <li>
                  <Link href="/login" className={`text-white hover:text-green-200 ${pathname === '/login' ? 'font-bold' : ''}`}>
                    Login
                  </Link>
                </li>
              )}
              {pathname !== '/register' && (
                <li>
                  <Link href="/register" className={`text-white hover:text-green-200 ${pathname === '/register' ? 'font-bold' : ''}`}>
                    Register
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}