"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  type MouseEvent,
  type CSSProperties,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPricing, isSaleName } from "@/lib/sale";
import SpiderLoader from "@/app/components/SpiderLoader";

type Product = {
  id: string;
  name: string;
  category: string;
  categoryIds: string[];
  price: number;
  salePrice: number | null;
  finalPrice: number;
  onSale: boolean;
  discountPercent: number;
  image: string;
  soldOut: boolean;
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
const ALL = "ALL COLLECTION";
const FONT = '"Space Grotesk", sans-serif';
const CARD_BG =
  "linear-gradient(145deg, rgba(35,8,8,.75), rgba(7,3,3,.95))";

const SPIDER =
  "https://www.pngall.com/wp-content/uploads/13/Spiderman-Logo-No-Background.png";

const ALL_CATEGORY: Category = {
  id: "all",
  name: ALL,
  slug: "",
  min_price: 0,
  max_price: 5000,
  created_at: "",
};

const socialButtonStyle: CSSProperties = {
  minHeight: "56px",
  width: "100%",
  border: "1px solid rgba(255,255,255,.08)",
  background: "rgba(255,255,255,.025)",
  color: "rgba(255,255,255,.68)",
  textAlign: "left",
  padding: "0 18px",
  fontFamily: FONT,
  fontSize: "12px",
  letterSpacing: ".15em",
  cursor: "pointer",
};

let _cachedProducts: Product[] = [];
let _productsLoaded = false;

let _cachedCategories: Category[] = [ALL_CATEGORY];
let _categoriesLoaded = false;
let _isMobile = false;

function resolveSelectedCategory(slug: string, cats: Category[]): string {
  if (!slug) return ALL;
  const found = cats.find((c) => c.slug === slug);
  return found ? found.name : "";
}

export default function ShopView() {
  const router = useRouter();
  const pathname = usePathname();
  const productScrollRef = useRef<HTMLDivElement>(null);

  const slug = (pathname || "").split("/").filter(Boolean)[1] || "";

  const [products, setProducts] = useState<Product[]>(_cachedProducts);
  const [productsLoading, setProductsLoading] = useState(!_productsLoaded);

  const [categories, setCategories] = useState<Category[]>(_cachedCategories);
  const [categoriesLoading, setCategoriesLoading] = useState(!_categoriesLoaded);

  const [selectedCategory, setSelectedCategory] = useState(() =>
    resolveSelectedCategory(slug, _cachedCategories)
  );

  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [categoryMinPrice, setCategoryMinPrice] = useState(0);
  const [categoryMaxPrice, setCategoryMaxPrice] = useState(5000);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [isMobile, setIsMobile] = useState(_isMobile);
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const selectedCategoryId = categories.find(
    (category) => category.name === selectedCategory
  )?.id;

  function matchesSelected(product: Product) {
    if (selectedCategory === ALL) return true;
    if (isSaleName(selectedCategory)) return product.onSale;
    if (!selectedCategoryId) return false;
    return product.categoryIds.includes(selectedCategoryId);
  }

  function categoryText(product: Product) {
    const names = product.categoryIds
      .map((id) => categories.find((category) => category.id === id)?.name)
      .filter((name): name is string => Boolean(name));

    return names.length > 0 ? names.join(" / ") : product.category;
  }

  const stop = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
  };

  const openMenu = (e?: MouseEvent) => {
    stop(e);
    setAboutOpen(false);
    setContactOpen(false);
    setMenuOpen(true);
  };

  const closeMenu = (e?: MouseEvent) => {
    stop(e);
    setMenuOpen(false);
  };

  const goTo = (path: string) => (e?: MouseEvent) => {
    stop(e);
    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(false);
    router.push(path);
  };

  const openAbout = (e?: MouseEvent) => {
    stop(e);
    setMenuOpen(false);
    setContactOpen(false);
    setAboutOpen(true);
  };

  const closeAbout = (e?: MouseEvent) => {
    stop(e);
    setAboutOpen(false);
    setMenuOpen(false);
  };

  const openContact = (e?: MouseEvent) => {
    stop(e);
    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(true);
  };

  const closeContact = (e?: MouseEvent) => {
    stop(e);
    setContactOpen(false);
    setMenuOpen(false);
  };

  const openLink = (url: string) => (e?: MouseEvent) => {
    stop(e);

    const mobile =
      typeof window !== "undefined" &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (mobile) {
      window.location.href = url;
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openInstagram = openLink("https://www.instagram.com/stoked.bd/");
  const openFacebook = openLink(
    "https://www.facebook.com/share/1ba7vRfxAB/?mibextid=wwXIfr"
  );
  const openTikTok = openLink("https://www.tiktok.com/@stoked.bd");

  useEffect(() => {
    if (_productsLoaded) return;

    let mounted = true;

    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          category_id,
          price,
          sale_price,
          category_ids,
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
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error("SHOP PRODUCT LOAD ERROR:", error);
        setProducts([]);
        setProductsLoading(false);
        return;
      }

      const formatted: Product[] = (data || []).map((product: any) => {
        const images = Array.isArray(product.product_images)
          ? [...product.product_images].sort(
              (a, b) =>
                Number(a.sort_order || 0) - Number(b.sort_order || 0)
            )
          : [];

        const category = Array.isArray(product.categories)
          ? product.categories[0]
          : product.categories;

        const pricing = getPricing(product.price, product.sale_price);

        return {
          id: product.id,
          name: product.name,
          category: category?.name || "NO COLLECTION",
          categoryIds:
            Array.isArray(product.category_ids) &&
            product.category_ids.length > 0
              ? product.category_ids
              : product.category_id
              ? [product.category_id]
              : [],
          ...pricing,
          image: images[0]?.image_url || "",
          soldOut:
            String(product.status || "").trim().toUpperCase() !==
            "AVAILABLE",
          created_at: product.created_at,
        };
      });

      formatted.sort((a, b) => Number(a.soldOut) - Number(b.soldOut));

      _cachedProducts = formatted;
      _productsLoaded = true;

      setProducts(formatted);
      setProductsLoading(false);
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    function applySlug(list: Category[]) {
      if (!slug) {
        setSelectedCategory(ALL);
      } else {
        const current = list.find(
          (category) => category.id !== "all" && category.slug === slug
        );

        if (current) {
          setSelectedCategory(current.name);
        } else {
          router.replace("/shop");
        }
      }

      setCurrentPage(1);
    }

    if (_categoriesLoaded) {
      setCategories(_cachedCategories);
      setCategoriesLoading(false);
      applySlug(_cachedCategories);
      return;
    }

    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, min_price, max_price, created_at")
        .order("created_at", { ascending: true });

      if (!mounted) return;

      if (error) {
        console.error("SHOP CATEGORY LOAD ERROR:", error);
        setCategories([ALL_CATEGORY]);
        setCategoriesLoading(false);
        return;
      }

      const list: Category[] = (data || [])
        .filter(
          (category: Category) =>
            category.name.trim().toUpperCase() !== ALL
        )
        .map((category: Category) => ({
          ...category,
          min_price: Number.isFinite(Number(category.min_price))
            ? Number(category.min_price)
            : 0,
          max_price: Number.isFinite(Number(category.max_price))
            ? Number(category.max_price)
            : 5000,
        }));

      const fullList = [ALL_CATEGORY, ...list];

      _cachedCategories = fullList;
      _categoriesLoaded = true;

      setCategories(fullList);
      applySlug(fullList);
      setCategoriesLoading(false);
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, [slug, router]);

  useEffect(() => {
    if (productsLoading) return;

    const list = selectedCategory
      ? products.filter((product) => matchesSelected(product))
      : [];

    const prices = list
      .map((product) => Number(product.finalPrice))
      .filter((price) => Number.isFinite(price));

    if (prices.length === 0) {
      setCategoryMinPrice(0);
      setCategoryMaxPrice(0);
      setMaxPrice(0);
      setCurrentPage(1);
      return;
    }

    const realMin = Math.min(...prices);
    const realMax = Math.max(...prices);

    setCategoryMinPrice(realMin);
    setCategoryMaxPrice(realMax);

    setMaxPrice((current) =>
      current < realMin || current > realMax ? realMax : current
    );

    setCurrentPage(1);
  }, [products, productsLoading, selectedCategory, categories]);

  useLayoutEffect(() => {
    const check = () => {
      const next = window.innerWidth <= 768;
      _isMobile = next;
      setIsMobile(next);
    };

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  const filteredProducts = products.filter((product) => {
    const categoryMatch = matchesSelected(product);

    const priceMatch =
      product.finalPrice >= categoryMinPrice &&
      product.finalPrice <= maxPrice;

    return categoryMatch && priceMatch;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;

  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  const categoryLabel =
    selectedCategory === ALL ? "ALL CATEGORY" : selectedCategory;

  const selectCategory = (category: Category) => {
    if (category.name === selectedCategory) {
      setMobileCategoryOpen(false);
      return;
    }

    setMobileCategoryOpen(false);
    setSelectedCategory(category.name);
    setCurrentPage(1);
    router.push(category.id === "all" ? "/shop" : `/shop/${category.slug}`);
  };

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);

    if (productScrollRef.current) {
      productScrollRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const sliderValue = Math.min(
    Math.max(maxPrice, categoryMinPrice),
    categoryMaxPrice
  );

  const sliderDisabled = categoryMinPrice === categoryMaxPrice;

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
      {productsLoading && <SpiderLoader label="ENTERING COLLECTION" />}

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
              <img src={SPIDER} alt="" draggable={false} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 5 }}>
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
                fontFamily: FONT,
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
                fontFamily: FONT,
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
                00
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
                fontFamily: FONT,
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

        {!isMobile && (
          <section
            className="shop-desktop"
            style={{
              height: "calc(100vh - 92px)",
              minHeight: "650px",
              display: "grid",
              gridTemplateColumns: "300px minmax(0, 1fr)",
              gap: "clamp(45px, 6vw, 100px)",
              padding: "92px 6vw 35px",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
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
                    fontFamily: FONT,
                    fontSize: "14px",
                    fontWeight: 600,
                    letterSpacing: ".23em",
                    color: "rgba(255,255,255,.9)",
                  }}
                >
                  FILTER
                </span>

                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: "10px",
                    fontWeight: 500,
                    letterSpacing: ".16em",
                    color: "rgba(255,255,255,.45)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {categoryLabel || "CATEGORY"}
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
                      fontFamily: FONT,
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: ".2em",
                      color: "rgba(255,255,255,.6)",
                    }}
                  >
                    PRICE RANGE
                  </span>

                  <span
                    style={{
                      fontFamily: FONT,
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,.9)",
                    }}
                  >
                    ৳ {categoryMinPrice.toLocaleString()} — ৳{" "}
                    {maxPrice.toLocaleString()}
                  </span>
                </div>

                <input
                  type="range"
                  min={categoryMinPrice}
                  max={categoryMaxPrice}
                  step="1"
                  value={sliderValue}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  disabled={sliderDisabled}
                  style={{
                    width: "100%",
                    height: "3px",
                    accentColor: "#a91525",
                    cursor: sliderDisabled ? "default" : "pointer",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "10px",
                    fontFamily: FONT,
                    fontSize: "10px",
                    letterSpacing: ".14em",
                    color: "rgba(255,255,255,.38)",
                  }}
                >
                  <span>৳ {categoryMinPrice.toLocaleString()}</span>
                  <span>৳ {categoryMaxPrice.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <div style={{ marginBottom: "16px" }}>
                  <span
                    style={{
                      fontFamily: FONT,
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: ".2em",
                      color: "rgba(255,255,255,.6)",
                    }}
                  >
                    CATEGORIES
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {categoriesLoading ? (
                    <div
                      style={{
                        color: "rgba(255,255,255,.25)",
                        fontFamily: FONT,
                        fontSize: "11px",
                        letterSpacing: ".16em",
                        padding: "15px 0",
                      }}
                    >
                      LOADING...
                    </div>
                  ) : (
                    categories.map((category, index) => {
                      const active = selectedCategory === category.name;
                      const sale = isSaleName(category.name);

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => selectCategory(category)}
                          style={{
                            position: "relative",
                            width: "100%",
                            height: "48px",
                            padding: "0 0 0 18px",
                            border: 0,
                            background: "transparent",
                            color: sale
                              ? active
                                ? "#ff4a4a"
                                : "rgba(255,74,74,.7)"
                              : active
                              ? "rgba(255,255,255,.95)"
                              : "rgba(255,255,255,.45)",
                            textAlign: "left",
                            fontFamily: FONT,
                            fontSize: "15px",
                            fontWeight: active ? 600 : 500,
                            letterSpacing: ".12em",
                            cursor: "pointer",
                            transition:
                              "color .25s ease, padding-left .25s ease",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              left: 0,
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: active ? "7px" : "0",
                              height: "1px",
                              background: "#b01829",
                              boxShadow: active
                                ? "0 0 10px rgba(176,24,41,.75)"
                                : "none",
                              transition: "width .25s ease",
                            }}
                          />

                          <span
                            style={{
                              display: "inline-block",
                              width: "32px",
                              fontSize: "10px",
                              color: active
                                ? "rgba(255,255,255,.45)"
                                : "rgba(255,255,255,.25)",
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

            <div
              ref={productScrollRef}
              className="stoked-product-scroll"
              style={{
                minWidth: 0,
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: "8px",
                scrollBehavior: "smooth",
                scrollbarWidth: "thin",
                scrollbarColor: "#a91525 rgba(255,255,255,.04)",
              }}
            >
              <div style={{ paddingTop: "8px", paddingBottom: "38px" }}>
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    paddingBottom: "13px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT,
                      fontSize: "clamp(48px, 6vw, 86px)",
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
                      boxShadow: "0 0 10px rgba(169,21,37,.55)",
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
                    }}
                  />

                  <span
                    style={{
                      fontFamily: FONT,
                      fontSize: "8px",
                      fontWeight: 600,
                      letterSpacing: ".2em",
                      color: "rgba(255,255,255,.48)",
                    }}
                  >
                    {categoryLabel}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "62px 48px",
                  paddingLeft: "2.5%",
                  paddingRight: "2.5%",
                  paddingBottom: "45px",
                }}
              >
                {paginatedProducts.map((product, index) => (
                  <Link
                    href={`/product/${product.id}`}
                    key={product.id}
                    className="product-card-animated"
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 0,
                      animationDelay: `${(index % 12) * 0.045}s`,
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "4 / 5",
                        overflow: "hidden",
                        background: CARD_BG,
                        border: "1px solid rgba(255,255,255,.07)",
                      }}
                    >
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
                            filter: product.soldOut
                              ? "grayscale(100%)"
                              : "none",
                            opacity: product.soldOut ? 0.45 : 1,
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
                          }}
                        >
                          <span
                            style={{
                              fontSize: "clamp(35px, 5vw, 75px)",
                              fontWeight: 600,
                              letterSpacing: "-.07em",
                              opacity: 0.12,
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
                        {String(startIndex + index + 1).padStart(2, "0")}
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
                        {product.soldOut ? "STOCKED OUT" : "AVAILABLE"}
                      </span>

                      {product.soldOut && (
                        <span
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            zIndex: 5,
                            padding: "10px 22px",
                            background: "rgba(8,3,3,.85)",
                            border: "1px solid rgba(169,21,37,.9)",
                            color: "#ff4a4a",
                            fontSize: "12px",
                            fontWeight: 600,
                            letterSpacing: ".25em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          STOCKED OUT
                        </span>
                      )}

                      {product.onSale && !product.soldOut && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: "18px",
                            left: "18px",
                            zIndex: 4,
                            padding: "6px 10px",
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

                      <div
                        style={{
                          position: "absolute",
                          bottom: "18px",
                          right: "18px",
                          zIndex: 4,
                          width: "45px",
                          height: "45px",
                          borderRadius: "50%",
                          border: "1px solid rgba(255,255,255,.18)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          background: "rgba(0,0,0,.18)",
                        }}
                      >
                        ↗
                      </div>
                    </div>

                    <div
                      style={{
                        paddingTop: "16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "20px",
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: "clamp(13px, 1.4vw, 17px)",
                            fontWeight: 500,
                            letterSpacing: "-.02em",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            lineHeight: 1.3,
                            minHeight: "2.6em",
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
                          {categoryText(product)}
                        </p>
                      </div>

                      <Price
                        price={product.price}
                        salePrice={product.salePrice}
                        size={13}
                        align="right"
                      />
                    </div>
                  </Link>
                ))}

                {!productsLoading && filteredProducts.length === 0 && (
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
                        fontFamily: FONT,
                        fontSize: "10px",
                        letterSpacing: ".2em",
                        opacity: 0.4,
                      }}
                    >
                      NO PIECES FOUND
                    </p>
                  </div>
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

        {isMobile && (
          <section className="shop-mobile" style={{ padding: "94px 6vw 0" }}>
            <div style={{ marginBottom: "30px" }}>
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  paddingBottom: "12px",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontFamily: FONT,
                    fontSize: "clamp(42px, 13vw, 64px)",
                    fontWeight: 500,
                    lineHeight: ".85",
                    letterSpacing: "-.065em",
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
                  }}
                />
              </div>
            </div>

            <div
              style={{
                padding: "18px 0",
                borderTop: "1px solid rgba(255,255,255,.12)",
                borderBottom: "1px solid rgba(255,255,255,.09)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "15px",
                fontFamily: FONT,
                fontSize: "14px",
                letterSpacing: ".15em",
                color: "rgba(255,255,255,.42)",
              }}
            >
              <span>SELECTED PIECES</span>

              <span>
                ৳ {categoryMinPrice.toLocaleString()} — ৳{" "}
                {maxPrice.toLocaleString()}
              </span>
            </div>

            <div style={{ marginTop: "18px", position: "relative" }}>
              <div
                style={{
                  marginBottom: "9px",
                  fontFamily: FONT,
                  fontSize: "14px",
                  letterSpacing: ".18em",
                  color: "rgba(255,255,255,.35)",
                }}
              >
                CATEGORY
              </div>

              <button
                type="button"
                onClick={() => setMobileCategoryOpen((value) => !value)}
                style={{
                  width: "100%",
                  minHeight: "52px",
                  padding: "0 15px",
                  border: "1px solid rgba(255,255,255,.10)",
                  background: CARD_BG,
                  color: "rgba(255,255,255,.82)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontFamily: FONT,
                  fontSize: "14px",
                  letterSpacing: ".14em",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span>{categoryLabel || "CATEGORY"}</span>
                <span>{mobileCategoryOpen ? "↑" : "↓"}</span>
              </button>

              {mobileCategoryOpen && (
                <div
                  style={{
                    marginTop: "5px",
                    width: "100%",
                    border: "1px solid rgba(255,255,255,.09)",
                    background: "rgba(8,3,3,.97)",
                    overflow: "hidden",
                    position: "relative",
                    zIndex: 50,
                  }}
                >
                  {categories.map((category, index) => {
                    const active = selectedCategory === category.name;
                    const sale = isSaleName(category.name);

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => selectCategory(category)}
                        style={{
                          width: "100%",
                          minHeight: "46px",
                          padding: "0 14px",
                          border: 0,
                          borderBottom: "1px solid rgba(255,255,255,.05)",
                          background: active
                            ? "rgba(169,21,37,.12)"
                            : "transparent",
                          color: sale
                            ? "#ff4a4a"
                            : active
                            ? "#fff"
                            : "rgba(255,255,255,.48)",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          textAlign: "left",
                          fontFamily: FONT,
                          fontSize: "14px",
                          letterSpacing: ".14em",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          style={{
                            width: "24px",
                            fontSize: "8px",
                            opacity: 0.5,
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span>
                          {category.name === ALL
                            ? "ALL CATEGORY"
                            : category.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ padding: "18px 0 2px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "11px",
                  fontFamily: FONT,
                  fontSize: "14px",
                  letterSpacing: ".16em",
                  color: "rgba(255,255,255,.42)",
                }}
              >
                <span>PRICE RANGE</span>
                <span>৳ {maxPrice.toLocaleString()}</span>
              </div>

              <input
                type="range"
                min={categoryMinPrice}
                max={categoryMaxPrice}
                step="1"
                value={sliderValue}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                disabled={sliderDisabled}
                style={{
                  width: "100%",
                  height: "3px",
                  accentColor: "#a91525",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "38px 12px",
                paddingBottom: "45px",
              }}
            >
              {paginatedProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="product-card-animated"
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    minWidth: 0,
                    animationDelay: `${(index % 12) * 0.045}s`,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "4 / 5",
                      overflow: "hidden",
                      background: CARD_BG,
                      border: "1px solid rgba(255,255,255,.07)",
                    }}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: product.soldOut
                            ? "grayscale(100%)"
                            : "none",
                          opacity: product.soldOut ? 0.45 : 1,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        STOKED
                      </div>
                    )}

                    {product.soldOut && (
                      <span
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          zIndex: 5,
                          padding: "7px 12px",
                          background: "rgba(8,3,3,.85)",
                          border: "1px solid rgba(169,21,37,.9)",
                          color: "#ff4a4a",
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: ".18em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        STOCKED OUT
                      </span>
                    )}

                    {product.onSale && !product.soldOut && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "8px",
                          left: "8px",
                          padding: "4px 8px",
                          background: "#a91525",
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: 600,
                        }}
                      >
                        -{product.discountPercent}%
                      </span>
                    )}
                  </div>

                  <div style={{ paddingTop: "12px" }}>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "17px",
                        fontWeight: 500,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: 1.3,
                        minHeight: "2.6em",
                      }}
                    >
                      {product.name}
                    </h2>

                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: "12px",
                        opacity: 0.4,
                      }}
                    >
                      {categoryText(product)}
                    </p>

                    <div style={{ marginTop: "8px" }}>
                      <Price
                        price={product.price}
                        salePrice={product.salePrice}
                        size={15}
                      />
                    </div>
                  </div>
                </Link>
              ))}

              {!productsLoading && filteredProducts.length === 0 && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: "80px 0",
                    textAlign: "center",
                  }}
                >
                  NO PIECES FOUND
                </div>
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

        <footer
          style={{
            padding: "35px 6vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: FONT,
            fontSize: "8px",
            letterSpacing: ".15em",
            color: "rgba(255,255,255,.35)",
          }}
        >
          <span>© 2026 STOKED BD</span>

          <Link
            href="/"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            BACK TO HOME ↑
          </Link>

          <span>EST. 2026</span>
        </footer>
      </div>

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
              fontFamily: FONT,
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
        </Modal>
      )}

      <div
        className={`stoked-menu ${menuOpen ? "stoked-menu-visible" : ""}`}
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

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @media (max-width: 768px) {
          .shop-page .shop-desktop {
            display: none !important;
          }
        }

        @media (min-width: 769px) {
          .shop-page .shop-mobile {
            display: none !important;
          }
        }

        .shop-page .stoked-product-scroll {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
        }

        .shop-page .stoked-product-scroll::-webkit-scrollbar {
          width: 5px;
        }

        .shop-page .stoked-product-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.025);
          border-radius: 999px;
        }

        .shop-page .stoked-product-scroll::-webkit-scrollbar-thumb {
          background: #a91525;
          border-radius: 999px;
          box-shadow: 0 0 8px rgba(169, 21, 37, 0.35);
          transition: background 0.3s ease;
        }

        .shop-page .stoked-product-scroll::-webkit-scrollbar-thumb:hover {
          background: #c51d32;
        }

        @keyframes productEntrance {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .product-card-animated {
          animation: productEntrance 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
          will-change: transform, opacity;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .product-card-animated:hover {
          transform: translateY(-3px);
        }
      `}</style>
    </main>
  );
}

function Price({
  price,
  salePrice,
  size,
  align = "left",
}: {
  price: number;
  salePrice: number | null;
  size: number;
  align?: "left" | "right";
}) {
  if (salePrice === null || salePrice >= price) {
    return (
      <span style={{ fontSize: size, whiteSpace: "nowrap", opacity: 0.75 }}>
        ৳ {price.toLocaleString()}
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: align === "right" ? "flex-end" : "flex-start",
        gap: "2px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontSize: Math.round(size * 0.8),
          textDecoration: "line-through",
          opacity: 0.45,
        }}
      >
        ৳ {price.toLocaleString()}
      </span>

      <span style={{ fontSize: size, fontWeight: 600, color: "#ff4a4a" }}>
        ৳ {salePrice.toLocaleString()}
      </span>
    </span>
  );
}

const closeBtnStyle: CSSProperties = {
  position: "absolute",
  top: "20px",
  right: "20px",
  border: 0,
  background: "transparent",
  color: "rgba(255,255,255,.5)",
  cursor: "pointer",
};

const modalTitleStyle: CSSProperties = {
  fontFamily: FONT,
  fontSize: "clamp(42px, 8vw, 78px)",
  lineHeight: ".85",
  letterSpacing: "-.065em",
  marginBottom: "30px",
};

function Modal({
  onClose,
  isMobile,
  children,
}: {
  onClose: (e?: MouseEvent) => void;
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
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const size = mobile ? "32px" : "38px";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: mobile ? "5px" : "7px",
        padding: mobile ? "20px 0 75px" : "30px 0 90px",
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{
          width: size,
          height: size,
          border: "1px solid rgba(255,255,255,.09)",
          background: "rgba(0,0,0,.18)",
          color: currentPage === 1 ? "rgba(255,255,255,.18)" : "#fff",
          cursor: currentPage === 1 ? "default" : "pointer",
          transition: "all .25s ease",
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
            onClick={() => onPageChange(page)}
            style={{
              width: size,
              height: size,
              border: active
                ? "1px solid rgba(169,21,37,.9)"
                : "1px solid rgba(255,255,255,.08)",
              background: active
                ? "rgba(169,21,37,.16)"
                : "rgba(0,0,0,.16)",
              color: active ? "#fff" : "rgba(255,255,255,.42)",
              cursor: "pointer",
              transition: "all .25s cubic-bezier(0.16, 1, 0.3, 1)",
              transform: active ? "scale(1.05)" : "scale(1)",
            }}
          >
            {String(page).padStart(2, "0")}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{
          width: size,
          height: size,
          border: "1px solid rgba(255,255,255,.09)",
          background: "rgba(0,0,0,.18)",
          color:
            currentPage === totalPages ? "rgba(255,255,255,.18)" : "#fff",
          cursor: currentPage === totalPages ? "default" : "pointer",
          transition: "all .25s ease",
        }}
      >
        →
      </button>
    </div>
  );
}