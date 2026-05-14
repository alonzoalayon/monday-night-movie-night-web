import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

import { CurrentWeeklyPick } from "../components/CurrentWeeklyPick";
import { PickMoviePanel } from "../components/PickMoviePanel";
import { RoomMembersList } from "../components/RoomMembersList";
import { MovieSearch } from "../components/MovieSearch";
import { MyMovieList } from "../components/MyMovieList";
import { PickHistory } from "../components/PickHistory";
import { OwnerControls } from "../components/OwnerControls";

type MovieRoom = {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
};

type RoomPageProps = {
  session: Session;
};

export function RoomPage({ session }: RoomPageProps) {
  const { roomId } = useParams();

  const [room, setRoom] = useState<MovieRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [movieListRefreshKey, setMovieListRefreshKey] = useState(0);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMovieAdded = () => {
    setMovieListRefreshKey((previous) => previous + 1);
  };

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) return;

      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("movie_rooms")
        .select("id, name, invite_code, owner_id")
        .eq("id", roomId)
        .single();

      setLoading(false);

      if (error) {
        setMessage(error.message);
        return;
      }

      setRoom(data);
    };

    fetchRoom();
  }, [roomId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-4 text-white">
        <p>Loading room...</p>
      </main>
    );
  }

  if (message) {
    return (
      <main className="min-h-screen bg-black p-4 text-white">
        <p>{message}</p>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-black p-4 text-white">
        <p>Room not found.</p>
      </main>
    );
  }
  const isOwner = room.owner_id === session.user.id;
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="film-reel absolute -right-28 top-10 h-80 w-80 opacity-10"
          style={{ transform: `rotate(${scrollY * 0.25}deg)` }}
        />

        <div
          className="film-reel absolute -left-32 bottom-10 h-96 w-96 opacity-10"
          style={{ transform: `rotate(${-scrollY * 0.25}deg)` }}
        />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 pb-20">
        <header className="sticky top-0 z-20 rounded-3xl border border-white/10 bg-black/80 p-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Link
                to="/"
                className="text-sm font-medium text-zinc-400 transition hover:text-white"
              >
                ← Back to rooms
              </Link>

              <h1 className="mt-2 text-3xl font-black tracking-tight">
                {room.name}
              </h1>

              <p className="mt-1 text-sm text-zinc-400">
                Invite code:{" "}
                <span className="font-semibold text-white">
                  {room.invite_code}
                </span>
              </p>
            </div>

            <button
              onClick={() => supabase.auth.signOut()}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Sign out
            </button>
          </div>
        </header>

        <CurrentWeeklyPick roomId={room.id} />

        <PickMoviePanel roomId={room.id} userId={session.user.id} />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
            <RoomMembersList
              roomId={room.id}
              currentUserId={session.user.id}
              isOwner={isOwner}
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
            <MovieSearch
              roomId={room.id}
              userId={session.user.id}
              onMovieAdded={handleMovieAdded}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
          <MyMovieList
            roomId={room.id}
            userId={session.user.id}
            refreshKey={movieListRefreshKey}
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
          <PickHistory roomId={room.id} />
        </div>
        {isOwner && <OwnerControls roomId={room.id} />}
      </div>
    </main>
  );
}
