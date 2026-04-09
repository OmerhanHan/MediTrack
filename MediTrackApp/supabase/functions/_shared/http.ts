export const jsonHeaders = {
  "Content-Type": "application/json",
};

export function ok(data: unknown) {
  return new Response(JSON.stringify(data), { status: 200, headers: jsonHeaders });
}

export function badRequest(message: string, code = "BAD_REQUEST") {
  return new Response(JSON.stringify({ error: message, code }), { status: 400, headers: jsonHeaders });
}

export function forbidden(message = "Forbidden") {
  return new Response(JSON.stringify({ error: message, code: "FORBIDDEN" }), {
    status: 403,
    headers: jsonHeaders,
  });
}

export function unauthorized(message = "Unauthorized") {
  return new Response(JSON.stringify({ error: message, code: "UNAUTHORIZED" }), {
    status: 401,
    headers: jsonHeaders,
  });
}

