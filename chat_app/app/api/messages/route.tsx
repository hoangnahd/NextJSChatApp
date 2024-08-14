import { pusherServer } from "@/lib/pusher";
import Chat from "@/model/Chat";
import Message from "@/model/Message";
import User from "@/model/User";
import { connectToDb } from "@/mongodb";
import path from 'path';
import fs from 'fs';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique file names


export const POST = async (req:any) => {
    try {
        await connectToDb();

        const formData = await req.formData();
        const text = formData.get("text")?.trim();
        const currentUserId = formData.get("currentUserId");
        const chatId = formData.get("chatId");
        const audio = formData.get("audio");
        const file = formData.get("file")?.trim();

        // Validate required fields
        if (!currentUserId || !chatId || (!text && !audio && !file)) {
            return new NextResponse("Invalid request parameters", { status: 400 });
        }

        // Save the audio file if present
        let audioFilePath = null;
        if (audio) {
            const uploadPath = path.join(process.cwd(), 'public/uploads/audio');
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            const uniqueFileName = `${uuidv4()}_${audio.name}`;
            const audioFileFullPath = path.join(uploadPath, uniqueFileName);
            const audioBuffer = Buffer.from(await audio.arrayBuffer());

            fs.writeFileSync(audioFileFullPath, audioBuffer);
            audioFilePath = `/uploads/audio/${uniqueFileName}`;
        }

        // Find the current user
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Create a new message
        const message = new Message({
            sender: currentUser,
            text: text || "",
            seenBy: [currentUser],
            audio: audioFilePath || "",
            file: file || ""
        });

        await message.save();

        // Update the chat with the new message
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            {
                $push: { messages: message },
                $set: { lastMessageAt: message.createdAt },
            },
            { new: true }
        );

        if (!updatedChat) {
            return new NextResponse("Chat not found", { status: 404 });
        }

        // Trigger Pusher events
        await pusherServer.trigger(chatId, "new-message", message);

        for (const member of updatedChat.members) {
            await pusherServer.trigger(member._id.toString(), "update-chat", {
                message: message,
                _id: updatedChat._id,
            });
        }

        return new NextResponse("Sent message successfully", { status: 200 });
    } catch (error:any) {
        console.error("Failed to send a message:", error);
        return new NextResponse("Failed to send a message: " + error.message, {
            status: 500,
        });
    }
};
