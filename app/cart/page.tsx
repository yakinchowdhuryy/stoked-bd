"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  quantity: number;
};

const CART_KEY = "stoked-cart";

const SPIDER_IMAGE =
  "https://scontent.fdac5-2.fna.fbcdn.net/v/t1.15752-9/825309130_1563241724996165_990897618114404117_n.png?stp=dst-png_s960x960&_nc_cat=101&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=9f807c&_nc_ohc=jq1XOrX6tlUQ7kNvwFEQUB9&_nc_oc=AdpqFpc6mein9ETDVhyiS1f2iZM9qr-IUWI31CtQffkjMcuHVLMOTaAMCxv2kB2vWr4&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.fdac5-2.fna&_nc_ss=7a22e&oh=03_Q7cD6gFXbcr5ZmFULWMoEzYqAhj43DGf2gPyljrIPHYw9xyzQg&oe=6AE1DAAE";

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

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

  function updateQuantity(index: number, change: number) {
    setCart((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          quantity: Math.max(1, item.quantity + change),
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
    (total, item) =>
      total + Number(item.quantity),
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
            font-size: 9px;
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

      {/* BACKGROUND */}

      <div className="background-grid" />
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />
      <div className="red-vignette" />

      {/* AMBIENT WEBS */}

      <div className="ambient-web web-one" />
      <div className="ambient-web web-two" />
      <div className="ambient-web web-three" />
      <div className="ambient-web web-four" />

      {/* SPIDERS */}

      <div className="spider spider-one">
        <span className="spider-thread" />

        <div className="spider-body">
          <img src={SPIDER_IMAGE} alt="" />
        </div>
      </div>

      <div className="spider spider-two">
        <span className="spider-thread" />

        <div className="spider-body">
          <img src={SPIDER_IMAGE} alt="" />
        </div>
      </div>

      <div className="spider spider-three">
        <span className="spider-thread" />

        <div className="spider-body">
          <img src={SPIDER_IMAGE} alt="" />
        </div>
      </div>

      <div className="spider spider-four">
        <span className="spider-thread" />

        <div className="spider-body">
          <img src={SPIDER_IMAGE} alt="" />
        </div>
      </div>

      <div className="spider spider-five">
        <span className="spider-thread" />

        <div className="spider-body">
          <img src={SPIDER_IMAGE} alt="" />
        </div>
      </div>

      {/* WEB SHOOTERS */}

      <div className="web-shot shot-one">
        <span />
        <span />
        <span />
      </div>

      <div className="web-shot shot-two">
        <span />
        <span />
        <span />
      </div>

      <div className="web-shot shot-three">
        <span />
        <span />
        <span />
      </div>

      <div className="web-shot shot-four">
        <span />
        <span />
        <span />
      </div>

      {/* PARTICLES */}

      <span className="red-particle particle-one" />
      <span className="red-particle particle-two" />
      <span className="red-particle particle-three" />
      <span className="red-particle particle-four" />

      {/* HEADER */}

      <header className="site-header">

        <Link href="/" className="home-button">
          <span className="home-blood home-blood-1"></span>
          <span className="home-blood home-blood-2"></span>
          <span className="home-web"></span>
          <span className="home-text">HOME</span>
          <span className="home-arrow">↗</span>
        </Link>

      </header>

      {/* MAIN */}

      <section className="cart-container">

        {/* HERO */}

        <div className="cart-hero">

          <div className="hero-left">

            <div className="eyebrow">
              <span className="eyebrow-line" />

              <span>
                STOKED BD / BAG
              </span>
            </div>

            <div className="title-wrap">

              <h1 className="cart-title">
                YOUR BAG
              </h1>

              <span className="title-number">
                01
              </span>

            </div>

            <div className="title-line" />

          </div>

          <div className="hero-right">

            <span className="bag-item-count">
              {totalItems}{" "}
              {totalItems === 1 ? "ITEM" : "ITEMS"}
            </span>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="clear-button"
              >
                <span className="clear-icon">
                  ×
                </span>

                <span className="clear-text">
                  CLEAR BAG
                </span>

                <span className="clear-arrow">
                  ↗
                </span>

                <span className="clear-shine" />
              </button>
            )}

          </div>

        </div>

        {/* EMPTY CART */}

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
                Explore the collection and find
                something worth wearing.
              </p>

              {/* COMPACT SPIDER EXPLORE BUTTON */}

              <div className="explore-box">

                <Link
                  href="/shop"
                  className="explore-button"
                >

                  {/* WEB DETAILS */}

                  <span className="explore-web explore-web-left" />
                  <span className="explore-web explore-web-right" />

                  {/* BLOOD DETAILS */}

                  <span className="explore-blood blood-one" />
                  <span className="explore-blood blood-two" />
                  <span className="explore-blood blood-three" />

                

                  <span className="explore-text-box">
  <span className="explore-text">EXPLORE COLLECTION</span>
</span>

                

                  <span className="explore-shine" />

                </Link>

              </div>

            </div>

          </div>

        ) : (

          <div className="cart-layout">

            {/* ITEMS */}

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

                        {item.size && (
                          <span className="product-size">
                            SIZE / {item.size}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(index)
                          }
                          className="remove-button"
                        >
                          REMOVE
                        </button>

                      </div>

                    </div>

                    <div className="price-cell">
                      ৳
                      {Number(item.price).toLocaleString()}
                    </div>

                    <div className="qty-control">

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(index, -1)
                        }
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(index, 1)
                        }
                        aria-label="Increase quantity"
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

            {/* SUMMARY */}

            <aside className="summary-card">

              <div className="summary-top-line" />

              <div className="summary-heading">

                <span>
                  ORDER SUMMARY
                </span>

                <span className="summary-status">
                  READY
                </span>

              </div>

              <div className="summary-content">

                <div className="summary-row">
                  <span>ITEMS</span>

                  <span>
                    {totalItems}
                  </span>
                </div>

                <div className="summary-row">

                  <span>
                    SUBTOTAL
                  </span>

                  <span>
                    ৳{subtotal.toLocaleString()}
                  </span>

                </div>

                <div className="summary-divider" />

                <div className="summary-total">

                  <span>
                    TOTAL
                  </span>

                  <strong>
                    ৳{subtotal.toLocaleString()}
                  </strong>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/checkout")
                  }
                  className="checkout-button"
                >

                  <span>
                    PROCEED TO CHECKOUT
                  </span>

                  <span className="checkout-arrow">
                    →
                  </span>

                </button>

                <div className="trust-grid">

                  <div className="trust-item">

                    <span>
                      01
                    </span>

                    <p>
                      SECURE
                      <br />
                      CHECKOUT
                    </p>

                  </div>

                  <div className="trust-item">

                    <span>
                      02
                    </span>

                    <p>
                      EASY
                      <br />
                      ORDERING
                    </p>

                  </div>

                  <div className="trust-item">

                    <span>
                      03
                    </span>

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

      {/* FOOTER */}

      <footer className="cart-footer">

        <div>
          STOKED BD
        </div>

        <div>
          © {new Date().getFullYear()} STOKED
        </div>

        <div>
          BUILT FOR THE STREETS
        </div>

      </footer>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .cart-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          overflow-y: visible;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(120, 0, 0, 0.18),
              transparent 32%
            ),
            #070202;
          color: #f5f5f3;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
        }

        .background-grid {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.13;
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
          background-size: 70px 70px;
          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 92%
            );
        }

        .background-glow {
          position: fixed;
          z-index: 0;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(90px);
        }

        .glow-one {
          width: 420px;
          height: 420px;
          top: -190px;
          left: 25%;
          background:
            rgba(180, 0, 0, 0.1);
        }

        .glow-two {
          width: 320px;
          height: 320px;
          right: -100px;
          top: 48%;
          background:
            rgba(180, 0, 0, 0.07);
        }

        .red-vignette {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          box-shadow:
            inset 0 0 180px rgba(0, 0, 0, 0.85),
            inset 0 0 45px rgba(120, 0, 0, 0.1);
        }

        .ambient-web {
          position: fixed;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          z-index: 1;
          pointer-events: none;
          opacity: 0.07;
          background:
            repeating-radial-gradient(
              circle,
              transparent 0,
              transparent 18px,
              rgba(255, 60, 60, 0.7) 19px,
              transparent 20px
            );
          animation:
            webPulse 7s ease-in-out infinite;
        }

        .web-one {
          top: 90px;
          left: -70px;
        }

        .web-two {
          top: 35%;
          right: -80px;
          animation-delay: 1.5s;
        }

        .web-three {
          bottom: 8%;
          left: -70px;
          animation-delay: 3s;
        }

        .web-four {
          bottom: -60px;
          right: -40px;
          animation-delay: 4.5s;
        }

        @keyframes webPulse {
          0%,
          100% {
            opacity: 0.035;
            transform: scale(0.95);
          }

          50% {
            opacity: 0.09;
            transform: scale(1.05);
          }
        }

        .spider {
          position: fixed;
          z-index: 2;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          animation:
            spiderAppear 1.2s ease-out forwards,
            spiderFloat 6s ease-in-out infinite;
        }

        .spider-thread {
          width: 1px;
          height: 80px;
          background:
            linear-gradient(
              to bottom,
              transparent,
              rgba(255, 255, 255, 0.25),
              rgba(255, 40, 40, 0.55)
            );
          transform-origin: top;
          animation:
            threadSway 4s ease-in-out infinite;
        }

        .spider-body {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          filter:
            drop-shadow(
              0 0 12px rgba(255, 0, 0, 0.4)
            );
        }

        .spider-body img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
        }

        .spider-one {
          top: 125px;
          left: 7%;
          animation-delay:
            0.2s,
            0.2s;
        }

        .spider-two {
          top: 255px;
          right: 8%;
          transform: scale(0.72);
          animation-delay:
            0.4s,
            1s;
        }

        .spider-three {
          top: 56%;
          left: 4%;
          transform: scale(0.6);
          animation-delay:
            0.6s,
            2s;
        }

        .spider-four {
          top: 67%;
          right: 5%;
          transform: scale(0.8);
          animation-delay:
            0.8s,
            3s;
        }

        .spider-five {
          bottom: 5%;
          left: 47%;
          transform: scale(0.55);
          animation-delay:
            1s,
            4s;
        }

        @keyframes spiderAppear {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }

          to {
            opacity: 0.48;
          }
        }

        @keyframes spiderFloat {
          0%,
          100% {
            margin-top: 0;
          }

          50% {
            margin-top: 18px;
          }
        }

        @keyframes threadSway {
          0%,
          100% {
            transform: rotate(-1deg);
          }

          50% {
            transform: rotate(2deg);
          }
        }

        .web-shot {
          position: fixed;
          width: 160px;
          height: 1px;
          z-index: 2;
          pointer-events: none;
          opacity: 0;
        }

        .web-shot span {
          position: absolute;
          left: 0;
          top: 0;
          height: 1px;
          border-radius: 999px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255, 40, 40, 0.85),
              transparent
            );
          box-shadow:
            0 0 8px rgba(255, 20, 20, 0.8);
        }

        .web-shot span:nth-child(1) {
          width: 100%;
        }

        .web-shot span:nth-child(2) {
          width: 65%;
          top: 4px;
        }

        .web-shot span:nth-child(3) {
          width: 45%;
          top: -4px;
        }

        .shot-one {
          top: 22%;
          left: -160px;
          transform: rotate(12deg);
          animation:
            shootOne 5s linear infinite;
        }

        .shot-two {
          top: 45%;
          right: -160px;
          transform: rotate(-14deg);
          animation:
            shootTwo 6s linear 1.5s infinite;
        }

        .shot-three {
          top: 70%;
          left: -160px;
          transform: rotate(8deg);
          animation:
            shootOne 7s linear 3s infinite;
        }

        .shot-four {
          top: 82%;
          right: -160px;
          transform: rotate(-10deg);
          animation:
            shootTwo 6.5s linear 4s infinite;
        }

        @keyframes shootOne {
          0% {
            opacity: 0;
            left: -180px;
          }

          10% {
            opacity: 0.7;
          }

          35% {
            opacity: 0.35;
            left: 55%;
          }

          45% {
            opacity: 0;
            left: 110%;
          }

          100% {
            opacity: 0;
            left: 110%;
          }
        }

        @keyframes shootTwo {
          0% {
            opacity: 0;
            right: -180px;
          }

          10% {
            opacity: 0.65;
          }

          35% {
            opacity: 0.3;
            right: 55%;
          }

          45% {
            opacity: 0;
            right: 110%;
          }

          100% {
            opacity: 0;
            right: 110%;
          }
        }

        .red-particle {
          position: fixed;
          z-index: 2;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #ff2020;
          box-shadow:
            0 0 12px rgba(255, 20, 20, 0.9);
          pointer-events: none;
          opacity: 0.5;
          animation:
            particleFloat 5s ease-in-out infinite;
        }

        .particle-one {
          top: 30%;
          left: 24%;
        }

        .particle-two {
          top: 62%;
          right: 28%;
          animation-delay: 1s;
        }

        .particle-three {
          top: 76%;
          left: 35%;
          animation-delay: 2s;
        }

        .particle-four {
          top: 18%;
          right: 30%;
          animation-delay: 3s;
        }

        @keyframes particleFloat {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.2;
          }

          50% {
            transform: translateY(-20px);
            opacity: 0.8;
          }
        }

        /* HEADER */

        .site-header {
          position: relative;
          z-index: 10;
          width: 100%;
          height: 82px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding:
            0 clamp(22px, 5vw, 70px);
          border-bottom:
            1px solid rgba(255, 255, 255, 0.06);
          background:
            rgba(7, 2, 2, 0.48);
          backdrop-filter:
            blur(18px);
        }

        /* BLOODY HOME BUTTON */

        .home-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          min-width: 78px;
          height: 36px;
          padding: 0 14px;

          overflow: hidden;
          isolation: isolate;

          color: #eeeeeb;
          text-decoration: none;

          background:
            linear-gradient(
              145deg,
              rgba(105, 7, 7, 0.96),
              rgba(28, 3, 3, 0.99)
            );

          border:
            1px solid rgba(190, 30, 30, 0.7);

          box-shadow:
            inset 0 0 20px rgba(140, 0, 0, 0.2),
            0 0 16px rgba(110, 0, 0, 0.18);

          backdrop-filter:
            blur(14px);

          transition:
            transform 0.3s ease,
            border-color 0.3s ease,
            background 0.3s ease,
            box-shadow 0.3s ease;
        }

        .home-button::before {
          content: "";
          position: absolute;
          inset: 0;

          background:
            radial-gradient(
              circle at 15% 100%,
              rgba(190, 0, 0, 0.35),
              transparent 38%
            ),
            radial-gradient(
              circle at 90% 0%,
              rgba(130, 0, 0, 0.28),
              transparent 40%
            );

          pointer-events: none;
          z-index: 0;
        }

        .home-blood {
          position: absolute;
          bottom: -1px;

          width: 3px;

          background:
            linear-gradient(
              to bottom,
              #a30a0a,
              #4c0101
            );

          border-radius:
            0 0 50% 50%;

          opacity: 0.8;

          z-index: 2;

          pointer-events: none;

          filter:
            drop-shadow(
              0 0 4px rgba(150, 0, 0, 0.6)
            );
        }

        .home-blood-1 {
          left: 18%;
          height: 8px;

          box-shadow:
            13px 1px 0 rgba(90, 2, 2, 0.9),
            31px -1px 0 rgba(125, 4, 4, 0.75);
        }

        .home-blood-2 {
          right: 17%;
          height: 5px;

          box-shadow:
            -12px 1px 0 rgba(85, 2, 2, 0.8),
            -27px 0 0 rgba(120, 3, 3, 0.65);
        }

        .home-web {
          position: absolute;

          width: 34px;
          height: 34px;

          top: -16px;
          right: -12px;

          opacity: 0.28;

          pointer-events: none;

          background:
            repeating-conic-gradient(
              from 0deg,
              transparent 0deg 12deg,
              rgba(255, 255, 255, 0.4) 12.5deg 13.2deg,
              transparent 13.7deg 25deg
            );

          border-radius: 50%;

          mask-image:
            radial-gradient(
              circle,
              transparent 0 6px,
              #000 6.5px 7px,
              transparent 7.5px 12px,
              #000 12.5px 13px,
              transparent 13.5px 18px,
              #000 18.5px 19px,
              transparent 19.5px
            );

          -webkit-mask-image:
            radial-gradient(
              circle,
              transparent 0 6px,
              #000 6.5px 7px,
              transparent 7.5px 12px,
              #000 12.5px 13px,
              transparent 13.5px 18px,
              #000 18.5px 19px,
              transparent 19.5px
            );

          z-index: 1;
        }

        .home-text {
          position: relative;
          z-index: 5;

          color:
            rgba(235, 235, 232, 0.88);

          font-family:
            "Space Grotesk",
            Inter,
            Arial,
            sans-serif;

          font-size: 8px;
          font-weight: 600;

          letter-spacing: 0.24em;

          text-shadow:
            0 0 8px rgba(255, 255, 255, 0.08),
            0 0 16px rgba(120, 0, 0, 0.35);

          transition:
            color 0.3s ease,
            letter-spacing 0.3s ease,
            text-shadow 0.3s ease;
        }

        .home-arrow {
          position: relative;
          z-index: 5;

          color:
            rgba(235, 235, 235, 0.65);

          font-family:
            Arial,
            sans-serif;

          font-size: 13px;
          font-weight: 300;

          transition:
            color 0.3s ease,
            transform 0.3s ease;
        }

        .home-button:hover {
          transform:
            translateY(-2px);

          border-color:
            rgba(225, 40, 40, 0.95);

          background:
            linear-gradient(
              145deg,
              rgba(125, 8, 8, 0.98),
              rgba(30, 3, 3, 1)
            );

          box-shadow:
            inset 0 0 25px rgba(170, 0, 0, 0.25),
            0 0 20px rgba(145, 0, 0, 0.3),
            0 0 35px rgba(100, 0, 0, 0.14);
        }

        .home-button:hover .home-text {
          color: #f4f4f1;

          letter-spacing: 0.27em;

          text-shadow:
            0 0 10px rgba(255, 255, 255, 0.15),
            0 0 20px rgba(170, 0, 0, 0.45);
        }

        .home-button:hover .home-arrow {
          color: #ffffff;

          transform:
            translate(2px, -2px);
        }

        .home-button:hover .home-web {
          opacity: 0.5;
        }

        /* CONTAINER */

        .cart-container {
          position: relative;
          z-index: 5;
          width:
            min(
              1380px,
              calc(100% - 44px)
            );
          margin: 0 auto;
          padding:
            clamp(65px, 8vw, 110px)
            0
            100px;
        }

        .cart-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          padding-bottom: 34px;
          border-bottom:
            1px solid rgba(255, 255, 255, 0.09);
        }

        .hero-left {
          min-width: 0;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 18px;
          color:
            rgba(245, 245, 243, 0.4);
          font-size: 8px;
          letter-spacing: 0.24em;
        }

        .eyebrow-line {
          width: 28px;
          height: 1px;
          background: #ff2020;
          box-shadow:
            0 0 9px rgba(255, 30, 30, 0.7);
        }

        .title-wrap {
          position: relative;
          display: inline-block;
        }

        .cart-title {
          position: relative;
          margin: 0;
          font-family:
            "Space Grotesk",
            Inter,
            sans-serif;
          font-size:
            clamp(40px, 5.2vw, 68px);
          line-height: 0.94;
          font-weight: 500;
          letter-spacing: -0.05em;
          color: #f5f5f3;
          text-shadow:
            0 0 20px rgba(255, 0, 0, 0.05);
          animation:
            titleReveal 0.9s
            cubic-bezier(0.2, 0.7, 0.2, 1)
            both;
        }

        .title-number {
          position: absolute;
          top: -7px;
          right: -27px;
          color:
            rgba(255, 45, 45, 0.6);
          font-size: 7px;
          letter-spacing: 0.2em;
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
            0 0 10px rgba(255, 20, 20, 0.7);
          animation:
            lineReveal 1s ease-out
            0.25s both;
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

        @keyframes lineReveal {
          from {
            width: 0;
            opacity: 0;
          }

          to {
            width: 45px;
            opacity: 1;
          }
        }

        .hero-right {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-shrink: 0;
        }

        .bag-item-count {
          color:
            rgba(245, 245, 243, 0.4);
          font-size: 8px;
          letter-spacing: 0.2em;
        }

        .clear-button {
          position: relative;
          display: flex;
          align-items: center;
          gap: 9px;
          height: 34px;
          padding:
            0 12px;
          overflow: hidden;
          border:
            1px solid rgba(255, 255, 255, 0.09);
          background:
            linear-gradient(
              120deg,
              rgba(255, 255, 255, 0.025),
              rgba(120, 0, 0, 0.07)
            );
          color:
            rgba(245, 245, 243, 0.58);
          font-family: inherit;
          font-size: 7px;
          letter-spacing: 0.16em;
          cursor: pointer;
          box-shadow:
            inset 0 0 16px rgba(255, 0, 0, 0.025);
          transition:
            transform 0.3s ease,
            border-color 0.3s ease,
            color 0.3s ease,
            background 0.3s ease,
            box-shadow 0.3s ease;
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

          box-shadow:
            0 0 10px rgba(255, 30, 30, 0.7);
        }

        .clear-button:hover {
          transform:
            translateY(-2px);

          color: #fff;

          border-color:
            rgba(255, 40, 40, 0.45);

          background:
            linear-gradient(
              120deg,
              rgba(255, 255, 255, 0.04),
              rgba(150, 0, 0, 0.12)
            );

          box-shadow:
            0 8px 25px rgba(255, 0, 0, 0.08);
        }

        .clear-icon {
          position: relative;
          z-index: 2;
          color:
            rgba(255, 70, 70, 0.7);
          font-size: 14px;
          line-height: 1;
          transition:
            transform 0.3s ease,
            color 0.3s ease;
        }

        .clear-text {
          position: relative;
          z-index: 2;
        }

        .clear-arrow {
          position: relative;
          z-index: 2;
          color:
            rgba(255, 70, 70, 0.7);
          font-size: 13px;
          transition:
            transform 0.3s ease,
            color 0.3s ease;
        }

        .clear-button:hover
          .clear-icon {
          color: #ff3030;
          transform:
            rotate(90deg);
        }

        .clear-button:hover
          .clear-arrow {
          color: #ff3030;
          transform:
            translate(2px, -2px);
        }

        .clear-shine {
          position: absolute;
          top: 0;
          left: -110%;
          width: 70%;
          height: 100%;
          background:
            linear-gradient(
              100deg,
              transparent,
              rgba(255, 255, 255, 0.08),
              transparent
            );
          transform:
            skewX(-20deg);
          transition:
            left 0.65s ease;
        }

        .clear-button:hover
          .clear-shine {
          left: 130%;
        }

        .cart-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(320px, 380px);
          gap:
            clamp(35px, 6vw, 90px);
          align-items: start;
          margin-top: 42px;
        }

        .items-section {
          min-width: 0;
        }

        .table-head {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            100px
            105px
            28px;
          gap: 20px;
          padding:
            0 14px
            14px;
          color:
            rgba(245, 245, 243, 0.28);
          font-size: 7px;
          letter-spacing: 0.2em;
          border-bottom:
            1px solid rgba(255, 255, 255, 0.06);
        }

        .table-head span:nth-child(2),
        .table-head span:nth-child(3) {
          text-align: center;
        }

        .cart-row {
          position: relative;
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            100px
            105px
            28px;
          gap: 20px;
          align-items: center;
          min-height: 145px;
          padding:
            20px 14px;
          border-bottom:
            1px solid rgba(255, 255, 255, 0.065);
          transition:
            background 0.35s ease,
            border-color 0.35s ease;
        }

        .cart-row:hover {
          background:
            linear-gradient(
              90deg,
              rgba(120, 0, 0, 0.07),
              transparent
            );
          border-color:
            rgba(255, 50, 50, 0.14);
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
              rgba(255, 255, 255, 0.05),
              rgba(255, 0, 0, 0.025)
            );
          border:
            1px solid rgba(255, 255, 255, 0.09);
          transition:
            border-color 0.35s ease,
            box-shadow 0.35s ease;
        }

        .product-image-wrap::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              125deg,
              transparent 45%,
              rgba(255, 255, 255, 0.07),
              transparent 55%
            );
          transform:
            translateX(-120%);
          transition:
            transform 0.7s ease;
          pointer-events: none;
        }

        .cart-row:hover
          .product-image-wrap::after {
          transform:
            translateX(120%);
        }

        .cart-row:hover
          .product-image-wrap {
          border-color:
            rgba(255, 40, 40, 0.35);
          box-shadow:
            0 0 30px rgba(255, 0, 0, 0.08);
        }

        .product-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition:
            transform 0.45s
            cubic-bezier(0.2, 0.7, 0.2, 1);
        }

        .cart-row:hover
          .product-image {
          transform:
            scale(1.045);
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
          border-top:
            1px solid #ff3030;
          border-left:
            1px solid #ff3030;
        }

        .corner-bottom-right {
          right: -1px;
          bottom: -1px;
          border-right:
            1px solid #ff3030;
          border-bottom:
            1px solid #ff3030;
        }

        .product-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .product-category {
          margin-bottom: 7px;
          color:
            rgba(245, 245, 243, 0.27);
          font-size: 7px;
          letter-spacing: 0.17em;
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
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.02em;
        }

        .product-size {
          margin-top: 7px;
          color:
            rgba(245, 245, 245, 0.4);
          font-size: 7px;
          letter-spacing: 0.15em;
        }

        .remove-button {
          margin-top: 15px;
          padding: 0;
          border: 0;
          background: none;
          color:
            rgba(245, 245, 243, 0.3);
          font-family: inherit;
          font-size: 7px;
          letter-spacing: 0.17em;
          cursor: pointer;
          transition:
            color 0.25s ease;
        }

        .remove-button:hover {
          color: #ff3030;
        }

        .price-cell {
          color:
            rgba(245, 245, 243, 0.75);
          text-align: center;
          font-size: 10px;
          letter-spacing: 0.05em;
        }

        .qty-control {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 34px;
          border:
            1px solid rgba(255, 255, 255, 0.08);
          background:
            rgba(255, 255, 255, 0.018);
          transition:
            border-color 0.25s ease;
        }

        .cart-row:hover
          .qty-control {
          border-color:
            rgba(255, 40, 40, 0.2);
        }

        .qty-control button {
          width: 30px;
          height: 100%;
          border: 0;
          background: transparent;
          color:
            rgba(245, 245, 245, 0.45);
          font-size: 14px;
          cursor: pointer;
          transition:
            color 0.2s ease,
            background 0.2s ease;
        }

        .qty-control button:hover {
          color: #ff3030;
          background:
            rgba(255, 0, 0, 0.08);
        }

        .qty-control span {
          flex: 1;
          text-align: center;
          color: #f5f5f3;
          font-size: 9px;
        }

        .row-index {
          color:
            rgba(245, 245, 245, 0.2);
          font-size: 7px;
          letter-spacing: 0.15em;
          text-align: right;
        }

        .summary-card {
          position: sticky;
          top: 28px;
          overflow: hidden;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.035),
              rgba(255, 0, 0, 0.025)
            );
          border:
            1px solid rgba(255, 255, 255, 0.09);
          box-shadow:
            0 25px 80px rgba(0, 0, 0, 0.35);
          backdrop-filter:
            blur(20px);
        }

        .summary-top-line {
          width: 100%;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              #ff2020,
              rgba(255, 32, 32, 0.15),
              transparent
            );
          box-shadow:
            0 0 15px rgba(255, 20, 20, 0.4);
        }

        .summary-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding:
            22px 24px 18px;
          border-bottom:
            1px solid rgba(255, 255, 255, 0.07);
          color: #f5f5f3;
          font-size: 8px;
          letter-spacing: 0.2em;
        }

        .summary-status {
          color:
            rgba(255, 60, 60, 0.7);
          font-size: 7px;
        }

        .summary-content {
          padding: 24px;
        }

        .summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          color:
            rgba(245, 245, 243, 0.42);
          font-size: 8px;
          letter-spacing: 0.16em;
        }

        .summary-row span:last-child {
          color:
            rgba(245, 245, 243, 0.75);
        }

        .summary-divider {
          height: 1px;
          margin: 23px 0;
          background:
            rgba(255, 255, 255, 0.07);
        }

        .summary-total {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 25px;
        }

        .summary-total span {
          color:
            rgba(245, 245, 243, 0.4);
          font-size: 8px;
          letter-spacing: 0.18em;
        }

        .summary-total strong {
          color: #f5f5f3;
          font-family:
            "Space Grotesk",
            Inter,
            sans-serif;
          font-size: 25px;
          font-weight: 500;
          letter-spacing: -0.03em;
        }

        .checkout-button {
          position: relative;
          width: 100%;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          border:
            1px solid rgba(255, 40, 40, 0.45);
          background:
            linear-gradient(
              100deg,
              #9d0000,
              #e31b1b
            );
          color: #fff;
          font-family: inherit;
          font-size: 8px;
          letter-spacing: 0.16em;
          cursor: pointer;
          overflow: hidden;
          box-shadow:
            0 0 30px rgba(255, 0, 0, 0.08);
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .checkout-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              110deg,
              transparent 30%,
              rgba(255, 255, 255, 0.18),
              transparent 70%
            );
          transform:
            translateX(-120%);
          transition:
            transform 0.6s ease;
        }

        .checkout-button:hover {
          transform:
            translateY(-2px);
          box-shadow:
            0 12px 35px rgba(255, 0, 0, 0.18);
        }

        .checkout-button:hover::before {
          transform:
            translateX(120%);
        }

        .checkout-button span {
          position: relative;
          z-index: 1;
        }

        .checkout-arrow {
          font-size: 15px;
        }

        .trust-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 8px;
          margin-top: 24px;
          padding-top: 18px;
          border-top:
            1px solid rgba(255, 255, 255, 0.06);
        }

        .trust-item {
          min-width: 0;
        }

        .trust-item span {
          display: block;
          margin-bottom: 7px;
          color:
            rgba(255, 45, 45, 0.55);
          font-size: 7px;
        }

        .trust-item p {
          margin: 0;
          color:
            rgba(245, 245, 245, 0.27);
          font-size: 6px;
          line-height: 1.5;
          letter-spacing: 0.12em;
        }

        /* EMPTY */

        .empty-cart {
          position: relative;
          min-height: 470px;
          margin-top: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border:
            1px solid rgba(255, 255, 255, 0.07);
          background:
            radial-gradient(
              circle at center,
              rgba(130, 0, 0, 0.09),
              transparent 58%
            );
        }

        .empty-content {
          position: relative;
          z-index: 5;
          text-align: center;
          padding:
            60px 20px;
        }

        .empty-kicker {
          color:
            rgba(255, 50, 50, 0.65);
          font-size: 7px;
          letter-spacing: 0.22em;
        }

        .empty-content h2 {
          margin:
            18px 0
            15px;
          font-family:
            "Space Grotesk",
            Inter,
            sans-serif;
          font-size:
            clamp(36px, 6vw, 64px);
          line-height: 0.95;
          font-weight: 500;
          letter-spacing: -0.055em;
        }

        .empty-content h2 span {
          color: transparent;
          -webkit-text-stroke:
            1px rgba(245, 245, 243, 0.45);
          text-shadow:
            0 0 25px rgba(255, 0, 0, 0.08);
        }

        .empty-content p {
          margin:
            0 0 32px;
          color:
            rgba(245, 245, 243, 0.35);
          font-size: 9px;
          line-height: 1.8;
          letter-spacing: 0.08em;
        }

        /* =========================================================
           COMPACT SPIDER / BLOOD EXPLORE BUTTON
           ========================================================= */

        .explore-box {
          position: relative;
          width: fit-content;
          min-height: 0;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .explore-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: fit-content;
          min-width: 0;
          height: auto;
          padding: 12px 15px;
          overflow: hidden;
          color: #ffffff;
          text-decoration: none;
          background:
            linear-gradient(
              145deg,
              rgba(34, 3, 3, 0.98),
              rgba(8, 5, 5, 0.99)
            );
          border:
            1px solid rgba(155, 24, 24, 0.7);
          box-shadow:
            inset 0 0 24px rgba(120, 0, 0, 0.14),
            0 0 15px rgba(100, 0, 0, 0.13);
          isolation: isolate;
          transition:
            transform 0.35s
              cubic-bezier(0.2, 0.8, 0.2, 1),
            border-color 0.35s ease,
            background 0.35s ease,
            box-shadow 0.35s ease;
        }

        .explore-button::before {
  content: "";
  position: absolute;
  inset: 3px;
  border:
    1px solid rgba(255, 255, 255, 0.045);
  border-radius: 2px;
  pointer-events: none;
  z-index: 1;
}
        .explore-button::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(
              circle at 15% 100%,
              rgba(150, 0, 0, 0.32),
              transparent 38%
            ),
            radial-gradient(
              circle at 88% 0%,
              rgba(120, 0, 0, 0.22),
              transparent 40%
            );
          opacity: 0.9;
        }

        .explore-web {
          position: absolute;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          opacity: 0.28;
          background:
            repeating-conic-gradient(
              from 0deg,
              transparent 0deg 11deg,
              rgba(255, 255, 255, 0.4) 11.5deg 12.3deg,
              transparent 12.8deg 24deg
            );
          mask-image:
            radial-gradient(
              circle,
              transparent 0 7px,
              #000 7.5px 8px,
              transparent 8.5px 14px,
              #000 14.5px 15px,
              transparent 15.5px 21px,
              #000 21.5px 22px,
              transparent 22.5px
            );
          -webkit-mask-image:
            radial-gradient(
              circle,
              transparent 0 7px,
              #000 7.5px 8px,
              transparent 8.5px 14px,
              #000 14.5px 15px,
              transparent 15.5px 21px,
              #000 21.5px 22px,
              transparent 22.5px
            );
        }

        .explore-web-left {
          left: -17px;
          top: -17px;
          transform: rotate(18deg);
        }

        .explore-web-right {
          right: -17px;
          bottom: -17px;
          transform: rotate(-25deg);
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
          border-radius:
            0 0 50% 50%;
          z-index: 2;
          pointer-events: none;
          filter:
            drop-shadow(
              0 0 4px rgba(150, 0, 0, 0.5)
            );
          opacity: 0.78;
        }

        .blood-one {
          left: 19%;
          height: 8px;
        }

        .blood-two {
          left: 48%;
          height: 5px;
          opacity: 0.55;
        }

        .blood-three {
          left: 77%;
          height: 10px;
          opacity: 0.68;
        }

        .explore-number {
          position: relative;
          z-index: 5;
          color:
            rgba(255, 55, 55, 0.72);
          font-size: 7px;
          letter-spacing: 0.15em;
        }
