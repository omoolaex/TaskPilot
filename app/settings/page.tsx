"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase"; // Adjust path if needed

type Preferences = {
  theme: string;
  language: string;
  notifications: boolean;
  privacyMode: boolean;
  defaultDashboard: string;
  aiTone: string;
  favoriteCategories: string[];
};

export default function SettingsPage() {
  const { data: session } = useSession();

  // Profile state
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  // Original values for change detection
  const [originalName, setOriginalName] = useState("");
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Preferences state
  const [preferences, setPreferences] = useState<Preferences>({
    theme: "light",
    language: "en",
    notifications: true,
    privacyMode: false,
    defaultDashboard: "overview",
    aiTone: "neutral",
    favoriteCategories: ["AI Tools", "Analytics"],
  });

  // Saving state
  const [saving, setSaving] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();

        setName(data.name || "");
        setOriginalName(data.name || "");
        setEmail(data.email || "");
        setEmailVerified(data.emailVerified || false);
        setImage(data.image || null);
        setOriginalImage(data.image || null);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load profile");
      }
    }
    fetchProfile();
  }, []);

  // Update profile data from session if not set from API
  useEffect(() => {
    if (session?.user) {
      if (!name) setName(session.user.name || "");
      if (!email) setEmail(session.user.email || "");
      if (image === null && session.user.image) setImage(session.user.image);
      if (!emailVerified) setEmailVerified(true); // Replace with real check if needed
    }
  }, [session]);

  // Image upload handler with Supabase storage
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to upload image.");
        setSaving(false);
        return;
      }

      const data = await res.json();
      setImage(data.publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Unexpected error during image upload.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Save profile handler
  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      toast.success("Profile updated successfully!");
      setOriginalName(name);
      setOriginalImage(image);

      if (typeof data.emailVerified === "boolean") {
        setEmailVerified(data.emailVerified);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Resend verification email handler
  const handleResendVerification = async () => {
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to resend verification email");
      toast.success("Verification email sent!");
    } catch (err: any) {
      toast.error(err.message || "Error sending verification email");
    }
  };

  // Password update handler
  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword) {
      return toast.error("Please fill all password fields.");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error updating password");

      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Error updating password");
    } finally {
      setSaving(false);
    }
  };

  // Preferences save handler (simulate)
  const handlePreferencesSave = async () => {
    setSaving(true);
    try {
      await new Promise((res) => setTimeout(res, 800));
      toast.success("Preferences saved!");
    } catch {
      toast.error("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  // Detect profile form changes
  const isProfileDirty = name !== originalName || image !== originalImage;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Profile */}
      <Card title="Profile Information">
        <div className="mb-4">
          <label htmlFor="name" className="block font-medium mb-1">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">Avatar</label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border border-gray-300 relative">
              {image ? (
                <Image
                  src={image}
                  alt="Avatar preview"
                  fill
                  sizes="80px"
                  style={{ objectFit: "cover" }}
                  priority
                />
              ) : (
                <span className="text-gray-400 flex items-center justify-center h-full w-full">
                  No Image
                </span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
              aria-label="Upload avatar image"
            />
          </div>
          <p className="text-sm mt-1 text-gray-500">
            Supported formats: JPG, PNG, GIF. Max size: 5MB.
          </p>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full bg-gray-100 border rounded p-2 cursor-not-allowed"
            aria-readonly
          />
          <p
            className={`mt-1 font-semibold flex items-center space-x-2 ${
              emailVerified ? "text-green-600" : "text-red-600"
            }`}
            title={emailVerified ? "Email verified" : "Email not verified"}
          >
            {emailVerified ? (
              <>
                <span aria-hidden="true">✅</span> <span>Email Verified</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">❌</span> <span>Email Not Verified</span>
              </>
            )}
          </p>
          {!emailVerified && (
            <button
              onClick={handleResendVerification}
              className="mt-2 text-sm text-blue-600 underline hover:text-blue-800"
              type="button"
            >
              Resend Verification Email
            </button>
          )}
        </div>

        <button
          onClick={handleProfileSave}
          disabled={!isProfileDirty || saving}
          className={`mt-4 px-6 py-2 rounded text-white transition ${
            !saving && isProfileDirty
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          aria-disabled={!isProfileDirty || saving}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </Card>

      {/* Security */}
      <Card title="Account Security">
        <Input
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button onClick={handlePasswordUpdate} loading={saving} color="green">
          Update Password
        </Button>
      </Card>

      {/* Preferences */}
      <Card title="Preferences">
        <Select
          label="Theme"
          value={preferences.theme}
          onChange={(e) => setPreferences((p) => ({ ...p, theme: e.target.value }))}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ]}
        />
        <Select
          label="Language"
          value={preferences.language}
          onChange={(e) => setPreferences((p) => ({ ...p, language: e.target.value }))}
          options={[
            { value: "en", label: "English" },
            { value: "fr", label: "French" },
            { value: "es", label: "Spanish" },
          ]}
        />
        <Checkbox
          label="Enable Notifications"
          checked={preferences.notifications}
          onChange={(e) =>
            setPreferences((p) => ({ ...p, notifications: e.target.checked }))
          }
        />
        <Checkbox
          label="Enable Privacy Mode"
          checked={preferences.privacyMode}
          onChange={(e) =>
            setPreferences((p) => ({ ...p, privacyMode: e.target.checked }))
          }
        />
        <Select
          label="Default Dashboard"
          value={preferences.defaultDashboard}
          onChange={(e) =>
            setPreferences((p) => ({ ...p, defaultDashboard: e.target.value }))
          }
          options={[
            { value: "overview", label: "Overview" },
            { value: "projects", label: "Projects" },
            { value: "analytics", label: "Analytics" },
          ]}
        />
        <Select
          label="AI Tone"
          value={preferences.aiTone}
          onChange={(e) => setPreferences((p) => ({ ...p, aiTone: e.target.value }))}
          options={[
            { value: "friendly", label: "Friendly" },
            { value: "neutral", label: "Neutral" },
            { value: "formal", label: "Formal" },
          ]}
        />
        <div>
          <label className="block font-medium mb-1">Favorite Categories</label>
          <div className="flex flex-wrap gap-2">
            {preferences.favoriteCategories.map((cat) => (
              <span key={cat} className="px-3 py-1 bg-gray-200 rounded-full text-sm">
                {cat}
              </span>
            ))}
          </div>
        </div>
        <Button onClick={handlePreferencesSave} loading={saving}>
          Save Preferences
        </Button>
      </Card>
    </div>
  );
}

/* ---------------- Reusable Components ---------------- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Input({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <input
        {...props}
        className={`w-full border rounded p-2 focus:outline-none focus:ring focus:border-blue-400 ${className}`}
      />
    </div>
  );
}

function Select({
  label,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <select
        {...props}
        className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-blue-400"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Checkbox({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center space-x-2">
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}

function Button({
  children,
  loading,
  color = "blue",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  color?: "blue" | "green";
}) {
  const base =
    color === "green"
      ? "bg-green-600 hover:bg-green-700"
      : "bg-blue-600 hover:bg-blue-700";
  return (
    <button
      {...props}
      disabled={loading}
      className={`${base} text-white px-4 py-2 rounded transition disabled:opacity-50`}
    >
      {loading ? "Saving..." : children}
    </button>
  );
}
