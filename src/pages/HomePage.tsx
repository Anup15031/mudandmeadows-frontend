import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const HomePage = () => {
  const [site, setSite] = useState<any>(null);

  useEffect(() => {
    apiClient.getSiteConfig().then(setSite);
  }, []);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Header />
      <div style={{ height: 80 }} />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: 38, fontWeight: 800, color: "#b08643", marginBottom: 18 }}>
          {site?.siteName || "Resort"}
        </h1>
        <div style={{ fontSize: 22, color: "#2d2a26", marginBottom: 18 }}>
          {site?.about?.title || "Welcome to our resort"}
        </div>
        <div style={{ fontSize: 16, color: "#444", marginBottom: 28, maxWidth: 700 }}>
          {site?.about?.description || ""}
        </div>
        {site?.about?.highlights && (
          <ul style={{ color: "#6b7a5c", fontSize: 16, marginBottom: 28 }}>
            {site.about.highlights.map((h: string, i: number) => (
              <li key={i} style={{ marginBottom: 6 }}>{h}</li>
            ))}
          </ul>
        )}
        {site?.map?.embed_url && (
          <div style={{
            margin: "32px 0",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 2px 12px #0002",
            border: "1px solid #1a1816",
            maxWidth: 700
          }}>
            <iframe
              src={site.map.embed_url}
              width="100%"
              height="280"
              style={{ border: 0, width: "100%", minHeight: 180 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Resort Map"
            />
          </div>
        )}
        <div style={{ marginTop: 32 }}>
          <a href="/cottages" style={{
            background: "#b08643",
            color: "#fff",
            fontWeight: 600,
            borderRadius: 8,
            padding: "14px 32px",
            fontSize: 18,
            textDecoration: "none",
            boxShadow: "0 2px 8px #0001"
          }}>
            Explore Cottages
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
