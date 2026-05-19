import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type CurrentPicker = {
  user_id: string;
  display_name: string | null;
  turn_order: number;
};

type ShelfMovie = {
  id: string;
  title: string;
  release_year: string | null;
};

type PickMoviePanelProps = {
  roomId: string;
  userId: string;
};

const getMondayWeekStart = () => {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);

  monday.setDate(diff);

  return monday.toISOString().slice(0, 10);
};

const PickMoviePanel = ({ roomId, userId }: PickMoviePanelProps) => {
  const [currentPicker, setCurrentPicker] = useState<CurrentPicker | null>(
    null,
  );
  const [movies, setMovies] = useState<ShelfMovie[]>([]);
  const [mainMovieId, setMainMovieId] = useState("");
  const [wildcardMovieId, setWildcardMovieId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [thisWeeksPickExists, setThisWeeksPickExists] = useState(false);

  const isCurrentPicker = currentPicker?.user_id === userId;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setMessage("");

      const { data: pickerData, error: pickerError } = await supabase.rpc(
        "get_current_picker",
        { target_room_id: roomId },
      );

      if (pickerError) {
        setLoading(false);
        setMessage(pickerError.message);
        return;
      }

      setCurrentPicker(pickerData?.[0] ?? null);

      const weekStart = getMondayWeekStart();

      const { data: existingPick, error: existingPickError } = await supabase
        .from("weekly_picks")
        .select("id")
        .eq("room_id", roomId)
        .eq("week_start", weekStart)
        .maybeSingle();

      if (existingPickError) {
        setLoading(false);
        setMessage(existingPickError.message);
        return;
      }

      setThisWeeksPickExists(Boolean(existingPick));

      const { data: movieData, error: movieError } = await supabase
        .from("user_movie_shelf")
        .select("id, title, release_year")
        .eq("user_id", userId)
        .eq("watched", false)
        .order("created_at", { ascending: false });

      setLoading(false);

      if (movieError) {
        setMessage(movieError.message);
        return;
      }

      setMovies(movieData ?? []);
    };

    fetchData();
  }, [roomId, userId]);

  const handleRandomizeMain = () => {
    if (movies.length === 0) {
      setMessage("Add movies to your shelf first.");
      return;
    }

    const randomMovie = movies[Math.floor(Math.random() * movies.length)];
    setMainMovieId(randomMovie.id);
  };

  const handleRandomizeWildcard = () => {
    const availableMovies = movies.filter((movie) => movie.id !== mainMovieId);

    if (availableMovies.length === 0) {
      setMessage("Add another movie to use as a wildcard.");
      return;
    }

    const randomMovie =
      availableMovies[Math.floor(Math.random() * availableMovies.length)];

    setWildcardMovieId(randomMovie.id);
  };

  const handleSubmitPick = async () => {
    if (!mainMovieId) {
      setMessage("Choose a main movie first.");
      return;
    }

    if (mainMovieId === wildcardMovieId) {
      setMessage("Wildcard must be different from the main pick.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const weekStart = getMondayWeekStart();

    const { error } = await supabase.from("weekly_picks").insert({
      room_id: roomId,
      picker_user_id: userId,

      shelf_movie_id: mainMovieId,
      wildcard_shelf_movie_id: wildcardMovieId || null,
      active_shelf_movie_id: mainMovieId,

      week_start: weekStart,
      status: "picked",
    });

    setSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setThisWeeksPickExists(true);
    setMessage("Weekly movie picked!");
  };

  if (loading) {
    return (
      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
        <p className="text-sm text-zinc-400">Loading picker...</p>
      </section>
    );
  }

  if (!currentPicker) {
    return (
      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          Weekly Picker
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          No picker found yet
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Once members have a turn order, the weekly picker will appear here.
        </p>
      </section>
    );
  }

  if (thisWeeksPickExists) {
    return (
      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          Weekly Pick Locked
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          This week&apos;s movie has already been picked.
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Next week&apos;s picker will be{" "}
          <span className="font-semibold text-white">
            {currentPicker.display_name ?? "the next person in rotation"}
          </span>
          .
        </p>
      </section>
    );
  }

  if (!isCurrentPicker) {
    return (
      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          Weekly Picker
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          This week belongs to {currentPicker.display_name ?? "another member"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          They&apos;ll choose the movie for this week. Your turn is coming up in
          the rotation.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 via-zinc-950 to-zinc-950 p-5 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
        Your Turn
      </p>

      <h2 className="mt-2 text-2xl font-black text-white">
        It&apos;s your pick this week.
      </h2>

      <p className="mt-2 text-sm leading-6 text-zinc-300">
        Choose from your personal movie shelf. Add a wildcard if you want one
        backup for the first 15 minutes.
      </p>

      {message && (
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-3 text-sm text-zinc-200">
          {message}
        </p>
      )}

      {movies.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-400">
          Add movies to your shelf before making this week&apos;s pick.
        </p>
      ) : (
        <div className="mt-5 grid gap-5">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <label className="block">
              <span className="text-sm font-bold text-white">Main pick</span>

              <select
                value={mainMovieId}
                onChange={(event) => {
                  setMainMovieId(event.target.value);

                  if (event.target.value === wildcardMovieId) {
                    setWildcardMovieId("");
                  }
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-amber-300"
              >
                <option value="">Select a movie</option>

                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                    {movie.release_year ? ` (${movie.release_year})` : ""}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handleRandomizeMain}
              className="mt-3 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-black text-black transition hover:bg-amber-300"
            >
              Randomize main pick
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <label className="block">
              <span className="text-sm font-bold text-white">
                Wildcard pick
              </span>

              <span className="ml-2 text-xs text-zinc-500">optional</span>

              <select
                value={wildcardMovieId}
                onChange={(event) => setWildcardMovieId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-amber-300"
              >
                <option value="">No wildcard</option>

                {movies
                  .filter((movie) => movie.id !== mainMovieId)
                  .map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                      {movie.release_year ? ` (${movie.release_year})` : ""}
                    </option>
                  ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handleRandomizeWildcard}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
            >
              Randomize wildcard
            </button>
          </div>

          <button
            type="button"
            disabled={submitting || !mainMovieId}
            onClick={handleSubmitPick}
            className="rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving pick..." : "Submit weekly pick"}
          </button>
        </div>
      )}
    </section>
  );
};

export default PickMoviePanel;
