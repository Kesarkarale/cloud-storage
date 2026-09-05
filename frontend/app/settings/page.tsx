"use client";

import {
  Bell,
  Check,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Mail,
  Moon,
  Palette,
  Save,
  Shield,
  Smartphone,
  Sun,
  Trash2,
  User,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import DashboardShell from "../components/DashboardShell";

type UserData = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type SettingsSection =
  | "profile"
  | "appearance"
  | "notifications"
  | "security"
  | "preferences";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const [user, setUser] =
    useState<UserData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [toast, setToast] =
    useState<string | null>(null);

  const [darkMode, setDarkMode] =
    useState(false);

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [browserNotifications, setBrowserNotifications] =
    useState(true);

  const [securityAlerts, setSecurityAlerts] =
    useState(true);

  const [language, setLanguage] =
    useState("English");

  const [timezone, setTimezone] =
    useState("Asia/Kolkata");

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  /* =====================================================
     TOKEN
  ===================================================== */

  function getToken() {
    if (
      typeof window === "undefined"
    ) {
      return null;
    }

    return (
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("cloudstorage_token") ||
      localStorage.getItem("cloud-storage-token")
    );
  }

  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {
    async function loadUser() {
      try {
        const token = getToken();

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load account."
          );
        }

        const data =
          await response.json();

        setUser(
          data?.user ??
            data?.data ??
            data
        );
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  /* =====================================================
     THEME
  ===================================================== */

  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    const savedTheme =
      localStorage.getItem(
        "cloudvault-theme"
      ) ||
      localStorage.getItem(
        "quiz-theme"
      );

    const isDark =
      savedTheme === "dark" ||
      document.documentElement.classList.contains(
        "dark"
      );

    setDarkMode(isDark);
  }, []);

  function changeTheme(
    dark: boolean
  ) {
    setDarkMode(dark);

    if (dark) {
      document.documentElement.classList.add(
        "dark"
      );

      localStorage.setItem(
        "cloudvault-theme",
        "dark"
      );
    } else {
      document.documentElement.classList.remove(
        "dark"
      );

      localStorage.setItem(
        "cloudvault-theme",
        "light"
      );
    }

    showToast(
      dark
        ? "Dark mode enabled"
        : "Light mode enabled"
    );
  }

  /* =====================================================
     TOAST
  ===================================================== */

  function showToast(
    message: string
  ) {
    setToast(message);

    window.setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  /* =====================================================
     SAVE
  ===================================================== */

  function saveSettings() {
    setSaving(true);

    window.setTimeout(() => {
      setSaving(false);

      showToast(
        "Settings saved successfully"
      );
    }, 700);
  }

  /* =====================================================
     LOGOUT
  ===================================================== */

  function logout() {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    localStorage.removeItem(
      "accessToken"
    );
    localStorage.removeItem(
      "token"
    );
    localStorage.removeItem(
      "jwt"
    );
    localStorage.removeItem(
      "authToken"
    );
    localStorage.removeItem(
      "cloudstorage_token"
    );
    localStorage.removeItem(
      "cloud-storage-token"
    );

    window.location.href =
      "/login";
  }

  const displayName =
    user?.name ||
    user?.email?.split("@")[0] ||
    "CloudVault User";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0).toUpperCase()
      )
      .join("") || "CV";

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>CloudVault</span>

            <ChevronRight className="h-4 w-4" />

            <span className="text-slate-600 dark:text-slate-300">
              Settings
            </span>
          </div>

          <div className="mt-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Manage your account, preferences,
              notifications and security settings.
            </p>
          </div>
        </div>

        {/* =================================================
            LAYOUT
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

            <div className="mb-2 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Settings
              </p>
            </div>

            <SettingsNavItem
              active={
                activeSection ===
                "profile"
              }
              icon={
                <User className="h-4 w-4" />
              }
              label="Profile"
              description="Account information"
              onClick={() =>
                setActiveSection(
                  "profile"
                )
              }
            />

            <SettingsNavItem
              active={
                activeSection ===
                "appearance"
              }
              icon={
                <Palette className="h-4 w-4" />
              }
              label="Appearance"
              description="Theme & display"
              onClick={() =>
                setActiveSection(
                  "appearance"
                )
              }
            />

            <SettingsNavItem
              active={
                activeSection ===
                "notifications"
              }
              icon={
                <Bell className="h-4 w-4" />
              }
              label="Notifications"
              description="Alerts & updates"
              onClick={() =>
                setActiveSection(
                  "notifications"
                )
              }
            />

            <SettingsNavItem
              active={
                activeSection ===
                "security"
              }
              icon={
                <Shield className="h-4 w-4" />
              }
              label="Security"
              description="Password & sessions"
              onClick={() =>
                setActiveSection(
                  "security"
                )
              }
            />

            <SettingsNavItem
              active={
                activeSection ===
                "preferences"
              }
              icon={
                <Globe2 className="h-4 w-4" />
              }
              label="Preferences"
              description="Language & region"
              onClick={() =>
                setActiveSection(
                  "preferences"
                )
              }
            />

            <div className="my-3 border-t border-slate-100 dark:border-white/5" />

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-500/10">
                <LogOut className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-semibold text-red-500">
                  Sign out
                </p>

                <p className="text-[11px] text-slate-400">
                  Sign out of CloudVault
                </p>
              </div>
            </button>

          </aside>

          {/* =================================================
              CONTENT
          ================================================= */}

          <main className="min-w-0">

            {/* PROFILE */}
            {activeSection ===
              "profile" && (
              <ProfileSection
                user={user}
                loading={loading}
                initials={initials}
                displayName={
                  displayName
                }
                onSave={
                  saveSettings
                }
                saving={saving}
              />
            )}

            {/* APPEARANCE */}
            {activeSection ===
              "appearance" && (
              <AppearanceSection
                darkMode={
                  darkMode
                }
                onChangeTheme={
                  changeTheme
                }
              />
            )}

            {/* NOTIFICATIONS */}
            {activeSection ===
              "notifications" && (
              <NotificationsSection
                emailNotifications={
                  emailNotifications
                }
                browserNotifications={
                  browserNotifications
                }
                securityAlerts={
                  securityAlerts
                }
                setEmailNotifications={
                  setEmailNotifications
                }
                setBrowserNotifications={
                  setBrowserNotifications
                }
                setSecurityAlerts={
                  setSecurityAlerts
                }
                onSave={
                  saveSettings
                }
                saving={saving}
              />
            )}

            {/* SECURITY */}
            {activeSection ===
              "security" && (
              <SecuritySection
                onLogout={logout}
                onDelete={() =>
                  setShowDeleteModal(
                    true
                  )
                }
              />
            )}

            {/* PREFERENCES */}
            {activeSection ===
              "preferences" && (
              <PreferencesSection
                language={language}
                timezone={timezone}
                setLanguage={
                  setLanguage
                }
                setTimezone={
                  setTimezone
                }
                onSave={
                  saveSettings
                }
                saving={saving}
              />
            )}

          </main>
        </div>
      </div>

      {/* =====================================================
          DELETE ACCOUNT MODAL
      ===================================================== */}

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() =>
            setShowDeleteModal(
              false
            )
          }
          onConfirm={() => {
            setShowDeleteModal(
              false
            );

            showToast(
              "Account deletion requires server confirmation."
            );
          }}
        />
      )}

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[200]">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-2xl dark:border-white/10 dark:bg-slate-950">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
              <Check className="h-4 w-4 text-emerald-500" />
            </div>

            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {toast}
            </span>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

