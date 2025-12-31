import React, { Suspense, useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import ErrorBoundary from "@/components/ErrorBoundary";
import { apiClient } from "@/lib/api-client";

// Lazy-load sections to catch module-level import errors and show visible fallbacks
const HeroSection = React.lazy(() => import("@/components/home/HeroSection").then(mod => ({ default: mod.HeroSection })));
const ExperiencesSection = React.lazy(() => import("@/components/home/ExperiencesSection").then(mod => ({ default: mod.ExperiencesSection })));
const CottagesSection = React.lazy(() => import("@/components/home/CottagesSection").then(mod => ({ default: mod.CottagesSection })));
const AboutSection = React.lazy(() => import("@/components/home/AboutSection").then(mod => ({ default: mod.AboutSection })));
const SeasonalOfferSection = React.lazy(() => import("@/components/home/SeasonalOfferSection").then(mod => ({ default: mod.SeasonalOfferSection })));
const TestimonialsSection = React.lazy(() => import("@/components/home/TestimonialsSection").then(mod => ({ default: mod.TestimonialsSection })));

/**
 * Wrapped with ErrorBoundary so individual section failures
 * are shown inline and won't crash the entire page.
 */
const Index = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setReviewsLoading(true);
    apiClient.getReviews()
      .then((data) => {
        if (mounted) setReviews(data);
      })
      .catch(() => {
        if (mounted) setReviews([]);
      })
      .finally(() => {
        if (mounted) setReviewsLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>Mud & Meadows – The Earthbound Sanctuary | Luxury Wellness Resort & Spa</title>
        <meta
          name="description"
          content="Experience transformative wellness at Mud & Meadows – The Earthbound Sanctuary. Award-winning holistic wellness, organic treatments, and luxury accommodations."
        />
      </Helmet>

      <Suspense fallback={<div style={{padding:20}}>Loading Hero...</div>}>
        <ErrorBoundary name="HeroSection">
          <HeroSection />
        </ErrorBoundary>
      </Suspense>

      {/* RoomsSection removed as requested */}

      <Suspense fallback={<div style={{padding:20}}>Loading Cottages...</div>}>
        <ErrorBoundary name="CottagesSection">
          <CottagesSection />
        </ErrorBoundary>
      </Suspense>
      <Suspense fallback={<div style={{padding:20}}>Loading Experiences...</div>}>
        <ErrorBoundary name="ExperiencesSection">
          <ExperiencesSection />
        </ErrorBoundary>
      </Suspense>


      {/* RoomsSection removed as requested */}

      <Suspense fallback={<div style={{padding:20}}>Loading About...</div>}>
        <ErrorBoundary name="AboutSection">
          <AboutSection />
        </ErrorBoundary>
      </Suspense>

      <Suspense fallback={<div style={{padding:20}}>Loading Seasonal Offer...</div>}>
        <ErrorBoundary name="SeasonalOfferSection">
          <SeasonalOfferSection />
        </ErrorBoundary>
      </Suspense>

      <Suspense fallback={<div style={{padding:20}}>Loading Testimonials...</div>}>
        <ErrorBoundary name="TestimonialsSection">
          <TestimonialsSection reviews={reviews} loading={reviewsLoading} />
        </ErrorBoundary>
      </Suspense>
    </Layout>
  );
};

export default Index;
