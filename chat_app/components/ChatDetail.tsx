"use client";
import { useState, useRef, useEffect } from "react";
import { Call, VideoCall, InfoOutlined, Link, Mic, Send, Delete } from "@mui/icons-material";
import { CldUploadButton } from "next-cloudinary";
import { ChatBox } from "./ChatBox";
import { FixedImage } from "./FIxedImage";
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid'; // Import UUID library
import AudioRecorder from "./AudioRecorder";

export const ChatDetail = ({ chatId, currentUserId, others, chatDetail }) => {
    const [message, setMessage] = useState(""); 
    const inputRef = useRef(null);   
    const [isRecord, setIsRecord] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState(null);
      
    const SendMessage = async (result) => {
        try {
            // Check if there's anything to send
            if (!message && !result?.info?.secure_url && !recordedAudio) {
                console.log("There is nothing to send!");
                return;
            }
            const formData = new FormData();
            formData.append('chatId', chatId);
            formData.append('currentUserId', currentUserId);
            formData.append('text', message);
            formData.append("file", result?.info?.secure_url || "")

            if (recordedAudio) {
                // Generate a unique file name using UUID
                const uniqueFileName = `audio-${currentUserId}-${others[0]._id}_${uuidv4()}.wav`;
                formData.append('audio', recordedAudio, uniqueFileName);
            }

            const res = await fetch("/api/messages", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                setMessage("");
                setRecordedAudio(null);
            } else {
                console.log("Failed to send message");
            }
        } catch (error) {
            console.log('Error sending message:', error);
        }
    };
    
    const handleEnterPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevents the default behavior of the Enter key (e.g., form submission)
            if (message.trim()) { // Ensure message is not just whitespace
                SendMessage(message); // Call your function here with the current message
                setMessage(""); // Clear the input field after sending the message
            }
        }
    };
    const handleRecordingStop = (audio) => {
        setRecordedAudio(audio); // Store the Base64 string of the audio
    }; 
    const handleSendClick = () => {
        SendMessage({});
    };
    const isValidDate = (date) => {
        return !isNaN(new Date(date).getTime());
    };
    const isActive = (lastActive) => {
        const oneMinuteAgo = new Date(Date.now() - 1000 * 60);
        return new Date(lastActive) > oneMinuteAgo;
    };
    const formatDate = (date) => {
        if (!isValidDate(date)) return 'Invalid date';
    
        const now = new Date();
        const diff = (now - new Date(date)) / 1000; // Difference in seconds
    
        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
        if (diff < 31536000) return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) > 1 ? 's' : ''} ago`;
    
        return format(new Date(date), 'PPP'); // Default formatting
    };
    const sendCall = async () => {
        try {
            const formData = new FormData();
            formData.append('chatId', chatId);
            formData.append('currentUserId', currentUserId);
            formData.append('isCalling', "true");
            formData.append("reponse", "calling")

            const res = await fetch("/api/call", {
                method: "POST",
                body: formData,
            });

            if(!res.ok) {
                console.log("Failed to send message");
            }
        } catch (error) {
            console.log('Error sending message:', error);
        }
    }
      
    return (
        <div className="flex flex-col w-full h-full justify-between mt-3">
            <div className="text-white flex flex-col w-full py-2 border-b border-zinc-800">
                <div className="w-full h-18 flex items-center align-middle justify-between px-4">
                    <div className="flex mt-2 relative">
                        <div className="overflow-hidden rounded-full w-[60px] h-[60px] mt-1">
                            <FixedImage 
                                className="object-cover w-full h-full" 
                                src={others[0]?.profileImage || "/assets/person.jpg"}  
                                width={250} 
                                height={250}
                            />                                         
                        </div>
                        <img 
                            className="absolute -bottom-1 left-10 w-[25px] h-[25px] object-cover" 
                            src={isActive(others[0]?.lastActive)? "/status-active.svg": "/status-inactive.svg"}  
                            alt="Status"
                        />
                        <div className="flex flex-col justify-center ml-2 text-lg pt-1">
                            <div className="-mb-1 mt-2 text-lg">
                                {others[0]?.username}
                            </div>
                            <div className="text-[12px] italic">
                                {isActive(others[0]?.lastActive) ? (
                                    <div>Active</div>
                                ) : (
                                    <div>Last seen {formatDate(others[0]?.lastActive)}</div>
                                )}
                            </div>
                        </div>
                        
                    </div>
                   
                    <div className="flex items-end gap-1 pr-3 cursor-pointer">
                        <Call className="w-10 h-7" />
                        <button onClick={sendCall}>
                          <VideoCall className="w-10 h-7" />
                        </button> 
                        <InfoOutlined className="w-10 h-7" />
                    </div>

                </div>
            </div>
            <div className="flex overflow-auto h-screen antialiased text-white text-lg mx-6 my-3 -mt-1">
                <ChatBox chatDetail={chatDetail} others={others} currentUserId={currentUserId} />
            </div>
            <div className="flex justify-center w-full mb-5 text-white px-10">
                <div className="relative w-full">
                    <div className="flex flex-col">
                        <>
                            <input 
                                className="border glass-effect rounded-full w-full opacity-85 h-14 px-6"
                                style={{ backgroundColor: "rgb(30, 30, 30)" }}
                                placeholder="message..."
                                ref={inputRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleEnterPress}
                                
                            />  
                            
                            {message ? (
                                <button 
                                    className="absolute inset-y-0 right-[30px] flex items-center"
                                    onClick={handleSendClick}
                                >
                                    <Send style={{ color: 'white' }} />
                                </button>
                                ) : (
                                    !isRecord ? (
                                        <div className="w-full"> 
                                            <CldUploadButton
                                            options={{ maxFiles: 1 }}
                                            onSuccess={SendMessage}
                                            uploadPreset="assa7iwc"
                                            className="absolute top-4 right-16 flex items-center cursor-pointer"
                                        >
                                            <Link style={{ color: 'white' }} />
                                        </CldUploadButton>                          
                                            
                                            <div onClick={() => setIsRecord(!isRecord)}>
                                                <Mic
                                                    className="absolute inset-y-0 right-[30px] mt-4 flex cursor-pointer items-center" 
                                                    style={{ color: isRecord ? "red": 'white' }}
                                                />
                                            </div>                      
                                        </div>
                                        ) : (
                                            <div className="w-full"> 
                                                <div className="absolute right-[70px] top-4 flex items-center" onClick={() => setIsRecord(false)}>
                                                    <Delete  style={{ color: 'white' }} />
                                                </div>                          
                                                
                                                <div onClick={() => {
                                                        setIsRecord(!isRecord)
                                                        SendMessage(recordedAudio);
                                                    }}
                                                >
                                                    <Send
                                                        className="absolute inset-y-0 right-[30px] mt-4 flex cursor-pointer items-center" 
                                                        style={{ color: 'white' }}
                                                    />
                                                </div>                      
                                            </div>
                                    )
                                )}
                        </>
                        {isRecord && <AudioRecorder onStop={handleRecordingStop}/>}
                    </div>
                    
                </div>
            </div>
        </div>
    );
};
