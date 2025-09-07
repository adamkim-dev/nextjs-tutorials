'use client';

import Link from 'next/link';
import OTPLoginForm from '../components/auth/OTPLoginForm';

export default function OTPLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <OTPLoginForm />
      <p className="mt-4 text-center">
        Quay lại trang{' '}
        <Link href="/" className="text-blue-500 hover:underline">
          Trang chủ
        </Link>
      </p>
    </div>
  );
}