import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import Header from "@/components/layout/Header";

const fallbackImage =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80";

const videoExtensions = [".mp4", ".webm", ".ogg"];

function isVideoItem(item: any): boolean {
  const url = item.url || item.imageUrl || "";
  return (
    (typeof item.type === "string" && item.type.toLowerCase() === "video") ||
    videoExtensions.some((ext) => url.toLowerCase().endsWith(ext)) ||
    (item.category && typeof item.category === "string" && item.category.toLowerCase().includes("video"))
  );
}

function getImageUrl(item: any): string {
  if (item.imageUrl) return item.imageUrl;
  if (item.image_url) return item.image_url;
  if (!isVideoItem(item) && item.url) return item.url;
  return fallbackImage;
}

const GalleryPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Use apiClient public method to fetch the gallery
    apiClient
      .getGallery({ visibleOnly: true })
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError("Could not load gallery."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!modalItem) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalItem(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalItem]);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Header />
      <div style={{ height: 80 }} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#b08643", marginBottom: 12, textAlign: "center" }}>
          Gallery
        </h1>
        <div style={{ textAlign: "center", color: "#666", marginBottom: 32 }}>
          A curated collection showcasing our resort — rooms, spa, dining, immersive experiences.
        </div>
        {loading ? (
          <div style={{ textAlign: "center", margin: "60px 0" }}>
            <svg width="48" height="48" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="#b08643" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" from="0 25 25" to="360 25 25"/>
              </circle>
            </svg>
            <div style={{ marginTop: 16, color: "#b08643", fontWeight: 600 }}>Loading gallery...</div>
          </div>
        ) : error ? (
          <div style={{ color: "red", textAlign: "center", fontWeight: 600, fontSize: 18 }}>{error}</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", color: "#888", fontSize: 18 }}>No gallery items found.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 18,
              marginTop: 16,
            }}
          >
            {items.map((item: any, idx: number) => {
              const isVideo = isVideoItem(item);
              const img = getImageUrl(item);
              return (
                <div
                  key={item.id || item._id || idx}
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 2px 8px #0001",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    minHeight: 160,
                    border: "1.5px solid #f0e8d8",
                    transition: "box-shadow .2s, border .2s",
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={() => setModalItem(item)}
                  tabIndex={0}
                  title={item.caption || item.title || ""}
                >
                  <div style={{ width: "100%", height: 120, overflow: "hidden", background: "#f5f5f5", position: "relative" }}>
                    {isVideo ? (
                      <img
                        src={img}
                        alt={item.caption || item.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          borderTopLeftRadius: 14,
                          borderTopRightRadius: 14,
                          background: "#eee",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackImage;
                        }}
                      />
                    ) : (
                      <img
                        src={img}
                        alt={item.caption || item.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          borderTopLeftRadius: 14,
                          borderTopRightRadius: 14,
                          background: "#eee",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackImage;
                        }}
                      />
                    )}
                    {isVideo && (
                      <div style={{
                        position: "absolute",
                        top: 0, left: 0, width: "100%", height: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        pointerEvents: "none"
                      }}>
                        <svg width="38" height="38" viewBox="0 0 54 54">
                          <circle cx="19" cy="19" r="18" fill="#fff9" />
                          <polygon points="15,12 28,19 15,26" fill="#b08643" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "12px 14px 10px 14px", width: "100%" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#2d2a26", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {(item.caption || item.title || "Untitled").slice(0, 40)}
                    </div>
                    {item.category && (
                      <div style={{ fontSize: 12, color: "#888", fontStyle: "italic", marginBottom: 2 }}>
                        {item.category}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for image/video display */}
        {modalItem && (
          <div
            style={{
              position: "fixed",
              top: 0, left: 0, width: "100vw", height: "100vh",
              background: "rgba(0,0,0,0.85)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              transition: "background .2s"
            }}
            onClick={() => setModalItem(null)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                maxWidth: "96vw",
                maxHeight: "92vh",
                boxShadow: "0 8px 32px #0008",
                padding: 0,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                overflow: "auto"
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setModalItem(null)}
                style={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  background: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 38,
                  height: 38,
                  boxShadow: "0 2px 8px #0002",
                  cursor: "pointer",
                  fontSize: 22,
                  color: "#b08643",
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                aria-label="Close"
              >
                ×
              </button>
              <div style={{
                width: "100%",
                maxWidth: "90vw",
                maxHeight: "70vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#222",
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                overflow: "hidden"
              }}>
                {(() => {
                  const isVideo = isVideoItem(modalItem);
                  const img = getImageUrl(modalItem);
                  if (isVideo) {
                    return (
                      <video
                        src={modalItem.url || modalItem.imageUrl}
                        style={{
                          width: "100%",
                          height: "100%",
                          maxHeight: "70vh",
                          objectFit: "contain",
                          background: "#111"
                        }}
                        controls
                        autoPlay
                        poster={img}
                      />
                    );
                  } else {
                    return (
                      <img
                        src={img}
                        alt={modalItem.caption || modalItem.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          maxHeight: "70vh",
                          objectFit: "contain",
                          background: "#111"
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackImage;
                        }}
                      />
                    );
                  }
                })()}
              </div>
              <div style={{
                width: "100%",
                padding: "18px 24px",
                background: "#fff",
                borderBottomLeftRadius: 18,
                borderBottomRightRadius: 18,
                textAlign: "center"
              }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: "#2d2a26", marginBottom: 4 }}>
                  {modalItem.caption || modalItem.title || "Untitled"}
                </div>
                {modalItem.category && (
                  <div style={{ fontSize: 13, color: "#888", fontStyle: "italic", marginBottom: 2 }}>
                    {modalItem.category}
                  </div>
                )}
                {modalItem.description && (
                  <div style={{ fontSize: 14, color: "#444", marginTop: 6 }}>
                    {modalItem.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
