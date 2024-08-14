
import { Contacts } from "@/components/Contacts";
import { useRouter } from "next/navigation";
import { Search } from "@mui/icons-material";
import { FixedImage } from "./FIxedImage"
import { format } from 'date-fns';
import { useRef, useState } from "react";

export const ChatList = ({currentUserId, chats}:{currentUserId:any, chats:any}) => {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
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
    const isValidDate = (date:any) => {
        return !isNaN(new Date(date).getTime());
    };
    const isActive = (lastActive:any) => {
        const oneMinuteAgo = new Date(Date.now() - 1000 * 60);
        return new Date(lastActive) > oneMinuteAgo;
    };
    const formatDate = (date:any) => {
        if (!isValidDate(date)) return 'Invalid date';
        const parsedDate = typeof date === 'string' ? new Date(date) : date;
    
        // Validate if the date is valid
        if (!isValidDate(parsedDate)) return 'Invalid date';

        const now = new Date();
        const diff = (now.getTime() - new Date(date).getTime()) / 1000;
    
        if (diff < 0) return 'In the future'; // Handle future dates if applicable
        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
        if (diff < 31536000) return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) > 1 ? 's' : ''} ago`;
    
        return format(new Date(date), 'PPP');
    };
    
    const isMediaURL = (url: string, type: 'image' | 'video'): boolean => {
        if (typeof url !== 'string') return false;
    
        const extensions = {
            image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'],
            video: ['mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv']
        };
    
        const extension =  url.split('.')?.pop()?.toLowerCase();
        return extension ? extensions[type]?.includes(extension) : false;
    };
    
    // Usage
    const isImageURL = (url:any) => isMediaURL(url, 'image');
    const isVideoURL = (url:any) => isMediaURL(url, 'video');
    
    return (
        <div className="flex flex-col min-w-[380px] max-w-[380px] h-full border-r border-zinc-600 text-white mt-5">
            <div className="flex justify-center w-full mt-5 min-w rounded-full relative">
                <button
                    onClick={() => { 
                        if (inputRef.current) {
                            inputRef.current.focus();
                        }
                     }}
                    className="absolute -translate-y-1/2 left-[10px] xl:ml-3 top-1/2 z-10"
                >
                <Search 
                    className="absolute -mt-3"
                    sx={{ color: "white" }} />
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
                        .sort((a:any, b:any) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
                        .map((chat) => {
                            const otherMember = chat.members.find((member:any) => member._id !== currentUserId);
                            const lastMessage = chat.messages.length > 0 && chat.messages[chat.messages.length - 1]
                            
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
                                        className="flex items-center relative space-x-2 hover:bg-zinc-700 transition duration-200 ease-in-out rounded-xl p-2 w-full"
                                    >
                                        <div className="overflow-hidden rounded-full w-[60px] h-[60px] relative">
                                            <FixedImage 
                                                className="object-cover w-full h-full" 
                                                src={otherMember?.profileImage || "/assets/person.jpg"} // Assuming otherMember has profileImage
                                                width={250} 
                                                height={250}
                                            />
                                        </div>
                                        {isActive(otherMember?.lastActive) && 
                                            <img 
                                                className="absolute bottom-0 left-10 w-[25px] h-[25px] object-cover" 
                                                src="/status-active.svg"
                                                alt="Status"
                                            />
                                        }
                                        <div className="flex flex-col text-white gap-1 flex-1">
                                            <div className="text-lg font-semibold flex items-start">{otherMember?.username}</div> {/* Increased font size for better visibility */}
                                            <div className={`text-sm flex flex-row justify-between items-start pr-4 ${lastMessage.seenBy.length > 1 ?"": (
                                                lastMessage.sender._id != currentUserId ? "font-bold" : ""
                                            )}`}>
                                                <div className="truncate">
                                                    {lastMessage.text && lastMsgContent.length > 20 ? `${lastMsgContent.slice(0, 20)}...` : lastMsgContent} {/* Truncate text if it overflows */}
                                                    {lastMessage.file && (
                                                        isImageURL(lastMessage.file)  ? " sent a photo" : (
                                                            isVideoURL(lastMessage.file)? " sent a video" : " sent an attachment"
                                                        )
                                                    )}
                                                    {lastMessage.audio && " sent an audio"}
                                                    {lastMessage.audioCall && (
                                                        lastMessage.response == "cancel" || !lastMessage.response ? " missed an audio call" : " audio call end"
                                                    )}
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