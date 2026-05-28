import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Service from "@/models/Service";

// Safe static service dictionary in case of database timeout
const STATIC_SERVICES = [
  {
    _id: "1",
    name: "Screen Replacement",
    slug: "screen-replacement",
    description: "Premium display replacement with original OEM screen panels.",
    price: 250.0,
    estimatedTime: "1 - 2 Hours",
    category: "repair",
    features: ["Original OEM screen panels", "Lifetime warranty on touch"],
  },
  {
    _id: "2",
    name: "Battery Replacement",
    slug: "battery-replacement",
    description: "Certified original battery replacement with high-capacity cells.",
    price: 150.0,
    estimatedTime: "30 - 45 Mins",
    category: "repair",
    features: ["Grade A high capacity cells", "Overheating protection"],
  },
  {
    _id: "3",
    name: "Android Unlocking",
    slug: "android-unlocking",
    description: "Permanent network carrier unlock for Android devices.",
    price: 120.0,
    estimatedTime: "1 - 3 Hours",
    category: "unlock",
    features: ["Official permanent unlock", "No data loss required"],
  },
  {
    _id: "4",
    name: "iPhone Unlocking",
    slug: "iphone-unlocking",
    description: "Official factory whitelist IMEI unlock for iPhones.",
    price: 320.0,
    estimatedTime: "1 - 2 Days",
    category: "unlock",
    features: ["Official Apple whitelisting", "Supports all models"],
  },
  {
    _id: "5",
    name: "FRP Bypass",
    slug: "frp-bypass",
    description: "Google verification bypass for locked factory-reset Androids.",
    price: 80.0,
    estimatedTime: "30 - 60 Mins",
    category: "software",
    features: ["Latest security patch supported", "Safe firmware-safe process"],
  },
  {
    _id: "6",
    name: "Software Flashing",
    slug: "software-flashing",
    description: "Stock stock ROM firmware flashing to resolve bootloop issues.",
    price: 100.0,
    estimatedTime: "1 - 2 Hours",
    category: "software",
    features: ["Stock ROM flashing", "Fixes bootloop errors"],
  },
  {
    _id: "7",
    name: "Water Damage Repair",
    slug: "water-damage-repair",
    description: "Motherboard cleaning and micro-soldering solutions for liquid damages.",
    price: 200.0,
    estimatedTime: "1 - 2 Days",
    category: "repair",
    features: ["Ultrasonic cleaning", "Micro-soldering circuit restoration"],
  },
];

export async function GET() {
  try {
    await dbConnect();
    const dbServices = await Service.find({}).lean();
    
    if (dbServices.length > 0) {
      return NextResponse.json({
        success: true,
        data: dbServices,
        message: "Services fetched successfully",
      });
    }

    return NextResponse.json({
      success: true,
      data: STATIC_SERVICES,
      message: "Fallback services loaded successfully",
    });
  } catch (error: any) {
    console.warn("DB connection error in GET /api/services, loading static fallbacks.");
    return NextResponse.json({
      success: true,
      data: STATIC_SERVICES,
      message: "Fallback services loaded successfully (DB Timeout)",
    });
  }
}
