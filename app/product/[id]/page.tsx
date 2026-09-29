"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  price: number;
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

/* =========================================================
   SPIDER SVG
========================================================= */

function SpiderIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="spider-svg"
      aria-hidden="true"
    >
      <ellipse
        cx="60"
        cy="64"
        rx="13"
        ry="19"
        fill="currentColor"
      />

      <circle
        cx="60"
        cy="41"
        r="11"
        fill="currentColor"
      />

      <path
        d="M49 47 C37 40 27 30 16 19"
        stroke="currentColor"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M48 53 C32 49 20 44 7 37"
        stroke="currentColor"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M48 62 C31 61 17 64 5 69"
        stroke="currentColor"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M49 70 C36 77 26 87 16 100"
        stroke="currentColor"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M71 47 C83 40 93 30 104 19"
        stroke="currentColor"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M72 53 C88 49 100 44 113 37"
        stroke="currentColor"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M72 62 C89 61 103 64 115 69"
        stroke="currentColor"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M71 70 C84 77 95 87 105 100"
        stroke="currentColor"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      <circle
        cx="56"
        cy="40"
        r="2"
        fill="#ff3030"
      />

      <circle
        cx="64"
        cy="40"
        r="2"
        fill="#ff3030"
      />
    </svg>
  );
}

/* =========================================================
   WEB SHOOTER
========================================================= */

function WebShooter({
  className,
}: {
  className: string;
}) {
  return (
    <div className={`web-shooter ${className}`}>
      <span className="shooter-core" />
      <span className="shooter-thread thread-one" />
      <span className="shooter-thread thread-two" />
      <span className="shooter-thread thread-three" />
      <span className="shooter-burst" />
    </div>
  );
}

