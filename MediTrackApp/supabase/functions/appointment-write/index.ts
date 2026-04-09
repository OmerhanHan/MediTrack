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
      if (!payload?.patientName || !payload?.phone || !payload?.date || !payload?.time) {
        return badRequest("patientName, phone, date and time are required");
      }

      const { data: conflict } = await serviceClient
        .from("appointments")
        .select("id")
        .eq("doctor_id", doctorId)
        .eq("date", payload.date)
        .eq("time", payload.time)
        .maybeSingle();
      if (conflict) return badRequest("APPOINTMENT_CONFLICT", "APPOINTMENT_CONFLICT");

      const { data: row, error } = await serviceClient
        .from("appointments")
        .insert({
          id: crypto.randomUUID().replaceAll("-", "").slice(0, 25),
          doctor_id: doctorId,
          encrypted_name: await encrypt(payload.patientName),
          encrypted_phone: await encrypt(payload.phone),
          date: payload.date,
          time: payload.time,
          encrypted_notes: await encryptIfPresent(payload.notes),
          type: payload.notes?.split(" ")[0] || null,
          status: "upcoming",
        })
        .select()
        .single();
      if (error || !row) return badRequest(error?.message ?? "create failed");
      return ok({ row });
    }

    if (action === "update") {
      const appointmentId = body?.appointmentId as string | undefined;
      const payload = body?.payload ?? {};
      if (!appointmentId) return badRequest("appointmentId is required");

      const { data: existing } = await serviceClient
        .from("appointments")
        .select("id")
        .eq("id", appointmentId)
        .eq("doctor_id", doctorId)
        .maybeSingle();
      if (!existing) return badRequest("APPOINTMENT_NOT_FOUND", "APPOINTMENT_NOT_FOUND");

      const updateData: Record<string, unknown> = {};
      if (payload.date) updateData.date = payload.date;
      if (payload.time) updateData.time = payload.time;
      if (payload.notes !== undefined) {
        updateData.encrypted_notes = await encryptIfPresent(payload.notes);
        if (payload.notes) updateData.type = payload.notes.split(" ")[0];
      }
      if (payload.status) updateData.status = payload.status;

      const { data: row, error } = await serviceClient
        .from("appointments")
        .update(updateData)
        .eq("id", appointmentId)
        .eq("doctor_id", doctorId)
        .select()
        .single();
      if (error || !row) return badRequest(error?.message ?? "update failed");
      return ok({ row });
    }

    if (action === "delete") {
      const appointmentId = body?.appointmentId as string | undefined;
      if (!appointmentId) return badRequest("appointmentId is required");

      const { data: existing } = await serviceClient
        .from("appointments")
        .select("id")
        .eq("id", appointmentId)
        .eq("doctor_id", doctorId)
        .maybeSingle();
      if (!existing) return badRequest("APPOINTMENT_NOT_FOUND", "APPOINTMENT_NOT_FOUND");

      const { error } = await serviceClient
        .from("appointments")
        .delete()
        .eq("id", appointmentId)
        .eq("doctor_id", doctorId);
      if (error) return badRequest(error.message);
      return ok({ success: true });
    }

    return badRequest("Unsupported action");
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return unauthorized();
    return badRequest(error instanceof Error ? error.message : "Unknown error");
  }
});

