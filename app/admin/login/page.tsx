"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (!email.trim() || !password) {
      setError("EMAIL AND PASSWORD ARE REQUIRED.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        console.error("LOGIN ERROR:", loginError);
        setError("INVALID EMAIL OR PASSWORD.");
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("LOGIN FAILED. PLEASE TRY AGAIN.");
        setLoading(false);
        return;
      }

      // Check if logged-in user is actually an admin
      const { data: admin, error: adminError } =
        await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", data.user.id)
          .maybeSingle();

      if (adminError) {
        console.error("ADMIN CHECK ERROR:", adminError);

        await supabase.auth.signOut();

        setError("ADMIN VERIFICATION FAILED.");
        setLoading(false);
        return;
      }

      if (!admin) {
        await supabase.auth.signOut();

        setError("YOU ARE NOT AUTHORIZED AS AN ADMIN.");
        setLoading(false);
        return;
      }

      // Successful admin login
      router.replace("/admin");
    } catch (err) {
      console.error("UNEXPECTED LOGIN ERROR:", err);

      setError("SOMETHING WENT WRONG. PLEASE TRY AGAIN.");
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#070707",
        color: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: '"Inter", Arial, sans-serif',
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.16,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Red glow */}
      <div
        style={{
          position: "fixed",
          width: "450px",
          height: "450px",
          right: "-180px",
          top: "-180px",
          borderRadius: "50%",
          background: "rgba(150,0,20,0.2)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      <section
        style={{
          width: "100%",
          maxWidth: "440px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Brand */}
        <div
          style={{
            marginBottom: "50px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: '"Space Grotesk", Arial, sans-serif',
              fontSize: "42px",
              fontWeight: 700,
              letterSpacing: "-2px",
            }}
          >
            STOKED
            <span
              style={{
                color: "#b7192e",
                fontSize: "11px",
                letterSpacing: "3px",
                marginLeft: "7px",
                verticalAlign: "top",
              }}
            >
              BD
            </span>
          </div>

          <p
            style={{
              marginTop: "12px",
              color: "#555",
              fontSize: "8px",
              letterSpacing: "4px",
            }}
          >
            ADMIN ACCESS / 01
          </p>
        </div>

        {/* Login box */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "35px",
            background: "rgba(7,7,7,0.8)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ marginBottom: "30px" }}>
            <p
              style={{
                color: "#666",
                fontSize: "8px",
                letterSpacing: "3px",
                marginBottom: "9px",
              }}
            >
              SECURE AREA
            </p>

            <h1
              style={{
                fontFamily: '"Space Grotesk", Arial, sans-serif',
                fontSize: "28px",
                fontWeight: 500,
                letterSpacing: "-0.5px",
              }}
            >
              ADMIN LOGIN
            </h1>
          </div>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: "18px" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  color: "#555",
                  fontSize: "8px",
                  letterSpacing: "2px",
                  marginBottom: "9px",
                }}
              >
                EMAIL
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="ADMIN EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  height: "50px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  outline: "none",
                  background: "transparent",
                  color: "#fff",
                  padding: "0 15px",
                  fontFamily: "inherit",
                  fontSize: "11px",
                  letterSpacing: "1px",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "22px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  color: "#555",
                  fontSize: "8px",
                  letterSpacing: "2px",
                  marginBottom: "9px",
                }}
              >
                PASSWORD
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                disabled={loading}
                style={{
                  width: "100%",
                  height: "50px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  outline: "none",
                  background: "transparent",
                  color: "#fff",
                  padding: "0 15px",
                  fontFamily: "inherit",
                  fontSize: "11px",
                  letterSpacing: "1px",
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  border: "1px solid rgba(183,25,46,0.4)",
                  color: "#d84a5c",
                  padding: "12px 14px",
                  marginBottom: "18px",
                  fontSize: "8px",
                  letterSpacing: "1px",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "52px",
                border: "1px solid #b7192e",
                background: "#b7192e",
                color: "#fff",
                cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit",
                fontSize: "9px",
                letterSpacing: "2px",
                transition: "0.25s ease",
                opacity: loading ? 0.55 : 1,
              }}
            >
              {loading
                ? "AUTHENTICATING..."
                : "ENTER ADMIN PANEL →"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "25px",
            display: "flex",
            justifyContent: "space-between",
            color: "#333",
            fontSize: "7px",
            letterSpacing: "2px",
          }}
        >
          <span>STOKED BD</span>
          <span>PRIVATE ACCESS</span>
        </div>
      </section>
    </main>
  );
}