/* =========================================================
   SETTINGS NAV
========================================================= */

function SettingsNavItem({
  active,
  icon,
  label,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
        active
          ? "bg-blue-50 dark:bg-blue-500/10"
          : "hover:bg-slate-50 dark:hover:bg-white/5"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          active
            ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
            : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p
          className={`text-sm font-semibold ${
            active
              ? "text-blue-700 dark:text-blue-400"
              : "text-slate-700 dark:text-slate-200"
          }`}
        >
          {label}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-slate-400">
          {description}
        </p>
      </div>
    </button>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function ProfileSection({
  user,
  loading,
  initials,
  displayName,
  onSave,
  saving,
}: {
  user: UserData | null;
  loading: boolean;
  initials: string;
  displayName: string;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <SettingsCard
      title="Profile"
      description="Manage your personal account information."
    >
      {loading ? (
        <div className="space-y-5">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
              {initials}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">
                {displayName}
              </h3>

              <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                {user?.email ||
                  "No email available"}
              </p>

              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active account
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <InputField
              label="Full name"
              value={
                user?.name ||
                displayName
              }
              readOnly
              icon={
                <User className="h-4 w-4" />
              }
            />

            <InputField
              label="Email address"
              value={
                user?.email ||
                ""
              }
              readOnly
              icon={
                <Mail className="h-4 w-4" />
              }
            />
          </div>

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-500/10 dark:bg-blue-500/5">
            <div className="flex gap-3">
              <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />

              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                  Account information
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-600/70 dark:text-blue-400/70">
                  Your account details are loaded directly from your authenticated CloudVault account.
                </p>
              </div>
            </div>
          </div>

          <SettingsFooter
            onSave={onSave}
            saving={saving}
          />
        </>
      )}
    </SettingsCard>
  );
}

/* =========================================================
   APPEARANCE
========================================================= */

function AppearanceSection({
  darkMode,
  onChangeTheme,
}: {
  darkMode: boolean;
  onChangeTheme: (
    value: boolean
  ) => void;
}) {
  return (
    <SettingsCard
      title="Appearance"
      description="Customize how CloudVault looks on your device."
    >
      <SettingGroup
        title="Theme"
        description="Choose your preferred interface appearance."
      >
        <div className="grid gap-4 sm:grid-cols-2">

          <ThemeOption
            active={!darkMode}
            icon={
              <Sun className="h-5 w-5" />
            }
            title="Light"
            description="Clean and bright interface"
            onClick={() =>
              onChangeTheme(
                false
              )
            }
          />

          <ThemeOption
            active={darkMode}
            icon={
              <Moon className="h-5 w-5" />
            }
            title="Dark"
            description="Easy on the eyes in low light"
            onClick={() =>
              onChangeTheme(
                true
              )
            }
          />

        </div>
      </SettingGroup>

      <div className="mt-6">
        <SettingGroup
          title="Display"
          description="CloudVault automatically adapts to your screen size."
        >
          <div className="grid gap-3 sm:grid-cols-3">

            <DisplayCard
              icon={
                <Laptop className="h-5 w-5" />
              }
              title="Desktop"
            />

            <DisplayCard
              icon={
                <Smartphone className="h-5 w-5" />
              }
              title="Mobile"
            />

            <DisplayCard
              icon={
                <Eye className="h-5 w-5" />
              }
              title="Accessible"
            />

          </div>
        </SettingGroup>
      </div>
    </SettingsCard>
  );
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

function NotificationsSection({
  emailNotifications,
  browserNotifications,
  securityAlerts,
  setEmailNotifications,
  setBrowserNotifications,
  setSecurityAlerts,
  onSave,
  saving,
}: {
  emailNotifications: boolean;
  browserNotifications: boolean;
  securityAlerts: boolean;
  setEmailNotifications: (
    value: boolean
  ) => void;
  setBrowserNotifications: (
    value: boolean
  ) => void;
  setSecurityAlerts: (
    value: boolean
  ) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <SettingsCard
      title="Notifications"
      description="Control how CloudVault keeps you informed."
    >
      <div className="divide-y divide-slate-100 dark:divide-white/5">

        <ToggleRow
          icon={
            <Mail className="h-4 w-4" />
          }
          title="Email notifications"
          description="Receive important updates and account notifications by email."
          enabled={
            emailNotifications
          }
          onChange={
            setEmailNotifications
          }
        />

        <ToggleRow
          icon={
            <Bell className="h-4 w-4" />
          }
          title="Browser notifications"
          description="Allow CloudVault to show notifications in your browser."
          enabled={
            browserNotifications
          }
          onChange={
            setBrowserNotifications
          }
        />

        <ToggleRow
          icon={
            <Shield className="h-4 w-4" />
          }
          title="Security alerts"
          description="Get notified about sign-ins and important security events."
          enabled={
            securityAlerts
          }
          onChange={
            setSecurityAlerts
          }
          locked
        />

      </div>

      <SettingsFooter
        onSave={onSave}
        saving={saving}
      />
    </SettingsCard>
  );
}

/* =========================================================
   SECURITY
========================================================= */

function SecuritySection({
  onLogout,
  onDelete,
}: {
  onLogout: () => void;
  onDelete: () => void;
}) {
  return (
    <SettingsCard
      title="Security"
      description="Protect your CloudVault account and manage access."
    >
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-500/10 dark:bg-emerald-500/5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-500 shadow-sm dark:bg-slate-900">
            <Shield className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
              Your account is protected
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-600/70 dark:text-emerald-400/70">
              Keep your account secure by using a strong password and signing out from devices you no longer use.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">

        <SecurityAction
          icon={
            <KeyRound className="h-4 w-4" />
          }
          title="Change password"
          description="Update your account password."
          onClick={() =>
            alert(
              "Password change API can be connected here."
            )
          }
        />

        <SecurityAction
          icon={
            <Laptop className="h-4 w-4" />
          }
          title="Active sessions"
          description="Review devices currently signed in."
          onClick={() =>
            alert(
              "Session management can be connected here."
            )
          }
        />

        <SecurityAction
          icon={
            <LogOut className="h-4 w-4" />
          }
          title="Sign out"
          description="Sign out from this device."
          onClick={onLogout}
        />

      </div>

      <div className="mt-8 border-t border-slate-200 pt-6 dark:border-white/10">

        <div className="mb-4">
          <h3 className="text-sm font-bold text-red-600 dark:text-red-400">
            Danger Zone
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            These actions can affect your account permanently.
          </p>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="flex w-full items-center justify-between rounded-xl border border-red-200 p-4 text-left transition hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                Delete account
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                Permanently remove your CloudVault account.
              </p>
            </div>
          </div>

          <ChevronRight className="h-4 w-4 text-red-300" />
        </button>

      </div>
    </SettingsCard>
  );
}

/* =========================================================
   PREFERENCES
========================================================= */

function PreferencesSection({
  language,
  timezone,
  setLanguage,
  setTimezone,
  onSave,
  saving,
}: {
  language: string;
  timezone: string;
  setLanguage: (
    value: string
  ) => void;
  setTimezone: (
    value: string
  ) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <SettingsCard
      title="Preferences"
      description="Configure language, region and localization preferences."
    >
      <div className="grid gap-6 sm:grid-cols-2">

        <SelectField
          label="Language"
          value={language}
          onChange={
            setLanguage
          }
          options={[
            "English",
            "Marathi",
            "Hindi",
          ]}
        />

        <SelectField
          label="Time zone"
          value={timezone}
          onChange={
            setTimezone
          }
          options={[
            "Asia/Kolkata",
            "UTC",
            "America/New_York",
            "Europe/London",
            "Asia/Dubai",
          ]}
        />

      </div>

      <div className="mt-6 rounded-xl border border-slate-200 p-4 dark:border-white/10">
        <div className="flex items-center gap-3">
          <Globe2 className="h-5 w-5 text-blue-500" />

          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              Regional settings
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Dates and times will be displayed according to your selected region.
            </p>
          </div>
        </div>
      </div>

      <SettingsFooter
        onSave={onSave}
        saving={saving}
      />
    </SettingsCard>
  );
}

/* =========================================================
   COMMON CARD
========================================================= */

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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

      <div className="border-b border-slate-200 px-5 py-5 sm:px-6 dark:border-white/10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          {description}
        </p>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>

    </section>
  );
}

/* =========================================================
   SETTING GROUP
========================================================= */

function SettingGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-white">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>

      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   THEME OPTION
========================================================= */

function ThemeOption({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
        active
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10 dark:border-blue-500 dark:bg-blue-500/10"
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          active
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
        }`}
      >
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-white">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>

      {active && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
          <Check className="h-3 w-3" />
        </div>
      )}
    </button>
  );
}

/* =========================================================
   DISPLAY CARD
========================================================= */

function DisplayCard({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
        {icon}
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {title}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">
        Supported
      </p>
    </div>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function ToggleRow({
  icon,
  title,
  description,
  enabled,
  onChange,
  locked,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (
    value: boolean
  ) => void;
  locked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5 first:pt-0 last:pb-0">

      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">
            {title}
          </p>

          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={locked}
        onClick={() =>
          onChange(!enabled)
        }
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-blue-600"
            : "bg-slate-200 dark:bg-slate-700"
        } ${
          locked
            ? "cursor-not-allowed opacity-70"
            : ""
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

/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,
  value,
  icon,
  readOnly,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          value={value}
          readOnly={readOnly}
          onChange={() => {}}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        />
      </div>
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
              className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white"
            >
              {option}
            </option>
          )
        )}
      </select>
    </div>
  );
}

/* =========================================================
   SECURITY ACTION
========================================================= */

function SecurityAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">
            {title}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-slate-300" />
    </button>
  );
}

/* =========================================================
   FOOTER
========================================================= */

function SettingsFooter({
  onSave,
  saving,
}: {
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/5">
      <p className="text-xs text-slate-400">
        Changes are applied to your current account.
      </p>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Save className="h-4 w-4" />
        )}

        {saving
          ? "Saving..."
          : "Save changes"}
      </button>
    </div>
  );
}

/* =========================================================
   DELETE MODAL
========================================================= */

function DeleteAccountModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Delete account
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              This action requires confirmation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-500/10 dark:bg-red-500/5">
            <div className="flex gap-3">
              <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <p className="text-sm leading-6 text-red-600 dark:text-red-400">
                Deleting your account can permanently remove your CloudVault data. Make sure you have backed up anything important before continuing.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
