"use client";
import { useRef, useEffect } from "react";
import { FixedImage } from "./FIxedImage";
import Image from "next/image";
import { MessageWithImage } from "./MessageWithImage";
import moment from "moment";
import { MessageWithFile } from "./MessageWithFile";

export const ChatBox = ({ chatDetail, others, currentUserId }) => {
    const bottomRef = useRef(null);
    const seenMessages = chatDetail?.messages.filter((message) => {
        return message?.sender?._id == currentUserId && message?.seenBy?.length > 1;
    });

    const lastSeenMsg = seenMessages[seenMessages.length -1];
    const formatDateTime = (createdAt) => {
        const now = moment();
        const messageTime = moment(createdAt);

        if (now.isSame(messageTime, 'day')) {
            return messageTime.format('HH:mm'); // Same day, show hours and minutes
        } else {
            return messageTime.format('DD MMM YYYY'); // Different day, show date
        }
    }
    const isImageURL = (url) => {
        if (typeof url !== 'string') return false;
    
        // List of common image file extensions
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'];
    
        // Extract the file extension from the URL
        const extension = url.split('.').pop().toLowerCase();
    
        // Check if the extracted extension is in the list of image extensions
        return imageExtensions.includes(extension);
    }
    const isVideoURL = (url) => {
        if (typeof url !== 'string') return false;
    
        // List of common video file extensions
        const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv'];
    
        // Extract the file extension from the URL
        const extension = url.split('.').pop().toLowerCase();
    
        // Check if the extracted extension is in the list of video extensions
        return videoExtensions.includes(extension);
    };
    const isActive = (lastActive) => {
        const oneMinuteAgo = new Date(Date.now() - 1000 * 60);
        return new Date(lastActive) > oneMinuteAgo;
    };
    useEffect(() => {
        // Smoothly scroll to the bottom of the chat when new messages are added
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest"
        });
    }, [chatDetail?.messages]);
    
    console.log(chatDetail)
    return (
        <div className="flex flex-col flex-auto h-full p-2 relative">
            
            <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl h-full">
                <div className="flex flex-col h-full overflow-x-auto mb-1">
                    <div className="flex flex-col h-full">
                        <div className="grid grid-cols-12">
                            <div className="col-span-12 flex flex-col items-center gap-5 pt-3 pb-12">   
                                <div className="overflow-hidden rounded-full w-[200px] h-[200px] ">
                                    <FixedImage
                                        className="object-cover w-full h-full cursor-pointer"
                                        src={others[0]?.profileImage || "/assets/person.jpg"}
                                        width={300}
                                        height={300}
                                    />
                                </div>
                                <div className="text-2xl font-bold">{others[0]?.username}</div>
                            </div>
                            
                            {chatDetail.messages.map((Message, index) => (
                                
                                <div
                                    key={index}
                                    className={`p-1 rounded-lg ${Message.sender._id === currentUserId
                                        ? `col-start-6 col-end-13`
                                        : "col-start-1 col-end-8"}`}
                                >
                                    <div className={`flex flex-col ${Message.sender._id === currentUserId ? 'items-end' : 'items-start'} mb-3`}>
                                        <div className={`relative flex items-center ${Message.sender._id === currentUserId ? 'flex-row-reverse' : 'flex-row'}`} title={formatDateTime(Message.createdAt)}>
                                            {Message.sender._id !== currentUserId && (
                                                <div className="relative">
                                                    <div className="overflow-hidden rounded-full w-[50px] h-[50px] mb-2">
                                                        <FixedImage
                                                            className="object-cover w-full h-full cursor-pointer"
                                                            src={others[0]?.profileImage || "/assets/person.jpg"}
                                                            width={50}
                                                            height={50}
                                                            title={Message.sender.username}
                                                        />
                                                    </div>
                                                    {isActive(others[0]?.lastActive) && 
                                                        <img 
                                                            className="absolute -mb-2 bottom-0 left-8 w-[22px] h-[22px] object-cover" 
                                                            src="/status-active.svg"
                                                            alt="Status"
                                                        />
                                                    }
                                                </div>
                                            )}
                                            {Message.audioCall && (
                                                
                                                <div
                                                    className={`relative text-sm py-2 px-4 shadow rounded-xl ${Message.sender._id === currentUserId
                                                        ? "mr-3 bg-sky-700"
                                                        : "ml-3 bg-zinc-800"}`}
                                                >
                                                    {Message.audioCall.response}
                                                </div>
                                            )}
                                            {Message.text && (
                                                <div
                                                    className={`relative text-sm py-2 px-4 shadow rounded-xl ${Message.sender._id === currentUserId
                                                        ? "mr-3 bg-sky-700"
                                                        : "ml-3 bg-zinc-800"}`}
                                                >
                                                    {Message.text}
                                                </div>
                                            )}
                                            {
                                                Message.audio && (
                                                    <audio controls>
                                                        <source src={Message.audio} type="audio/wav" />
                                                        Your browser does not support the audio element.
                                                    </audio>
                                                )
                                            }
                                            {Message.file && (
                                                isImageURL(Message.file) ? (
                                                    <MessageWithImage currentUserId={currentUserId} Message={Message} />
                                                ) : (
                                                   isVideoURL(Message.file) ? (
                                                    <video controls className="max-w-[600px] rounded-lg">
                                                        <source src={Message.file} type={`video/${Message.file.split('.').pop()}`} />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                   ) : <MessageWithFile url={Message.file}/>
                                                ))
                                            }

                                        </div>
                                            {lastSeenMsg === Message 
                                            && lastSeenMsg?.sender?._id === currentUserId 
                                            && others[0]?.profileImage
                                            && (
                                                <div className="overflow-hidden rounded-full w-[20px] h-[20px] mt-1 mr-1 cursor-pointer">
                                                    <Image
                                                        className="object-cover w-full h-full"
                                                        src={others[0]?.profileImage || "/assets/person.jpg"}
                                                        width={200}
                                                        height={200}
                                                        alt="seen indicator"
                                                        title={others[0]?.username}
                                                    />
                                                </div>
                                            )}
                                    </div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
      
                    </div>
                </div>
            </div>
        </div>
    );
}
