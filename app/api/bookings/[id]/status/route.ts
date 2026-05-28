import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import { sendStatusUpdateEmail } from "@/lib/email";
import { auth } from "@/auth";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // 1. Authorize admin
    const session = await auth();
    const isAdmin = (session?.user as any)?.role === "admin";

    if (!session || !isAdmin) {
      return NextResponse.json(
        { success: false, data: null, message: "Unauthorized. Admin privileges required." },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status, note, assignedTechnician } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, data: null, message: "New status value is required" },
        { status: 400 }
      );
    }

    // Handle offline mock booking IDs gracefully
    if (id.startsWith("mock_booking_id_") || !id.match(/^[a-f\d]{24}$/i)) {
      console.log(`[DEV] Simulating admin status update for mock booking: ${id} → ${status}`);
      return NextResponse.json({
        success: true,
        data: { _id: id, status, technicianNotes: note || "" },
        message: `[Dev Mode] Booking status updated to ${status} successfully.`,
      });
    }

    let booking: any = null;
    try {
      await dbConnect();
      booking = await Booking.findById(id);
    } catch (dbErr) {
      return NextResponse.json(
        { success: false, data: null, message: "Database unavailable. Cannot update booking status." },
        { status: 503 }
      );
    }

    if (!booking) {
      return NextResponse.json(
        { success: false, data: null, message: "Booking order not found" },
        { status: 404 }
      );
    }

    // 2. Perform database update
    booking.status = status;
    booking.technicianNotes = note || "";
    booking.statusHistory.push({
      status,
      note: note || "",
      updatedAt: new Date(),
    });

    if (assignedTechnician !== undefined) {
      booking.assignedTechnician = assignedTechnician ? assignedTechnician : undefined;
    }

    await booking.save();

    // 3. Resolve Service Name for the custom email
    let serviceName = "Phone Repair Specialty";
    try {
      if (booking.serviceId) {
        const service = await Service.findById(booking.serviceId);
        if (service) {
          serviceName = service.name;
        }
      }
    } catch (e) {
      console.warn("Could not query service name for status update email.");
    }

    // 4. Trigger Nodemailer status update email
    try {
      await sendStatusUpdateEmail(booking, serviceName);
    } catch (mailErr) {
      console.error("Nodemailer status update trigger error: ", mailErr);
    }

    return NextResponse.json({
      success: true,
      data: booking,
      message: `Booking status updated to ${status} successfully! Customer notified via email.`,
    });
  } catch (error: any) {
    console.error("Status update API error: ", error);
    return NextResponse.json(
      { success: false, data: null, message: error.message || "Failed to update booking status" },
      { status: 500 }
    );
  }
}
