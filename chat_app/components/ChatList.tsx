
import { Contacts } from "@/components/Contacts";
import { useRouter } from "next/navigation";
import { Search } from "@mui/icons-material";
import { FixedImage } from "./FIxedImage"
import { format } from 'date-fns';
import { useRef, useState } from "react";

export const ChatList = ({currentUserId, chats}) => {
    const router = useRouter();
    const inputRef = useRef(null);
    const [search, setSearch] = useState(false);
    const [value, setValue] = useState("");
    
    const handleFocus = () => {
        setSearch(true);
    };
    const handleBlur = () => {
        setTimeout(() => {
            setSearch(false);
        }, 200); // Delay to allow click event to trigger
    };
    const isValidDate = (date) => {
        return !isNaN(new Date(date).getTime());
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
    return (
        <div className="flex flex-col min-w-[380px] w-1/4 h-full border-r border-zinc-600 text-white">
            <div className="flex justify-center w-full mt-5 min-w rounded-full relative">
                <button
                    onClick={() => { inputRef.current.focus(); }}
                    className="absolute -translate-y-1/2 left-[10px] xl:ml-3 top-1/2 z-10"
                >
                <Search sx={{ color: "white" }} />
                </button>             
                <input className="border glass-effect rounded-full w-[350px] opacity-85 h-9 px-[33px]" 
                    style={{ backgroundColor: "rgb(30, 30, 30)" }}
                    placeholder="Search..."
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>
            {search ? (
                <Contacts value={value} currentUserId={currentUserId} />
            ) : (
                <div className="flex flex-col gap-2 items-start">
                    <div className="flex flex-col gap-2 mt-5 ml-2 w-[98%]"> {/* Set width to 98% */}
                        {Array.isArray(chats) && chats
                        .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
                        .map((chat) => {
                            const otherMember = chat.members.find(member => member._id !== currentUserId);
                            const lastMessage = chat.messages.length > 0 && chat.messages[chat.messages.length - 1];
                            const lastMsgContent = lastMessage.sender?._id !== currentUserId 
                                ? `${otherMember?.username}: ${lastMessage.text}` 
                                : `You: ${lastMessage.text}`;
                                
                                
                                // Usage in your component
                                const formattedDate = formatDate(lastMessage.createdAt);
                            return (
                                lastMessage && (
                                    <button 
                                        key={chat._id} // Use chat._id as the unique key
                                        onClick={() => {
                                            router.push(`/chats/${chat._id}`);
                                        }} // Use chat._id for the chat creation
                                        className="flex items-center space-x-2 hover:bg-zinc-700 transition duration-200 ease-in-out rounded-xl p-2 w-full"
                                    >
                                        <div className="overflow-hidden rounded-full w-[60px] h-[60px]">
                                            <FixedImage 
                                                className="object-cover w-full h-full" 
                                                src={otherMember?.profileImage || "/assets/person.jpg"} // Assuming otherMember has profileImage
                                                width={250} 
                                                height={250}
                                            />
                                        </div>
                                        <div className="flex flex-col text-white gap-1 flex-1">
                                            <div className="text-lg font-semibold flex items-start">{otherMember?.username}</div> {/* Increased font size for better visibility */}
                                            <div className={`text-sm flex flex-row justify-between items-start pr-4 ${lastMessage.seenBy.length > 1 ?"": (
                                                lastMessage.sender._id != currentUserId ? "font-bold" : ""
                                            )}`}>
                                                <div className="truncate">
                                                    {lastMessage.text && lastMsgContent.length > 20 ? `${lastMsgContent.slice(0, 20)}...` : lastMsgContent} {/* Truncate text if it overflows */}
                                                    {lastMessage.photo && " sent a photo"}
                                                </div>
                                                <div className="text-gray-400 ml-2 text-sm tracking-tighter">
                                                    {formattedDate}
                                                </div> {/* Timestamp aligned to the end */}
                                            </div>
                                        </div>
                                    </button>
                                )
                            );
                        })}
                    </div>
                </div>
            )}           
        </div>
    )
}