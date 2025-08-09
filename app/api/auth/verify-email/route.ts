import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendVerificationSuccessEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required." },
        { status: 400 }
      );
    }

    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from("email_verifications") // Ensure table name matches your setup
      .select("id, user_id, expires_at")
      .eq("token", token)
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json(
        { error: "Invalid or expired token." },
        { status: 400 }
      );
    }

    // Check token expiry
    const now = new Date();
    if (new Date(tokenRecord.expires_at) < now) {
      await supabaseAdmin
        .from("email_verifications")
        .delete()
        .eq("id", tokenRecord.id);

      return NextResponse.json({ error: "Token has expired." }, { status: 400 });
    }

    // Update user email_verified to true
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ email_verified: true })
      .eq("id", tokenRecord.user_id);

    if (updateError) {
      console.error("Error updating user verification:", updateError);
      return NextResponse.json(
        { error: "Failed to verify email." },
        { status: 500 }
      );
    }

    // Fetch user email to send success notification
    const { data: userData, error: userFetchError } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("id", tokenRecord.user_id)
      .single();

    if (!userFetchError && userData?.email) {
      await sendVerificationSuccessEmail(userData.email);
    } else {
      console.error("Failed to fetch user email for success notification", userFetchError);
    }

    // Delete token after successful verification
    await supabaseAdmin
      .from("email_verifications")
      .delete()
      .eq("id", tokenRecord.id);

    return NextResponse.json(
      { message: "Email verified successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error in email verification:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
