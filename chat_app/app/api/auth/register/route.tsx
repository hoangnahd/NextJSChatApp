import User from "@/model/User";
import { connectToDb } from "@/mongodb";
import {hash} from "bcrypt";

export const POST = async (req, res) => {
    try {
        await connectToDb();

        const body = await req.json();
        const {email, username, password} = body;
        const existingUser = await User.findOne({email});

        if(existingUser) {
            return new Response("User already exists", {
                status: 400,
            })
        }
        const passwordHash = await hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: passwordHash
        })

        await newUser.save();
        return new Response(JSON.stringify(newUser), {
            status: 200
        })
    } catch (err) {
        console.log(err);
        return new Response("Failed to create new user", {
            status: 500
        })
    }
}