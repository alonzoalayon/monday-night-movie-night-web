import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type MoviePick = {
  title: string;
  release_year: string | null;
};

type PickHistoryItem = {
  id: string;
  week_start: string;
  completed_at: string | null;
  used_wildcard: boolean;

  active_movie: MoviePick | null;

  profiles: {
    display_name: string | null;
  } | null;
};

type PickHistoryProps = {
  roomId: string;
};

const firstOrNull = <T,>(value: T | T[] | null): T | null => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
};

const PickHistory = ({ roomId }: PickHistoryProps) => {
  const [history, setHistory] = useState<PickHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("weekly_picks")
        .select(
          `
          id,
          week_start,
          completed_at,
          used_wildcard,

          active_movie:member_movie_lists!weekly_picks_active_movie_list_item_id_fkey (
            title,
            release_year
          ),

          profiles:picker_user_id (
            display_name
          )
        `,
        )
        .eq("room_id", roomId)
        .order("week_start", { ascending: false });

      setLoading(false);

      if (error) {
        setMessage(error.message);
        return;
      }

      setHistory(
        (data ?? []).map((pick) => ({
          ...pick,
          active_movie: firstOrNull(pick.active_movie),
          profiles: firstOrNull(pick.profiles),
        })),
      );
    };

    fetchHistory();
  }, [roomId]);

  if (loading) {
    return <p className="text-sm text-zinc-400">Loading history...</p>;
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
        Archive
      </p>

      <h2 className="mt-1 text-2xl font-black text-white">Pick History</h2>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Every Monday has a story. This is your room&apos;s movie history.
      </p>

      {history.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
          <p className="font-bold text-white">No picks yet.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Weekly picks will appear here once the rotation starts.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {history.map((pick) => (
            <article
              key={pick.id}
              className="rounded-2xl border border-white/10 bg-black/30 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white">
                    {pick.active_movie?.title ?? "Unknown movie"}

                    {pick.active_movie?.release_year
                      ? ` (${pick.active_movie.release_year})`
                      : ""}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-400">
                    Picked by{" "}
                    <span className="font-semibold text-zinc-200">
                      {pick.profiles?.display_name ?? "Unknown"}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {pick.completed_at ? (
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      Completed
                    </span>
                  ) : (
                    <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-300">
                      Active
                    </span>
                  )}

                  {pick.used_wildcard && (
                    <span className="rounded-full bg-fuchsia-400/10 px-3 py-1 text-xs font-semibold text-fuchsia-300">
                      Wildcard Used
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span className="rounded-full bg-white/5 px-3 py-1">
                  Week of {pick.week_start}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default PickHistory;
