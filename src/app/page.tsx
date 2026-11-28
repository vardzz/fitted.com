import React from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import FeatureSection from "@/components/landing/FeatureSection";
import BannerSection from "@/components/landing/BannerSection";
import FeedbackSection from "@/components/landing/FeedbackSection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="landing-viewport">
      <Navbar />
      <main style={{ flex: 1 }}>
        <HeroSection />
        <ProblemSection />
        <FeatureSection />
        <BannerSection />
        <FeedbackSection />
      </main>
      <Footer />
    </div>
  );
}
