"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ChatList } from "@/components/ChatList";
import { pusherClient } from "@/lib/pusher";

const Chats = () => {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const user = session?.user;   
    const [chats, setChats] = useState([]);      
    const getChats = async () => {
        try {
            const response = await fetch(`/api/users/${user?._id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const result = await response.json();
            setChats(result?.chats);
        }
        catch (err) {
            
            console.log('Error fetching chat details:', err);
        }
    };
    useEffect(() => {
        setLoading(true);
        if (user) {          
            setTimeout(() => {
                getChats();
            }, 100)
            setLoading(false);
        }
        
    }, [user]);
    useEffect(() => {
        if (user) {
            pusherClient.subscribe(user?._id);
    
            const handleChatUpdate = (updatedChat) => {
                setChats((prevChats) => {
                    const chatIndex = prevChats.findIndex(chat => chat._id === updatedChat._id);
                    if (chatIndex !== -1) {
                        // Replace the existing chat
                        const newChats = [...prevChats];
                        newChats[chatIndex].messages.push(updatedChat.message);
                        newChats[chatIndex].lastMessageAt = updatedChat.message.createdAt;
                        return newChats;
                    }
                });
            }; 
          pusherClient.bind("update-chat", handleChatUpdate);
          return () => {
            pusherClient.unsubscribe(user?._id);
            pusherClient.unbind("update-chat", handleChatUpdate);
          };
        }
      }, [user]);

    return loading ? (
        <div className="flex justify-center -mt-16 items-center h-full">
            <div className="loader"></div>
        </div>
    ) : (
        <div className="flex flex-row h-full">
            <ChatList currentUserId={user?._id} chats={chats} />
        </div>
    );
};

export default Chats;
