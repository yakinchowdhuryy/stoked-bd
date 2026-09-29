"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] =
    useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const {
        data,
        error: signupError,
      } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (signupError) {
        console.error(
          "SIGNUP ERROR:",
          signupError
        );

        setError(signupError.message);
        return;
      }

      /*
       * If email confirmation is disabled
       * in Supabase, session will be available
       * immediately and the user can go straight
       * to the account page.
       */
      if (data.session) {
        router.push("/account");
        router.refresh();
        return;
      }

      /*
       * If Supabase still has email confirmation
       * enabled, there won't be a session here.
       */
      setError(
        "Account created. Please check your email to verify your account."
      );
    } catch (err) {
      console.error(
        "SIGNUP ERROR:",
        err
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const {
        error: googleError,
      } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            `${window.location.origin}/auth/callback`,
        },
      });

      if (googleError) {
        console.error(
          "GOOGLE SIGNUP ERROR:",
          googleError
        );

        setError(googleError.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error(
        "GOOGLE SIGNUP ERROR:",
        err
      );

      setError(
        "Google signup failed. Please try again."
      );

      setGoogleLoading(false);
    }
  };

  return (
    <main className="signup-page">
      {/* BACKGROUND */}
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* HEADER */}
      <header className="signup-header">
        <Link
          href="/"
          className="brand"
        >
          STOKED
        </Link>

        <Link
          href="/login"
          className="exit-link"
        >
          LOGIN ↗
        </Link>
      </header>

      {/* CONTENT */}
      <section className="signup-section">
        <div className="signup-card">

          {/* TOP LABEL */}
          <div className="top-label">
            <span className="status-dot" />
            NEW CUSTOMER
          </div>

          {/* TITLE */}
          <div className="title-area">
            <p className="small-title">
              STOKED BD / 2026
            </p>

            <h1>
              CREATE
              <br />
              ACCOUNT
            </h1>

            <p className="subtitle">
              JOIN THE STOKED COMMUNITY
            </p>
          </div>

          {/* GOOGLE */}
          <button
            type="button"
            className="google-button"
            onClick={
              handleGoogleSignup
            }
            disabled={
              loading ||
              googleLoading
            }
          >
            <span className="google-icon">
              G
            </span>

            <span>
              {googleLoading
                ? "CONNECTING..."
                : "CONTINUE WITH GOOGLE"}
            </span>

            <span className="button-arrow">
              ↗
            </span>
          </button>

          {/* DIVIDER */}
          <div className="divider">
            <span />
            <p>OR</p>
            <span />
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSignup}
          >

            {/* NAME */}
            <div className="field">
              <label htmlFor="name">
                FULL NAME
              </label>

              <input
                id="name"
                type="text"
                placeholder="YOUR NAME"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                autoComplete="name"
                disabled={
                  loading ||
                  googleLoading
                }
              />
            </div>

            {/* EMAIL */}
            <div className="field">
              <label htmlFor="email">
                EMAIL ADDRESS
              </label>

              <input
                id="email"
                type="email"
                placeholder="YOUR@EMAIL.COM"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                autoComplete="email"
                disabled={
                  loading ||
                  googleLoading
                }
              />
            </div>

            {/* PASSWORD */}
            <div className="field">
              <label htmlFor="password">
                PASSWORD
              </label>

              <input
                id="password"
                type="password"
                placeholder="MINIMUM 6 CHARACTERS"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
                disabled={
                  loading ||
                  googleLoading
                }
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="field">
              <label htmlFor="confirmPassword">
                CONFIRM PASSWORD
              </label>

              <input
                id="confirmPassword"
                type="password"
                placeholder="RE-ENTER PASSWORD"
                value={
                  confirmPassword
                }
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
                disabled={
                  loading ||
                  googleLoading
                }
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="error-message">
                <span>!</span>

                <p>{error}</p>
              </div>
            )}

            {/* SIGN UP */}
            <button
              type="submit"
              className="signup-button"
              disabled={
                loading ||
                googleLoading
              }
            >
              <span>
                {loading
                  ? "CREATING ACCOUNT..."
                  : "CREATE ACCOUNT"}
              </span>

              <span className="button-arrow">
                →
              </span>
            </button>

          </form>

          {/* LOGIN */}
          <div className="login-area">
            <p>
              ALREADY HAVE AN ACCOUNT?
            </p>

            <Link href="/login">
              SIGN IN ↗
            </Link>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="signup-footer">
        <span>
          STOKED BD
        </span>

        <span>
          CUSTOMER REGISTRATION
        </span>

        <span>
          2026
        </span>
      </footer>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .signup-page {
          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 50% 40%,
              rgba(130, 10, 25, 0.12),
              transparent 38%
            ),
            #050505;
          color: #fff;
          font-family:
            "Space Grotesk",
            Arial,
            sans-serif;
          display: flex;
          flex-direction: column;
        }

        .bg-grid {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.08;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.08) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.08) 1px,
              transparent 1px
            );
          background-size: 70px 70px;
          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 85%
            );
        }

        .bg-glow {
          position: fixed;
          width: 500px;
          height: 500px;
          left: 50%;
          top: 42%;
          transform:
            translate(-50%, -50%);
          border-radius: 50%;
          background:
            rgba(120, 0, 20, 0.1);
          filter: blur(100px);
          pointer-events: none;
        }

        .signup-header {
          position: relative;
          z-index: 5;
          width: 100%;
          height: 80px;
          padding: 0 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.08);
        }

        .brand {
          color: #fff;
          text-decoration: none;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.24em;
        }

        .exit-link {
          color:
            rgba(255, 255, 255, 0.55);
          text-decoration: none;
          font-size: 11px;
          letter-spacing: 0.16em;
          transition:
            color 0.2s ease;
        }

        .exit-link:hover {
          color: #fff;
        }

        .signup-section {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }

        .signup-card {
          width: 100%;
          max-width: 480px;
          padding: 42px;
          border:
            1px solid
            rgba(255, 255, 255, 0.1);
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.045),
              rgba(255, 255, 255, 0.015)
            );
          backdrop-filter: blur(18px);
          box-shadow:
            0 30px 100px
              rgba(0, 0, 0, 0.45),
            inset 0 1px 0
              rgba(255, 255, 255, 0.04);
        }

        .top-label {
          display: flex;
          align-items: center;
          gap: 9px;
          color:
            rgba(255, 255, 255, 0.42);
          font-size: 9px;
          letter-spacing: 0.2em;
          margin-bottom: 30px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #9a111e;
          box-shadow:
            0 0 12px
              rgba(154, 17, 30, 0.8);
        }

        .title-area {
          margin-bottom: 30px;
        }

        .small-title {
          margin: 0 0 12px;
          color:
            rgba(255, 255, 255, 0.35);
          font-size: 9px;
          letter-spacing: 0.2em;
        }

        h1 {
          margin: 0;
          font-size:
            clamp(44px, 9vw, 68px);
          line-height: 0.83;
          font-weight: 700;
          letter-spacing: -0.06em;
        }

        .subtitle {
          margin: 18px 0 0;
          color:
            rgba(255, 255, 255, 0.45);
          font-size: 10px;
          letter-spacing: 0.18em;
        }

        .google-button,
        .signup-button {
          width: 100%;
          height: 54px;
          border:
            1px solid
            rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.12em;
          font-size: 10px;
          transition:
            background 0.25s ease,
            border-color 0.25s ease,
            transform 0.25s ease;
        }

        .google-button {
          background:
            rgba(255, 255, 255, 0.04);
          color: #fff;
          gap: 12px;
        }

        .google-button:hover:not(:disabled) {
          background:
            rgba(255, 255, 255, 0.08);
          border-color:
            rgba(255, 255, 255, 0.25);
        }

        .google-icon {
          font-family: Arial, sans-serif;
          font-weight: 700;
          font-size: 17px;
        }

        .button-arrow {
          position: absolute;
          right: 17px;
          font-size: 15px;
          opacity: 0.7;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 24px 0;
        }

        .divider span {
          flex: 1;
          height: 1px;
          background:
            rgba(255, 255, 255, 0.08);
        }

        .divider p {
          margin: 0;
          color:
            rgba(255, 255, 255, 0.25);
          font-size: 8px;
          letter-spacing: 0.15em;
        }

        .field {
          margin-bottom: 16px;
        }

        .field label {
          display: block;
          margin-bottom: 8px;
          color:
            rgba(255, 255, 255, 0.42);
          font-size: 9px;
          letter-spacing: 0.16em;
        }

        .field input {
          width: 100%;
          height: 52px;
          padding: 0 15px;
          outline: none;
          border:
            1px solid
            rgba(255, 255, 255, 0.1);
          background:
            rgba(0, 0, 0, 0.35);
          color: #fff;
          font-family: inherit;
          font-size: 12px;
          letter-spacing: 0.04em;
          transition:
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .field input::placeholder {
          color:
            rgba(255, 255, 255, 0.2);
        }

        .field input:focus {
          border-color:
            rgba(154, 17, 30, 0.75);
          background:
            rgba(0, 0, 0, 0.55);
        }

        .field input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-message {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin: 4px 0 15px;
          padding: 11px 13px;
          border:
            1px solid
            rgba(180, 20, 35, 0.35);
          background:
            rgba(130, 10, 20, 0.1);
          color: #e58a92;
          font-size: 10px;
          line-height: 1.5;
        }

        .error-message span {
          width: 17px;
          height: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          border:
            1px solid
            rgba(180, 20, 35, 0.55);
          border-radius: 50%;
          font-size: 9px;
          flex-shrink: 0;
        }

        .error-message p {
          margin: 1px 0 0;
        }

        .signup-button {
          margin-top: 6px;
          border-color: #9a111e;
          background: #9a111e;
          color: #fff;
          font-weight: 600;
        }

        .signup-button:hover:not(:disabled) {
          background: #b31524;
          border-color: #b31524;
          transform: translateY(-1px);
        }

        .google-button:disabled,
        .signup-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .login-area {
          margin-top: 28px;
          padding-top: 24px;
          border-top:
            1px solid
            rgba(255, 255, 255, 0.07);
          text-align: center;
        }

        .login-area p {
          margin: 0 0 10px;
          color:
            rgba(255, 255, 255, 0.3);
          font-size: 8px;
          letter-spacing: 0.16em;
        }

        .login-area a {
          color: #fff;
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 0.14em;
          transition:
            color 0.2s ease;
        }

        .login-area a:hover {
          color: #d52a3a;
        }

        .signup-footer {
          position: relative;
          z-index: 3;
          min-height: 55px;
          padding: 0 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color:
            rgba(255, 255, 255, 0.22);
          font-size: 8px;
          letter-spacing: 0.15em;
        }

        @media (max-width: 600px) {
          .signup-header {
            height: 65px;
            padding: 0 18px;
          }

          .signup-section {
            padding: 30px 15px;
          }

          .signup-card {
            padding: 28px 20px;
          }

          h1 {
            font-size: 50px;
          }

          .signup-footer {
            padding: 0 18px;
          }

          .signup-footer span:nth-child(2) {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}