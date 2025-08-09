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
  privacy: {
    twoFactor: boolean;
    dataSharing: boolean;
    accountVisibility: "public" | "private";
  };
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
  const [previewTheme, setPreviewTheme] = useState<Settings["theme"]>("system");

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings]
  );

  // Fetch settings on mount
  const fetchSettings = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("settings")
        .select("settings")
        .eq("user_id", userId)
        .single();

      if (error && (error.code as string) !== "PGRST116") {
        console.error("Supabase error loading settings:", error);
        toast.error("Failed to load settings");
        setLoading(false);
        return;
      }

      if (data?.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
        setSavedSettings(data.settings);
        setPreviewTheme(data.settings.theme ?? "system");
      } else {
        setSettings(defaultSettings);
        setSavedSettings(defaultSettings);
        setPreviewTheme(defaultSettings.theme);
      }
    } catch (err: unknown) {
      console.error("Unexpected error fetching settings:", err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

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

      if (error) {
        console.error("Error saving settings:", error);
        throw error;
      }

      setSavedSettings(settings);
      toast.success("Settings saved successfully");
      setTheme(settings.theme);

      setTimeout(() => {
        router.refresh();
        void window.location.reload();
      }, 300);
    } catch (err: unknown) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  }, [settings, setTheme, userId, router]);

  const handleProfilePictureUpload = useCallback(
    async (file: File) => {
      if (!userId) return;
      const fileExt = file.name.split(".").pop();
      if (!fileExt) {
        toast.error("Invalid file type");
        return;
      }
      const filePath = `avatars/${userId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Upload failed");
        return;
      }

      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (publicData?.publicUrl) {
        setSettings((prev) => ({
          ...prev,
          profile: { ...prev.profile, profilePicture: publicData.publicUrl },
        }));

        // Sync profile picture to users.image column
        const { error: updateError } = await supabase
          .from("users")
          .update({ image: publicData.publicUrl })
          .eq("id", userId);

        if (updateError) {
          toast.error("Failed to update profile picture in user profile");
        } else {
          toast.success("Profile picture uploaded");
        }
      } else {
        toast.error("Failed to get public URL");
      }
    },
    [userId]
  );

  const logOutOtherSessions = useCallback(() => {
    toast.success("Other sessions logged out");
    // TODO: Implement actual logic to invalidate other sessions if needed
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!userId) return;
    if (
      !confirm(
        "Are you sure you want to delete your account? This action is irreversible."
      )
    )
      return;

    try {
      const { error } = await supabase.rpc("delete_user_account", { uid: userId });
      if (error) {
        console.error("Delete account error:", error);
        toast.error("Failed to delete account");
        return;
      }
      toast.success("Account deleted");
      router.push("/");
    } catch (err: unknown) {
      console.error("Unexpected delete account error:", err);
      toast.error("Failed to delete account");
    }
  }, [userId, router]);

  // Password change handler
  const handleChangePassword = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    setPasswordLoading(true);

    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to change password");

      toast.success("Password changed successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  if (status === "loading")
    return (
      <div className="text-center py-12 text-lg font-semibold">Loading...</div>
    );
  if (!session)
    return (
      <div className="text-center py-12 text-lg font-semibold">
        Please login to access settings.
      </div>
    );

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-10">
      <h1 className="text-4xl font-extrabold text-center">Settings</h1>

      {/* Appearance */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold">Appearance</h2>
          <label htmlFor="themeSelect" className="block mb-2 font-medium cursor-pointer">
            Theme
          </label>
          <Select
            value={settings.theme}
            onValueChange={(v) => {
              setSettings((p) => ({ ...p, theme: v as Settings["theme"] }));
              setPreviewTheme(v as Settings["theme"]);
            }}
            disabled={loading}
          >
            <SelectTrigger id="themeSelect" aria-label="Select Theme">
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
            <div
              key={key}
              className="flex items-center justify-between"
              role="group"
              aria-label={`Toggle ${key} notifications`}
            >
              <span className="capitalize">{key}</span>
              <Switch
                checked={value}
                onCheckedChange={(checked) =>
                  setSettings((p) => ({
                    ...p,
                    notifications: { ...p.notifications, [key]: checked },
                  }))
                }
                disabled={loading}
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
            <label htmlFor="twoFactor" className="cursor-pointer">
              Two-Factor Authentication
            </label>
            <Switch
              id="twoFactor"
              checked={settings.privacy.twoFactor}
              onCheckedChange={(checked) =>
                setSettings((p) => ({
                  ...p,
                  privacy: { ...p.privacy, twoFactor: checked },
                }))
              }
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="dataSharing" className="cursor-pointer">
              Data Sharing Consent
            </label>
            <Switch
              id="dataSharing"
              checked={settings.privacy.dataSharing}
              onCheckedChange={(checked) =>
                setSettings((p) => ({
                  ...p,
                  privacy: { ...p.privacy, dataSharing: checked },
                }))
              }
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="accountVisibility"
              className="block mb-2 font-medium cursor-pointer"
            >
              Account Visibility
            </label>
            <Select
              value={settings.privacy.accountVisibility}
              onValueChange={(v) =>
                setSettings((p) => ({
                  ...p,
                  privacy: { ...p.privacy, accountVisibility: v as "public" | "private" },
                }))
              }
              disabled={loading}
            >
              <SelectTrigger id="accountVisibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={logOutOtherSessions} disabled={loading}>
            Log Out Other Sessions
          </Button>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold">Account & Profile</h2>
          <div>
            <label className="block mb-2 font-medium">Profile Picture</label>
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
              onChange={(e) =>
                e.target.files && handleProfilePictureUpload(e.target.files[0])
              }
              disabled={loading}
            />
          </div>
          <label htmlFor="displayName" className="block mt-2 mb-1 font-medium">
            Display Name
          </label>
          <Input
            id="displayName"
            placeholder="Display Name"
            value={settings.profile.displayName}
            onChange={(e) =>
              setSettings((p) => ({
                ...p,
                profile: { ...p.profile, displayName: e.target.value },
              }))
            }
            disabled={loading}
          />
          <label htmlFor="username" className="block mt-2 mb-1 font-medium">
            Username
          </label>
          <Input
            id="username"
            placeholder="Username"
            value={settings.profile.username}
            onChange={(e) =>
              setSettings((p) => ({
                ...p,
                profile: { ...p.profile, username: e.target.value },
              }))
            }
            disabled={loading}
          />
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold">Change Password</h2>
          <label htmlFor="currentPassword" className="block mb-1 font-medium">
            Current Password
          </label>
          <Input
            id="currentPassword"
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={passwordLoading || loading}
          />
          <label htmlFor="newPassword" className="block mb-1 font-medium">
            New Password
          </label>
          <Input
            id="newPassword"
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={passwordLoading || loading}
          />
          <label htmlFor="confirmPassword" className="block mb-1 font-medium">
            Confirm New Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={passwordLoading || loading}
          />
          <Button
            onClick={handleChangePassword}
            disabled={passwordLoading || loading}
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Advanced */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold">Advanced</h2>
          <div className="flex items-center justify-between">
            <label htmlFor="betaFeatures" className="cursor-pointer">
              Beta Features
            </label>
            <Switch
              id="betaFeatures"
              checked={settings.advanced.betaFeatures}
              onCheckedChange={(checked) =>
                setSettings((p) => ({
                  ...p,
                  advanced: { ...p.advanced, betaFeatures: checked },
                }))
              }
              disabled={loading}
            />
          </div>
          <Button variant="destructive" onClick={deleteAccount} disabled={loading}>
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
  );
}
