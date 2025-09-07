"use client";

import { useState } from "react";
import { useSupabase } from "../providers/SupabaseProvider";
import { useRouter } from "next/navigation";

export default function OTPVerificationForm() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { supabase } = useSupabase();
  const router = useRouter();

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Lưu ý: Supabase thường xử lý xác minh OTP thông qua URL callback
      // Đây chỉ là ví dụ nếu bạn cần xác minh thủ công
      const { error } = await supabase.auth.verifyOtp({
        email: localStorage.getItem("otpEmail") || "",
        token: otp,
        type: "email",
      });

      if (error) throw error;

      router.push("/");
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.message || "Đã xảy ra lỗi khi xác minh OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Xác minh OTP</h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleVerifyOTP}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="otp">
            Mã OTP
          </label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? "Đang xác minh..." : "Xác minh"}
        </button>
      </form>
    </div>
  );
}