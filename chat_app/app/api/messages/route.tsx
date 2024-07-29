import { pusherServer } from "@/lib/pusher";
import Chat from "@/model/Chat";
import Message from "@/model/Message";
import User from "@/model/User";
import { connectToDb } from "@/mongodb";

export const POST = async (req) => {
    try {

        await connectToDb();
        const {chatId, currentUserId, text, photo} = await req.json();
        const currentUser = await User.findById(currentUserId);
        const message = await new Message({
            sender: currentUser,
            text: text,
            seenBy: currentUser,
            photo: photo
        })
        message.save();
        const updatedChat = await Chat.findByIdAndUpdate(chatId, {
            $push: {messages: message},
            $set: {lastMessageAt: message.createdAt}
        }, {new: true});
        await pusherServer.trigger(chatId, "new-message", message);

        /* Triggers a Pusher event for each member of the chat about the chat update with the latest message */
        updatedChat.members.forEach(async (member) => {
            await pusherServer.trigger(member._id.toString(), "update-chat", {
                message: message,
                _id: updatedChat._id
            });
        })
        
        return new Response("Sent message successfully", {status: 200});
        
    } catch(error) {
        console.log(error);
        return new Response("Failed to send a message", {status: 400})
    }
}