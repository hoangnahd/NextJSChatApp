"use client"

import Link from "next/link";
import { Logout } from "@mui/icons-material";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useRef, useState, useEffect } from "react";

const TopBar = () => {
    const {data: session, status} = useSession();
    const containerRef = useRef(null);
    const [imageWidth, setImageWidth] = useState(0);

    useEffect(() =>  {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                setImageWidth(containerWidth*2); 
            }
        }, [])

    return (
        <div className="flex flex-row justify-between items-center px-8 bg-black w-full h-20 min-w-[700px] text-white border-b">
            <Link href="/chats" className="font-bold text-4xl">NextJSAppChat</Link>
            <div className="flex flex-row items-center justify-end w-full gap-4 text-xl">
                <Link href="/chats" className="font-bold italic">Chats</Link>
                <Link href="contacts" className="font-bold italic">Contacts</Link>
                <Link href="/profile">
                <div className="overflow-hidden rounded-full w-[50px] h-[50px]" ref={containerRef}>
                    <Image 
                        className="object-cover w-full h-full" 
                        src={session?.user?.profileImage || "/assets/person.jpg"} 
                        alt="picture" 
                        width={imageWidth ? imageWidth : 300} 
                        height={300} 
                        
                    />
                </div>
                
                </Link>
                <Logout onClick={() => signOut({callbackUrl:"/"})} className="cursor-pointer" sx={{color:"white"}} />
            </div>
            <div></div>
        </div>
    )
}

export default TopBar;