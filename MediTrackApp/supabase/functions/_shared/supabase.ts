import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL, SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY");
}

export const anonClient = createClient(supabaseUrl, supabaseAnonKey);
export const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function requireAuthUser(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) throw new Error("UNAUTHORIZED");

  const { data, error } = await anonClient.auth.getUser(token);
  if (error || !data.user) throw new Error("UNAUTHORIZED");

  return data.user;
}

