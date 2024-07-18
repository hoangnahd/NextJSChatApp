import User from "@/model/User";
import { connectToDb } from "@/mongodb";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        await connectToDb();
        if(!credentials?.email || !credentials.password) {
          console.log("Invalid username or password")
          throw new Error("Invalid username or password");
        }
        // Add logic here to look up the user from the credentials supplied
        const user = await User.findOne({email: credentials?.email})
        console.log(user?.email)
        if (!user || !user?.password) {
          
          console.log("User does not exist")
          throw new Error("User does not exist!");
        } else {
          console.log(credentials?.password)
          const res = await compare(credentials?.password, user.password)
          if(!res) {
            console.log("Invalid password");
            throw new Error("Invalid password");
          }

          return user
        }
        
      }
    })
  ]
})


export {handler as GET, handler as POST}