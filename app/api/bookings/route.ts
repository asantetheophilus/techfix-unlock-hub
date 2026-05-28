import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import Coupon from "@/models/Coupon";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";


// Map static services for local fallback pricing resolution
const STATIC_SERVICES_PRICE_MAP: Record<string, { price: number; name: string }> = {
  "screen-replacement": { price: 250, name: "Screen Replacement" },
  "battery-replacement": { price: 150, name: "Battery Replacement" },
  "android-unlocking": { price: 120, name: "Android Unlocking" },
  "iphone-unlocking": { price: 320, name: "iPhone Unlocking" },
  "frp-bypass": { price: 80, name: "FRP Bypass" },
  "software-flashing": { price: 100, name: "Software Flashing" },
  "water-damage-repair": { price: 200, name: "Water Damage Repair" },
};

// GET: Securely fetch all bookings (Admin Only)
export async function GET() {
  try {
    const session = await auth();
    const isAdmin = (session?.user as any)?.role === "admin";

    if (!session || !isAdmin) {
      return NextResponse.json(
        { success: false, data: null, message: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    await dbConnect();
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: bookings,
      message: "Bookings fetched successfully",
    });
  } catch (error: any) {
    console.error("GET bookings error: ", error);
    return NextResponse.json(
      { success: false, data: [], message: error.message || "Failed to load bookings" },
      { status: 500 }
    );
  }
}

// POST: Create a new booking
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      deviceBrand,
      deviceModel,
      deviceImei,
      issueDescription,
      imageUploads = [], // Array of base64 images
      serviceSlug,
      date,
      timeSlot,
      couponCode,
      // Satellite TV installation fields
      isTvService,
      decoderType,
      roomsNumber,
      installationType,
      hasDishInstalled,
      installationLocationDetails,
      preferredVisitTime,
    } = body;

    const isTv = !!isTvService;

    // Basic validation (conditional on phone repairs vs TV installations)
    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      (!isTv && (!deviceBrand || !deviceModel)) ||
      (isTv && !installationLocationDetails) ||
      !issueDescription ||
      !serviceSlug ||
      !date ||
      !timeSlot
    ) {
      return NextResponse.json(
        { success: false, data: null, message: "Missing required booking details" },
        { status: 400 }
      );
    }

    // Generate unique Tracking ID: TFU-XXXXXX
    const trackingNum = Math.floor(100000 + Math.random() * 900000);
    const trackingId = `TFU-${trackingNum}`;

    // Resolve Service Price
    let originalPrice = 250; // Default fallback
    let serviceName = "Phone Repair & Unlock Service";
    let dbServiceId = "507f1f77bcf86cd799439011"; // Mock ObjectId

    // Try DB lookup
    try {
      await dbConnect();
      const service = await Service.findOne({ slug: serviceSlug });
      if (service) {
        originalPrice = service.price;
        serviceName = service.name;
        dbServiceId = service._id.toString();
      } else if (STATIC_SERVICES_PRICE_MAP[serviceSlug]) {
        originalPrice = STATIC_SERVICES_PRICE_MAP[serviceSlug].price;
        serviceName = STATIC_SERVICES_PRICE_MAP[serviceSlug].name;
      }
    } catch (dbErr) {
      console.warn("DB offline for pricing resolution. Using static config.");
      if (STATIC_SERVICES_PRICE_MAP[serviceSlug]) {
        originalPrice = STATIC_SERVICES_PRICE_MAP[serviceSlug].price;
        serviceName = STATIC_SERVICES_PRICE_MAP[serviceSlug].name;
      }
    }

    // Process Coupon Discount
    let discountedPrice = 0;
    let finalPrice = originalPrice;

    if (couponCode) {
      const codeUpper = couponCode.trim().toUpperCase();
      if (codeUpper === "WELCOME10") {
        discountedPrice = originalPrice * 0.1;
        finalPrice = originalPrice - discountedPrice;
      } else if (codeUpper === "DORMAAFIFTY") {
        discountedPrice = Math.min(50, originalPrice);
        finalPrice = originalPrice - discountedPrice;
      } else {
        // Try DB Coupon lookup
        try {
          const coupon = await Coupon.findOne({ code: codeUpper, active: true });
          if (coupon && new Date(coupon.expirationDate) > new Date()) {
            if (coupon.discountType === "percentage") {
              discountedPrice = originalPrice * (coupon.discountValue / 100);
            } else {
              discountedPrice = coupon.discountValue;
            }
            discountedPrice = Math.min(discountedPrice, originalPrice);
            finalPrice = originalPrice - discountedPrice;
            
            // Increment coupon uses
            coupon.usedCount += 1;
            await coupon.save();
          }
        } catch (couponErr) {
          console.warn("Could not query coupons in db: ", couponErr);
        }
      }
    }

    // Upload Images to Cloudinary
    const cloudinaryUrls: string[] = [];
    for (const base64Img of imageUploads) {
      if (base64Img.startsWith("data:image")) {
        try {
          const url = await uploadToCloudinary(base64Img);
          cloudinaryUrls.push(url);
        } catch (uploadErr) {
          console.error("Cloudinary upload failed in endpoint: ", uploadErr);
        }
      } else {
        cloudinaryUrls.push(base64Img);
      }
    }

    // Create Booking Object
    const bookingData = {
      trackingId,
      customerName,
      customerEmail: customerEmail.toLowerCase(),
      customerPhone,
      deviceBrand: isTv ? "Satellite TV Setup" : deviceBrand,
      deviceModel: isTv ? decoderType || "Decoder" : deviceModel,
      deviceImei: deviceImei || undefined,
      issueDescription,
      imageUploads: cloudinaryUrls.length > 0 ? cloudinaryUrls : [
        "https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?q=80&w=600&auto=format&fit=crop"
      ],
      serviceId: dbServiceId,
      date: new Date(date),
      timeSlot,
      status: "Pending" as const,
      statusHistory: [
        {
          status: "Pending" as const,
          note: isTv ? "Installation booking submitted online." : "Repair booking submitted online.",
          updatedAt: new Date(),
        },
      ],
      originalPrice,
      discountedPrice,
      finalPrice,
      paymentStatus: "Pending" as const,
      // TV specific fields
      isTvService: isTv,
      decoderType: isTv ? decoderType : undefined,
      roomsNumber: isTv ? Number(roomsNumber) : undefined,
      installationType: isTv ? installationType : undefined,
      hasDishInstalled: isTv ? hasDishInstalled : undefined,
      installationLocationDetails: isTv ? installationLocationDetails : undefined,
      preferredVisitTime: isTv ? preferredVisitTime : undefined,
    };

    let savedBooking: any = null;

    try {
      savedBooking = await Booking.create(bookingData);
    } catch (saveErr: any) {
      console.warn("Could not write booking to MongoDB. Carrying out sandbox mock booking: ", saveErr.message);
      savedBooking = { ...bookingData, _id: "mock_booking_id_" + trackingNum };
    }

    // Trigger Nodemailer Confirmation Email
    try {
      await sendBookingConfirmationEmail(savedBooking, serviceName);
    } catch (mailErr) {
      console.error("Failed to send booking email notification: ", mailErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        booking: savedBooking,
      },
      message: "Booking created successfully. Redirecting to tracking panel.",
    });
  } catch (error: any) {
    console.error("Booking API error: ", error);
    return NextResponse.json(
      { success: false, data: null, message: error.message || "Failed to submit booking" },
      { status: 500 }
    );
  }
}
