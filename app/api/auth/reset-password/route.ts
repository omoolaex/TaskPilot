// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and new password are required." },
        { status: 400 }
      );
    }

    // Find token record
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("id, user_id, expires_at")
      .eq("token", token)
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });
    }

    // Check expiry
    if (new Date(tokenRecord.expires_at) < new Date()) {
      await supabaseAdmin
        .from("password_reset_tokens")
        .delete()
        .eq("id", tokenRecord.id);

      return NextResponse.json({ error: "Token has expired." }, { status: 400 });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(password, 10);

    // Update user's password hash
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password_hash })
      .eq("id", tokenRecord.user_id);

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
    }

    // Delete token
    await supabaseAdmin.from("password_reset_tokens").delete().eq("id", tokenRecord.id);

    return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
