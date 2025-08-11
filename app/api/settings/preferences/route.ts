import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // server-side Supabase client with service key
import { getServerSession } from "next-auth/next"; // note /next here
import { authOptions } from "@/lib/authOptions"; // your NextAuth config

interface PreferencesRequestBody {
  theme?: string;
  language?: string;
  notifications?: boolean;
  privacyMode?: boolean;
  defaultDashboard?: string;
  aiTone?: string;
  favoriteCategories?: string[];
}

// Helper to map DB snake_case to camelCase
function mapPrefsToCamelCase(prefs: any) {
  if (!prefs) return null;
  return {
    theme: prefs.theme,
    language: prefs.language,
    notifications: prefs.notifications,
    privacyMode: prefs.privacy_mode,
    defaultDashboard: prefs.default_dashboard,
    aiTone: prefs.ai_tone,
    favoriteCategories: prefs.favorite_categories,
  };
}

export async function GET(_: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("user_preferences")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found, safe to ignore for empty result
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        theme: "light",
        language: "en",
        notifications: true,
        privacyMode: false,
        defaultDashboard: "overview",
        aiTone: "neutral",
        favoriteCategories: [],
      });
    }

    return NextResponse.json(mapPrefsToCamelCase(data));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: PreferencesRequestBody = await request.json();

    // Validate or sanitize as needed here, e.g.:
    // if (body.theme && typeof body.theme !== 'string') { ... }

    const prefs = {
      user_id: session.user.id,
      theme: body.theme ?? "light",
      language: body.language ?? "en",
      notifications: body.notifications ?? true,
      privacy_mode: body.privacyMode ?? false,
      default_dashboard: body.defaultDashboard ?? "overview",
      ai_tone: body.aiTone ?? "neutral",
      favorite_categories: body.favoriteCategories ?? [],
    };

    const { data, error } = await supabaseAdmin
      .from("user_preferences")
      .upsert(prefs, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(mapPrefsToCamelCase(data));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
