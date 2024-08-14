"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { ChatList } from "@/components/ChatList";
import { pusherClient } from "@/lib/pusher";
import Image from "next/image";
const Chats = () => {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const user = session?.user as any;   
    const [chats, setChats] = useState([]); 

    const getChats = useCallback( async () => {
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
    }, [user]);
    const updateUserActivity = useCallback(async () => {
        try {
            await fetch(`/api/users/${user?._id}/update`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
        } catch (error) {
            console.error("Error updating user activity:", error);
        }
    }, [user]);
    useEffect(() => {
        if (user) {
          updateUserActivity();
          const interval = setInterval(updateUserActivity, 60000); // Update every minute
          return () => clearInterval(interval);
        }
    }, [user]);

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
    
            const handleChatUpdate = (updatedChat:any) => {
                setChats((prevChats) => {
                    const chatIndex = prevChats.findIndex((chat : any) => chat._id === updatedChat._id);
                    if (chatIndex !== -1) {
                        // Replace the existing chat
                        const newChats = [...prevChats] as any;
                        newChats[chatIndex].messages.push(updatedChat.message);
                        newChats[chatIndex].lastMessageAt = updatedChat.message.createdAt;
                        if (
                            newChats[chatIndex]?.messages.length > 0 &&
                            newChats[chatIndex].messages[newChats[chatIndex].messages.length - 1]?.audioCall?.isCalling
                        ) {
                            const url = `/room/${newChats[chatIndex]._id}`;
                            const windowFeatures = 'width=1200,height=800,scrollbars=yes,resizable=yes';
                            window.open(url, 'newwindow', windowFeatures);
                        }
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
        <div className="flex flex-row h-full w-full">
            <ChatList currentUserId={user?._id} chats={chats} />
            <div className="flex flex-col -mt-10 gap-5 items-center justify-center flex-grow">
                <Image
                    width={300}
                    height={300}
                    src="/messenger-icon.png"
                    alt="message icon"
                    className="w-1/4"
                />
               <div className="typewriter text-white font-bold ml-2 flex flex-col items-center">
                    <div className="line line-1">Welcome to NextJSAppChat!</div>
                    <div className="line line-2">Start new conversations, enjoy seamless connections with loved ones.</div>
                    <div className="line line-3">Dive into meaningful chats and make every interaction memorable.</div>
                </div>



            </div>
        </div>
    
    );
};

export default Chats;
