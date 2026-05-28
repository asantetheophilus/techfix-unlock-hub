import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User";
import Service from "../models/Service";
import Booking from "../models/Booking";
import Coupon from "../models/Coupon";
import Review from "../models/Review";
import BlogPost from "../models/BlogPost";

// Simple custom env loader
import * as fs from "fs";
import * as path from "path";

try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    envFile.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.warn("Could not load local .env file natively: ", e);
}

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@techfix.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "TechFixDormaa2026!";

const SERVICES_DATA = [
  // --- PHONE REPAIRS ---
  {
    name: "Screen Replacement",
    slug: "screen-replacement",
    description: "Premium original display screen replacements for all major phone models (iPhone, Samsung, Tecno, Infinix, etc.). Restore crystal clear colors and smooth touch response instantly.",
    price: 250.0,
    estimatedTime: "1 - 2 Hours",
    category: "repair" as const,
    image: "https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?q=80&w=600&auto=format&fit=crop",
    features: ["Original OEM screen panels", "TrueTone recovery supported", "Lifetime touch responsiveness warranty"],
    faqs: [
      { question: "How long does a screen replacement take?", answer: "Most screen replacements take between 45 minutes to 2 hours." },
    ],
  },
  {
    name: "Battery Replacement",
    slug: "battery-replacement",
    description: "Replace your swollen or rapidly draining phone battery with a certified high-capacity original battery. Fix charging errors and restore all-day battery life.",
    price: 150.0,
    estimatedTime: "30 - 45 Mins",
    category: "repair" as const,
    image: "https://images.unsplash.com/photo-1601524909162-be87252be298?q=80&w=600&auto=format&fit=crop",
    features: ["Grade A high capacity cells", "0-cycle count guarantee", "Overheating protection built-in"],
    faqs: [
      { question: "How do I know if my battery needs replacement?", answer: "If your battery health drops below 80% or it drains rapidly." },
    ],
  },
  {
    name: "Android Unlocking",
    slug: "android-unlocking",
    description: "Remove network locks, region locks, and carrier restrictions from any Android device. Use any local Ghanaian SIM (MTN, Telecel, AirtelTigo).",
    price: 120.0,
    estimatedTime: "1 - 3 Hours",
    category: "unlock" as const,
    image: "https://images.unsplash.com/photo-1565849906660-afb2a6ad994c?q=80&w=600&auto=format&fit=crop",
    features: ["Official permanent network unlock", "No root or data loss required", "Supports Samsung, Tecno, Infinix, etc."],
    faqs: [
      { question: "Will my phone lock again if I update?", answer: "No, our unlocks are official and 100% permanent." },
    ],
  },
  {
    name: "iPhone Unlocking",
    slug: "iphone-unlocking",
    description: "Permanent official IMEI factory unlock for iPhones locked to foreign networks (AT&T, T-Mobile, Vodafone, etc.). Get full cellular freedom immediately.",
    price: 320.0,
    estimatedTime: "1 - 2 Days",
    category: "unlock" as const,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop",
    features: ["Official Apple database whitelist", "IMEI-based unlocking procedure", "Keeps factory warranty valid"],
    faqs: [
      { question: "Is this temporary or permanent?", answer: "It is 100% permanent whitelisted on Apple's servers." },
    ],
  },
  {
    name: "FRP Bypass",
    slug: "frp-bypass",
    description: "Bypass Google Account Verification (FRP) and Samsung Account Lock on any factory reset Android device. Regain complete access.",
    price: 80.0,
    estimatedTime: "30 - 60 Mins",
    category: "software" as const,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
    features: ["Latest Android patches supported", "Instant login of new Google account", "Safe firmware-safe process"],
    faqs: [],
  },
  {
    name: "Software Flashing",
    slug: "software-flashing",
    description: "Fix bootloops, system errors, hangs, bricked devices, and virus issues by flashing certified official stock firmware.",
    price: 100.0,
    estimatedTime: "1 - 2 Hours",
    category: "software" as const,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    features: ["Official stock ROM flashing", "Solves constant rebooting", "Full hardware check"],
    faqs: [],
  },
  {
    name: "Water Damage Repair",
    slug: "water-damage-repair",
    description: "Professional chemical ultrasonic cleaning and circuit board repairs for liquid-damaged devices. Fast diagnostics and recovery.",
    price: 200.0,
    estimatedTime: "1 - 2 Days",
    category: "repair" as const,
    image: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=600&auto=format&fit=crop",
    features: ["Ultrasonic motherboard bath", "Micro-soldering corrosion clean", "Short-circuit diagnostics"],
    faqs: [],
  },

  // --- TV & SATELLITE INSTALLATIONS ---
  {
    name: "DStv Installation & Setup",
    slug: "dstv-installation",
    description: "Professional DStv decoder installation, dish assembly, wall bracket mounting, and multi-room coaxial cable wiring configurations.",
    price: 250.0,
    estimatedTime: "2 - 3 Hours",
    category: "installation" as const,
    image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop",
    features: ["Coaxial dish assembly & lock-in", "Full bracket wall drilling", "Signal verification check", "Standard and Explora decoders"],
    faqs: [
      { question: "Is the dish included?", answer: "Our base fee covers setup and alignment. If you require a new satellite dish, extra charges apply." },
    ],
  },
  {
    name: "GOtv Installation & Activation",
    slug: "gotv-installation",
    description: "GOtv digital antenna setup, wall bracket mounting, signal configuration, and instant subscription packet activation.",
    price: 150.0,
    estimatedTime: "1 - 2 Hours",
    category: "installation" as const,
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop",
    features: ["High-gain antenna bracket mount", "Signal lock-in", "Decoder channel scanning", "Account package activation"],
    faqs: [],
  },
  {
    name: "Startimes Installation & Configuration",
    slug: "startimes-installation",
    description: "Setup and configuration of Startimes terrestrial antennas or satellite dishes, channel package activation, and TV mapping.",
    price: 160.0,
    estimatedTime: "1 - 2 Hours",
    category: "installation" as const,
    image: "https://images.unsplash.com/photo-1461151304267-38535e780c79?q=80&w=600&auto=format&fit=crop",
    features: ["Terrestrial T2 antenna setup", "Dish LNB signal calibration", "Instant smart card activation"],
    faqs: [],
  },
  {
    name: "Multi-TV Installation",
    slug: "multitv-installation",
    description: "Multi-TV decoder setups with free-to-air satellite configurations. Supports multiple rooms and splitter setups.",
    price: 450.0,
    estimatedTime: "3 - 5 Hours",
    category: "installation" as const,
    image: "https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=600&auto=format&fit=crop",
    features: ["Coaxial splitting configurations", "Multi-room decoder linking", "Free-to-air channel tuning"],
    faqs: [],
  },
  {
    name: "Satellite Dish Alignment & Repair",
    slug: "dish-alignment",
    description: "Fixing signal loss caused by strong winds, rusty mounts, or faulty LNBs. Realignment using digital sat-finders.",
    price: 100.0,
    estimatedTime: "1 Hour",
    category: "installation" as const,
    image: "https://images.unsplash.com/photo-1528243097678-73904f09d526?q=80&w=600&auto=format&fit=crop",
    features: ["Digital spectrum LNB alignment", "Mount tightening & waterproofing", "F-connector replacement"],
    faqs: [],
  },
  {
    name: "Decoder Troubleshooting & Repair",
    slug: "decoder-troubleshooting",
    description: "Resolving decoder rebooting loops, smart card read errors, power supply failures, and AV/HDMI output malfunctions.",
    price: 120.0,
    estimatedTime: "1 - 2 Hours",
    category: "installation" as const,
    image: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=600&auto=format&fit=crop",
    features: ["Power board repair", "Firmware flash recovery", "HDMI port replacement"],
    faqs: [],
  },
  {
    name: "Signal Loss Fixing",
    slug: "signal-loss-fixing",
    description: "Diagnostic scan for signal drops (E48-32 error), cable splits, short circuits, or heavy tree obstruction blockages.",
    price: 90.0,
    estimatedTime: "1 Hour",
    category: "installation" as const,
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=600&auto=format&fit=crop",
    features: ["Faulty coaxial wire swapping", "LNB skew calibration", "Obstruction clearance audit"],
    faqs: [],
  },
  {
    name: "Subscription Activation Assistance",
    slug: "subscription-activation",
    description: "Assistance clearing error codes, resetting accounts, activating channels, and configuring Mobile Money auto-debits.",
    price: 50.0,
    estimatedTime: "30 Mins",
    category: "installation" as const,
    image: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?q=80&w=600&auto=format&fit=crop",
    features: ["Clearing activation error codes", "MoMo debit integration setup", "Package plan switching"],
    faqs: [],
  },
];

