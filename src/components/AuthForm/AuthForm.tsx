import { useState } from "react";
import { supabase } from "../../lib/supabase";

const AuthForm = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    setMessage("");

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName.trim(),
              },
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setMessage(
      mode === "signup"
        ? "Check your email to confirm your account."
        : "Logged in!",
    );
  };

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center p-4">
        <section className="grid w-full gap-8 rounded-[2rem] border border-white/10 bg-black/60 p-6 shadow-2xl backdrop-blur sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
              Monday Ritual
            </p>

            <h1 className="mt-4 text-5xl font-black leading-none tracking-tight sm:text-7xl">
              Monday Night Movie Night
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300">
              A weekly movie tradition that gives everyone something to look
              forward to when Monday drags.
            </p>

            <div className="mt-8 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5">
              <p className="text-sm font-semibold leading-6 text-amber-100">
                Create a room, build your movie shelf, take turns picking, and
                keep the weekly ritual alive.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              {mode === "login" ? "Welcome Back" : "Join the Night"}
            </p>

            <h2 className="mt-2 text-3xl font-black text-white">
              {mode === "login" ? "Log in" : "Create account"}
            </h2>

            <div className="mt-6 grid gap-3">
              {mode === "signup" && (
                <input
                  type="text"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 text-white outline-none transition focus:border-amber-300"
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 text-white outline-none transition focus:border-amber-300"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 text-white outline-none transition focus:border-amber-300"
              />

              <button
                onClick={handleAuth}
                disabled={
                  loading ||
                  !email ||
                  !password ||
                  (mode === "signup" && !displayName.trim())
                }
                className="rounded-2xl bg-amber-400 px-5 py-4 text-sm font-black text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Loading..."
                  : mode === "login"
                    ? "Log in"
                    : "Sign up"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setMessage("");
                }}
                className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm font-bold text-white transition hover:bg-white/15"
              >
                {mode === "login"
                  ? "Need an account? Sign up"
                  : "Already have an account? Log in"}
              </button>

              {message && (
                <p className="rounded-2xl border border-white/10 bg-white/10 p-3 text-sm text-zinc-200">
                  {message}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AuthForm;
