"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type MouseEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  created_at?: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  min_price: number;
  max_price: number;
  created_at: string;
};

const PRODUCTS_PER_PAGE = 12;

const SPIDER =
  "https://www.pngall.com/wp-content/uploads/13/Spiderman-Logo-No-Background.png";

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();

  const categorySlug =
    typeof params?.category === "string"
      ? params.category
      : Array.isArray(params?.category)
      ? params.category[0]
      : "";

  const ALL_CATEGORY: Category = {
    id: "all",
    name: "ALL COLLECTION",
    slug: "",
    min_price: 0,
    max_price: 5000,
    created_at: "",
  };

  const [products, setProducts] =
    useState<Product[]>([]);

  const [productsLoading, setProductsLoading] =
    useState(true);

  const [categories, setCategories] =
    useState<Category[]>([ALL_CATEGORY]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [mobileCategoryOpen, setMobileCategoryOpen] =
    useState(false);

  const [categoryMinPrice, setCategoryMinPrice] =
    useState(0);

  const [categoryMaxPrice, setCategoryMaxPrice] =
    useState(5000);

  const [maxPrice, setMaxPrice] =
    useState(5000);

  const [filterOpen, setFilterOpen] =
    useState(false);

  const [isMobile, setIsMobile] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [aboutOpen, setAboutOpen] =
    useState(false);

  const [contactOpen, setContactOpen] =
    useState(false);

  /* =====================================================
     MENU HANDLERS
  ===================================================== */

  const openMenu = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setAboutOpen(false);
    setContactOpen(false);
    setMenuOpen(true);
  };

  const closeMenu = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
  };

  const goHome = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(false);

    router.push("/");
  };

  const goToShop = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(false);

    router.push("/shop");
  };

  const goToAccount = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(false);

    router.push("/account");
  };

  const openAbout = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setContactOpen(false);
    setAboutOpen(true);
  };

  const closeAbout = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setAboutOpen(false);
    setMenuOpen(false);
  };

  const openContact = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(true);
  };

  const closeContact = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setContactOpen(false);
    setMenuOpen(false);
  };

  /* =====================================================
     SOCIAL
  ===================================================== */

  const isMobileDevice = () => {
    if (typeof window === "undefined") {
      return false;
    }

    return /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );
  };

  const openInstagram = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const url =
      "https://www.instagram.com/stoked.bd/";

    if (isMobileDevice()) {
      window.location.href = url;
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openFacebook = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const url =
      "https://www.facebook.com/share/1ba7vRfxAB/?mibextid=wwXIfr";

    if (isMobileDevice()) {
      window.location.href = url;
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openTikTok = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const url =
      "https://www.tiktok.com/@stoked.bd";

    if (isMobileDevice()) {
      window.location.href = url;
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =====================================================
     LOAD PRODUCTS
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          category_id,
          price,
          status,
          created_at,
          categories (
            id,
            name,
            slug
          ),
          product_images (
            id,
            product_id,
            image_url,
            sort_order
          )
        `)
        .eq("status", "AVAILABLE")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "CATEGORY PRODUCT LOAD ERROR:",
          error
        );

        if (mounted) {
          setProducts([]);
          setProductsLoading(false);
        }

        return;
      }

      if (!mounted) return;

      const formattedProducts: Product[] =
        (data || []).map((product: any) => {
          const images =
            Array.isArray(product.product_images)
              ? [...product.product_images].sort(
                  (a, b) =>
                    Number(a.sort_order || 0) -
                    Number(b.sort_order || 0)
                )
              : [];

          const category =
            Array.isArray(product.categories)
              ? product.categories[0]
              : product.categories;

          return {
            id: product.id,
            name: product.name,
            category:
              category?.name || "NO COLLECTION",
            price: Number(product.price) || 0,
            image:
              images[0]?.image_url || "",
            created_at:
              product.created_at,
          };
        });

      setProducts(formattedProducts);
      setProductsLoading(false);
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     LOAD CATEGORIES
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      const {
        data,
        error,
      } = await supabase
        .from("categories")
        .select(`
          id,
          name,
          slug,
          min_price,
          max_price,
          created_at
        `)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error(
          "CATEGORY LOAD ERROR:",
          error
        );

        if (mounted) {
          setCategories([
            ALL_CATEGORY,
          ]);

          setCategoriesLoading(false);
        }

        return;
      }

      if (!mounted) return;

      const formattedCategories: Category[] =
        (data || [])
          .filter(
            (category: Category) =>
              category.name
                .trim()
                .toUpperCase() !==
              "ALL COLLECTION"
          )
          .map(
            (category: Category) => ({
              ...category,
              min_price:
                Number.isFinite(
                  Number(category.min_price)
                )
                  ? Number(category.min_price)
                  : 0,
              max_price:
                Number.isFinite(
                  Number(category.max_price)
                )
                  ? Number(category.max_price)
                  : 5000,
            })
          );

      setCategories([
        ALL_CATEGORY,
        ...formattedCategories,
      ]);

      const currentCategory =
        formattedCategories.find(
          (category) =>
            category.slug ===
            categorySlug
        );

      if (currentCategory) {
        setSelectedCategory(
          currentCategory.name
        );
        setCurrentPage(1);
      } else {
        router.replace("/shop");
      }

      setCategoriesLoading(false);
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, [categorySlug, router]);

  /* =====================================================
     PRICE RANGE
  ===================================================== */

  useEffect(() => {
    if (productsLoading) return;

    const categoryProducts =
      selectedCategory
        ? products.filter(
            (product) =>
              product.category ===
              selectedCategory
          )
        : [];

    if (
      categoryProducts.length === 0
    ) {
      setCategoryMinPrice(0);
      setCategoryMaxPrice(0);
      setMaxPrice(0);
      setCurrentPage(1);
      return;
    }

    const prices =
      categoryProducts
        .map((product) =>
          Number(product.price)
        )
        .filter((price) =>
          Number.isFinite(price)
        );

    if (prices.length === 0) {
      setCategoryMinPrice(0);
      setCategoryMaxPrice(5000);
      setMaxPrice(5000);
      setCurrentPage(1);
      return;
    }

    const realMinPrice =
      Math.min(...prices);

    const realMaxPrice =
      Math.max(...prices);

    setCategoryMinPrice(
      realMinPrice
    );

    setCategoryMaxPrice(
      realMaxPrice
    );

    setMaxPrice((current) => {
      if (
        current < realMinPrice ||
        current > realMaxPrice
      ) {
        return realMaxPrice;
      }

      return current;
    });

    setCurrentPage(1);
  }, [
    products,
    productsLoading,
    selectedCategory,
  ]);

  /* =====================================================
     MOBILE CHECK
  ===================================================== */

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth <= 768
      );
    };

    checkMobile();

    window.addEventListener(
      "resize",
      checkMobile
    );

    return () => {
      window.removeEventListener(
        "resize",
        checkMobile
      );
    };
  }, []);

  /* =====================================================
     KEEP PRICE INSIDE RANGE
  ===================================================== */

  useEffect(() => {
    setMaxPrice((current) => {
      if (
        current < categoryMinPrice
      ) {
        return categoryMinPrice;
      }

      if (
        current > categoryMaxPrice
      ) {
        return categoryMaxPrice;
      }

      return current;
    });

    setCurrentPage(1);
  }, [
    categoryMinPrice,
    categoryMaxPrice,
  ]);

  /* =====================================================
     FILTER PRODUCTS
  ===================================================== */

  const filteredProducts =
    products.filter(
      (product) => {
        const categoryMatch =
          product.category ===
          selectedCategory;

        const priceMatch =
          product.price >=
            categoryMinPrice &&
          product.price <=
            maxPrice;

        return (
          categoryMatch &&
          priceMatch
        );
      }
    );

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
        PRODUCTS_PER_PAGE
    )
  );

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const startIndex =
    (currentPage - 1) *
    PRODUCTS_PER_PAGE;

  const paginatedProducts =
    filteredProducts.slice(
      startIndex,
      startIndex +
        PRODUCTS_PER_PAGE
    );

  /* =====================================================
     CATEGORY SELECT
  ===================================================== */

  const selectCategory = (
    category: Category
  ) => {
    setSelectedCategory(
      category.name
    );

    setCurrentPage(1);
    setMobileCategoryOpen(false);

    if (isMobile) {
      setFilterOpen(false);
    }

    if (category.id === "all") {
      router.push("/shop");
      return;
    }

    router.push(
      `/shop/${category.slug}`
    );
  };

  /* =====================================================
     PAGE CHANGE
  ===================================================== */

  const changePage = (
    page: number
  ) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main
      className="shop-page"
      style={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        background: "#080303",
        color: "#f5f5f3",
      }}
    >
      {/* =====================================================
          BACKGROUND
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
          <div className="spider spider-1">
            <img
              src={SPIDER}
              alt=""
              draggable={false}
            />
          </div>

          <div className="spider spider-2">
            <img
              src={SPIDER}
              alt=""
              draggable={false}
            />
          </div>

          <div className="spider spider-3">
            <img
              src={SPIDER}
              alt=""
              draggable={false}
            />
          </div>

          <div className="spider spider-4">
            <img
              src={SPIDER}
              alt=""
              draggable={false}
            />
          </div>

          <div className="spider spider-5">
            <img
              src={SPIDER}
              alt=""
              draggable={false}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 5,
        }}
      >
        {/* =====================================================
            HEADER
            EXACT SHOP HEADER
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
                padding: "0 9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color:
                  "rgba(255,255,255,.72)",
                textDecoration: "none",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "8px",
                fontWeight: 600,
                letterSpacing: ".11em",
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
                padding: "0 9px",
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
                padding: "0 9px",
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

        {/* =====================================================
            DESKTOP
            EXACT SHOP MASTER LAYOUT
        ===================================================== */}

        {!isMobile && (
          <section
            style={{
              height: "calc(100vh - 92px)",
              minHeight: "650px",
              display: "grid",
              gridTemplateColumns:
                "300px minmax(0, 1fr)",
              gap:
                "clamp(45px, 6vw, 100px)",
              padding:
                "92px 6vw 35px",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            {/* =================================================
                LEFT FILTER
            ================================================= */}

            <aside
              style={{
                position: "relative",
                height: "100%",
                padding:
                  "8px 0 8px 30px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "1px",
                  height: "100%",
                  background:
                    "linear-gradient(to bottom, rgba(155,17,30,.95) 0%, rgba(155,17,30,.45) 35%, rgba(255,255,255,.14) 75%, rgba(255,255,255,.02) 100%)",
                  boxShadow:
                    "0 0 16px rgba(155,17,30,.25)",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: "-2px",
                  top: 0,
                  width: "3px",
                  height: "52px",
                  background:
                    "linear-gradient(to bottom, #a91525, rgba(169,21,37,0))",
                  boxShadow:
                    "0 0 14px rgba(169,21,37,.55)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: "12px",
                  marginBottom: "48px",
                }}
              >
                <span
                  style={{
                    fontFamily:
                      '"Space Grotesk", sans-serif',
                    fontSize: "13px",
                    fontWeight: 600,
                    letterSpacing: ".23em",
                    color:
                      "rgba(255,255,255,.9)",
                  }}
                >
                  FILTER
                </span>

                <span
                  style={{
                    fontFamily:
                      '"Space Grotesk", sans-serif',
                    fontSize: "8px",
                    fontWeight: 500,
                    letterSpacing: ".16em",
                    color:
                      "rgba(255,255,255,.38)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedCategory ||
                    "CATEGORY"}
                </span>
              </div>

              {/* PRICE RANGE */}

              <div
                style={{
                  marginBottom: "45px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    marginBottom: "17px",
                  }}
                >
                  <span
                    style={{
                      fontFamily:
                        '"Space Grotesk", sans-serif',
                      fontSize: "9px",
                      letterSpacing: ".2em",
                      color:
                        "rgba(255,255,255,.48)",
                    }}
                  >
                    PRICE RANGE
                  </span>

                  <span
                    style={{
                      fontFamily:
                        '"Space Grotesk", sans-serif',
                      fontSize: "11px",
                      color:
                        "rgba(255,255,255,.78)",
                    }}
                  >
                    ৳{" "}
                    {categoryMinPrice.toLocaleString()}{" "}
                    — ৳{" "}
                    {maxPrice.toLocaleString()}
                  </span>
                </div>

                <input
                  type="range"
                  min={categoryMinPrice}
                  max={categoryMaxPrice}
                  step="1"
                  value={Math.min(
                    Math.max(
                      maxPrice,
                      categoryMinPrice
                    ),
                    categoryMaxPrice
                  )}
                  onChange={(e) =>
                    setMaxPrice(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  disabled={
                    categoryMinPrice ===
                    categoryMaxPrice
                  }
                  style={{
                    width: "100%",
                    height: "3px",
                    accentColor: "#a91525",
                    cursor:
                      categoryMinPrice ===
                      categoryMaxPrice
                        ? "default"
                        : "pointer",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginTop: "10px",
                    fontFamily:
                      '"Space Grotesk", sans-serif',
                    fontSize: "7px",
                    letterSpacing: ".14em",
                    color:
                      "rgba(255,255,255,.24)",
                  }}
                >
                  <span>
                    ৳{" "}
                    {categoryMinPrice.toLocaleString()}
                  </span>

                  <span>
                    ৳{" "}
                    {categoryMaxPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* CATEGORIES */}

              <div>
                <div
                  style={{
                    marginBottom: "15px",
                  }}
                >
                  <span
                    style={{
                      fontFamily:
                        '"Space Grotesk", sans-serif',
                      fontSize: "10px",
                      letterSpacing: ".2em",
                      color:
                        "rgba(255,255,255,.48)",
                    }}
                  >
                    CATEGORIES
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                  }}
                >
                  {categoriesLoading ? (
                    <div
                      style={{
                        color:
                          "rgba(255,255,255,.25)",
                        fontFamily:
                          '"Space Grotesk", sans-serif',
                        fontSize: "9px",
                        letterSpacing: ".16em",
                        padding:
                          "15px 0",
                      }}
                    >
                      LOADING...
                    </div>
                  ) : (
                    categories.map(
                      (
                        category,
                        index
                      ) => {
                        const active =
                          selectedCategory ===
                          category.name;

                        return (
                          <button
                            key={
                              category.id
                            }
                            type="button"
                            onClick={() =>
                              selectCategory(
                                category
                              )
                            }
                            style={{
                              position:
                                "relative",
                              width:
                                "100%",
                              height:
                                "46px",
                              padding:
                                "0 0 0 18px",
                              border: 0,
                              background:
                                "transparent",
                              color:
                                active
                                  ? "rgba(255,255,255,.95)"
                                  : "rgba(255,255,255,.43)",
                              textAlign:
                                "left",
                              fontFamily:
                                '"Space Grotesk", sans-serif',
                              fontSize:
                                "13px",
                              fontWeight:
                                active
                                  ? 600
                                  : 500,
                              letterSpacing:
                                ".15em",
                              cursor:
                                "pointer",
                              transition:
                                "color .25s ease, padding-left .25s ease",
                            }}
                          >
                            <span
                              style={{
                                position:
                                  "absolute",
                                left: 0,
                                top:
                                  "50%",
                                transform:
                                  "translateY(-50%)",
                                width:
                                  active
                                    ? "7px"
                                    : "0",
                                height:
                                  "1px",
                                background:
                                  "#b01829",
                                boxShadow:
                                  active
                                    ? "0 0 10px rgba(176,24,41,.75)"
                                    : "none",
                                transition:
                                  "width .25s ease",
                              }}
                            />

                            <span
                              style={{
                                display:
                                  "inline-block",
                                width:
                                  "31px",
                                fontSize:
                                  "8px",
                                color:
                                  active
                                    ? "rgba(255,255,255,.38)"
                                    : "rgba(255,255,255,.17)",
                              }}
                            >
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            {category.name}
                          </button>
                        );
                      }
                    )
                  )}
                </div>
              </div>
            </aside>

            {/* =================================================
                PRODUCT SECTION
                EXACT SHOP SCROLL
            ================================================= */}

            <div
              className="stoked-product-scroll"
              style={{
                minWidth: 0,
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: "8px",
                scrollbarWidth: "thin",
                scrollbarColor:
                  "#a91525 rgba(255,255,255,.04)",
              }}
            >
              <div
                style={{
                  paddingTop: "8px",
                  paddingBottom: "38px",
                }}
              >
                <div
                  style={{
                    position:
                      "relative",
                    display:
                      "inline-block",
                    paddingBottom:
                      "13px",
                  }}
                >
                  <span
                    style={{
                      fontFamily:
                        '"Space Grotesk", sans-serif',
                      fontSize:
                        "clamp(48px, 6vw, 86px)",
                      fontWeight: 500,
                      lineHeight: ".82",
                      letterSpacing:
                        "-.07em",
                      color:
                        "rgba(255,255,255,.94)",
                    }}
                  >
                    COLLECTION
                  </span>

                  <span
                    style={{
                      position:
                        "absolute",
                      left: 0,
                      bottom: 0,
                      width: "48px",
                      height: "1px",
                      background:
                        "#a91525",
                      boxShadow:
                        "0 0 10px rgba(169,21,37,.55)",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "9px",
                    marginTop:
                      "14px",
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "1px",
                      background:
                        "rgba(169,21,37,.8)",
                    }}
                  />

                  <span
                    style={{
                      fontFamily:
                        '"Space Grotesk", sans-serif',
                      fontSize: "8px",
                      fontWeight: 600,
                      letterSpacing:
                        ".2em",
                      color:
                        "rgba(255,255,255,.48)",
                    }}
                  >
                    {selectedCategory}
                  </span>
                </div>
              </div>

              {/* =================================================
                  DESKTOP PRODUCTS
                  EXACT SHOP PRODUCT GRID
              ================================================= */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "62px 48px",
                  paddingLeft: "2.5%",
                  paddingRight: "2.5%",
                  paddingBottom: "45px",
                }}
              >
                {productsLoading ? (
                  <div
                    style={{
                      gridColumn:
                        "1 / -1",
                      padding:
                        "120px 0",
                      textAlign:
                        "center",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontFamily:
                          '"Space Grotesk", sans-serif',
                        fontSize: "10px",
                        letterSpacing:
                          ".2em",
                        opacity: 0.4,
                      }}
                    >
                      LOADING COLLECTION...
                    </p>
                  </div>
                ) : (
                  <>
                    {paginatedProducts.map(
                      (
                        product,
                        index
                      ) => (
                        <Link
                          href={`/product/${product.id}`}
                          key={
                            product.id
                          }
                          style={{
                            color:
                              "inherit",
                            textDecoration:
                              "none",
                            display:
                              "block",
                          }}
                        >
                          <div
                            style={{
                              position:
                                "relative",
                              width:
                                "100%",

                              /* FIX:
                                 ALL DESKTOP PRODUCT
                                 CARDS NOW HAVE THE
                                 SAME HEIGHT */
                              aspectRatio:
                                "4 / 4.7",

                              overflow:
                                "hidden",
                              background:
                                "linear-gradient(145deg, rgba(35,8,8,.75), rgba(7,3,3,.95))",
                              border:
                                "1px solid rgba(255,255,255,.07)",
                            }}
                          >
                            {product.image ? (
                              <img
                                src={
                                  product.image
                                }
                                alt={
                                  product.name
                                }
                                style={{
                                  width:
                                    "100%",
                                  height:
                                    "100%",
                                  objectFit:
                                    "cover",
                                  position:
                                    "relative",
                                  zIndex: 2,
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  position:
                                    "absolute",
                                  inset: 0,
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize:
                                      "clamp(35px, 5vw, 75px)",
                                    fontWeight:
                                      600,
                                    letterSpacing:
                                      "-.07em",
                                    opacity:
                                      0.12,
                                  }}
                                >
                                  STOKED
                                </span>
                              </div>
                            )}

                            <span
                              style={{
                                position:
                                  "absolute",
                                top: "18px",
                                left: "18px",
                                zIndex: 4,
                                fontSize: "9px",
                                letterSpacing:
                                  ".15em",
                                opacity: 0.5,
                              }}
                            >
                              {String(
                                startIndex +
                                  index +
                                  1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            <span
                              style={{
                                position:
                                  "absolute",
                                top: "18px",
                                right: "18px",
                                zIndex: 4,
                                fontSize: "8px",
                                letterSpacing:
                                  ".15em",
                                opacity: 0.45,
                              }}
                            >
                              AVAILABLE
                            </span>

                            <div
                              style={{
                                position:
                                  "absolute",
                                bottom: "18px",
                                right: "18px",
                                zIndex: 4,
                                width: "45px",
                                height: "45px",
                                borderRadius:
                                  "50%",
                                border:
                                  "1px solid rgba(255,255,255,.18)",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                fontSize:
                                  "16px",
                                background:
                                  "rgba(0,0,0,.18)",
                              }}
                            >
                              ↗
                            </div>
                          </div>

                          <div
                            style={{
                              paddingTop:
                                "16px",
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              gap:
                                "20px",
                            }}
                          >
                            <div>
                              <h2
                                style={{
                                  margin: 0,
                                  fontSize:
                                    "clamp(13px, 1.4vw, 17px)",
                                  fontWeight:
                                    500,
                                  letterSpacing:
                                    "-.02em",
                                }}
                              >
                                {
                                  product.name
                                }
                              </h2>

                              <p
                                style={{
                                  margin:
                                    "7px 0 0",
                                  fontSize:
                                    "8px",
                                  letterSpacing:
                                    ".14em",
                                  opacity:
                                    0.4,
                                }}
                              >
                                {
                                  product.category
                                }
                              </p>
                            </div>

                            <span
                              style={{
                                fontSize:
                                  "11px",
                                whiteSpace:
                                  "nowrap",
                                opacity:
                                  0.7,
                              }}
                            >
                              ৳{" "}
                              {product.price.toLocaleString()}
                            </span>
                          </div>
                        </Link>
                      )
                    )}

                    {filteredProducts.length ===
                      0 && (
                      <div
                        style={{
                          gridColumn:
                            "1 / -1",
                          padding:
                            "120px 0",
                          textAlign:
                            "center",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontFamily:
                              '"Space Grotesk", sans-serif',
                            fontSize:
                              "10px",
                            letterSpacing:
                              ".2em",
                            opacity:
                              0.4,
                          }}
                        >
                          NO PIECES FOUND
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {!productsLoading && (
                <Pagination
                  currentPage={
                    currentPage
                  }
                  totalPages={
                    totalPages
                  }
                  onPageChange={
                    changePage
                  }
                />
              )}
            </div>
          </section>
        )}

        {/* =====================================================
            MOBILE
            EXISTING MOBILE DESIGN PRESERVED
        ===================================================== */}

        {isMobile && (
          <section
            style={{
              padding:
                "94px 6vw 0",
            }}
          >
            <div
              style={{
                marginBottom:
                  "30px",
              }}
            >
              <div
                style={{
                  position:
                    "relative",
                  display:
                    "inline-block",
                  paddingBottom:
                    "12px",
                }}
              >
                <span
                  style={{
                    display:
                      "block",
                    fontFamily:
                      '"Space Grotesk", sans-serif',
                    fontSize:
                      "clamp(42px, 13vw, 64px)",
                    fontWeight: 500,
                    lineHeight:
                      ".85",
                    letterSpacing:
                      "-.065em",
                  }}
                >
                  COLLECTION
                </span>

                <span
                  style={{
                    position:
                      "absolute",
                    left: 0,
                    bottom: 0,
                    width: "42px",
                    height: "1px",
                    background:
                      "#a91525",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                padding:
                  "18px 0",
                borderTop:
                  "1px solid rgba(255,255,255,.12)",
                borderBottom:
                  "1px solid rgba(255,255,255,.09)",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: "15px",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "14px",
                letterSpacing:
                  ".15em",
                color:
                  "rgba(255,255,255,.42)",
              }}
            >
              <span>
                SELECTED PIECES
              </span>

              <span>
                ৳{" "}
                {categoryMinPrice.toLocaleString()}
                {" — "}
                ৳{" "}
                {maxPrice.toLocaleString()}
              </span>
            </div>

            <div
              style={{
                marginTop: "18px",
                position: "relative",
              }}
            >
              <div
                style={{
                  marginBottom: "9px",
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize: "14px",
                  letterSpacing:
                    ".18em",
                  color:
                    "rgba(255,255,255,.35)",
                }}
              >
                CATEGORY
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileCategoryOpen(
                    (value) =>
                      !value
                  )
                }
                style={{
                  width: "100%",
                  minHeight: "52px",
                  padding: "0 15px",
                  border:
                    "1px solid rgba(255,255,255,.10)",
                  background:
                    "linear-gradient(145deg, rgba(35,8,8,.72), rgba(7,3,3,.9))",
                  color:
                    "rgba(255,255,255,.82)",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize: "14px",
                  letterSpacing:
                    ".14em",
                  textAlign:
                    "left",
                  cursor:
                    "pointer",
                }}
              >
                <span>
                  {selectedCategory ||
                    "CATEGORY"}
                </span>

                <span>
                  {mobileCategoryOpen
                    ? "↑"
                    : "↓"}
                </span>
              </button>

              {mobileCategoryOpen && (
                <div
                  style={{
                    marginTop: "5px",
                    width: "100%",
                    border:
                      "1px solid rgba(255,255,255,.09)",
                    background:
                      "rgba(8,3,3,.97)",
                    overflow:
                      "hidden",
                    position:
                      "relative",
                    zIndex: 50,
                  }}
                >
                  {categories.map(
                    (
                      category,
                      index
                    ) => {
                      const active =
                        selectedCategory ===
                        category.name;

                      return (
                        <button
                          key={
                            category.id
                          }
                          type="button"
                          onClick={() =>
                            selectCategory(
                              category
                            )
                          }
                          style={{
                            width:
                              "100%",
                            minHeight:
                              "46px",
                            padding:
                              "0 14px",
                            border: 0,
                            borderBottom:
                              "1px solid rgba(255,255,255,.05)",
                            background:
                              active
                                ? "rgba(169,21,37,.12)"
                                : "transparent",
                            color:
                              active
                                ? "#fff"
                                : "rgba(255,255,255,.48)",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "10px",
                            textAlign:
                              "left",
                            fontFamily:
                              '"Space Grotesk", sans-serif',
                            fontSize:
                              "14px",
                            letterSpacing:
                              ".14em",
                            cursor:
                              "pointer",
                          }}
                        >
                          <span
                            style={{
                              width:
                                "24px",
                              fontSize:
                                "8px",
                              opacity:
                                0.5,
                            }}
                          >
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <span>
                            {category.name ===
                            "ALL COLLECTION"
                              ? "ALL CATEGORY"
                              : category.name}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            <div
              style={{
                padding:
                  "18px 0 2px",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  marginBottom:
                    "11px",
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize: "14px",
                  letterSpacing:
                    ".16em",
                  color:
                    "rgba(255,255,255,.42)",
                }}
              >
                <span>
                  PRICE RANGE
                </span>

                <span>
                  ৳{" "}
                  {maxPrice.toLocaleString()}
                </span>
              </div>

              <input
                type="range"
                min={categoryMinPrice}
                max={categoryMaxPrice}
                step="1"
                value={Math.min(
                  Math.max(
                    maxPrice,
                    categoryMinPrice
                  ),
                  categoryMaxPrice
                )}
                onChange={(e) =>
                  setMaxPrice(
                    Number(
                      e.target.value
                    )
                  )
                }
                disabled={
                  categoryMinPrice ===
                  categoryMaxPrice
                }
                style={{
                  width: "100%",
                  height: "3px",
                  accentColor:
                    "#a91525",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "38px 12px",
                paddingBottom:
                  "45px",
              }}
            >
              {productsLoading ? (
                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                    padding:
                      "80px 0",
                    textAlign:
                      "center",
                  }}
                >
                  LOADING COLLECTION...
                </div>
              ) : (
                <>
                  {paginatedProducts.map(
                    (
                      product
                    ) => (
                      <Link
                        key={
                          product.id
                        }
                        href={`/product/${product.id}`}
                        style={{
                          color:
                            "inherit",
                          textDecoration:
                            "none",
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            position:
                              "relative",
                            width:
                              "100%",
                            aspectRatio:
                              "4 / 5",
                            overflow:
                              "hidden",
                            background:
                              "linear-gradient(145deg, rgba(35,8,8,.75), rgba(7,3,3,.95))",
                            border:
                              "1px solid rgba(255,255,255,.07)",
                          }}
                        >
                          {product.image ? (
                            <img
                              src={
                                product.image
                              }
                              alt={
                                product.name
                              }
                              style={{
                                width:
                                  "100%",
                                height:
                                  "100%",
                                objectFit:
                                  "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width:
                                  "100%",
                                height:
                                  "100%",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                              }}
                            >
                              STOKED
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            paddingTop:
                              "12px",
                          }}
                        >
                          <h2
                            style={{
                              margin: 0,
                              fontSize:
                                "17px",
                              fontWeight:
                                500,
                            }}
                          >
                            {
                              product.name
                            }
                          </h2>

                          <p
                            style={{
                              margin:
                                "6px 0 0",
                              fontSize:
                                "12px",
                              opacity:
                                0.4,
                            }}
                          >
                            {
                              product.category
                            }
                          </p>

                          <span
                            style={{
                              display:
                                "block",
                              marginTop:
                                "8px",
                              fontSize:
                                "15px",
                              opacity:
                                0.7,
                            }}
                          >
                            ৳{" "}
                            {product.price.toLocaleString()}
                          </span>
                        </div>
                      </Link>
                    )
                  )}

                  {filteredProducts.length ===
                    0 && (
                    <div
                      style={{
                        gridColumn:
                          "1 / -1",
                        padding:
                          "80px 0",
                        textAlign:
                          "center",
                      }}
                    >
                      NO PIECES FOUND
                    </div>
                  )}
                </>
              )}
            </div>

            {!productsLoading && (
              <Pagination
                currentPage={
                  currentPage
                }
                totalPages={
                  totalPages
                }
                onPageChange={
                  changePage
                }
                mobile
              />
            )}
          </section>
        )}

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer
          style={{
            padding: "35px 6vw",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            fontFamily:
              '"Space Grotesk", sans-serif',
            fontSize: "8px",
            letterSpacing: ".15em",
            color:
              "rgba(255,255,255,.35)",
          }}
        >
          <span>
            © 2026 STOKED BD
          </span>

          <Link
            href="/"
            style={{
              color: "inherit",
              textDecoration:
                "none",
            }}
          >
            BACK TO HOME ↑
          </Link>

          <span>
            EST. 2026
          </span>
        </footer>
      </div>

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
            background:
              "rgba(3,2,2,.88)",
            backdropFilter:
              "blur(22px)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width:
                "min(680px, 100%)",
              padding:
                isMobile
                  ? "35px 24px"
                  : "50px",
              position:
                "relative",
              border:
                "1px solid rgba(255,255,255,.10)",
              background:
                "linear-gradient(145deg, rgba(35,5,5,.96), rgba(7,2,2,.98))",
            }}
          >
            <button
              type="button"
              onClick={closeAbout}
              style={{
                position:
                  "absolute",
                top: "20px",
                right: "20px",
                border: 0,
                background:
                  "transparent",
                color:
                  "rgba(255,255,255,.5)",
                cursor:
                  "pointer",
              }}
            >
              CLOSE ×
            </button>

            <div
              style={{
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize:
                  "clamp(42px, 8vw, 78px)",
                lineHeight: ".85",
                letterSpacing:
                  "-.065em",
                marginBottom:
                  "30px",
              }}
            >
              ABOUT
            </div>

            <div
              style={{
                width: "45px",
                height: "1px",
                background:
                  "#a91525",
                marginBottom:
                  "30px",
              }}
            />

            <p
              style={{
                margin: 0,
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "17px",
                lineHeight: 1.7,
                color:
                  "rgba(255,255,255,.58)",
              }}
            >
              STOKED is a Bangladesh-based
              fashion label built around
              bold silhouettes, expressive
              graphics and a darker visual
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
            background:
              "rgba(3,2,2,.88)",
            backdropFilter:
              "blur(22px)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width:
                "min(680px, 100%)",
              padding:
                isMobile
                  ? "35px 24px"
                  : "50px",
              position:
                "relative",
              border:
                "1px solid rgba(255,255,255,.10)",
              background:
                "linear-gradient(145deg, rgba(35,5,5,.96), rgba(7,2,2,.98))",
            }}
          >
            <button
              type="button"
              onClick={closeContact}
              style={{
                position:
                  "absolute",
                top: "20px",
                right: "20px",
                border: 0,
                background:
                  "transparent",
                color:
                  "rgba(255,255,255,.5)",
                cursor:
                  "pointer",
              }}
            >
              CLOSE ×
            </button>

            <div
              style={{
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize:
                  "clamp(42px, 8vw, 78px)",
                lineHeight: ".85",
                letterSpacing:
                  "-.065em",
                marginBottom:
                  "30px",
              }}
            >
              CONTACT
            </div>

            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={openInstagram}
                style={
                  socialButtonStyle
                }
              >
                INSTAGRAM
              </button>

              <button
                type="button"
                onClick={openFacebook}
                style={
                  socialButtonStyle
                }
              >
                FACEBOOK
              </button>

              <button
                type="button"
                onClick={openTikTok}
                style={
                  socialButtonStyle
                }
              >
                TIKTOK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MENU
      ===================================================== */}

      <div
        className={`stoked-menu ${
          menuOpen
            ? "stoked-menu-visible"
            : ""
        }`}
        aria-hidden={!menuOpen}
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
          onClick={(e) =>
            e.stopPropagation()
          }
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
          DESKTOP PRODUCT SCROLLBAR
      ===================================================== */}

      <style jsx global>{`
        .shop-page
          .stoked-product-scroll::-webkit-scrollbar {
          width: 5px;
        }

        .shop-page
          .stoked-product-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.025);
          border-radius: 999px;
        }

        .shop-page
          .stoked-product-scroll::-webkit-scrollbar-thumb {
          background: #a91525;
          border-radius: 999px;
          box-shadow: 0 0 8px rgba(169, 21, 37, 0.35);
        }

        .shop-page
          .stoked-product-scroll::-webkit-scrollbar-thumb:hover {
          background: #c51d32;
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  mobile = false,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (
    page: number
  ) => void;
  mobile?: boolean;
}) {
  const pages = Array.from(
    { length: totalPages },
    (_, index) =>
      index + 1
  );

  const size = mobile
    ? "32px"
    : "38px";

  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "center",
        alignItems:
          "center",
        gap: mobile
          ? "5px"
          : "7px",
        padding:
          mobile
            ? "20px 0 75px"
            : "30px 0 90px",
        flexWrap:
          "wrap",
      }}
    >
      <button
        type="button"
        disabled={
          currentPage === 1
        }
        onClick={() =>
          onPageChange(
            currentPage - 1
          )
        }
        style={{
          width: size,
          height: size,
          border:
            "1px solid rgba(255,255,255,.09)",
          background:
            "rgba(0,0,0,.18)",
          color:
            currentPage === 1
              ? "rgba(255,255,255,.18)"
              : "#fff",
          cursor:
            currentPage === 1
              ? "default"
              : "pointer",
        }}
      >
        ←
      </button>

      {pages.map(
        (page) => {
          const active =
            currentPage ===
            page;

          return (
            <button
              key={page}
              type="button"
              onClick={() =>
                onPageChange(
                  page
                )
              }
              style={{
                width: size,
                height: size,
                border:
                  active
                    ? "1px solid rgba(169,21,37,.9)"
                    : "1px solid rgba(255,255,255,.08)",
                background:
                  active
                    ? "rgba(169,21,37,.16)"
                    : "rgba(0,0,0,.16)",
                color:
                  active
                    ? "#fff"
                    : "rgba(255,255,255,.42)",
                cursor:
                  "pointer",
              }}
            >
              {String(
                page
              ).padStart(
                2,
                "0"
              )}
            </button>
          );
        }
      )}

      <button
        type="button"
        disabled={
          currentPage ===
          totalPages
        }
        onClick={() =>
          onPageChange(
            currentPage + 1
          )
        }
        style={{
          width: size,
          height: size,
          border:
            "1px solid rgba(255,255,255,.09)",
          background:
            "rgba(0,0,0,.18)",
          color:
            currentPage ===
            totalPages
              ? "rgba(255,255,255,.18)"
              : "#fff",
          cursor:
            currentPage ===
            totalPages
              ? "default"
              : "pointer",
        }}
      >
        →
      </button>
    </div>
  );
}

/* =========================================================
   SOCIAL BUTTON
========================================================= */

const socialButtonStyle: React.CSSProperties = {
  minHeight: "56px",
  width: "100%",
  border:
    "1px solid rgba(255,255,255,.08)",
  background:
    "rgba(255,255,255,.025)",
  color:
    "rgba(255,255,255,.68)",
  textAlign: "left",
  padding: "0 18px",
  fontFamily:
    '"Space Grotesk", sans-serif',
  fontSize: "12px",
  letterSpacing: ".15em",
  cursor: "pointer",
};