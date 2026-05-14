import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type OwnerControlsProps = {
  roomId: string;
};

const OwnerControls = ({ roomId }: OwnerControlsProps) => {
  const navigate = useNavigate();

  const handleDeleteRoom = async () => {
    const confirmed = window.confirm(
      "Delete this room? This will remove the room, members, movie lists, picks, and history.",
    );

    if (!confirmed) return;

    const { error } = await supabase.rpc("delete_movie_room", {
      target_room_id: roomId,
    });

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/");
  };

  return (
    <section className="rounded-3xl border border-red-400/20 bg-red-400/10 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
        Owner Controls
      </p>

      <h2 className="mt-1 text-2xl font-black text-white">Danger Zone</h2>

      <p className="mt-2 text-sm leading-6 text-red-100/80">
        You own this room. Deleting it removes the room and all related movie
        night data.
      </p>

      <button
        onClick={handleDeleteRoom}
        className="mt-5 rounded-2xl bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400"
      >
        Delete room
      </button>
    </section>
  );
};

export default OwnerControls;
