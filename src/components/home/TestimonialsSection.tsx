import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const VISIBLE_COUNT = 3;

export function TestimonialsSection({
  reviews = [],
  loading = false,
}: {
  reviews?: any[];
  loading?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (reviews.length <= VISIBLE_COUNT) return;
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + VISIBLE_COUNT) % reviews.length);
    }, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reviews.length]);

  if (loading) {
    return (
      <div className="text-center py-12 text-lg font-serif">
        Loading guest experiences...
      </div>
    );
  }
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 text-lg font-serif">No reviews yet.</div>
    );
  }

  // Carousel logic
  const total = reviews.length;
  const start = index;
  const end =
    index + VISIBLE_COUNT > total ? total : index + VISIBLE_COUNT;
  const visibleReviews =
    end > total
      ? [...reviews.slice(start, total), ...reviews.slice(0, end - total)]
      : reviews.slice(start, end);

  function handlePrev() {
    setIndex((prev) => (prev - VISIBLE_COUNT + total) % total);
  }
  function handleNext() {
    setIndex((prev) => (prev + VISIBLE_COUNT) % total);
  }

  // Map API fields to display fields
  function getDisplayName(r: any) {
    return r.name || r.reviewer || "Anonymous";
  }
  function getDisplayReview(r: any) {
    return r.review || r.comment || "";
  }
  function getDisplayRating(r: any) {
    return r.rating || 5;
  }
  function getDisplayDate(r: any) {
    if (r.date) {
      try {
        return new Date(r.date).toLocaleDateString();
      } catch {
        return "";
      }
    }
    return "";
  }

  return (
    <section className="py-16 bg-gradient-to-b from-[#f8f6f2] to-[#f3ede2]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="text-xs tracking-widest text-[#bfa14a] mb-2 font-semibold">
            FROM OUR GUESTS
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-[#7b5e2e]">
            Stories of transformations...
          </h2>
        </div>
        <div className="relative flex items-center justify-center">
          {/* Left Arrow */}
          {total > VISIBLE_COUNT && (
            <button
              className="absolute left-0 z-10 bg-white/70 hover:bg-[#e7e1d1] rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition border border-[#e7e1d1]"
              onClick={handlePrev}
              aria-label="Previous"
              style={{ top: "50%", transform: "translateY(-50%)" }}
            >
              <span className="text-[#bfa14a] text-2xl">&#8249;</span>
            </button>
          )}
          {/* Testimonials */}
          <AnimatePresence initial={false}>
            <motion.div
              key={index}
              className="flex gap-12 justify-center w-full"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.7, type: "spring" }}
            >
              {visibleReviews.map((r, i) => (
                <div
                  key={r.id || i}
                  className="flex-1 bg-white rounded-[2.5rem] shadow-2xl border border-[#e7e1d1] p-10 mx-2 flex flex-col items-center justify-between min-w-[260px] max-w-[370px] relative overflow-hidden"
                  style={{
                    boxShadow: "0 8px 32px #e6d7b6, 0 2px 8px #fff6e0",
                  }}
                >
                  {/* Decorative gradient circle */}
                  <div className="absolute -top-16 -left-16 w-40 h-40 bg-gradient-to-br from-[#f7e9c6] to-[#fff] rounded-full opacity-40 pointer-events-none" />
                  <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-gradient-to-tl from-[#f7e9c6] to-[#fff] rounded-full opacity-30 pointer-events-none" />
                  <div className="absolute left-6 top-6 text-4xl text-[#e7d7b6] font-serif select-none">
                    “
                  </div>
                  <div className="flex justify-center mb-2 mt-2">
                    {Array.from({ length: getDisplayRating(r) }).map((_, idx) => (
                      <span key={idx} className="text-yellow-500 text-xl">
                        &#9733;
                      </span>
                    ))}
                  </div>
                  <div className="text-lg md:text-xl font-serif text-[#3c2e1e] text-center mb-4 leading-snug px-2 font-medium drop-shadow-sm">
                    {getDisplayReview(r) || (
                      <span className="text-gray-300 italic">No review text</span>
                    )}
                  </div>
                  <div className="absolute right-6 bottom-6 text-4xl text-[#e7d7b6] font-serif select-none">
                    ”
                  </div>
                  <div className="mt-8 text-center">
                    <div className="font-bold text-base md:text-lg text-[#7b5e2e] tracking-wide uppercase">
                      {getDisplayName(r)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {getDisplayDate(r)}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
          {/* Right Arrow */}
          {total > VISIBLE_COUNT && (
            <button
              className="absolute right-0 z-10 bg-white/70 hover:bg-[#e7e1d1] rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition border border-[#e7e1d1]"
              onClick={handleNext}
              aria-label="Next"
              style={{ top: "50%", transform: "translateY(-50%)" }}
            >
              <span className="text-[#bfa14a] text-2xl">&#8250;</span>
            </button>
          )}
        </div>
        {/* Dots */}
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: Math.ceil(total / VISIBLE_COUNT) }).map((_, i) => (
            <button
              key={i}
              className={`w-3 h-3 rounded-full border-2 border-[#bfa14a] transition ${
                index / VISIBLE_COUNT === i ? "bg-[#bfa14a]" : "bg-white"
              }`}
              onClick={() => setIndex(i * VISIBLE_COUNT)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
