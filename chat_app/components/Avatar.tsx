import { FixedImage } from "./FIxedImage"


export const Avatar = ({user}:{user:any}) => {
    return (
        <div className="flex flex-col justify-center items-center w-full gap-8">
            <div className="flex">
                <div className=" overflow-hidden rounded-full w-[250px] h-[250px] mt-1">
                    <FixedImage 
                        className="object-cover w-full h-full" 
                        src={user?.profileImage || "/assets/person.jpg"}  
                        width={250} 
                        height={250}
                    />                                         
                </div>
            </div>
            <div className="text-white text-3xl">
                {user?.username}
            </div>
            
        </div>
    )
}