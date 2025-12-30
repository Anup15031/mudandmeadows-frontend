
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import yogaImage from "@/assets/yoga-wellness.jpg";
import spaImage from "@/assets/spa-treatment.jpg";
import ayurvedaImage from "@/assets/ayurveda-therapy.jpg";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { Bath, Leaf, HeartPulse } from "lucide-react";

const experiences = [
  {
    title: "Yoga & Meditation",
    description: "Transform your practice with sunrise sessions overlooking the Himalayas, guided by master practitioners.",
    image: yogaImage,
    link: "/programs/wellness?category=yoga",
    tag: "Mind & Body",
    Icon: Leaf
  },
  {
    title: "Ayurvedic Healing",
    description: "Experience authentic Panchakarma and personalized treatments from our team of Ayurvedic physicians.",
    image: ayurvedaImage,
    link: "/programs/wellness?category=ayurveda",
    tag: "Holistic Health",
    Icon: HeartPulse
  },
  {
    title: "Spa & Therapies",
    description: "Indulge in holistic treatments combining ancient healing arts with contemporary wellness practices.",
    image: spaImage,
    link: "/programs/wellness?category=spa",
    tag: "Relaxation",
    Icon: Bath
  }
];

export function ExperiencesSection() {
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

        {/* Redesigned Experience Cards */}
        <div className="flex flex-col gap-10 lg:gap-12">
          {experiences.map((exp, index) => {
            const Icon = exp.Icon;
            return (
              <Link
                key={exp.title}
                to={exp.link}
                className="group flex flex-col lg:flex-row items-stretch bg-gradient-to-br from-cream to-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-cream/60"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="lg:w-1/3 w-full h-64 lg:h-auto relative">
                  <OptimizedImage
                    src={exp.image}
                    alt={exp.title}
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
                      {exp.tag}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3 text-primary group-hover:translate-x-2 transition-transform duration-300">
                    {exp.title}
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
