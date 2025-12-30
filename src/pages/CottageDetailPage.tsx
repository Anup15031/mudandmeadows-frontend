import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
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
      <section className="relative pt-24 pb-12 bg-warm">
        <div className="container-padding max-w-5xl mx-auto">
          <Button variant="outline" size="sm" className="mb-4" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Cottages
          </Button>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <OptimizedImage
                src={cottageObj.images && cottageObj.images.length > 0 ? cottageObj.images[0] : suiteImage}
                alt={cottageObj.name}
                className="w-full h-auto rounded-lg shadow"
              />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-medium mb-2">{cottageObj.name}</h1>
              <p className="text-muted-foreground mb-4">{cottageObj.shortDescription}</p>
              <div className="flex items-center gap-4 mb-4">
                <span className="flex items-center gap-1 text-sm"><Maximize className="h-4 w-4" /> {cottageObj.size} sqm</span>
                <span className="flex items-center gap-1 text-sm"><Users className="h-4 w-4" /> {cottageObj.capacity} guests</span>
                <span className="flex items-center gap-1 text-sm"><Eye className="h-4 w-4" /> {cottageObj.view}</span>
              </div>
              <div className="mb-4">
                <span className="font-serif text-2xl text-primary">₹{cottageObj.price_per_night}</span>
                <span className="text-muted-foreground text-sm"> / night</span>
              </div>
              <Button variant="luxury" size="lg" onClick={() => {
                // Go to booking page with this cottage pre-selected
                window.location.href = `/booking?cottage=${encodeURIComponent(cottageObj.id)}`;
              }}>
                Book This Cottage
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="container-padding max-w-5xl mx-auto py-8">
        <h2 className="font-serif text-2xl mb-4">Amenities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cottageObj.amenities && cottageObj.amenities.length > 0 ? (
            cottageObj.amenities.map((amenity: string) => {
              const Icon = amenityIcons[amenity] || amenityIcons.default;
              return (
                <div key={amenity} className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-5 w-5" />
                  <span>{amenity}</span>
                </div>
              );
            })
          ) : (
            <span className="text-muted-foreground">No amenities listed.</span>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default CottageDetailPage;
