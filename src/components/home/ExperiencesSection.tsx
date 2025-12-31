

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { Bath, Leaf, HeartPulse } from "lucide-react";
import { useEffect, useState } from "react";

const ICONS = [Leaf, HeartPulse, Bath];

export function ExperiencesSection() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/programs/?tag=wellness")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch wellness programs");
        return res.json();
      })
      .then((data) => {
        // Support both {items: [...]} and array response
        const items = Array.isArray(data) ? data : (data.items || data.value || []);
        setPrograms(items.slice(0, 3));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unknown error");
        setLoading(false);
      });
  }, []);

  return (
    <section className="section-padding bg-cream">
      <div className="container-padding max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
            Transformative Journeys
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">
            Curated Wellness Experiences
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Immerse yourself in holistic healing traditions passed down through generations, 
            set against the majestic backdrop of the Himalayas.
          </p>
        </div>

        {/* Loading/Error State */}
        {loading && <div className="text-center py-12">Loading wellness experiences…</div>}
        {error && <div className="text-center py-12 text-destructive">{error}</div>}

        {/* Dynamic Experience Cards */}
        {!loading && !error && (
          <div className="flex flex-col gap-10 lg:gap-12">
            {programs.map((exp, index) => {
              const Icon = ICONS[index % ICONS.length];
              return (
                <Link
                  key={exp.id || exp.name || index}
                  to={`/programs/wellness/${encodeURIComponent(exp.id || exp.name)}`}
                  className="group flex flex-col lg:flex-row items-stretch bg-gradient-to-br from-cream to-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-cream/60"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="lg:w-1/3 w-full h-64 lg:h-auto relative">
                    <OptimizedImage
                      src={exp.images && exp.images.length > 0 ? exp.images[0] : undefined}
                      alt={exp.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      fallbackQuery="wellness,spa,yoga"
                    />
                  </div>
                  <div className="flex-1 p-8 flex flex-col justify-center bg-white/80">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                        <Icon size={28} />
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {exp.tag || exp.category || "Wellness"}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3 text-primary group-hover:translate-x-2 transition-transform duration-300">
                      {exp.name}
                    </h3>
                    <p className="text-base text-muted-foreground mb-4">
                      {exp.description}
                    </p>
                    <span className="text-xs tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                      Explore →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/programs/wellness">
            <Button variant="outline" size="lg">
              View All Programs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
