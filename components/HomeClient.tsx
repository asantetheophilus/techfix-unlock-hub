"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Cpu,
  Lock,
  Zap,
  CheckCircle,
  Clock,
  ArrowRight,
  Shield,
  Search,
  Star,
  Plus,
  Minus,
  Tv as TvIcon,
} from "lucide-react";

interface IServiceItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  estimatedTime: string;
  features: string[];
  cat?: string;
}

interface IReviewItem {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  serviceId?: any;
}

interface HomeClientProps {
  services: IServiceItem[];
  reviews: IReviewItem[];
}

export default function HomeClient({ services, reviews }: HomeClientProps) {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Welcome Text-to-Speech voice greeting (Artistic SpeechSynthesis)
  useEffect(() => {
    // Separate phone digits with spaces so the browser reads them out digit-by-digit
    const greetingText = "You are welcome to Future Tech Website where you can get all your solution from and you can contact him on 0 5 5 7 1 8 5 3 5 5.";

    const speakGreeting = () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        // Cancel any active speech to avoid overlaps
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(greetingText);
        utterance.rate = 0.92; // Slightly slower for warm clear Ghanaian comprehension
        utterance.pitch = 1.05; 
        
        // Pick English female/standard voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) => 
            v.lang.startsWith("en-US") || 
            v.lang.startsWith("en-GB") || 
            v.name.includes("Google") ||
            v.name.includes("Natural")
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        window.speechSynthesis.speak(utterance);
      }
    };

    // Try speaking immediately on load
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (window.speechSynthesis.getVoices().length > 0) {
        speakGreeting();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          speakGreeting();
        };
      }
    }

    // Because browsers block autoplay audio until user interaction, 
    // we also bind a one-time click listener to the window so if the first try was blocked, 
    // it plays immediately when the user first clicks anywhere on the site!
    const handleFirstClick = () => {
      speakGreeting();
      window.removeEventListener("click", handleFirstClick);
    };

    window.addEventListener("click", handleFirstClick);
    return () => {
      window.removeEventListener("click", handleFirstClick);
    };
  }, []);

  // Fallbacks if DB is empty
  const displayServices = services.length > 0 ? services : [
    {
      _id: "1",
      name: "Screen Replacement",
      slug: "screen-replacement",
      description: "Premium original display screen replacements for all major phone brands. Restore crystal clear colors and smooth touch response instantly.",
      price: 250,
      estimatedTime: "1 - 2 Hours",
      features: ["Original OEM screen panels", "Lifetime warranty on touch", "Free frame sealing"],
    },
    {
      _id: "2",
      name: "Battery Replacement",
      slug: "battery-replacement",
      description: "Replace your swollen or rapidly draining phone battery with a certified high-capacity original battery. Fix charging errors.",
      price: 150,
      estimatedTime: "30 - 45 Mins",
      features: ["Grade A high capacity cells", "Overheating protection built-in", "Battery health active"],
    },
    {
      _id: "3",
      name: "Android Unlocking",
      slug: "android-unlocking",
      description: "Remove network locks, region locks, and carrier restrictions from any Android device. Use any local Ghanaian SIM.",
      price: 120,
      estimatedTime: "1 - 3 Hours",
      features: ["Official permanent unlock", "No root or data loss required", "Global carrier compatible"],
    },
    {
      _id: "4",
      name: "iPhone Unlocking",
      slug: "iphone-unlocking",
      description: "Permanent official IMEI factory unlock for iPhones locked to foreign networks. Get full cellular freedom immediately.",
      price: 320,
      estimatedTime: "1 - 2 Days",
      features: ["Official Apple whitelisting", "Keeps factory warranty valid", "Supports all models"],
    },
    {
      _id: "5",
      name: "FRP Bypass",
      slug: "frp-bypass",
      description: "Bypass Google Account Verification (FRP) and Samsung Account Lock on any factory reset Android device. Regain access.",
      price: 80,
      estimatedTime: "30 - 60 Mins",
      features: ["Latest Android patches supported", "Instant Google account login", "Safe firmware-safe process"],
    },
    {
      _id: "6",
      name: "Software Flashing",
      slug: "software-flashing",
      description: "Fix bootloops, system errors, hangs, bricked devices, and virus issues by flashing certified official stock firmware.",
      price: 100,
      estimatedTime: "1 - 2 Hours",
      features: ["Official stock ROM flashing", "Solves constant rebooting", "Hardware optimization check"],
    },
  ];

  const fallbackTvServices = [
    {
      _id: "tv1",
      name: "DStv Installation & Setup",
      slug: "dstv-installation",
      description: "Complete professional dish alignment, LNB configuration, and Multi-TV setups for DStv decoders. Clear channels assured.",
      price: 250,
      estimatedTime: "2 - 3 Hours",
      features: ["Signal alignment certification", "Free 15m premium coaxial cable", "Multi-room configuration support"],
    },
    {
      _id: "tv2",
      name: "GOtv Installation & Activation",
      slug: "gotv-installation",
      description: "Quick GOtenna pole mount setup, decoder activation, and subscription check for maximum crisp local and international coverage.",
      price: 150,
      estimatedTime: "1 - 2 Hours",
      features: ["Signal amplification tuning", "GOtenna mount brackets included", "Full channel check list"],
    },
    {
      _id: "tv3",
      name: "Satellite Dish Alignment & Repair",
      slug: "dish-alignment",
      description: "Experiencing signal loss or bad weather shifting? Our experts use advanced spectrum tools to align dish and LNB perfectly.",
      price: 100,
      estimatedTime: "1 Hour",
      features: ["Perfect H/V polarization set", "Corroded F-connector replacement", "Rain shield protection advice"],
    },
  ];

  // Partition phone and TV installation services
  const phoneServices = displayServices.filter((s) => s.cat !== "installation");
  const tvServices = services.filter((s) => s.cat === "installation").length > 0
    ? services.filter((s) => s.cat === "installation")
    : fallbackTvServices;

  const displayReviews = reviews.length > 0 ? reviews : [
    {
      _id: "1",
      name: "Abena Mansah",
      rating: 5,
      comment: "Excellent repair service! They replaced my cracked Tecno screen in just an hour. Truly glassmorphic finish and amazing customer service in Dormaa.",
    },
    {
      _id: "2",
      name: "Kwame Boateng",
      rating: 5,
      comment: "Unlocked my network-locked Samsung from US so I could use MTN. The bypass was fast, took less than an hour. GHS 120 well spent!",
    },
    {
      _id: "3",
      name: "Sampson Yeboah",
      rating: 5,
      comment: "Highly recommended. Locked out of my phone after format. They bypassed the google lock instantly. Fast and affordable.",
    },
  ];

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    let formattedId = trackingId.trim();
    if (!formattedId.toUpperCase().startsWith("TFU-")) {
      formattedId = `TFU-${formattedId}`;
    }
    router.push(`/track/${formattedId.toUpperCase()}`);
  };

  const faqs = [
    {
      q: "Where is TechFix Unlock Hub located?",
      a: "We are located along the Wamanafo main road to Dormaa, Ghana. You can visit our lab during our working hours (8:00 AM - 6:00 PM).",
    },
    {
      q: "What payment systems do you accept?",
      a: "We support cash on delivery, local cash at our lab, or direct mobile money transfers during repair collection or after TV installation visits.",
    },
    {
      q: "Is my personal data safe during repairs?",
      a: "Yes. For hardware repairs (like screen and battery replacements), your phone data remains 100% untouched. For software flashing, some procedures require factory resetting, which we will always explain and seek your consent for beforehand.",
    },
    {
      q: "How does the live repair tracking work?",
      a: "Once you submit a booking, the system generates a unique Tracking ID (e.g., TFU-XXXXXX) and emails you confirmation. As our technicians update the status (e.g., Diagnosing, Repairing, Completed) from the admin panel, you can view the live progress history online instantly.",
    },
  ];

  return (
    <div className="relative animate-fade-in">
      {/* Animated background meshes */}
      <div className="bg-mesh-morph" />
      {/* HERO SECTION */}
      <section className="relative px-4 pt-24 pb-20 sm:px-6 lg:px-8 overflow-hidden">
        {/* Floating Neon Blobs */}
        <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-brand-cyan/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-brand-mint/10 blur-[120px] animate-pulse-slow" />

        {/* Artistic Modern Watermark Backdrop */}
        <div 
          className="absolute right-0 bottom-0 top-0 w-full md:w-[45%] -z-10 opacity-[0.07] md:opacity-[0.11] pointer-events-none mix-blend-luminosity grayscale select-none"
          style={{
            backgroundImage: "url('/watermark.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 20%",
            maskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%), linear-gradient(to top, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%), linear-gradient(to top, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />

        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy border border-brand-cyan/35 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-cyan shadow-neon">
              <Zap className="h-3.5 w-3.5" /> Dormaa's Leading Smartphone Lab
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 font-syne text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight"
          >
            Instant Phone Repair & <br />
            <span className="bg-gradient-to-r from-brand-cyan to-brand-mint bg-clip-text text-transparent text-neon">
              Official Network Unlocking
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed"
          >
            Experiencing a broken screen, bloated battery, network carrier lock, or Google FRP lock? Book a premium, certified repair session online today. Pay securely with Mobile Money.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link href="/book" className="neon-btn-primary font-bold text-base px-8 py-4">
              Book a Repair <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#tracker" className="neon-btn-secondary font-bold text-base px-8 py-4">
              Track Repair Progress
            </a>
          </motion.div>

          {/* Core metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mx-auto mt-16 max-w-4xl grid grid-cols-3 gap-4 border-t border-white/5 pt-10 text-center"
          >
            <div>
              <p className="font-syne text-3xl font-extrabold text-brand-cyan text-neon">5,000+</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 uppercase tracking-wide">Devices Fixed</p>
            </div>
            <div>
              <p className="font-syne text-3xl font-extrabold text-brand-mint text-neon-mint">99.4%</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 uppercase tracking-wide">Success Rate</p>
            </div>
            <div>
              <p className="font-syne text-3xl font-extrabold text-white">45 Mins</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 uppercase tracking-wide">Avg. Repair Time</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRACKER CTA SECTION */}
      <section id="tracker" className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="glass-card p-8 md:p-10 border border-brand-cyan/20 bg-brand-navy/35 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-5 pointer-events-none" />
            
            <div className="relative text-center max-w-2xl mx-auto space-y-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy border border-brand-cyan/30 text-brand-cyan shadow-neon">
                <Search className="h-6 w-6" />
              </div>
              <h2 className="font-syne text-2xl md:text-3xl font-bold text-white">
                Live Repair Status Tracker
              </h2>
              <p className="text-sm text-slate-300">
                Have a device currently in our lab? Enter your unique booking Tracking ID (e.g. <span className="text-brand-mint font-semibold">TFU-928135</span>) to check its diagnostics phase in real-time.
              </p>

              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3 mt-4">
                <input
                  type="text"
                  placeholder="Enter Tracking ID (e.g. TFU-XXXXXX)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="flex-grow rounded-xl bg-brand-dark/90 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-all duration-300"
                />
                <button type="submit" className="neon-btn-primary py-3 px-6 rounded-xl font-bold shrink-0">
                  Track Device
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section id="services" className="px-4 py-20 sm:px-6 lg:px-8 mx-auto max-w-7xl space-y-24">
        {/* PHONE REPAIR SECTION */}
        <div className="space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-syne text-xs font-bold uppercase tracking-wider text-brand-mint">
              Smartphone Specialties
            </span>
            <h2 className="font-syne text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
              Certified Device Repair & Unlock
            </h2>
            <p className="text-base text-slate-400 leading-relaxed">
              All phone models repaired using factory-original parts. Official network whitelisting and bypasses certified firmware-safe.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {phoneServices.map((service, index) => {
              const Icon = index % 3 === 0 ? Smartphone : index % 3 === 1 ? Cpu : Lock;
              return (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border-beam-card p-6 flex flex-col justify-between h-full group hover:shadow-neon transition-all duration-300"
                >
                  <div className="space-y-6">
                    {/* Category icon */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy border border-brand-cyan/15 text-brand-cyan group-hover:border-brand-cyan/40 group-hover:text-brand-cyan transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div>
                      <h3 className="font-syne text-xl font-bold text-white group-hover:text-brand-cyan transition-colors duration-300">
                        {service.name}
                      </h3>
                      <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <ul className="space-y-2 border-t border-white/5 pt-4">
                      {service.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle className="h-3.5 w-3.5 text-brand-mint" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 uppercase block font-semibold tracking-wide">Starting from</span>
                      <span className="text-lg font-extrabold text-brand-mint">GHS {service.price.toFixed(2)}</span>
                    </div>
                    
                    <Link
                      href={`/services/${service.slug}`}
                      className="flex items-center gap-1.5 text-sm font-semibold text-brand-cyan hover:text-brand-mint transition-colors group-hover:translate-x-0.5 duration-300"
                    >
                      View Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* TV INSTALLATION SECTION */}
        <div className="space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-syne text-xs font-bold uppercase tracking-wider text-brand-cyan">
              Home Entertainment & TV Installation
            </span>
            <h2 className="font-syne text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
              Digital TV & Satellite Setup
            </h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Professional dish alignments, Multi-TV setup, and high-fidelity installation of DStv, GOtv, and Startimes systems in Dormaa.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tvServices.map((service, index) => {
              return (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border-beam-card border-beam-card-active p-6 flex flex-col justify-between h-full group hover:shadow-neon-mint transition-all duration-300"
                >
                  <div className="space-y-6">
                    {/* Category icon */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy border border-brand-cyan/20 text-brand-cyan group-hover:border-brand-cyan/50 group-hover:text-brand-cyan transition-all duration-300 shadow-neon">
                      <TvIcon className="h-6 w-6" />
                    </div>
                    
                    <div>
                      <h3 className="font-syne text-xl font-bold text-white group-hover:text-brand-cyan transition-colors duration-300">
                        {service.name}
                      </h3>
                      <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <ul className="space-y-2 border-t border-white/5 pt-4">
                      {service.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle className="h-3.5 w-3.5 text-brand-cyan" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 uppercase block font-semibold tracking-wide">Standard Rate</span>
                      <span className="text-lg font-extrabold text-brand-cyan">GHS {service.price.toFixed(2)}</span>
                    </div>
                    
                    <Link
                      href={`/services/${service.slug}`}
                      className="flex items-center gap-1.5 text-sm font-semibold text-brand-cyan hover:text-brand-mint transition-colors group-hover:translate-x-0.5 duration-300"
                    >
                      Book Setup <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS TIMELINE */}
      <section className="px-4 py-20 bg-brand-navy/15 relative overflow-hidden sm:px-6 lg:px-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-96 w-96 rounded-full bg-brand-cyan/5 blur-[150px]" />
        
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="font-syne text-xs font-bold uppercase tracking-wider text-brand-cyan">
              Customer Journey
            </span>
            <h2 className="font-syne text-3xl font-extrabold text-white sm:text-4xl">
              How TechFix Works
            </h2>
            <p className="text-sm text-slate-400">
              Four streamlined steps to completely restore or unlock your mobile device.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 relative">
            {/* Horizontal line on desktops */}
            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-[1px] bg-gradient-to-r from-brand-cyan/20 via-brand-mint/20 to-brand-cyan/20 -z-10" />
            
            {[
              { step: "01", name: "Select Service", desc: "Browse specialties, read instant upfront pricing, and trigger repair booking wizard." },
              { step: "02", name: "Submit Device", desc: "Give brand details, serial IMEI (optional), issue report, and upload snaps." },
              { step: "03", name: "Schedule & Pay", desc: "Select time slots, input promo code, and checkout securely with Mobile Money." },
              { step: "04", name: "Track & Retrieve", desc: "Monitor live technician reports online and pick up immediately once finished." },
            ].map((step, idx) => (
              <div key={idx} className="glass-card p-6 border-white/5 bg-brand-dark/40 relative">
                <div className="flex items-center justify-between">
                  <span className="font-syne text-4xl font-extrabold bg-gradient-to-tr from-brand-cyan to-brand-mint bg-clip-text text-transparent text-neon select-none">
                    {step.step}
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-brand-navy flex items-center justify-center text-xs font-bold text-slate-400">
                    Step
                  </div>
                </div>
                <h3 className="font-syne text-lg font-bold text-white mt-6">
                  {step.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="font-syne text-xs font-bold uppercase tracking-wider text-brand-mint">
            Verified Reviews
          </span>
          <h2 className="font-syne text-3xl font-extrabold text-white sm:text-4xl">
            Trusted by People in Dormaa
          </h2>
          <p className="text-sm text-slate-400">
            Real customer reviews logged from real verified repair orders in the Bono Region.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {displayReviews.map((rev) => (
            <div key={rev._id} className="glass-card p-6 flex flex-col justify-between bg-brand-navy/10 border-white/5">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < rev.rating ? "text-brand-mint fill-brand-mint" : "text-slate-600"}`} />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-brand-navy border border-brand-cyan/25 flex items-center justify-center text-xs font-bold text-brand-cyan">
                  {rev.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{rev.name}</h4>
                  <span className="text-[10px] text-brand-mint font-semibold uppercase tracking-wider">Verified Client</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="px-4 py-20 bg-brand-navy/15 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center space-y-4 mb-16">
            <span className="font-syne text-xs font-bold uppercase tracking-wider text-brand-cyan">
              Have Questions?
            </span>
            <h2 className="font-syne text-3xl font-extrabold text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isActive = activeFaq === index;
              return (
                <div
                  key={index}
                  className="glass-card overflow-hidden border-white/5 bg-brand-dark/45"
                >
                  <button
                    onClick={() => setActiveFaq(isActive ? null : index)}
                    className="flex w-full items-center justify-between p-6 text-left transition-colors duration-300 hover:bg-white/5"
                  >
                    <span className="font-syne text-base font-semibold text-white">
                      {faq.q}
                    </span>
                    <div className="ml-4 shrink-0 rounded-lg bg-brand-navy p-1.5 text-brand-cyan border border-brand-cyan/15">
                      {isActive ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="border-t border-white/5 px-6 py-5 text-sm text-slate-300 leading-relaxed bg-brand-navy/10">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
