'use client';

import Link from 'next/link';

export default function Header() {
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
            <Link href="/create-trip" className="px-3 py-2 rounded-md hover:bg-gray-100">
              Create Trip
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}