.explore-text-box {
  position: relative;
  z-index: 5;

  display: inline-flex;
  align-items: center;

  padding: 6px 9px;

  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 3px;

  background: rgba(255, 255, 255, 0.025);

  box-shadow:
    inset 0 0 10px rgba(255, 255, 255, 0.025),
    0 0 8px rgba(100, 0, 0, 0.08);

  backdrop-filter: blur(5px);
}
        .explore-text {
          position: relative;
          z-index: 5;
          white-space: nowrap;
          font-family:
            "Space Grotesk",
            Inter,
            Arial,
            sans-serif;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.2em;
          color: #ffffff;
          text-transform: uppercase;
          text-shadow:
            0 0 8px rgba(255, 255, 255, 0.1),
            0 0 18px rgba(120, 0, 0, 0.3);
          transition:
            letter-spacing 0.35s ease,
            text-shadow 0.35s ease,
            transform 0.35s ease;
        }

        .explore-arrow {
          position: relative;
          z-index: 5;
          color:
            rgba(255, 55, 55, 0.8);
          font-size: 14px;
          line-height: 1;
          transition:
            transform 0.35s
              cubic-bezier(0.2, 0.8, 0.2, 1),
            color 0.35s ease;
        }

        .explore-shine {
          position: absolute;
          top: 0;
          left: -120%;
          width: 65%;
          height: 100%;
          z-index: 4;
          pointer-events: none;
          background:
            linear-gradient(
              100deg,
              transparent,
              rgba(255, 255, 255, 0.1),
              transparent
            );
          transform:
            skewX(-20deg);
          transition:
            left 0.7s ease;
        }

        .explore-button:hover {
          transform:
            translateY(-3px);
          border-color:
            rgba(205, 28, 28, 0.95);
          background:
            linear-gradient(
              145deg,
              rgba(48, 4, 4, 0.99),
              rgba(11, 5, 5, 1)
            );
          box-shadow:
            inset 0 0 28px rgba(150, 0, 0, 0.2),
            0 0 20px rgba(130, 0, 0, 0.28),
            0 0 38px rgba(90, 0, 0, 0.12);
        }

        .explore-button:hover
          .explore-text {
          letter-spacing: 0.23em;
          transform:
            translateX(1px);
          text-shadow:
            0 0 10px rgba(255, 255, 255, 0.16),
            0 0 22px rgba(160, 0, 0, 0.4);
        }

        .explore-button:hover
          .explore-arrow {
          color: #ffffff;
          transform:
            translate(3px, -3px);
        }

        .explore-button:hover
          .explore-web {
          opacity: 0.5;
        }

        .explore-button:hover
          .explore-shine {
          left: 135%;
        }

        .explore-button:active {
          transform:
            translateY(0)
            scale(0.98);
        }

        .empty-orbit {
          position: absolute;
          border-radius: 50%;
          border:
            1px solid rgba(255, 30, 30, 0.07);
          pointer-events: none;
          animation:
            orbitRotate 18s linear infinite;
        }

        .orbit-one {
          width: 420px;
          height: 420px;
        }

        .orbit-two {
          width: 620px;
          height: 620px;
          animation-duration: 25s;
          animation-direction:
            reverse;
        }

        .empty-web {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          opacity: 0.08;
          background:
            repeating-radial-gradient(
              circle,
              transparent 0,
              transparent 20px,
              rgba(255, 40, 40, 0.7) 21px,
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
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }
        }

        .cart-footer {
          position: relative;
          z-index: 5;
          width:
            min(
              1380px,
              calc(100% - 44px)
            );
          margin: 0 auto;
          min-height: 85px;
          display: grid;
          grid-template-columns:
            1fr 1fr 1fr;
          align-items: center;
          border-top:
            1px solid rgba(255, 255, 255, 0.06);
          color:
            rgba(245, 245, 243, 0.25);
          font-size: 7px;
          letter-spacing: 0.18em;
        }

        .cart-footer div:nth-child(2) {
          text-align: center;
        }

        .cart-footer div:nth-child(3) {
          text-align: right;
        }

        @media (max-width: 1050px) {

          .cart-layout {
            grid-template-columns:
              minmax(0, 1fr)
              330px;

            gap: 35px;
          }

          .table-head,
          .cart-row {
            grid-template-columns:
              minmax(0, 1fr)
              85px
              95px
              22px;

            gap: 12px;
          }

          .product-image-wrap {
            flex-basis: 88px;
            width: 88px;
            height: 100px;
          }

          .product-cell {
            gap: 15px;
          }
        }

        @media (max-width: 800px) {

          .site-header {
            height: 70px;

            padding:
              0 20px;
          }

          .cart-container {
            width:
              calc(100% - 32px);

            padding:
              55px 0 70px;
          }

          .cart-hero {
            align-items: flex-start;

            flex-direction: column;

            gap: 20px;
          }

          .hero-right {
            width: 100%;

            justify-content:
              space-between;
          }

          .cart-layout {
            grid-template-columns: 1fr;

            gap: 35px;

            margin-top: 30px;
          }

          .summary-card {
            position: relative;

            top: auto;
          }

          .spider-one {
            left: 1%;
          }

          .spider-two {
            right: 1%;
          }

          .spider-three {
            left: -2%;
          }

          .spider-four {
            right: -2%;
          }

          .spider-five {
            display: none;
          }

          .empty-cart {
            min-height: 430px;
          }
        }

        @media (max-width: 600px) {

          .cart-page {
            width: 100%;

            overflow-x: hidden;
          }

          .site-header {
            height: 66px;

            padding:
              0 16px;
          }

          .home-button {
            min-width: 70px;

            height: 33px;

            padding:
              0 11px;

            gap: 7px;
          }

          .home-text {
            font-size: 7px;

            letter-spacing: 0.2em;
          }

          .home-arrow {
            font-size: 12px;
          }

          .cart-container {
            width:
              calc(100% - 28px);

            padding:
              45px 0 55px;
          }

          .eyebrow {
            margin-bottom: 14px;

            font-size: 7px;
          }

          .cart-title {
            font-size: 38px;

            letter-spacing:
              -0.045em;
          }

          .title-number {
            top: -5px;
            right: -23px;
          }

          .title-line {
            width: 34px;

            margin-top: 14px;
          }

          .hero-right {
            gap: 15px;
          }

          .bag-item-count {
            font-size: 7px;
          }

          .clear-button {
            height: 32px;

            padding:
              0 10px;

            gap: 7px;

            font-size: 6px;
          }

          .clear-icon {
            font-size: 13px;
          }

          .clear-arrow {
            font-size: 12px;
          }

          .table-head {
            display: none;
          }

          .cart-row {
            display: grid;

            grid-template-columns:
              minmax(0, 1fr)
              auto;

            gap: 0;

            min-height: 0;

            padding:
              18px 0;
          }

          .product-cell {
            grid-column:
              1 / -1;

            display: flex;

            align-items: center;

            gap: 13px;

            min-width: 0;
          }

          .product-image-wrap {
            flex:
              0 0 80px;

            width: 80px;
            height: 90px;
          }

          .product-info {
            flex: 1;

            min-width: 0;
          }

          .product-category {
            margin-bottom: 6px;

            font-size: 6px;
          }

          .product-name {
            max-width: 100%;

            font-size: 14px;
          }

          .product-size {
            margin-top: 6px;

            font-size: 6px;
          }

          .remove-button {
            margin-top: 10px;

            font-size: 6px;
          }

          .price-cell {
            grid-column: 1;

            justify-self: start;

            margin-top: 14px;

            padding-left: 93px;

            font-size: 9px;

            text-align: left;
          }

          .qty-control {
            grid-column: 2;

            justify-self: end;

            width: 94px;
            height: 31px;

            margin-top: 14px;
          }

          .qty-control button {
            width: 28px;
          }

          .row-index {
            display: none;
          }

          .summary-card {
            width: 100%;
          }

          .summary-heading {
            padding:
              19px 18px 16px;
          }

          .summary-content {
            padding:
              20px 18px 18px;
          }

          .summary-total strong {
            font-size: 23px;
          }

          .checkout-button {
            height: 50px;
          }

          .trust-grid {
            gap: 7px;
          }

          .empty-cart {
            min-height: 430px;

            margin-top: 30px;
          }

          .empty-content {
            width: 100%;

            padding:
              50px 16px;
          }

          .empty-content h2 {
            font-size: 39px;

            letter-spacing:
              -0.05em;
          }

          .empty-content p {
            font-size: 8px;

            line-height: 1.8;
          }

          /* MOBILE EXPLORE BUTTON */

          .explore-button {
            padding:
              10px 12px;

            gap: 8px;
          }

          .explore-number {
            font-size: 6px;
          }

          .explore-text {
            font-size: 6.8px;

            letter-spacing: 0.16em;
          }

          .explore-arrow {
            font-size: 13px;
          }

          .explore-web {
            width: 34px;
            height: 34px;
          }

          .blood-one {
            height: 7px;
          }

          .blood-two {
            height: 4px;
          }

          .blood-three {
            height: 8px;
          }

          .orbit-one {
            width: 300px;
            height: 300px;
          }

          .orbit-two {
            width: 450px;
            height: 450px;
          }

          .empty-web {
            width: 150px;
            height: 150px;
          }

          .spider-body {
            width: 28px;
            height: 28px;
          }

          .spider-thread {
            height: 52px;
          }

          .spider-one {
            top: 105px;
          }

          .spider-two {
            top: 215px;
          }

          .spider-three {
            top: 58%;
          }

          .spider-four {
            top: 73%;
          }

          .ambient-web {
            opacity: 0.045;
          }

          .cart-footer {
            width:
              calc(100% - 28px);

            min-height: 100px;

            grid-template-columns:
              1fr 1fr;

            row-gap: 12px;

            padding:
              20px 0;

            font-size: 6px;
          }

          .cart-footer div:nth-child(2) {
            text-align: right;
          }

          .cart-footer div:nth-child(3) {
            grid-column:
              1 / -1;

            text-align: left;
          }
        }

        @media (max-width: 380px) {

          .cart-container {
            width:
              calc(100% - 22px);
          }

          .cart-title {
            font-size: 34px;
          }

          .home-button {
            min-width: 66px;

            height: 32px;

            padding:
              0 9px;

            gap: 6px;
          }

          .home-text {
            font-size: 6.5px;

            letter-spacing: 0.18em;
          }

          .home-arrow {
            font-size: 11px;
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
            font-size: 13px;
          }

          .price-cell {
            padding-left: 85px;
          }

          .qty-control {
            width: 88px;
          }

          .empty-content h2 {
            font-size: 34px;
          }

          /* SMALL PHONE */

          .explore-button {
            padding:
              9px 10px;

            gap: 7px;
          }

          .explore-number {
            font-size: 5.5px;
          }

          .explore-text {
            font-size: 6px;

            letter-spacing: 0.13em;
          }

          .explore-arrow {
            font-size: 12px;
          }

          .explore-web {
            width: 30px;
            height: 30px;
          }
        }

        @media (prefers-reduced-motion: reduce) {

          *,
          *::before,
          *::after {
            animation-duration:
              0.01ms !important;

            animation-iteration-count:
              1 !important;

            transition-duration:
              0.01ms !important;
          }
        }

      `}</style>

    </main>
  );
}