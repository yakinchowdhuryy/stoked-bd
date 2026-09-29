"use client";

import "./categories.css";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  min_price: number;
  max_price: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [editingName, setEditingName] = useState("");
  const [editingMinPrice, setEditingMinPrice] = useState("");
  const [editingMaxPrice, setEditingMaxPrice] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("CATEGORY LOAD ERROR:", error);
      setMessage("FAILED TO LOAD CATEGORIES.");
      setLoading(false);
      return;
    }

    setCategories(data || []);
    setLoading(false);
  }

  function makeSlug(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function addCategory(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (adding) return;

    setMessage("");

    const cleanName = name.trim();

    if (!cleanName) {
      setMessage("CATEGORY NAME IS REQUIRED.");
      return;
    }

    const min = Number(minPrice);
    const max = Number(maxPrice);

    if (
      minPrice === "" ||
      maxPrice === "" ||
      Number.isNaN(min) ||
      Number.isNaN(max)
    ) {
      setMessage("MINIMUM AND MAXIMUM PRICE ARE REQUIRED.");
      return;
    }

    if (min < 0 || max < 0) {
      setMessage("PRICE CANNOT BE NEGATIVE.");
      return;
    }

    if (min >= max) {
      setMessage(
        "MAXIMUM PRICE MUST BE GREATER THAN MINIMUM PRICE."
      );
      return;
    }

    setAdding(true);

    const slug = makeSlug(cleanName);

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: cleanName,
        slug,
        min_price: min,
        max_price: max,
      })
      .select()
      .single();

    if (error) {
      console.error("CATEGORY ADD ERROR:", error);
      setMessage(error.message.toUpperCase());
      setAdding(false);
      return;
    }

    setCategories((prev) => [...prev, data]);

    setName("");
    setMinPrice("");
    setMaxPrice("");

    setMessage("CATEGORY ADDED SUCCESSFULLY.");
    setAdding(false);
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingMinPrice(String(category.min_price ?? 0));
    setEditingMaxPrice(String(category.max_price ?? 100000));
    setMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
    setEditingMinPrice("");
    setEditingMaxPrice("");
  }

  async function saveEdit(id: string) {
    const cleanName = editingName.trim();

    if (!cleanName) {
      setMessage("CATEGORY NAME IS REQUIRED.");
      return;
    }

    const min = Number(editingMinPrice);
    const max = Number(editingMaxPrice);

    if (
      editingMinPrice === "" ||
      editingMaxPrice === "" ||
      Number.isNaN(min) ||
      Number.isNaN(max)
    ) {
      setMessage("MINIMUM AND MAXIMUM PRICE ARE REQUIRED.");
      return;
    }

    if (min < 0 || max < 0) {
      setMessage("PRICE CANNOT BE NEGATIVE.");
      return;
    }

    if (min >= max) {
      setMessage(
        "MAXIMUM PRICE MUST BE GREATER THAN MINIMUM PRICE."
      );
      return;
    }

    const slug = makeSlug(cleanName);

    const { data, error } = await supabase
      .from("categories")
      .update({
        name: cleanName,
        slug,
        min_price: min,
        max_price: max,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("CATEGORY UPDATE ERROR:", error);
      setMessage(error.message.toUpperCase());
      return;
    }

    setCategories((prev) =>
      prev.map((category) =>
        category.id === id ? data : category
      )
    );

    cancelEditing();
    setMessage("CATEGORY UPDATED SUCCESSFULLY.");
  }

  async function deleteCategory(id: string) {
    const confirmed = window.confirm(
      "DELETE THIS CATEGORY?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("CATEGORY DELETE ERROR:", error);
      setMessage(error.message.toUpperCase());
      return;
    }

    setCategories((prev) =>
      prev.filter((category) => category.id !== id)
    );

    setMessage("CATEGORY DELETED.");
  }

  return (
    <main className="categories-shell">
      <div className="categories-grid-bg" />
      <div className="categories-red-orb" />

      {/* SIDEBAR */}
      <aside className="categories-sidebar">
        <div>
          <Link
            href="/admin"
            className="categories-brand"
          >
            STOKED <span>BD</span>
          </Link>

          <div className="categories-sidebar-label">
            CONTROL PANEL
          </div>

          <nav className="categories-nav">
            <Link
              href="/admin"
              className="categories-nav-item"
            >
              <span>01</span>
              DASHBOARD
            </Link>

            <Link
              href="/admin/categories"
              className="categories-nav-item active"
            >
              <span>02</span>
              CATEGORIES
            </Link>

            <Link
              href="/admin/products"
              className="categories-nav-item"
            >
              <span>03</span>
              PRODUCTS
            </Link>

            <Link
              href="/admin/orders"
              className="categories-nav-item"
            >
              <span>04</span>
              ORDERS
            </Link>
          </nav>
        </div>

        <div className="categories-sidebar-bottom">
          <div className="categories-system-status">
            <span />
            SYSTEM ONLINE
          </div>

          <Link
            href="/admin/login"
            className="categories-logout"
          >
            EXIT PANEL
          </Link>
        </div>
      </aside>

      {/* MOBILE */}
      <header className="categories-mobile-header">
        <Link
          href="/admin"
          className="categories-mobile-brand"
        >
          STOKED <span>BD</span>
        </Link>

        <Link
          href="/admin/login"
          className="categories-mobile-exit"
        >
          EXIT
        </Link>
      </header>

      {/* CONTENT */}
      <section className="categories-content">
        <div className="categories-container">
          <div className="categories-topline">
            <span>STOKED BD / ADMIN</span>
            <span>CONTROL // 002</span>
          </div>

          <section className="categories-hero">
            <div className="categories-kicker">
              COLLECTION MANAGEMENT
            </div>

            <div className="categories-hero-bottom">
              <h1>
                CATE
                <br />
                GORIES
              </h1>

              <div className="categories-hero-meta">
                <div className="categories-red-line" />
                <span>
                  CREATE AND MANAGE
                  <br />
                  STORE COLLECTIONS
                </span>
              </div>
            </div>
          </section>

          {/* MANAGER */}
          <section className="category-manager">
            <div className="category-manager-heading">
              <span>01</span>
              ADD COLLECTION
            </div>

            <form
              className="category-add-form"
              onSubmit={addCategory}
            >
              <div className="category-input-wrap">
                <span>CATEGORY NAME</span>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="ENTER CATEGORY NAME"
                />
              </div>

              <div className="category-price-inputs">
                <div className="category-input-wrap">
                  <span>MIN PRICE</span>

                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(e.target.value)
                    }
                    placeholder="MIN"
                  />
                </div>

                <div className="category-input-wrap">
                  <span>MAX PRICE</span>

                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(e.target.value)
                    }
                    placeholder="MAX"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={adding}
              >
                {adding ? "ADDING..." : "ADD CATEGORY"}
                <span>↗</span>
              </button>
            </form>

            {message && (
              <div className="category-message">
                {message}
              </div>
            )}
          </section>

          {/* LIST */}
          <section className="category-list-section">
            <div className="category-list-heading">
              <span>02</span>
              CURRENT COLLECTIONS
            </div>

            <div className="category-list">
              {loading ? (
                <div className="category-empty">
                  LOADING COLLECTIONS...
                </div>
              ) : categories.length === 0 ? (
                <div className="category-empty">
                  NO COLLECTIONS FOUND.
                </div>
              ) : (
                categories.map((category, index) => (
                  <div
                    className="category-row"
                    key={category.id}
                  >
                    <div className="category-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    {editingId === category.id ? (
                      <div className="category-edit-area">
                        <input
                          value={editingName}
                          onChange={(e) =>
                            setEditingName(e.target.value)
                          }
                          autoFocus
                        />

                        <div className="category-edit-price">
                          <div>
                            <span>MIN PRICE</span>

                            <input
                              type="number"
                              min="0"
                              value={editingMinPrice}
                              onChange={(e) =>
                                setEditingMinPrice(
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div>
                            <span>MAX PRICE</span>

                            <input
                              type="number"
                              min="0"
                              value={editingMaxPrice}
                              onChange={(e) =>
                                setEditingMaxPrice(
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="category-edit-actions">
                          <button
                            onClick={() =>
                              saveEdit(category.id)
                            }
                          >
                            SAVE
                          </button>

                          <button
                            onClick={cancelEditing}
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="category-info">
                          <strong>
                            {category.name}
                          </strong>

                          <span>
                            /{category.slug}
                          </span>

                          <small>
                            ৳{Number(
                              category.min_price ?? 0
                            ).toLocaleString()}{" "}
                            —{" "}
                            ৳{Number(
                              category.max_price ?? 0
                            ).toLocaleString()}
                          </small>
                        </div>

                        <div className="category-actions">
                          <button
                            onClick={() =>
                              startEditing(category)
                            }
                          >
                            EDIT
                          </button>

                          <button
                            onClick={() =>
                              deleteCategory(category.id)
                            }
                          >
                            DELETE
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <footer className="categories-footer">
            <span>© 2026 STOKED BD</span>
            <span>CATEGORY MANAGEMENT SYSTEM</span>
            <span>EST. 2026</span>
          </footer>
        </div>
      </section>
    </main>
  );
}