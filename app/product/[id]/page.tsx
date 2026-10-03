"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPricing } from "@/lib/sale";
import SpiderLoader from "@/app/components/SpiderLoader";

type Product = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  discountPercent: number;
  description: string | null;
  status: string;
  category: {
    name: string;
    slug: string;
  } | null;
};

type ProductImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

type ProductSize = {
  id: string;
  size: string;
  stock: number;
};

type SizeChart = {
  id: string;
  size: string;
  chest: string;
  image_url?: string | null;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  quantity: number;
};

const CART_KEY = "stoked-cart";

/* S, M, L, XL order (alphabetical order would give L, M, S, XL) */
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

function sortSizes(list: ProductSize[]) {
  return [...list].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.size);
    const bi = SIZE_ORDER.indexOf(b.size);

    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

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

const closeBtnStyle: React.CSSProperties = {
  position: "absolute",
  top: "20px",
  right: "20px",
  border: 0,
  background: "transparent",
  color: "rgba(255,255,255,.5)",
  cursor: "pointer",
};

const modalTitleStyle: React.CSSProperties = {
  fontFamily: '"Space Grotesk", sans-serif',
  fontSize: "clamp(42px, 8vw, 78px)",
  lineHeight: ".85",
  letterSpacing: "-.065em",
  marginBottom: "30px",
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [sizeChart, setSizeChart] = useState<SizeChart[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [addedToBag, setAddedToBag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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

  function goTo(path: string) {
    return (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      setMenuOpen(false);
      setAboutOpen(false);
      setContactOpen(false);
      router.push(path);
    };
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

  function openExternal(url: string) {
    return (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      const mobile =
        typeof window !== "undefined" &&
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (mobile) {
        window.location.href = url;
        return;
      }

      window.open(url, "_blank", "noopener,noreferrer");
    };
  }

  const openInstagram = openExternal("https://www.instagram.com/stoked.bd/");
  const openFacebook = openExternal(
    "https://www.facebook.com/share/1ba7vRfxAB/?mibextid=wwXIfr"
  );
  const openTikTok = openExternal("https://www.tiktok.com/@stoked.bd");

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth <= 768);

    updateMobile();
    window.addEventListener("resize", updateMobile);

    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  /* =========================================================
     LOAD PRODUCT
  ========================================================= */

  useEffect(() => {
    if (!productId) return;

    async function loadProduct() {
      setLoading(true);
      setError("");

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          sale_price,
          description,
          status,
          categories (
            name,
            slug
          )
        `)
        .eq("id", productId)
        .single();

      if (productError || !productData) {
        console.error("PRODUCT LOAD ERROR:", productError);

        setError("PRODUCT NOT FOUND.");
        setLoading(false);
        return;
      }

      const category = Array.isArray(productData.categories)
        ? productData.categories[0]
        : productData.categories;

      const pricing = getPricing(
        productData.price,
        (productData as any).sale_price
      );

      setProduct({
        id: productData.id,
        name: productData.name,
        price: pricing.price,
        salePrice: pricing.salePrice,
        discountPercent: pricing.discountPercent,
        description: productData.description,
        status: productData.status,
        category: category
          ? {
              name: category.name,
              slug: category.slug,
            }
          : null,
      });

      const { data: imageData, error: imageError } = await supabase
        .from("product_images")
        .select("id, image_url, sort_order")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true });

      if (imageError) {
        console.error("IMAGE LOAD ERROR:", imageError);
      }

      const loadedImages = imageData || [];

      setImages(loadedImages);

      if (loadedImages.length > 0) {
        setSelectedImage(loadedImages[0].image_url);
      }

      const { data: sizeData, error: sizeError } = await supabase
        .from("product_sizes")
        .select("id, size, stock")
        .eq("product_id", productId);

      if (sizeError) {
        console.error("SIZE LOAD ERROR:", sizeError);
      }

      setSizes(sortSizes((sizeData || []) as ProductSize[]));

      const { data: chartData, error: chartError } = await supabase
        .from("size_charts")
        .select("id, size, chest, image_url")
        .eq("product_id", productId)
        .order("size", { ascending: true });

      if (chartError) {
        console.error("SIZE CHART LOAD ERROR:", chartError);
      }

      setSizeChart(chartData || []);

      setLoading(false);
    }

    loadProduct();
  }, [productId]);

  /* =========================================================
     IMAGE NAVIGATION
  ========================================================= */

  function changeImage(direction: "next" | "prev") {
    if (images.length <= 1) return;

    const currentIndex = images.findIndex(
      (image) => image.image_url === selectedImage
    );

    const safeIndex = currentIndex === -1 ? 0 : currentIndex;

    const nextIndex =
      direction === "next"
        ? (safeIndex + 1) % images.length
        : (safeIndex - 1 + images.length) % images.length;

    setSelectedImage(images[nextIndex].image_url);
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(diffX) < 45) return;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      changeImage(diffX < 0 ? "next" : "prev");
    }
  }

  /* =========================================================
     CART
  ========================================================= */

  function updateCartCount() {
    try {
      const savedCart = localStorage.getItem(CART_KEY);

      if (!savedCart) {
        setCartCount(0);
        return;
      }

      const cart: CartItem[] = JSON.parse(savedCart);

      setCartCount(
        cart.reduce((total, item) => total + Number(item.quantity || 0), 0)
      );
    } catch (err) {
      console.error("CART COUNT ERROR:", err);
      setCartCount(0);
    }
  }

  useEffect(() => {
    updateCartCount();

    const handleCartUpdate = () => updateCartCount();

    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  /* =========================================================
     ADD TO BAG
  ========================================================= */

  function handleAddToBag() {
    if (!product) return;

    // STOCKED OUT product bag e add kora jabe na
    if (product.status !== "AVAILABLE") return;

    const hasSizes = sizes.length > 0;
    const inStock = sizes.filter((size) => size.stock > 0);

    if (hasSizes && inStock.length === 0) return;
    if (hasSizes && !selectedSize) return;

    const selectedSizeData = sizes.find((size) => size.size === selectedSize);

    if (hasSizes && (!selectedSizeData || selectedSizeData.stock <= 0)) {
      return;
    }

    try {
      const savedCart = localStorage.getItem(CART_KEY);

      const cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

      const existingIndex = cart.findIndex(
        (item) =>
          item.id === product.id &&
          (item.size || "") === (selectedSize || "")
      );

      if (existingIndex !== -1) {
        const existingItem = cart[existingIndex];

        const stockLimit = selectedSizeData
          ? selectedSizeData.stock
          : Infinity;

        /* cart e already max stock porjonto ase, ar add kora jabe na */
        if (existingItem.quantity >= stockLimit) {
          setAddedToBag(true);
          setTimeout(() => setAddedToBag(false), 1800);
          return;
        }

        cart[existingIndex] = {
          ...existingItem,
          price: Number(product.salePrice ?? product.price),
          quantity: existingItem.quantity + 1,
        };
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: Number(product.salePrice ?? product.price),
          image: selectedImage || images[0]?.image_url || "",
          size: selectedSize || "",
          quantity: 1,
        });
      }

      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      updateCartCount();

      window.dispatchEvent(new Event("cart-updated"));

      setAddedToBag(true);
      setTimeout(() => setAddedToBag(false), 1800);
    } catch (err) {
      console.error("ADD TO BAG ERROR:", err);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return <SpiderLoader />;
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !product) {
    return (
      <main className="error-page">
        <div className="error-web" />

        <img src={SPIDER_IMAGE} alt="" className="error-spider" />

        <header className="error-header">
          <button onClick={() => router.push("/shop")} className="error-logo">
            STOKED
          </button>

          <span>ERROR / 404</span>
        </header>

        <div className="error-inner">
          <div className="error-number">404</div>

          <div className="error-title">PRODUCT NOT FOUND</div>

          <div className="error-line" />

          <button onClick={() => router.push("/shop")} className="back-button">
            BACK TO SHOP
            <span>→</span>
          </button>
        </div>

        <style jsx>{`
          .error-page {
            min-height: 100vh;
            overflow: hidden;
            position: relative;
            background: radial-gradient(circle at center, rgba(110, 0, 0, 0.18), transparent 38%), #070202;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Inter, sans-serif;
          }
          .error-page::before {
            content: "";
            position: absolute;
            inset: 0;
            opacity: 0.14;
            background-image: linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
            background-size: 75px 75px;
          }
          .error-web {
            position: absolute;
            width: 700px;
            height: 700px;
            right: -320px;
            top: -230px;
            border-radius: 50%;
            opacity: 0.12;
            background: repeating-radial-gradient(circle, transparent 0 55px, rgba(255, 255, 255, 0.13) 56px 57px);
          }
          .error-spider {
            position: absolute;
            width: 170px;
            left: 8%;
            top: 15%;
            opacity: 0.075;
            filter: grayscale(1) drop-shadow(0 0 25px rgba(255, 0, 0, 0.25));
            animation: errorFloat 6s ease-in-out infinite;
          }
          .error-header {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 6vw;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
            color: rgba(255, 255, 255, 0.25);
            font-size: 7px;
            letter-spacing: 0.2em;
          }
          .error-logo {
            border: 0;
            background: transparent;
            color: #fff;
            cursor: pointer;
            font: inherit;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.16em;
          }
          .error-inner {
            position: relative;
            z-index: 2;
            text-align: center;
          }
          .error-number {
            color: rgba(255, 40, 40, 0.16);
            font-size: clamp(100px, 17vw, 210px);
            line-height: 0.8;
            font-weight: 600;
            letter-spacing: -0.09em;
          }
          .error-title {
            margin-top: 30px;
            color: #ff3030;
            font-size: 9px;
            letter-spacing: 0.3em;
          }
          .error-line {
            width: 45px;
            height: 1px;
            margin: 20px auto;
            background: #ff2424;
            box-shadow: 0 0 15px rgba(255, 30, 30, 0.5);
          }
          .back-button {
            display: inline-flex;
            align-items: center;
            gap: 28px;
            border: 1px solid rgba(255, 255, 255, 0.16);
            background: rgba(255, 255, 255, 0.025);
            color: #fff;
            padding: 13px 20px;
            cursor: pointer;
            letter-spacing: 0.16em;
            font-size: 8px;
            transition: 0.3s ease;
          }
          .back-button span {
            color: #ff3030;
            font-size: 13px;
          }
          .back-button:hover {
            border-color: rgba(255, 35, 35, 0.7);
            background: rgba(100, 0, 0, 0.2);
          }
          @keyframes errorFloat {
            0%, 100% { transform: translateY(0) rotate(-5deg); }
            50% { transform: translateY(25px) rotate(5deg); }
          }
          @media (max-width: 600px) {
            .error-spider { width: 100px; left: -5%; top: 18%; }
            .error-header { padding: 0 18px; }
          }
        `}</style>
      </main>
    );
  }

  /* =========================================================
     DERIVED
  ========================================================= */

  const hasSizeSelection = sizes.length > 0;

  const availableSizes = sizes.filter((size) => size.stock > 0);

  /* every size is at 0 stock -> whole product is stocked out */
  const allSizesSoldOut = hasSizeSelection && availableSizes.length === 0;

  const isStockedOut = product.status !== "AVAILABLE" || allSizesSoldOut;

  const selectedSizeData = sizes.find((size) => size.size === selectedSize);

  const cannotAddToBag =
    isStockedOut || (hasSizeSelection && !selectedSize);

  const currentImageIndex = Math.max(
    images.findIndex((image) => image.image_url === selectedImage),
    0
  );

  const navItemPadding = isMobile ? "0 6px" : "0 9px";
  const navFontSize = isMobile ? "7px" : "8px";
  const navLetterSpacing = isMobile ? ".07em" : ".11em";

  return (
    <main className="product-page">
      {/* BACKGROUND */}

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
          <img src={SPIDER_IMAGE} alt="" className="spider spider-1" />
          <img src={SPIDER_IMAGE} alt="" className="spider spider-2" />
          <img src={SPIDER_IMAGE} alt="" className="spider spider-3" />
          <img src={SPIDER_IMAGE} alt="" className="spider spider-4" />
          <img src={SPIDER_IMAGE} alt="" className="spider spider-5" />
        </div>

        <div className="background-grid" />
        <div className="background-glow glow-one" />
        <div className="background-glow glow-two" />
        <div className="red-vignette" />
        <div className="grain" />
      </div>

      {/* HEADER */}

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
          padding: isMobile ? "16px 6vw" : "22px 6vw",
          minHeight: isMobile ? "64px" : "70px",
          zIndex: 2147483640,
          pointerEvents: "none",
        }}
      >
        {/* Logo: same as shop page (style comes from global .mini-logo) */}
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
            minWidth: 0,
            flexShrink: 1,
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
              padding: navItemPadding,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,.72)",
              textDecoration: "none",
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: navFontSize,
              fontWeight: 600,
              letterSpacing: navLetterSpacing,
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
              padding: navItemPadding,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              border: 0,
              borderRadius: "9px",
              background: "transparent",
              color: "rgba(255,255,255,.65)",
              fontFamily: '"Space Grotesk", sans-serif',
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
                background: "rgba(169,21,37,.8)",
              }}
            >
              {String(cartCount).padStart(2, "0")}
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
              padding: navItemPadding,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,.72)",
              background: "rgba(255,255,255,.045)",
              border: 0,
              borderRadius: "9px",
              fontFamily: '"Space Grotesk", sans-serif',
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

      {/* ABOUT */}

      {aboutOpen && (
        <Modal onClose={closeAbout} isMobile={isMobile}>
          <button type="button" onClick={closeAbout} style={closeBtnStyle}>
            CLOSE ×
          </button>

          <div style={modalTitleStyle}>ABOUT</div>

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
            STOKED is a Bangladesh-based fashion label built around bold
            silhouettes, expressive graphics and a darker visual language.
          </p>
        </Modal>
      )}

      {/* CONTACT */}

      {contactOpen && (
        <Modal onClose={closeContact} isMobile={isMobile}>
          <button type="button" onClick={closeContact} style={closeBtnStyle}>
            CLOSE ×
          </button>

          <div style={modalTitleStyle}>CONTACT</div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <button type="button" onClick={openInstagram} style={socialButtonStyle}>
              INSTAGRAM
            </button>

            <button type="button" onClick={openFacebook} style={socialButtonStyle}>
              FACEBOOK
            </button>

            <button type="button" onClick={openTikTok} style={socialButtonStyle}>
              TIKTOK
            </button>
          </div>
        </Modal>
      )}

      {/* MENU */}

      <div
        className={`stoked-menu ${menuOpen ? "stoked-menu-visible" : ""}`}
        aria-hidden={!menuOpen}
        onClick={closeMenu}
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
            <div className="stoked-menu-logo">STOKED</div>

            <button
              type="button"
              className="stoked-menu-close"
              onClick={closeMenu}
            >
              CLOSE <span>×</span>
            </button>
          </div>

          <nav className="stoked-menu-links">
            <button type="button" onClick={goTo("/")}>
              HOME
            </button>

            <button type="button" onClick={goTo("/shop")}>
              SHOP
            </button>

            <button type="button" onClick={goTo("/account")}>
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

      {/* PRODUCT CONTENT */}

      <section className="product-container">
        {/* GALLERY */}

        <div className="gallery-column">
          <div
            className="main-image-wrapper"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="image-red-glow" />

            <div className="image-web-overlay" />

            {selectedImage ? (
              <img
                key={selectedImage}
                src={selectedImage}
                alt={product.name}
                className="main-product-image"
                style={
                  isStockedOut
                    ? { filter: "grayscale(100%)", opacity: 0.5 }
                    : undefined
                }
              />
            ) : (
              <div className="no-image">NO IMAGE</div>
            )}

            {isStockedOut && (
              <div className="stockedout-banner">STOCKED OUT</div>
            )}

            <div className="image-index">
              {String(currentImageIndex + 1).padStart(2, "0")}
            </div>

            <div className="image-category">
              {product.category?.name || "PRODUCT"}
            </div>

            <div className="image-status">
              <span className="status-dot" />

              {isStockedOut ? "STOCKED OUT" : "AVAILABLE"}
            </div>

            {product.salePrice !== null && !isStockedOut && (
              <div className="sale-badge">-{product.discountPercent}%</div>
            )}

            <div className="image-frame frame-top-left" />
            <div className="image-frame frame-top-right" />
            <div className="image-frame frame-bottom-left" />
            <div className="image-frame frame-bottom-right" />

            {images.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    className="gallery-arrow gallery-arrow-left"
                    onClick={() => changeImage("prev")}
                    aria-label="Previous image"
                  >
                    ←
                  </button>
                )}

                {currentImageIndex < images.length - 1 && (
                  <button
                    className="gallery-arrow gallery-arrow-right"
                    onClick={() => changeImage("next")}
                    aria-label="Next image"
                  >
                    →
                  </button>
                )}

                <div className="image-counter">
                  <span>{String(currentImageIndex + 1).padStart(2, "0")}</span>

                  <i />

                  <span>{String(images.length).padStart(2, "0")}</span>
                </div>
              </>
            )}
          </div>

          {/* THUMBNAILS */}

          {images.length > 1 && (
            <div className="thumbnail-scroll">
              <div className="thumbnail-track">
                {images.map((image, index) => {
                  const active = selectedImage === image.image_url;

                  return (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(image.image_url)}
                      className={`thumbnail ${active ? "thumbnail-active" : ""}`}
                    >
                      <img
                        src={image.image_url}
                        alt={`${product.name} ${index + 1}`}
                      />

                      <div className="thumbnail-overlay" />

                      <span className="thumbnail-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="gallery-meta">
            <span>SWIPE / DRAG</span>
            <span>STOKED BD — 2026</span>
          </div>
        </div>

        {/* DETAILS */}

        <div className="details-column">
          <div className="collection-label">
            <span />

            <span>{product.category?.name || "STOKED COLLECTION"}</span>
          </div>

          <h1 className="product-name">{product.name}</h1>

          <div className="name-line">
            <span />
          </div>

          {/* PRICE */}

          <div className="price-section">
            {product.salePrice !== null ? (
              <>
                <span
                  style={{
                    fontSize: "20px",
                    textDecoration: "line-through",
                    opacity: 0.45,
                  }}
                >
                  ৳ {product.price.toLocaleString()}
                </span>

                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: 600,
                    color: "#ff4a4a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  ৳ {product.salePrice.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="price">৳ {product.price.toLocaleString()}</span>
            )}

            <span className="currency">BDT</span>

            {product.salePrice !== null && (
              <span
                style={{
                  marginLeft: "6px",
                  padding: "4px 9px",
                  background: "#a91525",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: 600,
                  letterSpacing: ".15em",
                }}
              >
                -{product.discountPercent}%
              </span>
            )}
          </div>

          {/* SIZE */}

          {sizes.length > 0 && (
            <div className="size-section">
              <div className="section-heading-row">
                <span className="section-heading">SELECT SIZE</span>

                {selectedSize && (
                  <span className="selected-size">
                    SELECTED / {selectedSize}
                  </span>
                )}
              </div>

              <div className="sizes-grid">
                {sizes.map((size) => {
                  const available = size.stock > 0 && !isStockedOut;
                  const selected = selectedSize === size.size;
                  const lowStock = size.stock > 0 && size.stock <= 3;

                  return (
                    <button
                      key={size.id}
                      disabled={!available}
                      onClick={() => setSelectedSize(size.size)}
                      className={`size-button ${
                        selected ? "size-selected" : ""
                      } ${!available ? "size-unavailable" : ""}`}
                    >
                      <span>{size.size}</span>

                      {available ? (
                        <small className={lowStock ? "size-low" : ""}>
                          {size.stock} LEFT
                        </small>
                      ) : (
                        <small>SOLD OUT</small>
                      )}

                      {selected && <span className="size-active-line" />}
                    </button>
                  );
                })}
              </div>

              {/* STOCK LIST: Small: 2 ta ase / Medium: 1 ta ase ... */}

              <div className="stock-list">
                {sizes.map((size) => (
                  <div
                    key={size.id}
                    className={`stock-row ${
                      size.stock > 0 ? "" : "stock-row-out"
                    }`}
                  >
                    <span>{size.size}</span>

                    <span>
                      {size.stock > 0
                        ? `${size.stock} IN STOCK`
                        : "STOCK OUT"}
                    </span>
                  </div>
                ))}
              </div>

              {selectedSizeData && selectedSizeData.stock > 0 && (
                <div className="selected-stock-note">
                  ONLY {selectedSizeData.stock} LEFT IN SIZE{" "}
                  {selectedSizeData.size}
                </div>
              )}
            </div>
          )}

          <div className="details-divider">
            <span />
          </div>

          {/* DESCRIPTION */}

          {product.description && (
            <div className="description-section">
              <div className="section-heading">DETAILS</div>

              <p className="description">{product.description}</p>
            </div>
          )}

          {/* SIZE CHART */}

          {sizeChart.length > 0 && (
            <div className="size-chart-section">
              <div className="section-heading-row">
                <span className="section-heading">SIZE CHART</span>

                <span className="measurements">MEASUREMENTS / CM</span>
              </div>

              {sizeChart.some((item) => item.image_url) ? (
                <div className="size-chart-images">
                  {sizeChart
                    .filter((item) => item.image_url)
                    .map((item) => (
                      <img
                        key={item.id}
                        src={item.image_url!}
                        alt="Size chart"
                      />
                    ))}
                </div>
              ) : (
                <div className="size-table-wrapper">
                  <table className="size-table">
                    <thead>
                      <tr>
                        <th>SIZE</th>
                        <th>CHEST</th>
                      </tr>
                    </thead>

                    <tbody>
                      {sizeChart.map((item) => (
                        <tr key={item.id}>
                          <td>{item.size}</td>
                          <td>{item.chest || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ADD TO BAG */}

          <button
            disabled={cannotAddToBag}
            onClick={handleAddToBag}
            className={`add-to-bag ${
              !cannotAddToBag ? "add-to-bag-active" : ""
            } ${addedToBag ? "add-to-bag-success" : ""}`}
          >
            <span>
              {isStockedOut
                ? "STOCKED OUT"
                : addedToBag
                ? "ADDED TO BAG"
                : hasSizeSelection && !selectedSize
                ? "SELECT SIZE"
                : "ADD TO BAG"}
            </span>

            <span className="bag-arrow">{addedToBag ? "✓" : "→"}</span>
          </button>

          {/* INFO */}

          <div className="info-grid">
            {[
              ["01", "STOKED BD"],
              ["02", "AUTHENTIC"],
              ["03", "SECURE"],
            ].map(([number, label]) => (
              <div key={number} className="info-card">
                <div className="info-number">{number}</div>

                <div className="info-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="product-footer">
        <div className="footer-left">
          <span className="footer-mark">✦</span>
          STOKED BD
        </div>

        <div className="footer-center">SPIDER COLLECTION / 2026</div>

        <div className="footer-right">EST. 2026</div>
      </footer>

      {/* STYLES */}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .product-page {
          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background: radial-gradient(circle at 50% 0%, rgba(120, 0, 0, 0.17), transparent 35%), #080303;
          color: #f5f5f3;
          font-family: Inter, Arial, sans-serif;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 35, 35, 0.5) transparent;
        }

        /* STOCKED OUT BANNER */

        .stockedout-banner {
          position: absolute;
          z-index: 9;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 14px 30px;
          background: rgba(8, 3, 3, 0.85);
          border: 1px solid rgba(169, 21, 37, 0.9);
          color: #ff4a4a;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.3em;
          white-space: nowrap;
          pointer-events: none;
        }

        /* BACKGROUND */

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
          background: radial-gradient(circle at 50% 45%, transparent 0, rgba(0, 0, 0, 0.15) 55%, rgba(0, 0, 0, 0.45) 100%);
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
          background: repeating-radial-gradient(circle, transparent 0 40px, rgba(255, 255, 255, 0.13) 41px 42px);
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
          background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.13), transparent);
          transform-origin: center;
        }

        .web-line-1 { transform: rotate(0deg); }
        .web-line-2 { transform: rotate(30deg); }
        .web-line-3 { transform: rotate(60deg); }
        .web-line-4 { transform: rotate(90deg); }
        .web-line-5 { transform: rotate(120deg); }

        .web-ring {
          position: absolute;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 50%;
          inset: 25%;
        }

        .web-ring-1 { inset: 17%; }
        .web-ring-2 { inset: 35%; }
        .web-ring-3 { inset: 53%; }

        .spider-field {
          position: absolute;
          inset: 0;
        }

        .spider {
          position: absolute;
          object-fit: contain;
          opacity: 0.075;
          filter: grayscale(1) drop-shadow(0 0 22px rgba(255, 0, 0, 0.2));
          animation: spiderFloat 8s ease-in-out infinite;
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

        .background-grid {
          position: absolute;
          inset: 0;
          opacity: 0.18;
          background-image: linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
          background-size: 75px 75px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
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
          box-shadow: inset 0 0 180px rgba(80, 0, 0, 0.2);
        }

        .grain {
          position: absolute;
          inset: 0;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
        }

        /* MENU */

        .stoked-menu-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9998;
          background: rgba(0, 0, 0, 0.42);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 0.45s ease, visibility 0.45s ease;
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
        }

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
          transition: opacity 0.35s ease, visibility 0.35s ease !important;
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
          background: linear-gradient(135deg, rgba(35, 5, 5, 0.98), rgba(7, 2, 2, 0.99)) !important;
          border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
          transform: translateX(105%) !important;
          transition: transform 0.65s cubic-bezier(0.76, 0, 0.24, 1) !important;
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
          transition: opacity 0.25s ease, transform 0.25s ease !important;
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
          transition: background 0.35s ease, border-color 0.35s ease, color 0.35s ease, padding-left 0.35s ease, box-shadow 0.35s ease !important;
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

        .stoked-menu-links button:nth-child(2)::before { content: "02" !important; }
        .stoked-menu-links button:nth-child(3)::before { content: "03" !important; }
        .stoked-menu-links button:nth-child(4)::before { content: "04" !important; }
        .stoked-menu-links button:nth-child(5)::before { content: "05" !important; }

        .stoked-menu-links button:hover {
          color: white !important;
          padding-left: 22px !important;
          background: linear-gradient(90deg, rgba(130, 0, 0, 0.18), rgba(255, 255, 255, 0.025)) !important;
          border-color: rgba(150, 0, 0, 0.3) !important;
          box-shadow: inset 2px 0 0 rgba(150, 0, 0, 0.85), 0 8px 30px rgba(0, 0, 0, 0.18) !important;
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
          .stoked-menu {
            pointer-events: none !important;
          }
          .stoked-menu.stoked-menu-visible {
            pointer-events: auto !important;
          }
        }

        /* PRODUCT CONTAINER */

        .product-container {
          position: relative;
          z-index: 2;
          width: min(1500px, 100%);
          margin: 0 auto;
          padding: 65px 6vw 100px;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(370px, 0.95fr);
          gap: clamp(45px, 6vw, 95px);
          align-items: start;
        }

        /* GALLERY */

        .gallery-column {
          min-width: 0;
          animation: galleryReveal 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }

        .main-image-wrapper {
          position: relative;
          width: min(100%, 760px);
          aspect-ratio: 1 / 1;
          overflow: hidden;
          isolation: isolate;
          background: #0b0404;
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow: 0 35px 100px rgba(0, 0, 0, 0.55), 0 0 90px rgba(110, 0, 0, 0.1);
          touch-action: pan-y;
          margin-right: auto;
        }

        .main-image-wrapper::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          background: linear-gradient(120deg, rgba(255, 255, 255, 0.055), transparent 20%, transparent 80%, rgba(255, 0, 0, 0.035));
        }

        .main-image-wrapper::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.08), transparent 30%, transparent 65%, rgba(0, 0, 0, 0.3));
        }

        .image-web-overlay {
          position: absolute;
          inset: -15%;
          z-index: 3;
          pointer-events: none;
          opacity: 0.12;
          background: repeating-radial-gradient(circle at 50% 50%, transparent 0 65px, rgba(255, 255, 255, 0.11) 66px 67px);
          mask-image: linear-gradient(135deg, transparent, black 35%, black 65%, transparent);
        }

        .image-red-glow {
          position: absolute;
          inset: 7%;
          z-index: 0;
          background: radial-gradient(circle, rgba(190, 0, 0, 0.18), transparent 68%);
          filter: blur(50px);
          pointer-events: none;
        }

        .main-product-image {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          animation: imageReveal 0.55s cubic-bezier(0.2, 0.7, 0.2, 1);
          transition: transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1);
        }

        .main-image-wrapper:hover .main-product-image {
          transform: scale(1.025);
        }

        .no-image {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.25);
          font-size: 9px;
          letter-spacing: 0.2em;
        }

        .image-index {
          position: absolute;
          z-index: 7;
          left: 24px;
          bottom: 21px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 8px;
          letter-spacing: 0.16em;
          mix-blend-mode: difference;
        }

        .image-category {
          position: absolute;
          z-index: 7;
          left: 24px;
          top: 21px;
          color: rgba(255, 255, 255, 0.52);
          font-size: 7px;
          letter-spacing: 0.2em;
          mix-blend-mode: difference;
        }

        .image-status {
          position: absolute;
          z-index: 7;
          right: 24px;
          top: 21px;
          display: flex;
          align-items: center;
          gap: 7px;
          color: rgba(255, 255, 255, 0.52);
          font-size: 7px;
          letter-spacing: 0.15em;
        }

        .sale-badge {
          position: absolute;
          z-index: 9;
          left: 24px;
          top: 50px;
          padding: 6px 10px;
          background: #a91525;
          color: #fff;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.15em;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ff2525;
          box-shadow: 0 0 13px rgba(255, 30, 30, 0.9);
        }

        .image-frame {
          position: absolute;
          z-index: 8;
          width: 22px;
          height: 22px;
          pointer-events: none;
        }

        .frame-top-left {
          left: 13px;
          top: 13px;
          border-left: 1px solid rgba(255, 40, 40, 0.65);
          border-top: 1px solid rgba(255, 40, 40, 0.65);
        }

        .frame-top-right {
          right: 13px;
          top: 13px;
          border-right: 1px solid rgba(255, 40, 40, 0.65);
          border-top: 1px solid rgba(255, 40, 40, 0.65);
        }

        .frame-bottom-left {
          left: 13px;
          bottom: 13px;
          border-left: 1px solid rgba(255, 40, 40, 0.65);
          border-bottom: 1px solid rgba(255, 40, 40, 0.65);
        }

        .frame-bottom-right {
          right: 13px;
          bottom: 13px;
          border-right: 1px solid rgba(255, 40, 40, 0.65);
          border-bottom: 1px solid rgba(255, 40, 40, 0.65);
        }

        .gallery-arrow {
          position: absolute;
          z-index: 10;
          top: 50%;
          width: 44px;
          height: 44px;
          transform: translateY(-50%);
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(5, 1, 1, 0.45);
          backdrop-filter: blur(10px);
          color: #fff;
          cursor: pointer;
          opacity: 0;
          transition: 0.3s ease;
        }

        .gallery-arrow-left { left: 18px; }
        .gallery-arrow-right { right: 18px; }

        .main-image-wrapper:hover .gallery-arrow {
          opacity: 1;
        }

        .gallery-arrow:hover {
          border-color: rgba(255, 35, 35, 0.8);
          background: rgba(100, 0, 0, 0.55);
        }

        .image-counter {
          position: absolute;
          z-index: 7;
          right: 24px;
          bottom: 21px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.58);
          font-size: 8px;
          letter-spacing: 0.16em;
          mix-blend-mode: difference;
          pointer-events: none;
        }

        .image-counter i {
          width: 18px;
          height: 1px;
          background: rgba(255, 255, 255, 0.45);
        }

        /* THUMBNAILS */

        .thumbnail-scroll {
          width: 100%;
          margin-top: 13px;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
        }

        .thumbnail-scroll::-webkit-scrollbar {
          display: none;
        }

        .thumbnail-track {
          display: flex;
          width: max-content;
          min-width: 0;
          gap: 8px;
        }

        .thumbnail {
          position: relative;
          flex: 0 0 62px;
          width: 62px;
          height: 62px;
          min-width: 0;
          aspect-ratio: 1 / 1;
          padding: 0;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background: #0d0505;
          cursor: pointer;
          opacity: 0.45;
          transition: 0.3s ease;
        }

        .thumbnail:hover {
          opacity: 0.85;
          border-color: rgba(255, 50, 50, 0.45);
        }

        .thumbnail-active {
          opacity: 1;
          border-color: #ff2424;
          box-shadow: 0 0 22px rgba(255, 25, 25, 0.1), inset 0 0 18px rgba(255, 25, 25, 0.04);
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .thumbnail:hover img {
          transform: scale(1.06);
        }

        .thumbnail-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent 45%);
          pointer-events: none;
        }

        .thumbnail-number {
          position: absolute;
          z-index: 2;
          left: 8px;
          bottom: 7px;
          color: #fff;
          font-size: 7px;
          letter-spacing: 0.1em;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.9);
        }

        .gallery-meta {
          display: flex;
          justify-content: space-between;
          margin-top: 11px;
          color: rgba(255, 255, 255, 0.23);
          font-size: 6px;
          letter-spacing: 0.18em;
        }

        /* DETAILS */

        .details-column {
          min-width: 0;
          padding-top: 10px;
          animation: detailsReveal 0.8s 0.08s cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }

        /* CATEGORY LABEL (above product name) — bigger */
        .collection-label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 22px;
          color: #ff3030;
          font-size: 9.6px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
        }

        .collection-label > span:first-child {
          width: 28px;
          height: 1px;
          background: #ff2929;
          box-shadow: 0 0 10px rgba(255, 41, 41, 0.45);
        }

        /* PRODUCT NAME — 20% smaller */
        .product-name {
          max-width: 800px;
          margin: 0 0 18px;
          color: #f5f5f3;
          font-size: clamp(34px, 4vw, 62px);
          line-height: 0.9;
          font-weight: 500;
          letter-spacing: -0.055em;
          text-transform: uppercase;
          word-break: break-word;
        }

        .name-line {
          width: 100%;
          height: 1px;
          margin-bottom: 28px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.14), transparent);
        }

        .name-line span {
          display: block;
          width: 55px;
          height: 1px;
          background: #ff2929;
          box-shadow: 0 0 12px rgba(255, 35, 35, 0.6);
        }

        /* PRICE */

        .price-section {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 28px;
        }

        .price {
          color: #fff;
          font-size: 26px;
          font-weight: 500;
          letter-spacing: -0.02em;
        }

        .currency {
          color: rgba(255, 255, 255, 0.3);
          font-size: 8px;
          letter-spacing: 0.18em;
        }

        /* SIZE */

        .size-section {
          margin-bottom: 31px;
        }

        .section-heading-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 13px;
        }

        .section-heading {
          color: rgba(255, 255, 255, 0.88);
          font-size: 9.6px;
          letter-spacing: 0.2em;
        }

        .selected-size {
          color: #ff3030;
          font-size: 8.4px;
          letter-spacing: 0.15em;
        }

        .sizes-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .size-button {
          position: relative;
          height: 58px;
          border: 1px solid rgba(255, 255, 255, 0.11);
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.012));
          color: #fff;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.15em;
          transition: 0.25s ease;
        }

        .size-button:hover:not(:disabled) {
          border-color: rgba(255, 45, 45, 0.55);
          background: rgba(100, 0, 0, 0.18);
          transform: translateY(-1px);
        }

        .size-selected {
          border-color: #ff2424;
          background: linear-gradient(145deg, rgba(145, 0, 0, 0.5), rgba(60, 0, 0, 0.3));
          box-shadow: 0 0 25px rgba(255, 30, 30, 0.09), inset 0 0 20px rgba(255, 30, 30, 0.04);
        }

        .size-unavailable {
          color: rgba(255, 255, 255, 0.22);
          opacity: 0.5;
          cursor: not-allowed;
        }

        .size-button small {
          display: block;
          margin-top: 4px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 6px;
          letter-spacing: 0.12em;
        }

        .size-unavailable small {
          color: rgba(255, 255, 255, 0.28);
        }

        .size-button small.size-low {
          color: #ff4a4a;
        }

        .size-active-line {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 2px;
          background: #ff2424;
          box-shadow: 0 0 10px rgba(255, 36, 36, 0.8);
        }

        /* STOCK LIST */

        .stock-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1px;
          margin-top: 14px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .stock-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 11px 13px;
          background: #090303;
          color: rgba(255, 255, 255, 0.62);
          font-size: 8.4px;
          letter-spacing: 0.14em;
        }

        .stock-row span:first-child {
          color: #fff;
          font-weight: 600;
        }

        .stock-row-out span {
          color: #ff4a4a !important;
        }

        .selected-stock-note {
          margin-top: 12px;
          color: #ff3030;
          font-size: 8.4px;
          letter-spacing: 0.16em;
        }

        /* DIVIDER */

        .details-divider {
          width: 100%;
          height: 1px;
          margin-bottom: 30px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.14), transparent);
        }

        .details-divider span {
          display: block;
          width: 35px;
          height: 1px;
          background: #ff2424;
        }

        /* DESCRIPTION */

        .description-section {
          max-width: 650px;
          margin-bottom: 38px;
        }

        .description {
          margin: 12px 0 0;
          color: rgba(255, 255, 255, 0.62);
          font-size: 14.4px;
          line-height: 1.85;
          white-space: pre-line;
        }

        /* SIZE CHART */

        .size-chart-section {
          margin-bottom: 32px;
          padding-top: 26px;
          border-top: 1px solid rgba(255, 255, 255, 0.09);
        }

        .measurements {
          color: rgba(255, 255, 255, 0.3);
          font-size: 8.4px;
          letter-spacing: 0.15em;
        }

        .size-chart-images {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .size-chart-images img {
          width: 100%;
          height: auto;
          display: block;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #0b0404;
        }

        .size-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.018);
        }

        .size-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.8px;
        }

        .size-table th {
          padding: 13px 12px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.09);
          color: rgba(255, 255, 255, 0.4);
          font-weight: 400;
          letter-spacing: 0.14em;
        }

        .size-table td {
          padding: 13px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.055);
          color: rgba(255, 255, 255, 0.55);
        }

        .size-table td:first-child {
          color: #fff;
        }

        /* ADD TO BAG */

        .add-to-bag {
          position: relative;
          width: 100%;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.035);
          color: #fff;
          font-family: inherit;
          font-size: 9.6px;
          font-weight: 600;
          letter-spacing: 0.25em;
          cursor: not-allowed;
          opacity: 0.45;
          transition: 0.35s ease;
        }

        .bag-arrow {
          font-size: 15px;
          letter-spacing: 0;
        }

        .add-to-bag-active {
          border-color: rgba(255, 48, 48, 0.8);
          background: linear-gradient(105deg, #720606, #b20a0a, #720606);
          background-size: 200% 100%;
          box-shadow: 0 12px 35px rgba(110, 0, 0, 0.22);
          cursor: pointer;
          opacity: 1;
          animation: buttonShine 4s ease-in-out infinite;
        }

        .add-to-bag-active:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 42px rgba(110, 0, 0, 0.32), 0 0 25px rgba(255, 30, 30, 0.08);
        }

        .add-to-bag-success {
          background: linear-gradient(105deg, #075c18, #0b8a27, #075c18);
        }

        /* INFO */

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          margin-top: 25px;
          background: rgba(255, 255, 255, 0.08);
        }

        .info-card {
          min-width: 0;
          padding: 16px 12px;
          background: #090303;
        }

        .info-number {
          margin-bottom: 6px;
          color: #ff3030;
          font-size: 8.4px;
          letter-spacing: 0.15em;
        }

        .info-label {
          color: rgba(255, 255, 255, 0.42);
          font-size: 8.4px;
          letter-spacing: 0.13em;
        }

        /* FOOTER */

        .product-footer {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 25px 6vw;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          color: rgba(255, 255, 255, 0.3);
          font-size: 7px;
          letter-spacing: 0.18em;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-mark {
          color: #ff2929;
        }

        .footer-center {
          color: rgba(255, 255, 255, 0.2);
        }

        .footer-right {
          justify-self: end;
        }

        /* ANIMATIONS */

        @keyframes galleryReveal {
          from { opacity: 0; transform: translateX(-25px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes detailsReveal {
          from { opacity: 0; transform: translateX(25px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes imageReveal {
          from { opacity: 0; transform: scale(1.035); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes buttonShine {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* TABLET */

        @media (max-width: 900px) {
          .product-container {
            grid-template-columns: 1fr;
            gap: 48px;
            padding: 45px 6vw 90px;
          }
          .details-column {
            padding-top: 0;
          }
          .product-name {
            font-size: clamp(34px, 6.4vw, 56px);
          }
          .gallery-arrow {
            opacity: 1;
          }
        }

        /* MOBILE */

        @media (max-width: 600px) {
          .product-container {
            display: flex;
            flex-direction: column;
            gap: 35px;
            padding: 25px 6vw 70px;
          }
          .stockedout-banner { padding: 10px 18px; font-size: 11px; letter-spacing: 0.22em; }
          .background-grid { background-size: 55px 55px; }
          .background-web { width: 350px; height: 350px; }
          .background-web-left { left: -250px; top: -100px; }
          .background-web-right { right: -250px; bottom: -100px; }
          .spider-1 { width: 72px; left: -5%; top: 10%; }
          .spider-2 { width: 58px; right: -3%; top: 17%; }
          .spider-3 { width: 45px; left: -2%; top: 48%; }
          .spider-4 { width: 62px; right: -4%; top: 55%; }
          .spider-5 { width: 48px; left: 38%; bottom: 3%; }
          .main-image-wrapper {
            width: 100%;
            max-width: none;
            aspect-ratio: 0.92 / 1;
          }
          .main-image-wrapper:hover .main-product-image { transform: none; }
          .image-web-overlay { opacity: 0.09; }
          .image-category { left: 15px; top: 15px; font-size: 6px; }
          .image-status { right: 15px; top: 15px; font-size: 6px; }
          .sale-badge { left: 15px; top: 38px; }
          .image-index { left: 15px; bottom: 15px; font-size: 7px; }
          .image-counter { right: 15px; bottom: 15px; font-size: 7px; }
          .gallery-arrow { width: 36px; height: 36px; opacity: 1; font-size: 12px; }
          .gallery-arrow-left { left: 10px; }
          .gallery-arrow-right { right: 10px; }
          .thumbnail-scroll { margin-top: 10px; padding-bottom: 3px; }
          .thumbnail { flex: 0 0 56px; width: 56px; height: 56px; }
          .thumbnail-number { left: 6px; bottom: 5px; font-size: 6px; }
          .gallery-meta { font-size: 5px; }
          .details-column { display: flex; flex-direction: column; padding: 0; }
          .collection-label { margin-bottom: 14px; font-size: 8.4px; }
          .collection-label > span:first-child { width: 18px; }
          .product-name { margin: 0 0 16px; font-size: clamp(29px, 8.8vw, 43px); line-height: 0.92; }
          .name-line { margin-bottom: 23px; }
          .price-section { margin-bottom: 25px; }
          .price { font-size: 22px; }
          .size-section { margin-bottom: 27px; }
          .sizes-grid { grid-template-columns: repeat(4, 1fr); }
          .size-button { height: 54px; }
          .stock-row { padding: 10px 11px; font-size: 7.8px; }
          .details-divider { margin-bottom: 25px; }
          .description-section { margin-bottom: 30px; }
          .description { font-size: 13.2px; line-height: 1.8; }
          .size-chart-section { margin-bottom: 28px; padding-top: 23px; }
          .add-to-bag { height: 59px; }
          .info-grid { margin-top: 22px; }
          .product-footer { grid-template-columns: 1fr 1fr; padding: 22px 6vw; font-size: 6px; }
          .footer-center { display: none; }
          .footer-right { justify-self: end; }
        }

        /* SMALL MOBILE */

        @media (max-width: 390px) {
          .product-container {
            padding-left: 14px;
            padding-right: 14px;
          }
          .thumbnail { flex-basis: 52px; width: 52px; height: 52px; }
          .sizes-grid { gap: 6px; }
          .size-button { font-size: 10px; }
          .collection-label { font-size: 7.2px; }
          .product-name { font-size: 27px; }
          .spider-1 { left: -12%; }
          .spider-2 { right: -10%; }
          .spider-3 { left: -8%; }
          .spider-4 { right: -10%; }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  onClose,
  isMobile,
  children,
}: {
  onClose: (e?: React.MouseEvent) => void;
  isMobile: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClose}
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
        {children}
      </div>
    </div>
  );
}