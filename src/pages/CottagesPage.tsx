import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Users, Maximize, Eye, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import suiteImage from "@/assets/luxury-suite.jpg";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useCottages } from "@/hooks/useApi";
import CottageDetailModal from "@/components/cottages/CottageDetailModal";

const CottagesPage = () => {
  const [openCottageId, setOpenCottageId] = useState<string | null>(null);
  const { data: cottages, loading, error, refetch } = useCottages();
  const navigate = useNavigate();

  return (
    <Layout>
      <section className="section-padding bg-background">
        <div className="container-padding max-w-7xl mx-auto">
          <h1 className="font-serif text-4xl font-medium mb-8">All Cottages</h1>
          {loading && <div>Loading cottages...</div>}
          {error && <div className="text-red-600">Error loading cottages.</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(cottages || []).map((cottage: any) => (
              <div key={cottage.id} className="group rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow bg-card">
                <div className="aspect-[4/3] bg-muted">
                  <OptimizedImage
                    src={cottage.images?.[0] || suiteImage}
                    alt={cottage.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h2 className="font-serif text-2xl font-medium mb-2">{cottage.name}</h2>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{cottage.description}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-lg text-primary">₹{cottage.price_per_night} <span className="text-xs">/ night</span></span>
                    <span className="flex items-center gap-1 text-xs opacity-70"><Users className="h-4 w-4" /> {cottage.capacity} guests</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setOpenCottageId(cottage.id)}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {openCottageId && (
            <CottageDetailModal
              id={openCottageId}
              onClose={() => setOpenCottageId(null)}
              onBook={(id, extraBedId, extraBedQty, adults, children) => {
                // SPA navigation to booking with pre-selected cottage, guests, and optional extra bed
                const params = new URLSearchParams();
                params.set('cottage', String(id));
                if (extraBedId) {
                  params.set('extraBedId', String(extraBedId));
                  params.set('extraBedQty', String(extraBedQty || 1));
                }
                if (typeof adults !== 'undefined') params.set('adults', String(adults));
                if (typeof children !== 'undefined') params.set('children', String(children));
                const q = `?${params.toString()}`;
                navigate(`/booking${q}`);
              }}
            />
          )}
        </div>
      </section>
    </Layout>
  );
};

export default CottagesPage;
