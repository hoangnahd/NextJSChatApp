"use client";
import { useState, useRef } from "react";
import { Call, VideoCall, InfoOutlined, Link, ImageOutlined, Mic, Send } from "@mui/icons-material";
import { CldUploadButton } from "next-cloudinary";
import { ChatBox } from "./ChatBox";
import { FixedImage } from "./FIxedImage";

export const ChatDetail = ({ chatId, currentUserId, others, chatDetail }) => {
    const [message, setMessage] = useState(""); 
    const inputRef = useRef(null);   

    const SendMessage = async (result) => {
        try {
            if (!message && !result?.info?.secure_url) {
                console.log("There is nothing to send!");
                return;
            }
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatId: chatId, 
                    currentUserId: currentUserId, 
                    text: message, 
                    photo: result?.info?.secure_url
                })
            });
            if (res.ok) {
                setMessage("");
            } else {
                console.log("Failed to send message");
            }
        } catch (error) {
            console.log('Error sending message:', error);
        }     
    };

    const handleSendClick = () => {
        SendMessage({});
    };

    return (
        <div className="flex flex-col w-full h-full justify-between">
            <div className="text-white flex flex-col w-full py-2 border-b border-zinc-800">
                <div className="w-full h-16 flex items-center align-middle justify-between px-4">
                    <div className="flex mt-2">
                        <div className="overflow-hidden rounded-full w-[60px] h-[60px]">
                            <FixedImage 
                                className="object-cover w-full h-full" 
                                src={others[0]?.profileImage || "/assets/person.jpg"}  
                                width={250} 
                                height={250}
                            />                
                        </div>
                        <div className="flex items-center ml-1 text-lg">
                            {others[0]?.username}
                        </div>
                    </div>
                    <div className="flex items-end gap-1 pr-3 cursor-pointer">
                        <Call className="w-10 h-7" />
                        <VideoCall className="w-10 h-7" />
                        <InfoOutlined className="w-10 h-7" />
                    </div>
                </div>
            </div>
            <div className="flex overflow-auto h-screen antialiased text-white text-lg mx-6 my-3 -mt-1">
                <ChatBox chatDetail={chatDetail} others={others} currentUserId={currentUserId} />
            </div>
            <div className="flex justify-center w-full mb-5 text-white px-10">
                <div className="relative w-full">
                    <input 
                        className="border glass-effect rounded-full w-full opacity-85 h-14 px-12"
                        style={{ backgroundColor: "rgb(30, 30, 30)" }}
                        placeholder="message..."
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-4 flex items-center cursor-pointer">
                        <Link style={{ color: 'white' }} />
                    </div>
                    {message && (
                        <button 
                            className="absolute inset-y-0 right-[76px] flex items-center"
                            onClick={handleSendClick}
                        >
                            <Send style={{ color: 'white' }} />
                        </button>
                    )}
                    <CldUploadButton
                        options={{ maxFiles: 1 }}
                        onSuccess={SendMessage}
                        uploadPreset="assa7iwc"
                        className="absolute inset-y-0 right-12 flex items-center"
                    >
                        <ImageOutlined style={{ color: 'white' }} />
                    </CldUploadButton>
                    <div className="absolute inset-y-0 right-4 flex items-center cursor-pointer">
                        <Mic style={{ color: 'white' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};
