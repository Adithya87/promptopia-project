import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb-client";
import User from "@/lib/models/user";
import { connectToDatabase } from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, user }) {
      if (session && user) {
        session.user.id = user.id;
        session.user.email = user.email || "";
        
        // Fetch profile completion status from database
        try {
          await connectToDatabase();
          const userDoc = await User.findById(user.id);
          if (userDoc) {
            session.user.profileComplete = userDoc.profileComplete || false;
          }
        } catch (err) {
          console.error("Failed to fetch profile status:", err);
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
