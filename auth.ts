import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { authConfig } from "./auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        try {
          await dbConnect();
          const user = await User.findOne({ email }).select("+password");

          if (user && user.password) {
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (isPasswordMatch) {
              return {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
              };
            }
          }
        } catch (dbErr) {
          console.warn("MongoDB connection failed inside auth.ts. Entering offline/dev mode: ", dbErr);
        }

        // --- DEVELOPER / OFFLINE FALLBACK ACCOUNTS ---
        // This allows logging in and testing locally without needing a running MongoDB server!
        if (email === "admin@techfix.com" && password === "TechFixDormaa2026!") {
          return {
            id: "dev_admin_offline",
            name: "TechFix Owner (Offline Dev Mode)",
            email: "admin@techfix.com",
            role: "admin",
          };
        }

        if (email === "tech@techfix.com" && password === "TechFixTech2026!") {
          return {
            id: "dev_tech_offline",
            name: "Yaw Satellite Technician (Offline Dev Mode)",
            email: "tech@techfix.com",
            role: "technician",
          };
        }

        throw new Error("Incorrect email or password.");
      },
    }),
  ],
});
