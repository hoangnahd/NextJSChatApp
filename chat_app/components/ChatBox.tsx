"use client";
import { useRef, useEffect } from "react";
import { FixedImage } from "./FIxedImage";
import Image from "next/image";
import { MessageWithImage } from "./MessageWithImage";


export const ChatBox = ({ chatDetail, others, currentUserId }) => {
    const bottomRef = useRef(null);
    const seenMessages = chatDetail?.messages.filter((message) => {
        return message?.sender?._id == currentUserId && message?.seenBy?.length > 1;
    });
    const lastSeenMsg = seenMessages[seenMessages.length -1];
    //const lastMessage = chatDetail?.messages?.length > 0 && chatDetail?.messages[chatDetail?.messages.length - 1]
    useEffect(() => {
        // Smoothly scroll to the bottom of the chat when new messages are added
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest"
        });
    }, [chatDetail?.messages]);

    return (
        <div className="flex flex-col flex-auto h-full p-2">
            <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl h-full">
                <div className="flex flex-col h-full overflow-x-auto mb-1">
                    <div className="flex flex-col h-full">
                        <div className="grid grid-cols-12"> {/* Fixed typo: grid-col-12 to grid-cols-12 */}
                            {chatDetail.messages.map((Message, index) => (
                                <div
                                    key={index}
                                    className={`p-1 rounded-lg ${Message.sender._id === currentUserId
                                        ? `col-start-6 col-end-13`
                                        : "col-start-1 col-end-8"}`}
                                >                                                                    
                                    <div className={`flex flex-col ${Message.sender._id === currentUserId ? 'items-end' : 'items-start'} mb-3`}>
                                        <div className={`flex items-center ${Message.sender._id === currentUserId ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {Message.sender._id !== currentUserId && (
                                                <div className="overflow-hidden rounded-full w-[50px] h-[50px]">
                                                    <FixedImage
                                                        className="object-cover w-full h-full"
                                                        src={others[0]?.profileImage || "/assets/person.jpg"}
                                                        width={250}
                                                        height={250}
                                                        alt="sender profile"
                                                    />
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
                                            {Message.photo && (
                                                <MessageWithImage currentUserId={currentUserId} Message={Message} />
                                            )}
                                        </div>
                                        {
                                            lastSeenMsg === Message 
                                         && lastSeenMsg?.sender?._id === currentUserId 
                                         //&& lastMessage?.sender?._id === currentUserId
                                         && others[0]?.profileImage
                                         && (
                                            <div className="overflow-hidden rounded-full w-[20px] h-[20px] mt-1 mr-1">
                                                <Image
                                                    className="object-cover w-full h-full"
                                                    src={others[0]?.profileImage || "/assets/person.jpg"}
                                                    width={300}
                                                    height={300}
                                                    alt="seen indicator"
                                                />
                                            </div>
                                        )}
                                    </div>

                                </div>
                            ))}
                            {/* Bottom ref for smooth scrolling */}
                            <div ref={bottomRef} />
                        </div>        
                    </div>
                </div>
            </div>
        </div>
    );
}
