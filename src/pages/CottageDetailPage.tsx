import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useProgramsWellness, useCottage } from "@/hooks/useApi";
import { Users, Maximize, Eye, Check, ArrowLeft, Calendar, Wifi, Coffee, Bath, Wind, Leaf } from "lucide-react";
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

const CottageDetailPage = () => {
  const { id } = useParams();
  const { data: cottage, loading } = useCottage(id);
  const { data: programsData } = useProgramsWellness();

  const mapCottage = (a: any) => ({
    id: a.id || String(a.name).toLowerCase().replace(/\s+/g, "-"),
    name: a.name || a.title || '',
    category: a.category || "deluxe",
    description: a.description || a.summary || "",
    shortDescription: (a.description || "").slice(0, 140),
    price_per_night: a.price_per_night ?? a.pricePerNight ?? a.price ?? 0,
    capacity: a.capacity ?? a.sleeps ?? 2,
    size: a.sqm || a.size || 45,
    view: a.view || "Mountain View",
    amenities: a.amenities || a.features || [],
    images: a.images || a.media || [],
    featured: a.rating ? a.rating >= 4.5 : false,
  });

  const cottageObj = cottage ? mapCottage(cottage as any) : null;

  React.useEffect(() => {
    if (!cottageObj) return;
    try {
      const title = `${cottageObj.name} — Luxury Resort Cottages & Wellness`;
      document.title = title;
      let desc = cottageObj.shortDescription || cottageObj.description || 'Luxury cottages, wellness and detox retreats in Jamshedpur, Jharkhand.';
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', desc);
    } catch {}
  }, [cottageObj]);

  if (loading) return <div className="text-center py-16">Loading cottage…</div>;
  if (!cottageObj) return <div className="text-center py-16 text-destructive">Cottage not found.</div>;

  return (
    <Layout>
      <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-[#f8f6f2] via-[#f3ede3] to-[#e9e3d1] py-16 px-2">
        <div className="w-full max-w-4xl mx-auto rounded-3xl bg-white/80 shadow-2xl flex flex-col md:flex-row overflow-hidden animate-fadein">
          <div className="md:w-1/2 flex items-center justify-center bg-gradient-to-br from-[#f5e9d6] to-[#f8f6f2] p-8">
            <OptimizedImage
              src={cottageObj.images && cottageObj.images.length > 0 ? cottageObj.images[0] : suiteImage}
              alt={cottageObj.name}
              className="w-full h-[340px] object-cover rounded-2xl shadow-xl transition-transform duration-700 hover:scale-105 animate-fadein"
              style={{ maxWidth: 420 }}
            />
          </div>
          <div className="md:w-1/2 flex flex-col justify-center p-8 gap-4">
            <h1 className="font-serif text-4xl font-bold mb-2 tracking-tight text-[#b08643] animate-fadein-slow">{cottageObj.name}</h1>
            <p className="text-lg text-gray-700 mb-2 animate-fadein-slow">{cottageObj.shortDescription}</p>
            <div className="flex flex-wrap items-center gap-4 mb-2 animate-fadein-slow">
              <span className="flex items-center gap-1 text-base text-gray-500"><Maximize className="h-5 w-5" /> {cottageObj.size} sqm</span>
              <span className="flex items-center gap-1 text-base text-gray-500"><Users className="h-5 w-5" /> {cottageObj.capacity} guests</span>
              <span className="flex items-center gap-1 text-base text-gray-500"><Eye className="h-5 w-5" /> {cottageObj.view}</span>
            </div>
            <div className="mb-4 animate-fadein-slow">
              <span className="font-serif text-3xl text-gradient-gold font-bold drop-shadow-glow">₹{cottageObj.price_per_night}</span>
              <span className="text-muted-foreground text-lg"> / night</span>
            </div>
            <div className="mt-4 animate-fadein-slow">
              <h2 className="font-serif text-xl mb-3 text-[#b08643] tracking-wide">Amenities</h2>
              <div className="flex flex-wrap gap-3">
                {cottageObj.amenities && cottageObj.amenities.length > 0 ? (
                  cottageObj.amenities.map((amenity: string) => {
                    const Icon = amenityIcons[amenity] || amenityIcons.default;
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f8f6f2] shadow-soft text-gray-700 text-base font-medium animate-fadein"
                        style={{ minWidth: 140 }}
                      >
                        <Icon className="h-5 w-5 text-[#b08643]" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground">No amenities listed.</span>
                )}
              </div>
            </div>
            <Button
              variant="luxury"
              size="lg"
              className="mt-6 px-8 py-3 text-lg shadow-glow hover:scale-105 transition-transform duration-300 animate-fadein-slow"
              onClick={() => {
                window.location.href = `/booking?cottage=${encodeURIComponent(cottageObj.id)}`;
              }}
            >
              Book This Cottage
            </Button>
          </div>
        </div>
      </section>
      <style>{`
        .text-gradient-gold {
          background: linear-gradient(90deg, #b08643 0%, #e5c990 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 2px 8px #e5c99088);
        }
        .shadow-glow {
          box-shadow: 0 4px 32px #e5c99033, 0 1.5px 8px #b0864340;
        }
        .animate-fadein {
          animation: fadein 1.1s cubic-bezier(.4,2,.3,1);
        }
        .animate-fadein-slow {
          animation: fadein 1.8s cubic-bezier(.4,2,.3,1);
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(32px) scale(0.98); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </Layout>
  );
};

export default CottageDetailPage;
