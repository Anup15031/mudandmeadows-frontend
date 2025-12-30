import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import Header from "@/components/layout/Header";

const fallbackImage =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80";

const DiningPage = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiClient
      .getDining()
      .then((items) => setMenuItems(Array.isArray(items) ? items : []))
      .catch(() => setError("Could not load dining menu."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Header />
      <div style={{ height: 80 }} />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#b08643", marginBottom: 32, textAlign: "center" }}>
          Dining Menu
        </h1>
        {loading ? (
          <div style={{ textAlign: "center", margin: "60px 0" }}>
            <svg width="48" height="48" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="#b08643" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" from="0 25 25" to="360 25 25"/>
              </circle>
            </svg>
            <div style={{ marginTop: 16, color: "#b08643", fontWeight: 600 }}>Loading menu...</div>
          </div>
        ) : error ? (
          <div style={{ color: "red", textAlign: "center", fontWeight: 600, fontSize: 18 }}>{error}</div>
        ) : menuItems.length === 0 ? (
          <div style={{ textAlign: "center", color: "#888", fontSize: 18 }}>No menu items found.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 32,
              marginTop: 16,
            }}
          >
            {menuItems.map((item: any, idx: number) => {
              // Try to get an image from item.image, item.image_url, or item.images[0]
              let img =
                item.image_url ||
                item.image ||
                (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null) ||
                fallbackImage;
              return (
                <div
                  key={item.id || item._id || idx}
                  style={{
                    background: "#fff",
                    borderRadius: 18,
                    boxShadow: "0 2px 16px #0001",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    minHeight: 320,
                    border: "1.5px solid #f0e8d8",
                    transition: "box-shadow .2s, border .2s",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ width: "100%", height: 180, overflow: "hidden", background: "#f5f5f5" }}>
                    <img
                      src={img}
                      alt={item.name || item.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderTopLeftRadius: 18,
                        borderTopRightRadius: 18,
                        background: "#eee",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImage;
                      }}
                    />
                  </div>
                  <div style={{ padding: "22px 24px 20px 24px", width: "100%" }}>
                    <div style={{ fontWeight: 700, fontSize: 22, color: "#2d2a26", marginBottom: 8 }}>
                      {item.name || item.title}
                    </div>
                    {item.description && (
                      <div style={{ fontSize: 15, color: "#6b7a5c", marginBottom: 14, minHeight: 36 }}>
                        {item.description}
                      </div>
                    )}
                    <div style={{ marginTop: 8, fontWeight: 700, fontSize: 20, color: "#b08643" }}>
                      ₹{item.price}
                    </div>
                    {item.category && (
                      <div style={{ marginTop: 8, fontSize: 13, color: "#888", fontStyle: "italic" }}>
                        {item.category}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiningPage;
