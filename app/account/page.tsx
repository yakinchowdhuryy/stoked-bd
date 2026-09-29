"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
};

export default function AccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const loadAccount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // User is NOT logged in
      if (!user) {
        setUser(null);
        setLoading(false);
        setOrdersLoading(false);
        return;
      }

      // User IS logged in
      setUser(user);
      setOrdersLoading(true);

      const { data: orderData, error } = await supabase
        .from("orders")
        .select(
          "id, customer_name, customer_phone, shipping_address, total_amount, payment_method, status, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (!error && orderData) {
        setOrders(orderData);
      } else if (error) {
        console.error("ACCOUNT ORDERS ERROR:", error);
      }

      setOrdersLoading(false);
      setLoading(false);
    };

    loadAccount();

    // Keep account page synced with login/logout changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setOrders([]);
      }

      if (
        event === "SIGNED_IN" &&
        session?.user
      ) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("LOGOUT ERROR:", error);
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  };

  // Loading screen
  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Space Grotesk", sans-serif',
          letterSpacing: ".15em",
          fontSize: "12px",
        }}
      >
        LOADING...
      </main>
    );
  }

  // =========================================================
  // LOGGED OUT ACCOUNT PAGE
  // =========================================================

  if (!user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          fontFamily: '"Space Grotesk", sans-serif',
          display: "flex",
          flexDirection: "column",
          padding: "28px 24px 60px",
        }}
      >
        {/* NAVBAR */}
        <header
          style={{
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "20px",
            borderBottom:
              "1px solid rgba(255,255,255,.08)",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              border: 0,
              background: "transparent",
              color: "#fff",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: ".12em",
              cursor: "pointer",
              fontFamily:
                '"Space Grotesk", sans-serif',
            }}
          >
            STOKED
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <button
              type="button"
              onClick={() => router.push("/shop")}
              style={{
                minHeight: "44px",
                padding: "0 10px",
                border: 0,
                background: "transparent",
                color: "rgba(255,255,255,.55)",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "12px",
                letterSpacing: ".15em",
                cursor: "pointer",
              }}
            >
              SHOP
            </button>

            <button
              type="button"
              onClick={() => router.push("/cart")}
              style={{
                minHeight: "44px",
                padding: "0 10px",
                border: 0,
                background: "transparent",
                color: "rgba(255,255,255,.55)",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "12px",
                letterSpacing: ".15em",
                cursor: "pointer",
              }}
            >
              BAG
            </button>
          </div>
        </header>

        {/* CENTER CONTENT */}
        <section
          style={{
            flex: 1,
            width: "100%",
            maxWidth: "520px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "70px 0",
          }}
        >
          <p
            style={{
              margin: "0 0 14px",
              color: "#96111e",
              fontSize: "10px",
              letterSpacing: ".28em",
              fontWeight: 700,
            }}
          >
            STOKED BD
          </p>

          <h1
            style={{
              margin: "0 0 18px",
              fontSize: "clamp(42px, 9vw, 78px)",
              lineHeight: ".92",
              letterSpacing: "-.055em",
              fontWeight: 700,
            }}
          >
            MY ACCOUNT
          </h1>

          <p
            style={{
              margin: "0 auto 38px",
              maxWidth: "390px",
              color: "rgba(255,255,255,.45)",
              fontSize: "13px",
              lineHeight: 1.7,
            }}
          >
            LOGIN TO YOUR ACCOUNT OR CREATE A
            NEW ACCOUNT TO VIEW YOUR ORDERS.
          </p>

          {/* LOGIN */}
          <button
            type="button"
            onClick={() => router.push("/login")}
            style={{
              width: "100%",
              maxWidth: "390px",
              height: "54px",
              border: "1px solid #96111e",
              background: "#96111e",
              color: "#fff",
              fontFamily:
                '"Space Grotesk", sans-serif',
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: ".2em",
              cursor: "pointer",
              transition: "all .2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "transparent";
              e.currentTarget.style.borderColor =
                "rgba(255,255,255,.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "#96111e";
              e.currentTarget.style.borderColor =
                "#96111e";
            }}
          >
            LOGIN
          </button>

          {/* SIGN UP */}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            style={{
              width: "100%",
              maxWidth: "390px",
              height: "54px",
              marginTop: "10px",
              border:
                "1px solid rgba(255,255,255,.18)",
              background: "transparent",
              color: "#fff",
              fontFamily:
                '"Space Grotesk", sans-serif',
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: ".2em",
              cursor: "pointer",
              transition: "all .2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor =
                "rgba(255,255,255,.5)";
              e.currentTarget.style.background =
                "rgba(255,255,255,.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor =
                "rgba(255,255,255,.18)";
              e.currentTarget.style.background =
                "transparent";
            }}
          >
            CREATE ACCOUNT
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              marginTop: "30px",
              border: 0,
              background: "transparent",
              color: "rgba(255,255,255,.35)",
              fontFamily:
                '"Space Grotesk", sans-serif',
              fontSize: "10px",
              letterSpacing: ".16em",
              cursor: "pointer",
            }}
          >
            ← BACK TO HOME
          </button>
        </section>
      </main>
    );
  }

  // =========================================================
  // LOGGED IN ACCOUNT PAGE
  // =========================================================

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "CUSTOMER";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        fontFamily: '"Space Grotesk", sans-serif',
        padding: "28px 24px 80px",
      }}
    >
      {/* NAVBAR */}
      <header
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto 70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom:
            "1px solid rgba(255,255,255,.08)",
          paddingBottom: "20px",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            border: 0,
            background: "transparent",
            color: "#fff",
            fontSize: "18px",
            fontWeight: 700,
            letterSpacing: ".12em",
            cursor: "pointer",
            fontFamily:
              '"Space Grotesk", sans-serif',
          }}
        >
          STOKED
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/shop")}
            style={{
              minHeight: "44px",
              padding: "0 10px",
              border: 0,
              background: "transparent",
              color: "rgba(255,255,255,.55)",
              fontFamily:
                '"Space Grotesk", sans-serif',
              fontSize: "12px",
              letterSpacing: ".15em",
              cursor: "pointer",
            }}
          >
            SHOP
          </button>

          <button
            type="button"
            onClick={() => router.push("/cart")}
            style={{
              minHeight: "44px",
              padding: "0 10px",
              border: 0,
              background: "transparent",
              color: "rgba(255,255,255,.55)",
              fontFamily:
                '"Space Grotesk", sans-serif',
              fontSize: "12px",
              letterSpacing: ".15em",
              cursor: "pointer",
            }}
          >
            BAG
          </button>
        </div>
      </header>

      <section
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* TITLE */}
        <div style={{ marginBottom: "45px" }}>
          <p
            style={{
              margin: "0 0 12px",
              color: "#96111e",
              fontSize: "11px",
              letterSpacing: ".25em",
              fontWeight: 700,
            }}
          >
            CUSTOMER AREA
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(38px, 7vw, 78px)",
              lineHeight: ".95",
              letterSpacing: "-.05em",
              fontWeight: 700,
            }}
          >
            MY ACCOUNT
          </h1>
        </div>

        {/* ACCOUNT INFO */}
        <div
          style={{
            border:
              "1px solid rgba(255,255,255,.09)",
            background:
              "rgba(255,255,255,.025)",
            padding: "28px",
            marginBottom: "55px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "30px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 8px",
                  color: "rgba(255,255,255,.4)",
                  fontSize: "10px",
                  letterSpacing: ".2em",
                }}
              >
                NAME
              </p>

              <h2
                style={{
                  margin: "0 0 22px",
                  fontSize: "24px",
                  fontWeight: 600,
                }}
              >
                {displayName}
              </h2>

              <p
                style={{
                  margin: "0 0 8px",
                  color: "rgba(255,255,255,.4)",
                  fontSize: "10px",
                  letterSpacing: ".2em",
                }}
              >
                EMAIL
              </p>

              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,.75)",
                  fontSize: "14px",
                  wordBreak: "break-word",
                }}
              >
                {user.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                border:
                  "1px solid rgba(150,17,30,.8)",
                background: "transparent",
                color: "#fff",
                padding: "13px 20px",
                fontFamily:
                  '"Space Grotesk", sans-serif',
                fontSize: "11px",
                letterSpacing: ".16em",
                cursor: loggingOut
                  ? "not-allowed"
                  : "pointer",
                opacity: loggingOut ? 0.5 : 1,
              }}
            >
              {loggingOut
                ? "LOGGING OUT..."
                : "LOG OUT"}
            </button>
          </div>
        </div>

        {/* ORDERS */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              gap: "20px",
              marginBottom: "22px",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 8px",
                  color: "#96111e",
                  fontSize: "10px",
                  letterSpacing: ".2em",
                  fontWeight: 700,
                }}
              >
                HISTORY
              </p>

              <h2
                style={{
                  margin: 0,
                  fontSize: "28px",
                  fontWeight: 600,
                }}
              >
                MY ORDERS
              </h2>
            </div>

            <span
              style={{
                color: "rgba(255,255,255,.4)",
                fontSize: "11px",
                letterSpacing: ".12em",
              }}
            >
              {orders.length} ORDER
              {orders.length !== 1 ? "S" : ""}
            </span>
          </div>

          {ordersLoading ? (
            <div
              style={{
                padding: "35px 0",
                color: "rgba(255,255,255,.45)",
                fontSize: "12px",
                letterSpacing: ".12em",
              }}
            >
              LOADING ORDERS...
            </div>
          ) : orders.length === 0 ? (
            <div
              style={{
                border:
                  "1px solid rgba(255,255,255,.08)",
                padding: "45px 25px",
                textAlign: "center",
                background:
                  "rgba(255,255,255,.02)",
              }}
            >
              <p
                style={{
                  margin: "0 0 18px",
                  color: "rgba(255,255,255,.5)",
                  fontSize: "13px",
                }}
              >
                YOU HAVEN'T PLACED ANY ORDERS YET.
              </p>

              <button
                type="button"
                onClick={() => router.push("/shop")}
                style={{
                  border:
                    "1px solid rgba(255,255,255,.2)",
                  background: "transparent",
                  color: "#fff",
                  padding: "13px 22px",
                  fontFamily:
                    '"Space Grotesk", sans-serif',
                  fontSize: "11px",
                  letterSpacing: ".15em",
                  cursor: "pointer",
                }}
              >
                START SHOPPING
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {orders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    border:
                      "1px solid rgba(255,255,255,.08)",
                    background:
                      "rgba(255,255,255,.025)",
                    padding: "22px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: "0 0 7px",
                          color:
                            "rgba(255,255,255,.38)",
                          fontSize: "9px",
                          letterSpacing: ".18em",
                        }}
                      >
                        ORDER ID
                      </p>

                      <p
                        style={{
                          margin: "0 0 15px",
                          fontSize: "12px",
                          wordBreak: "break-all",
                        }}
                      >
                        {order.id}
                      </p>

                      <p
                        style={{
                          margin: "0 0 7px",
                          color:
                            "rgba(255,255,255,.38)",
                          fontSize: "9px",
                          letterSpacing: ".18em",
                        }}
                      >
                        DATE
                      </p>

                      <p
                        style={{
                          margin: 0,
                          color:
                            "rgba(255,255,255,.7)",
                          fontSize: "12px",
                        }}
                      >
                        {new Date(
                          order.created_at
                        ).toLocaleDateString(
                          "en-BD",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 7px",
                          color:
                            "rgba(255,255,255,.38)",
                          fontSize: "9px",
                          letterSpacing: ".18em",
                        }}
                      >
                        TOTAL
                      </p>

                      <p
                        style={{
                          margin: "0 0 15px",
                          fontSize: "20px",
                          fontWeight: 600,
                        }}
                      >
                        ৳
                        {Number(
                          order.total_amount
                        ).toLocaleString()}
                      </p>

                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          border:
                            "1px solid rgba(150,17,30,.6)",
                          color: "#fff",
                          fontSize: "9px",
                          letterSpacing: ".14em",
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "18px",
                      borderTop:
                        "1px solid rgba(255,255,255,.06)",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 7px",
                        color:
                          "rgba(255,255,255,.38)",
                        fontSize: "9px",
                        letterSpacing: ".18em",
                      }}
                    >
                      DELIVERY ADDRESS
                    </p>

                    <p
                      style={{
                        margin: 0,
                        color:
                          "rgba(255,255,255,.65)",
                        fontSize: "12px",
                        lineHeight: 1.6,
                      }}
                    >
                      {order.shipping_address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 600px) {
          main {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          header {
            margin-bottom: 50px !important;
          }
        }
      `}</style>
    </main>
  );
}