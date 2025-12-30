import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { apiClient } from "@/lib/api-client";

function formatINR(n: number) {
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

const sectionStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 16px #0001",
  padding: 28,
  marginBottom: 28,
};

const labelStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 15,
  marginBottom: 6,
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 16,
  marginBottom: 12,
  background: "#fafafa",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: 16,
};

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;

  // Booker info only
  const [name, setName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "upi" | "">("razorpay");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!state || !state.selectedCottages || state.selectedCottages.length === 0) {
    navigate("/booking");
    return null;
  }

  const {
    selectedCottages,
    checkIn,
    checkOut,
    nights,
    price,
    gst,
    total,
  } = state;

  // Ensure Razorpay script is loaded before attempting to use window.Razorpay
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => {
        // Optionally, you can set a state to indicate Razorpay is loaded
      };
    }
  }, []);

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return;
    setLoading(true);
    setErrorMsg("");
    try {
      // Razorpay expects amount in paise, backend expects amount in paise as well
      const orderRes = await apiClient.createRazorpayOrder({
        amount: total * 100, // paise
        currency: "INR",
        notes: {
          checkIn,
          checkOut,
          cottages: selectedCottages.map((sc: any) => sc.cottage.name || sc.cottage.title).join(", "),
          booker_name: name,
          booker_email: email,
          booker_phone: contactNo,
        }
      });

      // Razorpay backend returns {id, amount, currency, key, razorpayKey, ...order}
      const key = orderRes.key || orderRes.razorpayKey;
      const options = {
        key,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "Resort Booking",
        description: `Booking for ${selectedCottages.map((sc: any) => sc.cottage.name || sc.cottage.title).join(", ")}`,
        order_id: orderRes.id,
        handler: async (response: any) => {
          try {
            await apiClient.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            // --- Create booking and redirect with bookingId in query string ---
            const booking = await apiClient.createApiBooking({
              guest_name: name,
              guest_email: email,
              guest_phone: contactNo,
              address,
              city,
              postal_code: postalCode,
              country,
              accommodation_id:
                selectedCottages.length === 1
                  ? String(selectedCottages[0].cottage.id)
                  : selectedCottages.map((sc: any) => String(sc.cottage.id)),
              check_in: checkIn,
              check_out: checkOut,
              total_price: total,
              payment_method: paymentMethod,
            });
            // Wait a few seconds before redirecting to success page
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              navigate(`/booking/success?bookingId=${booking.id || booking._id}`);
            }, 3000); // 3 seconds delay
          } catch (err: any) {
            setErrorMsg(
              err?.detail && typeof err.detail === "string"
                ? err.detail
                : "Payment verified but booking failed. Please contact support."
            );
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: contactNo
        },
        theme: { color: "#43b06a" }
      };
      // @ts-ignore
      if (window.Razorpay) {
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setErrorMsg("Razorpay is not available. Please refresh and try again.");
      }
    } catch (err: any) {
      setErrorMsg("Payment could not be started. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Header />
      {/* Add margin to push content below header */}
      <div style={{ height: 80 }} />
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 8px 32px #0002",
        padding: 40,
        position: "relative",
        zIndex: 2,
        display: "flex",
        gap: 40,
      }}>
        {/* Left: Booker Details Form */}
        <form style={{ flex: 2, minWidth: 340 }} onSubmit={handlePayNow}>
          <div style={sectionStyle}>
            <div style={{ ...rowStyle, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <span style={labelStyle}>Check In</span>
                <div style={{ fontWeight: 500 }}>{checkIn}</div>
              </div>
              <div style={{ flex: 1 }}>
                <span style={labelStyle}>Check Out</span>
                <div style={{ fontWeight: 500 }}>{checkOut}</div>
              </div>
            </div>
            <div>
              <span style={labelStyle}>Full Name *</span>
              <input style={inputStyle} required value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" />
            </div>
            <div>
              <span style={labelStyle}>Contact No *</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  background: "#f5f5f5",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  padding: "8px 10px",
                  fontWeight: 500,
                }}>+91</span>
                <input style={{ ...inputStyle, marginBottom: 0 }} required value={contactNo} onChange={e => setContactNo(e.target.value)} placeholder="Contact no" />
              </div>
            </div>
            <div>
              <span style={labelStyle}>Email *</span>
              <input style={inputStyle} required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" />
            </div>
            <div>
              <span style={labelStyle}>Billing Address *</span>
              <input style={inputStyle} required value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" />
            </div>
            <div style={rowStyle}>
              <div style={{ flex: 1 }}>
                <span style={labelStyle}>City *</span>
                <input style={inputStyle} required value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
              </div>
              <div style={{ flex: 1 }}>
                <span style={labelStyle}>Postal Code *</span>
                <input style={inputStyle} required value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="Postal Code" />
              </div>
            </div>
            <div>
              <span style={labelStyle}>Country *</span>
              <select style={inputStyle} required value={country} onChange={e => setCountry(e.target.value)}>
                <option value="India">India</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          {/* Payment Options */}
          <div style={sectionStyle}>
            <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 14 }}>Payment Options</div>
            <div style={{
              display: "flex",
              gap: 18,
              marginBottom: 18,
              flexWrap: "wrap"
            }}>
              <label style={{
                flex: 1,
                border: paymentMethod === "razorpay" ? "2px solid #43b06a" : "1px solid #ddd",
                borderRadius: 10,
                padding: "16px 18px",
                cursor: "pointer",
                background: paymentMethod === "razorpay" ? "#f6fff8" : "#fafafa",
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontWeight: 500,
                fontSize: 16,
                minWidth: 180,
              }}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  style={{ marginRight: 10 }}
                />
                <img src="https://razorpay.com/favicon.ico" alt="Razorpay" style={{ width: 28, height: 28 }} />
                Razorpay
              </label>
              <label style={{
                flex: 1,
                border: paymentMethod === "upi" ? "2px solid #43b06a" : "1px solid #ddd",
                borderRadius: 10,
                padding: "16px 18px",
                cursor: "pointer",
                background: paymentMethod === "upi" ? "#f6fff8" : "#fafafa",
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontWeight: 500,
                fontSize: 16,
                minWidth: 180,
              }}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                  style={{ marginRight: 10 }}
                />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Unified_Payments_Interface_logo.svg/32px-Unified_Payments_Interface_logo.svg.png" alt="UPI" style={{ width: 28, height: 28 }} />
                UPI
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "flex", alignItems: "center", fontSize: 15 }}>
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} required style={{ marginRight: 8 }} />
                By booking, you agree to our <a href="#" style={{ color: "#43b06a", marginLeft: 4, textDecoration: "underline" }}>Terms and Conditions</a>
              </label>
            </div>
            {errorMsg && <div style={{ color: "red", marginBottom: 10 }}>{errorMsg}</div>}
            <button
              type="submit"
              style={{
                background: agree && !loading ? "#43b06a" : "#bbb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "16px 0",
                fontWeight: 700,
                fontSize: 20,
                width: "100%",
                marginTop: 10,
                cursor: agree && !loading ? "pointer" : "not-allowed",
                boxShadow: "0 2px 8px #43b06a40",
                transition: "background .2s",
                letterSpacing: 1,
                opacity: loading ? 0.7 : 1
              }}
              disabled={!agree || loading}
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </form>
        {/* Right: Booking Summary */}
        <div style={{
          flex: 1,
          minWidth: 320,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 16px #0001",
          padding: 28,
          position: "sticky",
          top: 40,
          alignSelf: "flex-start",
        }}>
          <div style={{ fontWeight: 700, fontSize: 22, color: "#43b06a", marginBottom: 18 }}>Booking Summary</div>
          <div style={{ marginBottom: 16 }}>
            <div><b>Check In:</b> {checkIn}</div>
            <div><b>Check Out:</b> {checkOut}</div>
            <div><b>Nights:</b> {nights}</div>
          </div>
          {selectedCottages.map((sc: any, idx: number) => (
            <div key={sc.cottage.id} style={{
              border: "1px solid #e0e0e0",
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
              background: "#f9f9f9"
            }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>
                {sc.cottage.name || sc.cottage.title}
              </div>
              <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>
                {sc.cottage.description}
              </div>
              <div style={{ fontSize: 15, marginBottom: 2 }}>
                <b>Guests:</b> {sc.adults} Adult{sc.adults > 1 ? "s" : ""}, {sc.children} Child{sc.children !== 1 ? "ren" : ""}
                {sc.extraBed && <span style={{ color: '#b08643', fontSize: 13 }}> (+Extra Bed)</span>}
              </div>
              <div style={{ fontSize: 15, marginBottom: 2 }}>
                <b>Dates:</b> {checkIn} to {checkOut}
              </div>
              <div style={{ marginTop: 8, fontWeight: 600, color: "#b08643" }}>
                {formatINR(sc.cottage.price_per_night || sc.cottage.price || 10000)} / night
              </div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #eee", margin: "18px 0" }} />
          <div style={{ fontSize: 16, marginBottom: 8 }}><b>Price:</b> {formatINR(price)} x {nights} night(s)</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}><b>GST (12%):</b> {formatINR(gst)}</div>
          <div style={{ fontSize: 20, fontWeight: 700, margin: '18px 0 8px', color: '#43b06a' }}>
            Total: {formatINR(total)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
