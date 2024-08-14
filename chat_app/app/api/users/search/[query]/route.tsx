import User from "@/model/User";
import { connectToDb } from "@/mongodb";

export const GET = async (req:any, { params }:{params:any}) => {
    try {
        await connectToDb();
        const { query } = params;
        const contacts = query == "!@" ? await User.find() : await User.find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } }
            ]
        });
        return new Response(JSON.stringify(contacts), { status: 200 });
    } catch (error) {
        console.log(error);
        return new Response("Failed to search contacts", { status: 500 });
    }
};
