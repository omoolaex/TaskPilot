import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email_verified")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.email_verified) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    // Generate new token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // Delete existing tokens for user (optional but recommended)
    await supabaseAdmin.from("email_verifications").delete().eq("user_id", user.id);

    // Insert new token
    const { error: tokenInsertError } = await supabaseAdmin
      .from("email_verifications")
      .insert([
        {
          user_id: user.id,
          token,
          expires_at: expiresAt,
        },
      ]);

    if (tokenInsertError) {
      console.error("Error inserting verification token:", tokenInsertError);
      return NextResponse.json({ error: "Failed to create verification token" }, { status: 500 });
    }

    // Send email
    await sendVerificationEmail(email, token);

    return NextResponse.json({ message: "Verification email resent successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error in resend verification:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
