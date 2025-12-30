import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { Header } from "@/components/layout/Header";

const BookingSuccessPage = () => {
  const location = useLocation();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Always get bookingId from query string
  const bookingId = new URLSearchParams(location.search).get("bookingId");

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID found.");
      setLoading(false);
      return;
    }
    // Call the new /bookings/by-id?booking_id=... endpoint
    apiClient.request(`/api/bookings/by-id?booking_id=${bookingId}`)
      .then(setBooking)
      .catch(() => setError("Could not fetch booking details."))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    try {
      await apiClient.sendBookingConfirmation(bookingId, {});
      alert("Booking confirmation sent via email.");
    } catch {
      alert("Failed to send email.");
    }
  };

  const handleSendSMS = async () => {
    // Implement SMS sending logic or call your backend endpoint here
    alert("SMS sending not implemented.");
  };

  if (loading) return <div>Loading booking details...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!booking) return <div>No booking found.</div>;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Header />
      <div style={{
        maxWidth: 700,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 8px 32px #0002",
        padding: 40,
      }}>
        <h1 style={{ fontFamily: 'serif', fontSize: 32, marginBottom: 18, fontWeight: 700, color: "#43b06a" }}>
          Booking Confirmed!
        </h1>
        <div style={{ fontSize: 18, marginBottom: 18 }}>
          Thank you for your booking. Your reservation details are below.
        </div>
        <div style={{ marginBottom: 24 }}>
          <b>Booking Reference:</b> {booking.reference || booking.id}
        </div>
        <div style={{ marginBottom: 12 }}>
          <b>Name:</b> {booking.guest_name}<br />
          <b>Email:</b> {booking.guest_email}<br />
          <b>Phone:</b> {booking.guest_phone}
        </div>
        <div style={{ marginBottom: 12 }}>
          <b>Check In:</b> {booking.check_in && (typeof booking.check_in === "string" ? booking.check_in.slice(0, 10) : new Date(booking.check_in).toLocaleDateString())}<br />
          <b>Check Out:</b> {booking.check_out && (typeof booking.check_out === "string" ? booking.check_out.slice(0, 10) : new Date(booking.check_out).toLocaleDateString())}
        </div>
        <div style={{ marginBottom: 12 }}>
          <b>Total Price:</b> ₹{booking.total_price}
        </div>
        <div style={{ marginBottom: 12 }}>
          <b>Payment Method:</b> {booking.payment_method || (booking.payment?.provider || "N/A")}
        </div>
        <div style={{ marginBottom: 12 }}>
          <b>Status:</b> {booking.status}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
          <button onClick={handlePrint} style={{ padding: "10px 18px", borderRadius: 8, background: "#b08643", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
            Print
          </button>
          <button onClick={handleSendEmail} style={{ padding: "10px 18px", borderRadius: 8, background: "#43b06a", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
            Send Email
          </button>
          <button onClick={handleSendSMS} style={{ padding: "10px 18px", borderRadius: 8, background: "#2d7cff", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
            Send SMS
          </button>
        </div>
        <div style={{ marginTop: 32 }}>
          <a href="/" style={{ color: "#b08643", textDecoration: "underline" }}>Return to Home</a>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
