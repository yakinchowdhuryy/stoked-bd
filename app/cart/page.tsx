"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  quantity: number;
};

const CART_KEY = "stoked-cart";

/* "productId|size" key, protiti product + size alada stock */
function itemKey(item: { id: string; size?: string }) {
  return `${item.id}|${item.size || ""}`;
}

const SPIDER_IMAGE =
  "https://www.pngall.com/wp-content/uploads/13/Spiderman-Logo-No-Background.png";

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // STOCKED OUT item er key gulo ("productId|size")
  const [soldOutIds, setSoldOutIds] = useState<string[]>([]);

  // "productId|size" => koyta stock ase
  const [stockMap, setStockMap] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);

      if (savedCart) {
        const parsed = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (error) {
      console.error("CART LOAD ERROR:", error);
      setCart([]);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
  }, [cart, loaded]);

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

  /* =====================================================
     STOCK CHECK: bag e thaka product + size ekhono available kina
  ===================================================== */

  const cartSigKey = cart.map((item) => itemKey(item)).join(",");

  useEffect(() => {
    if (!loaded) return;

    if (!cartSigKey) {
      setSoldOutIds([]);
      setStockMap({});
      return;
    }

    let active = true;

    async function checkStock() {
      const ids = Array.from(
        new Set(cartSigKey.split(",").map((key) => key.split("|")[0]))
      );

      const { data: productRows, error: productError } = await supabase
        .from("products")
        .select("id, status")
        .in("id", ids);

      const { data: sizeRows, error: sizeError } = await supabase
        .from("product_sizes")
        .select("product_id, size, stock")
        .in("product_id", ids);

      if (!active || productError || sizeError) return;

      const map: Record<string, number> = {};

      (sizeRows || []).forEach((row: any) => {
        map[`${row.product_id}|${row.size}`] = Number(row.stock);
      });

      const soldOut: string[] = [];

      cart.forEach((item) => {
        const key = itemKey(item);
        const product = (productRows || []).find(
          (p: any) => p.id === item.id
        );

        const unavailable = !product || product.status !== "AVAILABLE";
        const sizeStock = map[key];

        const sizeOut =
          Boolean(item.size) && (sizeStock === undefined || sizeStock <= 0);

        if (unavailable || sizeOut) soldOut.push(key);
      });

      setStockMap(map);
      setSoldOutIds(soldOut);

      // bag e stock er cheye beshi quantity thakle komiye dao
      setCart((prev) =>
        prev.map((item) => {
          const stock = map[itemKey(item)];

          if (stock !== undefined && stock > 0 && item.quantity > stock) {
            return { ...item, quantity: stock };
          }

          return item;
        })
      );
    }

    checkStock();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, cartSigKey]);

  const hasSoldOut = cart.some((item) => soldOutIds.includes(itemKey(item)));

  function openMenu(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setAboutOpen(false);
    setContactOpen(false);
    setMenuOpen(true);
  }

  function closeMenu(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
  }

  function goHome(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(false);

    router.push("/");
  }

  function goToShop(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(false);

    router.push("/shop");
  }

  function goToAccount(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(false);

    router.push("/account");
  }

  function openAbout(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setContactOpen(false);
    setAboutOpen(true);
  }

  function closeAbout(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setAboutOpen(false);
    setMenuOpen(false);
  }

  function openContact(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(true);
  }

  function closeContact(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setContactOpen(false);
    setMenuOpen(false);
  }

  function isMobileDevice() {
    if (typeof window === "undefined") return false;

    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function openSocial(url: string, e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    if (isMobileDevice()) {
      window.location.href = url;
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  /* quantity stock er upore jabe na */
  function updateQuantity(index: number, change: number) {
    setCart((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const stock = stockMap[itemKey(item)];
        const max = stock !== undefined && stock > 0 ? stock : Infinity;

        return {
          ...item,
          quantity: Math.min(max, Math.max(1, item.quantity + change)),
        };
      })
    );
  }

  function removeItem(index: number) {
    setCart((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function clearCart() {
    setCart([]);
  }

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const totalItems = cart.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  if (!loaded) {
    return (
      <main className="loading-page">
        <div className="loading-box">
          <span className="loading-dot" />
          <span>LOADING BAG</span>
        </div>

        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            width: 100%;
            background: #070202;
            color: #f5f5f3;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Inter, Arial, sans-serif;
          }

          .loading-box {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 11.7px;
            letter-spacing: 0.24em;
          }

          .loading-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #ff2020;
            box-shadow: 0 0 18px rgba(255, 32, 32, 0.9);
            animation: loadingPulse 1s ease-in-out infinite;
          }

          @keyframes loadingPulse {
            0%,
            100% {
              opacity: 0.4;
              transform: scale(0.8);
            }

            50% {
              opacity: 1;
              transform: scale(1.25);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="cart-page">
      {/* =====================================================
          BACKGROUND — SAME AS SHOP PAGE
      ===================================================== */}

      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(circle at 48% 42%, rgba(110,0,0,.30) 0%, rgba(30,0,0,.20) 38%, rgba(8,3,3,0) 78%), #080303",
        }}
      >
        <div className="grain" />

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

        <div className="spider-field">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={`spider spider-${n}`}>
              <img src={SPIDER_IMAGE} alt="" draggable={false} />
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          HEADER — SAME AS SHOP PAGE
      ===================================================== */}

      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: isMobile ? "16px 6vw" : "22px 6vw",
          minHeight: isMobile ? "64px" : "70px",
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
            padding: "3px",
            border: "1px solid rgba(255,255,255,.11)",
            borderRadius: "14px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,.065), rgba(255,255,255,.018))",
            boxShadow:
              "0 12px 35px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            pointerEvents: "auto",
          }}
        >
          <Link
            href="/account"
            style={{
              minHeight: "40px",
              padding: "0 9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,.72)",
              textDecoration: "none",
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: "8px",
              fontWeight: 600,
              letterSpacing: ".11em",
              borderRadius: "9px",
              background: "rgba(255,255,255,.045)",
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
              background: "rgba(255,255,255,.07)",
            }}
          />

          <Link
            href="/cart"
            style={{
              minHeight: "40px",
              padding: "0 9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              border: 0,
              borderRadius: "9px",
              background: "transparent",
              color: "rgba(255,255,255,.65)",
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: "8px",
              fontWeight: 500,
              letterSpacing: ".13em",
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
                background: "rgba(169,21,37,.8)",
              }}
            >
              {String(totalItems).padStart(2, "0")}
            </span>
          </Link>

          <span
            style={{
              width: "1px",
              height: "18px",
              background: "rgba(255,255,255,.07)",
            }}
          />

          <button
            type="button"
            onPointerUp={openMenu}
            aria-label="Open menu"
            style={{
              minHeight: "40px",
              padding: "0 9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,.72)",
              background: "rgba(255,255,255,.045)",
              border: 0,
              borderRadius: "9px",
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: "8px",
              fontWeight: 600,
              letterSpacing: ".13em",
              cursor: "pointer",
              whiteSpace: "nowrap",
              touchAction: "manipulation",
            }}
          >
            MENU
          </button>
        </div>
      </header>

      <section className="cart-container">
        <div className="cart-hero">
          <div className="hero-left">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              <span>STOKED BD / BAG</span>
            </div>

            <div className="title-wrap">
              <h1 className="cart-title">YOUR BAG</h1>
            </div>

            <div className="title-line" />
          </div>

          <div className="hero-right">
            <span className="bag-item-count">
              {totalItems} {totalItems === 1 ? "ITEM" : "ITEMS"}
            </span>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="clear-button"
              >
                <span className="clear-icon">×</span>
                <span className="clear-text">CLEAR BAG</span>
                <span className="clear-arrow">↗</span>
                <span className="clear-shine" />
              </button>
            )}
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-web empty-web-one" />
            <div className="empty-web empty-web-two" />

            <div className="empty-orbit orbit-one" />
            <div className="empty-orbit orbit-two" />

            <div className="empty-content">
              <span className="empty-kicker">
                00 / BAG STATUS
              </span>

              <h2>
                YOUR BAG
                <br />
                <span>IS EMPTY</span>
              </h2>

              <p>
                Your bag is currently empty.
                <br />
                Explore the collection and find something worth wearing.
              </p>

              <div className="explore-box">
                <Link href="/shop" className="explore-button">
                  <span className="explore-web explore-web-left" />
                  <span className="explore-web explore-web-right" />

                  <span className="explore-blood blood-one" />
                  <span className="explore-blood blood-two" />
                  <span className="explore-blood blood-three" />

                  <span className="explore-text-box">
                    <span className="explore-text">
                      EXPLORE COLLECTION
                    </span>
                  </span>

                  <span className="explore-shine" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="items-section">
              <div className="table-head">
                <span>PRODUCT</span>
                <span>PRICE</span>
                <span>QTY</span>
                <span />
              </div>

              <div className="cart-list">
                {cart.map((item, index) => (
                  <article
                    key={`${item.id}-${index}`}
                    className="cart-row"
                  >
                    <div className="product-cell">
                      <div className="product-image-wrap">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="product-image"
                          style={
                            soldOutIds.includes(itemKey(item))
                              ? { filter: "grayscale(100%)", opacity: 0.45 }
                              : undefined
                          }
                        />

                        <span className="image-corner corner-top-left" />
                        <span className="image-corner corner-bottom-right" />
                      </div>

                      <div className="product-info">
                        <span className="product-category">
                          STOKED / ITEM
                        </span>

                        <h3 className="product-name">
                          {item.name}
                        </h3>

                        {soldOutIds.includes(itemKey(item)) && (
                          <span
                            style={{
                              marginTop: "7px",
                              padding: "4px 8px",
                              border: "1px solid rgba(169,21,37,.9)",
                              background: "rgba(169,21,37,.15)",
                              color: "#ff4a4a",
                              fontSize: "9.1px",
                              fontWeight: 600,
                              letterSpacing: ".15em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            STOCKED OUT
                          </span>
                        )}

                        {item.size && (
                          <span className="product-size">
                            SIZE / {item.size}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="remove-button"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>

                    <div className="price-cell">
                      ৳{Number(item.price).toLocaleString()}
                    </div>

                    <div className="qty-control">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(index, -1)
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(index, 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <div className="row-index">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="summary-card">
              <div className="summary-top-line" />

              <div className="summary-heading">
                <span>ORDER SUMMARY</span>
                <span className="summary-status">
                  {hasSoldOut ? "ACTION NEEDED" : "READY"}
                </span>
              </div>

              <div className="summary-content">
                <div className="summary-row">
                  <span>ITEMS</span>
                  <span>{totalItems}</span>
                </div>

                <div className="summary-row">
                  <span>SUBTOTAL</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>

                <div className="summary-divider" />

                <div className="summary-total">
                  <span>TOTAL</span>
                  <strong>
                    ৳{subtotal.toLocaleString()}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!hasSoldOut) router.push("/checkout");
                  }}
                  disabled={hasSoldOut}
                  className="checkout-button"
                >
                  <span>
                    {hasSoldOut
                      ? "REMOVE STOCKED OUT ITEMS"
                      : "PROCEED TO CHECKOUT"}
                  </span>
                  <span className="checkout-arrow">→</span>
                </button>

                <div className="trust-grid">
                  <div className="trust-item">
                    <span>01</span>
                    <p>
                      SECURE
                      <br />
                      CHECKOUT
                    </p>
                  </div>

                  <div className="trust-item">
                    <span>02</span>
                    <p>
                      EASY
                      <br />
                      ORDERING
                    </p>
                  </div>

                  <div className="trust-item">
                    <span>03</span>
                    <p>
                      STOKED
                      <br />
                      QUALITY
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      <footer className="cart-footer">
        <div>STOKED BD</div>
        <div>© {new Date().getFullYear()} STOKED</div>
        <div>BUILT FOR THE STREETS</div>
      </footer>

      {/* =====================================================
          ABOUT OVERLAY
      ===================================================== */}

      {aboutOpen && (
        <div className="info-overlay" onClick={closeAbout}>
          <div
            className="info-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="overlay-close"
              onClick={closeAbout}
            >
              CLOSE <span>×</span>
            </button>

            <span className="overlay-kicker">
              STOKED BD / 2026
            </span>

            <h2>
              ABOUT
              <br />
              <span>STOKED</span>
            </h2>

            <div className="overlay-line" />

            <p>
              STOKED BD is a Bangladesh-based streetwear label built
              around attitude, movement and a raw visual identity.
              Every piece is designed to feel like part of the
              culture — not just another product.
            </p>

            <span className="overlay-footer">
              EST. 2026 / SPIDER COLLECTION
            </span>
          </div>
        </div>
      )}

      {/* =====================================================
          CONTACT OVERLAY
      ===================================================== */}

      {contactOpen && (
        <div className="info-overlay" onClick={closeContact}>
          <div
            className="info-panel contact-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="overlay-close"
              onClick={closeContact}
            >
              CLOSE <span>×</span>
            </button>

            <span className="overlay-kicker">
              STOKED BD / CONNECT
            </span>

            <h2>CONTACT</h2>

            <div className="overlay-line" />

            <div className="social-list">
              <button
                type="button"
                onClick={(e) =>
                  openSocial(
                    "https://www.instagram.com/stoked.bd/",
                    e
                  )
                }
              >
                INSTAGRAM
              </button>

              <button
                type="button"
                onClick={(e) =>
                  openSocial(
                    "https://www.facebook.com/share/1ba7vRfxAB/?mibextid=wwXIfr",
                    e
                  )
                }
              >
                FACEBOOK
              </button>

              <button
                type="button"
                onClick={(e) =>
                  openSocial(
                    "https://www.tiktok.com/@stoked.bd",
                    e
                  )
                }
              >
                TIKTOK
              </button>
            </div>

            <span className="overlay-footer">
              STOKED BD / SOCIAL
            </span>
          </div>
        </div>
      )}

      {/* =====================================================
          SIDE MENU
      ===================================================== */}

      <div
        className={`stoked-menu ${
          menuOpen ? "stoked-menu-visible" : ""
        }`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="stoked-menu-backdrop"
          onClick={closeMenu}
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
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
            <button type="button" onClick={goHome}>
              HOME
            </button>

            <button type="button" onClick={goToShop}>
              SHOP
            </button>

            <button type="button" onClick={goToAccount}>
              MY ACCOUNT
            </button>

            <button type="button" onClick={openAbout}>
              ABOUT
            </button>

            <button type="button" onClick={openContact}>
              CONTACT
            </button>
          </nav>

          <div className="stoked-menu-footer">
            <span>© 2026 STOKED BD</span>
            <span>EST. 2026</span>
          </div>
        </aside>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .cart-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(120, 0, 0, 0.17),
              transparent 35%
            ),
            #080303;
          color: #f5f5f3;
          font-family: Inter, Arial, Helvetica, sans-serif;
          scrollbar-width: thin;
          scrollbar-color:
            rgba(255, 35, 35, 0.5)
            transparent;
        }

        /* =====================================================
           BACKGROUND — GRAIN + WEB + ANIMATED SPIDERS
        ===================================================== */

        .grain {
          position: absolute;
          inset: 0;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
        }

        .background-web {
          position: absolute;
          width: 620px;
          height: 620px;
          right: -260px;
          top: -150px;
          border-radius: 50%;
          opacity: 0.14;
        }

        .web-line {
          position: absolute;
          width: 1px;
          height: 100%;
          left: 50%;
          top: 0;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,.4), transparent);
          transform-origin: center;
        }

        .web-line-1 { transform: rotate(0deg); }
        .web-line-2 { transform: rotate(36deg); }
        .web-line-3 { transform: rotate(72deg); }
        .web-line-4 { transform: rotate(108deg); }
        .web-line-5 { transform: rotate(144deg); }

        .web-ring {
          position: absolute;
          border: 1px solid rgba(255,255,255,.35);
          border-radius: 50%;
        }

        .web-ring-1 { inset: 5%; }
        .web-ring-2 { inset: 18%; }
        .web-ring-3 { inset: 31%; }
        .web-ring-4 { inset: 43%; }
        .web-ring-5 { inset: 55%; }

        .spider-field {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .spider {
          position: absolute;
          opacity: 0.075;
          filter: grayscale(1) drop-shadow(0 0 22px rgba(255, 0, 0, 0.2));
          animation: spiderFloat 8s ease-in-out infinite;
          will-change: transform;
        }

        .spider img {
          display: block;
          width: 100%;
          height: auto;
          object-fit: contain;
          user-select: none;
        }

        .spider-1 { width: 125px; left: 3%; top: 9%; }
        .spider-2 { width: 90px; right: 6%; top: 17%; opacity: 0.06; animation-delay: -2s; }
        .spider-3 { width: 65px; left: 7%; top: 58%; opacity: 0.045; animation-delay: -4s; }
        .spider-4 { width: 105px; right: 3%; top: 54%; opacity: 0.065; animation-delay: -1s; }
        .spider-5 { width: 75px; left: 43%; bottom: 4%; opacity: 0.045; animation-delay: -5s; }

        @keyframes spiderFloat {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-2deg); }
          25% { transform: translate3d(8px, 18px, 0) rotate(3deg); }
          50% { transform: translate3d(-8px, -5px, 0) rotate(-4deg); }
          75% { transform: translate3d(5px, 13px, 0) rotate(2deg); }
        }

        @media (max-width: 600px) {
          .background-web { width: 380px; height: 380px; right: -200px; top: -90px; }
          .spider-1 { width: 72px; left: -5%; top: 10%; }
          .spider-2 { width: 58px; right: -3%; top: 17%; }
          .spider-3 { width: 45px; left: -2%; top: 48%; }
          .spider-4 { width: 62px; right: -4%; top: 55%; }
          .spider-5 { width: 48px; left: 38%; bottom: 3%; }
        }

        .cart-container {
          position: relative;
          z-index: 5;
          width: min(1380px, calc(100% - 44px));
          margin: 0 auto;
          padding: clamp(100px, 11vw, 140px) 0 100px;
        }

        .cart-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 22px;
          padding-bottom: 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.09);
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 18px;
          color: rgba(245, 245, 243, 0.4);
          font-size: 10.4px;
          letter-spacing: 0.24em;
        }

        .eyebrow-line {
          width: 28px;
          height: 1px;
          background: #ff2020;
          box-shadow: 0 0 9px rgba(255, 30, 30, 0.7);
        }

        .title-wrap {
          position: relative;
          display: inline-block;
        }

        .cart-title {
          margin: 0;
          font-family: "Space Grotesk", Inter, sans-serif;
          font-size: clamp(46px, 5.8vw, 76px);
          line-height: 0.94;
          font-weight: 500;
          letter-spacing: -0.05em;
          color: #f5f5f3;
          animation:
            titleReveal
            0.9s
            cubic-bezier(.2,.7,.2,1)
            both;
        }

        .title-line {
          width: 45px;
          height: 1px;
          margin-top: 17px;
          background:
            linear-gradient(
              90deg,
              #ff2020,
              transparent
            );
          box-shadow:
            0 0 10px
            rgba(255, 20, 20, 0.7);
        }

        @keyframes titleReveal {
          from {
            opacity: 0;
            transform: translateY(14px);
            filter: blur(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .hero-right {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-shrink: 0;
        }

        .bag-item-count {
          color: rgba(245, 245, 243, 0.4);
          font-size: 10.4px;
          letter-spacing: 0.2em;
        }

        .clear-button {
          position: relative;
          display: flex;
          align-items: center;
          gap: 9px;
          height: 40px;
          padding: 0 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.09);
          background:
            linear-gradient(
              120deg,
              rgba(255,255,255,.025),
              rgba(120,0,0,.07)
            );
          color: rgba(245,245,243,.58);
          font-family: inherit;
          font-size: 9.1px;
          letter-spacing: .16em;
          cursor: pointer;
        }

        .clear-button::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 2px;
          height: 100%;
          background:
            linear-gradient(
              to bottom,
              transparent,
              #ff2020,
              transparent
            );
        }

        .clear-icon,
        .clear-text,
        .clear-arrow {
          position: relative;
          z-index: 2;
        }

        .clear-icon,
        .clear-arrow {
          color: rgba(255,70,70,.7);
        }

        .clear-icon {
          font-size: 14px;
        }

        .clear-arrow {
          font-size: 13px;
        }

        .cart-layout {
          display: grid;
          grid-template-columns:
            minmax(0,1fr)
            minmax(320px,380px);
          gap: clamp(28px,4.5vw,68px);
          align-items: start;
          margin-top: 32px;
        }

        .table-head,
        .cart-row {
          display: grid;
          grid-template-columns:
            minmax(0,1fr)
            100px
            105px
            28px;
          gap: 20px;
        }

        .table-head {
          padding: 0 14px 14px;
          color: rgba(245,245,243,.28);
          font-size: 9.1px;
          letter-spacing: .2em;
          border-bottom:
            1px solid
            rgba(255,255,255,.06);
        }

        .table-head span:nth-child(2),
        .table-head span:nth-child(3) {
          text-align: center;
        }

        .cart-row {
          align-items: center;
          min-height: 145px;
          padding: 20px 14px;
          border-bottom:
            1px solid
            rgba(255,255,255,.065);
        }

        .cart-row:hover {
          background:
            linear-gradient(
              90deg,
              rgba(120,0,0,.07),
              transparent
            );
        }

        .product-cell {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .product-image-wrap {
          position: relative;
          flex: 0 0 100px;
          width: 100px;
          height: 112px;
          overflow: hidden;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.05),
              rgba(255,0,0,.025)
            );
          border:
            1px solid
            rgba(255,255,255,.09);
        }

        .product-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .image-corner {
          position: absolute;
          width: 8px;
          height: 8px;
          z-index: 2;
        }

        .corner-top-left {
          top: -1px;
          left: -1px;
          border-top: 1px solid #ff3030;
          border-left: 1px solid #ff3030;
        }

        .corner-bottom-right {
          right: -1px;
          bottom: -1px;
          border-right: 1px solid #ff3030;
          border-bottom: 1px solid #ff3030;
        }

        .product-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .product-category {
          margin-bottom: 7px;
          color: rgba(245,245,243,.27);
          font-size: 9.1px;
          letter-spacing: .17em;
        }

        .product-name {
          max-width: 100%;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #f5f5f3;
          font-family:
            "Space Grotesk",
            Inter,
            sans-serif;
          font-size: 17px;
          font-weight: 500;
        }

        .product-size {
          margin-top: 7px;
          color: rgba(245,245,245,.4);
          font-size: 9.1px;
          letter-spacing: .15em;
          white-space: nowrap;
        }

        .remove-button {
          margin-top: 14px;
          min-height: 34px;
          padding: 0 13px;
          border:
            1px solid
            rgba(255,255,255,.10);
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.035),
              rgba(120,0,0,.08)
            );
          color: rgba(245,245,243,.48);
          font-family:
            "Space Grotesk",
            Inter,
            sans-serif;
          font-size: 9.1px;
          font-weight: 600;
          letter-spacing: .15em;
          cursor: pointer;
          box-shadow:
            inset 0 1px 0
            rgba(255,255,255,.04);
          transition:
            color .25s ease,
            border-color .25s ease,
            background .25s ease,
            transform .25s ease;
        }

        .remove-button::before {
          content: "×";
          margin-right: 7px;
          color: rgba(255,48,48,.7);
          font-size: 14px;
          vertical-align: -1px;
        }

        .remove-button:hover {
          color: #fff;
          border-color: rgba(255,48,48,.42);
          background:
            linear-gradient(
              135deg,
              rgba(255,48,48,.10),
              rgba(120,0,0,.16)
            );
          transform: translateY(-1px);
        }

        .price-cell {
          color: rgba(245,245,243,.75);
          text-align: center;
          font-size: 13px;
        }

        .qty-control {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 38px;
          border:
            1px solid
            rgba(255,255,255,.08);
          background: rgba(255,255,255,.018);
        }

        .qty-control button {
          width: 34px;
          height: 100%;
          border: 0;
          background: transparent;
          color: rgba(245,245,245,.45);
          font-size: 14px;
          cursor: pointer;
        }

        .qty-control button:hover {
          color: #ff3030;
          background: rgba(255,0,0,.08);
        }

        .qty-control span {
          flex: 1;
          text-align: center;
          color: #f5f5f3;
          font-size: 11.7px;
        }

        .row-index {
          color: rgba(245,245,245,.2);
          font-size: 9.1px;
          letter-spacing: .15em;
          text-align: right;
        }

        .summary-card {
          position: sticky;
          top: 28px;
          overflow: hidden;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.035),
              rgba(255,0,0,.025)
            );
          border:
            1px solid
            rgba(255,255,255,.09);
          box-shadow:
            0 25px 80px
            rgba(0,0,0,.35);
          backdrop-filter: blur(20px);
        }

        .summary-top-line {
          width: 100%;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              #ff2020,
              rgba(255,32,32,.15),
              transparent
            );
        }

        .summary-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 24px 18px;
          border-bottom:
            1px solid
            rgba(255,255,255,.07);
          font-size: 10.4px;
          letter-spacing: .2em;
        }

        .summary-status {
          color: rgba(255,60,60,.7);
          font-size: 9.1px;
        }

        .summary-content {
          padding: 24px;
        }

        .summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          color: rgba(245,245,243,.42);
          font-size: 10.4px;
          letter-spacing: .16em;
        }

        .summary-row span:last-child {
          color: rgba(245,245,243,.75);
        }

        .summary-divider {
          height: 1px;
          margin: 23px 0;
          background: rgba(255,255,255,.07);
        }

        .summary-total {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 25px;
        }

        .summary-total span {
          color: rgba(245,245,243,.4);
          font-size: 10.4px;
          letter-spacing: .18em;
        }

        .summary-total strong {
          color: #f5f5f3;
          font-family:
            "Space Grotesk",
            Inter,
            sans-serif;
          font-size: 25px;
          font-weight: 500;
        }

        .checkout-button {
          position: relative;
          width: 100%;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          border:
            1px solid
            rgba(255,40,40,.45);
          background:
            linear-gradient(
              100deg,
              #9d0000,
              #e31b1b
            );
          color: #fff;
          font-family: inherit;
          font-size: 10.4px;
          letter-spacing: .16em;
          cursor: pointer;
        }

        .checkout-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: linear-gradient(100deg, #4a1010, #6b1a1a);
        }

        .checkout-arrow {
          font-size: 15px;
        }

        .trust-grid {
          display: grid;
          grid-template-columns:
            repeat(3,1fr);
          gap: 8px;
          margin-top: 24px;
          padding-top: 18px;
          border-top:
            1px solid
            rgba(255,255,255,.06);
        }

        .trust-item span {
          display: block;
          margin-bottom: 7px;
          color: rgba(255,45,45,.55);
          font-size: 9.1px;
        }

        .trust-item p {
          margin: 0;
          color: rgba(245,245,245,.27);
          font-size: 7.8px;
          line-height: 1.5;
          letter-spacing: .12em;
        }

        .empty-cart {
          position: relative;
          min-height: 470px;
          margin-top: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border:
            1px solid
            rgba(255,255,255,.07);
          background:
            radial-gradient(
              circle at center,
              rgba(130,0,0,.09),
              transparent 58%
            );
        }

        .empty-content {
          position: relative;
          z-index: 5;
          text-align: center;
          padding: 60px 20px;
        }

        .empty-kicker {
          color: rgba(255,50,50,.65);
          font-size: 9.1px;
          letter-spacing: .22em;
        }

        .empty-content h2 {
          margin: 18px 0 15px;
          font-family:
            "Space Grotesk",
            Inter,
            sans-serif;
          font-size: clamp(36px,6vw,64px);
          line-height: .95;
          font-weight: 500;
          letter-spacing: -.055em;
        }

        .empty-content h2 span {
          color: transparent;
          -webkit-text-stroke:
            1px
            rgba(245,245,243,.45);
        }

        .empty-content p {
          margin: 0 0 32px;
          color: rgba(245,245,243,.35);
          font-size: 11.7px;
          line-height: 1.8;
          letter-spacing: .08em;
        }

        .explore-box {
          width: fit-content;
          margin: 0 auto;
        }

        .explore-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 15px;
          overflow: hidden;
          color: #fff;
          text-decoration: none;
          background:
            linear-gradient(
              145deg,
              rgba(34,3,3,.98),
              rgba(8,5,5,.99)
            );
          border:
            1px solid
            rgba(155,24,24,.7);
        }

        .explore-text-box {
          position: relative;
          z-index: 5;
          display: inline-flex;
          padding: 8px 12px;
          border:
            1px solid
            rgba(255,255,255,.12);
          border-radius: 3px;
          background: rgba(255,255,255,.025);
        }

        .explore-text {
          font-family:
            "Space Grotesk",
            Inter,
            sans-serif;
          font-size: 10.4px;
          font-weight: 600;
          letter-spacing: .2em;
          color: #fff;
        }

        .explore-web {
          position: absolute;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          opacity: .28;
          background:
            repeating-conic-gradient(
              from 0deg,
              transparent 0deg 11deg,
              rgba(255,255,255,.4) 11.5deg 12.3deg,
              transparent 12.8deg 24deg
            );
        }

        .explore-web-left {
          left: -17px;
          top: -17px;
        }

        .explore-web-right {
          right: -17px;
          bottom: -17px;
        }

        .explore-blood {
          position: absolute;
          bottom: -1px;
          width: 3px;
          background:
            linear-gradient(
              to bottom,
              #8c0808,
              #4d0101
            );
          border-radius: 0 0 50% 50%;
          z-index: 2;
        }

        .blood-one {
          left: 19%;
          height: 8px;
        }

        .blood-two {
          left: 48%;
          height: 5px;
        }

        .blood-three {
          left: 77%;
          height: 10px;
        }

        .empty-orbit {
          position: absolute;
          border-radius: 50%;
          border:
            1px solid
            rgba(255,30,30,.07);
          animation:
            orbitRotate
            18s
            linear
            infinite;
        }

        .orbit-one {
          width: 420px;
          height: 420px;
        }

        .orbit-two {
          width: 620px;
          height: 620px;
          animation-duration: 25s;
          animation-direction: reverse;
        }

        .empty-web {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          opacity: .08;
          background:
            repeating-radial-gradient(
              circle,
              transparent 0,
              transparent 20px,
              rgba(255,40,40,.7) 21px,
              transparent 22px
            );
        }

        .empty-web-one {
          top: -80px;
          left: -80px;
        }

        .empty-web-two {
          bottom: -100px;
          right: -70px;
        }

        @keyframes orbitRotate {
          from {
            transform: rotate(0);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .cart-footer {
          position: relative;
          z-index: 5;
          width: min(1380px, calc(100% - 44px));
          margin: 0 auto;
          min-height: 85px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          border-top:
            1px solid
            rgba(255,255,255,.06);
          color: rgba(245,245,243,.25);
          font-size: 9.1px;
          letter-spacing: .18em;
        }

        .cart-footer div:nth-child(2) {
          text-align: center;
        }

        .cart-footer div:nth-child(3) {
          text-align: right;
        }

        /* =====================================================
           ABOUT + CONTACT OVERLAY
        ===================================================== */

        .info-overlay {
          position: fixed;
          inset: 0;
          z-index: 2147483646;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0,0,0,.72);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .info-panel {
          position: relative;
          width: min(620px, 100%);
          min-height: 420px;
          padding: 75px 55px 45px;
          overflow: hidden;
          background:
            linear-gradient(
              145deg,
              rgba(35,5,5,.98),
              rgba(7,2,2,.99)
            );
          border:
            1px solid
            rgba(255,255,255,.1);
          box-shadow:
            0 30px 100px
            rgba(0,0,0,.6);
        }

        .info-panel::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              #ff2020,
              rgba(255,32,32,.15),
              transparent
            );
        }

        .overlay-close {
          position: absolute;
          top: 25px;
          right: 25px;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 0;
          background: transparent;
          color: rgba(255,255,255,.45);
          font-family: Inter, sans-serif;
          font-size: 9.1px;
          letter-spacing: .16em;
          cursor: pointer;
        }

        .overlay-close span {
          color: rgba(255,255,255,.7);
          font-size: 18px;
          line-height: 1;
        }

        .overlay-kicker {
          color: rgba(255,50,50,.65);
          font-size: 9.1px;
          letter-spacing: .22em;
        }

        .info-panel h2 {
          margin: 18px 0 20px;
          color: #f5f5f3;
          font-family:
            "Space Grotesk",
            Inter,
            sans-serif;
          font-size: clamp(42px,6vw,64px);
          line-height: .9;
          font-weight: 500;
          letter-spacing: -.05em;
        }

        .info-panel h2 span {
          color: transparent;
          -webkit-text-stroke:
            1px
            rgba(245,245,243,.45);
        }

        .overlay-line {
          width: 55px;
          height: 1px;
          margin-bottom: 25px;
          background:
            linear-gradient(
              90deg,
              #ff2020,
              transparent
            );
        }

        .info-panel p {
          max-width: 500px;
          margin: 0;
          color: rgba(245,245,243,.48);
          font-size: 13px;
          line-height: 1.9;
          letter-spacing: .04em;
        }

        .overlay-footer {
          position: absolute;
          left: 55px;
          bottom: 28px;
          color: rgba(255,255,255,.2);
          font-size: 7.8px;
          letter-spacing: .18em;
        }

        .social-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .social-list button {
          position: relative;
          width: 100%;
          min-height: 58px;
          padding: 0 17px;
          display: flex;
          align-items: center;
          border:
            1px solid
            rgba(255,255,255,.07);
          background: rgba(255,255,255,.018);
          color: rgba(255,255,255,.58);
          font-family:
            "Space Grotesk",
            Inter,
            sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: .13em;
          cursor: pointer;
          text-align: left;
          transition:
            color .3s ease,
            background .3s ease,
            border-color .3s ease,
            padding-left .3s ease;
        }

        .social-list button:hover {
          color: #fff;
          padding-left: 24px;
          background:
            linear-gradient(
              90deg,
              rgba(130,0,0,.2),
              rgba(255,255,255,.025)
            );
          border-color:
            rgba(150,0,0,.35);
        }

        /* =====================================================
           SIDE MENU
        ===================================================== */

        .stoked-menu {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100dvh !important;
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
          border-left:
            1px solid
            rgba(255, 255, 255, 0.1) !important;
          transform: translateX(105%) !important;
          transition:
            transform
            0.65s
            cubic-bezier(.76,0,.24,1) !important;
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

        .stoked-menu.stoked-menu-visible
          .stoked-menu-panel {
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
          font-family:
            "Space Grotesk",
            sans-serif !important;
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
            opacity .25s ease,
            transform .25s ease !important;
        }

        .stoked-menu-close:hover {
          opacity: .65 !important;
          transform: translateX(-3px);
        }

        .stoked-menu-close span {
          font-size: 19px !important;
          line-height: 1 !important;
          color: rgba(255,255,255,.65) !important;
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
          border:
            1px solid
            rgba(255,255,255,.055) !important;
          border-radius: 2px !important;
          background: rgba(255,255,255,.018) !important;
          color: rgba(255,255,255,.58) !important;
          font-family:
            "Space Grotesk",
            sans-serif !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          letter-spacing: .08em !important;
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
            background .35s ease,
            border-color .35s ease,
            color .35s ease,
            padding-left .35s ease,
            box-shadow .35s ease !important;
        }

        .stoked-menu-links button::before {
          content: "01" !important;
          width: 25px !important;
          flex-shrink: 0 !important;
          font-family: "Inter", sans-serif !important;
          font-size: 7px !important;
          font-weight: 500 !important;
          letter-spacing: .1em !important;
          color: rgba(255,255,255,.2) !important;
          transition: color .35s ease !important;
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
              rgba(130,0,0,.18),
              rgba(255,255,255,.025)
            ) !important;
          border-color:
            rgba(150,0,0,.3) !important;
          box-shadow:
            inset 2px 0 0 rgba(150,0,0,.85),
            0 8px 30px
            rgba(0,0,0,.18) !important;
        }

        .stoked-menu-links button:hover::before {
          color: rgba(180,0,0,.9) !important;
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
          color: rgba(255,255,255,.22) !important;
          font-family: "Inter", sans-serif !important;
          font-size: 6px !important;
          letter-spacing: .18em !important;
          z-index: 10 !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

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

          .cart-footer {
            width: calc(100% - 28px);
            min-height: 100px;
            grid-template-columns: 1fr 1fr;
            row-gap: 12px;
            padding: 20px 0;
            font-size: 7.8px;
          }

          .cart-footer div:nth-child(2) {
            text-align: right;
          }

          .cart-footer div:nth-child(3) {
            grid-column: 1 / -1;
            text-align: left;
          }

          .info-panel {
            padding: 65px 25px 35px;
          }
        }

        @media (max-width: 700px) {
          .stoked-menu {
            pointer-events: none !important;
          }

          .stoked-menu.stoked-menu-visible {
            pointer-events: auto !important;
          }

          .cart-layout {
            grid-template-columns: minmax(0, 1fr);
          }

          .summary-card {
            position: relative;
            top: auto;
          }

          .cart-row {
            grid-template-columns:
              minmax(0, 1fr)
              88px;
            gap: 12px;
            align-items: start;
            min-height: 170px;
            padding: 18px 10px;
          }

          .table-head {
            grid-template-columns:
              minmax(0, 1fr)
              88px;
            gap: 12px;
          }

          .table-head span:nth-child(3),
          .table-head span:nth-child(4) {
            display: none;
          }

          .table-head span:nth-child(2) {
            text-align: right;
          }

          .product-cell {
            min-width: 0;
            align-items: flex-start;
            gap: 12px;
          }

          .product-info {
            min-width: 0;
            width: 100%;
            padding-right: 2px;
          }

          .product-name {
            max-width: 100%;
            white-space: normal;
            line-height: 1.25;
          }

          .product-size {
            margin-top: 8px;
            white-space: nowrap;
          }

          .price-cell {
            grid-column: 2;
            grid-row: 1;
            align-self: start;
            padding: 2px 0 0;
            text-align: right;
            white-space: nowrap;
            font-size: 11.7px;
          }

          .qty-control {
            grid-column: 2;
            grid-row: 2;
            width: 88px;
            height: 36px;
            margin-top: 2px;
            justify-self: end;
          }

          .qty-control button {
            width: 27px;
          }

          .row-index {
            display: none;
          }

          .remove-button {
            margin-top: 12px;
            min-height: 32px;
          }
        }

        @media (max-width: 380px) {
          .cart-container {
            width: calc(100% - 22px);
          }

          .cart-title {
            font-size: 34px;
          }

          .product-image-wrap {
            flex-basis: 74px;
            width: 74px;
            height: 84px;
          }

          .product-cell {
            gap: 11px;
          }

          .product-name {
            font-size: 15px;
          }

          .price-cell {
            padding: 2px 0 0;
          }

          .qty-control {
            width: 88px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cart-title,
          .empty-orbit {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </main>
  );
}