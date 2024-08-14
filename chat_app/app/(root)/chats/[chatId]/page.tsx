"use client";
import { ChatDetail } from "@/components/ChatDetail";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChatList } from "@/components/ChatList";
import { pusherClient } from "@/lib/pusher";

const ChatPage = () => { 
    const { chatId } = useParams();
    const { data: session, status } = useSession();
    const user = session?.user as any;
    const [loading, setLoading] = useState(true);
    const [others, setOthers] = useState([]);  
    const [allMessages, setAllMessages] = useState({ messages: [] }); 
    const [chats, setChats] = useState([]);
    const getChats = useCallback(async () => {
        try {
            const response = await fetch(`/api/users/${user?._id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const result = await response.json();
            const currentChat = result?.chats.find((chat: any) => chat._id == chatId);
    
            if (currentChat && currentChat.members && Array.isArray(currentChat.messages)) {
                const otherMembers = currentChat.members.filter((member: any) => member._id !== user?.id);
                setOthers(otherMembers);
                setAllMessages({ messages: currentChat.messages });
            } else {
                console.log('Invalid response structure:', result);
            }
            setChats(result?.chats);
        }
        catch (error) {
            console.log('Error fetching chats:', error);
        }
    }, [user, chatId]);
    
    const SeenMessage = useCallback(async () => {
        try {
            const response = await fetch(`/api/chats/${chatId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentUserId: user?._id })
            });
    
            if (!response.ok) {
                console.error("Failed to mark message as seen:", response.statusText);
            }
        } catch (error) {
            console.error('Error marking message as seen:', error);
        }
    }, [chatId, user]);
    
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
        if(user)
            setLoading(false);
    }, [user])
    useEffect(() => {
        if (chatId && user) {
            getChats();
        }
    }, [chatId, user]);
    useEffect(() => {
        if (chatId && user) 
            SeenMessage();     
    }, [chatId, user]);

    useEffect(() => {
    
    const channel = pusherClient.subscribe(chatId.toString());

    const updateChatsWithMessage = (newMessage:any) => {
        setChats((prevChats: any) => prevChats.map((chat:any) => {
            if (chat._id === chatId) {
                const updatedMessages = [...chat.messages, newMessage];
                
                return {
                    ...chat,
                    messages: updatedMessages,
                    lastMessageAt: newMessage.createdAt,
                };
            }
            return chat;
        }));
    };

    const handleMessage = (newMessage:any) => {
        setAllMessages((prevChat:any) => ({
            ...prevChat,
            messages: [...prevChat.messages, newMessage],
        }));
        if (
            newMessage?.audioCall?.isCalling
        ) {
            const url = `/room/${chatId}`;
            const windowFeatures = 'width=1200,height=800,scrollbars=yes,resizable=yes';
            window.open(url, 'newwindow', windowFeatures);
        }
        updateChatsWithMessage(newMessage);
    };

    const handleUpdateMessage = (updatedMessage:any) => {
        setChats((prevChats:any) => {
            const chatIndex = prevChats.findIndex((chat:any) => chat._id === chatId);
            if (chatIndex !== -1) {
                const updatedChat = { ...prevChats[chatIndex] };

                const messageIndex = updatedChat.messages.findIndex(
                    (message:any) => message._id === updatedMessage._id
                );

                if (messageIndex !== -1) {
                    updatedChat.messages[messageIndex] = updatedMessage;
                }

                return [
                    ...prevChats.slice(0, chatIndex),
                    updatedChat,
                    ...prevChats.slice(chatIndex + 1)
                ];
            }

            return prevChats;
        });
    };

    channel.bind("new-message", handleMessage);
    channel.bind("update-message-audio", handleUpdateMessage);

    return () => {
        channel.unbind("new-message", handleMessage);
        channel.unbind("update-message-audio", handleUpdateMessage);
        pusherClient.unsubscribe(chatId.toString());
    };
    }, [user, chatId]);
    
    

    
    
    return loading ? (
        <div className="flex justify-center -mt-16 items-center h-full">
            <div className="loader"></div>
        </div>
    ) : (
        <div className="flex flex-row h-full">
            <ChatList currentUserId={user?._id} chats={chats} />
            <ChatDetail chatId={chatId} currentUserId={user?._id} others={others} chatDetail={allMessages} />
        </div>
    );
};

export default ChatPage;
