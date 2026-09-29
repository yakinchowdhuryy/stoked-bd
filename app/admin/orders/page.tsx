"use client";

import "./orders.css";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  size: string | null;
  quantity: number;
  price: number;
};

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<
    Record<string, OrderItem[]>
  >({});

  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    setLoading(true);

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

    await loadOrders();

    setLoading(false);
  }

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "ORDERS LOAD ERROR:",
        error
      );
      return;
    }

    const loadedOrders = data || [];

    setOrders(loadedOrders);

    if (loadedOrders.length === 0) {
      setOrderItems({});
      return;
    }

    const orderIds = loadedOrders.map(
      (order) => order.id
    );

    const {
      data: items,
      error: itemsError,
    } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    if (itemsError) {
      console.error(
        "ORDER ITEMS LOAD ERROR:",
        itemsError
      );
      return;
    }

    const groupedItems: Record<
      string,
      OrderItem[]
    > = {};

    (items || []).forEach((item) => {
      if (!groupedItems[item.order_id]) {
        groupedItems[item.order_id] = [];
      }

      groupedItems[item.order_id].push(item);
    });

    setOrderItems(groupedItems);
  }

  async function updateStatus(
    orderId: string,
    newStatus: string
  ) {
    setUpdatingId(orderId);

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
      })
      .eq("id", orderId);

    if (error) {
      console.error(
        "ORDER STATUS UPDATE ERROR:",
        error
      );

      alert(
        `Could not update order status.\n\n${error.message}`
      );

      setUpdatingId(null);
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
            }
          : order
      )
    );

    if (selectedOrder?.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus,
      });
    }

    setUpdatingId(null);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatPrice(price: number) {
    return `৳${Number(price).toLocaleString(
      "en-BD"
    )}`;
  }

  function getStatusClass(status: string) {
    return status
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  const pendingCount = orders.filter(
    (order) =>
      order.status.toUpperCase() === "PENDING"
  ).length;

  const confirmedCount = orders.filter(
    (order) =>
      order.status.toUpperCase() === "CONFIRMED"
  ).length;

  const deliveredCount = orders.filter(
    (order) =>
      order.status.toUpperCase() === "DELIVERED"
  ).length;

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <span>LOADING ORDERS...</span>
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
              className="admin-nav-item"
            >
              <span className="admin-nav-number">
                01
              </span>

              <span>DASHBOARD</span>
            </Link>

            <Link
              href="/admin/categories"
              className="admin-nav-item"
            >
              <span className="admin-nav-number">
                02
              </span>

              <span>CATEGORIES</span>
            </Link>

            <Link
              href="/admin/products"
              className="admin-nav-item"
            >
              <span className="admin-nav-number">
                03
              </span>

              <span>PRODUCTS</span>
            </Link>

            <Link
              href="/admin/orders"
              className="admin-nav-item active"
            >
              <span className="admin-nav-number">
                04
              </span>

              <span>ORDERS</span>
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

          {/* TOP LINE */}
          <div className="admin-topline">
            <span>
              STOKED BD / ADMIN
            </span>

            <span>
              ORDERS // 004
            </span>
          </div>

          {/* HERO */}
          <section className="admin-hero orders-hero">

            <div className="admin-kicker">
              ORDER MANAGEMENT SYSTEM
            </div>

            <div className="orders-hero-row">

              <div className="orders-title-wrap">
                <h1>ORDERS</h1>

                <p>
                  VIEW AND MANAGE ALL CUSTOMER
                  ORDERS FROM ONE PLACE.
                </p>
              </div>

              <div className="orders-hero-meta">
                <div className="admin-red-line" />

                <span>
                  LIVE ORDER
                  <br />
                  CONTROL
                </span>
              </div>

            </div>
          </section>

          {/* SUMMARY */}
          <section className="orders-summary">

            <div className="orders-summary-card">
              <span>TOTAL ORDERS</span>

              <strong>
                {orders.length}
              </strong>
            </div>

            <div className="orders-summary-card">
              <span>PENDING</span>

              <strong>
                {pendingCount}
              </strong>
            </div>

            <div className="orders-summary-card">
              <span>CONFIRMED</span>

              <strong>
                {confirmedCount}
              </strong>
            </div>

            <div className="orders-summary-card">
              <span>DELIVERED</span>

              <strong>
                {deliveredCount}
              </strong>
            </div>

          </section>

          {/* ORDERS SECTION */}
          <section className="orders-section">

            <div className="orders-heading">
              <span>01</span>
              CUSTOMER ORDERS
            </div>

            {orders.length === 0 ? (
              <div className="orders-empty">
                <span>
                  NO ORDERS FOUND
                </span>

                <small>
                  CUSTOMER ORDERS WILL APPEAR HERE
                </small>
              </div>
            ) : (
              <div className="orders-list">

                {orders.map((order) => {
                  const items =
                    orderItems[order.id] || [];

                  return (
                    <article
                      key={order.id}
                      className="order-card"
                    >

                      {/* CARD TOP */}
                      <div className="order-card-top">

                        <div>
                          <span className="order-label">
                            ORDER ID
                          </span>

                          <strong>
                            #{order.id.slice(0, 8)}
                          </strong>
                        </div>

                        <span
                          className={`order-status ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status.toUpperCase()}
                        </span>

                      </div>

                      {/* CARD MAIN */}
                      <div className="order-main">

                        {/* CUSTOMER */}
                        <div className="order-customer">

                          <span className="order-label">
                            CUSTOMER
                          </span>

                          <h2>
                            {order.customer_name}
                          </h2>

                          <p>
                            {order.customer_phone}
                          </p>

                          {order.customer_email && (
                            <p>
                              {order.customer_email}
                            </p>
                          )}

                        </div>

                        {/* ITEMS */}
                        <div className="order-products">

                          <span className="order-label">
                            ITEMS
                          </span>

                          {items.length === 0 ? (
                            <p>
                              No items found
                            </p>
                          ) : (
                            items.map((item) => (
                              <div
                                key={item.id}
                                className="order-product-row"
                              >

                                <span>
                                  {item.product_name}

                                  {item.size
                                    ? ` / ${item.size}`
                                    : ""}
                                </span>

                                <span>
                                  × {item.quantity}
                                </span>

                                <strong>
                                  {formatPrice(
                                    Number(
                                      item.price
                                    ) *
                                      Number(
                                        item.quantity
                                      )
                                  )}
                                </strong>

                              </div>
                            ))
                          )}

                        </div>

                        {/* TOTAL */}
                        <div className="order-total">

                          <span className="order-label">
                            TOTAL
                          </span>

                          <strong>
                            {formatPrice(
                              Number(
                                order.total_amount
                              )
                            )}
                          </strong>

                          <small>
                            {order.payment_method}
                          </small>

                        </div>

                      </div>

                      {/* CARD BOTTOM */}
                      <div className="order-card-bottom">

                        {/* ADDRESS */}
                        <div className="order-address">

                          <span className="order-label">
                            SHIPPING ADDRESS
                          </span>

                          <p>
                            {order.shipping_address}
                          </p>

                        </div>

                        {/* DATE */}
                        <div className="order-date">

                          <span className="order-label">
                            ORDERED
                          </span>

                          <p>
                            {formatDate(
                              order.created_at
                            )}
                          </p>

                        </div>

                        {/* ACTIONS */}
                        <div className="order-actions">

                          <select
                            value={order.status.toUpperCase()}
                            disabled={
                              updatingId ===
                              order.id
                            }
                            onChange={(event) =>
                              updateStatus(
                                order.id,
                                event.target.value
                              )
                            }
                          >
                            <option value="PENDING">
                              PENDING
                            </option>

                            <option value="CONFIRMED">
                              CONFIRMED
                            </option>

                            <option value="SHIPPED">
                              SHIPPED
                            </option>

                            <option value="DELIVERED">
                              DELIVERED
                            </option>

                            <option value="CANCELLED">
                              CANCELLED
                            </option>
                          </select>

                          <button
                            className="order-view-button"
                            onClick={() =>
                              setSelectedOrder(
                                order
                              )
                            }
                          >
                            VIEW DETAILS ↗
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

          </section>

          {/* FOOTER */}
          <footer className="admin-footer">

            <span>
              © 2026 STOKED BD
            </span>

            <span>
              ORDER MANAGEMENT SYSTEM
            </span>

            <span>
              EST. 2026
            </span>

          </footer>

        </div>
      </section>

      {/* MODAL */}
      {selectedOrder && (
        <div
          className="order-modal-backdrop"
          onClick={() =>
            setSelectedOrder(null)
          }
        >

          <div
            className="order-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}
            <div className="order-modal-header">

              <div>

                <span className="order-label">
                  ORDER DETAILS
                </span>

                <h2>
                  #{selectedOrder.id.slice(0, 8)}
                </h2>

              </div>

              <button
                className="order-modal-close"
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                ×
              </button>

            </div>

            {/* MODAL CONTENT */}
            <div className="order-modal-content">

              {/* CUSTOMER */}
              <div className="modal-info-block">

                <span>
                  CUSTOMER
                </span>

                <strong>
                  {selectedOrder.customer_name}
                </strong>

                <p>
                  {selectedOrder.customer_phone}
                </p>

                {selectedOrder.customer_email && (
                  <p>
                    {selectedOrder.customer_email}
                  </p>
                )}

              </div>

              {/* SHIPPING */}
              <div className="modal-info-block">

                <span>
                  SHIPPING ADDRESS
                </span>

                <p>
                  {selectedOrder.shipping_address}
                </p>

              </div>

              {/* PAYMENT */}
              <div className="modal-info-block">

                <span>
                  PAYMENT
                </span>

                <strong>
                  {selectedOrder.payment_method}
                </strong>

              </div>

              {/* DATE */}
              <div className="modal-info-block">

                <span>
                  ORDERED
                </span>

                <p>
                  {formatDate(
                    selectedOrder.created_at
                  )}
                </p>

              </div>

              {/* ITEMS */}
              <div className="modal-items">

                <span>
                  ORDER ITEMS
                </span>

                {(
                  orderItems[
                    selectedOrder.id
                  ] || []
                ).map((item) => (
                  <div
                    key={item.id}
                    className="modal-item"
                  >

                    <div>
                      <strong>
                        {item.product_name}
                      </strong>

                      {item.size && (
                        <small>
                          SIZE: {item.size}
                        </small>
                      )}
                    </div>

                    <span>
                      × {item.quantity}
                    </span>

                    <strong>
                      {formatPrice(
                        Number(item.price) *
                          Number(item.quantity)
                      )}
                    </strong>

                  </div>
                ))}

              </div>

              {/* TOTAL */}
              <div className="modal-total">

                <span>
                  TOTAL
                </span>

                <strong>
                  {formatPrice(
                    Number(
                      selectedOrder.total_amount
                    )
                  )}
                </strong>

              </div>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}