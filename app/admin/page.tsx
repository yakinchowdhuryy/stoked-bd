"use client";

import "./admin.css";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type NewOrder = {
  id: string;
  customer_name: string;
  customer_phone?: string | null;
  total_amount: number;
  status: string;
  created_at?: string;
};

export default function AdminDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    orders: 0,
    pending: 0,
  });

  const [newOrder, setNewOrder] =
    useState<NewOrder | null>(null);

  useEffect(() => {
    let orderChannel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    async function checkAuthAndLoad() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/admin/login");
        return;
      }

      const { data: admin, error: adminError } =
        await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", session.user.id)
          .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      await loadStats();

      setLoading(false);

      /*
       * REMOVE ANY OLD REALTIME CHANNEL
       * BEFORE CREATING A NEW ONE
       */

      const oldChannels = supabase
        .getChannels()
        .filter(
          (channel) =>
            channel.topic ===
            "realtime:admin-orders-realtime"
        );

      for (const channel of oldChannels) {
        await supabase.removeChannel(channel);
      }

      /*
       * REALTIME ORDER LISTENER
       */

      orderChannel = supabase
        .channel("admin-orders-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
          },
          (payload) => {
            console.log(
              "🔥 NEW ORDER RECEIVED:",
              payload
            );

            const order =
              payload.new as NewOrder;

            /*
             * SHOW NOTIFICATION
             */

            setNewOrder(order);

            /*
             * UPDATE TOTAL ORDERS
             */

            setStats((currentStats) => ({
              ...currentStats,

              orders:
                currentStats.orders + 1,

              /*
               * IF NEW ORDER IS PENDING
               * INCREASE PENDING COUNT
               */

              pending:
                String(order.status).toLowerCase() ===
                "pending"
                  ? currentStats.pending + 1
                  : currentStats.pending,
            }));

            /*
             * AUTO CLOSE NOTIFICATION
             * AFTER 8 SECONDS
             */

            setTimeout(() => {
              setNewOrder((current) => {
                if (
                  current?.id === order.id
                ) {
                  return null;
                }

                return current;
              });
            }, 8000);
          }
        )
        .subscribe((status) => {
          console.log(
            "🔥 ORDER REALTIME STATUS:",
            status
          );
        });
    }

    checkAuthAndLoad();

    /*
     * CLEANUP
     */

    return () => {
      if (orderChannel) {
        supabase.removeChannel(
          orderChannel
        );

        orderChannel = null;
      }
    };
  }, [router]);

  async function loadStats() {
    const [
      { count: categoryCount },
      { count: productCount },
      { count: orderCount },
      { count: pendingCount },
    ] = await Promise.all([
      supabase
        .from("categories")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("products")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("orders")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("orders")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("status", "pending"),
    ]);

    setStats({
      categories: categoryCount ?? 0,
      products: productCount ?? 0,
      orders: orderCount ?? 0,
      pending: pendingCount ?? 0,
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  function formatPrice(price: number) {
    return `৳${Number(price).toLocaleString("en-BD")}`;
  }

  function closeNotification() {
    setNewOrder(null);
  }

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <span>
            LOADING SYSTEM...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">

      {/* BACKGROUND */}

      <div className="admin-grid-bg" />
      <div className="admin-red-orb" />
      <div className="admin-noise" />

      {/* =================================
          NEW ORDER NOTIFICATION
          ================================= */}

      {newOrder && (
        <div className="admin-order-notification">

          <div className="admin-order-notification-top">

            <div className="admin-order-notification-icon">
              !
            </div>

            <div className="admin-order-notification-title">
              <span>
                LIVE ORDER ALERT
              </span>

              <strong>
                NEW ORDER RECEIVED
              </strong>
            </div>

            <button
              className="admin-order-notification-close"
              onClick={closeNotification}
            >
              ×
            </button>

          </div>

          <div className="admin-order-notification-body">

            <div className="admin-order-notification-info">
              <span>
                CUSTOMER
              </span>

              <strong>
                {newOrder.customer_name}
              </strong>
            </div>

            <div className="admin-order-notification-info">
              <span>
                ORDER
              </span>

              <strong>
                #{newOrder.id.slice(0, 8)}
              </strong>
            </div>

            <div className="admin-order-notification-info">
              <span>
                TOTAL
              </span>

              <strong>
                {formatPrice(
                  Number(
                    newOrder.total_amount
                  )
                )}
              </strong>
            </div>

          </div>

          <div className="admin-order-notification-bottom">

            <span>
              ORDER JUST PLACED
            </span>

            <button
              onClick={() =>
                router.push(
                  "/admin/orders"
                )
              }
            >
              VIEW ORDER ↗
            </button>

          </div>

        </div>
      )}

      {/* SIDEBAR */}

      <aside className="admin-sidebar">

        <div>

          <div className="admin-brand">
            STOKED
            <span>BD</span>
          </div>

          <div className="admin-sidebar-label">
            CONTROL PANEL
          </div>

          <nav className="admin-nav">

            <Link
              href="/admin"
              className="admin-nav-item active"
            >
              <span className="admin-nav-number">
                01
              </span>

              <span>
                DASHBOARD
              </span>
            </Link>

            <Link
              href="/admin/categories"
              className="admin-nav-item"
            >
              <span className="admin-nav-number">
                02
              </span>

              <span>
                CATEGORIES
              </span>
            </Link>

            <Link
              href="/admin/products"
              className="admin-nav-item"
            >
              <span className="admin-nav-number">
                03
              </span>

              <span>
                PRODUCTS
              </span>
            </Link>

            <Link
              href="/admin/orders"
              className="admin-nav-item"
            >
              <span className="admin-nav-number">
                04
              </span>

              <span>
                ORDERS
              </span>
            </Link>

          </nav>

        </div>

        <div className="admin-sidebar-bottom">

          <div className="admin-status">

            <span className="admin-status-dot" />

            SYSTEM ONLINE

          </div>

          <button
            className="admin-logout"
            onClick={logout}
          >
            LOG OUT
          </button>

        </div>

      </aside>

      {/* MOBILE HEADER */}

      <header className="admin-mobile-header">

        <Link
          href="/admin"
          className="admin-mobile-brand"
        >
          STOKED <span>BD</span>
        </Link>

        <button
          className="admin-mobile-logout"
          onClick={logout}
        >
          EXIT
        </button>

      </header>

      {/* MAIN */}

      <section className="admin-main">

        <div className="admin-wrapper">

          <div className="admin-topline">

            <span>
              STOKED BD / ADMIN
            </span>

            <span>
              CONTROL // 001
            </span>

          </div>

          {/* HERO */}

          <section className="admin-hero">

            <div className="admin-kicker">
              ADMINISTRATION SYSTEM
            </div>

            <div className="admin-hero-bottom">

              <h1>
                DASH
                <br />
                BOARD
              </h1>

              <div className="admin-hero-meta">

                <div className="admin-red-line" />

                <span>
                  MANAGE YOUR STORE
                  <br />
                  FROM ONE PLACE
                </span>

              </div>

            </div>

          </section>

          {/* STATS */}

          <section className="admin-stats">

            <div className="admin-stat-card">

              <span className="admin-stat-label">
                CATEGORIES
              </span>

              <strong>
                {stats.categories}
              </strong>

              <span className="admin-stat-code">
                CAT / 001
              </span>

            </div>

            <div className="admin-stat-card">

              <span className="admin-stat-label">
                PRODUCTS
              </span>

              <strong>
                {stats.products}
              </strong>

              <span className="admin-stat-code">
                PROD / 002
              </span>

            </div>

            <div className="admin-stat-card">

              <span className="admin-stat-label">
                TOTAL ORDERS
              </span>

              <strong>
                {stats.orders}
              </strong>

              <span className="admin-stat-code">
                ORD / 003
              </span>

            </div>

            <div className="admin-stat-card">

              <span className="admin-stat-label">
                PENDING
              </span>

              <strong>
                {stats.pending}
              </strong>

              <span className="admin-stat-code">
                STATUS / 004
              </span>

            </div>

          </section>

          {/* QUICK ACCESS */}

          <section className="admin-section">

            <div className="admin-section-heading">
              <span>01</span>
              QUICK ACCESS
            </div>

            <div className="admin-action-grid">

              <Link
                href="/admin/categories"
                className="admin-action-card"
              >
                <div>

                  <span className="admin-action-number">
                    01
                  </span>

                  <h2>
                    MANAGE
                    <br />
                    CATEGORIES
                  </h2>

                </div>

                <span className="admin-action-arrow">
                  ↗
                </span>

              </Link>

              <Link
                href="/admin/products"
                className="admin-action-card"
              >
                <div>

                  <span className="admin-action-number">
                    02
                  </span>

                  <h2>
                    MANAGE
                    <br />
                    PRODUCTS
                  </h2>

                </div>

                <span className="admin-action-arrow">
                  ↗
                </span>

              </Link>

              <Link
                href="/admin/orders"
                className="admin-action-card"
              >
                <div>

                  <span className="admin-action-number">
                    03
                  </span>

                  <h2>
                    VIEW
                    <br />
                    ORDERS
                  </h2>

                </div>

                <span className="admin-action-arrow">
                  ↗
                </span>

              </Link>

            </div>

          </section>

          {/* SYSTEM STATUS */}

          <section className="admin-section">

            <div className="admin-section-heading">
              <span>02</span>
              SYSTEM STATUS
            </div>

            <div className="admin-status-grid">

              <div className="admin-status-card">

                <div className="admin-status-card-top">

                  <span>
                    DATABASE
                  </span>

                  <span className="online">
                    ONLINE
                  </span>

                </div>

                <div className="admin-status-bar">
                  <span />
                </div>

                <small>
                  SUPABASE DATABASE CONNECTION
                </small>

              </div>

              <div className="admin-status-card">

                <div className="admin-status-card-top">

                  <span>
                    STORE
                  </span>

                  <span className="online">
                    ACTIVE
                  </span>

                </div>

                <div className="admin-status-bar">
                  <span />
                </div>

                <small>
                  STOKED BD STORE SYSTEM
                </small>

              </div>

            </div>

          </section>

          {/* FOOTER */}

          <footer className="admin-footer">

            <span>
              © 2026 STOKED BD
            </span>

            <span>
              ADMIN CONTROL SYSTEM
            </span>

            <span>
              EST. 2026
            </span>

          </footer>

        </div>

      </section>

    </main>
  );
}