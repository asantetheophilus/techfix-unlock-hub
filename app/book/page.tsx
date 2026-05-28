"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Smartphone,
  Cpu,
  Lock,
  Calendar,
  Clock,
  Tag,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Trash2,
  FileImage,
} from "lucide-react";

// Pre-seeded slots
const TIME_SLOTS = [
  "08:30 AM - 10:00 AM",
  "10:00 AM - 11:30 AM",
  "11:30 AM - 01:00 PM",
  "01:30 PM - 03:00 PM",
  "03:00 PM - 04:30 PM",
  "04:30 PM - 06:00 PM",
];

const SERVICES_STATIC = [
  { slug: "screen-replacement", name: "Screen Replacement", price: 250, cat: "repair", icon: Smartphone },
  { slug: "battery-replacement", name: "Battery Replacement", price: 150, cat: "repair", icon: BatteryIcon },
  { slug: "android-unlocking", name: "Android Unlocking", price: 120, cat: "unlock", icon: Cpu },
  { slug: "iphone-unlocking", name: "iPhone Unlocking", price: 320, cat: "unlock", icon: Lock },
  { slug: "frp-bypass", name: "FRP Bypass", price: 80, cat: "software", icon: Cpu },
  { slug: "software-flashing", name: "Software Flashing", price: 100, cat: "software", icon: Cpu },
  { slug: "water-damage-repair", name: "Water Damage Repair", price: 200, cat: "repair", icon: Smartphone },
  // Satellite TV Installations
  { slug: "dstv-installation", name: "DStv Installation & Setup", price: 250, cat: "installation", icon: TvIcon },
  { slug: "gotv-installation", name: "GOtv Installation & Activation", price: 150, cat: "installation", icon: TvIcon },
  { slug: "startimes-installation", name: "Startimes Installation & Config", price: 160, cat: "installation", icon: TvIcon },
  { slug: "multitv-installation", name: "Multi-TV Installation", price: 450, cat: "installation", icon: TvIcon },
  { slug: "dish-alignment", name: "Satellite Dish Alignment & Repair", price: 100, cat: "installation", icon: TvIcon },
  { slug: "decoder-troubleshooting", name: "Decoder Troubleshooting & Repair", price: 120, cat: "installation", icon: TvIcon },
  { slug: "signal-loss-fixing", name: "Signal Loss Fixing", price: 90, cat: "installation", icon: TvIcon },
  { slug: "subscription-activation", name: "Subscription Activation Assistance", price: 50, cat: "installation", icon: TvIcon },
];

function BatteryIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="10" x="2" y="7" rx="2" ry="2" />
      <line x1="22" x2="22" y1="11" y2="13" />
    </svg>
  );
}

function TvIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
      <polyline points="17 2 12 7 7 2" />
    </svg>
  );
}

function BookingWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialService = searchParams.get("service");

  // Wizard state step: 1, 2, 3, 4
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form payload state
  const [selectedService, setSelectedService] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [deviceImei, setDeviceImei] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [images, setImages] = useState<string[]>([]); // base64 images

  // TV installation fields state
  const [decoderType, setDecoderType] = useState<"DStv" | "GOtv" | "Startimes" | "Other">("DStv");
  const [roomsNumber, setRoomsNumber] = useState<number>(1);
  const [installationType, setInstallationType] = useState<"New installation" | "Repair" | "Re-alignment">("New installation");
  const [hasDishInstalled, setHasDishInstalled] = useState<"Yes" | "No">("No");
  const [installationLocationDetails, setInstallationLocationDetails] = useState("");
  const [preferredVisitTime, setPreferredVisitTime] = useState<"morning" | "afternoon" | "evening">("morning");

  // Step 3 scheduling
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  
  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Set default service if passed via query params
  useEffect(() => {
    if (initialService) {
      const match = SERVICES_STATIC.find((s) => s.slug === initialService);
      if (match) {
        setSelectedService(match.slug);
        setStep(2); // Jump to details directly
      }
    }
  }, [initialService]);

  // Dropzone setup
  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Str = reader.result as string;
        setImages((prev) => [...prev, base64Str]);
      };
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 6 * 1024 * 1024, // 6MB
  });

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Pricing calculations
  const serviceObj = SERVICES_STATIC.find((s) => s.slug === selectedService);
  const originalPrice = serviceObj ? serviceObj.price : 0;
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discount = originalPrice * (appliedCoupon.discountValue / 100);
    } else {
      discount = appliedCoupon.discountValue;
    }
    discount = Math.min(discount, originalPrice);
  }
  const finalPrice = originalPrice - discount;

  // Coupon verification
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    setCouponSuccess("");
    
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setAppliedCoupon(data.data);
        setCouponSuccess(`Coupon code applied successfully! Saved GHS ${discount.toFixed(2)}`);
      } else {
        setCouponError(data.message || "Failed to apply coupon");
      }
    } catch (err) {
      setCouponError("Could not validate coupon. Fallback active.");
      // Fallback local mocks validation
      const codeUpper = couponInput.trim().toUpperCase();
      if (codeUpper === "WELCOME10") {
        setAppliedCoupon({ code: "WELCOME10", discountType: "percentage", discountValue: 10 });
        setCouponSuccess("Applied sandbox promo WELCOME10!");
      } else {
        setCouponError("Invalid coupon code.");
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Submit Booking to API
  const handleFinalSubmit = async () => {
    setLoading(true);
    setErrorMessage("");

    const isTv = serviceObj?.cat === "installation";
    const bookingPayload = {
      customerName,
      customerEmail,
      customerPhone,
      deviceBrand: isTv ? "Satellite TV Setup" : deviceBrand,
      deviceModel: isTv ? decoderType : deviceModel,
      deviceImei: isTv ? undefined : (deviceImei || undefined),
      issueDescription: isTv ? installationLocationDetails : issueDescription,
      imageUploads: images,
      serviceSlug: selectedService,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      couponCode: appliedCoupon?.code || undefined,
      // TV parameters
      isTvService: isTv,
      decoderType: isTv ? decoderType : undefined,
      roomsNumber: isTv ? roomsNumber : undefined,
      installationType: isTv ? installationType : undefined,
      hasDishInstalled: isTv ? hasDishInstalled : undefined,
      installationLocationDetails: isTv ? installationLocationDetails : undefined,
      preferredVisitTime: isTv ? preferredVisitTime : undefined,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        router.push(`/track/${data.data.booking.trackingId}`);
      } else {
        setErrorMessage(data.message || "Failed to register booking. Try again.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Could not submit booking details. Server is down.");
    } finally {
      setLoading(false);
    }
  };

  // Next validations
  const validateStep2 = () => {
    const isTv = serviceObj?.cat === "installation";
    if (isTv) {
      if (!customerName || !customerEmail || !customerPhone || !installationLocationDetails) {
        setErrorMessage("Please fill in all required customer details and installation requirements.");
        return false;
      }
    } else {
      if (!customerName || !customerEmail || !customerPhone || !deviceBrand || !deviceModel || !issueDescription) {
        setErrorMessage("Please fill in all required customer and device details.");
        return false;
      }
    }
    if (!/^\S+@\S+\.\S+$/.test(customerEmail)) {
      setErrorMessage("Please use a valid email address.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const validateStep3 = () => {
    if (!selectedDate || !selectedTimeSlot) {
      setErrorMessage("Please choose a schedule date and time slot.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="text-center space-y-3 mb-10">
        <h1 className="font-syne text-3xl md:text-4xl font-extrabold text-white">
          Book Your Repair Session
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Complete the interactive wizard to generate a tracking ID and pay securely.
        </p>
      </div>

      {/* STEP INDICATOR BAR */}
      <div className="flex justify-between items-center mb-12 max-w-md mx-auto relative px-4">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -z-10 -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-brand-cyan to-brand-mint -z-10 -translate-y-1/2 transition-all duration-500"
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        />

        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-9 w-9 rounded-full flex items-center justify-center font-syne font-bold text-sm transition-all duration-500 border select-none ${
              step >= i
                ? "bg-brand-dark text-brand-cyan border-brand-cyan shadow-neon"
                : "bg-brand-navy/60 text-slate-500 border-white/5"
            }`}
          >
            {i}
          </div>
        ))}
      </div>

      {/* FORM CONTENT CONTAINER */}
      <div className="glass-card p-6 md:p-10 border-white/5 bg-brand-navy/15 min-h-[400px]">
        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-950/20 border border-red-500/20 p-4 text-sm text-red-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: SERVICE CHOICE */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="font-syne text-xl font-bold text-white border-l-4 border-brand-cyan pl-3">
                Step 1: Select Repair / Unlocking Specialty
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SERVICES_STATIC.map((serv) => {
                  const Icon = serv.icon;
                  const isChosen = selectedService === serv.slug;
                  return (
                    <div
                      key={serv.slug}
                      onClick={() => {
                        setSelectedService(serv.slug);
                        setStep(2);
                      }}
                      className={`glass-card p-5 cursor-pointer flex items-center justify-between border transition-all duration-300 ${
                        isChosen
                          ? "border-brand-cyan/60 bg-brand-navy/40 shadow-neon"
                          : "border-white/5 hover:border-brand-cyan/25 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy border border-brand-cyan/15 text-brand-cyan">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{serv.name}</h3>
                          <span className="text-xs text-brand-mint font-semibold uppercase">{serv.cat}</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-brand-mint">
                        GHS {serv.price.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: DEVICE & CUSTOMER INFO */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="font-syne text-xl font-bold text-white border-l-4 border-brand-cyan pl-3">
                {serviceObj?.cat === "installation"
                  ? "Step 2: Customer & Installation Requirements"
                  : "Step 2: Customer & Device Specifics"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-brand-cyan uppercase tracking-wider">Contact Info</h3>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">Your Full Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="glass-input"
                      placeholder="e.g. Abena Mansah"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">Email Address *</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="glass-input"
                      placeholder="e.g. abena@gmail.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">WhatsApp / Phone Number *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="glass-input"
                      placeholder="e.g. +233 24 412 3456"
                    />
                  </div>
                </div>

                {serviceObj?.cat === "installation" ? (
                  /* TV Installation details */
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-brand-cyan uppercase tracking-wider">Installation Specs</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-semibold">Decoder Type *</label>
                        <select
                          value={decoderType}
                          onChange={(e: any) => setDecoderType(e.target.value)}
                          className="glass-input"
                        >
                          <option value="DStv">DStv</option>
                          <option value="GOtv">GOtv</option>
                          <option value="Startimes">Startimes</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-semibold">Installation Type *</label>
                        <select
                          value={installationType}
                          onChange={(e: any) => setInstallationType(e.target.value)}
                          className="glass-input"
                        >
                          <option value="New installation">New Installation</option>
                          <option value="Repair">Troubleshoot / Repair</option>
                          <option value="Re-alignment">Dish Re-alignment</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-semibold">Rooms / Decoders *</label>
                        <select
                          value={roomsNumber}
                          onChange={(e) => setRoomsNumber(Number(e.target.value))}
                          className="glass-input"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n} {n === 1 ? "Room" : "Rooms"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-semibold">Has Dish Installed? *</label>
                        <select
                          value={hasDishInstalled}
                          onChange={(e: any) => setHasDishInstalled(e.target.value)}
                          className="glass-input"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">Preferred Visit Time *</label>
                      <select
                        value={preferredVisitTime}
                        onChange={(e: any) => setPreferredVisitTime(e.target.value)}
                        className="glass-input"
                      >
                        <option value="morning">Morning (8 AM - 12 PM)</option>
                        <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                        <option value="evening">Evening (4 PM - 7 PM)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">Location & Special Requests *</label>
                      <textarea
                        value={installationLocationDetails}
                        onChange={(e) => setInstallationLocationDetails(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl bg-brand-dark border border-white/5 p-3 text-sm text-white focus:border-brand-cyan focus:outline-none font-sans"
                        placeholder="e.g. Near Dormaa Presbyterian Church, 2nd floor apartment. Need long cable..."
                      />
                    </div>
                  </div>
                ) : (
                  /* Device Details */
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-brand-cyan uppercase tracking-wider">Device Specs</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-semibold">Brand *</label>
                        <input
                          type="text"
                          value={deviceBrand}
                          onChange={(e) => setDeviceBrand(e.target.value)}
                          className="glass-input"
                          placeholder="e.g. Samsung / iPhone"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-semibold">Model *</label>
                        <input
                          type="text"
                          value={deviceModel}
                          onChange={(e) => setDeviceModel(e.target.value)}
                          className="glass-input"
                          placeholder="e.g. Galaxy S23 Ultra"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">Device IMEI / Serial (Optional)</label>
                      <input
                        type="text"
                        value={deviceImei}
                        onChange={(e) => setDeviceImei(e.target.value)}
                        className="glass-input"
                        placeholder="15-digit IMEI identifier"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">Problem / Issue Description *</label>
                      <textarea
                        value={issueDescription}
                        onChange={(e) => setIssueDescription(e.target.value)}
                        rows={3}
                        className="glass-input"
                        placeholder="Describe the phone problem or lock state..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* react-dropzone upload container */}
              <div className="space-y-4 border-t border-white/5 pt-6">
                <h3 className="text-sm font-bold text-brand-cyan uppercase tracking-wider">
                  {serviceObj?.cat === "installation" ? "Upload Installation Site Photos (Optional)" : "Upload Device Photos"}
                </h3>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? "border-brand-cyan bg-brand-cyan/5 shadow-neon"
                      : "border-white/10 hover:border-brand-cyan/30 hover:bg-white/5"
                  }`}
                >
                  <input {...getInputProps()} />
                  <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-200 font-semibold">Drag & drop device images here</p>
                  <p className="text-xs text-slate-500 mt-1">Accepts PNG, JPG, JPEG (Max 6MB per file)</p>
                </div>

                {/* Uploaded thumbnails */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden border border-white/10 group">
                        <img src={img} alt="upload" className="h-full w-full object-cover" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-red-950/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-5 w-5 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3: DATE, SLOTS & PROMO */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="font-syne text-xl font-bold text-white border-l-4 border-brand-cyan pl-3">
                Step 3: Choose Schedule & Discounts
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Date Picker */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Pick a Date
                  </h3>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="glass-input font-bold"
                  />
                </div>

                {/* Promo Code Input */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Apply Coupon Code
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="glass-input uppercase font-bold"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="neon-btn-secondary px-5 py-2 hover:bg-brand-navy rounded-xl flex items-center gap-1.5 shrink-0"
                    >
                      {validatingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin text-brand-cyan" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                  {couponError && <p className="text-xs font-semibold text-red-400 mt-1">{couponError}</p>}
                  {couponSuccess && <p className="text-xs font-semibold text-brand-mint mt-1">{couponSuccess}</p>}
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="space-y-4 border-t border-white/5 pt-6">
                <h3 className="text-sm font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Select an Hour Slot
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <div
                        key={slot}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-4 rounded-xl cursor-pointer border text-center font-semibold text-xs tracking-wider transition-all duration-300 ${
                          isSelected
                            ? "bg-brand-navy border-brand-cyan/60 text-brand-cyan shadow-neon scale-[1.01]"
                            : "bg-brand-dark border-white/5 hover:border-brand-cyan/20 hover:bg-white/5 text-slate-300"
                        }`}
                      >
                        {slot}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: ORDER OVERVIEW */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="font-syne text-xl font-bold text-white border-l-4 border-brand-cyan pl-3">
                Step 4: Final Summary & Invoice
              </h2>

              <div className="border-beam-card border-beam-card-active p-6 space-y-6">
                {/* Contact and Service Summaries */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-white/5 pb-6">
                  <div className="space-y-2 text-sm">
                    <span className="text-xs text-slate-500 uppercase font-semibold">Client details</span>
                    <p className="font-bold text-white">{customerName}</p>
                    <p className="text-xs text-slate-400">{customerEmail}</p>
                    <p className="text-xs text-slate-400">{customerPhone}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    {serviceObj?.cat === "installation" ? (
                      <>
                        <span className="text-xs text-slate-500 uppercase font-semibold">Installation details</span>
                        <p className="font-bold text-white">{installationType} ({decoderType})</p>
                        <p className="text-xs text-slate-400">Rooms: {roomsNumber} | Has Dish: {hasDishInstalled}</p>
                        <p className="text-xs text-brand-cyan font-bold">Service: {serviceObj?.name}</p>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-slate-500 uppercase font-semibold">Device & Service</span>
                        <p className="font-bold text-white">{deviceBrand} {deviceModel}</p>
                        <p className="text-xs text-slate-400">IMEI: {deviceImei || "Not provided"}</p>
                        <p className="text-xs text-brand-cyan font-bold">Service: {serviceObj?.name}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-white/5 pb-6">
                  <div className="space-y-2 text-sm">
                    <span className="text-xs text-slate-500 uppercase font-semibold">Appointment Schedule</span>
                    <p className="font-bold text-white">{selectedDate ? new Date(selectedDate).toLocaleDateString() : ""}</p>
                    <p className="text-xs text-slate-400">Slot: {selectedTimeSlot}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <span className="text-xs text-slate-500 uppercase font-semibold">
                      {serviceObj?.cat === "installation" ? "Preferred Visit & Images" : "Selected Images"}
                    </span>
                    {serviceObj?.cat === "installation" && (
                      <p className="text-xs text-slate-300 font-semibold mb-1">
                        Visit Time: <span className="text-brand-cyan capitalize">{preferredVisitTime}</span>
                      </p>
                    )}
                    <p className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                      <FileImage className="h-4 w-4 text-brand-mint" /> {images.length} photos uploaded
                    </p>
                  </div>
                </div>

                {/* Subtotal deductions pricing grid */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-sm text-slate-400">
                    <span>Subtotal Repair Price</span>
                    <span>GHS {originalPrice.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-sm text-brand-mint">
                      <span>Promo Discount ({appliedCoupon.code})</span>
                      <span>- GHS {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t border-white/5 pt-4 text-white">
                    <span className="font-syne text-base font-bold">Total Final Price</span>
                    <span className="font-syne text-2xl font-extrabold text-brand-mint text-neon-mint">
                      GHS {finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-brand-navy/60 border border-brand-cyan/20 p-4 text-xs text-slate-300 leading-relaxed">
                📢 <strong>Booking Notice:</strong> Clicking the button below registers your booking details and schedules your diagnostic slot. No upfront online payment is required. You can pay via cash, local Mobile Money transfer at our lab, or upon completed technician home visit.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WIZARD NAV FOOTER BUTTONS */}
        <div className="mt-10 border-t border-white/5 pt-6 flex justify-between gap-4">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="neon-btn-secondary px-5 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-brand-navy shrink-0"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}
          
          <div className="ml-auto">
            {step < 4 ? (
              <button
                onClick={() => {
                  if (step === 2 && !validateStep2()) return;
                  if (step === 3 && !validateStep3()) return;
                  setStep((s) => s + 1);
                }}
                disabled={step === 1 && !selectedService}
                className={`neon-btn-primary py-2.5 px-6 rounded-xl flex items-center gap-1.5 ${
                  step === 1 && !selectedService ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleFinalSubmit}
                disabled={loading}
                className="neon-btn-primary py-3 px-8 rounded-xl font-bold flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Booking repair slot...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Confirm & Book Repair Slot
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingWizardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-brand-dark">
        <Loader2 className="h-8 w-8 animate-spin text-brand-cyan" />
      </div>
    }>
      <BookingWizardContent />
    </Suspense>
  );
}
