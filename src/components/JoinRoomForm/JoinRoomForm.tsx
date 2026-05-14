import { useState } from "react";
import { supabase } from "../../lib/supabase";

type JoinRoomFormProps = {
  onRoomJoined?: () => void;
};

const JoinRoomForm = ({ onRoomJoined }: JoinRoomFormProps) => {
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinRoom = async () => {
    setLoading(true);
    setMessage("");

    const { data: room, error } = await supabase.rpc(
      "join_movie_room_by_invite",
      {
        invite: inviteCode.trim(),
      },
    );

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setInviteCode("");
    setMessage(`Joined room: ${room.name}`);
    onRoomJoined?.();
  };

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
        Join In
      </p>

      <h2 className="mt-1 text-2xl font-black text-white">Join a Room</h2>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Enter an invite code and jump into someone else&apos;s Monday rotation.
      </p>

      <div className="mt-5 grid gap-3">
        <input
          type="text"
          placeholder="Invite code"
          value={inviteCode}
          onChange={(event) => setInviteCode(event.target.value)}
          className="rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 text-white outline-none transition focus:border-amber-300"
        />

        <button
          onClick={handleJoinRoom}
          disabled={loading || !inviteCode.trim()}
          className="rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Joining..." : "Join room"}
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

export default JoinRoomForm;
