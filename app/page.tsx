import dbConnect from "@/lib/db";
import Service from "@/models/Service";
import Review from "@/models/Review";
import HomeClient from "@/components/HomeClient";

// Ensure content is processed fresh
export const revalidate = 0;

export default async function HomePage() {
  let services: any[] = [];
  let reviews: any[] = [];

  try {
    await dbConnect();
    services = await Service.find({}).lean();
    reviews = await Review.find({ status: "approved" }).lean();
  } catch (error) {
    console.warn(
      "Database connection could not be established in Server Component. Landing page utilizing safe embedded mock assets."
    );
  }

  // Serialize Mongoose ObjectIds into simple strings for React client-side thread compliance
  const serializedServices = JSON.parse(JSON.stringify(services));
  const serializedReviews = JSON.parse(JSON.stringify(reviews));

  return <HomeClient services={serializedServices} reviews={serializedReviews} />;
}
