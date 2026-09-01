"use client";

import {
  Camera,
  CheckCircle2,
  Cloud,
  FileText,
  HardDrive,
  Mail,
  Pencil,
  ShieldCheck,
  User,
  CalendarDays,
  X,
} from "lucide-react";
import { useState } from "react";

import DashboardShell from "../components/DashboardShell";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);

  const [name, setName] =
    useState("CloudVault User");

  const [email, setEmail] =
    useState("user@example.com");

  const [phone, setPhone] =
    useState("+91 98765 43210");

  const [saved, setSaved] =
    useState(false);

  function handleSave() {
    setSaved(true);
    setEditing(false);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* ================================= */}
        {/* PAGE HEADER */}
        {/* ================================= */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
            Account
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage your personal information and
            CloudVault account.
          </p>
        </div>

        {/* ================================= */}
        {/* PROFILE HERO */}
        {/* ================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

          {/* Cover */}
          <div className="relative h-40 overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600">

            <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute -left-20 bottom-[-100px] h-64 w-64 rounded-full bg-blue-300/10 blur-2xl" />
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6 sm:px-8">

            <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              {/* Avatar */}
              <div className="relative">

                <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-blue-600 to-indigo-600 text-3xl font-bold text-white shadow-xl dark:border-slate-950">
                  {name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <button
                  type="button"
                  className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-500 dark:border-slate-950"
                  title="Change profile photo"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* Edit */}
              <button
                type="button"
                onClick={() =>
                  setEditing(!editing)
                }
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                {editing ? (
                  <>
                    <X className="h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>

            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {name}
                </h2>

                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600 dark:bg-green-500/10 dark:text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-400">
                CloudVault User
              </p>
            </div>
          </div>
        </div>

        {/* ================================= */}
        {/* MAIN GRID */}
        {/* ================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* ================================= */}
          {/* PERSONAL INFORMATION */}
          {/* ================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

            <div className="border-b border-slate-200 px-6 py-5 dark:border-white/10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Personal Information
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Your basic account information.
              </p>
            </div>

            <div className="p-6">

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Full Name */}
                <ProfileField
                  label="Full Name"
                  value={name}
                  icon={<User />}
                  editing={editing}
                  onChange={setName}
                />

                {/* Email */}
                <ProfileField
                  label="Email Address"
                  value={email}
                  icon={<Mail />}
                  editing={editing}
                  onChange={setEmail}
                  type="email"
                />

                {/* Phone */}
                <ProfileField
                  label="Phone Number"
                  value={phone}
                  icon={<Mail />}
                  editing={editing}
                  onChange={setPhone}
                />

                {/* Role */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Account Role
                  </label>

                  <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 dark:border-white/10 dark:bg-white/5">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />

                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      USER
                    </span>
                  </div>
                </div>
              </div>

              {/* Save */}
              {editing && (
                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    {saved ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ================================= */}
          {/* ACCOUNT SUMMARY */}
          {/* ================================= */}

          <div className="space-y-6">

            {/* Account */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Account Summary
              </h2>

              <div className="mt-5 space-y-4">

                <SummaryRow
                  icon={<CalendarDays />}
                  title="Member Since"
                  value="September 2026"
                />

                <SummaryRow
                  icon={<Cloud />}
                  title="Plan"
                  value="Standard"
                />

                <SummaryRow
                  icon={<ShieldCheck />}
                  title="Account Status"
                  value="Active"
                />
              </div>
            </div>

            {/* Storage */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Storage
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Current storage usage
                  </p>
                </div>

                <HardDrive className="h-5 w-5 text-blue-500" />
              </div>

              <div className="mt-5">

                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">
                    3.8 GB
                  </span>

                  <span className="text-xs text-slate-400">
                    of 10 GB
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: "38%",
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  6.2 GB available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================= */}
        {/* ACTIVITY / FILE STATISTICS */}
        {/* ================================= */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={<FileText />}
            title="Total Files"
            value="128"
            description="Files stored"
          />

          <StatCard
            icon={<Cloud />}
            title="Storage Used"
            value="3.8 GB"
            description="Current usage"
          />

          <StatCard
            icon={<ShieldCheck />}
            title="Security"
            value="Good"
            description="Account protected"
          />

          <StatCard
            icon={<User />}
            title="Shared Files"
            value="24"
            description="Files shared"
          />
        </div>

        {/* ================================= */}
        {/* SECURITY NOTICE */}
        {/* ================================= */}

        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-500/20 dark:bg-green-500/10">

          <div className="flex gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-500/10">
              <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">
                Your account is secure
              </h3>

              <p className="mt-1 text-xs leading-5 text-green-700/70 dark:text-green-300/70">
                Your account is protected with secure
                authentication and protected API access.
              </p>
            </div>
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}

/* ========================================= */
/* PROFILE FIELD */
/* ========================================= */

function ProfileField({
  label,
  value,
  icon,
  editing,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  editing: boolean;
  onChange: (value: string) => void;
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
          disabled={!editing}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className={`h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition ${
            editing
              ? "border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              : "border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
          }`}
        />
      </div>
    </div>
  );
}

/* ========================================= */
/* SUMMARY ROW */
/* ========================================= */

function SummaryRow({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        <span className="[&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          {title}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-slate-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ========================================= */
/* STAT CARD */
/* ========================================= */

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <span className="[&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </span>
        </div>

      </div>

      <p className="mt-5 text-xs text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}
