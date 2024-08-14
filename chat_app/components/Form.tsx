"use client"
import { EmailOutlined, LockOutlined, Person } from "@mui/icons-material"
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

const Form = ({type}:{type:any}) => {
    const { register, handleSubmit, formState: { errors }, getValues } = useForm();
    const router = useRouter();
    const HanldeSubmit = async (data:any) => {
        if(type == "register") {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            })
            if(res.ok) {
                router.push("/"); 
            }      
            else {
                toast.error("Something went wrong!");
                console.log("User already exsist!");
            }
                
        }
        if(type == "login") {
            const res = await signIn('credentials', { redirect: false, ...data}) as any

            if(res.ok) 
                router.push("/chats");
            else
                toast.error("Invalid username or password!");
            
            console.log(res);
        }
    }

    return (
        <div className="flex justify-center h-screen p-t-10 p-2 min-h-[800px] min-w-[500px]">
             <div className="form" >
                <div className="logo"> NextJS App Chat </div>
                {type == "login" ? (
                    <form onSubmit={handleSubmit(HanldeSubmit)} >
                        <div className="relative flex items-center">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="input pl-10"
                                {...register("email", {
                                    required: "Email is required"
                                })}
                            />
                            <EmailOutlined sx={{ color: "white" }} className="absolute right-4 -mt-2" />
                        </div>

                        {errors.email && 
                            (<p className="error-msg mb-4 -mt-2">
                                {errors as any || errors.email.message}
                            </p>)
                        }       
                        <div className="flex items-center w-full relative">
                            <input 
                                type="password" 
                                placeholder="Enter your password" 
                                className="input"
                                {...register("password", {
                                    required: "Password is required"
                                    
                                })}
                            />
                            <LockOutlined sx={{color:"white"}} className="absolute right-4 -mt-2"/>
                        </div>
                        
                        <div className="flex flex-row w-full mb-3 -mt-1">
                            {errors.password && (
                                <p className="error-msg w-full">
                                    {errors as any || errors.password.message}
                                </p>
                            )}
                            <div className="flex items-end justify-end w-full font-bold cursor-pointer">Forgot Password</div>
                        </div>
                        
                        <button className="btn text-black bg-white w-full mt-2">Login</button>
                        
                    </form>
                ) : (
                <form className="flex flex-col items-center" onSubmit={handleSubmit(HanldeSubmit)}>
                    <div className="relative flex items-center">
                        <input 
                            type="email" 
                            placeholder="Enter email" 
                            className="input"
                            {...register("email", {
                                required: "Email is required"
                            })}
                        />
                        <EmailOutlined sx={{ color: "white" }} className="absolute right-4 -mt-2" />
                    </div>              
                    
                    {errors.email && 
                        (<p className="error-msg -mt-2">
                            {errors as any || errors.email.message}
                        </p>)
                    }
                    <div className="relative flex items-center">
                        <input 
                            type="text" 
                            placeholder="Enter your name" 
                            className="input"
                            {...register("username", {
                                required:"Username is required"
                            })}
                        />
                        <Person sx={{ color: "white" }} className="absolute right-4 -mt-2" />
                    </div>
                    
                    {errors.username && 
                        (<p className="error-msg -mt-2">
                            {errors as any || errors.username.message}
                        </p>)
                    }
                    <div className="relative flex items-center">
                        <input 
                            type="password" 
                            placeholder="Enter password" 
                            className="input"
                            {...register("password", {
                                required: "Password is required",
                                validate: (value) => {
                                    if (
                                        value.length < 5 ||
                                        !value.match(/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/)
                                    ) {
                                        return "Password must be at least 5 characters and contain at least one special character";
                                    }
                                }
                            })}
                        />
                        <LockOutlined sx={{ color: "white" }} className="absolute right-4 -mt-2" />
                    </div>
                    
                    {errors.password && (
                        <p className="error-msg -mt-2">
                            {errors as any || errors.password.message}
                        </p>
                    )}
                    <div className="relative flex items-center">
                        <input 
                            type="password" 
                            placeholder="Confirm password" 
                            className="input"
                            {...register("confirmPassword", {
                                required: "Please confirm your password",
                                validate: (value) =>
                                value === getValues("password") ||
                                "The passwords do not match",
                            })}
                        />
                        <LockOutlined sx={{ color: "white" }} className="absolute right-4 -mt-2" />
                    </div>
                    
                    {errors.confirmPassword && (
                        <p className="error-msg -mt-2">
                            {errors as any || errors.confirmPassword.message}
                        </p>
                    )}
                    <button className="btn text-black bg-white w-full mt-2">Create Account</button>
                    
                </form>   
            )}

            { type === "login" ? (
                <p className="text-center ">Don&apos;t have an account? 
                <Link href="/register" className="font-bold">Register</Link> Here</p>
            ) : (
                <p className="text-center ">Already have an account?
                <Link href="/" className="font-bold">Sign In</Link> Here</p>
            )}
        </div>
        </div>
           

        
       
    ) 
}
export default Form;