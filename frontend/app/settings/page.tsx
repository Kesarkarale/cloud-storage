"use client";

import {
  Bell,
  Check,
  ChevronRight,
  Cloud,
  Eye,
  Globe,
  KeyRound,
  Lock,
  Moon,
  Monitor,
  Palette,
  Save,
  ShieldCheck,
  Sun,
  User,
  HardDrive,
} from "lucide-react";
import { useEffect, useState } from "react";

import DashboardShell from "../components/DashboardShell";

type Theme = "light" | "dark" | "system";

export default function SettingsPage() {
  const [activeTab, setActiveTab] =
    useState("Profile");

  const [theme, setTheme] =
    useState<Theme>("system");

  const [name, setName] =
    useState("CloudVault User");

  const [email, setEmail] =
    useState("user@example.com");

  const [notifications, setNotifications] =
    useState({
      email: true,
      shared: true,
      security: true,
      storage: false,
    });

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    const storedTheme =
      localStorage.getItem(
        "cloudvault-theme"
      ) as Theme | null;

    if (
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "system"
    ) {
      setTheme(storedTheme);
    }
  }, []);

  function changeTheme(value: Theme) {
    setTheme(value);

    localStorage.setItem(
      "cloudvault-theme",
      value
    );

    const root =
      document.documentElement;

    if (value === "dark") {
      root.classList.add("dark");
    } else if (value === "light") {
      root.classList.remove("dark");
    } else {
      const dark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;

      root.classList.toggle(
        "dark",
        dark
      );
    }
  }

  function saveProfile() {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  const tabs = [
    {
      name: "Profile",
      icon: User,
    },
    {
      name: "Appearance",
      icon: Palette,
    },
    {
      name: "Notifications",
      icon: Bell,
    },
    {
      name: "Security",
      icon: ShieldCheck,
    },
    {
      name: "Storage",
      icon: HardDrive,
    },
  ];

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =============================== */}
        {/* HEADER */}
        {/* =============================== */}

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <Palette className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
            </div>

            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Preferences
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage your account, appearance,
            notifications and storage preferences.
          </p>
        </div>

        {/* =============================== */}
        {/* LAYOUT */}
        {/* =============================== */}

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">

          {/* ============================= */}
          {/* SIDEBAR */}
          {/* ============================= */}

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active =
                activeTab === tab.name;

              return (
                <button
                  key={tab.name}
                  onClick={() =>
                    setActiveTab(tab.name)
                  }
                  className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition last:mb-0 ${
                    active
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />

                  <span>{tab.name}</span>

                  {active && (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </button>
              );
            })}
          </aside>

          {/* ============================= */}
          {/* CONTENT */}
          {/* ============================= */}

          <div className="min-w-0">

            {activeTab === "Profile" && (
              <ProfileSettings
                name={name}
                email={email}
                setName={setName}
                setEmail={setEmail}
                saved={saved}
                onSave={saveProfile}
              />
            )}

            {activeTab === "Appearance" && (
              <AppearanceSettings
                theme={theme}
                onThemeChange={changeTheme}
              />
            )}

            {activeTab === "Notifications" && (
              <NotificationSettings
                notifications={notifications}
                setNotifications={
                  setNotifications
                }
              />
            )}

            {activeTab === "Security" && (
              <SecuritySettings />
            )}

            {activeTab === "Storage" && (
              <StorageSettings />
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

/* ========================================= */
/* PROFILE SETTINGS */
/* ========================================= */

function ProfileSettings({
  name,
  email,
  setName,
  setEmail,
  saved,
  onSave,
}: {
  name: string;
  email: string;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <SettingsCard
      title="Profile Information"
      description="Update your personal information and account details."
    >
      {/* Avatar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-blue-600/20">
          {name
            .charAt(0)
            .toUpperCase()}
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Profile Photo
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Your profile photo will be visible
            across CloudVault.
          </p>

          <button className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">
            Change Photo
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">

        <InputField
          label="Full Name"
          value={name}
          onChange={setName}
          icon={<User />}
        />

        <InputField
          label="Email Address"
          value={email}
          onChange={setEmail}
          icon={<Globe />}
          type="email"
        />
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Account Type
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
          <Cloud className="h-5 w-5 text-blue-500" />

          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              Standard Account
            </p>

            <p className="text-xs text-slate-400">
              CloudVault personal storage
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </SettingsCard>
  );
}

/* ========================================= */
/* APPEARANCE */
/* ========================================= */

function AppearanceSettings({
  theme,
  onThemeChange,
}: {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}) {
  return (
    <SettingsCard
      title="Appearance"
      description="Customize how CloudVault looks on your device."
    >
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Theme
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Choose your preferred interface theme.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">

        <ThemeOption
          title="Light"
          description="Bright interface"
          icon={<Sun />}
          active={theme === "light"}
          onClick={() =>
            onThemeChange("light")
          }
        />

        <ThemeOption
          title="Dark"
          description="Easy on the eyes"
          icon={<Moon />}
          active={theme === "dark"}
          onClick={() =>
            onThemeChange("dark")
          }
        />

        <ThemeOption
          title="System"
          description="Use device setting"
          icon={<Monitor />}
          active={theme === "system"}
          onClick={() =>
            onThemeChange("system")
          }
        />
      </div>

      <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
        <div className="flex gap-3">
          <Palette className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />

          <div>
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              Theme preference saved automatically
            </h3>

            <p className="mt-1 text-xs leading-5 text-blue-700/70 dark:text-blue-300/70">
              Your selected theme will be remembered
              the next time you open CloudVault.
            </p>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

/* ========================================= */
/* NOTIFICATIONS */
/* ========================================= */

function NotificationSettings({
  notifications,
  setNotifications,
}: {
  notifications: {
    email: boolean;
    shared: boolean;
    security: boolean;
    storage: boolean;
  };
  setNotifications: React.Dispatch<
    React.SetStateAction<{
      email: boolean;
      shared: boolean;
      security: boolean;
      storage: boolean;
    }>
  >;
}) {
  return (
    <SettingsCard
      title="Notifications"
      description="Choose which notifications you want to receive."
    >
      <div className="divide-y divide-slate-100 dark:divide-white/5">

        <NotificationRow
          title="Email Notifications"
          description="Receive important account updates by email."
          enabled={notifications.email}
          onChange={(value) =>
            setNotifications((current) => ({
              ...current,
              email: value,
            }))
          }
        />

        <NotificationRow
          title="File Sharing"
          description="Get notified when someone shares a file with you."
          enabled={notifications.shared}
          onChange={(value) =>
            setNotifications((current) => ({
              ...current,
              shared: value,
            }))
          }
        />

        <NotificationRow
          title="Security Alerts"
          description="Receive alerts about important security events."
          enabled={notifications.security}
          onChange={(value) =>
            setNotifications((current) => ({
              ...current,
              security: value,
            }))
          }
        />

        <NotificationRow
          title="Storage Alerts"
          description="Notify me when my storage is almost full."
          enabled={notifications.storage}
          onChange={(value) =>
            setNotifications((current) => ({
              ...current,
              storage: value,
            }))
          }
        />
      </div>
    </SettingsCard>
  );
}

/* ========================================= */
/* SECURITY */
/* ========================================= */

function SecuritySettings() {
  return (
    <div className="space-y-5">

      <SettingsCard
        title="Security"
        description="Protect your CloudVault account and manage authentication."
      >
        <div className="space-y-4">

          <SecurityRow
            icon={<KeyRound />}
            title="Password"
            description="Change your account password regularly."
            action="Change Password"
          />

          <SecurityRow
            icon={<Lock />}
            title="Two-Factor Authentication"
            description="Add an extra layer of protection to your account."
            action="Enable"
          />

          <SecurityRow
            icon={<ShieldCheck />}
            title="Active Sessions"
            description="Review devices currently signed in to your account."
            action="View Sessions"
          />
        </div>
      </SettingsCard>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/20 dark:bg-red-500/10">
        <h3 className="font-semibold text-red-700 dark:text-red-400">
          Danger Zone
        </h3>

        <p className="mt-2 text-sm leading-6 text-red-600/70 dark:text-red-300/70">
          Deleting your account permanently removes
          your profile and associated data.
        </p>

        <button className="mt-5 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10">
          Delete Account
        </button>
      </div>
    </div>
  );
}

/* ========================================= */
/* STORAGE */
/* ========================================= */

function StorageSettings() {
  const used = 3.8;
  const total = 10;
  const percentage =
    (used / total) * 100;

  return (
    <SettingsCard
      title="Storage"
      description="Monitor your CloudVault storage usage."
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
              <HardDrive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Cloud Storage
              </p>

              <p className="text-xs text-slate-400">
                Standard storage plan
              </p>
            </div>
          </div>

          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {used} GB / {total} GB
          </p>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <div className="mt-3 flex justify-between text-xs text-slate-400">
          <span>
            {percentage.toFixed(0)}% used
          </span>

          <span>
            {(total - used).toFixed(1)} GB remaining
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StorageItem
          title="Documents"
          value="1.4 GB"
        />

        <StorageItem
          title="Images"
          value="1.7 GB"
        />

        <StorageItem
          title="Other Files"
          value="0.7 GB"
        />
      </div>
    </SettingsCard>
  );
}

/* ========================================= */
/* COMMON SETTINGS CARD */
/* ========================================= */

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

      <div className="border-b border-slate-200 px-6 py-5 dark:border-white/10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {description}
        </p>
      </div>

      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

/* ========================================= */
/* INPUT */
/* ========================================= */

function InputField({
  label,
  value,
  onChange,
  icon,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <span className="[&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        </div>

        <input
          type={type}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>
    </div>
  );
}

/* ========================================= */
/* THEME OPTION */
/* ========================================= */

function ThemeOption({
  title,
  description,
  icon,
  active,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-2xl border p-5 text-left transition ${
        active
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10 dark:border-blue-500 dark:bg-blue-500/10"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
      }`}
    >
      {active && (
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
          <Check className="h-3.5 w-3.5" />
        </div>
      )}

      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${
          active
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
        }`}
      >
        {icon}
      </div>

      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </button>
  );
}

/* ========================================= */
/* NOTIFICATION ROW */
/* ========================================= */

function NotificationRow({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {description}
        </p>
      </div>

      <button
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-blue-600"
            : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

/* ========================================= */
/* SECURITY ROW */
/* ========================================= */

function SecurityRow({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center dark:border-white/10">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        {icon}
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {description}
        </p>
      </div>

      <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">
        {action}
      </button>
    </div>
  );
}

/* ========================================= */
/* STORAGE ITEM */
/* ========================================= */

function StorageItem({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
      <p className="text-xs text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