/* =========================================================
   PRODUCT PAGE
========================================================= */

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params?.id as string;

  const [product, setProduct] =
    useState<Product | null>(null);

  const [images, setImages] =
    useState<ProductImage[]>([]);

  const [sizes, setSizes] =
    useState<ProductSize[]>([]);

  const [sizeChart, setSizeChart] =
    useState<SizeChart[]>([]);

  const [selectedImage, setSelectedImage] =
    useState("");

  const [selectedSize, setSelectedSize] =
    useState("");

  const [cartCount, setCartCount] =
    useState(0);

  const [addedToBag, setAddedToBag] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const touchStartX =
    useRef<number | null>(null);

  const touchStartY =
    useRef<number | null>(null);

  /* =========================================================
     LOAD PRODUCT
  ========================================================= */

  useEffect(() => {
    if (!productId) return;

    async function loadProduct() {
      setLoading(true);
      setError("");

      const {
        data: productData,
        error: productError,
      } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
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
        console.error(
          "PRODUCT LOAD ERROR:",
          productError
        );

        setError("PRODUCT NOT FOUND.");
        setLoading(false);
        return;
      }

      const category = Array.isArray(
        productData.categories
      )
        ? productData.categories[0]
        : productData.categories;

      setProduct({
        id: productData.id,
        name: productData.name,
        price: Number(productData.price),
        description: productData.description,
        status: productData.status,
        category: category
          ? {
              name: category.name,
              slug: category.slug,
            }
          : null,
      });

      const {
        data: imageData,
        error: imageError,
      } = await supabase
        .from("product_images")
        .select(
          "id, image_url, sort_order"
        )
        .eq("product_id", productId)
        .order("sort_order", {
          ascending: true,
        });

      if (imageError) {
        console.error(
          "IMAGE LOAD ERROR:",
          imageError
        );
      }

      const loadedImages =
        imageData || [];

      setImages(loadedImages);

      if (loadedImages.length > 0) {
        setSelectedImage(
          loadedImages[0].image_url
        );
      }

      const {
        data: sizeData,
        error: sizeError,
      } = await supabase
        .from("product_sizes")
        .select(
          "id, size, stock"
        )
        .eq("product_id", productId)
        .order("size", {
          ascending: true,
        });

      if (sizeError) {
        console.error(
          "SIZE LOAD ERROR:",
          sizeError
        );
      }

      setSizes(sizeData || []);

      const {
        data: chartData,
        error: chartError,
      } = await supabase
        .from("size_charts")
        .select(
          "id, size, chest, image_url"
        )
        .eq("product_id", productId)
        .order("size", {
          ascending: true,
        });

      if (chartError) {
        console.error(
          "SIZE CHART LOAD ERROR:",
          chartError
        );
      }

      setSizeChart(chartData || []);

      setLoading(false);
    }

    loadProduct();
  }, [productId]);

  /* =========================================================
     IMAGE NAVIGATION
  ========================================================= */

  function changeImage(
    direction: "next" | "prev"
  ) {
    if (images.length <= 1) return;

    const currentIndex =
      images.findIndex(
        (image) =>
          image.image_url ===
          selectedImage
      );

    const safeIndex =
      currentIndex === -1
        ? 0
        : currentIndex;

    const nextIndex =
      direction === "next"
        ? (safeIndex + 1) %
          images.length
        : (safeIndex - 1 +
            images.length) %
          images.length;

    setSelectedImage(
      images[nextIndex].image_url
    );
  }

  function handleTouchStart(
    e: React.TouchEvent<HTMLDivElement>
  ) {
    touchStartX.current =
      e.touches[0].clientX;

    touchStartY.current =
      e.touches[0].clientY;
  }

  function handleTouchEnd(
    e: React.TouchEvent<HTMLDivElement>
  ) {
    if (
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return;
    }

    const endX =
      e.changedTouches[0].clientX;

    const endY =
      e.changedTouches[0].clientY;

    const diffX =
      endX - touchStartX.current;

    const diffY =
      endY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(diffX) < 45) return;

    if (
      Math.abs(diffX) >
      Math.abs(diffY)
    ) {
      if (diffX < 0) {
        changeImage("next");
      } else {
        changeImage("prev");
      }
    }
  }

  /* =========================================================
     CART
  ========================================================= */

  function updateCartCount() {
    try {
      const savedCart =
        localStorage.getItem(
          CART_KEY
        );

      if (!savedCart) {
        setCartCount(0);
        return;
      }

      const cart: CartItem[] =
        JSON.parse(savedCart);

      const totalItems =
        cart.reduce(
          (total, item) =>
            total +
            Number(
              item.quantity || 0
            ),
          0
        );

      setCartCount(totalItems);
    } catch (error) {
      console.error(
        "CART COUNT ERROR:",
        error
      );

      setCartCount(0);
    }
  }

  useEffect(() => {
    updateCartCount();

    const handleCartUpdate =
      () => {
        updateCartCount();
      };

    window.addEventListener(
      "cart-updated",
      handleCartUpdate
    );

    window.addEventListener(
      "storage",
      handleCartUpdate
    );

    return () => {
      window.removeEventListener(
        "cart-updated",
        handleCartUpdate
      );

      window.removeEventListener(
        "storage",
        handleCartUpdate
      );
    };
  }, []);

  /* =========================================================
     ADD TO BAG
  ========================================================= */

  function handleAddToBag() {
    if (!product) return;

    if (
      product.status !==
      "AVAILABLE"
    ) {
      return;
    }

    const hasSizes =
      sizes.length > 0;

    const availableSizes =
      sizes.filter(
        (size) =>
          size.stock > 0
      );

    if (
      hasSizes &&
      availableSizes.length === 0
    ) {
      return;
    }

    if (
      hasSizes &&
      !selectedSize
    ) {
      return;
    }

    const selectedSizeData =
      sizes.find(
        (size) =>
          size.size ===
          selectedSize
      );

    if (
      hasSizes &&
      (!selectedSizeData ||
        selectedSizeData.stock <= 0)
    ) {
      return;
    }

    try {
      const savedCart =
        localStorage.getItem(
          CART_KEY
        );

      const cart: CartItem[] =
        savedCart
          ? JSON.parse(savedCart)
          : [];

      const existingIndex =
        cart.findIndex(
          (item) =>
            item.id ===
              product.id &&
            (item.size || "") ===
              (selectedSize || "")
        );

      if (
        existingIndex !== -1
      ) {
        const existingItem =
          cart[existingIndex];

        const stockLimit =
          selectedSizeData
            ? selectedSizeData.stock
            : Infinity;

        if (
          existingItem.quantity >=
          stockLimit
        ) {
          setAddedToBag(true);

          setTimeout(() => {
            setAddedToBag(false);
          }, 1800);

          return;
        }

        cart[existingIndex] = {
          ...existingItem,
          quantity:
            existingItem.quantity +
            1,
        };
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: Number(
            product.price
          ),
          image:
            selectedImage ||
            images[0]
              ?.image_url ||
            "",
          size:
            selectedSize || "",
          quantity: 1,
        });
      }

      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
      );

      updateCartCount();

      window.dispatchEvent(
        new Event("cart-updated")
      );

      setAddedToBag(true);

      setTimeout(() => {
        setAddedToBag(false);
      }, 1800);
    } catch (error) {
      console.error(
        "ADD TO BAG ERROR:",
        error
      );
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="loading-page">
        <div className="loading-web" />

        <div className="loading-spider">
          <SpiderIcon />
        </div>

        <div className="loading-content">
          <div className="loading-brand">
            STOKED
          </div>

          <div className="loading-text">
            LOADING PRODUCT
          </div>
        </div>

        <style jsx>{`
          .loading-page {
            position: fixed;
            inset: 0;
            overflow: hidden;
            background:
              radial-gradient(
                circle at center,
                rgba(120, 0, 0, 0.2),
                transparent 38%
              ),
              #070202;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Inter, sans-serif;
          }

          .loading-web {
            position: absolute;
            inset: -40%;
            opacity: 0.18;
            background:
              repeating-radial-gradient(
                circle at center,
                transparent 0 55px,
                rgba(255, 255, 255, 0.08) 56px 57px
              );
            animation:
              loadingSpin 20s linear infinite;
          }

          .loading-spider {
            position: absolute;
            width: 100px;
            height: 100px;
            left: calc(50% - 50px);
            top: calc(50% - 85px);
            color: rgba(255, 255, 255, 0.16);
            filter:
              drop-shadow(
                0 0 20px
                rgba(255, 0, 0, 0.25)
              );
            animation:
              loadingFloat 2s ease-in-out infinite;
          }

          .loading-spider :global(.spider-svg) {
            width: 100%;
            height: 100%;
          }

          .loading-content {
            position: relative;
            z-index: 2;
            margin-top: 125px;
            text-align: center;
          }

          .loading-brand {
            font-size: 13px;
            letter-spacing: 0.3em;
          }

          .loading-text {
            margin-top: 8px;
            color:
              rgba(255, 255, 255, 0.35);
            font-size: 7px;
            letter-spacing: 0.25em;
          }

          @keyframes loadingSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @keyframes loadingFloat {
            0%,
            100% {
              transform:
                translateY(0)
                rotate(-4deg);
            }

            50% {
              transform:
                translateY(12px)
                rotate(4deg);
            }
          }
        `}</style>
      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !product) {
    return (
      <main className="error-page">
        <div className="error-web" />

        <div className="error-spider">
          <SpiderIcon />
        </div>

        <div className="error-inner">
          <div className="error-mark">
            404
          </div>

          <div className="error-title">
            PRODUCT NOT FOUND
          </div>

          <div className="error-line" />

          <button
            onClick={() =>
              router.push("/shop")
            }
            className="back-button"
          >
            BACK TO SHOP
          </button>
        </div>

        <style jsx>{`
          .error-page {
            min-height: 100vh;
            overflow: hidden;
            position: relative;
            background:
              radial-gradient(
                circle at center,
                rgba(110, 0, 0, 0.18),
                transparent 38%
              ),
              #070202;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Inter, sans-serif;
          }

          .error-web {
            position: absolute;
            inset: -40%;
            opacity: 0.12;
            background:
              repeating-radial-gradient(
                circle,
                transparent 0 65px,
                rgba(255, 255, 255, 0.08) 66px 67px
              );
          }

          .error-spider {
            position: absolute;
            width: 160px;
            height: 160px;
            top: 8%;
            right: 10%;
            color:
              rgba(255, 255, 255, 0.08);
            filter:
              blur(1px)
              drop-shadow(
                0 0 25px
                rgba(255, 0, 0, 0.1)
              );
            animation:
              errorFloat 5s ease-in-out infinite;
          }

          .error-spider :global(.spider-svg) {
            width: 100%;
            height: 100%;
          }

          .error-inner {
            position: relative;
            z-index: 2;
            text-align: center;
          }

          .error-mark {
            color:
              rgba(255, 40, 40, 0.18);
            font-size:
              clamp(90px, 15vw, 180px);
            line-height: 0.8;
            font-weight: 600;
            letter-spacing: -0.08em;
          }

          .error-title {
            margin-top: 28px;
            color: #ff3030;
            font-size: 10px;
            letter-spacing: 0.3em;
          }

          .error-line {
            width: 45px;
            height: 1px;
            margin: 20px auto;
            background: #ff2424;
            box-shadow:
              0 0 15px
              rgba(255, 30, 30, 0.5);
          }

          .back-button {
            border:
              1px solid
              rgba(255, 255, 255, 0.16);
            background:
              rgba(255, 255, 255, 0.025);
            color: #fff;
            padding: 13px 24px;
            cursor: pointer;
            letter-spacing: 0.16em;
            font-size: 8px;
            transition: 0.3s ease;
          }

          .back-button:hover {
            border-color:
              rgba(255, 35, 35, 0.7);
            background:
              rgba(100, 0, 0, 0.2);
          }

          @keyframes errorFloat {
            0%,
            100% {
              transform:
                translateY(0)
                rotate(-5deg);
            }

            50% {
              transform:
                translateY(25px)
                rotate(5deg);
            }
          }
        `}</style>
      </main>
    );
  }

  const availableSizes =
    sizes.filter(
      (size) =>
        size.stock > 0
    );

  const hasSizeSelection =
    sizes.length > 0;

  const cannotAddToBag =
    product.status !==
      "AVAILABLE" ||
    (hasSizeSelection &&
      availableSizes.length ===
        0) ||
    (hasSizeSelection &&
      availableSizes.length > 0 &&
      !selectedSize);

  const currentImageIndex =
    Math.max(
      images.findIndex(
        (image) =>
          image.image_url ===
          selectedImage
      ),
      0
    );

  return (
    <main className="product-page">

      {/* =====================================================
          CINEMATIC SPIDER BACKGROUND
      ===================================================== */}

      <div className="spider-background">

        <div className="background-red-light red-light-one" />
        <div className="background-red-light red-light-two" />

        {/* WEB CORNERS */}

        <div className="ambient-web ambient-web-left" />
        <div className="ambient-web ambient-web-right" />

        {/* =================================================
            SPIDER 01
        ================================================= */}

        <div className="spider spider-one">
          <span className="spider-thread" />
          <SpiderIcon />
        </div>

        {/* =================================================
            SPIDER 02
        ================================================= */}

        <div className="spider spider-two">
          <span className="spider-thread" />
          <SpiderIcon />
        </div>

        {/* =================================================
            SPIDER 03
        ================================================= */}

        <div className="spider spider-three">
          <span className="spider-thread" />
          <SpiderIcon />
        </div>

        {/* =================================================
            SPIDER 04
        ================================================= */}

        <div className="spider spider-four">
          <span className="spider-thread" />
          <SpiderIcon />
        </div>

        {/* =================================================
            SPIDER 05
        ================================================= */}

        <div className="spider spider-five">
          <span className="spider-thread" />
          <SpiderIcon />
        </div>

        {/* =================================================
            WEB SHOOTERS
        ================================================= */}

        <WebShooter className="shooter-one" />

        <WebShooter className="shooter-two" />

        <WebShooter className="shooter-three" />

        <WebShooter className="shooter-four" />

        {/* =================================================
            PARTICLES
        ================================================= */}

        <span className="particle particle-one" />
        <span className="particle particle-two" />
        <span className="particle particle-three" />
        <span className="particle particle-four" />
        <span className="particle particle-five" />
        <span className="particle particle-six" />

      </div>

      {/* =====================================================
          GRID
      ===================================================== */}

      <div className="background-grid" />

      <div className="background-glow glow-one" />

      <div className="background-glow glow-two" />

      <div className="red-vignette" />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="product-header">

        <button
          onClick={() =>
            router.push("/shop")
          }
          className="brand-button"
        >
          <span className="brand-symbol">
            ✦
          </span>

          STOKED
        </button>

        <div className="header-center">
          <span className="header-line" />

          <span>
            PRODUCT
          </span>

          <span className="header-line" />
        </div>

        <div className="header-actions">

          <button
            onClick={() =>
              router.push("/shop")
            }
            className="header-back"
          >
            ← SHOP
          </button>

          <button
            onClick={() =>
              router.push("/cart")
            }
            className="header-bag"
          >
            
            BAG

            <span>
              {String(
                cartCount
              ).padStart(2, "0")}
            </span>
          </button>

        </div>

      </header>

      {/* =====================================================
          PRODUCT AREA
      ===================================================== */}

      <section className="product-container">

        {/* ===================================================
            GALLERY
        =================================================== */}

        <div className="gallery-column">

          <div
            className="main-image-wrapper"
            onTouchStart={
              handleTouchStart
            }
            onTouchEnd={
              handleTouchEnd
            }
          >

            <div className="image-web-overlay" />

            <div className="image-red-glow" />

            {selectedImage ? (
              <img
                key={selectedImage}
                src={selectedImage}
                alt={product.name}
                className="main-product-image"
              />
            ) : (
              <div className="no-image">
                NO IMAGE
              </div>
            )}

            <div className="image-frame frame-top-left" />

            <div className="image-frame frame-top-right" />

            <div className="image-frame frame-bottom-left" />

            <div className="image-frame frame-bottom-right" />

            <div className="image-top-label">
              STOKED /
              {" "}
              {product.category?.name ||
                "PRODUCT"}
            </div>

            <div className="image-status">
              <span className="status-dot" />

              {product.status ===
              "AVAILABLE"
                ? "AVAILABLE"
                : "SOLD OUT"}
            </div>

            {images.length > 1 && (
              <>
                <button
                  className="gallery-arrow gallery-arrow-left"
                  onClick={() =>
                    changeImage(
                      "prev"
                    )
                  }
                  aria-label="Previous image"
                >
                  ←
                </button>

                <button
                  className="gallery-arrow gallery-arrow-right"
                  onClick={() =>
                    changeImage(
                      "next"
                    )
                  }
                  aria-label="Next image"
                >
                  →
                </button>

                <div className="image-counter">

                  <span>
                    {String(
                      currentImageIndex +
                        1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <i />

                  <span>
                    {String(
                      images.length
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                </div>
              </>
            )}

          </div>

          {/* THUMBNAILS */}

          {images.length > 1 && (
            <div className="thumbnail-scroll">

              <div className="thumbnail-track">

                {images.map(
                  (
                    image,
                    index
                  ) => {
                    const active =
                      selectedImage ===
                      image.image_url;

                    return (
                      <button
                        key={
                          image.id
                        }
                        onClick={() =>
                          setSelectedImage(
                            image.image_url
                          )
                        }
                        className={`thumbnail ${
                          active
                            ? "thumbnail-active"
                            : ""
                        }`}
                      >

                        <img
                          src={
                            image.image_url
                          }
                          alt={`${product.name} ${
                            index + 1
                          }`}
                        />

                        <div className="thumbnail-overlay" />

                        <span className="thumbnail-number">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                      </button>
                    );
                  }
                )}

              </div>

            </div>
          )}

          <div className="gallery-meta">

            <span>
              DRAG / SWIPE
            </span>

            <span>
              STOKED BD — 2026
            </span>

          </div>

        </div>

        {/* ===================================================
            DETAILS
        =================================================== */}

        <div className="details-column">

          {/* CATEGORY */}

          <div className="category-line">

            <span className="category-line-mark" />

            <span>
              {product.category?.name ||
                "STOKED COLLECTION"}
            </span>

            <span className="category-number">
              / 01
            </span>

          </div>

          {/* PRODUCT NAME */}

          <h1 className="product-name">
            {product.name}
          </h1>

          <div className="name-underline">
            <span />
          </div>

          {/* PRICE */}

          <div className="price-section">

            <span className="price">
              ৳{" "}
              {product.price.toLocaleString()}
            </span>

            <span className="currency">
              BDT
            </span>

          </div>

          {/* SIZE */}

          {sizes.length > 0 && (
            <div className="size-section">

              <div className="section-heading-row">

                <span className="section-heading">
                  SELECT SIZE
                </span>

                {selectedSize && (
                  <span className="selected-size">
                    SELECTED /{" "}
                    {selectedSize}
                  </span>
                )}

              </div>

              <div className="sizes-grid">

                {sizes.map(
                  (size) => {

                    const available =
                      size.stock >
                      0;

                    const selected =
                      selectedSize ===
                      size.size;

                    return (
                      <button
                        key={
                          size.id
                        }
                        disabled={
                          !available
                        }
                        onClick={() =>
                          setSelectedSize(
                            size.size
                          )
                        }
                        className={`size-button ${
                          selected
                            ? "size-selected"
                            : ""
                        } ${
                          !available
                            ? "size-unavailable"
                            : ""
                        }`}
                      >

                        <span>
                          {size.size}
                        </span>

                        {!available && (
                          <small>
                            SOLD OUT
                          </small>
                        )}

                        {selected && (
                          <span className="size-active-line" />
                        )}

                      </button>
                    );
                  }
                )}

              </div>

            </div>
          )}

          {/* DIVIDER */}

          <div className="details-divider">
            <span />
          </div>

          {/* DESCRIPTION */}

          {product.description && (
            <div className="description-section">

              <div className="section-heading">
                DETAILS
              </div>

              <p className="description">
                {product.description}
              </p>

            </div>
          )}

          {/* SIZE CHART */}

          {sizeChart.length > 0 && (
            <div className="size-chart-section">

              <div className="section-heading-row">

                <span className="section-heading">
                  SIZE CHART
                </span>

                <span className="measurements">
                  MEASUREMENTS / CM
                </span>

              </div>

              {sizeChart.some(
                (item) =>
                  item.image_url
              ) ? (
                <div className="size-chart-images">

                  {sizeChart
                    .filter(
                      (item) =>
                        item.image_url
                    )
                    .map(
                      (item) => (
                        <img
                          key={
                            item.id
                          }
                          src={
                            item.image_url!
                          }
                          alt="Size chart"
                        />
                      )
                    )}

                </div>
              ) : (
                <div className="size-table-wrapper">

                  <table className="size-table">

                    <thead>
                      <tr>
                        <th>
                          SIZE
                        </th>

                        <th>
                          CHEST
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {sizeChart.map(
                        (item) => (
                          <tr
                            key={
                              item.id
                            }
                          >
                            <td>
                              {item.size}
                            </td>

                            <td>
                              {item.chest ||
                                "—"}
                            </td>
                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>
              )}

            </div>
          )}

          {/* ADD TO BAG */}

          <button
            disabled={
              cannotAddToBag
            }
            onClick={
              handleAddToBag
            }
            className={`add-to-bag ${
              !cannotAddToBag
                ? "add-to-bag-active"
                : ""
            } ${
              addedToBag
                ? "add-to-bag-success"
                : ""
            }`}
          >

            <span className="bag-button-left">

              {product.status !==
              "AVAILABLE"
                ? "SOLD OUT"
                : availableSizes.length ===
                    0 &&
                  sizes.length >
                    0
                ? "SOLD OUT"
                : addedToBag
                ? "ADDED TO BAG"
                : hasSizeSelection &&
                  !selectedSize
                ? "SELECT SIZE"
                : "ADD TO BAG"}

            </span>

            <span className="bag-button-arrow">
              {addedToBag
                ? "✓"
                : "→"}
            </span>

          </button>

          {/* INFO */}

          <div className="info-grid">

            {[
              [
                "01",
                "STOKED BD",
              ],
              [
                "02",
                "AUTHENTIC",
              ],
              [
                "03",
                "SECURE",
              ],
            ].map(
              ([
                number,
                label,
              ]) => (

                <div
                  key={number}
                  className="info-card"
                >

                  <div className="info-number">
                    {number}
                  </div>

                  <div className="info-label">
                    {label}
                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="product-footer">

        <div className="footer-left">

          <span className="footer-mark">
            ✦
          </span>

          STOKED BD

        </div>

        <div className="footer-center">
          SPIDER COLLECTION / 2026
        </div>

        <div className="footer-right">
          EST. 2026
        </div>

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

        .product-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          height: auto !important;
          overflow-x: hidden !important;
          overflow-y: visible !important;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(120, 0, 0, 0.17),
              transparent 35%
            ),
            #070202;
          color: #f5f5f3;
          font-family: Inter, sans-serif;
          scrollbar-width: thin;
          scrollbar-color:
            rgba(255, 35, 35, 0.5)
            transparent;
        }

        /* =====================================================
           SPIDER BACKGROUND
        ===================================================== */

        .spider-background {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .background-red-light {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
        }

        .red-light-one {
          width: 450px;
          height: 450px;
          left: -280px;
          top: 10%;
          background: #7d0000;
          opacity: 0.12;
        }

        .red-light-two {
          width: 500px;
          height: 500px;
          right: -300px;
          bottom: 10%;
          background: #6c0000;
          opacity: 0.1;
        }

        /* =====================================================
           AMBIENT WEBS
        ===================================================== */

        .ambient-web {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          opacity: 0.1;
          background:
            repeating-radial-gradient(
              circle,
              transparent 0 40px,
              rgba(255, 255, 255, 0.18) 41px 42px
            );
        }

        .ambient-web::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background:
            repeating-conic-gradient(
              from 0deg,
              transparent 0deg 14deg,
              rgba(255, 255, 255, 0.14)
                15deg 15.5deg,
              transparent 16deg 30deg
            );
        }

        .ambient-web-left {
          left: -390px;
          top: -170px;
          transform: rotate(20deg);
        }

        .ambient-web-right {
          right: -390px;
          bottom: -190px;
          transform: rotate(-20deg);
        }

        /* =====================================================
           SPIDERS
        ===================================================== */

        .spider {
          position: absolute;
          z-index: 5;
          color:
            rgba(255, 255, 255, 0.16);
          animation:
            spiderFloat
            7s
            ease-in-out
            infinite;
        }

        .spider::after {
          content: "";
          position: absolute;
          inset: -15px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(255, 0, 0, 0.11),
              transparent 65%
            );
          filter: blur(15px);
          z-index: -1;
        }

        .spider-svg {
          width: 100%;
          height: 100%;
          display: block;
          filter:
            drop-shadow(
              0 0 15px
              rgba(255, 0, 0, 0.12)
            );
        }

        .spider-thread {
          position: absolute;
          width: 1px;
          height: 150px;
          left: 50%;
          bottom: 86%;
          transform: translateX(-50%);
          background:
            linear-gradient(
              to bottom,
              transparent,
              rgba(255, 255, 255, 0.22),
              rgba(255, 255, 255, 0.05)
            );
          transform-origin: bottom;
        }

        .spider-one {
          width: 110px;
          height: 110px;
          left: 4%;
          top: 10%;
          animation-delay: 0s;
        }

        .spider-one .spider-thread {
          height: 115px;
        }

        .spider-two {
          width: 82px;
          height: 82px;
          right: 7%;
          top: 16%;
          color:
            rgba(255, 255, 255, 0.12);
          animation-delay: -2s;
        }

        .spider-two .spider-thread {
          height: 95px;
        }

        .spider-three {
          width: 62px;
          height: 62px;
          left: 7%;
          top: 55%;
          color:
            rgba(255, 255, 255, 0.09);
          filter: blur(0.8px);
          animation-delay: -4s;
        }

        .spider-three .spider-thread {
          height: 75px;
        }

        .spider-four {
          width: 95px;
          height: 95px;
          right: 4%;
          top: 53%;
          color:
            rgba(255, 255, 255, 0.13);
          animation-delay: -1s;
        }

        .spider-four .spider-thread {
          height: 125px;
        }

        .spider-five {
          width: 72px;
          height: 72px;
          left: 43%;
          bottom: 5%;
          color:
            rgba(255, 255, 255, 0.085);
          filter: blur(1px);
          animation-delay: -5s;
        }

        .spider-five .spider-thread {
          display: none;
        }

        @keyframes spiderFloat {
          0%,
          100% {
            transform:
              translate3d(
                0,
                0,
                0
              )
              rotate(-2deg);
          }

          25% {
            transform:
              translate3d(
                8px,
                18px,
                0
              )
              rotate(3deg);
          }

          50% {
            transform:
              translate3d(
                -8px,
                -5px,
                0
              )
              rotate(-4deg);
          }

          75% {
            transform:
              translate3d(
                5px,
                13px,
                0
              )
              rotate(2deg);
          }
        }

        /* =====================================================
           WEB SHOOTERS
        ===================================================== */

        .web-shooter {
          position: absolute;
          z-index: 4;
          width: 360px;
          height: 120px;
          opacity: 0;
        }

        .shooter-core {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #fff;
          box-shadow:
            0 0 10px #fff,
            0 0 25px
              rgba(255, 40, 40, 0.8);
        }

        .shooter-thread {
          position: absolute;
          left: 4px;
          top: 4px;
          width: 350px;
          height: 1px;
          transform-origin: left center;
          background:
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.8),
              rgba(255, 255, 255, 0.3),
              rgba(255, 30, 30, 0.12),
              transparent
            );
          box-shadow:
            0 0 8px
              rgba(255, 255, 255, 0.35);
        }

        .thread-one {
          transform: rotate(-13deg);
        }

        .thread-two {
          transform: rotate(0deg);
          opacity: 0.5;
        }

        .thread-three {
          transform: rotate(13deg);
        }

        .shooter-burst {
          position: absolute;
          left: 340px;
          top: 4px;
          width: 20px;
          height: 20px;
          border:
            1px solid
            rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          box-shadow:
            0 0 20px
              rgba(255, 30, 30, 0.3);
          animation:
            burstPulse
            1s
            ease-out
            infinite;
        }

        .shooter-one {
          left: 2%;
          top: 28%;
          transform: rotate(5deg);
          animation:
            shootOne
            7s
            ease-in-out
            infinite;
        }

        .shooter-two {
          right: 0;
          top: 37%;
          transform: scaleX(-1) rotate(8deg);
          animation:
            shootTwo
            9s
            ease-in-out
            infinite;
        }

        .shooter-three {
          left: 15%;
          bottom: 22%;
          transform: rotate(-18deg);
          animation:
            shootThree
            8s
            ease-in-out
            infinite;
        }

        .shooter-four {
          right: 16%;
          top: 8%;
          transform: scaleX(-1) rotate(-12deg);
          animation:
            shootFour
            10s
            ease-in-out
            infinite;
        }

        @keyframes shootOne {
          0%,
          70%,
          100% {
            opacity: 0;
            clip-path: inset(
              0 100% 0 0
            );
          }

          74% {
            opacity: 1;
          }

          80% {
            opacity: 0.7;
            clip-path: inset(
              0 0 0 0
            );
          }

          86% {
            opacity: 0;
          }
        }

        @keyframes shootTwo {
          0%,
          68%,
          100% {
            opacity: 0;
            clip-path: inset(
              0 100% 0 0
            );
          }

          72% {
            opacity: 1;
          }

          78% {
            opacity: 0.65;
            clip-path: inset(
              0 0 0 0
            );
          }

          84% {
            opacity: 0;
          }
        }

        @keyframes shootThree {
          0%,
          72%,
          100% {
            opacity: 0;
            clip-path: inset(
              0 100% 0 0
            );
          }

          76% {
            opacity: 1;
          }

          82% {
            opacity: 0.55;
            clip-path: inset(
              0 0 0 0
            );
          }

          88% {
            opacity: 0;
          }
        }

        @keyframes shootFour {
          0%,
          75%,
          100% {
            opacity: 0;
            clip-path: inset(
              0 100% 0 0
            );
          }

          79% {
            opacity: 1;
          }

          85% {
            opacity: 0.6;
            clip-path: inset(
              0 0 0 0
            );
          }

          91% {
            opacity: 0;
          }
        }

        @keyframes burstPulse {
          0% {
            transform: scale(0.4);
            opacity: 0;
          }

          40% {
            transform: scale(1);
            opacity: 0.8;
          }

          100% {
            transform: scale(1.7);
            opacity: 0;
          }
        }

        /* =====================================================
           PARTICLES
        ===================================================== */

        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #ff2525;
          box-shadow:
            0 0 8px #ff2525,
            0 0 20px
              rgba(255, 0, 0, 0.5);
          opacity: 0;
          animation:
            particleFloat
            6s
            ease-in-out
            infinite;
        }

        .particle-one {
          left: 25%;
          top: 22%;
          animation-delay: 1s;
        }

        .particle-two {
          left: 72%;
          top: 20%;
          animation-delay: 3s;
        }

        .particle-three {
          right: 25%;
          top: 58%;
          animation-delay: 2s;
        }

        .particle-four {
          left: 32%;
          bottom: 18%;
          animation-delay: 4s;
        }

        .particle-five {
          right: 42%;
          top: 42%;
          animation-delay: 5s;
        }

        .particle-six {
          left: 52%;
          bottom: 30%;
          animation-delay: 2.5s;
        }

        @keyframes particleFloat {
          0%,
          100% {
            opacity: 0;
            transform:
              translateY(15px)
              scale(0.7);
          }

          30% {
            opacity: 0.8;
          }

          60% {
            opacity: 0.35;
            transform:
              translateY(-25px)
              scale(1);
          }

          80% {
            opacity: 0;
          }
        }

        /* =====================================================
           GRID
        ===================================================== */

        .background-grid {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.18;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.025)
                1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.025)
                1px,
              transparent 1px
            );
          background-size:
            75px 75px;
          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 90%
            );
        }

        .background-glow {
          position: fixed;
          pointer-events: none;
          z-index: 0;
          border-radius: 50%;
          filter: blur(110px);
        }

        .glow-one {
          width: 340px;
          height: 340px;
          background: #850000;
          left: -190px;
          top: 22%;
          opacity: 0.12;
        }

        .glow-two {
          width: 380px;
          height: 380px;
          background: #620000;
          right: -210px;
          bottom: 8%;
          opacity: 0.1;
        }

        .red-vignette {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          box-shadow:
            inset 0 0 180px
              rgba(80, 0, 0, 0.2);
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .product-header {
          position: sticky;
          top: 0;
          z-index: 50;
          height: 78px;
          display: grid;
          grid-template-columns:
            1fr auto 1fr;
          align-items: center;
          padding: 0 5vw;
          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.075);
          background:
            rgba(7, 2, 2, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .brand-button,
        .header-back,
        .header-bag {
          border: 0;
          background: transparent;
          cursor: pointer;
          color: #fff;
          font-family: inherit;
        }

        .brand-button {
          justify-self: start;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.16em;
        }

        .brand-symbol {
          color: #ff2727;
          font-size: 11px;
          text-shadow:
            0 0 12px
            rgba(255, 35, 35, 0.7);
        }

        .header-center {
          display: flex;
          align-items: center;
          gap: 12px;
          color:
            rgba(255, 255, 255, 0.3);
          font-size: 7px;
          letter-spacing: 0.25em;
        }

        .header-line {
          width: 20px;
          height: 1px;
          background:
            rgba(255, 255, 255, 0.15);
        }

        .header-actions {
          justify-self: end;
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .header-back,
        .header-bag {
          padding: 10px 0;
          color:
            rgba(255, 255, 255, 0.5);
          font-size: 8px;
          letter-spacing: 0.18em;
          transition: 0.25s ease;
        }

        .header-bag {
          display: flex;
          gap: 7px;
        }

        .header-bag span {
          color: #ff3030;
        }

        .header-back:hover,
        .header-bag:hover {
          color: #fff;
        }

        /* =====================================================
           PRODUCT CONTAINER
        ===================================================== */

        .product-container {
          position: relative;
          z-index: 2;
          max-width: 1500px;
          margin: 0 auto;
          padding:
            70px 5vw 130px;
          display: grid;
          grid-template-columns:
            minmax(0, 1.08fr)
            minmax(370px, 0.92fr);
          gap:
            clamp(45px, 6vw, 100px);
          align-items: start;
        }

        /* =====================================================
           GALLERY
        ===================================================== */

        .gallery-column {
          min-width: 0;
          animation:
            galleryReveal
            0.9s
            cubic-bezier(
              0.2,
              0.7,
              0.2,
              1
            )
            both;
        }

        .main-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          isolation: isolate;
          background: #0b0404;
          border:
            1px solid
            rgba(255, 255, 255, 0.09);
          box-shadow:
            0 35px 100px
              rgba(0, 0, 0, 0.55),
            0 0 90px
              rgba(110, 0, 0, 0.1);
          touch-action: pan-y;
        }

        .main-image-wrapper::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          background:
            linear-gradient(
              120deg,
              rgba(255, 255, 255, 0.06),
              transparent 20%,
              transparent 80%,
              rgba(255, 0, 0, 0.035)
            );
        }

        .image-web-overlay {
          position: absolute;
          inset: -15%;
          z-index: 2;
          pointer-events: none;
          opacity: 0.14;
          background:
            repeating-radial-gradient(
              circle at 50% 50%,
              transparent 0 65px,
              rgba(255, 255, 255, 0.12)
                66px 67px
            );
          mask-image:
            linear-gradient(
              135deg,
              transparent,
              black 35%,
              black 65%,
              transparent
            );
        }

        .image-red-glow {
          position: absolute;
          inset: 7%;
          z-index: 0;
          background:
            radial-gradient(
              circle,
              rgba(190, 0, 0, 0.18),
              transparent 68%
            );
          filter: blur(50px);
          pointer-events: none;
        }

        .main-product-image {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          animation:
            imageReveal
            0.55s
            cubic-bezier(
              0.2,
              0.7,
              0.2,
              1
            );
          transition:
            transform
            0.8s
            cubic-bezier(
              0.2,
              0.7,
              0.2,
              1
            );
        }

        .main-image-wrapper:hover
          .main-product-image {
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
          color:
            rgba(255, 255, 255, 0.25);
          font-size: 9px;
          letter-spacing: 0.2em;
        }

        .image-frame {
          position: absolute;
          z-index: 5;
          width: 22px;
          height: 22px;
          pointer-events: none;
        }

        .frame-top-left {
          left: 13px;
          top: 13px;
          border-left:
            1px solid
            rgba(255, 40, 40, 0.65);
          border-top:
            1px solid
            rgba(255, 40, 40, 0.65);
        }

        .frame-top-right {
          right: 13px;
          top: 13px;
          border-right:
            1px solid
            rgba(255, 40, 40, 0.65);
          border-top:
            1px solid
            rgba(255, 40, 40, 0.65);
        }

        .frame-bottom-left {
          left: 13px;
          bottom: 13px;
          border-left:
            1px solid
            rgba(255, 40, 40, 0.65);
          border-bottom:
            1px solid
            rgba(255, 40, 40, 0.65);
        }

        .frame-bottom-right {
          right: 13px;
          bottom: 13px;
          border-right:
            1px solid
            rgba(255, 40, 40, 0.65);
          border-bottom:
            1px solid
            rgba(255, 40, 40, 0.65);
        }

        .image-top-label {
          position: absolute;
          z-index: 6;
          left: 25px;
          top: 22px;
          color:
            rgba(255, 255, 255, 0.52);
          font-size: 7px;
          letter-spacing: 0.2em;
          mix-blend-mode: difference;
          pointer-events: none;
        }

        .image-status {
          position: absolute;
          z-index: 6;
          right: 24px;
          top: 21px;
          display: flex;
          align-items: center;
          gap: 7px;
          color:
            rgba(255, 255, 255, 0.5);
          font-size: 7px;
          letter-spacing: 0.15em;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ff2525;
          box-shadow:
            0 0 13px
            rgba(255, 30, 30, 0.9);
        }

        .image-counter {
          position: absolute;
          z-index: 6;
          right: 24px;
          bottom: 21px;
          display: flex;
          align-items: center;
          gap: 8px;
          color:
            rgba(255, 255, 255, 0.58);
          font-size: 8px;
          letter-spacing: 0.16em;
          mix-blend-mode: difference;
          pointer-events: none;
        }

        .image-counter i {
          width: 18px;
          height: 1px;
          background:
            rgba(255, 255, 255, 0.45);
        }

        .gallery-arrow {
          position: absolute;
          z-index: 8;
          top: 50%;
          width: 44px;
          height: 44px;
          transform: translateY(-50%);
          border:
            1px solid
            rgba(255, 255, 255, 0.16);
          background:
            rgba(5, 1, 1, 0.45);
          backdrop-filter: blur(10px);
          color: #fff;
          cursor: pointer;
          opacity: 0;
          transition: 0.3s ease;
        }

        .gallery-arrow-left {
          left: 18px;
        }

        .gallery-arrow-right {
          right: 18px;
        }

        .main-image-wrapper:hover
          .gallery-arrow {
          opacity: 1;
        }

        .gallery-arrow:hover {
          border-color:
            rgba(255, 35, 35, 0.8);
          background:
            rgba(100, 0, 0, 0.55);
        }

        /* =====================================================
           THUMBNAILS
        ===================================================== */

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
          display: grid;
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(0, 1fr)
            );
          gap: 10px;
          min-width: 100%;
        }

        .thumbnail {
          position: relative;
          min-width: 0;
          aspect-ratio: 1 / 1;
          padding: 0;
          overflow: hidden;
          border:
            1px solid
            rgba(255, 255, 255, 0.09);
          background: #0d0505;
          cursor: pointer;
          opacity: 0.45;
          transition: 0.3s ease;
        }

        .thumbnail:hover {
          opacity: 0.85;
          border-color:
            rgba(255, 50, 50, 0.45);
        }

        .thumbnail-active {
          opacity: 1;
          border-color: #ff2424;
          box-shadow:
            0 0 22px
              rgba(255, 25, 25, 0.1),
            inset 0 0 18px
              rgba(255, 25, 25, 0.04);
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition:
            transform
            0.5s ease;
        }

        .thumbnail:hover img {
          transform: scale(1.06);
        }

        .thumbnail-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              to top,
              rgba(0, 0, 0, 0.5),
              transparent 45%
            );
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
          text-shadow:
            0 1px 5px
            rgba(0, 0, 0, 0.9);
        }

        .gallery-meta {
          display: flex;
          justify-content: space-between;
          margin-top: 11px;
          color:
            rgba(255, 255, 255, 0.23);
          font-size: 6px;
          letter-spacing: 0.18em;
        }

        /* =====================================================
           DETAILS
        ===================================================== */

        .details-column {
          min-width: 0;
          padding-top: 15px;
          animation:
            detailsReveal
            0.9s
            0.08s
            cubic-bezier(
              0.2,
              0.7,
              0.2,
              1
            )
            both;
        }

        .category-line {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 22px;
          color: #ff3030;
          font-size: 8px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
        }

        .category-line-mark {
          width: 28px;
          height: 1px;
          background: #ff2929;
          box-shadow:
            0 0 10px
            rgba(255, 41, 41, 0.45);
        }

        .category-number {
          margin-left: auto;
          color:
            rgba(255, 255, 255, 0.2);
          font-size: 7px;
        }

        .product-name {
          max-width: 800px;
          margin: 0 0 18px;
          color: #f5f5f3;
          font-size:
            clamp(
              42px,
              5vw,
              78px
            );
          line-height: 0.9;
          font-weight: 500;
          letter-spacing: -0.055em;
          text-transform: uppercase;
        }

        .name-underline {
          width: 100%;
          height: 1px;
          margin-bottom: 28px;
          background:
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.14),
              transparent
            );
        }

        .name-underline span {
          display: block;
          width: 55px;
          height: 1px;
          background: #ff2929;
          box-shadow:
            0 0 12px
            rgba(255, 35, 35, 0.6);
        }

        /* =====================================================
           PRICE
        ===================================================== */

        .price-section {
          display: flex;
          align-items: baseline;
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
          color:
            rgba(255, 255, 255, 0.3);
          font-size: 8px;
          letter-spacing: 0.18em;
        }

        /* =====================================================
           SIZE
        ===================================================== */

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
          color:
            rgba(255, 255, 255, 0.88);
          font-size: 8px;
          letter-spacing: 0.2em;
        }

        .selected-size {
          color: #ff3030;
          font-size: 7px;
          letter-spacing: 0.15em;
        }

        .sizes-grid {
          display: grid;
          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );
          gap: 8px;
        }

        .size-button {
          position: relative;
          height: 58px;
          border:
            1px solid
            rgba(255, 255, 255, 0.11);
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.045),
              rgba(255, 255, 255, 0.012)
            );
          color: #fff;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.15em;
          transition: 0.25s ease;
        }

        .size-button:hover:not(
            :disabled
          ) {
          border-color:
            rgba(255, 45, 45, 0.55);
          background:
            rgba(100, 0, 0, 0.18);
          transform:
            translateY(-1px);
        }

        .size-selected {
          border-color: #ff2424;
          background:
            linear-gradient(
              145deg,
              rgba(145, 0, 0, 0.5),
              rgba(60, 0, 0, 0.3)
            );
          box-shadow:
            0 0 25px
              rgba(255, 30, 30, 0.09),
            inset 0 0 20px
              rgba(255, 30, 30, 0.04);
        }

        .size-unavailable {
          color:
            rgba(255, 255, 255, 0.22);
          opacity: 0.5;
          cursor: not-allowed;
        }

        .size-button small {
          display: block;
          margin-top: 4px;
          color:
            rgba(255, 255, 255, 0.28);
          font-size: 6px;
          letter-spacing: 0.12em;
        }

        .size-active-line {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 2px;
          background: #ff2424;
          box-shadow:
            0 0 10px
            rgba(255, 36, 36, 0.8);
        }

        /* =====================================================
           DIVIDER
        ===================================================== */

        .details-divider {
          width: 100%;
          height: 1px;
          margin-bottom: 30px;
          background:
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.14),
              transparent
            );
        }

        .details-divider span {
          display: block;
          width: 35px;
          height: 1px;
          background: #ff2424;
        }

        /* =====================================================
           DESCRIPTION
        ===================================================== */

        .description-section {
          max-width: 650px;
          margin-bottom: 38px;
        }

        .description {
          margin: 12px 0 0;
          color:
            rgba(255, 255, 255, 0.62);
          font-size: 12px;
          line-height: 1.85;
          white-space: pre-line;
        }

        /* =====================================================
           SIZE CHART
        ===================================================== */

        .size-chart-section {
          margin-bottom: 32px;
          padding-top: 26px;
          border-top:
            1px solid
            rgba(255, 255, 255, 0.09);
        }

        .measurements {
          color:
            rgba(255, 255, 255, 0.3);
          font-size: 7px;
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
          border:
            1px solid
            rgba(255, 255, 255, 0.08);
          background: #0b0404;
        }

        .size-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border:
            1px solid
            rgba(255, 255, 255, 0.08);
          background:
            rgba(255, 255, 255, 0.018);
        }

        .size-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9px;
        }

        .size-table th {
          padding: 13px 12px;
          text-align: left;
          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.09);
          color:
            rgba(255, 255, 255, 0.4);
          font-weight: 400;
          letter-spacing: 0.14em;
        }

        .size-table td {
          padding: 13px 12px;
          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.055);
          color:
            rgba(255, 255, 255, 0.55);
        }

        .size-table td:first-child {
          color: #fff;
        }

        /* =====================================================
           ADD TO BAG
        ===================================================== */

        .add-to-bag {
          position: relative;
          width: 100%;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          border:
            1px solid
            rgba(255, 255, 255, 0.1);
          background:
            rgba(255, 255, 255, 0.035);
          color: #fff;
          font-family: inherit;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.25em;
          cursor: not-allowed;
          opacity: 0.45;
          transition: 0.35s ease;
        }

        .bag-button-arrow {
          font-size: 15px;
          letter-spacing: 0;
        }

        .add-to-bag-active {
          border-color:
            rgba(255, 48, 48, 0.8);
          background:
            linear-gradient(
              105deg,
              #720606,
              #b20a0a,
              #720606
            );
          background-size:
            200% 100%;
          box-shadow:
            0 12px 35px
              rgba(110, 0, 0, 0.22);
          cursor: pointer;
          opacity: 1;
          animation:
            buttonShine
            4s ease-in-out infinite;
        }

        .add-to-bag-active:hover {
          transform:
            translateY(-2px);
          box-shadow:
            0 16px 42px
              rgba(110, 0, 0, 0.32),
            0 0 25px
              rgba(255, 30, 30, 0.08);
        }

        .add-to-bag-success {
          background:
            linear-gradient(
              105deg,
              #075c18,
              #0b8a27,
              #075c18
            );
        }

        /* =====================================================
           INFO
        ===================================================== */

        .info-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 1px;
          margin-top: 25px;
          background:
            rgba(255, 255, 255, 0.08);
        }

        .info-card {
          min-width: 0;
          padding: 16px 12px;
          background: #090303;
        }

        .info-number {
          margin-bottom: 6px;
          color: #ff3030;
          font-size: 7px;
          letter-spacing: 0.15em;
        }

        .info-label {
          color:
            rgba(255, 255, 255, 0.42);
          font-size: 7px;
          letter-spacing: 0.13em;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .product-footer {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns:
            1fr auto 1fr;
          align-items: center;
          padding: 25px 5vw;
          border-top:
            1px solid
            rgba(255, 255, 255, 0.07);
          color:
            rgba(255, 255, 255, 0.3);
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
          color:
            rgba(255, 255, 255, 0.2);
        }

        .footer-right {
          justify-self: end;
        }

        /* =====================================================
           ANIMATIONS
        ===================================================== */

        @keyframes galleryReveal {
          from {
            opacity: 0;
            transform:
              translateX(-25px);
          }

          to {
            opacity: 1;
            transform:
              translateX(0);
          }
        }

        @keyframes detailsReveal {
          from {
            opacity: 0;
            transform:
              translateX(25px);
          }

          to {
            opacity: 1;
            transform:
              translateX(0);
          }
        }

        @keyframes imageReveal {
          from {
            opacity: 0;
            transform:
              scale(1.035);
          }

          to {
            opacity: 1;
            transform:
              scale(1);
          }
        }

        @keyframes buttonShine {
          0%,
          100% {
            background-position:
              0% 50%;
          }

          50% {
            background-position:
              100% 50%;
          }
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 900px) {

          .product-container {
            grid-template-columns: 1fr;
            gap: 48px;
            padding:
              45px 5vw 100px;
          }

          .details-column {
            padding-top: 0;
          }

          .product-name {
            font-size:
              clamp(
                42px,
                8vw,
                70px
              );
          }

          .gallery-arrow {
            opacity: 1;
          }

          .header-center {
            display: none;
          }

        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {

          .product-header {
            height: 68px;
            padding: 0 18px;
          }

          .brand-button {
            font-size: 12px;
          }

          .brand-symbol {
            font-size: 9px;
          }

          .header-actions {
            gap: 12px;
          }

          .header-back {
            font-size: 7px;
            letter-spacing: 0.12em;
          }

          .header-bag {
            font-size: 8px;
          }

          .product-container {
            display: flex;
            flex-direction: column;
            gap: 35px;
            padding:
              25px 18px 80px;
          }

          /* MOBILE SPIDERS */

          .spider-one {
            width: 72px;
            height: 72px;
            left: -5%;
            top: 10%;
          }

          .spider-two {
            width: 58px;
            height: 58px;
            right: -3%;
            top: 17%;
          }

          .spider-three {
            width: 45px;
            height: 45px;
            left: -2%;
            top: 48%;
          }

          .spider-four {
            width: 62px;
            height: 62px;
            right: -4%;
            top: 55%;
          }

          .spider-five {
            width: 48px;
            height: 48px;
            left: 38%;
            bottom: 3%;
          }

          .spider-thread {
            height: 70px !important;
          }

          .ambient-web {
            width: 350px;
            height: 350px;
          }

          .ambient-web-left {
            left: -250px;
          }

          .ambient-web-right {
            right: -250px;
          }

          .web-shooter {
            width: 190px;
          }

          .shooter-thread {
            width: 185px;
          }

          .shooter-burst {
            left: 178px;
          }

          .shooter-one {
            top: 30%;
          }

          .shooter-two {
            top: 40%;
          }

          .shooter-three {
            bottom: 25%;
          }

          .shooter-four {
            top: 13%;
          }

          /* GALLERY */

          .gallery-column {
            width: 100%;
          }

          .main-image-wrapper {
            aspect-ratio:
              0.88 / 1;
          }

          .main-image-wrapper:hover
            .main-product-image {
            transform: none;
          }

          .image-web-overlay {
            opacity: 0.1;
          }

          .image-top-label {
            left: 15px;
            top: 15px;
            font-size: 6px;
          }

          .image-status {
            right: 15px;
            top: 15px;
            font-size: 6px;
          }

          .image-counter {
            right: 15px;
            bottom: 15px;
            font-size: 7px;
          }

          .gallery-arrow {
            width: 36px;
            height: 36px;
            opacity: 1;
            font-size: 12px;
          }

          .gallery-arrow-left {
            left: 10px;
          }

          .gallery-arrow-right {
            right: 10px;
          }

          /* THUMBNAILS */

          .thumbnail-scroll {
            margin-top: 10px;
            padding-bottom: 3px;
          }

          .thumbnail-track {
            display: flex;
            width: max-content;
            min-width: 0;
            gap: 8px;
          }

          .thumbnail {
            flex:
              0 0 76px;
            width: 76px;
            height: 76px;
          }

          .thumbnail-number {
            left: 6px;
            bottom: 5px;
            font-size: 6px;
          }

          .gallery-meta {
            font-size: 5px;
          }

          /* DETAILS */

          .details-column {
            display: flex;
            flex-direction: column;
            padding: 0;
          }

          .category-line {
            order: 0;
            margin-bottom: 14px;
            font-size: 7px;
          }

          .category-line-mark {
            width: 18px;
          }

          .product-name {
            order: 1;
            margin:
              0 0 16px;
            font-size:
              clamp(
                36px,
                11vw,
                54px
              );
            line-height: 0.92;
          }

          .name-underline {
            order: 2;
            margin-bottom: 23px;
          }

          .price-section {
            order: 3;
            margin-bottom: 25px;
          }

          .price {
            font-size: 22px;
          }

          .size-section {
            order: 4;
            margin-bottom: 27px;
          }

          .sizes-grid {
            grid-template-columns:
              repeat(4, 1fr);
          }

          .size-button {
            height: 54px;
          }

          .details-divider {
            order: 5;
            margin-bottom: 25px;
          }

          .description-section {
            order: 6;
            margin-bottom: 30px;
          }

          .description {
            font-size: 11px;
            line-height: 1.8;
          }

          .size-chart-section {
            order: 7;
            margin-bottom: 28px;
            padding-top: 23px;
          }

          .add-to-bag {
            order: 8;
            height: 59px;
          }

          .info-grid {
            order: 9;
          }

          .product-footer {
            grid-template-columns:
              1fr 1fr;
            padding: 22px 18px;
            font-size: 6px;
          }

          .footer-center {
            display: none;
          }

          .footer-right {
            justify-self: end;
          }

          .background-grid {
            background-size:
              55px 55px;
          }

        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 390px) {

          .product-container {
            padding-left: 14px;
            padding-right: 14px;
          }

          .product-header {
            padding: 0 14px;
          }

          .header-back {
            font-size: 6px;
          }

          .thumbnail {
            flex-basis: 70px;
            width: 70px;
            height: 70px;
          }

          .sizes-grid {
            gap: 6px;
          }

          .size-button {
            font-size: 10px;
          }

          .category-line {
            font-size: 6px;
          }

          .product-name {
            font-size: 34px;
          }

          .spider-one {
            left: -12%;
          }

          .spider-two {
            right: -10%;
          }

          .spider-three {
            left: -8%;
          }

          .spider-four {
            right: -10%;
          }

        }

      `}</style>

    </main>
  );
}