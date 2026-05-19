import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { CreateRoomForm } from "../components/CreateRoomForm";
import { JoinRoomForm } from "../components/JoinRoomForm";
import { RoomList } from "../components/RoomList";
import { Link } from "react-router-dom";

type DashboardPageProps = {
  session: Session;
};

export function DashboardPage({ session }: DashboardPageProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 pb-20">
        <header className="rounded-3xl border border-white/10 bg-black/50 p-5 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
                Monday Ritual
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">
                Monday Night Movie Night
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                A weekly movie tradition that gives everyone something to look
                forward to when Monday drags.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Profile
                </Link>

                <button
                  onClick={handleSignOut}
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>

          <p className="mt-5 text-xs text-zinc-500">
            Signed in as {session.user.email}
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-black/30 p-5">
          <RoomList />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
            <CreateRoomForm />
          </section>

          <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
            <JoinRoomForm />
          </section>
        </div>
      </div>
    </main>
  );
}
