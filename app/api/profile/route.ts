import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("name, email, image, email_verified")
    .eq("email", session.user.email)
    .single();

  if (error) {
    console.error("DB error:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }

  return NextResponse.json({
    name: data.name,
    email: data.email,
    image: data.image,
    emailVerified: data.email_verified,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, image } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  if (image !== null && typeof image !== "string") {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ name, image })
    .eq("email", session.user.email)
    .select("name, image, email_verified")
    .single();

  if (error) {
    console.error("DB error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }

  return NextResponse.json({
    message: "Profile updated",
    name: data.name,
    image: data.image,
    emailVerified: data.email_verified,
  });
}
