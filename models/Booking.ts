import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStatusUpdate {
  status:
    | "Pending"
    | "Confirmed"
    | "Diagnosing"
    | "Repairing"
    | "Completed"
    | "Ready for Pickup"
    | "Delivered"
    | "Cancelled"
    | "On the way"
    | "Installing";
  note?: string;
  updatedAt: Date;
}

export interface IBooking extends Document {
  trackingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deviceBrand?: string;
  deviceModel?: string;
  deviceImei?: string;
  issueDescription: string;
  imageUploads: string[]; // Cloudinary URLs
  serviceId: mongoose.Types.ObjectId; // References Service
  date: Date;
  timeSlot: string;
  status:
    | "Pending"
    | "Confirmed"
    | "Diagnosing"
    | "Repairing"
    | "Completed"
    | "Ready for Pickup"
    | "Delivered"
    | "Cancelled"
    | "On the way"
    | "Installing";
  statusHistory: IStatusUpdate[];
  technicianNotes?: string;
  couponCode?: string;
  originalPrice: number;
  discountedPrice: number;
  finalPrice: number;
  paymentStatus: "Pending" | "Paid" | "Failed";
  paymentDetails?: {
    reference?: string;
    channel?: string;
    paidAt?: Date;
  };
  isTvService?: boolean;
  decoderType?: "DStv" | "GOtv" | "Startimes" | "Other";
  roomsNumber?: number;
  installationType?: "New installation" | "Repair" | "Re-alignment";
  hasDishInstalled?: "Yes" | "No";
  installationLocationDetails?: string;
  preferredVisitTime?: "morning" | "afternoon" | "evening";
  assignedTechnician?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StatusUpdateSchema = new Schema<IStatusUpdate>({
  status: {
    type: String,
    enum: [
      "Pending",
      "Confirmed",
      "Diagnosing",
      "Repairing",
      "Completed",
      "Ready for Pickup",
      "Delivered",
      "Cancelled",
      "On the way",
      "Installing",
    ],
    required: true,
  },
  note: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

const BookingSchema: Schema<IBooking> = new Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
    },
    deviceBrand: {
      type: String,
      required: [function(this: any) { return !this.isTvService; }, "Device brand is required"],
      trim: true,
    },
    deviceModel: {
      type: String,
      required: [function(this: any) { return !this.isTvService; }, "Device model is required"],
      trim: true,
    },
    deviceImei: {
      type: String,
      trim: true,
    },
    issueDescription: {
      type: String,
      required: [true, "Description of the problem is required"],
    },
    isTvService: {
      type: Boolean,
      default: false,
    },
    decoderType: {
      type: String,
      enum: ["DStv", "GOtv", "Startimes", "Other"],
    },
    roomsNumber: {
      type: Number,
    },
    installationType: {
      type: String,
      enum: ["New installation", "Repair", "Re-alignment"],
    },
    hasDishInstalled: {
      type: String,
      enum: ["Yes", "No"],
    },
    installationLocationDetails: {
      type: String,
    },
    preferredVisitTime: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
    },
    assignedTechnician: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    imageUploads: [{ type: String }],
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Diagnosing",
        "Repairing",
        "Completed",
        "Ready for Pickup",
        "Delivered",
        "Cancelled",
        "On the way",
        "Installing",
      ],
      default: "Pending",
    },
    statusHistory: [StatusUpdateSchema],
    technicianNotes: {
      type: String,
    },
    couponCode: {
      type: String,
      uppercase: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    paymentDetails: {
      reference: { type: String },
      channel: { type: String },
      paidAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Add index on customerEmail for fast searches
BookingSchema.index({ customerEmail: 1 });

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
