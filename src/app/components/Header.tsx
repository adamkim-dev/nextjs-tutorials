'use client';

import Link from 'next/link';
import { useSupabase } from './providers/SupabaseProvider';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { supabase, user } = useSupabase();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-xl">
              Splitmate
            </Link>
          </div>
          
          <nav className="flex space-x-4">
            <Link href="/" className="px-3 py-2 rounded-md hover:bg-gray-100">
              Home
            </Link>
            
            {user ? (
              <>
                <Link href="/create-trip" className="px-3 py-2 rounded-md hover:bg-gray-100">
                  Create Trip
                </Link>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 rounded-md hover:bg-gray-100">
                  Login
                </Link>
                <Link href="/signup" className="px-3 py-2 rounded-md hover:bg-gray-100">
                  Sign Up
                </Link>
                <Link href="/otp-login" className="px-3 py-2 rounded-md hover:bg-gray-100">
                  Login với OTP
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}