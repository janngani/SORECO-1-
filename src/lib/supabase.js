import { createClient } from "@supabase/supabase-js";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (typeof process !== "undefined" && process.env?.SUPABASE_URL) || "https://uwvczqzigjxusfkeddji.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (typeof process !== "undefined" && process.env?.SUPABASE_ANON_KEY) || "sb_publishable_PSs2NvkGW8rqp69Ttf3Vig_1w1r_amV";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
