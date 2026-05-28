/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Packages that must stay server-side and not be bundled by webpack (Next.js 14.x syntax)
    serverComponentsExternalPackages: ["mongoose", "bcrypt", "nodemailer"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
