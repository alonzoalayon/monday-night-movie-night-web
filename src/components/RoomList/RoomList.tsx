import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type MovieRoom = {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
};

const RoomList = () => {
  const [rooms, setRooms] = useState<MovieRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchRooms = async () => {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("movie_rooms")
      .select("id, name, invite_code, created_at")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRooms(data ?? []);
  };

  useEffect(() => {
    const loadRooms = async () => {
      await fetchRooms();
    };

    loadRooms();
  }, []);

  if (loading) return <p className="text-sm text-zinc-400">Loading rooms...</p>;

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Rooms
          </p>

          <h2 className="mt-1 text-2xl font-black text-white">
            Your Movie Nights
          </h2>
        </div>

        <button
          onClick={fetchRooms}
          className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15"
        >
          Refresh
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
          {message}
        </p>
      )}

      {rooms.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
          <p className="font-bold text-white">No rooms yet.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Create a room or join one with an invite code.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {rooms.map((room) => (
            <Link
              key={room.id}
              to={`/rooms/${room.id}`}
              className="group rounded-3xl border border-white/10 bg-zinc-950 p-5 shadow-lg transition hover:border-amber-400/40 hover:bg-zinc-900"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Movie Room
              </p>

              <h3 className="mt-2 text-2xl font-black text-white group-hover:text-amber-300">
                {room.name}
              </h3>

              <p className="mt-4 text-sm text-zinc-400">
                Invite code:{" "}
                <span className="font-semibold text-white">
                  {room.invite_code}
                </span>
              </p>

              <p className="mt-4 text-sm font-semibold text-amber-300">
                Open room →
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default RoomList;
