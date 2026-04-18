import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type SignupBody = {
  email?: string;
  password?: string;
  fullName?: string;
};

export async function POST(request: Request) {
  let body: SignupBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const fullName = body.fullName?.trim() ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName || null,
    },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already") || message.includes("exists")) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Ensure password and confirmation are persisted for immediate login.
  if (data.user?.id) {
    const { error: updateError } = await admin.auth.admin.updateUserById(data.user.id, {
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || null,
      },
    });
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    const start = new Date();
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 30);
    await admin
      .from("profiles")
      .update({
        plan: "BASIC",
        plan_type: "basic",
        subscription_status: "active",
        subscription_start: start.toISOString(),
        subscription_end: end.toISOString(),
        expiry_date: end.toISOString(),
        ai_requests_limit: 60,
        ai_requests_used: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.user.id);
  }

  return NextResponse.json({ ok: true });
}
