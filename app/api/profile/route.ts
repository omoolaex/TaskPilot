import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
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
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      name: data.name,
      email: data.email,
      image: data.image,
      emailVerified: data.email_verified,
    });
  } catch (_error: unknown) {
    const message =
      _error instanceof Error ? _error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface ProfileUpdateBody {
  name: string;
  image: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ProfileUpdateBody = await req.json();

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    if (body.image !== null && typeof body.image !== "string") {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({ name: body.name, image: body.image })
      .eq("email", session.user.email)
      .select("name, image, email_verified")
      .single();

    if (error) {
      console.error("DB error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Profile updated",
      name: data.name,
      image: data.image,
      emailVerified: data.email_verified,
    });
  } catch (_error: unknown) {
    const message =
      _error instanceof Error ? _error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
