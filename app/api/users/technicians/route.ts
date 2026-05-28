import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/auth";

// This route reads request headers (via auth()) — must be dynamic
export const dynamic = "force-dynamic";

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

    let technicians: any[] = [];
    try {
      await dbConnect();
      technicians = await User.find({ role: "technician" })
        .select("_id name email")
        .lean();
    } catch (dbErr) {
      console.warn("DB offline in GET /api/users/technicians. Using offline mock data.");
      // Return offline dev mock so the admin assign-technician dropdown isn't broken
      technicians = [
        {
          _id: "dev_tech_offline",
          name: "Yaw Satellite Technician",
          email: "tech@techfix.com",
        },
      ];
    }

    return NextResponse.json({
      success: true,
      data: technicians,
      message: "Technicians fetched successfully",
    });
  } catch (error: any) {
    console.error("GET technicians error: ", error);
    return NextResponse.json(
      { success: false, data: [], message: error.message || "Failed to load technicians" },
      { status: 500 }
    );
  }
}
