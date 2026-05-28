import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFAQ {
  question: string;
  answer: string;
}

export interface IService extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  estimatedTime: string;
  faqs: IFAQ[];
  image: string;
  features: string[];
  category: "repair" | "unlock" | "software" | "installation";
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const ServiceSchema: Schema<IService> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    estimatedTime: {
      type: String,
      required: [true, "Estimated completion time is required"],
    },
    faqs: [FAQSchema],
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    features: [{ type: String }],
    category: {
      type: String,
      enum: ["repair", "unlock", "software", "installation"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent hot-reload duplicate model compilation
const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);

export default Service;
