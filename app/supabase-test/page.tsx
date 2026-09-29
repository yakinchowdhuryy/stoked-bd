import { supabase } from "@/lib/supabase";

export default async function SupabaseTest() {
  const { data, error } = await supabase
    .from("categories")
    .select("*");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>STOKED BD — Supabase Test</h1>

      {error ? (
        <>
          <h2 style={{ color: "red" }}>Connection Error ❌</h2>
          <pre>{error.message}</pre>
        </>
      ) : (
        <>
          <h2 style={{ color: "#00ff66" }}>
            Supabase Connected ✅
          </h2>

          <pre>
            {JSON.stringify(data, null, 2)}
          </pre>
        </>
      )}
    </main>
  );
}