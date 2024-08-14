import { pusherServer } from "@/lib/pusher";
import AudioCall from "@/model/AudioCall";
import Chat from "@/model/Chat";
import Message from "@/model/Message";
import User from "@/model/User";
import { connectToDb } from "@/mongodb";
import { NextResponse } from 'next/server';

export const POST = async (req:any) => {
    try {
        await connectToDb();

        const formData = await req.formData();
        const chatId = formData.get("chatId");
        const currentUserId = formData.get("currentUserId");
        const isCalling = formData.get("isCalling");
        const response = formData.get("response");
        const messageId = formData.get("messageId");
        console.log(response)
        // Find the current user
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return new NextResponse("User not found", { status: 404 });
        }
        if (messageId) {
            try {
                // Find the existing message by messageId
                let message = await Message.findById(messageId).populate({
                    path: "audioCall",
                    model: AudioCall
                }).exec();
        
                if (message) {
                    // Calculate the time difference in milliseconds
                    const timeDifference = Date.now() - message.createdAt.getTime();
                    message.timeCount = timeDifference; // Ensure this is a number
                    
                    message.response = response;
                    // Save the updated message
                    await message.save();
        
                    // Optionally update audioCall with other fields if necessary
                    if (message.audioCall) {
                        await AudioCall.findByIdAndUpdate(message.audioCall._id, {
                            isCalling: isCalling === "true",
                            response: response
                        });
        
                        // Repopulate the updated audioCall fields
                        message = await message.populate(
                            [
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
                        );
                    }
        
                    // Trigger the Pusher event with the updated message
                    await pusherServer.trigger(chatId, "update-message-audio", message);
                }
            } catch (error) {
                console.error("Error updating message or audioCall:", error);
                // Handle the error appropriately, such as sending a response or logging it
            }
        }
        
        else {
            const audioCall = new AudioCall({
                isCalling: isCalling == "true" ? true : false,
                response: response
            });
            await audioCall.save();
            // Create a new message
            const message = new Message({
                sender: currentUser,
                seenBy: currentUser,
                audioCall: audioCall
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
            updatedChat.members.forEach(async (member:any) => {
                await pusherServer.trigger(member._id.toString(), "update-chat", {
                    message: message,
                    _id: updatedChat._id,
                });
            });
        }
        

        return new NextResponse("Sent message successfully", { status: 200 });
    } catch (error:any) {
        console.error(error);
        return new NextResponse("Failed to send a message: " + error.message, {
            status: 500,
        });
    }
};


