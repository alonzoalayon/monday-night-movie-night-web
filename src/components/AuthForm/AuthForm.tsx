import { useState } from "react";
import { supabase } from "../../lib/supabase";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        setMessage(error.message);
      }

      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: displayName,
      });
    }

    setLoading(false);

    setMessage(
      "Account created successfully. You can now start your movie ritual.",
    );
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_35%)]" />

      <div className="absolute bottom-[-180px] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-amber-400/5 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-5xl gap-8 rounded-[32px] border border-white/10 bg-black/70 p-6 shadow-2xl backdrop-blur lg:grid-cols-[1fr_420px] lg:p-8">
        <div className="flex flex-col justify-between gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <img
                src="/favicon.png"
                alt="MNMN"
                className="h-20 w-20 rounded-3xl shadow-2xl shadow-amber-400/10"
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
                  Monday Ritual
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Something to look forward to on Monday.
                </p>
              </div>
            </div>

            <div>
              <h1 className="max-w-xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl">
                Monday Night
                <br />
                Movie Night
              </h1>

              <p className="mt-6 max-w-lg text-base leading-8 text-zinc-400">
                Create a room, build your movie shelf, rotate weekly picks, and
                keep the tradition alive even when life gets busy.
              </p>
            </div>

            <div className="rounded-3xl border border-amber-400/10 bg-amber-400/5 p-5">
              <p className="text-sm font-medium leading-7 text-amber-100/90">
                A weekly movie tradition for friends, couples, roommates, and
                families — built around turns, rituals, and shared memories.
              </p>
            </div>
          </div>
        </div>

        <section className="rounded-[28px] border border-white/10 bg-zinc-950/95 p-6 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
            {isLogin ? "Welcome Back" : "Start Your Ritual"}
          </p>

          <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
            {isLogin ? "Log in" : "Create account"}
          </h2>

          <form onSubmit={handleAuth} className="mt-8 grid gap-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-300"
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-300"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-300"
            />

            {message && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-amber-400 px-5 py-4 text-sm font-black text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Log in"
                  : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLogin((previous) => !previous);
                setMessage("");
              }}
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm font-bold text-white transition hover:bg-white/15"
            >
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Log in"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default AuthForm;
