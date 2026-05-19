import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type MovieShelfItem = {
  id: string;
  title: string;
  release_year: string | null;
  poster_url: string | null;
  watched: boolean;
  favorite: boolean;
  created_at: string;
};

type MyMovieShelfProps = {
  userId: string;
  refreshKey?: number;
};

const MyMovieShelf = ({ userId, refreshKey }: MyMovieShelfProps) => {
  const [movies, setMovies] = useState<MovieShelfItem[]>([]);
  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const watchedCount = useMemo(
    () => movies.filter((movie) => movie.watched).length,
    [movies],
  );

  const favoriteCount = useMemo(
    () => movies.filter((movie) => movie.favorite).length,
    [movies],
  );

  const fetchMovies = async () => {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("user_movie_shelf")
      .select(
        "id, title, release_year, poster_url, watched, favorite, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMovies(data ?? []);
  };

  // useEffect(() => {
  //   fetchMovies();
  // }, [userId, refreshKey]);

  useEffect(() => {
    const loadMovies = async () => {
      await fetchMovies();
    };

    loadMovies();
  }, [userId, refreshKey]);

  const handleAddMovie = async () => {
    setAdding(true);
    setMessage("");

    const { error } = await supabase.from("user_movie_shelf").insert({
      user_id: userId,
      title: title.trim(),
      release_year: releaseYear.trim() || null,
      tmdb_movie_id: `manual-${crypto.randomUUID()}`,
    });

    setAdding(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setTitle("");
    setReleaseYear("");
    fetchMovies();
  };

  return (
    <section>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          Your Shelf
        </p>

        <h2 className="mt-1 text-2xl font-black text-white">
          Personal Movie Shelf
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Your personal rental-store shelf. Add movies once, then use them in
          any room when your Monday comes around.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-2xl font-black text-white">{movies.length}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Movies
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-2xl font-black text-white">{watchedCount}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Watched
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-2xl font-black text-white">{favoriteCount}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Favorites
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-black/30 p-4">
        <p className="text-sm font-bold text-white">Manual add</p>

        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_140px_auto]">
          <input
            value={title}
            placeholder="Movie title"
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-amber-300"
          />

          <input
            value={releaseYear}
            placeholder="Year"
            onChange={(event) => setReleaseYear(event.target.value)}
            className="rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-amber-300"
          />

          <button
            disabled={adding || !title.trim()}
            onClick={handleAddMovie}
            className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      {message && (
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-3 text-sm text-zinc-200">
          {message}
        </p>
      )}

      {loading ? (
        <p className="mt-5 text-sm text-zinc-400">Loading shelf...</p>
      ) : movies.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
          <p className="text-lg font-black text-white">Your shelf is empty.</p>
          <p className="mt-2 text-sm text-zinc-400">
            Search for movies above or manually add one here.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-amber-900/20 bg-gradient-to-b from-[#1a1208] via-black to-black p-6 shadow-[0_0_80px_rgba(245,158,11,0.05)]">
          <div className="grid grid-cols-2 gap-x-5 gap-y-14 sm:grid-cols-3 lg:grid-cols-4">
            {movies.map((movie) => (
              <div key={movie.id} className="relative">
                <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_20px_40px_rgba(0,0,0,0.55)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_rgba(0,0,0,0.7)]">
                  {movie.poster_url ? (
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-[2/3] items-center justify-center bg-white/5 p-4 text-center text-sm text-zinc-500">
                      No poster
                    </div>
                  )}

                  <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-black text-white">
                      {movie.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {movie.release_year && (
                        <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-zinc-300">
                          {movie.release_year}
                        </span>
                      )}

                      {movie.watched && (
                        <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                          Watched
                        </span>
                      )}

                      {movie.favorite && (
                        <span className="rounded-full bg-amber-400/10 px-2 py-1 text-xs font-semibold text-amber-300">
                          Favorite
                        </span>
                      )}
                    </div>
                  </div>
                </article>

                <div className="pointer-events-none absolute -bottom-7 left-[-8px] right-[-8px] h-4 rounded-md border border-amber-900/20 bg-gradient-to-b from-[#4a2d16] via-[#2a170b] to-[#140b05] shadow-[0_10px_20px_rgba(0,0,0,0.6)]" />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default MyMovieShelf;
