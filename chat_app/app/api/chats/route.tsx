import Chat from "@/model/Chat";
import User from "@/model/User";
import { connectToDb } from "@/mongodb";


export const POST = async (req:any) => {
    try {
        await connectToDb();

        const body = await req.json();
        const {currentUserId, isGroup, GroupPhoto, name, members} = body;
        const query =isGroup 
        ? {groupPhoto: GroupPhoto, name: name, members: [currentUserId, ...members]}
        : {members: {$all: [currentUserId, ...members], $size: 2}};

        const chat = await Chat.findOne(query);
        if(!chat) {
            const chatData = isGroup 
            ? {groupPhoto: GroupPhoto, name: name, members: [currentUserId, ...members]}
            : {members: [currentUserId, ...members]};
            const newChat = await new Chat(chatData)
            await newChat.save();

            // Update each member to include the new chat
            await Promise.all(newChat.members.map(async (member:any) => {
                // Ensure that member is an object with an id property
                await User.findByIdAndUpdate(member, {
                    $addToSet: { chats: newChat }
                }, { new: true });
            }));
            return new Response(JSON.stringify(newChat), {status: 200})
        }
        return new Response(JSON.stringify(chat), {status: 200})
    } catch(error) {
        console.log(error);
        return new Response("Failed to create a chat", {status: 500})
    }
}