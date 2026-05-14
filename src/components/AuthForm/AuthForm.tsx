import { useState } from "react";
import { supabase } from "../../lib/supabase";

const AuthForm = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");

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
                display_name: displayName,
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
    <section style={{ maxWidth: 420 }}>
      <h1>Movie Night</h1>
      <h2>{mode === "login" ? "Log in" : "Create account"}</h2>

      <div style={{ display: "grid", gap: 12 }}>
        {mode === "signup" && (
          <input
            type="text"
            placeholder="Display name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button
          onClick={handleAuth}
          disabled={
            loading ||
            !email ||
            !password ||
            (mode === "signup" && !displayName)
          }
        >
          {loading ? "Loading..." : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login"
            ? "Need an account? Sign up"
            : "Already have an account? Log in"}
        </button>

        {message && <p>{message}</p>}
      </div>
    </section>
  );
};

export default AuthForm;
