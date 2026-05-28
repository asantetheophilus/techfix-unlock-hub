import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import {
  Smartphone,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  MapPin,
  Calendar,
  CreditCard,
  PhoneCall,
} from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: {
    id: string;
  };
}

// 8 Status enums matching checklist requirements
const ALL_STATUSES = [
  "Pending",
  "Confirmed",
  "Diagnosing",
  "Repairing",
  "Completed",
  "Ready for Pickup",
  "Delivered",
  "Cancelled",
];

// Visual flow mapping for the timeline
const TIMELINE_STEPS = [
  { status: "Pending", title: "Order Booked", desc: "Repair slot registered online" },
  { status: "Confirmed", title: "Device Checked-in", desc: "Phone received at Dormaa lab" },
  { status: "Diagnosing", title: "Diagnostics", desc: "Technician inspecting hardware boards" },
  { status: "Repairing", title: "Active Repair", desc: "Swapping components / micro-soldering" },
  { status: "Completed", title: "Quality Check", desc: "Post-repair test verification done" },
  { status: "Ready for Pickup", title: "Ready for Pickup", desc: "Awaiting customer collection" },
];

const MOCK_BOOKINGS: Record<string, any> = {
  "TFU-928135": {
    trackingId: "TFU-928135",
    customerName: "Kofi Owusu",
    customerEmail: "kofi.owusu@gmail.com",
    customerPhone: "+233 24 412 3456",
    deviceBrand: "Samsung",
    deviceModel: "Galaxy S23 Ultra",
    deviceImei: "359876543210987",
    issueDescription: "Cracked screen glass, but touch and LCD display are completely fine. Requesting original screen swap.",
    imageUploads: [
      "https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?q=80&w=600&auto=format&fit=crop",
    ],
    serviceName: "Screen Replacement",
    date: new Date(),
    timeSlot: "10:00 AM - 11:30 AM",
    status: "Diagnosing",
    statusHistory: [
      { status: "Pending", note: "Booking registered online, awaiting diagnostics confirmation.", updatedAt: new Date(Date.now() - 1000 * 60 * 120) },
      { status: "Confirmed", note: "Device received in shop, booking confirmed.", updatedAt: new Date(Date.now() - 1000 * 60 * 60) },
      { status: "Diagnosing", note: "Technician starting micro-assembly inspection.", updatedAt: new Date(Date.now() - 1000 * 60 * 10) },
    ],
    technicianNotes: "Verified digitizer board. Motherboard is dry and unharmed. Repair starting shortly.",
    originalPrice: 250,
    discountedPrice: 0,
    finalPrice: 250,
    paymentStatus: "Paid",
    paymentDetails: {
      reference: "txn_ref_928135",
      channel: "MTN Mobile Money",
      paidAt: new Date(),
    },
  },
};

