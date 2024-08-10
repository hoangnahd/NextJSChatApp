import Chat from "@/model/Chat";
import Message from "@/model/Message";
import User from "@/model/User";
import { connectToDb } from "@/mongodb";

export const GET = async (req, {params}) => {
    try {
        await connectToDb();
        const {userId} = params;
        const user = await User.findById(userId).populate({
            path: "chats",
            model: Chat,
            populate: [
                {
                    path: "members",
                    model: User
                },
                {
                    path: "messages",
                    model: Message,
                    populate: {
                        path: "sender seenBy",
                        model: User
                    }
                }
            ]
        });
        
        return new Response(JSON.stringify(user), {status: 200});
    } catch (error) {
        console.log(error);
        return new Response("Failed to fetch chat detail", {status: 400});
    }
};

