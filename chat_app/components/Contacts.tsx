"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { FixedImage } from "./FIxedImage"

export const Contacts = ({value ,currentUserId}:{value:any ,currentUserId:any}) => {
    const router = useRouter(); 
    const [contacts, setContacts] = useState([]);

    const getContacts = async () => {
        try {
            const res = await fetch(`/api/users/search/${value ? value : "!@"}`);
            if (!res.ok) {
                throw new Error(`Error: ${res.status}`);
            }
            const data = await res.json();
            let filteredContacts = [] as any;
            for (let i = 0; i < data.length; i++) {
                if (data[i]._id !== currentUserId) { // Exclude current user
                    filteredContacts.push(data[i]);
                }
            }
            setContacts(filteredContacts); // Set filtered contacts
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
        }
    };

    useEffect(() => {
      getContacts();
    }, []);
    const createChat = async (contactId:any) => {
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

    return (
        <div className="flex flex-col mt-2 px-3" >
            {value && <div className="px-2">Searching for {value}</div>}
            {!contacts ? (
                <div className="flex flex-col justify-center mt-32 items-center h-full">
                    <div className="loader"></div>
                </div>
            ) : (
                <div className="flex flex-col gap-2 items-start">
                    <div className="flex flex-col gap-2 mt-1 w-full">
                        {contacts.map((user:any) => (
                            <button 
                                key={user._id}
                                onClick={() => {
                                    createChat(user._id);
                                }}
                                className="flex items-center space-x-2 w-full hover:bg-zinc-700 transition duration-200 ease-in-out rounded-xl p-2"
                            >
                                <div className="overflow-hidden rounded-full w-[50px] h-[50px]">
                                    <FixedImage 
                                        className="object-cover w-full h-full" 
                                        src={user?.profileImage || "/assets/person.jpg"}
                                        width={250} 
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
    )
}
