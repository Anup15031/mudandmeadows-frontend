import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import Header from "@/components/layout/Header";
import { useNavigate } from "react-router-dom";

const heroImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";

function formatINR(n) {
	return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

const BookingPage = () => {
		// Payment/booking state
		const [loadingPayment, setLoadingPayment] = useState(false);
		const [errorMsg, setErrorMsg] = useState("");

		// Payment handler
		type RazorpayOrderRes = {
			id: string;
			amount: number;
			currency: string;
			key?: string;
			razorpayKey?: string;
		};
		const handleProceedToPayment = async () => {
			setErrorMsg("");
			if (selectedCottages.length === 0) return;
			setLoadingPayment(true);
			try {
				// 1. Check if user is logged in
				let user = null;
				try {
					user = await apiClient.getMe();
				} catch (err) {
					// Not logged in, redirect to login/guest checkout
					navigate("/login?redirect=/booking");
					setLoadingPayment(false);
					return;
				}

				// 2. Create Razorpay order

				const orderRes = await apiClient.createRazorpayOrder({
					amount: total * 100, // Razorpay expects paise
					currency: "INR",
					notes: {
						checkIn,
						checkOut,
						cottages: selectedCottages.map(sc => sc.cottage.name || sc.cottage.title).join(", ")
					}
				}) as RazorpayOrderRes;

				// 3. Open Razorpay payment window
				const options = {
					key: (orderRes.key || orderRes.razorpayKey || import.meta.env.VITE_RAZORPAY_KEY) as string,
					amount: orderRes.amount,
					currency: orderRes.currency,
					name: "Resort Booking",
					description: `Booking for ${selectedCottages.map(sc => sc.cottage.name || sc.cottage.title).join(", ")}`,
					order_id: orderRes.id,
					handler: async function (response: any) {
						// 4. Verify payment
						try {
							await apiClient.verifyRazorpayPayment({
								...response,
								order_id: orderRes.id
							});
							// 5. Create booking
							await apiClient.createApiBooking({
								guest_name: user.name || user.email,
								guest_email: user.email,
								guest_phone: user.phone || "",
								accommodation_id: selectedCottages.map(sc => sc.cottage.id),
								check_in: checkIn,
								check_out: checkOut,
								total_price: total
							});
							navigate("/booking/success");
						} catch (err) {
							setErrorMsg("Payment verified but booking failed. Please contact support.");
						}
					},
					prefill: {
						name: user.name || "",
						email: user.email || "",
						contact: user.phone || ""
					},
					theme: { color: "#b08643" }
				};
				// @ts-ignore
				const rzp = new window.Razorpay(options);
				rzp.open();
			} catch (err) {
				setErrorMsg("Payment could not be started. Please try again.");
			} finally {
				setLoadingPayment(false);
			}
		};
	const [allCottages, setAllCottages] = useState<any[]>([]);
	const [cottages, setCottages] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [soldOutCottages, setSoldOutCottages] = useState<any[]>([]);

	// Set default check-in to today and check-out to tomorrow
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(today.getDate() + 1);
	const formatDate = (d) => d.toISOString().slice(0, 10);
	const [checkIn, setCheckIn] = useState(formatDate(today));
	const [checkOut, setCheckOut] = useState(formatDate(tomorrow));
	const [adults, setAdults] = useState(2);
	const [children, setChildren] = useState(0);
	const [numCottages, setNumCottages] = useState(1);
	const [roomSelectorOpen, setRoomSelectorOpen] = useState(false);
	// selectedCottages: [{cottage, extraBed, adults, children}]
	const [selectedCottages, setSelectedCottages] = useState([]);
	const navigate = useNavigate();

	// Fetch all cottages (regardless of availability) once
	useEffect(() => {
		apiClient.getAllCottages({}).then((data: any[]) => {
			setAllCottages(data);
		});
	}, []);

	// Fetch available cottages from backend when dates change
	useEffect(() => {
		if (!checkIn || !checkOut) {
			setCottages([]);
			setSoldOutCottages([]);
			setSelectedCottages([]);
			return;
		}
		setLoading(true);
		setError(null);
		// Fetch available cottages for the selected dates
		apiClient.getAllCottages({
			availableStart: checkIn,
			availableEnd: checkOut,
		})
			.then((availableData: any[]) => {
				// IDs of available cottages
				const availableIds = new Set(availableData.map((c: any) => c.id));
				// Partition all cottages into available and sold out
				const availableCottages = allCottages.filter((c: any) => availableIds.has(c.id));
				const soldOut = allCottages.filter((c: any) => !availableIds.has(c.id));
				setCottages(availableCottages);
				setSoldOutCottages(soldOut);

				// Remove any selected cottages that are not available for the new dates
				setSelectedCottages((prev) =>
					prev.filter((sc) =>
						availableCottages.some((c) => c.id === sc.cottage.id)
					)
				);
			})
			.catch((err: any) => {
				setError(err?.detail || err?.message || "Failed to load cottages.");
				setCottages([]);
				setSoldOutCottages([]);
				setSelectedCottages([]);
			})
			.finally(() => setLoading(false));
	}, [checkIn, checkOut, allCottages.length]);

	// Calculate price summary
	let nights = 1;
	if (checkIn && checkOut) {
	  const checkInDate = new Date(checkIn);
	  const checkOutDate = new Date(checkOut);
	  if (!isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime())) {
	    nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
	  }
	}
	const price = selectedCottages.reduce((sum, sc) => sum + ((sc.cottage.price_per_night || sc.cottage.price || 10000) * nights) + (sc.extraBed ? 1500 * nights : 0), 0);
	const gst = Math.round(price * 0.12);
	const total = price + gst;

	// Add or remove cottages based on user selection
	const toggleCottage = (cottage) => {
		setSelectedCottages((prev) => {
			const found = prev.find((sc) => sc.cottage.id === cottage.id);
			if (found) {
				return prev.filter((sc) => sc.cottage.id !== cottage.id);
			} else {
				// Default: 2 adults, 1 child, no extra bed
				return [...prev, { cottage, extraBed: false, adults: 2, children: 1 }];
			}
		});
	};

	// When numCottages changes, adjust selectedCottages array length
	React.useEffect(() => {
		if (!Array.isArray(cottages) || cottages.length === 0) return;
		// Auto-select cottages up to numCottages, but preserve user's manual changes
		let currentIds = selectedCottages.map(sc => sc.cottage.id);
		let needed = numCottages - selectedCottages.length;
		if (needed > 0) {
			// Add unselected cottages in order
			const available = cottages.filter(c => !currentIds.includes(c.id));
			const newCottages = available.slice(0, needed).map(cottage => ({ cottage, extraBed: false, adults: 2, children: 0 }));
			setSelectedCottages(prev => [...prev, ...newCottages]);
		} else if (needed < 0) {
			// Remove from end
			setSelectedCottages(prev => prev.slice(0, numCottages));
		}
	}, [numCottages, cottages]);

	const toggleExtraBed = (cottageId) => {
		setSelectedCottages((prev) =>
			prev.map((sc) => {
				if (sc.cottage.id === cottageId) {
					const newExtraBed = !sc.extraBed;
					return {
						...sc,
						extraBed: newExtraBed,
						adults: newExtraBed ? 3 : Math.min(sc.adults, 2),
					};
				}
				return sc;
			})
		);
	};

	// Set adults/children for a cottage, enforcing limits
	const setCottageGuests = (cottageId, type, value) => {
		setSelectedCottages((prev) =>
			prev.map((sc) => {
				if (sc.cottage.id === cottageId) {
					let adults = sc.adults;
					let children = sc.children;
					let extraBed = sc.extraBed;
					if (type === 'adults') {
						adults = Math.max(1, Math.min(value, extraBed ? 3 : 2));
					}
					if (type === 'children') {
						children = Math.max(0, Math.min(value, 1));
					}
					// If adults set to 3, ensure extraBed is true
					if (adults === 3 && !extraBed) extraBed = true;
					if (adults < 3 && extraBed) extraBed = false;
					return { ...sc, adults, children, extraBed };
				}
				return sc;
			})
		);
	};

	const handleProceed = () => {
		navigate("/booking/checkout", {
			state: {
				selectedCottages,
				checkIn,
				checkOut,
				adults,
				children,
				numCottages,
				nights,
				price,
				gst,
				total,
			},
		});
	};

	// Remove: const [showDetailsForm, setShowDetailsForm] = useState(false);
	// Remove user details/payment state from this page

	return (
		<div style={{ background: "#f5f5f5", minHeight: "100vh", fontFamily: 'Inter, sans-serif' }}>
			<Header />
			{/* Hero Section */}
			<div style={{ width: "100%", height: 260, background: `url(${heroImage}) center/cover no-repeat`, position: "relative" }}>
				<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.5))" }} />
			</div>

			<div style={{ maxWidth: 1100, margin: "-80px auto 2rem", background: "#fff", borderRadius: 18, boxShadow: "0 8px 32px #0002", padding: 40, position: "relative", zIndex: 2, display: "flex", gap: 40 }}>
				{/* Left: Booking Form */}
				<div style={{ flex: 2 }}>
					<h1 style={{ fontFamily: 'serif', fontSize: 44, textAlign: "left", marginBottom: 32, fontWeight: 700, letterSpacing: 1 }}>Book Your Stay</h1>
					{/* Date & Room/Guest Selectors */}
					<div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', marginBottom: 32 }}>
						<div>
							<label style={{ fontWeight: 600, fontSize: 15 }}>Check In</label><br />
							<input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 16, minWidth: 140, transition: 'box-shadow .2s', boxShadow: '0 1px 4px #0001' }} />
						</div>
						<div>
							<label style={{ fontWeight: 600, fontSize: 15 }}>Check Out</label><br />
							<input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 16, minWidth: 140, transition: 'box-shadow .2s', boxShadow: '0 1px 4px #0001' }} />
						</div>
						<div style={{ position: 'relative' }}>
							<label style={{ fontWeight: 600, fontSize: 15 }}>Guests</label><br />
							<div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 6, background: '#fafafa', minWidth: 220, padding: '8px 12px', fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px #0001', transition: 'box-shadow .2s' }}
								onClick={() => setRoomSelectorOpen((open) => !open)}
							>
								<span style={{ flex: 1 }}>{`${adults} Adult, ${children} Child`}</span>
								<span style={{ fontSize: 22, marginLeft: 8 }}>▼</span>
							</div>
							{/* Dropdown for guest selection, now with per-cottage selectors */}
							{roomSelectorOpen && (
								<div style={{ position: 'absolute', top: 54, left: 0, background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 4px 24px #0002', padding: 18, minWidth: 320, display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeIn .3s', zIndex: 10 }}>
									<div style={{ fontWeight: 600, marginBottom: 6 }}>Guests</div>
									{/* ...removed cottage selector from dropdown... */}
									{/* Per-cottage selectors inside dropdown */}
									{selectedCottages.map((sc, idx) => (
										<div key={sc.cottage.id} style={{ border: '1px solid #ddd', borderRadius: 8, background: '#fafafa', marginBottom: 0, boxShadow: '0 2px 8px #0001', padding: 12, position: 'relative', minWidth: 220 }}>
											<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
												<div style={{ fontWeight: 600, fontSize: 15 }}>Cottage {idx + 1}</div>
												<div style={{ display: 'flex', gap: 4 }}>
													{selectedCottages.length > 1 && (
														<button onClick={() => setNumCottages(numCottages - 1)} style={{ border: 'none', background: '#eee', borderRadius: 4, width: 24, height: 24, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>-</button>
													)}
													{selectedCottages.length < (cottages?.length || 1) && idx === selectedCottages.length - 1 && (
														<button onClick={() => setNumCottages(numCottages + 1)} style={{ border: 'none', background: '#eee', borderRadius: 4, width: 24, height: 24, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>+</button>
													)}
												</div>
											</div>
											<div style={{ display: 'flex', gap: 24, marginBottom: 8 }}>
												<div style={{ textAlign: 'center', flex: 1 }}>
													<div style={{ fontSize: 14, marginBottom: 2 }}>Adult</div>
													<div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
														<button onClick={() => setCottageGuests(sc.cottage.id, 'adults', sc.adults - 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #bbb', background: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer' }} disabled={sc.adults <= 1}>-</button>
														<span style={{ minWidth: 18, display: 'inline-block', fontWeight: 600 }}>{sc.adults}</span>
														<button onClick={() => setCottageGuests(sc.cottage.id, 'adults', sc.adults + 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #bbb', background: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer' }} disabled={sc.adults >= (sc.extraBed ? 3 : 2)}>+</button>
													</div>
												</div>
												<div style={{ textAlign: 'center', flex: 1 }}>
													<div style={{ fontSize: 14, marginBottom: 2 }}>Child</div>
													<div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
														<button onClick={() => setCottageGuests(sc.cottage.id, 'children', sc.children - 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #bbb', background: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer' }} disabled={sc.children <= 0}>-</button>
														<span style={{ minWidth: 18, display: 'inline-block', fontWeight: 600 }}>{sc.children}</span>
														<button onClick={() => setCottageGuests(sc.cottage.id, 'children', sc.children + 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #bbb', background: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer' }} disabled={sc.children >= 1}>+</button>
													</div>
												</div>
											</div>
											<div style={{ textAlign: 'center', marginTop: 4 }}>
												<button style={{ marginLeft: 8, background: sc.extraBed ? '#b08643' : '#eee', color: sc.extraBed ? '#fff' : '#333', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 13 }} onClick={() => toggleExtraBed(sc.cottage.id)} disabled={sc.adults < 2 && !sc.extraBed}>
													{sc.extraBed ? 'Remove Extra Bed' : 'Add Extra Bed'}
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Cottages List - show only available cottages for selected dates */}
					{loading && <div style={{ textAlign: "center", margin: "2rem 0" }}>Loading cottages...</div>}
					{error && <div style={{ color: "red", textAlign: "center", margin: "2rem 0" }}>{error}</div>}
					{!loading && !error && Array.isArray(cottages) && cottages.length > 0 && (
						<div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
							{cottages.map((cottage, idx) => {
								const selectedIdx = selectedCottages.findIndex(sc => sc.cottage.id === cottage.id);
								const isSelected = selectedIdx !== -1;
								return (
									<div
										key={cottage.id}
										style={{
											display: 'flex',
											flexDirection: 'row',
											alignItems: 'stretch',
											border: isSelected ? '2.5px solid #b08643' : '1.5px solid #e0e0d8',
											borderRadius: 32,
											background: isSelected ? 'linear-gradient(90deg,#f9f6f1 60%,#f5ecd6 100%)' : 'linear-gradient(90deg,#f7f7f3 60%,#f5f5f0 100%)',
											marginBottom: 40,
											boxShadow: isSelected ? '0 12px 36px #b0864340' : '0 2px 16px #e0e0d880',
											padding: 0,
											position: 'relative',
											minWidth: 440,
											minHeight: 240,
											opacity: isSelected || selectedCottages.length < numCottages ? 1 : 0.85,
											transition: 'all .3s cubic-bezier(.4,2,.3,1)',
											transform: isSelected ? 'scale(1.025)' : 'scale(1)',
											cursor: isSelected || selectedCottages.length < numCottages ? 'pointer' : 'not-allowed',
											overflow: 'hidden',
										}}
										onMouseEnter={e => e.currentTarget.style.boxShadow = '0 18px 48px #b0864340'}
										onMouseLeave={e => e.currentTarget.style.boxShadow = isSelected ? '0 12px 36px #b0864340' : '0 2px 16px #e0e0d880'}
									>
										{/* Image Section - larger, no text overlay */}
										<div style={{ position: 'relative', width: 410, minWidth: 410, height: 280, overflow: 'hidden', borderTopLeftRadius: 32, borderBottomLeftRadius: 32, background: '#f5f5f5', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
											<img src={cottage.image_url || (Array.isArray(cottage.images) && cottage.images.length > 0 ? cottage.images[0] : heroImage)} alt={cottage.name || cottage.title || `Cottage ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s', borderTopLeftRadius: 32, borderBottomLeftRadius: 32, filter: 'brightness(0.97) saturate(1.13)', display: 'block' }} />
											{/* Info badges */}
											<div style={{ position: 'absolute', top: 20, left: 20, background: '#6bbf59', color: '#fff', borderRadius: 10, padding: '6px 18px', fontSize: 16, fontWeight: 700, boxShadow: '0 2px 8px #6bbf5940', letterSpacing: 0.5 }}>Available</div>
											<div style={{ position: 'absolute', top: 20, right: 20, background: '#b08643', color: '#fffbe6', borderRadius: 10, padding: '6px 18px', fontSize: 16, fontWeight: 700, boxShadow: '0 2px 8px #b0864340', letterSpacing: 0.5 }}>{cottage.area ? `${cottage.area} sq mtr` : ''}</div>
											{cottage.offer && <div style={{ position: 'absolute', bottom: 20, left: 20, background: '#e5b143', color: '#fff', borderRadius: 10, padding: '6px 18px', fontSize: 16, fontWeight: 700, boxShadow: '0 2px 8px #e5b14340', letterSpacing: 0.5 }}>{cottage.offer}</div>}
										</div>
										{/* Card Content Section */}
										<div style={{ flex: 1, padding: '40px 48px 32px 48px', background: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
											<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
												<div style={{ fontWeight: 800, fontSize: 27, color: isSelected ? '#2d2a26' : '#2d2a26', letterSpacing: 0.5, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>{cottage.name || cottage.title || `Cottage ${idx + 1}`}</div>
												<button
													onClick={() => {
														if (isSelected) {
															setSelectedCottages(selectedCottages.filter(sc => sc.cottage.id !== cottage.id));
														} else if (selectedCottages.length < numCottages) {
															setSelectedCottages([...selectedCottages, { cottage, extraBed: false, adults: 2, children: 0 }]);
														}
													}}
													style={{
														border: 'none',
														background: isSelected ? '#222' : '#222',
														color: isSelected ? '#ffe3b0' : '#ffe3b0',
														borderRadius: 12,
														width: 110,
														height: 44,
														fontWeight: 700,
														fontSize: 18,
														cursor: 'pointer',
														boxShadow: isSelected ? '0 2px 8px #b0864340' : 'none',
														transition: 'background .2s',
														fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
													}}
												>
													{isSelected ? 'Remove' : 'Select'}
												</button>
											</div>
											<div style={{ fontSize: 17, color: '#6b7a5c', marginBottom: 12, fontWeight: 500, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>{cottage.description || 'A beautiful cottage for your stay.'}</div>
											{/* Price and amenities icons row */}
											<div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 12 }}>
												<div style={{ fontSize: 24, color: '#b08643', fontWeight: 800, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
													{formatINR(cottage.price_per_night || cottage.price || 10000)}
												</div>
												<span style={{ color: '#b08643', fontSize: 16, fontWeight: 600, marginLeft: 2, marginRight: 8, background: 'transparent', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>/night</span>
											</div>
											{/* Amenities as icons */}
											<div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
												<span title="AC" style={{ display: 'flex', alignItems: 'center', background: '#f5ecd6', color: '#b08643', borderRadius: 8, padding: '3px 14px', fontSize: 16, fontWeight: 700, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
													<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: 5 }}><rect x="3" y="7" width="14" height="6" rx="2" fill="#b08643" fillOpacity="0.18"/><rect x="5" y="9" width="10" height="2" rx="1" fill="#b08643"/></svg>AC
												</span>
												<span title="WiFi" style={{ display: 'flex', alignItems: 'center', background: '#f5ecd6', color: '#b08643', borderRadius: 8, padding: '3px 14px', fontSize: 16, fontWeight: 700, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
													<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: 5 }}><path d="M4 8c3.3-3.3 8.7-3.3 12 0" stroke="#b08643" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 11c1.7-1.7 4.3-1.7 6 0" stroke="#b08643" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="14" r="1" fill="#b08643"/></svg>WiFi
												</span>
												<span title="Breakfast" style={{ display: 'flex', alignItems: 'center', background: '#f5ecd6', color: '#b08643', borderRadius: 8, padding: '3px 14px', fontSize: 16, fontWeight: 700, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
													<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: 5 }}><ellipse cx="10" cy="14" rx="6" ry="2" fill="#b08643" fillOpacity="0.18"/><circle cx="10" cy="10" r="4" fill="#b08643" fillOpacity="0.18"/><circle cx="10" cy="10" r="2" fill="#b08643"/></svg>Breakfast
												</span>
											</div>
											{isSelected && (
												<div>
													<div style={{ display: 'flex', gap: 24, marginBottom: 8 }}>
														<div style={{ textAlign: 'center', flex: 1 }}>
															<div style={{ fontSize: 15, marginBottom: 2, color: '#b08643' }}>Adult</div>
															<div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
																<span style={{ minWidth: 18, display: 'inline-block', fontWeight: 600, color: '#222' }}>{selectedCottages[selectedIdx].adults}</span>
															</div>
														</div>
														<div style={{ textAlign: 'center', flex: 1 }}>
															<div style={{ fontSize: 15, marginBottom: 2, color: '#b08643' }}>Child</div>
															<div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
																<span style={{ minWidth: 18, display: 'inline-block', fontWeight: 600, color: '#222' }}>{selectedCottages[selectedIdx].children}</span>
															</div>
														</div>
													</div>
													<div style={{ textAlign: 'center', marginTop: 4 }}>
														{selectedCottages[selectedIdx].extraBed && <span style={{ color: '#b08643', fontSize: 14 }}>+Extra Bed</span>}
													</div>
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
					{/* --- Sold Out Cottages Section --- */}
					{!loading && !error && Array.isArray(soldOutCottages) && soldOutCottages.length > 0 && (
						<div style={{ marginTop: 40 }}>
							<div style={{ fontWeight: 700, fontSize: 20, color: "#b08643", marginBottom: 12 }}>
								Sold Out Cottages
							</div>
							<div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                                gap: 24,
                            }}>
                                {soldOutCottages.map((cottage, idx) => (
                                    <div
                                        key={cottage.id}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'stretch',
                                            border: '1.5px solid #e0e0d8',
                                            borderRadius: 32,
                                            background: 'linear-gradient(90deg,#f7f7f3 60%,#f5f5f0 100%)',
                                            marginBottom: 0,
                                            boxShadow: '0 2px 16px #e0e0d880',
                                            padding: 0,
                                            position: 'relative',
                                            minWidth: 340,
                                            minHeight: 220,
                                            opacity: 0.55,
                                            filter: 'grayscale(0.8)',
                                            pointerEvents: 'none',
                                            overflow: 'hidden',
                                            transition: 'box-shadow .2s',
                                        }}
                                    >
                                        {/* Image Section */}
                                        <div style={{ position: 'relative', width: 160, minWidth: 160, height: 220, overflow: 'hidden', borderTopLeftRadius: 32, borderBottomLeftRadius: 32, background: '#f5f5f5', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                            <img src={cottage.image_url || (Array.isArray(cottage.images) && cottage.images.length > 0 ? cottage.images[0] : heroImage)} alt={cottage.name || cottage.title || `Cottage ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: 32, borderBottomLeftRadius: 32, filter: 'brightness(0.85) grayscale(0.7)', display: 'block' }} />
                                            {/* Sold Out Badge */}
                                            <div style={{ position: 'absolute', top: 16, left: 16, background: '#d9534f', color: '#fff', borderRadius: 8, padding: '4px 14px', fontSize: 15, fontWeight: 700, boxShadow: '0 2px 8px #d9534f40', letterSpacing: 0.5 }}>
                                                Sold Out
                                            </div>
                                        </div>
                                        {/* Card Content Section */}
                                        <div style={{ flex: 1, padding: '28px 32px 18px 32px', background: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
                                            <div style={{ fontWeight: 800, fontSize: 22, color: '#2d2a26', letterSpacing: 0.5, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', marginBottom: 6 }}>{cottage.name || cottage.title || `Cottage ${idx + 1}`}</div>
                                            <div style={{ fontSize: 15, color: '#6b7a5c', marginBottom: 8, fontWeight: 500, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', minHeight: 38 }}>{cottage.description || 'A beautiful cottage for your stay.'}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                                <div style={{ fontSize: 18, color: '#b08643', fontWeight: 800, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
                                                    {formatINR(cottage.price_per_night || cottage.price || 10000)}
                                                </div>
                                                <span style={{ color: '#b08643', fontSize: 14, fontWeight: 600, marginLeft: 2, marginRight: 8, background: 'transparent', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>/night</span>
                                            </div>
                                            <div style={{ fontWeight: 700, color: "#d9534f", fontSize: 15, marginTop: 6 }}>
                                                Not available for selected dates
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* If no available or sold out cottages, show message */}
                    {!loading && !error && cottages.length === 0 && soldOutCottages.length === 0 && (
                        <div style={{ textAlign: "center", margin: "2rem 0" }}>No cottages available for selected dates.</div>
                    )}
				</div>

				{/* Right: Summary & Payment */}
				<div style={{ flex: 1, background: '#f9f7f3', borderRadius: 14, boxShadow: '0 2px 12px #b0864320', padding: 32, minWidth: 320, marginLeft: 12, position: 'sticky', top: 40, alignSelf: 'flex-start', animation: 'fadeInRight .5s' }}>
					<div style={{ fontSize: 22, fontWeight: 700, marginBottom: 18, color: '#b08643', letterSpacing: 1 }}>Summary</div>
					<div style={{ fontSize: 16, marginBottom: 8 }}>
						<b>Check In:</b> {checkIn || <span style={{ color: '#bbb' }}>--</span>}
					</div>
					<div style={{ fontSize: 16, marginBottom: 8 }}>
						<b>Check Out:</b> {checkOut || <span style={{ color: '#bbb' }}>--</span>}
					</div>
					<div style={{ fontSize: 16, marginBottom: 8 }}>
						<b>Guests:</b> {adults} Adult, {children} Child
						<div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
							{numCottages} cottage{numCottages > 1 ? 's' : ''} selected
						</div>
					</div>
					<div style={{ fontSize: 16, marginBottom: 8 }}>
						<b>Nights:</b> {nights}
					</div>
					<hr style={{ margin: '18px 0' }} />
					   <div style={{ fontSize: 16, marginBottom: 8 }}>
						   <b>Cottages:</b> {selectedCottages.length === 0 ? <span style={{ color: '#bbb' }}>--</span> : null}
						   <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
							 {selectedCottages.map((sc) => (
							   <li key={sc.cottage.id} style={{ marginBottom: 4 }}>
								 {sc.cottage.name || sc.cottage.title} {sc.extraBed && <span style={{ color: '#b08643', fontSize: 13 }}>(+Extra Bedding)</span>}
							   </li>
							 ))}
						   </ul>
					   </div>
					   <div style={{ fontSize: 16, marginBottom: 8 }}>
						   <b>Price:</b> {selectedCottages.length === 0 ? '--' : formatINR(price) + ' x ' + nights + ' night(s)'}
					   </div>
					   <div style={{ fontSize: 16, marginBottom: 8 }}>
						   <b>GST (12%):</b> {selectedCottages.length === 0 ? '--' : formatINR(gst)}
					   </div>
					   <div style={{ fontSize: 18, fontWeight: 700, margin: '18px 0 8px', color: '#b08643' }}>
						   Total: {selectedCottages.length === 0 ? '--' : formatINR(total)}
					   </div>
					{errorMsg && <div style={{ color: 'red', margin: '10px 0', fontWeight: 500 }}>{errorMsg}</div>}
					<button
						style={{
							background: selectedCottages.length > 0 ? '#b08643' : '#bbb',
							color: '#fff',
							border: 'none',
							borderRadius: 8,
							padding: '14px 0',
							fontWeight: 700,
							fontSize: 18,
							width: '100%',
							marginTop: 18,
							cursor: selectedCottages.length > 0 && !loadingPayment ? 'pointer' : 'not-allowed',
							boxShadow: '0 2px 8px #b0864340',
							transition: 'background .2s',
							opacity: loadingPayment ? 0.7 : 1
						}}
						disabled={selectedCottages.length === 0 || loadingPayment}
						onClick={handleProceed}
					>
						Proceed
					</button>
				</div>
			</div>

			{/* Animations */}
			<style>{`
				@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
				@keyframes fadeInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: none; } }
				.fadeIn { animation: fadeIn .3s; }
				.fadeInRight { animation: fadeInRight .5s; }
			`}</style>
		</div>
	);
};

export default BookingPage;
