"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-xl">
              Split mate
            </Link>
          </div>

          <nav className="flex space-x-4"></nav>
        </div>
      </div>
    </header>
  );
}
