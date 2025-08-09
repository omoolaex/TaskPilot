// app/api/auth/request-password-reset/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id, email, email_verified")
    .eq("email", email)
    .single();


    // Always respond success to prevent enumeration
    if (userError || !user) {
      return NextResponse.json(
        { message: "If the email exists, a reset link will be sent." },
        { status: 200 }
      );
    }

    if (!user.email_verified) {
      return NextResponse.json(
        { error: "Email is not verified." },
        { status: 400 }
      );
    }

    // Delete old tokens for user
    await supabaseAdmin.from("password_reset_tokens").delete().eq("user_id", user.id);

    // Generate reset token and expiry
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Insert new reset token
    const { error: insertError } = await supabaseAdmin
      .from("password_reset_tokens")
      .insert([{ user_id: user.id, token, expires_at: expiresAt }]);

    if (insertError) {
      console.error("Error inserting password reset token:", insertError);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    // Send password reset email
    await sendPasswordResetEmail(user.email, token);

    return NextResponse.json(
      { message: "If the email exists, a reset link will be sent." },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
