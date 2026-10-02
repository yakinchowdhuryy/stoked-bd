"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const spiderImage =
  "https://www.pngall.com/wp-content/uploads/13/Spiderman-Logo-No-Background.png";

export default function Home() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // =========================================
  // PREVENT MOBILE SCROLL (LOCK VIEWPORT)
  // =========================================
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTouchAction = document.body.style.touchAction;

    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100%";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.overflow = originalOverflow;
      document.body.style.height = "";
      document.body.style.position = originalPosition;
      document.body.style.touchAction = originalTouchAction;
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  // =========================================
  // MENU
  // =========================================

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setAboutOpen(false);
    setContactOpen(false);
    setMenuOpen(true);
  };

  const closeMenu = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
  };

  // =========================================
  // SHOP / ACCOUNT
  // =========================================

  const goToShop = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(false);

    router.push("/shop");
  };

  const goToAccount = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(false);

    router.push("/account");
  };

  // =========================================
  // ABOUT
  // =========================================

  const openAbout = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setContactOpen(false);
    setAboutOpen(true);
  };

  const closeAbout = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setAboutOpen(false);
    setMenuOpen(false);
  };

  const backFromAbout = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setAboutOpen(false);
    setMenuOpen(false);
  };

  // =========================================
  // CONTACT
  // =========================================

  const openContact = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(true);
  };

  const closeContact = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setContactOpen(false);
    setMenuOpen(false);
  };

  const backFromContact = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setContactOpen(false);
    setMenuOpen(false);
  };

  // =========================================
  // SOCIAL LINKS
  // PC = NEW TAB
  // MOBILE = BROWSER / APP HANDLING
  // =========================================

  const isMobileDevice = () => {
    if (typeof window === "undefined") return false;

    return /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );
  };

  const openInstagram = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const instagramUrl =
      "https://www.instagram.com/stoked.bd/";

    if (isMobileDevice()) {
      window.location.href = instagramUrl;
      return;
    }

    window.open(
      instagramUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openFacebook = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const facebookUrl =
      "https://www.facebook.com/share/1ba7vRfxAB/?mibextid=wwXIfr";

    if (isMobileDevice()) {
      window.location.href = facebookUrl;
      return;
    }

    window.open(
      facebookUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openTikTok = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const tiktokUrl =
      "https://www.tiktok.com/@stoked.bd";

    if (isMobileDevice()) {
      window.location.href = tiktokUrl;
      return;
    }

    window.open(
      tiktokUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <main
      className="landing"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        maxHeight: "100dvh",
        minHeight: "100dvh",
        overflow: "hidden",
        overscrollBehavior: "none",
      }}
    >
      {/* Grain */}
      <div className="grain" />

      {/* Large Blurry Spider Web */}
      <div className="background-web">
        <span className="web-line web-line-1" />
        <span className="web-line web-line-2" />
        <span className="web-line web-line-3" />
        <span className="web-line web-line-4" />
        <span className="web-line web-line-5" />

        <span className="web-ring web-ring-1" />
        <span className="web-ring web-ring-2" />
        <span className="web-ring web-ring-3" />
        <span className="web-ring web-ring-4" />
        <span className="web-ring web-ring-5" />
      </div>

      {/* Floating Spider Logos */}
      <div className="spider-field">
        <div className="spider spider-1">
          <img
            src={spiderImage}
            alt=""
            draggable={false}
          />
        </div>

        <div className="spider spider-2">
          <img
            src={spiderImage}
            alt=""
            draggable={false}
          />
        </div>

        <div className="spider spider-3">
          <img
            src={spiderImage}
            alt=""
            draggable={false}
          />
        </div>

        <div className="spider spider-4">
          <img
            src={spiderImage}
            alt=""
            draggable={false}
          />
        </div>

        <div className="spider spider-5">
          <img
            src={spiderImage}
            alt=""
            draggable={false}
          />
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="mini-logo">
          STOKED
        </div>

        <button
          type="button"
          className="menu"
          onPointerUp={openMenu}
          aria-label="Open menu"
        >
          MENU
        </button>
      </header>

      {/* Center Hero */}
      <section
        className="hero"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          className="brand-mark"
          style={{
            textAlign: "center",
            margin: "0 auto",
            padding: 0,
          }}
        >
          STOKED
        </div>

        {/* মাথা নষ্ট জিন্স - পারফেক্ট সেন্ট্রাল অ্যালাইনমেন্ট */}
        <div
          className="campaign-title"
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: "clamp(18px, 3vw, 44px)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1,
            marginTop: "10px",
            marginBottom: 0,
            padding: 0,
            textAlign: "center",
            width: "100%",
            display: "block",
            textTransform: "uppercase",
            background:
              "linear-gradient(180deg, #FFFFFF 10%, #E6E6EB 50%, #8A8B99 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter:
              "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 22px rgba(180, 18, 40, 0.45))",
            userSelect: "none",
          }}
        >
          MATHANOSHTOJEANZ
        </div>

        {/* SHOP NOW */}
        <button
          type="button"
          className="shop-button"
          onClick={goToShop}
        >
          <span className="shop-text">
            SHOP NOW
          </span>

          {/* ইমোজি প্রতিরোধক শার্প ভেক্টর অ্যারো */}
          <span
            className="shop-arrow"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </span>
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <span>© 2026 STOKED BD</span>
        <span>EST. 2026</span>
      </footer>

      {/* =========================================
          PREMIUM ABOUT
      ========================================== */}

      {aboutOpen && (
        <div
          onClick={closeAbout}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background:
              "radial-gradient(circle at 50% 45%, rgba(110,8,20,.16), transparent 38%), rgba(3,2,2,.88)",
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
              width: "min(760px, 100%)",
              maxHeight: "88vh",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding:
                "clamp(28px, 5vw, 52px)",
              background:
                "linear-gradient(135deg, rgba(18,7,8,.98), rgba(5,3,3,.99))",
              border:
                "1px solid rgba(255,255,255,.11)",
              boxShadow:
                "0 40px 120px rgba(0,0,0,.78), inset 0 1px 0 rgba(255,255,255,.06)",
              color: "#fff",
            }}
          >
            {/* Decorative red glow */}
            <div
              style={{
                position: "absolute",
                width: "360px",
                height: "360px",
                borderRadius: "50%",
                right: "-170px",
                top: "-170px",
                background:
                  "radial-gradient(circle, rgba(150,10,28,.22), transparent 68%)",
                filter: "blur(12px)",
                pointerEvents: "none",
              }}
            />

            {/* Decorative web */}
            <div
              style={{
                position: "absolute",
                right: "-100px",
                bottom: "-140px",
                width: "400px",
                height: "400px",
                borderRadius: "50%",
                border:
                  "1px solid rgba(255,255,255,.035)",
                boxShadow:
                  "0 0 0 55px rgba(255,255,255,.012), 0 0 0 110px rgba(255,255,255,.008)",
                pointerEvents: "none",
              }}
            />

            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={backFromAbout}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                minWidth: "88px",
                height: "38px",
                padding: "0 15px",
                border:
                  "1px solid rgba(169,21,37,.70)",
                background:
                  "linear-gradient(135deg, rgba(169,21,37,.90), rgba(92,8,20,.92))",
                color: "#fff",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: ".20em",
                cursor: "pointer",
                zIndex: 5,
                boxShadow:
                  "0 8px 30px rgba(120,8,24,.28), inset 0 1px 0 rgba(255,255,255,.12)",
                transition:
                  "transform .25s ease, box-shadow .25s ease",
              }}
            >
              ← BACK
            </button>

            {/* Top label */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                paddingRight: "100px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "28px",
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize: "8px",
                  letterSpacing: ".34em",
                  color:
                    "rgba(255,255,255,.40)",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "1px",
                    background:
                      "rgba(169,21,37,.75)",
                  }}
                />
                ABOUT STOKED
              </div>

              {/* Main title */}
              <div
                style={{
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize:
                    "clamp(52px, 10vw, 112px)",
                  fontWeight: 700,
                  lineHeight: ".80",
                  letterSpacing: "-.075em",
                  color: "#fff",
                  textShadow:
                    "0 0 45px rgba(150,10,28,.10)",
                }}
              >
                STOKED
              </div>

              <div
                style={{
                  marginTop: "16px",
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize:
                    "clamp(8px, 1.1vw, 11px)",
                  letterSpacing: ".30em",
                  color:
                    "rgba(169,21,37,.9)",
                }}
              >
                BUILT DIFFERENT
              </div>
            </div>

            {/* Content */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                maxWidth: "560px",
                marginTop: "42px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize:
                    "clamp(14px, 1.7vw, 18px)",
                  lineHeight: 1.62,
                  letterSpacing: "-.01em",
                  color:
                    "rgba(255,255,255,.68)",
                }}
              >
                STOKED BD is a space built
                around individuality, attitude
                and pieces that refuse to blend
                in.
              </p>

              <p
                style={{
                  margin: "18px 0 0",
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize:
                    "clamp(11px, 1.25vw, 14px)",
                  lineHeight: 1.75,
                  color:
                    "rgba(255,255,255,.38)",
                }}
              >
                We create and curate pieces for
                people who want their style to
                feel personal — raw, expressive
                and unmistakably theirs.
              </p>
            </div>

            {/* Bottom */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-end",
                gap: "20px",
                marginTop: "48px",
                paddingTop: "18px",
                borderTop:
                  "1px solid rgba(255,255,255,.07)",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "8px",
                letterSpacing: ".2em",
                color:
                  "rgba(255,255,255,.28)",
              }}
            >
              <span>EST. 2026</span>
              <span>STOKED BD®</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          PREMIUM CONTACT
      ========================================== */}

      {contactOpen && (
        <div
          onClick={closeContact}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background:
              "radial-gradient(circle at 50% 50%, rgba(110,8,20,.15), transparent 42%), rgba(3,2,2,.88)",
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
              width: "min(520px, 100%)",
              position: "relative",
              padding:
                "clamp(35px, 7vw, 65px)",
              textAlign: "center",
              background:
                "linear-gradient(145deg, rgba(18,7,8,.97), rgba(5,3,3,.98))",
              border:
                "1px solid rgba(255,255,255,.10)",
              boxShadow:
                "0 40px 120px rgba(0,0,0,.75), inset 0 1px 0 rgba(255,255,255,.05)",
            }}
          >
            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={backFromContact}
              aria-label="Back from contact"
              style={{
                position: "absolute",
                top: "16px",
                right: "18px",
                minWidth: "86px",
                height: "36px",
                padding: "0 14px",
                border:
                  "1px solid rgba(169,21,37,.75)",
                background:
                  "linear-gradient(135deg, rgba(169,21,37,.95), rgba(82,7,18,.95))",
                color: "#fff",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "8px",
                fontWeight: 700,
                letterSpacing: ".18em",
                cursor: "pointer",
                zIndex: 10,
                boxShadow:
                  "0 8px 24px rgba(120,8,24,.30), inset 0 1px 0 rgba(255,255,255,.14)",
                transition:
                  "transform .2s ease, box-shadow .2s ease, background .2s ease",
              }}
            >
              ← BACK
            </button>

            <div
              style={{
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "9px",
                letterSpacing: ".35em",
                color:
                  "rgba(255,255,255,.38)",
                marginBottom: "18px",
                paddingRight: "72px",
              }}
            >
              CONTACT
            </div>

            <div
              style={{
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize:
                  "clamp(38px, 8vw, 64px)",
                fontWeight: 700,
                letterSpacing: "-.06em",
                lineHeight: 1,
                marginBottom: "16px",
              }}
            >
              LET'S CONNECT.
            </div>

            <p
              style={{
                margin: "0 auto 34px",
                maxWidth: "340px",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "13px",
                lineHeight: 1.7,
                color:
                  "rgba(255,255,255,.40)",
              }}
            >
              Follow STOKED BD on Instagram,
              Facebook and TikTok for new drops,
              updates and everything coming next.
            </p>

            {/* INSTAGRAM */}
            <button
              type="button"
              onClick={openInstagram}
              style={{
                width: "100%",
                minHeight: "58px",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                border:
                  "1px solid rgba(255,255,255,.10)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.018))",
                color: "#fff",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: ".18em",
                cursor: "pointer",
                transition: "all .25s ease",
              }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4.2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="17.5"
                  cy="6.7"
                  r="1"
                  fill="currentColor"
                />
              </svg>

              <span>
                INSTAGRAM&nbsp;&nbsp; @STOKED.BD ↗
              </span>
            </button>

            {/* FACEBOOK */}
            <button
              type="button"
              onClick={openFacebook}
              style={{
                width: "100%",
                minHeight: "58px",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                border:
                  "1px solid rgba(255,255,255,.10)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.018))",
                color: "#fff",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: ".18em",
                cursor: "pointer",
                transition: "all .25s ease",
              }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M14 8h3V4.5c-.5-.1-1.8-.2-3.4-.2-3.4 0-5.7 2.1-5.7 5.9V13H5v4h2.9v7h4.3v-7h3.6l.6-4h-4.2v-2.5c0-1.2.3-2 1.8-2Z" />
              </svg>

              <span>
                FACEBOOK&nbsp;&nbsp; STOKED BD ↗
              </span>
            </button>

            {/* TIKTOK */}
            <button
              type="button"
              onClick={openTikTok}
              style={{
                width: "100%",
                minHeight: "58px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                border:
                  "1px solid rgba(255,255,255,.10)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.018))",
                color: "#fff",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: ".18em",
                cursor: "pointer",
                transition: "all .25s ease",
              }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M15.2 3c.3 1.9 1.4 3.5 3.1 4.4.8.4 1.7.7 2.7.7v3.7c-1.2 0-2.4-.3-3.5-.8v5.8c0 3.5-2.8 6.2-6.3 6.2-3.4 0-6.2-2.7-6.2-6.1 0-3.4 2.8-6.1 6.2-6.1.4 0 .9 0 1.3.1v3.8c-.4-.1-.8-.2-1.3-.2-1.4 0-2.5 1.1-2.5 2.4 0 1.4 1.1 2.5 2.5 2.5s2.6-1.1 2.6-2.5V3h1.4Z" />
              </svg>

              <span>
                TIKTOK&nbsp;&nbsp; @STOKED.BD ↗
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================
          SIDE MENU
      ========================================== */}

      <div
        className={`stoked-menu ${
          menuOpen
            ? "stoked-menu-visible"
            : ""
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          className="stoked-menu-backdrop"
          onClick={closeMenu}
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
        />

        {/* Panel */}
        <aside
          className="stoked-menu-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top */}
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

          {/* Navigation */}
          <nav className="stoked-menu-links">
            {/* HOME */}
            <button
              type="button"
              onClick={(e) => closeMenu(e)}
            >
              HOME
            </button>

            {/* SHOP */}
            <button
              type="button"
              onClick={goToShop}
            >
              SHOP
            </button>

            {/* MY ACCOUNT */}
            <button
              type="button"
              onClick={goToAccount}
            >
              MY ACCOUNT
            </button>

            {/* ABOUT */}
            <button
              type="button"
              onClick={openAbout}
            >
              ABOUT
            </button>

            {/* CONTACT */}
            <button
              type="button"
              onClick={openContact}
            >
              CONTACT
            </button>
          </nav>

          {/* Footer */}
          <div className="stoked-menu-footer">
            <span>© 2026 STOKED BD</span>
            <span>EST. 2026</span>
          </div>
        </aside>
      </div>
    </main>
  );
}