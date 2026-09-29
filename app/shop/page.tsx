"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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

export default function Shop() {
  const router = useRouter();
  const pathname = usePathname();

  const ALL_CATEGORY: Category = {
    id: "all",
    name: "ALL COLLECTION",
    slug: "",
    min_price: 0,
    max_price: 5000,
    created_at: "",
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] =
    useState(true);

  const [categories, setCategories] =
    useState<Category[]>([ALL_CATEGORY]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [selectedCategory, setSelectedCategory] =
    useState("ALL COLLECTION");

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

  /*
    =====================================================
    LOAD PRODUCTS FROM SUPABASE
    =====================================================
  */

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
          "SHOP PRODUCT LOAD ERROR:",
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
                    a.sort_order - b.sort_order
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
            price: Number(product.price),
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

  /*
    =====================================================
    LOAD CATEGORIES FROM SUPABASE
    =====================================================
  */

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
          "SHOP CATEGORY LOAD ERROR:",
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

      /*
        =================================================
        ALL COLLECTION RANGE
        =================================================
      */

      const allPrices = products
        .map((product) =>
          Number(product.price)
        )
        .filter((price) =>
          Number.isFinite(price)
        );

      const allMinPrice =
        allPrices.length > 0
          ? Math.min(...allPrices)
          : 0;

      const allMaxPrice =
        allPrices.length > 0
          ? Math.max(...allPrices)
          : 5000;

      const allCategory: Category = {
        ...ALL_CATEGORY,
        min_price:
          allMinPrice,
        max_price:
          allMaxPrice,
      };

      setCategories([
        allCategory,
        ...formattedCategories,
      ]);

      /*
        =================================================
        DETECT CURRENT CATEGORY FROM URL
        =================================================
      */

      if (
        pathname === "/shop" ||
        pathname === null
      ) {
        setSelectedCategory(
          "ALL COLLECTION"
        );
        setCurrentPage(1);
      } else {
        const currentSlug =
          pathname
            .split("/")
            .filter(Boolean)
            .pop();

        const currentCategory =
          formattedCategories.find(
            (category) =>
              category.slug ===
              currentSlug
          );

        if (currentCategory) {
          setSelectedCategory(
            currentCategory.name
          );
          setCurrentPage(1);
        } else {
          setSelectedCategory(
            "ALL COLLECTION"
          );
          setCurrentPage(1);
        }
      }

      setCategoriesLoading(false);
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, [pathname, products]);

  /*
    =====================================================
    CALCULATE REAL PRICE RANGE FROM PRODUCTS
    =====================================================
  */

  useEffect(() => {
    if (productsLoading) return;

    const categoryProducts =
      selectedCategory ===
      "ALL COLLECTION"
        ? products
        : products.filter(
            (product) =>
              product.category ===
              selectedCategory
          );

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

  /*
    =====================================================
    DETECT MOBILE
    =====================================================
  */

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

  /*
    =====================================================
    KEEP MAX PRICE INSIDE CURRENT CATEGORY RANGE
    =====================================================
  */

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

  /*
    =====================================================
    FILTER PRODUCTS
    =====================================================
  */

  const filteredProducts =
    products.filter(
      (product) => {
        const categoryMatch =
          selectedCategory ===
            "ALL COLLECTION" ||
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

  /*
    =====================================================
    PAGINATION
    =====================================================
  */

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

  /*
    =====================================================
    CATEGORY SELECT
    =====================================================
  */

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
    } else {
      router.push(
        `/shop/${category.slug}`
      );
    }
  };

  /*
    =====================================================
    PAGE CHANGE
    =====================================================
  */

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

  /*
    =====================================================
    RENDER
    =====================================================
  */

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
      ====================================================== */}

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
        {/* =================================================
            HEADER
        ================================================== */}

        <header
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            alignItems: "center",
            padding: isMobile
              ? "16px 6vw"
              : "22px 6vw",
            minHeight: isMobile
              ? "64px"
              : "70px",
          }}
        >
          {/* LOGO */}

          <Link
            href="/"
            style={{
              color:
                "rgba(255,255,255,.9)",
              textDecoration:
                "none",
              fontFamily:
                '"Space Grotesk", sans-serif',
              fontSize:
                isMobile
                  ? "10px"
                  : "11px",
              fontWeight: 600,
              letterSpacing:
                ".22em",
              flexShrink: 0,
            }}
          >
            STOKED
            <span
              style={{
                fontSize: "7px",
                marginLeft: "2px",
                opacity: 0.65,
              }}
            >
              ®
            </span>
          </Link>

          {/* RIGHT HEADER CONTROLS */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile
                ? "2px"
                : "4px",
              marginLeft: "auto",
              padding: isMobile
                ? "3px"
                : "4px",
              border: isMobile
                ? "1px solid rgba(255,255,255,.11)"
                : "1px solid rgba(255,255,255,.09)",
              borderRadius:
                isMobile
                  ? "14px"
                  : "0px",
              background:
                isMobile
                  ? "linear-gradient(135deg, rgba(255,255,255,.065), rgba(255,255,255,.018))"
                  : "rgba(255,255,255,.025)",
              boxShadow:
                isMobile
                  ? "0 12px 35px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05)"
                  : "0 8px 30px rgba(0,0,0,.18)",
              backdropFilter:
                "blur(14px)",
              WebkitBackdropFilter:
                "blur(14px)",
            }}
          >
            {/* MOBILE FILTER */}

            {isMobile && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setFilterOpen(true)
                  }
                  aria-label="Open filter"
                  style={{
                    width: "40px",
                    height: "40px",
                    border: 0,
                    borderRadius:
                      "10px",
                    background:
                      "rgba(255,255,255,.025)",
                    color:
                      "rgba(255,255,255,.78)",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    cursor:
                      "pointer",
                    touchAction:
                      "manipulation",
                  }}
                >
                  <span
                    style={{
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        width:
                          "16px",
                        height:
                          "1px",
                        background:
                          "rgba(255,255,255,.8)",
                      }}
                    />

                    <span
                      style={{
                        width:
                          "11px",
                        height:
                          "1px",
                        background:
                          "rgba(255,255,255,.55)",
                      }}
                    />

                    <span
                      style={{
                        width:
                          "14px",
                        height:
                          "1px",
                        background:
                          "rgba(255,255,255,.68)",
                      }}
                    />
                  </span>
                </button>

                <span
                  style={{
                    width: "1px",
                    height: "22px",
                    background:
                      "rgba(255,255,255,.07)",
                    margin:
                      "0 2px",
                  }}
                />
              </>
            )}

            {/* EXIT */}

            <Link
              href="/"
              style={{
                minHeight:
                  isMobile
                    ? "40px"
                    : "44px",
                padding:
                  isMobile
                    ? "0 9px"
                    : "0 9px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                color:
                  "rgba(255,255,255,.52)",
                textDecoration:
                  "none",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize:
                  isMobile
                    ? "8px"
                    : "12px",
                fontWeight: 500,
                letterSpacing:
                  isMobile
                    ? ".13em"
                    : ".15em",
                borderRadius:
                  isMobile
                    ? "9px"
                    : "0px",
                transition:
                  "all .25s ease",
              }}
            >
              EXIT
            </Link>

            {/* SEPARATOR */}

            {isMobile && (
              <span
                style={{
                  width: "1px",
                  height: "18px",
                  background:
                    "rgba(255,255,255,.07)",
                }}
              />
            )}

            {/* MY ACCOUNT */}

            <Link
              href="/account"
              style={{
                minHeight:
                  isMobile
                    ? "40px"
                    : "44px",
                padding:
                  isMobile
                    ? "0 9px"
                    : "0 9px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                color:
                  "rgba(255,255,255,.72)",
                textDecoration:
                  "none",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize:
                  isMobile
                    ? "8px"
                    : "12px",
                fontWeight: 600,
                letterSpacing:
                  isMobile
                    ? ".11em"
                    : ".15em",
                borderRadius:
                  isMobile
                    ? "9px"
                    : "0px",
                background:
                  isMobile
                    ? "rgba(255,255,255,.045)"
                    : "transparent",
                boxShadow:
                  isMobile
                    ? "inset 0 1px 0 rgba(255,255,255,.035)"
                    : "none",
                cursor:
                  "pointer",
                transition:
                  "all .25s ease",
                whiteSpace:
                  "nowrap",
              }}
            >
              MY ACCOUNT
            </Link>

            {/* SEPARATOR */}

            {isMobile && (
              <span
                style={{
                  width: "1px",
                  height: "18px",
                  background:
                    "rgba(255,255,255,.07)",
                }}
              />
            )}

            {/* BAG */}

            <Link
              href="/cart"
              style={{
                minHeight:
                  isMobile
                    ? "40px"
                    : "44px",
                padding:
                  isMobile
                    ? "0 9px"
                    : "0 10px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap:
                  isMobile
                    ? "5px"
                    : "6px",
                border: 0,
                borderRadius:
                  isMobile
                    ? "9px"
                    : "0px",
                background:
                  "transparent",
                color:
                  "rgba(255,255,255,.65)",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize:
                  isMobile
                    ? "8px"
                    : "12px",
                fontWeight: 500,
                letterSpacing:
                  isMobile
                    ? ".13em"
                    : ".15em",
                cursor:
                  "pointer",
                textDecoration:
                  "none",
                transition:
                  "all .25s ease",
                whiteSpace:
                  "nowrap",
              }}
            >
              BAG

              <span
                style={{
                  minWidth:
                    isMobile
                      ? "17px"
                      : "auto",
                  height:
                    isMobile
                      ? "17px"
                      : "auto",
                  padding:
                    isMobile
                      ? "0 4px"
                      : "0",
                  borderRadius:
                    isMobile
                      ? "999px"
                      : "0",
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize:
                    isMobile
                      ? "6px"
                      : "8px",
                  fontWeight: 600,
                  letterSpacing:
                    ".08em",
                  color: "#fff",
                  background:
                    isMobile
                      ? "rgba(169,21,37,.8)"
                      : "transparent",
                  boxShadow:
                    isMobile
                      ? "0 0 10px rgba(169,21,37,.22)"
                      : "none",
                }}
              >
                00
              </span>
            </Link>
          </div>
        </header>

        {/* =================================================
            DESKTOP
        ================================================== */}

        {!isMobile && (
          <section
            style={{
              height:
                "calc(100vh - 92px)",
              minHeight:
                "650px",
              display: "grid",
              gridTemplateColumns:
                "300px minmax(0, 1fr)",
              gap:
                "clamp(45px, 6vw, 100px)",
              padding:
                "20px 6vw 35px",
              overflow:
                "hidden",
            }}
          >
            {/* FILTER */}

            <aside
              style={{
                position:
                  "relative",
                height:
                  "100%",
                padding:
                  "8px 0 8px 30px",
              }}
            >
              <div
                style={{
                  position:
                    "absolute",
                  left: 0,
                  top: 0,
                  width: "1px",
                  height:
                    "100%",
                  background:
                    "linear-gradient(to bottom, rgba(155,17,30,.95) 0%, rgba(155,17,30,.45) 35%, rgba(255,255,255,.14) 75%, rgba(255,255,255,.02) 100%)",
                  boxShadow:
                    "0 0 16px rgba(155,17,30,.25)",
                }}
              />

              <div
                style={{
                  position:
                    "absolute",
                  left:
                    "-2px",
                  top: 0,
                  width:
                    "3px",
                  height:
                    "52px",
                  background:
                    "linear-gradient(to bottom, #a91525, rgba(169,21,37,0))",
                  boxShadow:
                    "0 0 14px rgba(169,21,37,.55)",
                }}
              />

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  gap:
                    "12px",
                  marginBottom:
                    "48px",
                }}
              >
                <span
                  style={{
                    fontFamily:
                      '"Space Grotesk", sans-serif',
                    fontSize:
                      "13px",
                    fontWeight:
                      600,
                    letterSpacing:
                      ".23em",
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
                    fontSize:
                      "8px",
                    fontWeight:
                      500,
                    letterSpacing:
                      ".16em",
                    color:
                      "rgba(255,255,255,.38)",
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {selectedCategory ===
                  "ALL COLLECTION"
                    ? "ALL CATEGORY"
                    : selectedCategory}
                </span>
              </div>

              {/* PRICE RANGE */}

              <div
                style={{
                  marginBottom:
                    "45px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    marginBottom:
                      "17px",
                  }}
                >
                  <span
                    style={{
                      fontFamily:
                        '"Space Grotesk", sans-serif',
                      fontSize:
                        "9px",
                      letterSpacing:
                        ".2em",
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
                      fontSize:
                        "11px",
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
                  min={
                    categoryMinPrice
                  }
                  max={
                    categoryMaxPrice
                  }
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
                    width:
                      "100%",
                    height:
                      "3px",
                    accentColor:
                      "#a91525",
                    cursor:
                      categoryMinPrice ===
                      categoryMaxPrice
                        ? "default"
                        : "pointer",
                  }}
                />

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    marginTop:
                      "10px",
                    fontFamily:
                      '"Space Grotesk", sans-serif',
                    fontSize:
                      "7px",
                    letterSpacing:
                      ".14em",
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
                    marginBottom:
                      "13px",
                  }}
                >
                  <span
                    style={{
                      fontFamily:
                        '"Space Grotesk", sans-serif',
                      fontSize:
                        "9px",
                      letterSpacing:
                        ".2em",
                      color:
                        "rgba(255,255,255,.48)",
                    }}
                  >
                    CATEGORIES
                  </span>
                </div>

                <div
                  style={{
                    display:
                      "flex",
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
                        fontSize:
                          "8px",
                        letterSpacing:
                          ".16em",
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
                                "42px",
                              padding:
                                "0 0 0 17px",
                              border:
                                0,
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
                                "10px",
                              fontWeight:
                                active
                                  ? 600
                                  : 500,
                              letterSpacing:
                                ".16em",
                              cursor:
                                "pointer",
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
                                    ? "6px"
                                    : "0",
                                height:
                                  "1px",
                                background:
                                  "#b01829",
                                boxShadow:
                                  active
                                    ? "0 0 10px rgba(176,24,41,.75)"
                                    : "none",
                              }}
                            />

                            <span
                              style={{
                                display:
                                  "inline-block",
                                width:
                                  "29px",
                                fontSize:
                                  "7px",
                                color:
                                  active
                                    ? "rgba(255,255,255,.38)"
                                    : "rgba(255,255,255,.17)",
                              }}
                            >
                              {String(
                                index +
                                  1
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

            {/* COLLECTION AREA */}

            <div
              style={{
                minWidth: 0,
                height:
                  "100%",
                overflowY:
                  "auto",
                overflowX:
                  "hidden",
                paddingRight:
                  "8px",
                scrollBehavior:
                  "smooth",
                WebkitOverflowScrolling:
                  "touch",
                overscrollBehaviorY:
                  "contain",
                scrollbarWidth:
                  "thin",
                scrollbarColor:
                  "rgba(169,21,37,.65) transparent",
              }}
            >
              {/* COLLECTION HEADER */}

              <div
                style={{
                  position:
                    "relative",
                  zIndex: 15,
                  paddingTop:
                    "8px",
                  paddingBottom:
                    "38px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "flex-end",
                    justifyContent:
                      "space-between",
                    gap:
                      "30px",
                  }}
                >
                  <div>
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
                          fontWeight:
                            500,
                          lineHeight:
                            ".82",
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
                          width:
                            "48px",
                          height:
                            "1px",
                          background:
                            "#a91525",
                          boxShadow:
                            "0 0 10px rgba(169,21,37,.55)",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap:
                          "9px",
                        marginTop:
                          "14px",
                      }}
                    >
                      <span
                        style={{
                          width:
                            "22px",
                          height:
                            "1px",
                          background:
                            "rgba(169,21,37,.8)",
                          boxShadow:
                            "0 0 8px rgba(169,21,37,.35)",
                        }}
                      />

                      <span
                        style={{
                          fontFamily:
                            '"Space Grotesk", sans-serif',
                          fontSize:
                            "8px",
                          fontWeight:
                            600,
                          letterSpacing:
                            ".2em",
                          color:
                            "rgba(255,255,255,.48)",
                        }}
                      >
                        {selectedCategory ===
                        "ALL COLLECTION"
                          ? "ALL CATEGORY"
                          : selectedCategory}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRODUCT GRID */}

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap:
                    "55px 35px",
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
                              aspectRatio:
                                index %
                                  2 ===
                                0
                                  ? "4 / 5"
                                  : "4 / 4.7",
                              overflow:
                                "hidden",
                              background:
                                "linear-gradient(145deg, rgba(35,8,8,.75), rgba(7,3,3,.95))",
                              border:
                                "1px solid rgba(255,255,255,.07)",
                            }}
                          >
                            <div
                              style={{
                                position:
                                  "absolute",
                                width:
                                  "65%",
                                height:
                                  "65%",
                                left:
                                  "18%",
                                top:
                                  "18%",
                                borderRadius:
                                  "50%",
                                background:
                                  "radial-gradient(circle, rgba(130,0,0,.24), transparent 68%)",
                                filter:
                                  "blur(25px)",
                              }}
                            />

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
                                  zIndex:
                                    2,
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
                                  zIndex:
                                    2,
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
                                    transform:
                                      "rotate(-8deg)",
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
                                top:
                                  "18px",
                                left:
                                  "18px",
                                zIndex:
                                  4,
                                fontSize:
                                  "9px",
                                letterSpacing:
                                  ".15em",
                                opacity:
                                  0.5,
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
                                top:
                                  "18px",
                                right:
                                  "18px",
                                zIndex:
                                  4,
                                fontSize:
                                  "8px",
                                letterSpacing:
                                  ".15em",
                                opacity:
                                  0.45,
                              }}
                            >
                              AVAILABLE
                            </span>

                            <div
                              style={{
                                position:
                                  "absolute",
                                bottom:
                                  "18px",
                                right:
                                  "18px",
                                zIndex:
                                  4,
                                width:
                                  "45px",
                                height:
                                  "45px",
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
                                backdropFilter:
                                  "blur(8px)",
                              }}
                            >
                              ↗
                            </div>
                          </div>

                          <div
                            style={{
                              paddingTop:
                                "20px",
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              gap:
                                "20px",
                              alignItems:
                                "flex-start",
                            }}
                          >
                            <div>
                              <h2
                                style={{
                                  margin:
                                    0,
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
                              {Number(
                                product.price
                              ).toLocaleString()}
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

        {/* =================================================
            MOBILE
        ================================================== */}

        {isMobile && (
          <section
            style={{
              padding:
                "24px 6vw 0",
            }}
          >
            <div
              style={{
                position:
                  "relative",
                zIndex: 20,
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
                    fontWeight:
                      500,
                    lineHeight:
                      ".85",
                    letterSpacing:
                      "-.065em",
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
                    width:
                      "42px",
                    height:
                      "1px",
                    background:
                      "#a91525",
                    boxShadow:
                      "0 0 10px rgba(169,21,37,.55)",
                  }}
                />
              </div>
            </div>

            {/* SELECTED PIECES */}

            <div
              style={{
                paddingTop:
                  "18px",
                paddingBottom:
                  "18px",
                borderTop:
                  "1px solid rgba(255,255,255,.12)",
                borderBottom:
                  "1px solid rgba(255,255,255,.09)",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap:
                  "15px",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize:
                  "8px",
                letterSpacing:
                  ".15em",
                color:
                  "rgba(255,255,255,.42)",
              }}
            >
              <span>
                SELECTED PIECES
              </span>

              <span
                style={{
                  color:
                    "rgba(255,255,255,.58)",
                  whiteSpace:
                    "nowrap",
                }}
              >
                ৳{" "}
                {categoryMinPrice.toLocaleString()}
                {" — "}
                ৳{" "}
                {maxPrice.toLocaleString()}
              </span>
            </div>

            {/* MOBILE CATEGORY SELECTOR */}

            <div
              style={{
                marginTop:
                  "18px",
                position:
                  "relative",
                zIndex: 30,
              }}
            >
              <div
                style={{
                  marginBottom:
                    "9px",
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize:
                    "7px",
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
                    (current) =>
                      !current
                  )
                }
                aria-expanded={
                  mobileCategoryOpen
                }
                style={{
                  width:
                    "100%",
                  minHeight:
                    "52px",
                  padding:
                    "0 15px",
                  border:
                    mobileCategoryOpen
                      ? "1px solid rgba(169,21,37,.55)"
                      : "1px solid rgba(255,255,255,.10)",
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
                  gap:
                    "15px",
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize:
                    "9px",
                  fontWeight:
                    500,
                  letterSpacing:
                    ".14em",
                  textAlign:
                    "left",
                  cursor:
                    "pointer",
                  boxShadow:
                    mobileCategoryOpen
                      ? "0 0 22px rgba(169,21,37,.10)"
                      : "none",
                  transition:
                    "all .25s ease",
                  touchAction:
                    "manipulation",
                }}
              >
                <span
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "10px",
                    minWidth:
                      0,
                  }}
                >
                  <span
                    style={{
                      width:
                        "5px",
                      height:
                        "5px",
                      flexShrink:
                        0,
                      borderRadius:
                        "50%",
                      background:
                        "#a91525",
                      boxShadow:
                        "0 0 9px rgba(169,21,37,.65)",
                    }}
                  />

                  <span
                    style={{
                      overflow:
                        "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {selectedCategory ===
                    "ALL COLLECTION"
                      ? "ALL CATEGORY"
                      : selectedCategory}
                  </span>
                </span>

                <span
                  style={{
                    flexShrink:
                      0,
                    color:
                      "rgba(255,255,255,.48)",
                    fontSize:
                      "13px",
                    lineHeight:
                      1,
                    transform:
                      mobileCategoryOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    transition:
                      "transform .25s ease",
                  }}
                >
                  ↓
                </span>
              </button>

              {mobileCategoryOpen && (
                <div
                  style={{
                    marginTop:
                      "5px",
                    width:
                      "100%",
                    border:
                      "1px solid rgba(255,255,255,.09)",
                    background:
                      "rgba(8,3,3,.96)",
                    boxShadow:
                      "0 18px 45px rgba(0,0,0,.42), 0 0 24px rgba(169,21,37,.06)",
                    backdropFilter:
                      "blur(14px)",
                    WebkitBackdropFilter:
                      "blur(14px)",
                    overflow:
                      "hidden",
                  }}
                >
                  {categoriesLoading ? (
                    <div
                      style={{
                        padding:
                          "18px 15px",
                        color:
                          "rgba(255,255,255,.28)",
                        fontFamily:
                          '"Space Grotesk", sans-serif',
                        fontSize:
                          "8px",
                        letterSpacing:
                          ".16em",
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
                              minHeight:
                                "46px",
                              padding:
                                "0 14px",
                              border:
                                0,
                              borderBottom:
                                index ===
                                categories.length -
                                  1
                                  ? "none"
                                  : "1px solid rgba(255,255,255,.055)",
                              background:
                                active
                                  ? "linear-gradient(90deg, rgba(169,21,37,.13), rgba(169,21,37,.025))"
                                  : "transparent",
                              color:
                                active
                                  ? "rgba(255,255,255,.95)"
                                  : "rgba(255,255,255,.48)",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap:
                                "10px",
                              textAlign:
                                "left",
                              fontFamily:
                                '"Space Grotesk", sans-serif',
                              fontSize:
                                "8px",
                              fontWeight:
                                active
                                  ? 600
                                  : 500,
                              letterSpacing:
                                ".14em",
                              cursor:
                                "pointer",
                              touchAction:
                                "manipulation",
                            }}
                          >
                            <span
                              style={{
                                width:
                                  "24px",
                                flexShrink:
                                  0,
                                fontSize:
                                  "6px",
                                color:
                                  active
                                    ? "rgba(255,255,255,.38)"
                                    : "rgba(255,255,255,.18)",
                              }}
                            >
                              {String(
                                index +
                                  1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            <span
                              style={{
                                flex: 1,
                              }}
                            >
                              {category.name ===
                              "ALL COLLECTION"
                                ? "ALL CATEGORY"
                                : category.name}
                            </span>

                            {active && (
                              <span
                                style={{
                                  width:
                                    "5px",
                                  height:
                                    "5px",
                                  borderRadius:
                                    "50%",
                                  background:
                                    "#a91525",
                                  boxShadow:
                                    "0 0 8px rgba(169,21,37,.65)",
                                }}
                              />
                            )}
                          </button>
                        );
                      }
                    )
                  )}
                </div>
              )}
            </div>

            {/* MOBILE PRICE RANGE */}

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
                  alignItems:
                    "center",
                  marginBottom:
                    "11px",
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize:
                    "8px",
                  letterSpacing:
                    ".16em",
                  color:
                    "rgba(255,255,255,.42)",
                }}
              >
                <span>
                  PRICE RANGE
                </span>

                <span
                  style={{
                    color:
                      "rgba(255,255,255,.68)",
                    letterSpacing:
                      ".08em",
                  }}
                >
                  ৳{" "}
                  {maxPrice.toLocaleString()}
                </span>
              </div>

              <input
                type="range"
                min={
                  categoryMinPrice
                }
                max={
                  categoryMaxPrice
                }
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
                  width:
                    "100%",
                  height:
                    "3px",
                  accentColor:
                    "#a91525",
                  cursor:
                    categoryMinPrice ===
                    categoryMaxPrice
                      ? "default"
                      : "pointer",
                }}
              />

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  marginTop:
                    "8px",
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize:
                    "6px",
                  letterSpacing:
                    ".12em",
                  color:
                    "rgba(255,255,255,.23)",
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

            {/* MOBILE PRODUCT GRID */}

            <div
              style={{
                marginTop:
                  "24px",
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap:
                  "38px 12px",
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
                  <p
                    style={{
                      margin: 0,
                      fontFamily:
                        '"Space Grotesk", sans-serif',
                      fontSize:
                        "9px",
                      letterSpacing:
                        ".2em",
                      opacity:
                        0.4,
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
                          minWidth:
                            0,
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
                          <div
                            style={{
                              position:
                                "absolute",
                              width:
                                "70%",
                              height:
                                "70%",
                              left:
                                "15%",
                              top:
                                "15%",
                              borderRadius:
                                "50%",
                              background:
                                "radial-gradient(circle, rgba(130,0,0,.24), transparent 68%)",
                              filter:
                                "blur(22px)",
                            }}
                          />

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
                                zIndex:
                                  2,
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
                                zIndex:
                                  2,
                              }}
                            >
                              <span
                                style={{
                                  fontSize:
                                    "clamp(25px, 8vw, 45px)",
                                  fontWeight:
                                    600,
                                  letterSpacing:
                                    "-.07em",
                                  opacity:
                                    0.12,
                                  transform:
                                    "rotate(-8deg)",
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
                              top:
                                "10px",
                              left:
                                "10px",
                              zIndex:
                                4,
                              fontSize:
                                "7px",
                              letterSpacing:
                                ".15em",
                              opacity:
                                0.5,
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
                              top:
                                "10px",
                              right:
                                "10px",
                              zIndex:
                                4,
                              fontSize:
                                "6px",
                              letterSpacing:
                                ".13em",
                              opacity:
                                0.45,
                            }}
                          >
                            AVAILABLE
                          </span>

                          <div
                            style={{
                              position:
                                "absolute",
                              bottom:
                                "10px",
                              right:
                                "10px",
                              zIndex:
                                4,
                              width:
                                "34px",
                              height:
                                "34px",
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
                                "13px",
                              background:
                                "rgba(0,0,0,.18)",
                              backdropFilter:
                                "blur(8px)",
                            }}
                          >
                            ↗
                          </div>
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
                                "10px",
                              lineHeight:
                                1.15,
                              fontWeight:
                                500,
                              letterSpacing:
                                "-.015em",
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
                                "6px",
                              lineHeight:
                                1.3,
                              letterSpacing:
                                ".1em",
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
                                "8px",
                              opacity:
                                0.7,
                            }}
                          >
                            ৳{" "}
                            {Number(
                              product.price
                            ).toLocaleString()}
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
                      <p
                        style={{
                          margin: 0,
                          fontFamily:
                            '"Space Grotesk", sans-serif',
                          fontSize:
                            "9px",
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
                mobile
              />
            )}
          </section>
        )}

        {/* FOOTER */}

        <footer
          style={{
            padding:
              "35px 6vw",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            fontFamily:
              '"Space Grotesk", sans-serif',
            fontSize:
              "8px",
            letterSpacing:
              ".15em",
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
              color:
                "inherit",
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

      {/* =================================================
          MOBILE FILTER OVERLAY
      ================================================== */}

      {isMobile &&
        filterOpen && (
          <div
            onClick={() =>
              setFilterOpen(false)
            }
            style={{
              position:
                "fixed",
              inset: 0,
              zIndex: 100,
              background:
                "rgba(0,0,0,.72)",
              backdropFilter:
                "blur(8px)",
              WebkitBackdropFilter:
                "blur(8px)",
            }}
          >
            <aside
              onClick={(e) =>
                e.stopPropagation()
              }
              style={{
                position:
                  "absolute",
                left:
                  "6vw",
                right:
                  "6vw",
                top:
                  "50%",
                transform:
                  "translateY(-50%)",
                padding:
                  "8px 0 8px 30px",
              }}
            >
              <div
                style={{
                  position:
                    "absolute",
                  left: 0,
                  top: 0,
                  width:
                    "1px",
                  height:
                    "100%",
                  background:
                    "linear-gradient(to bottom, rgba(155,17,30,.95), rgba(255,255,255,.05))",
                  boxShadow:
                    "0 0 16px rgba(155,17,30,.25)",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setFilterOpen(false)
                }
                style={{
                  position:
                    "absolute",
                  right: 0,
                  top:
                    "-45px",
                  border: 0,
                  background:
                    "transparent",
                  color:
                    "rgba(255,255,255,.55)",
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize:
                    "9px",
                  letterSpacing:
                    ".16em",
                  cursor:
                    "pointer",
                }}
              >
                CLOSE ×
              </button>

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  marginBottom:
                    "38px",
                  gap:
                    "15px",
                }}
              >
                <span
                  style={{
                    fontFamily:
                      '"Space Grotesk", sans-serif',
                    fontSize:
                      "13px",
                    fontWeight:
                      600,
                    letterSpacing:
                      ".23em",
                  }}
                >
                  FILTER
                </span>

                <span
                  style={{
                    fontFamily:
                      '"Space Grotesk", sans-serif',
                    fontSize:
                      "8px",
                    letterSpacing:
                      ".16em",
                    color:
                      "rgba(255,255,255,.38)",
                  }}
                >
                  {selectedCategory ===
                  "ALL COLLECTION"
                    ? "ALL CATEGORY"
                    : selectedCategory}
                </span>
              </div>

              {/* MOBILE PRICE RANGE */}

              <div
                style={{
                  marginBottom:
                    "35px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    marginBottom:
                      "15px",
                  }}
                >
                  <span
                    style={{
                      fontSize:
                        "9px",
                      letterSpacing:
                        ".2em",
                      color:
                        "rgba(255,255,255,.48)",
                    }}
                  >
                    PRICE RANGE
                  </span>

                  <span
                    style={{
                      fontSize:
                        "11px",
                      color:
                        "rgba(255,255,255,.78)",
                    }}
                  >
                    ৳{" "}
                    {categoryMinPrice.toLocaleString()}
                    {" — "}
                    ৳{" "}
                    {maxPrice.toLocaleString()}
                  </span>
                </div>

                <input
                  type="range"
                  min={
                    categoryMinPrice
                  }
                  max={
                    categoryMaxPrice
                  }
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
                    width:
                      "100%",
                    accentColor:
                      "#a91525",
                    cursor:
                      categoryMinPrice ===
                      categoryMaxPrice
                        ? "default"
                        : "pointer",
                  }}
                />

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    marginTop:
                      "9px",
                    fontSize:
                      "7px",
                    letterSpacing:
                      ".12em",
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

              <div>
                <span
                  style={{
                    fontSize:
                      "9px",
                    letterSpacing:
                      ".2em",
                    color:
                      "rgba(255,255,255,.48)",
                  }}
                >
                  CATEGORIES
                </span>

                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    marginTop:
                      "12px",
                  }}
                >
                  {categoriesLoading ? (
                    <div
                      style={{
                        color:
                          "rgba(255,255,255,.25)",
                        fontSize:
                          "8px",
                        letterSpacing:
                          ".16em",
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
                              height:
                                "42px",
                              padding:
                                "0 0 0 17px",
                              border:
                                0,
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
                                "10px",
                              fontWeight:
                                active
                                  ? 600
                                  : 500,
                              letterSpacing:
                                ".16em",
                              cursor:
                                "pointer",
                              touchAction:
                                "manipulation",
                            }}
                          >
                            <span
                              style={{
                                display:
                                  "inline-block",
                                width:
                                  "29px",
                                fontSize:
                                  "7px",
                                color:
                                  active
                                    ? "rgba(255,255,255,.38)"
                                    : "rgba(255,255,255,.17)",
                              }}
                            >
                              {String(
                                index +
                                  1
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
          </div>
        )}
    </main>
  );
}

