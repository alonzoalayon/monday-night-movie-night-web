import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type MoviePick = {
  title: string;
  release_year: string | null;
  poster_url: string | null;
  overview: string | null;
};

type WeeklyPick = {
  id: string;
  week_start: string;
  created_at: string;
  completed_at: string | null;
  used_wildcard: boolean;
  active_movie: MoviePick | null;
  main_movie: MoviePick | null;
  wildcard_movie: MoviePick | null;
  profiles: {
    display_name: string | null;
  } | null;
};

type CurrentWeeklyPickProps = {
  roomId: string;
};

const firstOrNull = <T,>(value: T | T[] | null): T | null => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
};

const CurrentWeeklyPick = ({ roomId }: CurrentWeeklyPickProps) => {
  const [pick, setPick] = useState<WeeklyPick | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [completing, setCompleting] = useState(false);
  const [usingWildcard, setUsingWildcard] = useState(false);

  useEffect(() => {
    const fetchWeeklyPick = async () => {
      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("weekly_picks")
        .select(
          `
          id,
          week_start,
          created_at,
          completed_at,
          used_wildcard,

          active_movie:member_movie_lists!weekly_picks_active_movie_list_item_id_fkey (
            title,
            release_year,
            poster_url,
            overview
          ),

          main_movie:member_movie_lists!weekly_picks_movie_list_item_id_fkey (
            title,
            release_year,
            poster_url,
            overview
          ),

          wildcard_movie:member_movie_lists!weekly_picks_wildcard_movie_list_item_id_fkey (
            title,
            release_year,
            poster_url,
            overview
          ),

          profiles:picker_user_id (
            display_name
          )
        `,
        )
        .eq("room_id", roomId)
        .order("week_start", { ascending: false })
        .limit(1)
        .single();

      setLoading(false);

      if (error) {
        if (error.code === "PGRST116") return;
        setMessage(error.message);
        return;
      }

      setPick({
        ...data,
        active_movie: firstOrNull(data.active_movie),
        main_movie: firstOrNull(data.main_movie),
        wildcard_movie: firstOrNull(data.wildcard_movie),
        profiles: firstOrNull(data.profiles),
      });
    };

    fetchWeeklyPick();
  }, [roomId]);

  const handleCompletePick = async () => {
    if (!pick) return;

    setCompleting(true);
    setMessage("");

    const { error } = await supabase.rpc("complete_weekly_pick", {
      pick_id: pick.id,
    });

    setCompleting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPick({
      ...pick,
      completed_at: new Date().toISOString(),
    });
  };

  const handleUseWildcard = async () => {
    if (!pick) return;

    setUsingWildcard(true);
    setMessage("");

    const { error } = await supabase.rpc("use_weekly_pick_wildcard", {
      pick_id: pick.id,
    });

    setUsingWildcard(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (pick.wildcard_movie) {
      setPick({
        ...pick,
        used_wildcard: true,
        active_movie: pick.wildcard_movie,
      });
    }
  };

  if (loading) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm text-zinc-400">Loading weekly pick...</p>
      </section>
    );
  }

  const movie = pick?.active_movie ?? pick?.main_movie;

  if (!pick || !movie) {
    return (
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
          This Week&apos;s Pick
        </p>

        <h2 className="mt-3 text-2xl font-bold text-white">
          No movie picked yet
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Once the current picker chooses a movie, it will show up here.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-2xl">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
            This Week&apos;s Pick
          </span>

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

        <div className="mt-5 grid gap-5 sm:grid-cols-[140px_1fr] sm:items-start">
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-full max-w-[220px] rounded-2xl object-cover shadow-lg sm:max-w-none"
            />
          ) : (
            <div className="flex aspect-[2/3] w-full max-w-[220px] items-center justify-center rounded-2xl bg-white/10 text-sm text-zinc-500 sm:max-w-none">
              No poster
            </div>
          )}

          <div>
            <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">
              {movie.title}
            </h2>

            {movie.release_year && (
              <p className="mt-1 text-sm text-zinc-400">
                Released {movie.release_year}
              </p>
            )}

            <p className="mt-3 text-sm text-zinc-300">
              Picked by{" "}
              <span className="font-semibold text-white">
                {pick.profiles?.display_name ?? "Unknown"}
              </span>
            </p>

            {movie.overview && (
              <p className="mt-4 line-clamp-5 text-sm leading-6 text-zinc-300">
                {movie.overview}
              </p>
            )}

            {message && (
              <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
                {message}
              </p>
            )}

            <div className="mt-5 grid gap-3 sm:flex">
              {pick.completed_at ? (
                <p className="rounded-xl bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-300">
                  Watched ✅
                </p>
              ) : (
                <button
                  onClick={handleCompletePick}
                  disabled={completing}
                  className="rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {completing ? "Completing..." : "Mark as watched"}
                </button>
              )}

              {pick.wildcard_movie &&
                !pick.used_wildcard &&
                !pick.completed_at && (
                  <button
                    onClick={handleUseWildcard}
                    disabled={usingWildcard}
                    className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {usingWildcard ? "Using wildcard..." : "Use wildcard"}
                  </button>
                )}
            </div>
          </div>
        </div>

        {pick.wildcard_movie && !pick.used_wildcard && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Wildcard Backup
            </p>

            <p className="mt-2 font-semibold text-white">
              {pick.wildcard_movie.title}
              {pick.wildcard_movie.release_year
                ? ` (${pick.wildcard_movie.release_year})`
                : ""}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Use this only if the group bails within the first 15 minutes.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CurrentWeeklyPick;
