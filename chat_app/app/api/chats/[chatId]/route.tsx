import { connectToDb } from "@/mongodb";
import Chat from "@/model/Chat";
import User from "@/model/User";
import Message from "@/model/Message";
import mongoose from "mongoose";
import AudioCall from "@/model/AudioCall";

export const GET = async (req, { params }) => {
    try {
        await connectToDb();
        const { chatId } = params;

        const chat = await Chat.findById(chatId).populate({
            path: "members",
            model: "User"
        }).populate({
            path: "messages",
            model: "Message",
            populate: [
                {
                    path: "sender",
                    model: User
                },
                {
                    path: "seenBy",
                    model: User
                },
                {
                    path: "audioCall",
                    model: AudioCall
                }
            ]
        }).exec();

        return new Response(JSON.stringify(chat), { status: 200 });
    } catch (error) {
        console.log(error);
        return new Response("Failed to fetch chat detail", { status: 400 });
    }
};



export const POST = async (req, {params}) => {
    try {
        await connectToDb();
        const body = await req.json();
        const {currentUserId} = body;
        const {chatId} = params;

        const userId = new mongoose.Types.ObjectId(currentUserId);
        const chatIdObj = new mongoose.Types.ObjectId(chatId);
        await Message.updateMany(
            { chat: chatIdObj },
            { $addToSet: { seenBy: userId } }
        );


        return new Response("Updated user seen all messages", { status: 200 });

    } catch(error) {
        console.log(error);
        return new Response("Failed to update seen message", {status: 400});
    }
}