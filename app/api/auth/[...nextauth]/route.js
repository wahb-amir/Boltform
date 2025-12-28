import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },

  adapter: MongoDBAdapter(clientPromise, {
    databaseName: "Ecommer_user",
  }),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // ✅ Custom Callbacks
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // console.log("JWT callback 🔐", { profile, account });
        token.name = profile.name;
        token.email = profile.email;
        token.picture = profile.picture;
      }
      return token;
    },

    async session({ session, token }) {
      // console.log("Session callback 💼", { token });
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.picture;
      return session;
    },
  },

});

export { handler as GET, handler as POST };