/* =========================================================
   PAGINATION COMPONENT
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
  const buttonSize = mobile
    ? "32px"
    : "38px";

  const gap = mobile
    ? "5px"
    : "7px";

  const pages: number[] = [];

  for (
    let page = 1;
    page <= totalPages;
    page++
  ) {
    pages.push(page);
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "center",
        alignItems:
          "center",
        gap,
        padding: mobile
          ? "20px 0 75px"
          : "30px 0 90px",
        fontFamily:
          '"Space Grotesk", sans-serif',
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        onClick={() =>
          onPageChange(
            currentPage - 1
          )
        }
        disabled={
          currentPage === 1
        }
        aria-label="Previous page"
        style={{
          width:
            buttonSize,
          height:
            buttonSize,
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          border:
            "1px solid rgba(255,255,255,.09)",
          background:
            "rgba(0,0,0,.18)",
          color:
            currentPage === 1
              ? "rgba(255,255,255,.18)"
              : "rgba(255,255,255,.65)",
          fontSize:
            mobile
              ? "12px"
              : "14px",
          cursor:
            currentPage === 1
              ? "default"
              : "pointer",
          transition:
            "all .25s ease",
          touchAction:
            "manipulation",
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
              aria-current={
                active
                  ? "page"
                  : undefined
              }
              style={{
                width:
                  buttonSize,
                height:
                  buttonSize,
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                border: active
                  ? "1px solid rgba(169,21,37,.9)"
                  : "1px solid rgba(255,255,255,.08)",
                background:
                  active
                    ? "rgba(169,21,37,.16)"
                    : "rgba(0,0,0,.16)",
                color:
                  active
                    ? "rgba(255,255,255,.95)"
                    : "rgba(255,255,255,.42)",
                fontSize:
                  mobile
                    ? "8px"
                    : "9px",
                letterSpacing:
                  ".08em",
                cursor:
                  "pointer",
                boxShadow:
                  active
                    ? "0 0 18px rgba(169,21,37,.18)"
                    : "none",
                transition:
                  "all .25s ease",
                touchAction:
                  "manipulation",
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
        onClick={() =>
          onPageChange(
            currentPage + 1
          )
        }
        disabled={
          currentPage ===
          totalPages
        }
        aria-label="Next page"
        style={{
          width:
            buttonSize,
          height:
            buttonSize,
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          border:
            "1px solid rgba(255,255,255,.09)",
          background:
            "rgba(0,0,0,.18)",
          color:
            currentPage ===
            totalPages
              ? "rgba(255,255,255,.18)"
              : "rgba(255,255,255,.65)",
          fontSize:
            mobile
              ? "12px"
              : "14px",
          cursor:
            currentPage ===
            totalPages
              ? "default"
              : "pointer",
          transition:
            "all .25s ease",
          touchAction:
            "manipulation",
        }}
      >
        →
      </button>
    </div>
  );
}