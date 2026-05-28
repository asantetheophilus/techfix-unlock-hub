import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { sendStatusUpdateEmail } from "@/lib/email";
import { auth } from "@/auth";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    const isTech = (session?.user as any)?.role === "technician" || (session?.user as any)?.role === "admin";

    if (!session || !isTech) {
      return NextResponse.json(
        { success: false, data: null, message: "Unauthorized. Technician credentials required." },
        { status: 401 }
      );
    }

    const { id } = params;
    const techId = (session.user as any).id;
    const body = await request.json();
    const { status, note, images = [] } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, data: null, message: "New status value is required" },
        { status: 400 }
      );
    }

    // Handle offline mock job IDs (they don't exist in DB) gracefully
    if (id.startsWith("mock_job_")) {
      console.log(`[DEV] Simulating status update for offline mock job: ${id} → ${status}`);
      return NextResponse.json({
        success: true,
        data: { _id: id, status, technicianNotes: note || "" },
        message: `[Dev Mode] Mock job status updated to ${status} successfully.`,
      });
    }

    let booking: any = null;
    try {
      await dbConnect();
      booking = await Booking.findById(id);
    } catch (dbErr) {
      return NextResponse.json(
        { success: false, data: null, message: "Database unavailable. Cannot update live job." },
        { status: 503 }
      );
    }

    if (!booking) {
      return NextResponse.json(
        { success: false, data: null, message: "Booking order not found" },
        { status: 404 }
      );
    }

    // Verify assignment (admins can bypass this check)
    const isAdmin = (session?.user as any)?.role === "admin";
    if (!isAdmin && booking.assignedTechnician?.toString() !== techId) {
      return NextResponse.json(
        { success: false, data: null, message: "Unauthorized. This job is assigned to another technician." },
        { status: 403 }
      );
    }

    // Upload completion images if provided
    const cloudinaryUrls: string[] = [];
    for (const base64Img of images) {
      if (base64Img.startsWith("data:image")) {
        try {
          const url = await uploadToCloudinary(base64Img);
          cloudinaryUrls.push(url);
        } catch (uploadErr) {
          console.error("Cloudinary upload failed: ", uploadErr);
        }
      } else {
        cloudinaryUrls.push(base64Img);
      }
    }

    // Update booking details
    booking.status = status;
    booking.technicianNotes = note || "";
    booking.statusHistory.push({
      status,
      note: note || "",
      updatedAt: new Date(),
    });

    if (cloudinaryUrls.length > 0) {
      // Append completion photos to existing images
      booking.imageUploads = [...(booking.imageUploads || []), ...cloudinaryUrls];
    }

    await booking.save();

    // Resolve Service Name for the custom email
    let serviceName = "Digital TV Setup & Installation";
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

    // Trigger Nodemailer status update email to the customer
    try {
      await sendStatusUpdateEmail(booking, serviceName);
    } catch (mailErr) {
      console.error("Nodemailer status update trigger error: ", mailErr);
    }

    return NextResponse.json({
      success: true,
      data: booking,
      message: `Job status updated to ${status} successfully! Customer notified.`,
    });
  } catch (error: any) {
    console.error("Technician status update API error: ", error);
    return NextResponse.json(
      { success: false, data: null, message: error.message || "Failed to update job status" },
      { status: 500 }
    );
  }
}
