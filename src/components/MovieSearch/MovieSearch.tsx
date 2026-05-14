import { useState } from "react";
import { supabase } from "../../lib/supabase";

type MovieResult = {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
};

type MovieSearchProps = {
  roomId: string;
  userId: string;
  onMovieAdded?: () => void;
};

const MovieSearch = ({ roomId, userId, onMovieAdded }: MovieSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const clearResults = () => {
    setResults([]);
    setQuery("");
  };

  const searchMovies = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setMessage("");

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        query,
      )}&api_key=${import.meta.env.VITE_TMDB_API_KEY}`,
    );

    const data = await response.json();

    setLoading(false);

    setResults(data.results ?? []);
  };

  const handleAddMovie = async (movie: MovieResult) => {
    const { error } = await supabase.from("member_movie_lists").insert({
      room_id: roomId,
      user_id: userId,
      title: movie.title,
      release_year: movie.release_date?.slice(0, 4) ?? null,
      poster_url: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      overview: movie.overview,
      tmdb_movie_id: movie.id.toString(),
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(`Added ${movie.title}`);
    onMovieAdded?.();
  };

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Movie Search
          </p>

          <h2 className="mt-1 text-2xl font-black text-white">
            Add movies to your list
          </h2>
        </div>
      </div>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Search TMDB and build your personal rotation list for future Mondays.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          placeholder="Search movies"
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 text-white outline-none transition focus:border-amber-300"
        />

        <button
          onClick={searchMovies}
          disabled={loading}
          className="rounded-2xl bg-amber-400 px-5 py-4 text-sm font-black text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-3 text-sm text-zinc-200">
          {message}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">
          {results.length} result{results.length === 1 ? "" : "s"}
        </p>

        {results.length > 0 && (
          <button
            onClick={clearResults}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/15"
          >
            Clear results
          </button>
        )}
      </div>

      <div className="mt-4 max-h-[700px] overflow-y-auto pr-1">
        <div className="grid gap-4">
          {results.map((movie) => {
            const posterUrl = movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : null;

            return (
              <div
                key={movie.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/70 shadow-lg"
              >
                <div className="grid gap-4 p-4 sm:grid-cols-[110px_1fr]">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-full rounded-2xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="flex aspect-[2/3] items-center justify-center rounded-2xl bg-white/5 text-sm text-zinc-500">
                      No poster
                    </div>
                  )}

                  <div className="flex flex-col">
                    <div>
                      <h3 className="text-xl font-black text-white">
                        {movie.title}
                      </h3>

                      {movie.release_date && (
                        <p className="mt-1 text-sm text-zinc-400">
                          {movie.release_date.slice(0, 4)}
                        </p>
                      )}
                    </div>

                    {movie.overview && (
                      <p className="mt-3 line-clamp-4 text-sm leading-6 text-zinc-300">
                        {movie.overview}
                      </p>
                    )}

                    <button
                      onClick={() => handleAddMovie(movie)}
                      className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
                    >
                      Add to my list
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MovieSearch;
