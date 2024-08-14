"use client"

import Link from "next/link";
import { Logout } from "@mui/icons-material";
import { signOut, useSession } from "next-auth/react";
import { FixedImage } from "./FIxedImage";

const TopBar = () => {
    const {data: session, status} = useSession() as {data:any, status:any};

    return (
        <div className="top-bar flex flex-row justify-between items-center px-8 bg-black w-full h-20 min-w-[700px] text-white border-b">
            <Link href="/chats" className="font-bold text-4xl">NextJSAppChat</Link>
            <div className="flex flex-row items-center justify-end w-full gap-4 text-xl">
                <Link href="/chats" className="font-bold italic">Chats</Link>
                <Link href="contacts" className="font-bold italic">Contacts</Link>
                <Link href="/profile">
                    <div className="overflow-hidden rounded-full w-[50px] h-[50px]">
                        <FixedImage 
                            className="object-cover w-full h-full" 
                            src={session?.user?.profileImage || "/assets/person.jpg"}  
                            width={300} 
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