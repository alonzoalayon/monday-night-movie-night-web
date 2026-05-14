import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type RoomMember = {
  id: string;
  role: string;
  turn_order: number | null;
  user_id: string;
  profiles: {
    display_name: string | null;
  } | null;
};

type RoomMembersListProps = {
  roomId: string;
  currentUserId: string;
  isOwner: boolean;
};

const RoomMembersList = ({
  roomId,
  currentUserId,
  isOwner,
}: RoomMembersListProps) => {
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchMembers = async () => {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("room_members")
      .select(
        `
        id,
        role,
        turn_order,
        user_id,
        profiles (
          display_name
        )
      `,
      )
      .eq("room_id", roomId)
      .order("turn_order", { ascending: true });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMembers(data ?? []);
  };

  useEffect(() => {
    fetchMembers();
  }, [roomId]);

  const handleRemoveMember = async (member: RoomMember) => {
    const name = member.profiles?.display_name ?? "this member";

    const confirmed = window.confirm(`Remove ${name} from this room?`);

    if (!confirmed) return;

    const { error } = await supabase.rpc("remove_room_member", {
      target_room_id: roomId,
      target_user_id: member.user_id,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    fetchMembers();
  };

  if (loading) {
    return <p className="text-sm text-zinc-400">Loading members...</p>;
  }

  if (message) {
    return (
      <p className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
        {message}
      </p>
    );
  }

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
        Rotation
      </p>

      <h2 className="mt-1 text-2xl font-black text-white">Pick Order</h2>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        The room creator goes first, then each member gets their Monday in
        order.
      </p>

      {members.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
          <p className="font-bold text-white">No members yet.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Share the invite code to start the rotation.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {members.map((member, index) => {
            const isCurrentUser = member.user_id === currentUserId;
            const canRemove = isOwner && !isCurrentUser;

            return (
              <article
                key={member.id}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-lg font-black text-black">
                  {member.turn_order ?? index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-black text-white">
                    {member.profiles?.display_name ?? member.user_id}
                    {isCurrentUser ? " (you)" : ""}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-zinc-300">
                      {member.role}
                    </span>

                    {index === 0 && (
                      <span className="rounded-full bg-amber-400/10 px-2 py-1 text-xs font-semibold text-amber-300">
                        First pick
                      </span>
                    )}
                  </div>
                </div>

                {canRemove && (
                  <button
                    onClick={() => handleRemoveMember(member)}
                    className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-200 transition hover:bg-red-400/20"
                  >
                    Remove
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default RoomMembersList;
