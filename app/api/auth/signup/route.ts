import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/sendEmail"; // Import your email sender util

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    // Handle DB error except "no rows" (PGRST116 is "No rows found")
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing user:", fetchError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    // Hash the password securely
    const password_hash = await bcrypt.hash(password, 10);

    // Insert the new user, set email_verified false initially
    const { data: insertedUser, error: insertError } = await supabaseAdmin
      .from("users")
      .insert([
        {
          email,
          password_hash,
          role: "user",
          provider: "credentials",
          email_verified: false,
        },
      ])
      .select("id")
      .single();

    if (insertError || !insertedUser) {
      console.error("Error inserting user:", insertError);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Generate a cryptographically secure random token
    const token = crypto.randomBytes(32).toString("hex");

    // Set expiry for the verification token (e.g., 30 minutes from now)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // Store the verification token linked to the user
    const { error: tokenInsertError } = await supabaseAdmin
      .from("email_verifications")
      .insert([
        {
          user_id: insertedUser.id,
          token,
          expires_at: expiresAt,
        },
      ]);

    if (tokenInsertError) {
      console.error("Error inserting verification token:", tokenInsertError);
      return NextResponse.json({ error: "Failed to create verification token" }, { status: 500 });
    }

    // Send verification email asynchronously using the imported utility
    await sendVerificationEmail(email, token);

    return NextResponse.json(
      { message: "User created successfully, verification email sent" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
