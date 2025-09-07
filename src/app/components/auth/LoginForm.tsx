/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSupabase } from "../providers/SupabaseProvider";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { supabase } = useSupabase();
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {}, // Thêm data object trống như trong cURL request
          shouldCreateUser: true, // Tương đương với create_user:true trong request
        },
      });

      if (error) throw error;
      
      // Nếu không có lỗi, đánh dấu là đã gửi OTP
      setOtpSent(true);
      
    } catch (error: any) {
      setError(error.message || "Đã xảy ra lỗi khi gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {otpSent ? "Kiểm tra email của bạn" : "Đăng nhập"}
      </h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {otpSent ? (
        <div className="text-center">
          <p className="mb-4">
            Chúng tôi đã gửi một email chứa mã OTP đến {email}. Vui lòng kiểm tra
            hộp thư đến của bạn và nhấp vào liên kết trong email để đăng nhập.
          </p>
          <button
            onClick={() => setOtpSent(false)}
            className="text-blue-500 hover:underline"
          >
            Sử dụng email khác
          </button>
        </div>
      ) : (
        <form onSubmit={handleSendOTP}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? "Đang gửi..." : "Tiếp tục"}
          </button>
        </form>
      )}
    </div>
  );
}
