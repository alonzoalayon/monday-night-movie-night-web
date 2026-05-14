import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type ProfilePageProps = {
  session: Session;
};

export function ProfilePage({ session }: ProfilePageProps) {
  const [displayName, setDisplayName] = useState("");
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", session.user.id)
        .single();

      setLoading(false);

      if (error) {
        setMessage(error.message);
        return;
      }

      setDisplayName(data.display_name ?? "");
      setInitialDisplayName(data.display_name ?? "");
    };

    fetchProfile();
  }, [session.user.id]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
      })
      .eq("id", session.user.id);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setInitialDisplayName(displayName.trim());
    setMessage("Profile updated.");
  };

  const hasChanges = displayName.trim() !== initialDisplayName;

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 pb-20">
        <header className="rounded-3xl border border-white/10 bg-black/60 p-5 shadow-2xl backdrop-blur">
          <Link
            to="/"
            className="text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            ← Back to rooms
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
            Profile
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Your Account
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Update how your name appears in rooms, pick order, and weekly movie
            history.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Display Details
          </p>

          <h2 className="mt-1 text-2xl font-black">Edit Display Name</h2>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-white">Display name</span>

              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                disabled={loading}
                placeholder="Your name"
                className="rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 text-white outline-none transition focus:border-amber-300 disabled:opacity-60"
              />
            </label>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Email
              </p>

              <p className="mt-1 text-sm text-zinc-300">{session.user.email}</p>
            </div>

            {message && (
              <p className="rounded-2xl border border-white/10 bg-white/10 p-3 text-sm text-zinc-200">
                {message}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={loading || saving || !displayName.trim() || !hasChanges}
              className="rounded-2xl bg-amber-400 px-5 py-4 text-sm font-black text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
