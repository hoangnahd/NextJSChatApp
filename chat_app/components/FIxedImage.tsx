"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface FixedImageProps {
    src: string;
    className?: string;
    width: number;
    height: number;
    title?: string;
}

export const FixedImage: React.FC<FixedImageProps> = ({ src, className, width, height, title = "" }) => {
    const [imageWidth, setImageWidth] = useState<number>(width); // Initialize with default width
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            if (containerWidth) {
                setImageWidth(containerWidth * 2); // Adjust the width calculation as needed
            }
        }
    }, [containerRef.current?.clientWidth]); // Dependency on container width

    return (
        <div ref={containerRef} className={className} style={{ position: "relative", width: "100%" }}>
            <Image 
                src={src} 
                alt={title || "profile picture"} 
                width={imageWidth} 
                height={height}
                className={className}
                title={title}
            />
        </div>
    );
};
