import User from "@/model/User";
import { connectToDb } from "@/mongodb";

export const POST = async (req, {params}) => {
    try {
        await connectToDb();
        const {userId} = params;
        const {username, profileImage} = await req.json();

        const updatedUser = await User.findByIdAndUpdate(userId, {
            username: username,
            profileImage: profileImage
        }, {new: true})

        return new Response(JSON.stringify(updatedUser), {status: 200})

    } catch(error) {
        console.log(error);
        return new Response("Failed to update user", { status: 500 })
    }
}
export const GET = async (req, { params }) => {
    try {
        await connectToDb();
        const {userId} = params;
        const user = await User.findByIdAndUpdate(userId, { lastActive: Date.now() });
        if (!user) {
          return new Response("User not found!", {status: 404});
        }

        return new Response(JSON.stringify(user), {status: 200});
    } catch(error) {
        return new Response("Error to update user's status", {status: 400}); 
    }
}