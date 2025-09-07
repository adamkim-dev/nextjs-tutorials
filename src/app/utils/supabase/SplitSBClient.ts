/* eslint-disable @typescript-eslint/no-explicit-any */
import ENV from "@/configs/env";
import { SupabaseClient } from "@supabase/supabase-js";

// Kiểm tra các giá trị trước khi khởi tạo
if (!ENV.SUPABASE_URL) {
  throw new Error("supabaseUrl is required.");
}

if (!ENV.SUPABASE_KEY) {
  throw new Error("supabaseKey is required.");
}

const supabaseClient = new SupabaseClient(ENV.SUPABASE_URL, ENV.SUPABASE_KEY);

export class SplitSBClient {
  protected client: SupabaseClient;
  private signedUrlExpire = 3600;

  constructor() {
    this.client = supabaseClient;
  }

  formatDateSubmit = (date?: string | Date): string => {
    if (typeof date === "string") return date;
    if (date instanceof Date) return date.toISOString();
    throw new Error("Invalid date type");
  };
}

export default supabaseClient;
