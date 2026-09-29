"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  created_at: string;
};

const PRODUCTS_PER_PAGE = 12;

const SPIDER =
  "https://www.pngall.com/wp-content/uploads/13/Spiderman-Logo-No-Background.png";

export default function CategoryShopPage() {
  const params = useParams();
  const categorySlug = String(params.category || "");

  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("");

  const [maxPrice, setMaxPrice] = useState(5000);

  const [filterOpen, setFilterOpen] = useState(false);

  const [categoryDropdownOpen, setCategoryDropdownOpen] =
    useState(false);

  const [isMobile, setIsMobile] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const ALL_CATEGORY: Category = {
    id: "all",
    name: "ALL COLLECTION",
    slug: "",
    created_at: "",
  };

  const [categories, setCategories] = useState<Category[]>([
    ALL_CATEGORY,
  ]);

  const [categoriesLoading, setCategoriesLoading] = useState(true);

  /*
    =====================================================
    LOAD PRODUCTS
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
        console.error("SHOP PRODUCT LOAD ERROR:", error);

        if (mounted) {
          setProducts([]);
          setProductsLoading(false);
        }

        return;
      }

      if (!mounted) return;

      const formattedProducts: Product[] = (data || []).map(
        (product: any) => {
          const images = Array.isArray(product.product_images)
            ? [...product.product_images].sort(
                (a, b) => a.sort_order - b.sort_order
              )
            : [];

          const category = Array.isArray(product.categories)
            ? product.categories[0]
            : product.categories;

          return {
            id: product.id,
            name: product.name,
            category: category?.name || "NO COLLECTION",
            price: Number(product.price),
            image: images[0]?.image_url || "",
            created_at: product.created_at,
          };
        }
      );

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
    LOAD CATEGORIES
    =====================================================
  */

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, created_at")
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error("SHOP CATEGORY LOAD ERROR:", error);

        if (mounted) {
          setCategories([ALL_CATEGORY]);
          setCategoriesLoading(false);
        }

        return;
      }

      if (!mounted) return;

      setCategories([
        ALL_CATEGORY,
        ...(data || []).filter(
          (category: Category) =>
            category.name.trim().toUpperCase() !== "ALL COLLECTION"
        ),
      ]);

      setCategoriesLoading(false);
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  /*
    =====================================================
    MOBILE DETECTION
    =====================================================
  */

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  /*
    =====================================================
    LOAD CURRENT CATEGORY
    =====================================================
  */

  useEffect(() => {
    let mounted = true;

    async function loadCurrentCategory() {
      if (!categorySlug) {
        router.replace("/shop");
        return;
      }

      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, created_at")
        .eq("slug", categorySlug)
        .maybeSingle();

      if (error) {
        console.error("CURRENT CATEGORY LOAD ERROR:", error);
        return;
      }

      if (!data) {
        router.replace("/shop");
        return;
      }

      if (mounted) {
        setSelectedCategory(data.name);
      }
    }

    loadCurrentCategory();

    return () => {
      mounted = false;
    };
  }, [categorySlug, router]);

  /*
    =====================================================
    FILTER PRODUCTS
    =====================================================
  */

  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory !== "" &&
      (selectedCategory === "ALL COLLECTION" ||
        product.category === selectedCategory);

    const priceMatch = product.price <= maxPrice;

    return categoryMatch && priceMatch;
  });

  /*
    =====================================================
    PAGINATION
    =====================================================
  */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug]);

  const startIndex =
    (currentPage - 1) * PRODUCTS_PER_PAGE;

  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  /*
    =====================================================
    CATEGORY SELECT
    =====================================================
  */

  const selectCategory = (category: Category) => {
    setCategoryDropdownOpen(false);
    setCurrentPage(1);

    if (category.id === "all") {
      router.push("/shop");
      return;
    }

    router.push(`/shop/${category.slug}`);

    if (isMobile) {
      setFilterOpen(false);
    }
  };

  /*
    =====================================================
    PAGE CHANGE
    =====================================================
  */

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) {
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
            <img src={SPIDER} alt="" draggable={false} />
          </div>

          <div className="spider spider-2">
            <img src={SPIDER} alt="" draggable={false} />
          </div>

          <div className="spider spider-3">
            <img src={SPIDER} alt="" draggable={false} />
          </div>

          <div className="spider spider-4">
            <img src={SPIDER} alt="" draggable={false} />
          </div>

          <div className="spider spider-5">
            <img src={SPIDER} alt="" draggable={false} />
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
            padding: isMobile ? "13px 4vw" : "22px 6vw",
            minHeight: isMobile ? "66px" : "70px",
          }}
        >
          <Link
            href="/"
            style={{
              color: "rgba(255,255,255,.9)",
              textDecoration: "none",
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: isMobile ? "9px" : "11px",
              fontWeight: 600,
              letterSpacing: ".22em",
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "1px" : "4px",
              marginLeft: "auto",
              padding: isMobile ? "3px" : "4px",
              border: isMobile
                ? "1px solid rgba(255,255,255,.11)"
                : "1px solid rgba(255,255,255,.09)",
              background: isMobile
                ? "linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.018))"
                : "rgba(255,255,255,.025)",
              boxShadow: isMobile
                ? "0 12px 35px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.05)"
                : "0 8px 30px rgba(0,0,0,.18)",
              backdropFilter: isMobile ? "blur(18px)" : "blur(10px)",
              WebkitBackdropFilter: isMobile
                ? "blur(18px)"
                : undefined,
              borderRadius: isMobile ? "999px" : "0px",
              flexShrink: 1,
              minWidth: 0,
            }}
          >
            {isMobile && (
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                aria-label="Open filter"
                style={{
                  width: "37px",
                  height: "37px",
                  flexShrink: 0,
                  border: "1px solid rgba(255,255,255,.04)",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,.025)",
                  color: "rgba(255,255,255,.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  touchAction: "manipulation",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      width: "16px",
                      height: "1px",
                      background: "rgba(255,255,255,.72)",
                    }}
                  />

                  <span
                    style={{
                      width: "10px",
                      height: "1px",
                      background: "rgba(255,255,255,.46)",
                    }}
                  />

                  <span
                    style={{
                      width: "13px",
                      height: "1px",
                      background: "rgba(255,255,255,.60)",
                    }}
                  />
                </span>
              </button>
            )}

            <Link
              href="/"
              style={{
                minHeight: isMobile ? "37px" : "44px",
                padding: isMobile ? "0 7px" : "0 9px",
                display: "flex",
                alignItems: "center",
                borderRadius: isMobile ? "999px" : "0px",
                color: isMobile
                  ? "rgba(255,255,255,.42)"
                  : "rgba(255,255,255,.55)",
                textDecoration: "none",
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: isMobile ? "8px" : "12px",
                letterSpacing: isMobile ? ".11em" : ".15em",
                whiteSpace: "nowrap",
              }}
            >
              EXIT
            </Link>

            {/* MY ACCOUNT */}

            <Link
              href="/account"
              style={{
                minHeight: isMobile ? "37px" : "44px",
                padding: isMobile ? "0 9px" : "0 10px",
                display: "flex",
                alignItems: "center",
                borderRadius: isMobile ? "999px" : "0px",
                color: isMobile
                  ? "rgba(255,255,255,.88)"
                  : "rgba(255,255,255,.55)",
                textDecoration: "none",
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: isMobile ? "8px" : "12px",
                letterSpacing: isMobile ? ".09em" : ".15em",
                whiteSpace: "nowrap",
                background: isMobile
                  ? "linear-gradient(180deg, rgba(169,21,37,.14), rgba(169,21,37,.035))"
                  : "transparent",
                border: isMobile
                  ? "1px solid rgba(169,21,37,.18)"
                  : "0",
                boxShadow: isMobile
                  ? "inset 0 1px 0 rgba(255,255,255,.035), 0 0 16px rgba(169,21,37,.05)"
                  : "none",
              }}
            >
              MY ACCOUNT
            </Link>

            {/* BAG */}

            <Link
              href="/cart"
              style={{
                minHeight: isMobile ? "37px" : "44px",
                padding: isMobile ? "0 7px" : "0 10px",
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "4px" : "6px",
                borderRadius: isMobile ? "999px" : "0px",
                color: isMobile
                  ? "rgba(255,255,255,.68)"
                  : "rgba(255,255,255,.55)",
                textDecoration: "none",
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: isMobile ? "8px" : "12px",
                letterSpacing: isMobile ? ".10em" : ".15em",
                whiteSpace: "nowrap",
              }}
            >
              BAG

              <span
                style={{
                  minWidth: isMobile ? "16px" : undefined,
                  height: isMobile ? "16px" : undefined,
                  padding: isMobile ? "0 4px" : undefined,
                  borderRadius: isMobile ? "999px" : undefined,
                  display: isMobile ? "inline-flex" : undefined,
                  alignItems: isMobile ? "center" : undefined,
                  justifyContent: isMobile ? "center" : undefined,
                  fontSize: isMobile ? "6px" : "8px",
                  lineHeight: isMobile ? "16px" : undefined,
                  letterSpacing: isMobile ? ".06em" : undefined,
                  color: isMobile
                    ? "rgba(255,255,255,.92)"
                    : "rgba(150,17,30,.9)",
                  background: isMobile
                    ? "rgba(169,21,37,.72)"
                    : undefined,
                  border: isMobile
                    ? "1px solid rgba(255,255,255,.08)"
                    : undefined,
                  boxShadow: isMobile
                    ? "0 0 12px rgba(169,21,37,.16)"
                    : undefined,
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
              height: "calc(100vh - 92px)",
              minHeight: "650px",
              display: "grid",
              gridTemplateColumns: "300px minmax(0, 1fr)",
              gap: "clamp(45px, 6vw, 100px)",
              padding: "20px 6vw 35px",
              overflow: "hidden",
            }}
          >
            {/* FILTER */}

            <aside
              style={{
                position: "relative",
                height: "100%",
                padding: "8px 0 8px 30px",
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
                  boxShadow: "0 0 16px rgba(155,17,30,.25)",
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
                  boxShadow: "0 0 14px rgba(169,21,37,.55)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "48px",
                }}
              >
                <span
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: "13px",
                    fontWeight: 600,
                    letterSpacing: ".23em",
                    color: "rgba(255,255,255,.9)",
                  }}
                >
                  FILTER
                </span>

                <span
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: "8px",
                    fontWeight: 500,
                    letterSpacing: ".16em",
                    color: "rgba(255,255,255,.38)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedCategory === "ALL COLLECTION"
                    ? "ALL CATEGORY"
                    : selectedCategory}
                </span>
              </div>

              <div style={{ marginBottom: "45px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "17px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: "9px",
                      letterSpacing: ".2em",
                      color: "rgba(255,255,255,.48)",
                    }}
                  >
                    PRICE RANGE
                  </span>

                  <span
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: "11px",
                      color: "rgba(255,255,255,.78)",
                    }}
                  >
                    ৳ {maxPrice.toLocaleString()}
                  </span>
                </div>

                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(Number(e.target.value))
                  }
                  style={{
                    width: "100%",
                    height: "3px",
                    accentColor: "#a91525",
                    cursor: "pointer",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "10px",
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: "7px",
                    letterSpacing: ".14em",
                    color: "rgba(255,255,255,.24)",
                  }}
                >
                  <span>৳ 500</span>
                  <span>৳ 5,000</span>
                </div>
              </div>

              <div>
                <div style={{ marginBottom: "13px" }}>
                  <span
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: "9px",
                      letterSpacing: ".2em",
                      color: "rgba(255,255,255,.48)",
                    }}
                  >
                    CATEGORIES
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {categoriesLoading ? (
                    <div
                      style={{
                        color: "rgba(255,255,255,.25)",
                        fontFamily:
                          '"Space Grotesk", sans-serif',
                        fontSize: "8px",
                        letterSpacing: ".16em",
                        padding: "15px 0",
                      }}
                    >
                      LOADING...
                    </div>
                  ) : (
                    categories.map((category, index) => {
                      const active =
                        selectedCategory === category.name;

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => selectCategory(category)}
                          style={{
                            position: "relative",
                            width: "100%",
                            height: "42px",
                            padding: "0 0 0 17px",
                            border: 0,
                            background: "transparent",
                            color: active
                              ? "rgba(255,255,255,.95)"
                              : "rgba(255,255,255,.43)",
                            textAlign: "left",
                            fontFamily:
                              '"Space Grotesk", sans-serif',
                            fontSize: "10px",
                            fontWeight: active ? 600 : 500,
                            letterSpacing: ".16em",
                            cursor: "pointer",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              left: 0,
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: active ? "6px" : "0",
                              height: "1px",
                              background: "#b01829",
                              boxShadow: active
                                ? "0 0 10px rgba(176,24,41,.75)"
                                : "none",
                            }}
                          />

                          <span
                            style={{
                              display: "inline-block",
                              width: "29px",
                              fontSize: "7px",
                              color: active
                                ? "rgba(255,255,255,.38)"
                                : "rgba(255,255,255,.17)",
                            }}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          {category.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </aside>

            {/* COLLECTION AREA */}

            <div
              style={{
                minWidth: 0,
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: "8px",
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
                overscrollBehaviorY: "contain",
                scrollbarWidth: "thin",
                scrollbarColor:
                  "rgba(169,21,37,.65) transparent",
              }}
            >
              <div
                style={{
                  position: "relative",
                  zIndex: 15,
                  paddingTop: "8px",
                  paddingBottom: "38px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    gap: "30px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        position: "relative",
                        display: "inline-block",
                        paddingBottom: "13px",
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
                          letterSpacing: "-.07em",
                          color: "rgba(255,255,255,.94)",
                        }}
                      >
                        COLLECTION
                      </span>

                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          bottom: 0,
                          width: "48px",
                          height: "1px",
                          background: "#a91525",
                          boxShadow:
                            "0 0 10px rgba(169,21,37,.55)",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                        marginTop: "14px",
                      }}
                    >
                      <span
                        style={{
                          width: "22px",
                          height: "1px",
                          background: "rgba(169,21,37,.8)",
                          boxShadow:
                            "0 0 8px rgba(169,21,37,.35)",
                        }}
                      />

                      <span
                        style={{
                          fontFamily:
                            '"Space Grotesk", sans-serif',
                          fontSize: "8px",
                          fontWeight: 600,
                          letterSpacing: ".2em",
                          color: "rgba(255,255,255,.48)",
                        }}
                      >
                        {selectedCategory === "ALL COLLECTION"
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
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "55px 35px",
                  paddingBottom: "45px",
                }}
              >
                {productsLoading ? (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      padding: "120px 0",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontFamily:
                          '"Space Grotesk", sans-serif',
                        fontSize: "10px",
                        letterSpacing: ".2em",
                        opacity: 0.4,
                      }}
                    >
                      LOADING COLLECTION...
                    </p>
                  </div>
                ) : (
                  <>
                    {paginatedProducts.map((product, index) => (
                      <Link
                        href={`/product/${product.id}`}
                        key={product.id}
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                          display: "block",
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            aspectRatio:
                              index % 2 === 0
                                ? "4 / 5"
                                : "4 / 4.7",
                            overflow: "hidden",
                            background:
                              "linear-gradient(145deg, rgba(35,8,8,.75), rgba(7,3,3,.95))",
                            border:
                              "1px solid rgba(255,255,255,.07)",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              width: "65%",
                              height: "65%",
                              left: "18%",
                              top: "18%",
                              borderRadius: "50%",
                              background:
                                "radial-gradient(circle, rgba(130,0,0,.24), transparent 68%)",
                              filter: "blur(25px)",
                            }}
                          />

                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                position: "relative",
                                zIndex: 2,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 2,
                              }}
                            >
                              <span
                                style={{
                                  fontSize:
                                    "clamp(35px, 5vw, 75px)",
                                  fontWeight: 600,
                                  letterSpacing: "-.07em",
                                  opacity: 0.12,
                                  transform: "rotate(-8deg)",
                                }}
                              >
                                STOKED
                              </span>
                            </div>
                          )}

                          <span
                            style={{
                              position: "absolute",
                              top: "18px",
                              left: "18px",
                              zIndex: 4,
                              fontSize: "9px",
                              letterSpacing: ".15em",
                              opacity: 0.5,
                            }}
                          >
                            {String(
                              startIndex + index + 1
                            ).padStart(2, "0")}
                          </span>

                          <span
                            style={{
                              position: "absolute",
                              top: "18px",
                              right: "18px",
                              zIndex: 4,
                              fontSize: "8px",
                              letterSpacing: ".15em",
                              opacity: 0.45,
                            }}
                          >
                            AVAILABLE
                          </span>

                          <div
                            style={{
                              position: "absolute",
                              bottom: "18px",
                              right: "18px",
                              zIndex: 4,
                              width: "45px",
                              height: "45px",
                              borderRadius: "50%",
                              border:
                                "1px solid rgba(255,255,255,.18)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "16px",
                              background: "rgba(0,0,0,.18)",
                              backdropFilter: "blur(8px)",
                            }}
                          >
                            ↗
                          </div>
                        </div>

                        <div
                          style={{
                            paddingTop: "20px",
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "20px",
                            alignItems: "flex-start",
                          }}
                        >
                          <div>
                            <h2
                              style={{
                                margin: 0,
                                fontSize:
                                  "clamp(13px, 1.4vw, 17px)",
                                fontWeight: 500,
                                letterSpacing: "-.02em",
                              }}
                            >
                              {product.name}
                            </h2>

                            <p
                              style={{
                                margin: "7px 0 0",
                                fontSize: "8px",
                                letterSpacing: ".14em",
                                opacity: 0.4,
                              }}
                            >
                              {product.category}
                            </p>
                          </div>

                          <span
                            style={{
                              fontSize: "11px",
                              whiteSpace: "nowrap",
                              opacity: 0.7,
                            }}
                          >
                            ৳{" "}
                            {Number(
                              product.price
                            ).toLocaleString()}
                          </span>
                        </div>
                      </Link>
                    ))}

                    {filteredProducts.length === 0 && (
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          padding: "120px 0",
                          textAlign: "center",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontFamily:
                              '"Space Grotesk", sans-serif',
                            fontSize: "10px",
                            letterSpacing: ".2em",
                            opacity: 0.4,
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
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={changePage}
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
              padding: "20px 5vw 0",
            }}
          >
            {/* MOBILE COLLECTION HEADER */}

            <div
              style={{
                position: "relative",
                zIndex: 20,
                marginBottom: "25px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: "15px",
                }}
              >
                <div>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      paddingBottom: "11px",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        fontFamily:
                          '"Space Grotesk", sans-serif',
                        fontSize:
                          "clamp(42px, 13vw, 64px)",
                        fontWeight: 500,
                        lineHeight: ".82",
                        letterSpacing: "-.075em",
                        color: "rgba(255,255,255,.95)",
                        textShadow:
                          "0 0 30px rgba(255,255,255,.025)",
                      }}
                    >
                      COLLECTION
                    </span>

                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        bottom: 0,
                        width: "42px",
                        height: "1px",
                        background: "#a91525",
                        boxShadow:
                          "0 0 12px rgba(169,21,37,.65)",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "13px",
                    }}
                  >
                    <span
                      style={{
                        width: "18px",
                        height: "1px",
                        background: "rgba(169,21,37,.8)",
                        boxShadow:
                          "0 0 8px rgba(169,21,37,.35)",
                      }}
                    />

                    <span
                      style={{
                        fontFamily:
                          '"Space Grotesk", sans-serif',
                        fontSize: "7px",
                        fontWeight: 600,
                        letterSpacing: ".20em",
                        color: "rgba(255,255,255,.48)",
                      }}
                    >
                      {selectedCategory === "ALL COLLECTION"
                        ? "ALL CATEGORY"
                        : selectedCategory}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    border:
                      "1px solid rgba(255,255,255,.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "rgba(255,255,255,.018)",
                    color: "rgba(255,255,255,.28)",
                    fontFamily:
                      '"Space Grotesk", sans-serif',
                    fontSize: "7px",
                    letterSpacing: ".08em",
                    flexShrink: 0,
                  }}
                >
                  {String(
                    filteredProducts.length
                  ).padStart(2, "0")}
                </div>
              </div>
            </div>

            {/* CATEGORY DROPDOWN */}

            <div
              style={{
                position: "relative",
                zIndex: 50,
                marginBottom: "20px",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setCategoryDropdownOpen(
                    (prev) => !prev
                  )
                }
                style={{
                  width: "100%",
                  minHeight: "50px",
                  padding: "0 14px",
                  border:
                    "1px solid rgba(255,255,255,.10)",
                  borderRadius: "2px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.018))",
                  color: "rgba(255,255,255,.82)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize: "8px",
                  letterSpacing: ".17em",
                  cursor: "pointer",
                  textAlign: "left",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.035)",
                }}
              >
                <span>
                  {selectedCategory === "ALL COLLECTION"
                    ? "ALL CATEGORY"
                    : selectedCategory || "SELECT CATEGORY"}
                </span>

                <span
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    border:
                      "1px solid rgba(255,255,255,.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    color: "rgba(255,255,255,.55)",
                    transform: categoryDropdownOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform .25s ease",
                  }}
                >
                  ↓
                </span>
              </button>

              {categoryDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    maxHeight: "260px",
                    overflowY: "auto",
                    border:
                      "1px solid rgba(255,255,255,.11)",
                    borderRadius: "2px",
                    background:
                      "linear-gradient(145deg, rgba(18,6,7,.98), rgba(7,3,3,.98))",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow:
                      "0 25px 60px rgba(0,0,0,.58), inset 0 1px 0 rgba(255,255,255,.04)",
                  }}
                >
                  {categoriesLoading ? (
                    <div
                      style={{
                        padding: "18px",
                        fontFamily:
                          '"Space Grotesk", sans-serif',
                        fontSize: "8px",
                        letterSpacing: ".16em",
                        color: "rgba(255,255,255,.3)",
                      }}
                    >
                      LOADING...
                    </div>
                  ) : (
                    categories.map((category) => {
                      const active =
                        selectedCategory === category.name;

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() =>
                            selectCategory(category)
                          }
                          style={{
                            width: "100%",
                            minHeight: "48px",
                            padding: "0 14px",
                            border: 0,
                            borderBottom:
                              "1px solid rgba(255,255,255,.055)",
                            background: active
                              ? "linear-gradient(90deg, rgba(169,21,37,.16), rgba(169,21,37,.035))"
                              : "transparent",
                            color: active
                              ? "rgba(255,255,255,.95)"
                              : "rgba(255,255,255,.48)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontFamily:
                              '"Space Grotesk", sans-serif',
                            fontSize: "8px",
                            fontWeight: active ? 600 : 500,
                            letterSpacing: ".16em",
                            cursor: "pointer",
                            textAlign: "left",
                            touchAction: "manipulation",
                          }}
                        >
                          <span>
                            {category.name}
                          </span>

                          {active && (
                            <span
                              style={{
                                color: "#a91525",
                                fontSize: "10px",
                                textShadow:
                                  "0 0 10px rgba(169,21,37,.5)",
                              }}
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* SELECTED PIECES */}

            <div
              style={{
                position: "relative",
                padding: "15px 0",
                borderTop:
                  "1px solid rgba(255,255,255,.10)",
                borderBottom:
                  "1px solid rgba(255,255,255,.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "7px",
                letterSpacing: ".17em",
                color: "rgba(255,255,255,.38)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#a91525",
                    boxShadow:
                      "0 0 9px rgba(169,21,37,.65)",
                  }}
                />

                <span>
                  {selectedCategory === "ALL COLLECTION"
                    ? "SELECTED PIECES"
                    : selectedCategory}
                </span>
              </div>

              <span
                style={{
                  color: "rgba(255,255,255,.22)",
                }}
              >
                {filteredProducts.length} PIECES
              </span>
            </div>

            {/* MOBILE PRODUCT GRID */}

            <div
              style={{
                marginTop: "22px",
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "38px 12px",
                paddingBottom: "45px",
              }}
            >
              {productsLoading ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: "80px 0",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily:
                        '"Space Grotesk", sans-serif',
                      fontSize: "9px",
                      letterSpacing: ".2em",
                      opacity: 0.4,
                    }}
                  >
                    LOADING COLLECTION...
                  </p>
                </div>
              ) : (
                <>
                  {paginatedProducts.map((product, index) => (
                    <Link
                      href={`/product/${product.id}`}
                      key={product.id}
                      style={{
                        color: "inherit",
                        textDecoration: "none",
                        display: "block",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "4 / 5",
                          overflow: "hidden",
                          background:
                            "linear-gradient(145deg, rgba(35,8,8,.75), rgba(7,3,3,.95))",
                          border:
                            "1px solid rgba(255,255,255,.07)",
                          boxShadow:
                            "0 14px 35px rgba(0,0,0,.18)",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            width: "70%",
                            height: "70%",
                            left: "15%",
                            top: "15%",
                            borderRadius: "50%",
                            background:
                              "radial-gradient(circle, rgba(130,0,0,.24), transparent 68%)",
                            filter: "blur(22px)",
                          }}
                        />

                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              position: "relative",
                              zIndex: 2,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 2,
                            }}
                          >
                            <span
                              style={{
                                fontSize:
                                  "clamp(25px, 8vw, 45px)",
                                fontWeight: 600,
                                letterSpacing: "-.07em",
                                opacity: 0.12,
                                transform: "rotate(-8deg)",
                              }}
                            >
                              STOKED
                            </span>
                          </div>
                        )}

                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            zIndex: 3,
                            background:
                              "linear-gradient(to bottom, rgba(0,0,0,.16), transparent 25%, transparent 70%, rgba(0,0,0,.22))",
                            pointerEvents: "none",
                          }}
                        />

                        <span
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            zIndex: 4,
                            fontSize: "6px",
                            letterSpacing: ".16em",
                            opacity: 0.52,
                            color: "rgba(255,255,255,.8)",
                          }}
                        >
                          {String(
                            startIndex + index + 1
                          ).padStart(2, "0")}
                        </span>

                        <span
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            zIndex: 4,
                            fontSize: "5px",
                            letterSpacing: ".13em",
                            opacity: 0.43,
                          }}
                        >
                          AVAILABLE
                        </span>

                        <div
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            zIndex: 4,
                            width: "34px",
                            height: "34px",
                            borderRadius: "50%",
                            border:
                              "1px solid rgba(255,255,255,.18)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            background:
                              "rgba(0,0,0,.24)",
                            backdropFilter: "blur(10px)",
                            boxShadow:
                              "0 5px 18px rgba(0,0,0,.22)",
                          }}
                        >
                          ↗
                        </div>
                      </div>

                      <div
                        style={{
                          paddingTop: "12px",
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems: "flex-start",
                            gap: "8px",
                          }}
                        >
                          <h2
                            style={{
                              margin: 0,
                              fontSize: "10px",
                              lineHeight: 1.15,
                              fontWeight: 500,
                              letterSpacing: "-.015em",
                              minWidth: 0,
                            }}
                          >
                            {product.name}
                          </h2>

                          <span
                            style={{
                              flexShrink: 0,
                              fontSize: "8px",
                              opacity: 0.7,
                              whiteSpace: "nowrap",
                            }}
                          >
                            ৳{" "}
                            {Number(
                              product.price
                            ).toLocaleString()}
                          </span>
                        </div>

                        <p
                          style={{
                            margin: "6px 0 0",
                            fontSize: "6px",
                            lineHeight: 1.3,
                            letterSpacing: ".1em",
                            opacity: 0.4,
                          }}
                        >
                          {product.category}
                        </p>
                      </div>
                    </Link>
                  ))}

                  {filteredProducts.length === 0 && (
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        padding: "80px 0",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontFamily:
                            '"Space Grotesk", sans-serif',
                          fontSize: "9px",
                          letterSpacing: ".2em",
                          opacity: 0.4,
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
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={changePage}
                mobile
              />
            )}
          </section>
        )}

        {/* =================================================
            FOOTER
        ================================================== */}

        <footer
          style={{
            padding: "35px 6vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily:
              '"Space Grotesk", sans-serif',
            fontSize: "8px",
            letterSpacing: ".15em",
            color: "rgba(255,255,255,.35)",
          }}
        >
          <span>© 2026 STOKED BD</span>

          <Link
            href="/"
            style={{
              color: "inherit",
              textDecoration: "none",
            }}
          >
            BACK TO HOME ↑
          </Link>

          <span>EST. 2026</span>
        </footer>
      </div>

      {/* =================================================
          MOBILE FILTER OVERLAY
      ================================================== */}

      {isMobile && filterOpen && (
        <div
          onClick={() => setFilterOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,.72)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              left: "5vw",
              right: "5vw",
              top: "50%",
              transform: "translateY(-50%)",
              padding: "28px 24px 28px 30px",
              border:
                "1px solid rgba(255,255,255,.10)",
              background:
                "linear-gradient(145deg, rgba(18,6,7,.97), rgba(6,3,3,.98))",
              boxShadow:
                "0 35px 90px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.04)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "-1px",
                top: "25px",
                width: "2px",
                height: "55px",
                background:
                  "linear-gradient(to bottom, #a91525, rgba(169,21,37,0))",
                boxShadow:
                  "0 0 14px rgba(169,21,37,.55)",
              }}
            />

            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              style={{
                position: "absolute",
                right: "18px",
                top: "16px",
                border: 0,
                background: "transparent",
                color: "rgba(255,255,255,.45)",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "8px",
                letterSpacing: ".16em",
                cursor: "pointer",
              }}
            >
              CLOSE ×
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "38px",
                gap: "15px",
              }}
            >
              <span
                style={{
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: ".23em",
                }}
              >
                FILTER
              </span>

              <span
                style={{
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize: "7px",
                  letterSpacing: ".16em",
                  color: "rgba(255,255,255,.38)",
                }}
              >
                {selectedCategory === "ALL COLLECTION"
                  ? "ALL CATEGORY"
                  : selectedCategory}
              </span>
            </div>

            <div style={{ marginBottom: "35px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                }}
              >
                <span
                  style={{
                    fontSize: "8px",
                    letterSpacing: ".2em",
                    color: "rgba(255,255,255,.48)",
                  }}
                >
                  PRICE RANGE
                </span>

                <span
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,.78)",
                  }}
                >
                  ৳ {maxPrice.toLocaleString()}
                </span>
              </div>

              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(Number(e.target.value))
                }
                style={{
                  width: "100%",
                  accentColor: "#a91525",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "8px",
                  fontSize: "6px",
                  letterSpacing: ".12em",
                  color: "rgba(255,255,255,.22)",
                }}
              >
                <span>৳ 500</span>
                <span>৳ 5,000</span>
              </div>
            </div>

            <div>
              <span
                style={{
                  fontSize: "8px",
                  letterSpacing: ".2em",
                  color: "rgba(255,255,255,.48)",
                }}
              >
                CATEGORIES
              </span>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: "12px",
                }}
              >
                {categoriesLoading ? (
                  <div
                    style={{
                      color:
                        "rgba(255,255,255,.25)",
                      fontSize: "8px",
                      letterSpacing: ".16em",
                      padding: "15px 0",
                    }}
                  >
                    LOADING...
                  </div>
                ) : (
                  categories.map((category, index) => {
                    const active =
                      selectedCategory === category.name;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() =>
                          selectCategory(category)
                        }
                        style={{
                          position: "relative",
                          height: "42px",
                          padding: "0 0 0 17px",
                          border: 0,
                          background: "transparent",
                          color: active
                            ? "rgba(255,255,255,.95)"
                            : "rgba(255,255,255,.43)",
                          textAlign: "left",
                          fontFamily:
                            '"Space Grotesk", sans-serif',
                          fontSize: "9px",
                          fontWeight: active ? 600 : 500,
                          letterSpacing: ".16em",
                          cursor: "pointer",
                          touchAction: "manipulation",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform:
                              "translateY(-50%)",
                            width: active ? "6px" : "0",
                            height: "1px",
                            background: "#a91525",
                            boxShadow: active
                              ? "0 0 10px rgba(169,21,37,.75)"
                              : "none",
                          }}
                        />

                        <span
                          style={{
                            display: "inline-block",
                            width: "29px",
                            fontSize: "7px",
                            color: active
                              ? "rgba(255,255,255,.38)"
                              : "rgba(255,255,255,.17)",
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        {category.name}
                      </button>
                    );
                  })
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
  onPageChange: (page: number) => void;
  mobile?: boolean;
}) {
  const buttonSize = mobile ? "32px" : "38px";
  const gap = mobile ? "5px" : "7px";

  const pages: number[] = [];

  for (let page = 1; page <= totalPages; page++) {
    pages.push(page);
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap,
        padding: mobile ? "20px 0 75px" : "30px 0 90px",
        fontFamily: '"Space Grotesk", sans-serif',
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        onClick={() =>
          onPageChange(currentPage - 1)
        }
        disabled={currentPage === 1}
        aria-label="Previous page"
        style={{
          width: buttonSize,
          height: buttonSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border:
            "1px solid rgba(255,255,255,.09)",
          borderRadius: mobile ? "50%" : "0",
          background: "rgba(0,0,0,.18)",
          color:
            currentPage === 1
              ? "rgba(255,255,255,.18)"
              : "rgba(255,255,255,.65)",
          fontSize: mobile ? "12px" : "14px",
          cursor:
            currentPage === 1
              ? "default"
              : "pointer",
          transition: "all .25s ease",
          touchAction: "manipulation",
        }}
      >
        ←
      </button>

      {pages.map((page) => {
        const active = currentPage === page;

        return (
          <button
            key={page}
            type="button"
            onClick={() =>
              onPageChange(page)
            }
            aria-current={
              active ? "page" : undefined
            }
            style={{
              width: buttonSize,
              height: buttonSize,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: active
                ? "1px solid rgba(169,21,37,.9)"
                : "1px solid rgba(255,255,255,.08)",
              borderRadius: mobile ? "50%" : "0",
              background: active
                ? "rgba(169,21,37,.16)"
                : "rgba(0,0,0,.16)",
              color: active
                ? "rgba(255,255,255,.95)"
                : "rgba(255,255,255,.42)",
              fontSize: mobile ? "8px" : "9px",
              letterSpacing: ".08em",
              cursor: "pointer",
              boxShadow: active
                ? "0 0 18px rgba(169,21,37,.18)"
                : "none",
              transition: "all .25s ease",
              touchAction: "manipulation",
            }}
          >
            {String(page).padStart(2, "0")}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() =>
          onPageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        aria-label="Next page"
        style={{
          width: buttonSize,
          height: buttonSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border:
            "1px solid rgba(255,255,255,.09)",
          borderRadius: mobile ? "50%" : "0",
          background: "rgba(0,0,0,.18)",
          color:
            currentPage === totalPages
              ? "rgba(255,255,255,.18)"
              : "rgba(255,255,255,.65)",
          fontSize: mobile ? "12px" : "14px",
          cursor:
            currentPage === totalPages
              ? "default"
              : "pointer",
          transition: "all .25s ease",
          touchAction: "manipulation",
        }}
      >
        →
      </button>
    </div>
  );
}