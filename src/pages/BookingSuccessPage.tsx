import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import Header from "@/components/layout/Header";

const BookingSuccessPage = () => {
  const location = useLocation();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = new URLSearchParams(location.search).get("bookingId");

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID found.");
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;
    const delay = 2000; // 2 seconds

    const fetchBooking = async () => {
      try {
        const data = await apiClient.getBooking(bookingId);
        setBooking(data);
        setLoading(false);
      } catch {
        attempts += 1;
        if (attempts < maxAttempts) {
          setTimeout(fetchBooking, delay);
        } else {
          setError("Could not fetch booking details. Please refresh after a few seconds.");
          setLoading(false);
        }
      }
    };

    fetchBooking();
  }, [bookingId]);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Header />
      {/* Add margin to push content below header */}
      <div style={{ height: 80 }} />
      <div style={{
        maxWidth: 700,
        margin: "0 auto 40px auto",
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 8px 32px #0002",
        padding: "48px 32px 40px 32px",
        position: "relative",
        minHeight: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        {loading ? (
          <div style={{ minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <svg width="60" height="60" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="#43b06a" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" from="0 25 25" to="360 25 25"/>
              </circle>
            </svg>
            <div style={{ marginTop: 18, textAlign: "center", color: "#43b06a", fontWeight: 600, fontSize: 20 }}>
              Finalizing your booking...
            </div>
          </div>
        ) : error ? (
          <div style={{ color: "red", fontWeight: 600, fontSize: 18, textAlign: "center" }}>{error}</div>
        ) : booking ? (
          <div style={{ width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="28" fill="#eafaf1" stroke="#43b06a" strokeWidth="2"/>
                <polyline points="18,32 28,42 44,22" fill="none" stroke="#43b06a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h1 style={{ fontFamily: 'serif', fontSize: 32, margin: "18px 0 8px 0", fontWeight: 700, color: "#43b06a" }}>
                Booking Confirmed!
              </h1>
              <div style={{ fontSize: 18, color: "#333", marginBottom: 8 }}>
                Thank you for your booking.<br />Your reservation details are below.
              </div>
            </div>
            <div style={{ background: "#f7f7f7", borderRadius: 12, padding: 24, marginBottom: 18, boxShadow: "0 2px 8px #0001" }}>
              <div style={{ marginBottom: 12, fontSize: 18 }}>
                <b>Booking Reference:</b> <span style={{ color: "#b08643" }}>{booking.reference || booking.id}</span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Name:</b> {booking.guest_name}<br />
                <b>Email:</b> {booking.guest_email}<br />
                <b>Phone:</b> {booking.guest_phone}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Check In:</b> {booking.check_in && (typeof booking.check_in === "string" ? booking.check_in.slice(0, 10) : new Date(booking.check_in).toLocaleDateString())}<br />
                <b>Check Out:</b> {booking.check_out && (typeof booking.check_out === "string" ? booking.check_out.slice(0, 10) : new Date(booking.check_out).toLocaleDateString())}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Total Price:</b> <span style={{ color: "#43b06a" }}>₹{booking.total_price}</span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Payment Method:</b> {booking.payment_method || (booking.payment?.provider || "N/A")}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Status:</b> <span style={{ color: "#43b06a" }}>{booking.status || "Confirmed"}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 18, justifyContent: "center" }}>
              <button onClick={() => window.print()} style={{ padding: "10px 18px", borderRadius: 8, background: "#b08643", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
                Print
              </button>
              <button onClick={() => alert("Email sending not implemented in demo.")} style={{ padding: "10px 18px", borderRadius: 8, background: "#43b06a", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
                Send Email
              </button>
              <button onClick={() => alert("SMS sending not implemented in demo.")} style={{ padding: "10px 18px", borderRadius: 8, background: "#2d7cff", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
                Send SMS
              </button>
            </div>
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <a href="/" style={{ color: "#b08643", textDecoration: "underline", fontWeight: 500 }}>Return to Home</a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BookingSuccessPage;
