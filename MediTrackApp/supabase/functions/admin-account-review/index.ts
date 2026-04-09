import { badRequest, forbidden, ok, unauthorized } from "../_shared/http.ts";
import { requireAuthUser, serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") return badRequest("Only POST is allowed");
    const authUser = await requireAuthUser(req);
    const { userId, status } = await req.json();

    if (!userId || !status) return badRequest("userId and status are required");
    if (!["active", "rejected"].includes(status)) return badRequest("invalid status");

    const { data: actor } = await serviceClient
      .from("users")
      .select("role, account_status")
      .eq("id", authUser.id)
      .single();

    if (!actor || actor.role !== "admin" || actor.account_status !== "active") {
      return forbidden("Only active admins can review accounts");
    }

    const { error } = await serviceClient
      .from("users")
      .update({
        account_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) return badRequest(error.message);
    return ok({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return badRequest(error instanceof Error ? error.message : "Unknown error");
  }
});

