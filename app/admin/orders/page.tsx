"use client";

import "./orders.css";
import "../products/products.css";

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

  /* DELETE ORDER STATE */
  const [deleteTarget, setDeleteTarget] =
    useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

  /* =========================================================
     DELETE ORDER
  ========================================================= */

  function askDeleteOrder(order: Order) {
    setDeleteError("");
    setDeleteTarget(order);
  }

  function cancelDeleteOrder() {
    if (deleting) return;

    setDeleteTarget(null);
    setDeleteError("");
  }

  async function confirmDeleteOrder() {
    if (!deleteTarget || deleting) return;

    const orderId = deleteTarget.id;

    setDeleting(true);
    setDeleteError("");

    try {
      /*
       * 1. Delete the order items first
       *    (works even if the foreign key has no cascade)
       */
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId);

      if (itemsError) {
        console.error(
          "DELETE ORDER ITEMS ERROR:",
          itemsError
        );

        setDeleteError(
          `Could not delete order items. ${itemsError.message}`
        );

        setDeleting(false);
        return;
      }

      /*
       * 2. Delete the order itself.
       *    .select() lets us detect if RLS silently
       *    blocked the delete (0 rows returned).
       */
      const { data: deletedRows, error: orderError } =
        await supabase
          .from("orders")
          .delete()
          .eq("id", orderId)
          .select("id");

      if (orderError) {
        console.error(
          "DELETE ORDER ERROR:",
          orderError
        );

        setDeleteError(
          `Could not delete order. ${orderError.message}`
        );

        setDeleting(false);
        return;
      }

      if (!deletedRows || deletedRows.length === 0) {
        setDeleteError(
          "Delete was blocked. Please check that admins have delete permission on the orders table."
        );

        setDeleting(false);
        return;
      }

      /*
       * 3. Update the UI
       */
      setOrders((currentOrders) =>
        currentOrders.filter(
          (order) => order.id !== orderId
        )
      );

      setOrderItems((currentItems) => {
        const next = { ...currentItems };
        delete next[orderId];
        return next;
      });

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }

      setDeleteTarget(null);
      setDeleting(false);
    } catch (err) {
      console.error("DELETE ORDER ERROR:", err);

      setDeleteError(
        "Something went wrong. Please try again."
      );

      setDeleting(false);
    }
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
      <main className="products-page">
        <div className="products-grid-bg" />
        <div className="products-red-orb" />

        <section className="products-main">
          <div className="products-wrapper">
            <div className="inventory-empty">
              LOADING ORDERS...
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="products-page">
      <div className="products-grid-bg" />

      <div className="products-red-orb" />

      {/* SIDEBAR */}

      <aside className="products-sidebar">
        <div>
          <Link href="/admin" className="products-brand">
            STOKED <span>BD</span>
          </Link>

          <div className="products-sidebar-label">CONTROL PANEL</div>

          <nav className="products-nav">
            <Link href="/admin" className="products-nav-item">
              <span>01</span>
              DASHBOARD
            </Link>

            <Link href="/admin/categories" className="products-nav-item">
              <span>02</span>
              CATEGORIES
            </Link>

            <Link href="/admin/products" className="products-nav-item">
              <span>03</span>
              PRODUCTS
            </Link>

            <Link href="/admin/orders" className="products-nav-item active">
              <span>04</span>
              ORDERS
            </Link>
          </nav>
        </div>

        <div className="products-sidebar-bottom">
          <div className="products-system-status">
            <span />
            SYSTEM ONLINE
          </div>

          <Link
            href="/admin/login"
            className="products-logout"
            onClick={(event) => {
              event.preventDefault();
              logout();
            }}
          >
            EXIT PANEL
          </Link>
        </div>
      </aside>

      {/* MOBILE HEADER */}

      <header className="products-mobile-header">
        <Link href="/admin" className="products-mobile-brand">
          STOKED <span>BD</span>
        </Link>

        <Link
          href="/admin/login"
          className="products-mobile-exit"
          onClick={(event) => {
            event.preventDefault();
            logout();
          }}
        >
          EXIT
        </Link>
      </header>

      {/* MAIN */}

      <section className="products-main">
        <div className="products-wrapper">
          <div className="products-topline">
            <span>STOKED BD / ADMIN</span>

            <span>CONTROL // 004</span>
          </div>

          {/* HERO */}

          <section className="products-hero">
            <div className="products-kicker">ORDER MANAGEMENT SYSTEM</div>

            <div className="products-hero-bottom">
              <h1>
                ORD
                <br />
                ERS
              </h1>

              <div className="products-hero-meta">
                <div className="products-red-line" />

                <span>
                  VIEW AND MANAGE
                  <br />
                  CUSTOMER ORDERS
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
          <section className="inventory-section">

            <div className="product-section-heading">
              <span>01</span>
              CUSTOMER ORDERS
            </div>

            {orders.length === 0 ? (
              <div className="inventory-empty">
                NO ORDERS FOUND. CUSTOMER ORDERS WILL APPEAR HERE.
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

                          <button
                            type="button"
                            className="od-delete-button"
                            onClick={() =>
                              askDeleteOrder(order)
                            }
                          >
                            DELETE ORDER ×
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

          <footer className="products-footer">
            <span>© 2026 STOKED BD</span>

            <span>ORDER MANAGEMENT SYSTEM</span>

            <span>EST. 2026</span>
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

              {/* DELETE (inside details modal) */}
              <button
                type="button"
                className="od-delete-button od-delete-wide"
                onClick={() =>
                  askDeleteOrder(selectedOrder)
                }
              >
                DELETE THIS ORDER ×
              </button>

            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteTarget && (
        <div
          className="od-confirm-backdrop"
          onClick={cancelDeleteOrder}
        >
          <div
            className="od-confirm"
            onClick={(event) =>
              event.stopPropagation()
            }
            role="dialog"
            aria-modal="true"
          >
            <span className="od-confirm-kicker">
              STOKED BD / ADMIN
            </span>

            <div className="od-confirm-icon">!</div>

            <h3>
              DELETE THIS
              <br />
              <span>ORDER?</span>
            </h3>

            <div className="od-confirm-line" />

            <p>
              Order{" "}
              <strong>
                #{deleteTarget.id.slice(0, 8)}
              </strong>{" "}
              from{" "}
              <strong>
                {deleteTarget.customer_name}
              </strong>{" "}
              and all its items will be permanently
              removed. This cannot be undone.
            </p>

            {deleteError && (
              <div className="od-confirm-error">
                {deleteError}
              </div>
            )}

            <div className="od-confirm-actions">
              <button
                type="button"
                className="od-confirm-cancel"
                onClick={cancelDeleteOrder}
                disabled={deleting}
              >
                CANCEL
              </button>

              <button
                type="button"
                className="od-confirm-delete"
                onClick={confirmDeleteOrder}
                disabled={deleting}
              >
                {deleting
                  ? "DELETING..."
                  : "YES, DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .od-delete-button {
          min-height: 40px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 60, 60, 0.35);
          background: rgba(150, 10, 20, 0.1);
          color: #ff6b6b;
          font-family: inherit;
          font-size: 10px;
          letter-spacing: 0.14em;
          cursor: pointer;
          white-space: nowrap;
          transition:
            background 0.25s ease,
            border-color 0.25s ease,
            color 0.25s ease,
            transform 0.25s ease;
        }

        .od-delete-button:hover {
          background: #a30f1c;
          border-color: #d3202f;
          color: #fff;
          transform: translateY(-1px);
        }

        .od-delete-wide {
          width: 100%;
          margin-top: 18px;
        }

        .od-confirm-backdrop {
          position: fixed;
          inset: 0;
          z-index: 2147483000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          animation: odFade 0.25s ease both;
        }

        .od-confirm {
          position: relative;
          width: min(460px, 100%);
          padding: 44px 34px 30px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(
            145deg,
            rgba(38, 5, 5, 0.98),
            rgba(7, 2, 2, 0.99)
          );
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.7);
          animation: odPop 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .od-confirm::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            #ff2020,
            rgba(255, 32, 32, 0.15),
            transparent
          );
        }

        .od-confirm-kicker {
          display: block;
          color: rgba(255, 50, 50, 0.65);
          font-size: 9px;
          letter-spacing: 0.22em;
        }

        .od-confirm-icon {
          width: 52px;
          height: 52px;
          margin: 22px auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 45, 45, 0.6);
          border-radius: 50%;
          color: #ff3030;
          font-size: 22px;
          box-shadow: 0 0 30px rgba(255, 0, 0, 0.14);
        }

        .od-confirm h3 {
          margin: 0;
          color: #f5f5f3;
          font-size: clamp(28px, 6vw, 38px);
          line-height: 0.95;
          font-weight: 600;
          letter-spacing: -0.04em;
        }

        .od-confirm h3 span {
          color: transparent;
          -webkit-text-stroke: 1px rgba(245, 245, 243, 0.5);
        }

        .od-confirm-line {
          width: 44px;
          height: 1px;
          margin: 20px auto;
          background: linear-gradient(90deg, #ff2020, transparent);
        }

        .od-confirm p {
          margin: 0 auto;
          max-width: 340px;
          color: rgba(245, 245, 243, 0.55);
          font-size: 12px;
          line-height: 1.8;
          letter-spacing: 0.03em;
        }

        .od-confirm p strong {
          color: #f5f5f3;
          font-weight: 600;
        }

        .od-confirm-error {
          margin-top: 16px;
          padding: 10px 12px;
          border: 1px solid rgba(180, 20, 35, 0.4);
          background: rgba(130, 10, 20, 0.12);
          color: #e58a92;
          font-size: 11px;
          line-height: 1.5;
          text-align: left;
        }

        .od-confirm-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 26px;
        }

        .od-confirm-cancel,
        .od-confirm-delete {
          min-height: 50px;
          font-family: inherit;
          font-size: 10px;
          letter-spacing: 0.16em;
          cursor: pointer;
          transition:
            background 0.25s ease,
            border-color 0.25s ease,
            transform 0.25s ease,
            opacity 0.25s ease;
        }

        .od-confirm-cancel {
          color: rgba(245, 245, 243, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.03);
        }

        .od-confirm-cancel:hover:not(:disabled) {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.07);
        }

        .od-confirm-delete {
          color: #fff;
          border: 1px solid #c4202e;
          background: linear-gradient(100deg, #9d0000, #e31b1b);
        }

        .od-confirm-delete:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 30px rgba(255, 0, 0, 0.2);
        }

        .od-confirm-cancel:disabled,
        .od-confirm-delete:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        @keyframes odFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes odPop {
          from {
            opacity: 0;
            transform: translateY(22px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 520px) {
          .od-confirm {
            padding: 38px 20px 24px;
          }

          .od-confirm-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}