export default async function LiveTrackerDetailPage({ params }: PageProps) {
  const trackingId = params.id.toUpperCase();
  let bookingData = null;
  let serviceName = "Phone Repair Specialty";

  try {
    await dbConnect();
    const doc = await Booking.findOne({ trackingId }).lean();
    if (doc) {
      bookingData = JSON.parse(JSON.stringify(doc));
      // Resolve service name
      if (doc.serviceId) {
        const serviceObj = await Service.findById(doc.serviceId).lean();
        if (serviceObj) {
          serviceName = serviceObj.name;
        }
      }
    }
  } catch (error) {
    console.warn("DB connection down in Tracker. Loading static mock data matching trackingId.");
  }

  // Fallback to static mock dictionary
  const booking = bookingData || MOCK_BOOKINGS[trackingId];

  if (!booking) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center space-y-6">
        <AlertCircle className="h-14 w-14 text-red-500 mx-auto" />
        <h1 className="font-syne text-2xl font-bold text-white">Booking Not Found</h1>
        <p className="text-sm text-slate-400">
          The tracking reference <strong className="text-brand-cyan">{trackingId}</strong> does not match any register in our system. Please check the spelling or search again.
        </p>
        <Link href="/track" className="neon-btn-secondary py-3 px-6 rounded-xl inline-flex font-semibold">
          Search Again
        </Link>
      </div>
    );
  }

  const currentStatusIndex = TIMELINE_STEPS.findIndex((s) => s.status === booking.status);
  const isCancelled = booking.status === "Cancelled";
  const isDelivered = booking.status === "Delivered";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-8">
        <Link href="/" className="hover:text-brand-cyan transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/track" className="hover:text-brand-cyan transition-colors">Tracker</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-brand-cyan">{booking.trackingId}</span>
      </div>

      {/* TOP SUMMARY BAR */}
      <div className="glass-card p-6 md:p-8 border-brand-cyan/20 bg-brand-navy/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div className="space-y-2">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Live Status Overview</span>
          <div className="flex items-center gap-3">
            <h1 className="font-syne text-2xl md:text-3xl font-extrabold text-white">
              {booking.deviceBrand} {booking.deviceModel}
            </h1>
            <span className="rounded bg-brand-navy border border-brand-cyan/35 px-2.5 py-1 text-xs font-bold text-brand-cyan shadow-neon uppercase">
              {booking.trackingId}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-brand-dark/60 border border-white/5 p-4 rounded-xl text-center min-w-[120px]">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Status</span>
            <span className="text-sm font-extrabold text-brand-mint text-neon-mint uppercase mt-1 block">
              {booking.status}
            </span>
          </div>
          <div className="bg-brand-dark/60 border border-white/5 p-4 rounded-xl text-center min-w-[120px]">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Payment</span>
            <span className={`text-sm font-extrabold uppercase mt-1 block ${
              booking.paymentStatus === "Paid" ? "text-brand-mint" : "text-yellow-500"
            }`}>
              {booking.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* GRAPHICAL TIMELINE PATH */}
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-card p-6 md:p-8 border-white/5 bg-brand-navy/5">
            <h2 className="font-syne text-xl font-bold text-white mb-8 border-l-4 border-brand-cyan pl-3">
              Diagnostics & Repair Path
            </h2>

            {isCancelled ? (
              <div className="rounded-2xl bg-red-950/20 border border-red-500/20 p-6 text-center space-y-2">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
                <h3 className="font-bold text-white text-base">Booking Cancelled</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This repair order was cancelled. Please reach out to customer service for more details or to schedule a diagnostic reappraisal.
                </p>
              </div>
            ) : isDelivered ? (
              <div className="rounded-2xl bg-brand-navy/60 border border-brand-mint/20 p-6 text-center space-y-2">
                <CheckCircle className="h-10 w-10 text-brand-mint mx-auto" />
                <h3 className="font-bold text-white text-base">Device Successfully Delivered</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This device was returned to the client and the order has been completed. Thank you for choosing TechFix Unlock Hub!
                </p>
              </div>
            ) : (
              <div className="relative pl-8 border-l border-white/10 space-y-8">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = currentStatusIndex >= idx;
                  const isActive = currentStatusIndex === idx;

                  return (
                    <div key={idx} className="relative">
                      {/* Node circle indicators */}
                      <span className={`absolute -left-[41px] top-1 h-5 w-5 rounded-full flex items-center justify-center border transition-all duration-500 ${
                        isActive
                          ? "bg-brand-dark border-brand-cyan text-brand-cyan shadow-neon scale-110"
                          : isCompleted
                          ? "bg-brand-mint border-brand-mint text-brand-dark"
                          : "bg-brand-dark border-white/10 text-slate-600"
                      }`}>
                        {isCompleted && <CheckCircle className="h-3 w-3" />}
                      </span>

                      <div className="space-y-1">
                        <h4 className={`font-syne text-sm font-bold transition-colors ${
                          isActive ? "text-brand-cyan text-neon" : isCompleted ? "text-slate-100" : "text-slate-500"
                        }`}>
                          {step.title}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                        
                        {/* If this node represents the active state, check if there are custom technician notes */}
                        {isActive && booking.technicianNotes && (
                          <div className="rounded-xl bg-brand-dark border border-brand-cyan/20 p-4 mt-3 text-xs text-slate-300 leading-relaxed">
                            <span className="font-bold text-brand-cyan block mb-1">Technician Log Note:</span>
                            {booking.technicianNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Device diagnostic images upload display */}
          {booking.imageUploads && booking.imageUploads.length > 0 && (
            <div className="glass-card p-6 border-white/5">
              <h3 className="font-syne text-lg font-bold text-white mb-4">Device Diagnostic Snaps</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {booking.imageUploads.map((url: string, index: number) => (
                  <div key={index} className="relative h-44 rounded-xl overflow-hidden border border-white/10">
                    <img src={url} alt="Diagnostic attachment" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR DETAILS CARD */}
        <div className="lg:col-span-4 space-y-8">
          {/* Order invoice summary */}
          <div className="glass-card p-6 border-white/5 bg-brand-navy/10 space-y-6">
            <h3 className="font-syne text-lg font-bold text-white border-l-4 border-brand-cyan pl-3">
              Order Receipt
            </h3>

            <div className="space-y-4 border-b border-white/5 pb-4 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Client Name</span>
                <span className="font-bold text-slate-200">{booking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>WhatsApp Phone</span>
                <span className="font-bold text-slate-200">{booking.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>Scheduled Date</span>
                <span className="font-bold text-slate-200">{new Date(booking.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Hour Slot</span>
                <span className="font-bold text-slate-200">{booking.timeSlot}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal Price</span>
                <span className="font-bold text-slate-200">GHS {booking.originalPrice.toFixed(2)}</span>
              </div>
              {booking.discountedPrice > 0 && (
                <div className="flex justify-between text-brand-mint font-semibold">
                  <span>Coupon Applied</span>
                  <span>- GHS {booking.discountedPrice.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/5 pt-3 font-syne text-sm font-bold text-white">
                <span>Total GHS</span>
                <span className="text-brand-mint font-extrabold text-base">GHS {booking.finalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment receipt confirmation block */}
          {booking.paymentStatus === "Paid" && booking.paymentDetails && (
            <div className="glass-card p-6 border-brand-mint/20 bg-brand-navy/35 space-y-4">
              <div className="flex items-center gap-2 text-brand-mint">
                <ShieldCheck className="h-5 w-5" />
                <h4 className="font-bold text-white text-sm">Payment Confirmed</h4>
              </div>
              <div className="space-y-2 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Channel:</span>
                  <span className="font-bold text-slate-200">{booking.paymentDetails.channel || "Mobile Money"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-bold text-slate-200 truncate max-w-[130px]">{booking.paymentDetails.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processed:</span>
                  <span className="font-bold text-slate-200">
                    {booking.paymentDetails.paidAt ? new Date(booking.paymentDetails.paidAt).toLocaleString() : new Date().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Lab location contact widget */}
          <div className="glass-card p-6 border-white/5 space-y-4">
            <h4 className="font-syne text-xs font-bold uppercase tracking-wider text-brand-cyan">Lab Location</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand-mint shrink-0 mt-0.5" />
                <span>Wamanafo main road to Dormaa, Ghana.</span>
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-brand-mint shrink-0" />
                <span>+233 55 718 5355</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
