"use client"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export const Contacts = ({search, value, contacts, currentUserId}) => {
    const containerRef = useRef(null);
    const [imageWidth, setImageWidth] = useState(0);
    const router = useRouter();
    
    const createChat = async (contactId) => {
        try {
            const res = await fetch("/api/chats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentUserId: currentUserId,
                    isGroup: false,
                    groupPhoto: "",
                    name: "",
                    members: [contactId]
                })
            });

            if (!res.ok) {
                throw new Error(`Error: ${res.statusText}`);
            }

            const result = await res.json();
            router.push("/chats/" + result._id);
        } catch (error) {
            console.error("Failed to create chat:", error);
        }
    };

    useEffect(() =>  {
        if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            setImageWidth(containerWidth * 2); 
        }
    }, [containerRef]);

    return search ? (
        <div className="flex flex-col mt-2 px-3" >
            {value && <div className="px-2">Searching for {value}</div>}
            {!contacts ? (
                <div className="flex flex-col justify-center mt-32 items-center h-full">
                    <div className="loader"></div>
                </div>
            ) : (
                <div className="flex flex-col gap-2 items-start">
                    <div className="flex flex-col gap-2 mt-5 w-full">
                        {contacts.map((user) => (
                            <button 
                                key={user._id}
                                onClick={() => {
                                    createChat(user._id);
                                }}
                                className="flex items-center space-x-2 w-full hover:bg-zinc-700 transition duration-200 ease-in-out rounded-xl p-2"
                            >
                                <div className="overflow-hidden rounded-full w-[50px] h-[50px]" ref={containerRef}>
                                    <Image 
                                        className="object-cover w-full h-full" 
                                        src={user?.profileImage || "/assets/person.jpg"} 
                                        alt="user" 
                                        width={imageWidth ? imageWidth : 250} 
                                        height={250}
                                    />
                                </div>
                                <div className="flex items-center text-white">
                                    {user?.username}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}           
        </div>
    ) : (
        <div >
            
        </div>
    )
}
