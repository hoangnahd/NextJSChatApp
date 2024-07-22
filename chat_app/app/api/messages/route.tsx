import Chat from "@/model/Chat";
import Message from "@/model/Message";
import User from "@/model/User";
import { connectToDb } from "@/mongodb";

export const GET = async (req) => {
    try {

        await connectToDb();
        const {chatId, currentUserId, text, photo} = await req.json();
        const currenUser = await User.findById(currentUserId);
        const message = await new Message({
            sender: currenUser,
            text: text,
            seendBy: currenUser,
            photo: photo
        })
        const updatedChat = await Chat.findByIdAndUpdate(chatId, {
            $push: {messages: message},
            $set: {lastMessageAt: message.createdAt}
        }, {new: true});

        return new Response("Sent message successfully", {status: 200});
    } catch(error) {
        console.log(error);
        return new Response("Failed to send a message", {status: 400})
    }
}