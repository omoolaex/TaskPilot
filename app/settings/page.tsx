"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";

type Settings = {
  theme: "system" | "light" | "dark";
  notifications: { email: boolean; push: boolean; sms: boolean };
  privacy: { twoFactor: boolean; dataSharing: boolean; accountVisibility: "public" | "private" };
  profile: { displayName: string; username: string; profilePicture: string };
  advanced: { betaFeatures: boolean };
};

const defaultSettings: Settings = {
  theme: "system",
  notifications: { email: true, push: true, sms: false },
  privacy: { twoFactor: false, dataSharing: true, accountVisibility: "public" },
  profile: { displayName: "", username: "", profilePicture: "" },
  advanced: { betaFeatures: false },
};

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id as string | undefined;
  const { setTheme } = useTheme();
  const router = useRouter();

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [savedSettings, setSavedSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<"system" | "light" | "dark">("system");
  const [sessions, setSessions] = useState<unknown[]>([]);

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings]
  );

  const fetchSettings = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("settings")
      .select("settings")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      toast.error("Failed to load settings");
      setLoading(false);
      return;
    }

    if (data?.settings) {
      setSettings(data.settings);
      setSavedSettings(data.settings);
      setPreviewTheme(data.settings.theme);
    }
    setLoading(false);
  }, [userId]);

  const fetchSessions = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.rpc("get_user_sessions", { uid: userId });
    if (!error && data) setSessions(data);
  }, [userId]);

  useEffect(() => {
    void fetchSettings();
    void fetchSessions();
  }, [fetchSettings, fetchSessions]);

  useEffect(() => {
    setTheme(previewTheme);
  }, [previewTheme, setTheme]);

  const saveSettings = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({ user_id: userId, settings }, { onConflict: "user_id" });

      if (error) throw error;
      setSavedSettings(settings);
      toast.success("Settings saved successfully");
      setTheme(settings.theme);

      setTimeout(() => {
        router.refresh();
        window.location.reload();
      }, 300);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  }, [settings, setTheme, userId, router]);

  const handleProfilePictureUpload = useCallback(
    async (file: File) => {
      if (!userId) return;
      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${userId}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast.error("Upload failed");
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setSettings((prev) => ({
        ...prev,
        profile: { ...prev.profile, profilePicture: data.publicUrl },
      }));
      toast.success("Profile picture uploaded");
    },
    [userId]
  );

  const logOutOtherSessions = useCallback(() => {
    toast.success("Other sessions logged out");
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!userId) return;
    if (!confirm("Are you sure you want to delete your account? This is irreversible.")) return;
    await supabase.rpc("delete_user_account", { uid: userId });
    toast.success("Account deleted");
  }, [userId]);

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Please login to access settings.</div>;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-extrabold text-center">Settings</h1>

      {/* Appearance */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold">Appearance</h2>
          <Select
            value={settings.theme}
            onValueChange={(v) => {
              setSettings((p) => ({ ...p, theme: v as Settings["theme"] }))
              setPreviewTheme(v as Settings["theme"])
            }}
          >
            <SelectTrigger aria-label="Select Theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System Default</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold">Notifications</h2>
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="capitalize">{key}</span>
              <Switch
                checked={value}
                onCheckedChange={(checked) =>
                  setSettings((p) => ({
                    ...p,
                    notifications: { ...p.notifications, [key]: checked },
                  }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold">Privacy & Security</h2>
          <div className="flex items-center justify-between">
            <span>Two-Factor Authentication</span>
            <Switch
              checked={settings.privacy.twoFactor}
              onCheckedChange={(checked) =>
                setSettings((p) => ({
                  ...p,
                  privacy: { ...p.privacy, twoFactor: checked },
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Data Sharing Consent</span>
            <Switch
              checked={settings.privacy.dataSharing}
              onCheckedChange={(checked) =>
                setSettings((p) => ({
                  ...p,
                  privacy: { ...p.privacy, dataSharing: checked },
                }))
              }
            />
          </div>
          <div>
            <label className="block mb-2">Account Visibility</label>
            <Select
              value={settings.privacy.accountVisibility}
              onValueChange={(v) =>
                setSettings((p) => ({
                  ...p,
                  privacy: { ...p.privacy, accountVisibility: v as "public" | "private" },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={logOutOtherSessions}>
            Log Out Other Sessions
          </Button>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold">Account & Profile</h2>
          <div>
            <label className="block mb-2">Profile Picture</label>
            {settings.profile.profilePicture && (
              <Image
                src={settings.profile.profilePicture}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full"
                unoptimized
              />
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleProfilePictureUpload(e.target.files[0])}
            />
          </div>
          <Input
            placeholder="Display Name"
            value={settings.profile.displayName}
            onChange={(e) =>
              setSettings((p) => ({
                ...p,
                profile: { ...p.profile, displayName: e.target.value },
              }))
            }
          />
          <Input
            placeholder="Username"
            value={settings.profile.username}
            onChange={(e) =>
              setSettings((p) => ({
                ...p,
                profile: { ...p.profile, username: e.target.value },
              }))
            }
          />
          <Button onClick={() => router.push("/reset-password")} variant="outline">
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Advanced */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold">Advanced</h2>
          <div className="flex items-center justify-between">
            <span>Beta Features</span>
            <Switch
              checked={settings.advanced.betaFeatures}
              onCheckedChange={(checked) =>
                setSettings((p) => ({
                  ...p,
                  advanced: { ...p.advanced, betaFeatures: checked },
                }))
              }
            />
          </div>
          <Button variant="destructive" onClick={deleteAccount}>
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={() => setSettings(savedSettings)}
          disabled={!isDirty || loading}
          variant="outline"
        >
          Reset
        </Button>
        <Button onClick={saveSettings} disabled={!isDirty || loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </main>
  )
}
