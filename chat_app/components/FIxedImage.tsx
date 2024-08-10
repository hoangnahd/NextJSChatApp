"use client"
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export const FixedImage = ({src, className, width, height, title=""}) => {
    const [imageWidth, setImageWidth] = useState(0);
    const containerRef = useRef(null);
    useEffect(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            if(containerWidth) {
                setTimeout(() => {
                    setImageWidth(containerWidth*2);
                }, 200)      
                if(imageWidth) console.log(imageWidth) 
            }
            
        }
    }, [containerRef]);
    return (
        <Image 
            src={src} 
            alt="profile picture" 
            width={imageWidth ? imageWidth : width} 
            height={height}
            className={className}
            ref={containerRef}
            title={title}
        />  
    )
}