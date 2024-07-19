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