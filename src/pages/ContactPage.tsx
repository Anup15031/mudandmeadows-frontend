import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/hooks/useApi";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import Header from "@/components/layout/Header";

// Contact info type
type ContactInfo = {
  location?: string;
  reservations?: string;
  email?: string;
  reception_hours?: string;
};

const ContactPage = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiClient
      .getSiteConfig()
      .then((data) => setContactInfo(data?.contact || {}))
      .catch(() => setError("Could not load contact info."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      await apiClient.createContactMessage(form);
      setSubmitMsg("Your message has been sent successfully!");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setSubmitMsg("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        minHeight: "100vh",
        fontFamily: "Inter, serif",
      }}
    >
      <Header />
      <div style={{ height: 80 }} />
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 20px",
          display: "flex",
          gap: 40,
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px #0001",
            padding: 32,
            minWidth: 340,
          }}
        >
          <h2
            style={{
              fontSize: 26,
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            Send Us a Message
          </h2>
          <div style={{ marginBottom: 18 }}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: 10,
                marginBottom: 10,
                borderRadius: 6,
                border: "1px solid #ddd",
              }}
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: 10,
                marginBottom: 10,
                borderRadius: 6,
                border: "1px solid #ddd",
              }}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 10,
                marginBottom: 10,
                borderRadius: 6,
                border: "1px solid #ddd",
              }}
            />
            <select
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: 10,
                marginBottom: 10,
                borderRadius: 6,
                border: "1px solid #ddd",
              }}
            >
              <option value="">Select a subject</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Reservation">Reservation</option>
              <option value="Feedback">Feedback</option>
              <option value="Other">Other</option>
            </select>
            <textarea
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ddd",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: "#b08643",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              borderRadius: 8,
              padding: "12px 28px",
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px #0001",
            }}
          >
            {submitting ? "Sending..." : "SEND MESSAGE"}
          </button>
          {submitMsg && (
            <div
              style={{
                marginTop: 18,
                color: submitMsg.includes("success")
                  ? "#43b06a"
                  : "red",
                fontWeight: 600,
              }}
            >
              {submitMsg}
            </div>
          )}
        </form>
        <div style={{ flex: 1, minWidth: 320 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            Contact Information
          </h2>
          <div style={{ marginBottom: 18 }}>
            <div
              style={{ fontWeight: 600, marginBottom: 6 }}
            >
              Location
            </div>
            <div>{contactInfo.location || "Not available"}</div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div
              style={{ fontWeight: 600, marginBottom: 6 }}
            >
              Reservations
            </div>
            <div>{contactInfo.reservations || "Not available"}</div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div
              style={{ fontWeight: 600, marginBottom: 6 }}
            >
              Email
            </div>
            <div>{contactInfo.email || "Not available"}</div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div
              style={{ fontWeight: 600, marginBottom: 6 }}
            >
              Reception Hours
            </div>
            <div>{contactInfo.reception_hours || "Not available"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
