
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { Button } from "@/components/ui/button";

export default function ProgramWellnessDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/programs/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch program details");
        return res.json();
      })
      .then((data) => {
        setProgram(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unknown error");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Layout><div className="container-padding py-12">Loading program details…</div></Layout>;
  if (error) return <Layout><div className="container-padding py-12 text-destructive">{error}</div></Layout>;
  if (!program) return <Layout><div className="container-padding py-12">Program not found.</div></Layout>;

  return (
    <Layout>
      <Helmet>
        <title>{program.name} | Wellness Program | Resort</title>
        <meta name="description" content={program.description} />
        <meta name="keywords" content={`wellness, ${program.name}, ${program.tag || program.category || "program"}, resort, health, ayurveda, yoga`} />
        <link rel="canonical" href={`https://yourdomain.com/programs/wellness/${program.id || id}`} />
        {/* Open Graph tags */}
        <meta property="og:title" content={program.name + " | Wellness Program"} />
        <meta property="og:description" content={program.description} />
        {program.images && program.images.length > 0 && (
          <meta property="og:image" content={program.images[0]} />
        )}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://yourdomain.com/programs/wellness/${program.id || id}`} />
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": program.name,
            "description": program.description,
            "provider": {
              "@type": "Organization",
              "name": "Luxury Resort"
            },
            "image": program.images && program.images.length > 0 ? program.images[0] : undefined,
            "offers": {
              "@type": "Offer",
              "price": program.price,
              "priceCurrency": "USD"
            },
            "aggregateRating": program.rating ? {
              "@type": "AggregateRating",
              "ratingValue": program.rating,
              "bestRating": 5
            } : undefined
          })}
        </script>
      </Helmet>
      <main className="container-padding py-12 max-w-5xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
            {program.tag || program.category || "Wellness"}
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-10 bg-white/90 rounded-2xl shadow-elegant p-8 md:p-12 border border-cream/60">
          <div className="md:w-2/5 w-full flex-shrink-0 flex flex-col items-center justify-center">
            <OptimizedImage
              src={program.images && program.images.length > 0 ? program.images[0] : undefined}
              alt={program.name}
              className="w-full h-64 object-cover rounded-xl shadow-soft mb-6 border border-cream"
              fallbackQuery={program.name}
            />
            <Button
              variant="luxury"
              size="lg"
              className="w-full mt-2 font-serif text-lg tracking-wide shadow-elegant"
              onClick={() => navigate(`/booking?program=${encodeURIComponent(program.id || program.name)}`)}
            >
              Book This Program
            </Button>
          </div>
          <div className="md:w-3/5 w-full flex flex-col justify-center">
            <h1 className="font-serif text-4xl font-bold mb-4 text-primary leading-tight">{program.name}</h1>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{program.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <span className="block font-medium text-sm text-muted-foreground mb-1">Duration</span>
                <span className="font-serif text-lg">{program.duration_minutes || program.duration || "-"} mins</span>
              </div>
              <div>
                <span className="block font-medium text-sm text-muted-foreground mb-1">Days</span>
                <span className="font-serif text-lg">{program.days || "-"}</span>
              </div>
              <div>
                <span className="block font-medium text-sm text-muted-foreground mb-1">Price</span>
                <span className="font-serif text-lg">{typeof program.price !== 'undefined' ? `$${program.price}` : "-"}</span>
              </div>
              {program.rating && (
                <div>
                  <span className="block font-medium text-sm text-muted-foreground mb-1">Rating</span>
                  <span className="font-serif text-lg">{program.rating} / 5</span>
                </div>
              )}
            </div>
            {program.benefits && program.benefits.length > 0 && (
              <div className="mb-6">
                <span className="font-medium text-base text-primary">Benefits</span>
                <ul className="list-disc ml-6 mt-2 text-base text-muted-foreground">
                  {program.benefits.map((b: string, i: number) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            )}
            {program.inclusions && program.inclusions.length > 0 && (
              <div className="mb-6">
                <span className="font-medium text-base text-primary">Inclusions</span>
                <ul className="list-disc ml-6 mt-2 text-base text-muted-foreground">
                  {program.inclusions.map((inc: string, i: number) => <li key={i}>{inc}</li>)}
                </ul>
              </div>
            )}
            {program.diet && (
              <div className="mb-6">
                <span className="font-medium text-base text-primary">Diet</span>
                <div className="text-base mt-2 text-muted-foreground">
                  <span className="font-semibold">{program.diet.type}</span>: {program.diet.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
