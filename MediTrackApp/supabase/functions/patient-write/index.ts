import { encrypt, encryptIfPresent } from "../_shared/encryption.ts";
import { badRequest, forbidden, ok, unauthorized } from "../_shared/http.ts";
import { requireAuthUser, serviceClient } from "../_shared/supabase.ts";

type Action = "create" | "update" | "delete";

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") return badRequest("Only POST is allowed");
    const authUser = await requireAuthUser(req);
    const body = await req.json();
    const action = body?.action as Action | undefined;
    const doctorId = body?.doctorId as string | undefined;

    if (!action || !doctorId) return badRequest("action and doctorId are required");
    if (doctorId !== authUser.id) return forbidden("doctorId mismatch");

    const { data: dbUser } = await serviceClient
      .from("users")
      .select("account_status")
      .eq("id", authUser.id)
      .single();
    if (!dbUser || dbUser.account_status !== "active") return forbidden("Account is not active");

    if (action === "create") {
      const payload = body?.payload ?? {};
      if (!payload?.name || !payload?.phone) return badRequest("name and phone are required");

      const { data: row, error } = await serviceClient
        .from("patients")
        .insert({
          id: crypto.randomUUID().replaceAll("-", "").slice(0, 25),
          doctor_id: doctorId,
          encrypted_name: await encrypt(payload.name),
          encrypted_phone: await encrypt(payload.phone),
          encrypted_email: await encryptIfPresent(payload.email),
          encrypted_notes: await encryptIfPresent(payload.notes),
          birth_date: payload.birthDate ? new Date(payload.birthDate).toISOString() : null,
          gender: payload.gender || null,
        })
        .select()
        .single();

      if (error || !row) return badRequest(error?.message ?? "create failed");
      return ok({ row });
    }

    if (action === "update") {
      const id = body?.id as string | undefined;
      const payload = body?.payload ?? {};
      if (!id) return badRequest("id is required");

      const { data: existing } = await serviceClient
        .from("patients")
        .select("id")
        .eq("id", id)
        .eq("doctor_id", doctorId)
        .maybeSingle();
      if (!existing) return badRequest("NOT_FOUND", "NOT_FOUND");

      const updateData: Record<string, unknown> = {};
      if (payload.name !== undefined) updateData.encrypted_name = await encrypt(payload.name);
      if (payload.phone !== undefined) updateData.encrypted_phone = await encrypt(payload.phone);
      if (payload.email !== undefined) updateData.encrypted_email = await encryptIfPresent(payload.email);
      if (payload.notes !== undefined) updateData.encrypted_notes = await encryptIfPresent(payload.notes);
      if (payload.birthDate !== undefined) {
        updateData.birth_date = payload.birthDate ? new Date(payload.birthDate).toISOString() : null;
      }
      if (payload.gender !== undefined) updateData.gender = payload.gender;

      const { data: row, error } = await serviceClient
        .from("patients")
        .update(updateData)
        .eq("id", id)
        .eq("doctor_id", doctorId)
        .select()
        .single();
      if (error || !row) return badRequest(error?.message ?? "update failed");
      return ok({ row });
    }

    if (action === "delete") {
      const id = body?.id as string | undefined;
      if (!id) return badRequest("id is required");

      const { data: existing } = await serviceClient
        .from("patients")
        .select("id")
        .eq("id", id)
        .eq("doctor_id", doctorId)
        .maybeSingle();
      if (!existing) return badRequest("NOT_FOUND", "NOT_FOUND");

      const { error } = await serviceClient.from("patients").delete().eq("id", id).eq("doctor_id", doctorId);
      if (error) return badRequest(error.message);
      return ok({ success: true });
    }

    return badRequest("Unsupported action");
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return badRequest(error instanceof Error ? error.message : "Unknown error");
  }
});

