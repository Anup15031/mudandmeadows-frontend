import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useProgramsWellness, useCottage } from "@/hooks/useApi";
import { Accommodation } from "@/types/api";
import { 
  Users, Maximize, Eye, Check, ArrowLeft, 
  Calendar, Wifi, Coffee, Bath, Wind, Leaf 
} from "lucide-react";
import suiteImage from "@/assets/luxury-suite.jpg";
import spaImage from "@/assets/spa-treatment.jpg";
import OptimizedImage from "@/components/ui/OptimizedImage";

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "King Bed": Bath,
  "Private Balcony": Wind,
  "Rain Shower": Bath,
  "Mini Bar": Coffee,
  "24/7 Butler Service": Check,
  "Organic Toiletries": Leaf,
  "Meditation Corner": Leaf,
  default: Wifi,
};

const RoomDetailPage = () => {
  const { id } = useParams();
  const { data: cottage, loading } = useCottage(id);
  // Call wellness programs hook at top-level so hook order is stable
  const { data: programsData } = useProgramsWellness();

  const mapAccommodation = (a: any): Room => ({
    id: a.id || String(a.name).toLowerCase().replace(/\s+/g, "-"),
    name: a.name || a.title || '',
    category: a.category || "deluxe",
    description: a.description || a.summary || "",
    shortDescription: (a.description || "").slice(0, 140),
    basePrice: a.price_per_night ?? a.pricePerNight ?? a.price ?? 0,
    maxGuests: a.capacity ?? a.sleeps ?? 2,
    size: a.sqm || a.size || 45,
    view: a.view || "Mountain View",
    amenities: a.amenities || a.features || [],
    images: a.images || a.media || [],
    featured: a.rating ? a.rating >= 4.5 : false,
  });

  const room = cottage ? mapAccommodation(cottage as any) : null;

  // SEO: set document title and meta description / OG tags for better indexing
  React.useEffect(() => {
    if (!room) return;
    try {
      const title = `${room.name} — Luxury Resort Rooms & Wellness`;
      document.title = title;
      let desc = room.shortDescription || room.description || 'Luxury rooms, wellness and detox retreats in Jamshedpur, Jharkhand.';
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', desc);

      // OpenGraph
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
      ogTitle.setAttribute('content', title);
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
      ogDesc.setAttribute('content', desc);

      // canonical
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link); }
      const canonical = window.location.href.split('#')[0].split('?')[0];
      link.setAttribute('href', canonical);
    } catch (e) {
      // ignore DOM errors in SSR or tests
    }
  }, [room]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!room) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-4xl mb-4">Room Not Found</h1>
            <Link to="/rooms">
              <Button variant="outline">Back to Rooms</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  const allPrograms: any[] = Array.isArray(programsData) ? programsData : (programsData && programsData.items) || [];
  const relatedPrograms = allPrograms.filter((p) => p.featured).slice(0, 2);
  const priceNumber = room ? (room.basePrice ?? room.price_per_night ?? 0) : 0;
  const priceFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(priceNumber);

  return (
    <Layout>
      {/* Back Button */}
      <div className="pt-24 pb-4 container-padding max-w-7xl mx-auto">
        <Link
          to="/rooms"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Cottages</span>
        </Link>
      </div>

      {/* Hero Gallery (DB-driven images) */}
      <section className="container-padding max-w-7xl mx-auto mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 aspect-[16/10] rounded-lg overflow-hidden">
                <OptimizedImage
                  src={room.images && room.images.length ? String(room.images[0]) : suiteImage}
                  srcSet={`${room.images && room.images.length ? String(room.images[0]) : suiteImage} 1200w`}
                  loading="lazy"
                  decoding="async"
                  alt={room.name}
                  className="w-full h-full object-cover"
                  fallbackQuery="rooms,luxury"
                />
              </div>
              <div className="grid grid-rows-2 gap-4">
                <div className="aspect-[4/3] lg:aspect-auto rounded-lg overflow-hidden">
                  <OptimizedImage
                    src={room.images && room.images[1] ? String(room.images[1]) : spaImage}
                    srcSet={`${room.images && room.images[1] ? String(room.images[1]) : spaImage} 800w`}
                    loading="lazy"
                    decoding="async"
                    alt="Room amenities"
                    className="w-full h-full object-cover"
                    fallbackQuery="spa,amenities"
                  />
                </div>
                <div className="aspect-[4/3] lg:aspect-auto rounded-lg overflow-hidden relative">
                  <OptimizedImage
                    src={room.images && room.images[2] ? String(room.images[2]) : (room.images && room.images[0] ? String(room.images[0]) : suiteImage)}
                    srcSet={`${room.images && room.images[2] ? String(room.images[2]) : (room.images && room.images[0] ? String(room.images[0]) : suiteImage)} 800w`}
                    loading="lazy"
                    decoding="async"
                    alt="Room view"
                    className="w-full h-full object-cover"
                    fallbackQuery="rooms,view"
                  />
                  <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                    <Button variant="hero-outline" size="sm">
                      View Gallery
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-padding max-w-7xl mx-auto pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Title & Description */}
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">
                {room.category}
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-medium mb-6">
                {room.name}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
                <span className="flex items-center gap-2">
                  <Maximize className="h-5 w-5" />
                  {room.size} sqm
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Up to {room.maxGuests} guests
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Adults: {room.capacity_adults ?? room.capacity ?? room.maxGuests}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Children: {room.capacity_children ?? room.child_capacity ?? 0} {room.child_age_limit || room.child_age_max || room.child_age ? `(age up to ${room.child_age_limit ?? room.child_age_max ?? room.child_age} yrs)` : ''}
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {room.view}
                </span>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {room.description}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="font-serif text-2xl font-medium mb-6">
                Room Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {room.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity] || amenityIcons.default;
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 p-4 bg-muted rounded-lg"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Beds, Policies, Restaurant */}
            <div>
              <h2 className="font-serif text-2xl font-medium mb-6">Details & Policies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Sleeping & Beds</h3>
                  <div className="text-sm text-muted-foreground mb-2">{room.beds || '1 Queen'}</div>
                  {Array.isArray((room as any).bedConfig) && (room as any).bedConfig.length ? (
                    <ul className="text-sm list-disc pl-5 text-muted-foreground">
                      {(room as any).bedConfig.map((b: any, i: number) => (
                        <li key={i}>{b.count} × {b.type} {b.size ? `(${b.size})` : ''}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Policies</h3>
                  <div className="text-sm text-muted-foreground">
                    <div><strong>Check-in:</strong> {(room as any).policies?.checkIn || '15:00'}</div>
                    <div><strong>Check-out:</strong> {(room as any).policies?.checkOut || '12:00'}</div>
                    <div className="mt-2"><strong>Cancellation:</strong> {(room as any).policies?.cancellation || 'Free cancellation up to 7 days before check-in'}</div>
                  </div>
                </div>
              </div>

              {room.restaurant ? (
                <div className="mt-6 p-4 bg-card rounded-lg border border-border">
                  <h3 className="font-medium">{(room.restaurant && room.restaurant.name) || 'On-site Dining'}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{(room.restaurant && room.restaurant.description) || ''}</p>
                  {Array.isArray(room.restaurant?.menu) && room.restaurant.menu.length ? (
                    <div className="text-sm">
                      <h4 className="font-medium mb-2">Sample Menu</h4>
                      <ul className="list-disc pl-5 text-muted-foreground">
                        {room.restaurant.menu.map((m: any, i: number) => (
                          <li key={i}>{m.name} — ₹{m.price} <span className="text-xs text-muted-foreground">{m.description}</span></li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Wellness Upsell */}
            <div>
              <h2 className="font-serif text-2xl font-medium mb-6">
                Enhance Your Stay
              </h2>
              <p className="text-muted-foreground mb-6">
                Complement your accommodation with our signature wellness experiences.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPrograms.map((program) => (
                          <Link
                            key={program.id}
                            to={`/programs/wellness`}
                    className="group flex gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <OptimizedImage src={spaImage} alt={program.name} className="w-full h-full object-cover" fallbackQuery="spa,wellness" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif font-medium group-hover:text-primary transition-colors">
                        {program.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1">
                        {program.duration}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        ${program.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <QuickAvailabilitySidebar room={room} priceFormatted={priceFormatted} />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RoomDetailPage;

function QuickAvailabilitySidebar({ room, priceFormatted }: { room: any; priceFormatted: string }) {
  const navigate = useNavigate();
  const defaultAdults = Number(room.capacity_adults ?? room.capacity ?? room.maxGuests ?? 1);
  const defaultChildren = Number(room.capacity_children ?? room.child_capacity ?? 0);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  const handleCheck = () => {
    const params = new URLSearchParams();
    params.set('room', String(room.id));
    params.set('adults', String(defaultAdults));
    params.set('children', String(defaultChildren));
    navigate(`/booking?${params.toString()}`);
  };

  return (
    <div
      className="lg:fixed lg:right-16 lg:top-32 z-30 flex justify-center w-full lg:w-auto"
      style={{
        pointerEvents: 'auto',
        animation: mounted ? 'floatCard 5s ease-in-out infinite alternate' : 'none',
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.98)',
        opacity: mounted ? 1 : 0,
        transition: 'transform 420ms cubic-bezier(0.2,0.8,0.2,1), opacity 420ms ease, box-shadow 300ms',
      }}
    >
      <style>{`
        @keyframes floatCard {
          0% { box-shadow: 0 8px 32px rgba(0,0,0,0.10); transform: translateY(0) scale(1); }
          100% { box-shadow: 0 24px 64px rgba(0,0,0,0.16); transform: translateY(-8px) scale(1.012); }
        }
      `}</style>
      <div className="w-80 md:w-96 bg-gradient-to-br from-white via-white to-slate-50 border border-border rounded-2xl p-8 shadow-2xl hover:shadow-[0_30px_60px_rgba(0,0,0,0.14)] transition-all transform-gpu hover:scale-102">
        <div className="mb-8 text-center">
          <p className="text-muted-foreground text-sm mb-1 tracking-wide">Starting from</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="font-serif text-4xl md:text-5xl text-primary leading-none">{priceFormatted}</span>
            <span className="text-muted-foreground self-end">/ night</span>
          </div>
        </div>

        <div className="mb-6">
          <button onClick={handleCheck} className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-md text-lg hover:opacity-95">
            <Calendar className="h-5 w-5" />
            <span>Check Availability</span>
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center">Free cancellation up to 7 days before check-in</p>
      </div>
    </div>
  );
}
