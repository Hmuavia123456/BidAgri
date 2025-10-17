export async function POST(request) {
  const body = await request.json();
  const { mode, email, password } = body || {};

  // Very simple mock: accept if email includes '@' and password meets minimum
  const okEmail = /.+@.+\..+/.test(email || "");
  const okPassword = (password || "").length >= 8 && /[A-Z]/.test(password || "") && /[0-9]/.test(password || "");

  if (okEmail && okPassword) {
    return Response.json({ status: "ok", message: `${mode || "login"} success` });
  }
  return new Response(JSON.stringify({ status: "error", message: "Invalid credentials" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

