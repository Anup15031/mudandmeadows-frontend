import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCottages } from "@/hooks/useApi";
import OptimizedImage from "@/components/ui/OptimizedImage";

export function CottagesSection() {
  const { data: cottages, loading } = useCottages();
  const featuredCottages = (Array.isArray(cottages) ? cottages : []).slice(0, 3);

  return (
    <section className="section-padding bg-cream">
      <div className="container-padding max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
            Sanctuary Cottages
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">
            Curated Cottage Stays
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our unique cottages, each designed for comfort and harmony with nature.
          </p>
        </div>

        {/* Cottage Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featuredCottages.map((cottage: any, index: number) => (
            <Link
              key={cottage.id || cottage._id || index}
              to={`/cottages/${cottage.id || cottage._id}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <OptimizedImage
                src={cottage.images?.[0] || cottage.media?.[0] || ''}
                alt={cottage.title || cottage.name || 'Cottage'}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                fallbackQuery="cottage,room,resort"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-primary-foreground">
                <h3 className="font-serif text-2xl font-medium mb-3 group-hover:translate-x-2 transition-transform duration-300">
                  {cottage.title || cottage.name}
                </h3>
                <p className="text-sm opacity-90 leading-relaxed mb-4">
                  {cottage.description || 'A beautiful cottage stay.'}
                </p>
                <span className="text-xs tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/cottages">
            <Button variant="outline" size="lg">
              View All Cottages
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
