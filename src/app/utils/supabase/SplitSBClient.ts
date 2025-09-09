/* eslint-disable @typescript-eslint/no-explicit-any */
import ENV from "@/configs/env";
import { SupabaseClient } from "@supabase/supabase-js";
import camelcaseKeys from "camelcase-keys";

// Tạo client với kiểm tra điều kiện
let supabaseClient: SupabaseClient;

try {
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_KEY) {
    console.warn("Supabase URL or Key is missing");
  }
  supabaseClient = new SupabaseClient(
    ENV.SUPABASE_URL || "",
    ENV.SUPABASE_KEY || ""
  );
} catch (error) {
  console.error("Error initializing Supabase client:", error);
  // Fallback client that will throw appropriate errors when methods are called
  supabaseClient = {} as SupabaseClient;
}

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

  protected toCamelCase = (data: any): any => {
    return camelcaseKeys(data, { deep: true });
  };
}

export default supabaseClient;
