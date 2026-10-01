"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const SPIDER_IMAGE =
  "https://www.pngall.com/wp-content/uploads/13/Spiderman-Logo-No-Background.png";

const socialButtonStyle: React.CSSProperties = {
  minHeight: "56px",
  width: "100%",
  border: "1px solid rgba(255,255,255,.08)",
  background: "rgba(255,255,255,.025)",
  color: "rgba(255,255,255,.68)",
  textAlign: "left",
  padding: "0 18px",
  fontFamily: '"Space Grotesk", sans-serif',
  fontSize: "12px",
  letterSpacing: ".15em",
  cursor: "pointer",
};

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

  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* =========================================================
     MOBILE CHECK
  ========================================================= */

  useEffect(() => {
    const updateMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    updateMobile();
    window.addEventListener("resize", updateMobile);

    return () => {
      window.removeEventListener("resize", updateMobile);
    };
  }, []);

  /* =========================================================
     MENU
  ========================================================= */

  function openMenu(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    setAboutOpen(false);
    setContactOpen(false);
    setMenuOpen(true);
  }

  function closeMenu(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    setMenuOpen(false);
  }

  function goHome(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(false);
    router.push("/");
  }

  function goToShop(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(false);
    router.push("/shop");
  }

  function goToAccount(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(false);
    router.push("/account");
  }

  function openAbout(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    setMenuOpen(false);
    setContactOpen(false);
    setAboutOpen(true);
  }

  function closeAbout(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    setAboutOpen(false);
    setMenuOpen(false);
  }

  function openContact(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(true);
  }

  function closeContact(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    setContactOpen(false);
    setMenuOpen(false);
  }

  function isMobileDevice() {
    if (typeof window === "undefined") return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function openInstagram(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    const url = "https://www.instagram.com/stoked.bd/";

    if (isMobileDevice()) {
      window.location.href = url;
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openFacebook(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    const url =
      "https://www.facebook.com/share/1ba7vRfxAB/?mibextid=wwXIfr";

    if (isMobileDevice()) {
      window.location.href = url;
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openTikTok(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    const url = "https://www.tiktok.com/@stoked.bd";

    if (isMobileDevice()) {
      window.location.href = url;
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  /* =========================================================
     SIGNUP
  ========================================================= */

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

  /* HEADER SIZES — same as product page */
  const navItemPadding = isMobile ? "0 6px" : "0 9px";
  const navFontSize = isMobile ? "7px" : "8px";
  const navLetterSpacing = isMobile ? ".07em" : ".11em";

  return (
    <main className="signup-page">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="background-fixed">

        <div className="background-red-light red-light-one" />
        <div className="background-red-light red-light-two" />

        <div className="background-web background-web-left">
          <span className="web-line web-line-1" />
          <span className="web-line web-line-2" />
          <span className="web-line web-line-3" />
          <span className="web-line web-line-4" />
          <span className="web-line web-line-5" />

          <span className="web-ring web-ring-1" />
          <span className="web-ring web-ring-2" />
          <span className="web-ring web-ring-3" />
        </div>

        <div className="background-web background-web-right">
          <span className="web-line web-line-1" />
          <span className="web-line web-line-2" />
          <span className="web-line web-line-3" />
          <span className="web-line web-line-4" />
          <span className="web-line web-line-5" />

          <span className="web-ring web-ring-1" />
          <span className="web-ring web-ring-2" />
          <span className="web-ring web-ring-3" />
        </div>

        <div className="spider-field">

          <img
            src={SPIDER_IMAGE}
            alt=""
            className="spider spider-1"
          />

          <img
            src={SPIDER_IMAGE}
            alt=""
            className="spider spider-2"
          />

          <img
            src={SPIDER_IMAGE}
            alt=""
            className="spider spider-3"
          />

          <img
            src={SPIDER_IMAGE}
            alt=""
            className="spider spider-4"
          />

          <img
            src={SPIDER_IMAGE}
            alt=""
            className="spider spider-5"
          />

        </div>

        <div className="background-grid" />
        <div className="background-glow glow-one" />
        <div className="background-glow glow-two" />
        <div className="red-vignette" />
        <div className="grain" />

      </div>

      {/* =====================================================
          HEADER — SAME AS PRODUCT PAGE
      ===================================================== */}

      <header
        style={{
          position: isMobile ? "relative" : "absolute",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "8px" : 0,
          padding: isMobile
            ? "16px 6vw"
            : "22px 6vw",
          minHeight: isMobile
            ? "64px"
            : "70px",
          zIndex: 2147483640,
          pointerEvents: "none",
        }}
      >
        <Link
          href="/"
          className="mini-logo"
          style={{
            textDecoration: "none",
            pointerEvents: "auto",
            display: "block",
            flexShrink: 0,
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: isMobile ? "12px" : "14px",
            fontWeight: 700,
            letterSpacing: isMobile ? "0.12em" : "0.18em",
            color: "#ffffff",
          }}
        >
          STOKED
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            marginLeft: "auto",
            minWidth: 0,
            flexShrink: 1,
            padding: "3px",
            border:
              "1px solid rgba(255,255,255,.11)",
            borderRadius: "14px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,.065), rgba(255,255,255,.018))",
            boxShadow:
              "0 12px 35px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05)",
            backdropFilter:
              "blur(14px)",
            WebkitBackdropFilter:
              "blur(14px)",
            pointerEvents: "auto",
          }}
        >
          <Link
            href="/account"
            style={{
              minHeight: "40px",
              padding: navItemPadding,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color:
                "rgba(255,255,255,.72)",
              textDecoration: "none",
              fontFamily:
                '"Space Grotesk", sans-serif',
              fontSize: navFontSize,
              fontWeight: 600,
              letterSpacing: navLetterSpacing,
              borderRadius: "9px",
              background:
                "rgba(255,255,255,.045)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            MY ACCOUNT
          </Link>

          <span
            style={{
              width: "1px",
              height: "18px",
              background:
                "rgba(255,255,255,.07)",
            }}
          />

          <Link
            href="/cart"
            style={{
              minHeight: "40px",
              padding: navItemPadding,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              border: 0,
              borderRadius: "9px",
              background: "transparent",
              color:
                "rgba(255,255,255,.65)",
              fontFamily:
                '"Space Grotesk", sans-serif',
              fontSize: navFontSize,
              fontWeight: 500,
              letterSpacing: navLetterSpacing,
              cursor: "pointer",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            BAG

            <span
              style={{
                minWidth: "17px",
                height: "17px",
                padding: "0 4px",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "6px",
                fontWeight: 600,
                color: "#fff",
                background:
                  "rgba(169,21,37,.8)",
              }}
            >
              00
            </span>
          </Link>

          <span
            style={{
              width: "1px",
              height: "18px",
              background:
                "rgba(255,255,255,.07)",
            }}
          />

          <button
            type="button"
            onPointerUp={openMenu}
            aria-label="Open menu"
            style={{
              minHeight: "40px",
              padding: navItemPadding,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color:
                "rgba(255,255,255,.72)",
              background:
                "rgba(255,255,255,.045)",
              border: 0,
              borderRadius: "9px",
              fontFamily:
                '"Space Grotesk", sans-serif',
              fontSize: navFontSize,
              fontWeight: 600,
              letterSpacing: navLetterSpacing,
              cursor: "pointer",
              whiteSpace: "nowrap",
              touchAction: "manipulation",
            }}
          >
            MENU
          </button>
        </div>
      </header>

      {/* =====================================================
          ABOUT
      ===================================================== */}

      {aboutOpen && (
        <div
          onClick={closeAbout}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(3,2,2,.88)",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(680px, 100%)",
              padding: isMobile ? "35px 24px" : "50px",
              position: "relative",
              border: "1px solid rgba(255,255,255,.10)",
              background:
                "linear-gradient(145deg, rgba(35,5,5,.96), rgba(7,2,2,.98))",
            }}
          >
            <button
              type="button"
              onClick={closeAbout}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                border: 0,
                background: "transparent",
                color: "rgba(255,255,255,.5)",
                cursor: "pointer",
              }}
            >
              CLOSE ×
            </button>

            <div
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: "clamp(42px, 8vw, 78px)",
                lineHeight: ".85",
                letterSpacing: "-.065em",
                marginBottom: "30px",
              }}
            >
              ABOUT
            </div>

            <div
              style={{
                width: "45px",
                height: "1px",
                background: "#a91525",
                marginBottom: "30px",
              }}
            />

            <p
              style={{
                margin: 0,
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: "17px",
                lineHeight: 1.7,
                color: "rgba(255,255,255,.58)",
              }}
            >
              STOKED is a Bangladesh-based fashion label built around
              bold silhouettes, expressive graphics and a darker visual
              language.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          CONTACT
      ===================================================== */}

      {contactOpen && (
        <div
          onClick={closeContact}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(3,2,2,.88)",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(680px, 100%)",
              padding: isMobile ? "35px 24px" : "50px",
              position: "relative",
              border: "1px solid rgba(255,255,255,.10)",
              background:
                "linear-gradient(145deg, rgba(35,5,5,.96), rgba(7,2,2,.98))",
            }}
          >
            <button
              type="button"
              onClick={closeContact}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                border: 0,
                background: "transparent",
                color: "rgba(255,255,255,.5)",
                cursor: "pointer",
              }}
            >
              CLOSE ×
            </button>

            <div
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: "clamp(42px, 8vw, 78px)",
                lineHeight: ".85",
                letterSpacing: "-.065em",
                marginBottom: "30px",
              }}
            >
              CONTACT
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={openInstagram}
                style={socialButtonStyle}
              >
                INSTAGRAM
              </button>

              <button
                type="button"
                onClick={openFacebook}
                style={socialButtonStyle}
              >
                FACEBOOK
              </button>

              <button
                type="button"
                onClick={openTikTok}
                style={socialButtonStyle}
              >
                TIKTOK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SHOP-STYLE MENU
      ===================================================== */}

      <div
        className={`stoked-menu ${
          menuOpen
            ? "stoked-menu-visible"
            : ""
        }`}
        aria-hidden={!menuOpen}
        onClick={closeMenu}
      >
        <button
          type="button"
          className="stoked-menu-backdrop"
          onClick={closeMenu}
          aria-label="Close menu"
          tabIndex={
            menuOpen ? 0 : -1
          }
        />

        <aside
          className="stoked-menu-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="stoked-menu-top">
            <div className="stoked-menu-logo">
              STOKED
            </div>

            <button
              type="button"
              className="stoked-menu-close"
              onClick={closeMenu}
            >
              CLOSE <span>×</span>
            </button>
          </div>

          <nav className="stoked-menu-links">
            <button
              type="button"
              onClick={goHome}
            >
              HOME
            </button>

            <button
              type="button"
              onClick={goToShop}
            >
              SHOP
            </button>

            <button
              type="button"
              onClick={goToAccount}
            >
              MY ACCOUNT
            </button>

            <button
              type="button"
              onClick={openAbout}
            >
              ABOUT
            </button>

            <button
              type="button"
              onClick={openContact}
            >
              CONTACT
            </button>
          </nav>

          <div className="stoked-menu-footer">
            <span>
              © 2026 STOKED BD
            </span>

            <span>
              EST. 2026
            </span>
          </div>
        </aside>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

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
            onClick={handleGoogleSignup}
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
          <form onSubmit={handleSignup}>

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
                  setName(e.target.value)
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
                  setEmail(e.target.value)
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
                  setPassword(e.target.value)
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
                value={confirmPassword}
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

            <Link
              href="/login"
              className="signin-button"
            >
              <span className="signin-corner corner-tl" />
              <span className="signin-corner corner-br" />

              <span className="signin-text">
                SIGN IN
              </span>

              <span className="signin-arrow">
                ↗
              </span>
            </Link>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="signup-footer">
        <span>STOKED BD</span>
        <span>CUSTOMER REGISTRATION</span>
        <span>2026</span>
      </footer>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        /* =====================================================
           ROOT
        ===================================================== */

        .signup-page {
          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(120, 0, 0, 0.17),
              transparent 35%
            ),
            #080303;
          color: #f5f5f3;
          font-family:
            "Space Grotesk",
            Inter,
            Arial,
            sans-serif;
          display: flex;
          flex-direction: column;
          scrollbar-width: thin;
          scrollbar-color:
            rgba(255, 35, 35, 0.5)
            transparent;
        }

        /* =====================================================
           FIXED BACKGROUND
        ===================================================== */

        .background-fixed {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .background-fixed::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              circle at 50% 45%,
              transparent 0,
              rgba(0, 0, 0, 0.15) 55%,
              rgba(0, 0, 0, 0.45) 100%
            );
        }

        .background-red-light {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
        }

        .red-light-one {
          width: 450px;
          height: 450px;
          left: -280px;
          top: 12%;
          background: #7d0000;
          opacity: 0.12;
        }

        .red-light-two {
          width: 500px;
          height: 500px;
          right: -300px;
          bottom: 8%;
          background: #6c0000;
          opacity: 0.1;
        }

        /* =====================================================
           WEB
        ===================================================== */

        .background-web {
          position: absolute;
          width: 580px;
          height: 580px;
          border-radius: 50%;
          opacity: 0.13;
        }

        .background-web::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background:
            repeating-radial-gradient(
              circle,
              transparent 0 40px,
              rgba(255, 255, 255, 0.13) 41px 42px
            );
        }

        .background-web-left {
          left: -360px;
          top: -130px;
        }

        .background-web-right {
          right: -360px;
          bottom: -150px;
        }

        .web-line {
          position: absolute;
          width: 1px;
          height: 100%;
          left: 50%;
          top: 0;
          background:
            linear-gradient(
              to bottom,
              transparent,
              rgba(255, 255, 255, 0.13),
              transparent
            );
          transform-origin: center;
        }

        .web-line-1 {
          transform: rotate(0deg);
        }

        .web-line-2 {
          transform: rotate(30deg);
        }

        .web-line-3 {
          transform: rotate(60deg);
        }

        .web-line-4 {
          transform: rotate(90deg);
        }

        .web-line-5 {
          transform: rotate(120deg);
        }

        .web-ring {
          position: absolute;
          border:
            1px solid
            rgba(255, 255, 255, 0.09);
          border-radius: 50%;
          inset: 25%;
        }

        .web-ring-1 {
          inset: 17%;
        }

        .web-ring-2 {
          inset: 35%;
        }

        .web-ring-3 {
          inset: 53%;
        }

        /* =====================================================
           SPIDERS
        ===================================================== */

        .spider-field {
          position: absolute;
          inset: 0;
        }

        .spider {
          position: absolute;
          object-fit: contain;
          opacity: 0.075;
          filter:
            grayscale(1)
            drop-shadow(
              0 0 22px
              rgba(255, 0, 0, 0.2)
            );
          animation:
            spiderFloat
            8s
            ease-in-out
            infinite;
        }

        .spider-1 {
          width: 125px;
          left: 3%;
          top: 9%;
        }

        .spider-2 {
          width: 90px;
          right: 6%;
          top: 17%;
          opacity: 0.06;
          animation-delay: -2s;
        }

        .spider-3 {
          width: 65px;
          left: 7%;
          top: 58%;
          opacity: 0.045;
          animation-delay: -4s;
        }

        .spider-4 {
          width: 105px;
          right: 3%;
          top: 54%;
          opacity: 0.065;
          animation-delay: -1s;
        }

        .spider-5 {
          width: 75px;
          left: 43%;
          bottom: 4%;
          opacity: 0.045;
          animation-delay: -5s;
        }

        @keyframes spiderFloat {
          0%,
          100% {
            transform:
              translate3d(0, 0, 0)
              rotate(-2deg);
          }

          25% {
            transform:
              translate3d(8px, 18px, 0)
              rotate(3deg);
          }

          50% {
            transform:
              translate3d(-8px, -5px, 0)
              rotate(-4deg);
          }

          75% {
            transform:
              translate3d(5px, 13px, 0)
              rotate(2deg);
          }
        }

        /* =====================================================
           GRID
        ===================================================== */

        .background-grid {
          position: absolute;
          inset: 0;
          opacity: 0.18;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.025) 1px,
              transparent 1px
            );
          background-size: 75px 75px;
          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 90%
            );
        }

        .background-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
        }

        .glow-one {
          width: 340px;
          height: 340px;
          left: -190px;
          top: 22%;
          background: #850000;
          opacity: 0.12;
        }

        .glow-two {
          width: 380px;
          height: 380px;
          right: -210px;
          bottom: 8%;
          background: #620000;
          opacity: 0.1;
        }

        .red-vignette {
          position: absolute;
          inset: 0;
          box-shadow:
            inset 0 0 180px
            rgba(80, 0, 0, 0.2);
        }

        .grain {
          position: absolute;
          inset: 0;
          opacity: 0.035;
          background-image:
            url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
        }

        /* =====================================================
           SHOP MENU
        ===================================================== */

        .stoked-menu {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          max-width: none !important;
          height: 100dvh !important;
          margin: 0 !important;
          padding: 0 !important;
          z-index: 2147483647 !important;
          display: block !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transform: none !important;
          overflow: hidden !important;
          transition:
            opacity 0.35s ease,
            visibility 0.35s ease !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -webkit-touch-callout: none !important;
        }

        .stoked-menu.stoked-menu-visible {
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }

        .stoked-menu-backdrop {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          background: rgba(0, 0, 0, 0.45) !important;
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          cursor: pointer !important;
          pointer-events: auto !important;
          -webkit-tap-highlight-color: transparent !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }

        .stoked-menu-panel {
          position: absolute !important;
          top: 0 !important;
          right: 0 !important;
          width: 330px !important;
          max-width: 86vw !important;
          height: 100dvh !important;
          background:
            linear-gradient(
              135deg,
              rgba(35, 5, 5, 0.98),
              rgba(7, 2, 2, 0.99)
            ) !important;
          border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
          transform: translateX(105%) !important;
          transition:
            transform 0.65s cubic-bezier(0.76, 0, 0.24, 1) !important;
          overflow: hidden !important;
          z-index: 2 !important;
          pointer-events: auto !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -webkit-touch-callout: none !important;
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .stoked-menu.stoked-menu-visible .stoked-menu-panel {
          transform: translateX(0) !important;
        }

        .stoked-menu-top {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          padding: 27px 25px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          z-index: 10 !important;
        }

        .stoked-menu-logo {
          font-family: "Space Grotesk", sans-serif !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          letter-spacing: 0.25em !important;
          color: white !important;
          opacity: 0.9 !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }

        .stoked-menu-close {
          border: 0 !important;
          outline: none !important;
          background: transparent !important;
          color: rgba(255, 255, 255, 0.45) !important;
          font-family: "Inter", sans-serif !important;
          font-size: 7px !important;
          font-weight: 500 !important;
          letter-spacing: 0.16em !important;
          padding: 8px !important;
          display: flex !important;
          align-items: center !important;
          gap: 5px !important;
          cursor: pointer !important;
          pointer-events: auto !important;
          -webkit-tap-highlight-color: transparent !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          touch-action: manipulation !important;
          transition:
            opacity 0.25s ease,
            transform 0.25s ease !important;
        }

        .stoked-menu-close:hover {
          opacity: 0.65 !important;
          transform: translateX(-3px);
        }

        .stoked-menu-close span {
          font-size: 19px !important;
          line-height: 1 !important;
          color: rgba(255, 255, 255, 0.65) !important;
        }

        .stoked-menu-links {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          padding: 0 25px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          justify-content: center !important;
          gap: 7px !important;
          z-index: 5 !important;
          pointer-events: auto !important;
        }

        .stoked-menu-links button {
          position: relative !important;
          width: 100% !important;
          height: 55px !important;
          padding: 0 16px !important;
          display: flex !important;
          align-items: center !important;
          border: 1px solid rgba(255, 255, 255, 0.055) !important;
          border-radius: 2px !important;
          background: rgba(255, 255, 255, 0.018) !important;
          color: rgba(255, 255, 255, 0.58) !important;
          font-family: "Space Grotesk", sans-serif !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          letter-spacing: 0.08em !important;
          line-height: 1 !important;
          cursor: pointer !important;
          pointer-events: auto !important;
          outline: none !important;
          -webkit-tap-highlight-color: transparent !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -webkit-touch-callout: none !important;
          touch-action: manipulation !important;
          transform: none !important;
          transition:
            background 0.35s ease,
            border-color 0.35s ease,
            color 0.35s ease,
            padding-left 0.35s ease,
            box-shadow 0.35s ease !important;
        }

        .stoked-menu-links button::before {
          content: "01" !important;
          width: 25px !important;
          flex-shrink: 0 !important;
          font-family: "Inter", sans-serif !important;
          font-size: 7px !important;
          font-weight: 500 !important;
          letter-spacing: 0.1em !important;
          color: rgba(255, 255, 255, 0.2) !important;
          transition: color 0.35s ease !important;
        }

        .stoked-menu-links button:nth-child(2)::before {
          content: "02" !important;
        }

        .stoked-menu-links button:nth-child(3)::before {
          content: "03" !important;
        }

        .stoked-menu-links button:nth-child(4)::before {
          content: "04" !important;
        }

        .stoked-menu-links button:nth-child(5)::before {
          content: "05" !important;
        }

        .stoked-menu-links button:hover {
          color: white !important;
          padding-left: 22px !important;
          background:
            linear-gradient(
              90deg,
              rgba(130, 0, 0, 0.18),
              rgba(255, 255, 255, 0.025)
            ) !important;
          border-color: rgba(150, 0, 0, 0.3) !important;
          box-shadow:
            inset 2px 0 0 rgba(150, 0, 0, 0.85),
            0 8px 30px rgba(0, 0, 0, 0.18) !important;
        }

        .stoked-menu-links button:hover::before {
          color: rgba(180, 0, 0, 0.9) !important;
        }

        .stoked-menu-footer {
          position: absolute !important;
          bottom: 28px !important;
          left: 0 !important;
          width: 100% !important;
          padding: 0 25px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          color: rgba(255, 255, 255, 0.22) !important;
          font-family: "Inter", sans-serif !important;
          font-size: 6px !important;
          letter-spacing: 0.18em !important;
          z-index: 10 !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }

        @media (max-width: 700px) {
          .stoked-menu-panel {
            width: 285px !important;
            max-width: 86vw !important;
          }

          .stoked-menu-top {
            padding: 24px 20px !important;
          }

          .stoked-menu-links {
            padding: 0 18px !important;
            gap: 6px !important;
          }

          .stoked-menu-links button {
            height: 50px !important;
            font-size: 12px !important;
            padding: 0 13px !important;
          }

          .stoked-menu-links button:hover {
            padding-left: 19px !important;
          }

          .stoked-menu-footer {
            bottom: 20px !important;
            padding: 0 20px !important;
          }
        }

        /* =====================================================
           LOGIN CONTENT
        ===================================================== */

        .signup-section {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 110px 20px 70px;
        }

        .signup-card {
          width: 100%;
          max-width: 480px;
          padding: 42px;
          border: 1px solid
            rgba(255, 255, 255, 0.1);
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.045),
              rgba(255, 255, 255, 0.015)
            );
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow:
            0 30px 100px rgba(0, 0, 0, 0.45),
            inset 0 1px 0
              rgba(255, 255, 255, 0.04);
        }

        .top-label {
          display: flex;
          align-items: center;
          gap: 9px;
          color: rgba(255, 255, 255, 0.42);
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
          color: rgba(255, 255, 255, 0.35);
          font-size: 9px;
          letter-spacing: 0.2em;
        }

        h1 {
          margin: 0;
          font-size: clamp(44px, 9vw, 68px);
          line-height: 0.83;
          font-weight: 700;
          letter-spacing: -0.06em;
        }

        .subtitle {
          margin: 18px 0 0;
          color: rgba(255, 255, 255, 0.45);
          font-size: 10px;
          letter-spacing: 0.18em;
        }

        .google-button,
        .signup-button {
          width: 100%;
          height: 54px;
          border: 1px solid
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
          background: rgba(255, 255, 255, 0.04);
          color: #fff;
          gap: 12px;
        }

        .google-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.25);
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
          background: rgba(255, 255, 255, 0.08);
        }

        .divider p {
          margin: 0;
          color: rgba(255, 255, 255, 0.25);
          font-size: 8px;
          letter-spacing: 0.15em;
        }

        .field {
          margin-bottom: 16px;
        }

        .field label {
          display: block;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.42);
          font-size: 9px;
          letter-spacing: 0.16em;
        }

        .field input {
          width: 100%;
          height: 52px;
          padding: 0 15px;
          outline: none;
          border: 1px solid
            rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.35);
          color: #fff;
          font-family: inherit;
          font-size: 12px;
          letter-spacing: 0.04em;
          transition:
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .field input::placeholder {
          color: rgba(255, 255, 255, 0.2);
        }

        .field input:focus {
          border-color: rgba(154, 17, 30, 0.75);
          background: rgba(0, 0, 0, 0.55);
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
          border: 1px solid
            rgba(180, 20, 35, 0.35);
          background: rgba(130, 10, 20, 0.1);
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
          border: 1px solid
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

        /* =====================================================
           SIGN UP / CREATE ACCOUNT
        ===================================================== */

        .login-area {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid
            rgba(255, 255, 255, 0.07);
          text-align: center;
        }

        .login-area p {
          margin: 0 0 14px;
          color: rgba(255, 255, 255, 0.3);
          font-size: 8px;
          letter-spacing: 0.16em;
        }

        .signin-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 56px;
          overflow: hidden;
          isolation: isolate;
          text-decoration: none;
          color: #fff;
          border: 1px solid
            rgba(255, 255, 255, 0.14);
          background:
            linear-gradient(
              135deg,
              rgba(154, 17, 30, 0.2),
              rgba(255, 255, 255, 0.035) 55%,
              rgba(80, 0, 0, 0.18)
            );
          box-shadow:
            0 14px 38px rgba(0, 0, 0, 0.35),
            inset 0 1px 0
              rgba(255, 255, 255, 0.06);
          font-family: inherit;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.22em;
          transition:
            border-color 0.35s ease,
            background 0.35s ease,
            box-shadow 0.35s ease,
            transform 0.35s ease;
        }

        .signin-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -80%;
          width: 55%;
          height: 100%;
          z-index: -1;
          pointer-events: none;
          background:
            linear-gradient(
              105deg,
              transparent,
              rgba(255, 255, 255, 0.14),
              transparent
            );
          transform: skewX(-18deg);
          transition: left 0.8s
            cubic-bezier(0.2, 0.7, 0.2, 1);
        }

        .signin-button:hover {
          transform: translateY(-2px);
          border-color:
            rgba(255, 48, 48, 0.65);
          background:
            linear-gradient(
              135deg,
              rgba(160, 14, 28, 0.38),
              rgba(255, 255, 255, 0.05) 55%,
              rgba(95, 0, 0, 0.3)
            );
          box-shadow:
            0 18px 48px rgba(110, 0, 0, 0.35),
            0 0 28px rgba(255, 30, 30, 0.08),
            inset 0 1px 0
              rgba(255, 255, 255, 0.08);
        }

        .signin-button:hover::before {
          left: 135%;
        }

        .signin-corner {
          position: absolute;
          width: 12px;
          height: 12px;
          pointer-events: none;
          transition:
            width 0.35s ease,
            height 0.35s ease;
        }

        .corner-tl {
          top: 6px;
          left: 6px;
          border-top: 1px solid
            rgba(255, 40, 40, 0.75);
          border-left: 1px solid
            rgba(255, 40, 40, 0.75);
        }

        .corner-br {
          right: 6px;
          bottom: 6px;
          border-right: 1px solid
            rgba(255, 40, 40, 0.75);
          border-bottom: 1px solid
            rgba(255, 40, 40, 0.75);
        }

        .signin-button:hover .signin-corner {
          width: 18px;
          height: 18px;
        }

        .signin-text {
          position: relative;
          z-index: 1;
        }

        .signin-arrow {
          position: absolute;
          right: 20px;
          z-index: 1;
          color: #ff3030;
          font-size: 15px;
          transition: transform 0.35s ease;
        }

        .signin-button:hover .signin-arrow {
          transform: translate(3px, -3px);
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .signup-footer {
          position: relative;
          z-index: 3;
          min-height: 55px;
          padding: 0 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid
            rgba(255, 255, 255, 0.07);
          color: rgba(255, 255, 255, 0.22);
          font-size: 8px;
          letter-spacing: 0.15em;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {

          .signup-section {
            padding: 25px 15px 45px;
          }

          .signup-card {
            padding: 28px 20px;
          }

          h1 {
            font-size: 50px;
          }

          .signup-footer {
            padding: 0 18px;
            gap: 10px;
          }

          .signup-footer span:nth-child(2) {
            display: none;
          }

          /* BACKGROUND */

          .background-grid {
            background-size: 55px 55px;
          }

          .background-web {
            width: 350px;
            height: 350px;
          }

          .background-web-left {
            left: -250px;
            top: -100px;
          }

          .background-web-right {
            right: -250px;
            bottom: -100px;
          }

          .spider-1 {
            width: 72px;
            left: -5%;
            top: 10%;
          }

          .spider-2 {
            width: 58px;
            right: -3%;
            top: 17%;
          }

          .spider-3 {
            width: 45px;
            left: -2%;
            top: 48%;
          }

          .spider-4 {
            width: 62px;
            right: -4%;
            top: 55%;
          }

          .spider-5 {
            width: 48px;
            left: 38%;
            bottom: 3%;
          }
        }

        @media (max-width: 390px) {

          .spider-1 {
            left: -12%;
          }

          .spider-2 {
            right: -10%;
          }

          .spider-3 {
            left: -8%;
          }

          .spider-4 {
            right: -10%;
          }
        }

      `}</style>

    </main>
  );
}