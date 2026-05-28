import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Service from "@/models/Service";
import {
  Smartphone,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { Metadata } from "next";

// Disable cache for fresh page rendering
export const revalidate = 0;

interface PageProps {
  params: {
    slug: string;
  };
}

// 7 Services fallback dictionary
const STATIC_SERVICES: Record<string, any> = {
  "screen-replacement": {
    name: "Screen Replacement",
    description: "Premium original display screen replacements for all major phone brands. Restore crystal clear colors and smooth touch response instantly.",
    price: 250.0,
    estimatedTime: "1 - 2 Hours",
    category: "repair",
    image: "https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?q=80&w=600&auto=format&fit=crop",
    features: [
      "Original OEM screen panels",
      "TrueTone recovery supported",
      "Lifetime touch responsiveness warranty",
      "Free dust cleaning & frame sealing",
    ],
    faqs: [
      {
        question: "How long does a screen replacement take?",
        answer: "Most screen replacements take between 45 minutes to 2 hours depending on the brand and model.",
      },
      {
        question: "Will my data be safe?",
        answer: "Yes. Screen replacement does not affect your internal memory. However, we always recommend making a backup if possible.",
      },
    ],
  },
  "battery-replacement": {
    name: "Battery Replacement",
    description: "Replace your swollen or rapidly draining phone battery with a certified high-capacity original battery. Fix charging errors and restore all-day battery life.",
    price: 150.0,
    estimatedTime: "30 - 45 Mins",
    category: "repair",
    image: "https://images.unsplash.com/photo-1601524909162-be87252be298?q=80&w=600&auto=format&fit=crop",
    features: [
      "Grade A high capacity cells",
      "0-cycle count guarantee",
      "Overheating and surge protection built-in",
      "Battery health percentage active",
    ],
    faqs: [
      {
        question: "How do I know if my battery needs replacement?",
        answer: "If your battery health drops below 80%, your phone dies randomly, or it drains rapidly, it is time for a new one.",
      },
    ],
  },
  "android-unlocking": {
    name: "Android Unlocking",
    description: "Remove network locks, region locks, and carrier restrictions from any Android device. Use any local Ghanaian SIM (MTN, Telecel, AirtelTigo) and international networks.",
    price: 120.0,
    estimatedTime: "1 - 3 Hours",
    category: "unlock",
    image: "https://images.unsplash.com/photo-1565849906660-afb2a6ad994c?q=80&w=600&auto=format&fit=crop",
    features: [
      "Official permanent network unlock",
      "No root or data loss required",
      "Supports Samsung, Tecno, Infinix, Xiaomi, etc.",
      "Global carrier unlock compatible",
    ],
    faqs: [
      {
        question: "Will my phone lock again if I update?",
        answer: "No, our unlocks are official and permanent. You can update your phone, factory reset, or travel abroad without locking it again.",
      },
    ],
  },
  "iphone-unlocking": {
    name: "iPhone Unlocking",
    description: "Permanent official IMEI factory unlock for iPhones locked to foreign networks (AT&T, T-Mobile, Vodafone, Orange, etc.). Get full cellular freedom immediately.",
    price: 320.0,
    estimatedTime: "1 - 2 Days",
    category: "unlock",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop",
    features: [
      "Official Apple database whitelist",
      "IMEI-based unlocking procedure",
      "Supports all models up to iPhone 15 Pro Max",
      "Keeps factory warranty valid",
    ],
    faqs: [
      {
        question: "Is this temporary or permanent?",
        answer: "It is 100% permanent. Your iPhone's IMEI is whitelisted in Apple's activation server.",
      },
    ],
  },
  "frp-bypass": {
    name: "FRP Bypass",
    description: "Bypass Google Account Verification (FRP) and Samsung Account Lock on any factory reset Android device. Regain complete access to your phone.",
    price: 80.0,
    estimatedTime: "30 - 60 Mins",
    category: "software",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
    features: [
      "Latest Android 13/14 security patches supported",
      "Fast bypass without PC required (in most cases)",
      "Instant login of new Google account",
      "Safe and firmware-safe process",
    ],
    faqs: [
      {
        question: "What is FRP lock?",
        answer: "FRP stands for Factory Reset Protection. It prevents unauthorized access if a phone is reset without entering the previous Google details.",
      },
    ],
  },
  "software-flashing": {
    name: "Software Flashing",
    description: "Fix bootloops, system errors, hangs, bricked devices, and virus issues by flashing certified official stock firmware. Restore original speed.",
    price: 100.0,
    estimatedTime: "1 - 2 Hours",
    category: "software",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    features: [
      "Official stock ROM flashing",
      "Solves constant rebooting & bricking",
      "Fixes secure startup password & locks",
      "Full hardware optimization check",
    ],
    faqs: [
      {
        question: "Will flashing wipe my data?",
        answer: "Yes. Firmware flashing resets the entire system partition, erasing personal data. It is done as a last resort to fix unusable phones.",
      },
    ],
  },
  "water-damage-repair": {
    name: "Water Damage Repair",
    description: "Professional chemical ultrasonic cleaning and circuit board repairs for liquid-damaged devices. Fast diagnostics and recovery.",
    price: 200.0,
    estimatedTime: "1 - 2 Days",
    category: "repair",
    image: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=600&auto=format&fit=crop",
    features: [
      "Ultrasonic motherboard bath",
      "Micro-soldering corrosion clean",
      "Short-circuit diagnostics",
      "Screen & connector recovery",
    ],
    faqs: [
      {
        question: "What should I do if my phone falls in water?",
        answer: "Turn it off immediately, do not charge it, do not put it in rice! Bring it to our shop as fast as possible for cleaning.",
      },
    ],
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const service = STATIC_SERVICES[params.slug];
  if (!service) {
    return {
      title: "Service Not Found | TechFix Unlock Hub",
    };
  }

  return {
    title: `${service.name} in Dormaa | TechFix Unlock Hub`,
    description: service.description,
    openGraph: {
      title: `${service.name} in Dormaa | TechFix Unlock Hub`,
      description: service.description,
      images: [{ url: service.image }],
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = params;
  let serviceDetail = null;

  try {
    await dbConnect();
    serviceDetail = await Service.findOne({ slug }).lean();
  } catch (error) {
    console.warn("Database unavailable. Using static service dictionary.");
  }

  // Fallback to static dictionary mapping
  const service = serviceDetail
    ? JSON.parse(JSON.stringify(serviceDetail))
    : STATIC_SERVICES[slug];

  if (!service) {
    notFound();
  }

  // Filter related services
  const relatedServices = Object.keys(STATIC_SERVICES)
    .filter((k) => k !== slug)
    .slice(0, 3)
    .map((k) => ({
      slug: k,
      name: STATIC_SERVICES[k].name,
      price: STATIC_SERVICES[k].price,
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-8">
        <Link href="/" className="hover:text-brand-cyan transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-500">Services</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-brand-cyan">{service.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Main Details Panel */}
        <div className="lg:col-span-8 space-y-12">
          {/* Image card with glass neon frame */}
          <div className="relative h-96 w-full rounded-3xl overflow-hidden border border-white/5 shadow-neon">
            <img
              src={service.image}
              alt={service.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6">
              <span className="inline-block rounded-lg bg-brand-navy border border-brand-cyan/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-cyan">
                {service.category}
              </span>
              <h1 className="font-syne text-3xl sm:text-4xl font-extrabold text-white mt-3">
                {service.name}
              </h1>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-syne text-2xl font-bold text-white border-l-4 border-brand-cyan pl-3">
              Service Overview
            </h2>
            <p className="text-slate-300 leading-relaxed text-base">
              {service.description}
            </p>
          </div>

          {/* Features Grid */}
          <div className="space-y-6">
            <h2 className="font-syne text-2xl font-bold text-white border-l-4 border-brand-mint pl-3">
              What is Included
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {service.features.map((feat: string, index: number) => (
                <div key={index} className="glass-card p-4 flex items-center gap-3 border-white/5 bg-brand-navy/10">
                  <CheckCircle className="h-5 w-5 text-brand-mint shrink-0" />
                  <span className="text-sm font-semibold text-slate-200">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ panel */}
          {service.faqs && service.faqs.length > 0 && (
            <div className="space-y-6">
              <h2 className="font-syne text-2xl font-bold text-white border-l-4 border-brand-cyan pl-3">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {service.faqs.map((faq: any, index: number) => (
                  <div key={index} className="glass-card p-6 border-white/5 bg-brand-dark/40">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-brand-cyan shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-syne text-base font-bold text-white">{faq.question}</h3>
                        <p className="text-sm text-slate-300 mt-2 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Booking card */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-6 border-brand-cyan/25 bg-brand-navy/30 sticky top-24 shadow-neon">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy border border-brand-cyan/15 text-brand-cyan shadow-neon">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-syne text-lg font-bold text-white">Online Booking</h3>
                  <span className="text-xs text-slate-400">Instantly register repair slot</span>
                </div>
              </div>

              <div className="border-y border-white/5 py-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Upfront Price</span>
                  <span className="text-xl font-extrabold text-brand-mint">GHS {service.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Time Required</span>
                  <span className="text-sm font-bold text-slate-200 flex items-center gap-1">
                    <Clock className="h-4 w-4 text-brand-cyan" /> {service.estimatedTime}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-cyan" />
                  <span>Quality OEM Tested Parts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-brand-mint" />
                  <span>Pay on Service (Cash / MoMo)</span>
                </div>
              </div>

              <Link
                href={`/book?service=${slug}`}
                className="neon-btn-primary w-full text-center py-4 font-bold rounded-xl"
              >
                Book This Repair Now
              </Link>
            </div>
          </div>

          {/* Related Services */}
          <div className="glass-card p-6 border-white/5 bg-brand-dark/20 space-y-4">
            <h3 className="font-syne text-sm font-bold uppercase tracking-wider text-brand-cyan">
              Other Specialties
            </h3>
            <div className="space-y-3">
              {relatedServices.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/services/${rel.slug}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 group"
                >
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                    {rel.name}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-brand-cyan transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
