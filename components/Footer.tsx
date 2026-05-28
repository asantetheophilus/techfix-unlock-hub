import React from "react";
import Link from "next/link";
import { Smartphone, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const services = [
    { name: "Screen Replacement", href: "/services/screen-replacement" },
    { name: "Battery Replacement", href: "/services/battery-replacement" },
    { name: "Android Unlocking", href: "/services/android-unlocking" },
    { name: "iPhone Unlocking", href: "/services/iphone-unlocking" },
    { name: "FRP Bypass", href: "/services/frp-bypass" },
    { name: "Software Flashing", href: "/services/software-flashing" },
  ];

  const quickLinks = [
    { name: "Book Repair", href: "/book" },
    { name: "Track Progress", href: "/track" },
    { name: "Terms of Service", href: "#" },
    { name: "Privacy Policy", href: "#" },
  ];

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/5 bg-brand-dark px-4 pt-16 pb-8 sm:px-6 lg:px-8">
      {/* CSS Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-10" />
      
      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-cyan to-brand-mint text-brand-dark shadow-neon">
                <Smartphone className="h-5 w-5" />
              </div>
              <span className="font-syne text-lg font-bold tracking-tight text-white">
                TechFix <span className="text-brand-mint">Unlock Hub</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dormaa's premium enterprise-grade smartphone repair and unlocking center. Bringing Apple-level visual design and high-tech diagnostic engineering directly to Dormaa, Ghana.
            </p>
            <div className="flex items-center gap-2 rounded-xl bg-brand-navy/40 border border-brand-cyan/20 p-3">
              <ShieldCheck className="h-5 w-5 text-brand-mint shrink-0" />
              <span className="text-xs font-semibold text-slate-300">100% Secured Professional Assistance</span>
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h3 className="font-syne text-sm font-bold uppercase tracking-wider text-brand-cyan">
              Our Services
            </h3>
            <ul className="mt-4 space-y-3">
              {services.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 transition-colors duration-300 hover:text-brand-mint"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-syne text-sm font-bold uppercase tracking-wider text-brand-cyan">
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 transition-colors duration-300 hover:text-brand-mint"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Location & Contacts */}
          <div className="space-y-4">
            <h3 className="font-syne text-sm font-bold uppercase tracking-wider text-brand-cyan">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-brand-mint shrink-0 mt-0.5" />
                <span>Wamanafo main road to Dormaa, Ghana</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-brand-mint shrink-0" />
                <span>+233 55 718 5355</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-brand-mint shrink-0" />
                <span>support@techfixunlock.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Partner Logos */}
        <div className="mt-16 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
            <span>Accepted Payment Systems:</span>
            <div className="flex gap-2">
              <span className="rounded bg-brand-navy border border-brand-cyan/20 px-2 py-1 text-[10px] text-brand-cyan shadow-neon">MTN Mobile Money</span>
              <span className="rounded bg-brand-navy border border-brand-mint/20 px-2 py-1 text-[10px] text-brand-mint">Telecel Cash</span>
              <span className="rounded bg-brand-navy border border-white/10 px-2 py-1 text-[10px] text-slate-300">AirtelTigo Money</span>
              <span className="rounded bg-brand-navy border border-white/10 px-2 py-1 text-[10px] text-slate-300">Visa / Mastercard</span>
            </div>
          </div>
          
          <div className="text-xs text-slate-500">
            &copy; {currentYear} TechFix Unlock Hub. All Rights Reserved. Built for Dormaa, Ghana.
          </div>
        </div>
      </div>
    </footer>
  );
}
