import { useState } from "react";
import { supabase } from "../../lib/supabase";

const CreateRoomForm = () => {
  const [roomName, setRoomName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    setLoading(true);
    setMessage("");

    const { data: room, error } = await supabase.rpc("create_movie_room", {
      room_name: roomName.trim(),
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRoomName("");
    setMessage(`Created room: ${room.name}`);
  };

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
        Start One
      </p>

      <h2 className="mt-1 text-2xl font-black text-white">Create a Room</h2>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Start a movie night room and become first in the weekly rotation.
      </p>

      <div className="mt-5 grid gap-3">
        <input
          type="text"
          placeholder="Room name"
          value={roomName}
          onChange={(event) => setRoomName(event.target.value)}
          className="rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 text-white outline-none transition focus:border-amber-300"
        />

        <button
          onClick={handleCreateRoom}
          disabled={loading || !roomName.trim()}
          className="rounded-2xl bg-amber-400 px-5 py-4 text-sm font-black text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create room"}
        </button>

        {message && (
          <p className="rounded-2xl border border-white/10 bg-white/10 p-3 text-sm text-zinc-200">
            {message}
          </p>
        )}
      </div>
    </section>
  );
};

export default CreateRoomForm;