async function runSeed() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set in environment. Cannot seed.");
    process.exit(1);
  }

  try {
    console.log("Connecting to database at: ", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    // 1. Clear database
    console.log("Clearing existing collections...");
    await User.deleteMany({});
    await Service.deleteMany({});
    await Coupon.deleteMany({});
    await Review.deleteMany({});
    await Booking.deleteMany({});
    await BlogPost.deleteMany({});

    // 2. Seed Admin & Technician Users
    console.log("Seeding User Accounts...");
    
    // Hash passwords
    const hashedAdminPass = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const hashedTechPass = await bcrypt.hash("TechFixTech2026!", 12);

    const adminUser = await User.create({
      name: "TechFix Owner",
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedAdminPass,
      role: "admin",
    });
    console.log(`Admin user created: ${adminUser.email}`);

    const techUser = await User.create({
      name: "Yaw Satellite Technician",
      email: "tech@techfix.com",
      password: hashedTechPass,
      role: "technician",
    });
    console.log(`Technician user created: ${techUser.email}`);

    // 3. Seed Services
    console.log("Seeding Services...");
    const createdServices = await Service.insertMany(SERVICES_DATA);
    console.log(`Seeded ${createdServices.length} services (7 phone, 8 satellite).`);

    // 4. Seed Coupons
    console.log("Seeding Coupons...");
    const coupons = await Coupon.insertMany([
      {
        code: "WELCOME10",
        discountType: "percentage",
        discountValue: 10,
        expirationDate: new Date("2028-12-31"),
        active: true,
        maxUses: 100,
        usedCount: 0,
      },
      {
        code: "DORMAAFIFTY",
        discountType: "fixed",
        discountValue: 50,
        expirationDate: new Date("2028-12-31"),
        active: true,
        maxUses: 50,
        usedCount: 0,
      },
    ]);
    console.log(`Seeded ${coupons.length} coupons.`);

    // 5. Seed Reviews
    console.log("Seeding Reviews...");
    await Review.insertMany([
      {
        name: "Abena Mansah",
        serviceId: createdServices[0]._id, // Screen Replacement
        rating: 5,
        comment: "Excellent repair service! They replaced my cracked Tecno screen in just an hour. Truly glassmorphic finish and amazing customer service in Dormaa.",
        status: "approved",
      },
      {
        name: "Kwame Boateng",
        serviceId: createdServices[2]._id, // Android Unlock
        rating: 5,
        comment: "Unlocked my network-locked Samsung from US so I could use MTN. The bypass was fast, took less than an hour. GHS 120 well spent!",
        status: "approved",
      },
      {
        name: "Sampson Yeboah",
        serviceId: createdServices[4]._id, // FRP Bypass
        rating: 5,
        comment: "Highly recommended. Locked out of my phone after format. They bypassed the google lock instantly. Fast and affordable.",
        status: "approved",
      },
      {
        name: "Eric Mensah",
        serviceId: createdServices[7]._id, // DStv Setup
        rating: 5,
        comment: "Excellent DStv Explora setup. The technician was highly professional, installed the dish bracket firmly, aligned it with a digital scanner, and locked in maximum signal. 5 stars!",
        status: "approved",
      },
    ]);
    console.log("Seeded reviews.");

    // 6. Seed Blog Posts
    console.log("Seeding Blog posts...");
    await BlogPost.insertMany([
      {
        title: "How to Keep Your Phone Battery Healthy",
        slug: "how-to-keep-your-phone-battery-healthy",
        content: `Your phone battery degrades over time. Keep your battery charge level between 20% and 80%, avoid leaving it on hot car dashboards, and use original high-voltage adapters.`,
        excerpt: "Simple tips to prolong your Android or iPhone battery life and avoid swollen batteries.",
        author: "TechFix Technician",
        image: "https://images.unsplash.com/photo-1601524909162-be87252be298?q=80&w=600&auto=format&fit=crop",
        tags: ["Battery", "Maintenance"],
        status: "published",
      },
      {
        title: "Fixing Common DStv Signal Issues in Ghana",
        slug: "fixing-dstv-signal-issues",
        content: `Is your decoder showing 'E48-32 No Signal'? Here is a quick diagnostic list:
        
1. **Check the Cable Connections**: Verify that the F-connector on the back of your decoder is screwed on firmly.
2. **Inspect the Dish LNB**: Heavy rainfall or wind can shift your satellite dish slightly or misalign LNB angles.
3. **LNB Failure**: LNBs can crack over time due to direct sunshine. Swapping a faulty LNB takes less than 15 minutes.

If your dish Mount shifted or signal levels remain poor, book a digital satellite dish alignment session with our field service squad!`,
        excerpt: "A diagnostic checklist to resolve DStv 'E48-32 No Signal' errors in Ghana.",
        author: "Yaw Satellite Technician",
        image: "https://images.unsplash.com/photo-1528243097678-73904f09d526?q=80&w=600&auto=format&fit=crop",
        tags: ["DStv", "GOtv", "Signal Fix", "Satellite"],
        status: "published",
      },
    ]);

    // 7. Seed Sample Bookings
    console.log("Seeding Sample Bookings...");
    
    // Phone booking
    await Booking.create({
      trackingId: "TFU-928135",
      customerName: "Kofi Owusu",
      customerEmail: "customer@example.com",
      customerPhone: "+233244123456",
      deviceBrand: "Samsung",
      deviceModel: "Galaxy S23 Ultra",
      deviceImei: "359876543210987",
      issueDescription: "Cracked screen glass, touch is fine.",
      imageUploads: ["https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?q=80&w=600&auto=format&fit=crop"],
      serviceId: createdServices[0]._id,
      date: new Date(),
      timeSlot: "10:00 AM - 11:30 AM",
      status: "Diagnosing",
      statusHistory: [
        { status: "Pending", note: "Booking registered online.", updatedAt: new Date(Date.now() - 1000 * 60 * 120) },
        { status: "Confirmed", note: "Device received in shop.", updatedAt: new Date(Date.now() - 1000 * 60 * 60) },
        { status: "Diagnosing", note: "Technician starting micro-assembly inspection.", updatedAt: new Date() },
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
    });

    // TV booking (assigned to technician techUser)
    await Booking.create({
      trackingId: "TFU-721098",
      customerName: "Eric Mensah",
      customerEmail: "eric.mensah@gmail.com",
      customerPhone: "+233209876543",
      isTvService: true,
      decoderType: "DStv",
      roomsNumber: 2,
      installationType: "New installation",
      hasDishInstalled: "No",
      installationLocationDetails: "Plot 12, Block C, opposite Presbyterian Hospital Gate, Dormaa Ahenkro",
      preferredVisitTime: "morning",
      issueDescription: "Brand new DStv Explora setup. Need dish mount, drilling, multi-room link and activation assistance.",
      imageUploads: ["https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop"],
      serviceId: createdServices[7]._id, // DStv installation
      date: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
      timeSlot: "08:30 AM - 10:00 AM",
      status: "Confirmed",
      statusHistory: [
        { status: "Pending", note: "Installation booking submitted online.", updatedAt: new Date(Date.now() - 1000 * 60 * 30) },
        { status: "Confirmed", note: "Booking confirmed. Technician Yaw Satellite Technician assigned.", updatedAt: new Date() },
      ],
      assignedTechnician: techUser._id,
      technicianNotes: "Assigned for morning visit slot tomorrow. Packing Explora LNB and dish mount kit.",
      originalPrice: 250,
      discountedPrice: 0,
      finalPrice: 250,
      paymentStatus: "Paid",
      paymentDetails: {
        reference: "txn_ref_721098",
        channel: "Telecel Cash",
        paidAt: new Date(),
      },
    });

    console.log("All seed data successfully loaded. Exiting.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed: ", error);
    process.exit(1);
  }
}

runSeed();
