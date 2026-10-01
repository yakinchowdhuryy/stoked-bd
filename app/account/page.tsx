"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
};

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

const PAGE_BACKGROUND =
  "radial-gradient(circle at 50% 0%, rgba(120,0,0,.17), transparent 35%), #080303";

export default function AccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

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
     LOAD ACCOUNT
  ========================================================= */

  useEffect(() => {
    const loadAccount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // User is NOT logged in
      if (!user) {
        setUser(null);
        setLoading(false);
        setOrdersLoading(false);
        return;
      }

      // User IS logged in
      setUser(user);
      setOrdersLoading(true);

      const { data: orderData, error } = await supabase
        .from("orders")
        .select(
          "id, customer_name, customer_phone, shipping_address, total_amount, payment_method, status, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (!error && orderData) {
        setOrders(orderData);
      } else if (error) {
        console.error("ACCOUNT ORDERS ERROR:", error);
      }

      setOrdersLoading(false);
      setLoading(false);
    };

    loadAccount();

    // Keep account page synced with login/logout changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setOrders([]);
      }

      if (
        event === "SIGNED_IN" &&
        session?.user
      ) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("LOGOUT ERROR:", error);
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  };

  // Loading screen
  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Space Grotesk", sans-serif',
          letterSpacing: ".15em",
          fontSize: "12px",
        }}
      >
        LOADING...
      </main>
    );
  }

  /* =========================================================
     SHARED PARTS — BACKGROUND, HEADER, MENU, STYLES
  ========================================================= */

  /* HEADER SIZES — same as product page */
  const navItemPadding = isMobile ? "0 6px" : "0 9px";
  const navFontSize = isMobile ? "7px" : "8px";
  const navLetterSpacing = isMobile ? ".07em" : ".11em";

  const backgroundLayer = (
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
  );

  const siteHeader = (
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
  );

  const overlays = (
    <>
      {/* ABOUT */}

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

      {/* CONTACT */}

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

      {/* SHOP-STYLE MENU */}

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
    </>
  );

  const sharedStyles = (
    <style jsx global>{`

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
         ACCOUNT CONTENT
      ===================================================== */

      .account-content {
        position: relative;
        z-index: 2;
        width: 100%;
        padding: 110px 24px 80px;
      }

      .account-content-center {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding-bottom: 60px;
      }

      @media (max-width: 768px) {
        .account-content {
          padding-top: 25px;
        }
      }

      /* =====================================================
         MOBILE BACKGROUND
      ===================================================== */

      @media (max-width: 600px) {

        .account-content {
          padding-left: 16px;
          padding-right: 16px;
        }

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
  );

  // =========================================================
  // LOGGED OUT ACCOUNT PAGE
  // =========================================================

  if (!user) {
    return (
      <main
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
          background: PAGE_BACKGROUND,
          color: "#fff",
          fontFamily: '"Space Grotesk", sans-serif',
          display: "flex",
          flexDirection: "column",
        }}
      >
        {backgroundLayer}

        {siteHeader}

        {overlays}

        <div className="account-content account-content-center">
          {/* CENTER CONTENT */}
          <section
            style={{
              flex: 1,
              width: "100%",
              maxWidth: "520px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            <p
              style={{
                margin: "0 0 14px",
                color: "#96111e",
                fontSize: "10px",
                letterSpacing: ".28em",
                fontWeight: 700,
              }}
            >
              STOKED BD
            </p>

            <h1
              style={{
                margin: "0 0 18px",
                fontSize: "clamp(42px, 9vw, 78px)",
                lineHeight: ".92",
                letterSpacing: "-.055em",
                fontWeight: 700,
              }}
            >
              MY ACCOUNT
            </h1>

            <p
              style={{
                margin: "0 auto 38px",
                maxWidth: "390px",
                color: "rgba(255,255,255,.45)",
                fontSize: "13px",
                lineHeight: 1.7,
              }}
            >
              LOGIN TO YOUR ACCOUNT OR CREATE A
              NEW ACCOUNT TO VIEW YOUR ORDERS.
            </p>

            {/* LOGIN */}
            <button
              type="button"
              onClick={() => router.push("/login")}
              style={{
                width: "100%",
                maxWidth: "390px",
                height: "54px",
                border: "1px solid #96111e",
                background: "#96111e",
                color: "#fff",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: ".2em",
                cursor: "pointer",
                transition: "all .2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "transparent";
                e.currentTarget.style.borderColor =
                  "rgba(255,255,255,.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "#96111e";
                e.currentTarget.style.borderColor =
                  "#96111e";
              }}
            >
              LOGIN
            </button>

            {/* SIGN UP */}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              style={{
                width: "100%",
                maxWidth: "390px",
                height: "54px",
                marginTop: "10px",
                border:
                  "1px solid rgba(255,255,255,.18)",
                background: "transparent",
                color: "#fff",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: ".2em",
                cursor: "pointer",
                transition: "all .2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(255,255,255,.5)";
                e.currentTarget.style.background =
                  "rgba(255,255,255,.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(255,255,255,.18)";
                e.currentTarget.style.background =
                  "transparent";
              }}
            >
              CREATE ACCOUNT
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              style={{
                marginTop: "30px",
                border: 0,
                background: "transparent",
                color: "rgba(255,255,255,.35)",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "10px",
                letterSpacing: ".16em",
                cursor: "pointer",
              }}
            >
              ← BACK TO HOME
            </button>
          </section>
        </div>

        {sharedStyles}
      </main>
    );
  }

  // =========================================================
  // LOGGED IN ACCOUNT PAGE
  // =========================================================

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "CUSTOMER";

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        background: PAGE_BACKGROUND,
        color: "#fff",
        fontFamily: '"Space Grotesk", sans-serif',
      }}
    >
      {backgroundLayer}

      {siteHeader}

      {overlays}

      <div className="account-content">
        <section
          style={{
            width: "100%",
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          {/* TITLE */}
          <div style={{ marginBottom: "45px" }}>
            <p
              style={{
                margin: "0 0 12px",
                color: "#96111e",
                fontSize: "11px",
                letterSpacing: ".25em",
                fontWeight: 700,
              }}
            >
              CUSTOMER AREA
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(38px, 7vw, 78px)",
                lineHeight: ".95",
                letterSpacing: "-.05em",
                fontWeight: 700,
              }}
            >
              MY ACCOUNT
            </h1>
          </div>

          {/* ACCOUNT INFO */}
          <div
            style={{
              border:
                "1px solid rgba(255,255,255,.09)",
              background:
                "rgba(255,255,255,.025)",
              padding: "28px",
              marginBottom: "55px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "30px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 8px",
                    color: "rgba(255,255,255,.4)",
                    fontSize: "10px",
                    letterSpacing: ".2em",
                  }}
                >
                  NAME
                </p>

                <h2
                  style={{
                    margin: "0 0 22px",
                    fontSize: "24px",
                    fontWeight: 600,
                  }}
                >
                  {displayName}
                </h2>

                <p
                  style={{
                    margin: "0 0 8px",
                    color: "rgba(255,255,255,.4)",
                    fontSize: "10px",
                    letterSpacing: ".2em",
                  }}
                >
                  EMAIL
                </p>

                <p
                  style={{
                    margin: 0,
                    color: "rgba(255,255,255,.75)",
                    fontSize: "14px",
                    wordBreak: "break-word",
                  }}
                >
                  {user.email}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  border:
                    "1px solid rgba(150,17,30,.8)",
                  background: "transparent",
                  color: "#fff",
                  padding: "13px 20px",
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize: "11px",
                  letterSpacing: ".16em",
                  cursor: loggingOut
                    ? "not-allowed"
                    : "pointer",
                  opacity: loggingOut ? 0.5 : 1,
                }}
              >
                {loggingOut
                  ? "LOGGING OUT..."
                  : "LOG OUT"}
              </button>
            </div>
          </div>

          {/* ORDERS */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                gap: "20px",
                marginBottom: "22px",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 8px",
                    color: "#96111e",
                    fontSize: "10px",
                    letterSpacing: ".2em",
                    fontWeight: 700,
                  }}
                >
                  HISTORY
                </p>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "28px",
                    fontWeight: 600,
                  }}
                >
                  MY ORDERS
                </h2>
              </div>

              <span
                style={{
                  color: "rgba(255,255,255,.4)",
                  fontSize: "11px",
                  letterSpacing: ".12em",
                }}
              >
                {orders.length} ORDER
                {orders.length !== 1 ? "S" : ""}
              </span>
            </div>

            {ordersLoading ? (
              <div
                style={{
                  padding: "35px 0",
                  color: "rgba(255,255,255,.45)",
                  fontSize: "12px",
                  letterSpacing: ".12em",
                }}
              >
                LOADING ORDERS...
              </div>
            ) : orders.length === 0 ? (
              <div
                style={{
                  border:
                    "1px solid rgba(255,255,255,.08)",
                  padding: "45px 25px",
                  textAlign: "center",
                  background:
                    "rgba(255,255,255,.02)",
                }}
              >
                <p
                  style={{
                    margin: "0 0 18px",
                    color: "rgba(255,255,255,.5)",
                    fontSize: "13px",
                  }}
                >
                  {"YOU HAVEN'T PLACED ANY ORDERS YET."}
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/shop")}
                  style={{
                    border:
                      "1px solid rgba(255,255,255,.2)",
                    background: "transparent",
                    color: "#fff",
                    padding: "13px 22px",
                    fontFamily:
                      '"Space Grotesk", sans-serif',
                    fontSize: "11px",
                    letterSpacing: ".15em",
                    cursor: "pointer",
                  }}
                >
                  START SHOPPING
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      border:
                        "1px solid rgba(255,255,255,.08)",
                      background:
                        "rgba(255,255,255,.025)",
                      padding: "22px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "20px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: "0 0 7px",
                            color:
                              "rgba(255,255,255,.38)",
                            fontSize: "9px",
                            letterSpacing: ".18em",
                          }}
                        >
                          ORDER ID
                        </p>

                        <p
                          style={{
                            margin: "0 0 15px",
                            fontSize: "12px",
                            wordBreak: "break-all",
                          }}
                        >
                          {order.id}
                        </p>

                        <p
                          style={{
                            margin: "0 0 7px",
                            color:
                              "rgba(255,255,255,.38)",
                            fontSize: "9px",
                            letterSpacing: ".18em",
                          }}
                        >
                          DATE
                        </p>

                        <p
                          style={{
                            margin: 0,
                            color:
                              "rgba(255,255,255,.7)",
                            fontSize: "12px",
                          }}
                        >
                          {new Date(
                            order.created_at
                          ).toLocaleDateString(
                            "en-BD",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>

                      <div
                        style={{
                          textAlign: "right",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 7px",
                            color:
                              "rgba(255,255,255,.38)",
                            fontSize: "9px",
                            letterSpacing: ".18em",
                          }}
                        >
                          TOTAL
                        </p>

                        <p
                          style={{
                            margin: "0 0 15px",
                            fontSize: "20px",
                            fontWeight: 600,
                          }}
                        >
                          ৳
                          {Number(
                            order.total_amount
                          ).toLocaleString()}
                        </p>

                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 10px",
                            border:
                              "1px solid rgba(150,17,30,.6)",
                            color: "#fff",
                            fontSize: "9px",
                            letterSpacing: ".14em",
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: "20px",
                        paddingTop: "18px",
                        borderTop:
                          "1px solid rgba(255,255,255,.06)",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 7px",
                          color:
                            "rgba(255,255,255,.38)",
                          fontSize: "9px",
                          letterSpacing: ".18em",
                        }}
                      >
                        DELIVERY ADDRESS
                      </p>

                      <p
                        style={{
                          margin: 0,
                          color:
                            "rgba(255,255,255,.65)",
                          fontSize: "12px",
                          lineHeight: 1.6,
                        }}
                      >
                        {order.shipping_address}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {sharedStyles}
    </main>
  );
}