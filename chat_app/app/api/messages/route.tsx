import { pusherServer } from "@/lib/pusher";
import Chat from "@/model/Chat";
import Message from "@/model/Message";
import User from "@/model/User";
import { connectToDb } from "@/mongodb";
import path from 'path';
import fs from 'fs';
import { NextResponse } from 'next/server';

export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, since we're handling formData directly
    },
};

export const POST = async (req) => {
    try {
        await connectToDb();

        const formData = await req.formData();
        const text = formData.get("text");
        const currentUserId = formData.get("currentUserId");
        const chatId = formData.get("chatId");
        const audio = formData.get("audio");
        const file = formData.get("file");
        // Save the audio file if present
        let audioFilePath = null;
        if (audio) {
            const uploadPath = path.join(process.cwd(), 'public/uploads/audio');
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            const audioFileName = audio.name;
            const audioBuffer = Buffer.from(await audio.arrayBuffer());
            const audioFileFullPath = path.join(uploadPath, audioFileName);
            fs.writeFileSync(audioFileFullPath, audioBuffer);
            audioFilePath = `/uploads/audio/${audioFileName}`;
        }

        if (audioFilePath == "/uploads/audio/" && !text && !file) {
            return new NextResponse("Nothing to send", { status: 400 });
        }

        // Find the current user
        const currentUser = await User.findById(currentUserId);

        if (!currentUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Create a new message
        const message = new Message({
            sender: currentUser,
            text: text ? text.trim() : "",
            seenBy: currentUser,
            audio: audioFilePath || "",
            file: file ? file.trim() : ""
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
        updatedChat.members.forEach(async (member) => {
            await pusherServer.trigger(member._id.toString(), "update-chat", {
                message: message,
                _id: updatedChat._id,
            });
        });

        return new NextResponse("Sent message successfully", { status: 200 });
    } catch (error) {
        console.error(error);
        return new NextResponse("Failed to send a message: " + error.message, {
            status: 500,
        });
    }
};