"use client";
import { useSession } from "next-auth/react";
import { Search } from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";
import { Contacts } from "@/components/Contacts";

const Chats = () => {
    const { data: session, status } = useSession();
    const [search, setSearch] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [contacts, setContacts] = useState([]);
    const inputRef = useRef(null);
    const user = session?.user;

    const getContacts = async () => {
        try {
            const res = await fetch(`/api/users/search/${searchValue ? searchValue : "!@"}`);
            if (!res.ok) {
                throw new Error(`Error: ${res.status}`);
            }
            const data = await res.json();
            let filteredContacts = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i]._id !== user._id) { // Exclude current user
                    filteredContacts.push(data[i]);
                }
            }
            setContacts(filteredContacts); // Set filtered contacts
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
        }
    };

    const handleFocus = () => {
        setSearch(true);
    };

    const handleBlur = () => {
        setSearch(false);
    };

    useEffect(() => {
        setLoading(true);
        if (user) {
            getContacts(); // Fetch contacts whenever search or searchValue changes
            setLoading(false);
        }
    }, [user, search, searchValue]); // Add searchValue to dependencies

    return loading ? (
        <div className="flex justify-center -mt-16 items-center h-full">
            <div className="loader"></div>
        </div>
    ) : (
        <div className="flex flex-row h-full">
            <div className="flex flex-col min-w-[300px] w-1/4 h-full border-r text-white">
                <div className="flex justify-center w-full mt-5 min-w rounded-full relative">
                    <button
                        onClick={() => { inputRef.current.focus(); }}
                        className="absolute -translate-y-1/2 left-[10px] xl:ml-3 top-1/2 z-10"
                    >
                        <Search className="" sx={{ color: "white" }} />
                    </button>             
                    <input 
                        className="border glass-effect rounded-full w-[350px] opacity-85 h-9 px-[33px]" 
                        style={{ backgroundColor: "rgb(30, 30, 30)" }}
                        placeholder="Search..."
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        ref={inputRef}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
                {search ? (
                    <Contacts value={searchValue} contacts={contacts} />
                ) : (
                    <div></div>
                )}
            </div>
        </div>
    );
};

export default Chats;
