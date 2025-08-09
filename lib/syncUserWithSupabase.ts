import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function syncUserWithSupabase({
  email,
  name,
  image,
  provider = "credentials",
}: {
  email: string;
  name?: string;
  image?: string;
  provider?: string;
}): Promise<{ supabaseId: string; isNewUser: boolean } | null> {
  if (!email) {
    console.warn("syncUserWithSupabase called without email");
    return null;
  }

  const supabase = await getSupabaseServerClient();

  // 🔒 0️⃣ Clear RLS context for insert permission
  const { error: rlsError } = await supabase.rpc("set_current_user_id", { uid: null });
  if (rlsError) {
    console.error("Failed to clear RLS context:", rlsError);
    // Not fatal, continue
  }

  // 1️⃣ Check if user exists already
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching user by email:", fetchError);
    return null;
  }

  if (existingUser) {
    // Set RLS for this user
    const { error: rlsSetError } = await supabase.rpc("set_current_user_id", { uid: existingUser.id });
    if (rlsSetError) {
      console.error("Failed to set RLS context for existing user:", rlsSetError);
      // Not fatal, proceed to return existing user
    }
    return { supabaseId: existingUser.id, isNewUser: false };
  }

  // 2️⃣ Create new user record
  const insertData = {
    email,
    name: name ?? null,
    image: image ?? null,
    provider: provider ?? "credentials",
    role: "user",
  };

  const { data: insertedUser, error: insertError } = await supabase
    .from("users")
    .insert([insertData])
    .select("id")
    .single();

  if (insertError) {
    console.error("Error inserting new user:", insertError);
    return null;
  }

  if (!insertedUser) {
    console.error("Insert succeeded but no user returned");
    return null;
  }

  const supabaseId = insertedUser.id;

  // Set RLS context for subsequent inserts
  const { error: rlsSetError2 } = await supabase.rpc("set_current_user_id", { uid: supabaseId });
  if (rlsSetError2) {
    console.error("Failed to set RLS context after user insert:", rlsSetError2);
  }

  // 3️⃣ Insert default preferences
  const { error: prefError } = await supabase.from("preferences").insert([
    {
      user_id: supabaseId,
      theme: "light",
      notifications_enabled: true,
      language: "en",
    },
  ]);
  if (prefError) {
    console.error("Error inserting default preferences:", prefError);
  }

  // 4️⃣ Create first empty chat session
  const { error: chatError } = await supabase.from("chats").insert([
    {
      user_id: supabaseId,
      title: "New Chat",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  if (chatError) {
    console.error("Error creating initial chat session:", chatError);
  }

  return { supabaseId, isNewUser: true };
}
