import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { AuthForm } from "./components/AuthForm";
import { DashboardPage } from "./pages/DashboardPage";
import { RoomPage } from "./pages/RoomPage";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <main>Loading...</main>;
  }

  if (!session) {
    return <AuthForm />;
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage session={session} />} />

      <Route path="/rooms/:roomId" element={<RoomPage session={session} />} />
    </Routes>
  );
}
