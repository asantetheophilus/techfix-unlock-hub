"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Smartphone, LayoutDashboard, LogOut } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = (session?.user as any)?.role === "admin";

  const links = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/#services" },
    { name: "Book Repair", href: "/book" },
    { name: "Track Order", href: "/track" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-brand-dark/70 backdrop-blur-xl transition-all duration-500 hover:border-brand-cyan/20 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-cyan to-brand-mint text-brand-dark shadow-neon transition-transform duration-300 group-hover:scale-105">
              <Smartphone className="h-5 w-5" />
            </div>
            <span className="font-syne text-xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-brand-cyan">
              TechFix <span className="text-brand-mint">Unlock Hub</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-sm font-medium tracking-wide transition-colors duration-300 hover:text-brand-cyan ${
                    isActive ? "text-brand-cyan" : "text-slate-300"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-brand-cyan to-brand-mint"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 rounded-xl bg-brand-navy/60 hover:bg-brand-navy/95 border border-brand-cyan/20 px-4 py-2 text-sm text-brand-cyan transition-all duration-300 hover:shadow-neon"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="h-8 w-8 rounded-full bg-brand-navy border border-brand-mint/20 flex items-center justify-center text-xs font-bold text-brand-mint">
                    {session.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium hidden lg:inline max-w-[120px] truncate">
                    {session.user?.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 rounded-xl bg-red-950/20 border border-red-500/25 px-4 py-2 text-sm text-red-400 transition-all duration-300 hover:bg-red-900/40"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-brand-cyan transition-colors"
                >
                  Sign In
                </Link>
                <Link href="/book" className="neon-btn-primary py-2 px-5 text-sm rounded-xl">
                  Book Service
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggler */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-brand-dark/95 backdrop-blur-xl"
          >
            <div className="space-y-1 px-4 py-4">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-brand-cyan transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-white/5 my-4 pt-4">
                {session ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="h-10 w-10 rounded-full bg-brand-navy flex items-center justify-center font-bold text-brand-mint">
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{session.user?.name}</p>
                        <p className="text-xs text-slate-400">{session.user?.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex w-full items-center gap-2 rounded-xl bg-brand-navy/50 px-4 py-3 text-base font-medium text-brand-cyan hover:bg-brand-navy"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-2 rounded-xl bg-red-950/20 px-4 py-3 text-base font-medium text-red-400 hover:bg-red-900/20"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 px-2">
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center rounded-xl bg-white/5 py-3 text-center text-sm font-medium text-slate-300 hover:bg-white/10"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/book"
                      onClick={() => setIsOpen(false)}
                      className="neon-btn-primary py-3 text-center text-sm"
                    >
                      Book Now
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
