const ENV = {
  ENV: process.env.NEXT_PUBLIC_ENV ?? "",
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export default ENV;