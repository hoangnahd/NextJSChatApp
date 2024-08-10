"use client"
import { useParams, usePathname } from 'next/navigation';
import Calls from "@/components/Calls";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { pusherClient } from '@/lib/pusher';

export default function Page() {
    const {chatId} = useParams();
    const [chat, setChat] = useState(null)
    const [loading, setLoading] = useState(true);
    const {data: session, status} = useSession();
    const user = session?.user;
    const appId = process.env.PUBLIC_AGORA_APP_ID
    
    console.log(appId)
    const getChats = async () => {
        try {
            const response = await fetch(`/api/chats/${chatId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const result = await response.json();
            setChat(result);
        }
        catch (err) {
            
            console.log('Error fetching chat details:', err);
        }
    };
    useEffect(() => {
        if(chatId && user) {
            getChats();
        }
    }, [chatId, user])
    useEffect(() => {
        setLoading(true)
        if(chat) {
            setLoading(false)
        }
    }, [chat])
    useEffect(() => {
        if (user && chat) {
            const channel = pusherClient.subscribe(chatId.toString());
    
            const handleMessage = (updatedMessage) => {
                const status = updatedMessage.audioCall?.response;
                console.log(updatedMessage)
    
                // Check if the call has ended or was canceled
                if (status === "end" || status === "cancel") {
                    window.close();
                }
    
                // Update the specific message in the chat by searching for its id
                setChat(prevChat => {
                    const updatedChat = { ...prevChat };
                    
                    updatedChat.messages.push(updatedMessage);
    
                    return updatedChat;
                });
            };
           
            channel.bind("update-message-audio", handleMessage);
    
            // Cleanup on component unmount
            return () => {
                channel.unbind("update-message-audio", handleMessage);
                pusherClient.unsubscribe(chatId.toString());
            };
        }
    }, [user, chat]);
    
    
    return loading ? (
        <div className="flex justify-center -mt-16 items-center h-full">
            <div className="loader"></div>
        </div>
    ) : (
        <div className="flex w-full flex-col">
            <Calls appId={appId} chat={chat} currentUserId={user?._id}></Calls>
        </div>
    );
}
