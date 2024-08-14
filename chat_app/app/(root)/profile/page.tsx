"use client"
import { useSession } from "next-auth/react"
import { CldUploadButton } from "next-cloudinary";
import { EditNote } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FixedImage } from "@/components/FIxedImage";

export default function Profile() {

    const {data: session, status} = useSession();
    const { register, handleSubmit, watch, reset, formState: {errors}, setValue } = useForm();
    const user = session?.user as any;
    const [isFormChanged, setIsFormChanged] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleFormChange = () => {
        setIsFormChanged(true);
    };
    useEffect(() =>  {
        setLoading(true);
        if(user) {
            reset({
                username: user?.username,
                profileImage: user?.profileImage
            })
        }
        setLoading(false);
    }, [user])
    const HanldeSubmit = async (data: any) => {
        try {
            const res = await fetch("/api/users/"+user?.id+"/update", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            })
            if(res.ok)
                window.location.reload();
            
        } catch (error) {
            console.log(error);
        }
        
    }
    const UploadPhoto = (photo : any) => {
        setValue("profileImage", photo?.info?.secure_url)
    }
    return loading ? (
        <div className="flex justify-center -mt-16 items-center h-full">
            <div className="loader"></div>
        </div>
    ) : (
        <form className="flex flex-col mt-32 gap-5 items-center" onSubmit={handleSubmit(HanldeSubmit)}> 
            <div className="text-center font-bold mb-5 text-white text-6xl" >Edit your profile</div> 
            <CldUploadButton
                options={{ maxFiles: 1 }}
                onSuccess={(result) => {
                    UploadPhoto(result);
                    handleFormChange();
                }}
                uploadPreset="assa7iwc"
                className="bg-white flex justify-center items-center w-[240px] h-[240px] rounded-full overflow-hidden border-black relative group"
            >
                <div className="relative w-full h-full">
                    <FixedImage 
                        src={watch("profileImage") || user?.profileImage || "/assets/person.jpg"} 
                        width={300} 
                        height={350} 
                        className="object-cover w-full h-full border-2 border-white rounded-full shadow-lg"
                        {...register("profileImage")}
                    />

                    <div className="absolute bottom-2 w-full -mb-3 h-14 left-1/2 transform -translate-x-1/2 flex items-center opacity-0 justify-center p-3 group-hover:opacity-80 bg-black duration-300 ease-in-out">
                        <EditNote sx={{ color: "white" }}/>
                    </div>
                </div>
            </CldUploadButton>

            <input 
                className="border glass-effect rounded-full px-4 mb-3 h-12 text-white hover:bg-gray-300 hover:bg-opacity-30 duration-200 ease-in-out"
                {...register("username", {
                    validate: (value) => {
                        if(value.length < 3) {
                            return "Invalid username"
                        }
                    }
                })}
                type="text"
                onChange={handleFormChange}
            />
            { errors.username &&<p className="text-sm text-red-500 w-[240px] flex items-start -mt-8 -mr-10">
                {errors as any || errors?.username.message}
            </p>}
            <button 
                className={`btn border glass-effect hover:bg-gray-300 hover:bg-opacity-30 duration-200 ease-in-out px-16 text-white -ml-3 ${!isFormChanged ? 'opacity-50 cursor-not-allowed':`` } `}
                disabled={!isFormChanged}
            >
                Save Changes
            </button>
        </form>
    )
}