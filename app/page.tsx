"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const spiderImage =
  "https://www.pngall.com/wp-content/uploads/13/Spiderman-Logo-No-Background.png";

export default function Home() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(true);
  };

  const closeMenu = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setMenuOpen(false);
  };

  const goToShop = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setMenuOpen(false);
    router.push("/shop");
  };

  const goToAccount = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setMenuOpen(false);
    router.push("/account");
  };

  const openAbout = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);

    setTimeout(() => {
      setAboutOpen(true);
    }, 160);
  };

  const closeAbout = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setAboutOpen(false);
  };

  const openContact = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);

    setTimeout(() => {
      setContactOpen(true);
    }, 160);
  };

  const closeContact = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setContactOpen(false);
  };

  const openInstagram = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const instagramUrl = "https://www.instagram.com/stoked.bd/";

    if (
      typeof window !== "undefined" &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ) {
      window.location.href = instagramUrl;
      return;
    }

    window.open(instagramUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="landing">
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
          <img src={spiderImage} alt="" draggable={false} />
        </div>

        <div className="spider spider-2">
          <img src={spiderImage} alt="" draggable={false} />
        </div>

        <div className="spider spider-3">
          <img src={spiderImage} alt="" draggable={false} />
        </div>

        <div className="spider spider-4">
          <img src={spiderImage} alt="" draggable={false} />
        </div>

        <div className="spider spider-5">
          <img src={spiderImage} alt="" draggable={false} />
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="mini-logo">STOKED</div>

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
      <section className="hero">
        <div className="brand-mark">STOKED</div>

        <div className="campaign-title">
          MATHANOSHTOJEANZ
        </div>

        {/* SHOP NOW */}
        <button
          type="button"
          className="shop-button"
          onClick={goToShop}
        >
          <span className="blood blood-one" />
          <span className="blood blood-two" />
          <span className="blood blood-three" />

          <span className="shop-text">
            SHOP NOW
          </span>

          <span className="shop-arrow">
            ↗
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
              width: "min(900px, 100%)",
              minHeight: "min(620px, 86vh)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "clamp(28px, 6vw, 70px)",
              background:
                "linear-gradient(135deg, rgba(18,7,8,.97), rgba(5,3,3,.98))",
              border: "1px solid rgba(255,255,255,.11)",
              boxShadow:
                "0 40px 120px rgba(0,0,0,.75), inset 0 1px 0 rgba(255,255,255,.06)",
              color: "#fff",
            }}
          >
            {/* Decorative red glow */}
            <div
              style={{
                position: "absolute",
                width: "420px",
                height: "420px",
                borderRadius: "50%",
                right: "-180px",
                top: "-180px",
                background:
                  "radial-gradient(circle, rgba(150,10,28,.20), transparent 68%)",
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
                width: "430px",
                height: "430px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,.035)",
                boxShadow:
                  "0 0 0 55px rgba(255,255,255,.012), 0 0 0 110px rgba(255,255,255,.008)",
                pointerEvents: "none",
              }}
            />

            {/* Close */}
            <button
              type="button"
              onClick={closeAbout}
              style={{
                position: "absolute",
                top: "22px",
                right: "24px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,.10)",
                background: "rgba(255,255,255,.025)",
                color: "rgba(255,255,255,.72)",
                fontSize: "21px",
                cursor: "pointer",
                zIndex: 5,
              }}
            >
              ×
            </button>

            {/* Top label */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "38px",
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: "9px",
                  letterSpacing: ".34em",
                  color: "rgba(255,255,255,.40)",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "1px",
                    background: "rgba(169,21,37,.75)",
                  }}
                />
                ABOUT STOKED
              </div>

              {/* Main title */}
              <div
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: "clamp(58px, 12vw, 150px)",
                  fontWeight: 700,
                  lineHeight: ".78",
                  letterSpacing: "-.075em",
                  color: "#fff",
                  textShadow: "0 0 45px rgba(150,10,28,.10)",
                }}
              >
                STOKED
              </div>

              <div
                style={{
                  marginTop: "20px",
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: "clamp(9px, 1.2vw, 12px)",
                  letterSpacing: ".30em",
                  color: "rgba(169,21,37,.9)",
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
                maxWidth: "620px",
                marginTop: "60px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: "clamp(15px, 2vw, 20px)",
                  lineHeight: 1.65,
                  letterSpacing: "-.01em",
                  color: "rgba(255,255,255,.68)",
                }}
              >
                STOKED BD is a space built around individuality,
                attitude and pieces that refuse to blend in.
              </p>

              <p
                style={{
                  margin: "22px 0 0",
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: "clamp(12px, 1.4vw, 15px)",
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,.38)",
                }}
              >
                We create and curate pieces for people who want
                their style to feel personal — raw, expressive and
                unmistakably theirs.
              </p>
            </div>

            {/* Bottom */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "20px",
                marginTop: "70px",
                paddingTop: "22px",
                borderTop: "1px solid rgba(255,255,255,.07)",
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: "8px",
                letterSpacing: ".2em",
                color: "rgba(255,255,255,.28)",
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
              padding: "clamp(35px, 7vw, 65px)",
              textAlign: "center",
              background:
                "linear-gradient(145deg, rgba(18,7,8,.97), rgba(5,3,3,.98))",
              border: "1px solid rgba(255,255,255,.10)",
              boxShadow:
                "0 40px 120px rgba(0,0,0,.75), inset 0 1px 0 rgba(255,255,255,.05)",
            }}
          >
            <button
              type="button"
              onClick={closeContact}
              style={{
                position: "absolute",
                top: "18px",
                right: "20px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,.08)",
                background: "rgba(255,255,255,.025)",
                color: "rgba(255,255,255,.65)",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <div
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: "9px",
                letterSpacing: ".35em",
                color: "rgba(255,255,255,.38)",
                marginBottom: "18px",
              }}
            >
              CONTACT
            </div>

            <div
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: "clamp(38px, 8vw, 64px)",
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
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: "13px",
                lineHeight: 1.7,
                color: "rgba(255,255,255,.40)",
              }}
            >
              Follow STOKED BD on Instagram for new drops,
              updates and everything coming next.
            </p>

            <button
              type="button"
              onClick={openInstagram}
              style={{
                width: "100%",
                minHeight: "58px",
                border: "1px solid rgba(169,21,37,.35)",
                background:
                  "linear-gradient(180deg, rgba(169,21,37,.14), rgba(169,21,37,.04))",
                color: "#fff",
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: ".18em",
                cursor: "pointer",
                transition: "all .25s ease",
              }}
            >
              INSTAGRAM&nbsp;&nbsp; @STOKED.BD ↗
            </button>
          </div>
        </div>
      )}

      {/* =========================================
          SIDE MENU
      ========================================== */}

      <div
        className={`stoked-menu ${
          menuOpen ? "stoked-menu-visible" : ""
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