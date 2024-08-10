"use client";
import { ChatDetail } from "@/components/ChatDetail";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChatList } from "@/components/ChatList";
import { pusherClient } from "@/lib/pusher";

const ChatPage = () => { 
    const { chatId } = useParams();
    const { data: session, status } = useSession();
    const user = session?.user;
    const [loading, setLoading] = useState(true);
    const [others, setOthers] = useState([]);  
    const [allMessages, setAllMessages] = useState({ messages: [] }); 
    const [chats, setChats] = useState([]);
    console.log(process.env.PUBLIC_AGORA_APP_ID)
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
            const currentChat = result?.chats.find(chat => chat._id == chatId);

            if (currentChat && currentChat.members && Array.isArray(currentChat.messages)) {
                const otherMembers = currentChat.members.filter(member => member._id !== user?.id);
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
    };

    const SeenMessage = async () => {
        try {
            // Perform the fetch request to update the seen status
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
    };
    
    useEffect(() => {
        setLoading(true);
        if (user) {
           setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (chatId && user) {
            getChats();
        }
    }, [chatId, user]);
    useEffect(() => {
        if (allMessages) 
            SeenMessage();     
    }, [allMessages]);

    useEffect(() => {
        if (user && chatId) {
            const channel = pusherClient.subscribe(chatId.toString());
    
            const handleMessage = (newMessage) => {
    
                // Update the chatDetail state with the new message
                setAllMessages((prevChat) => ({
                    ...prevChat,
                    messages: [...prevChat.messages, newMessage],
                }));
    
                // Update the chats state with the new message
                setChats((prevChats) => {
                    const chatIndex = prevChats.findIndex(chat => chat._id === chatId);
                    if (chatIndex !== -1) {
                        const updatedChat = { ...prevChats[chatIndex] };
                        updatedChat.messages.push(newMessage);
                        updatedChat.lastMessageAt = newMessage.createdAt;
    
                        // Ensure seenBy field in the updatedChat is unique
                        updatedChat.messages = updatedChat.messages.map(message => {
                            message.seenBy = [...new Set(message.seenBy)];
                            return message;
                        });
                        
                        const updatedChats = [...prevChats];
                        updatedChats[chatIndex] = updatedChat;

                        if (
                            updatedChats[chatIndex]?.messages?.length > 0 &&
                            updatedChats[chatIndex]?.messages[updatedChats[chatIndex]?.messages?.length - 1]?.audioCall?.isCalling
                        ) {
                            const url = `/room/${chatId}`;
                            const windowFeatures = 'width=1200,height=800,scrollbars=yes,resizable=yes';
                            window.open(url, 'newwindow', windowFeatures);
                        }
                        
                        
                        return updatedChats;
                    }
                    return prevChats;
                });
            };
            channel.bind("new-message", handleMessage);
    
            return () => {
                channel.unbind("new-message", handleMessage);
                pusherClient.unsubscribe(chatId.toString());
            };
        }
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
