import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type MovieListItem = {
  id: string;
  title: string;
  release_year: string | null;
  poster_url: string | null;
  watched: boolean;
  created_at: string;
};

type MyMovieListProps = {
  roomId: string;
  userId: string;
  refreshKey?: number;
};

const MyMovieList = ({ roomId, userId, refreshKey }: MyMovieListProps) => {
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchMovies = async () => {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("member_movie_lists")
      .select("id, title, release_year, poster_url, watched, created_at")
      .eq("room_id", roomId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMovies(data ?? []);
  };

  useEffect(() => {
    const loadMovies = async () => {
      await fetchMovies();
    };

    loadMovies();
  }, [roomId, userId, refreshKey]);

  const handleAddMovie = async () => {
    setAdding(true);
    setMessage("");

    const { error } = await supabase.from("member_movie_lists").insert({
      room_id: roomId,
      user_id: userId,
      title: title.trim(),
      release_year: releaseYear.trim() || null,
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
  console.log("movies", movies);
  return (
    <section>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          Your Shelf
        </p>

        <h2 className="mt-1 text-2xl font-black text-white">My Movie List</h2>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Build your personal rental-store shelf. These are the movies you can
          pick from when your Monday comes around.
        </p>
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
        <p className="mt-5 text-sm text-zinc-400">Loading movies...</p>
      ) : movies.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
          <p className="text-lg font-black text-white">Your shelf is empty.</p>
          <p className="mt-2 text-sm text-zinc-400">
            Search for movies above or manually add one here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {movies.map((movie) => (
            <article
              key={movie.id}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-lg"
            >
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
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyMovieList;
