"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageZoomProps {
  src: string;
  alt: string;
  zoomLevel?: number;
  className?: string;
  priority?: boolean;
}

export function ImageZoom({
  src,
  alt,
  zoomLevel = 2.5,
  className,
  priority = false,
}: ImageZoomProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [showZoomPanel, setShowZoomPanel] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if screen is large enough for zoom panel
    const checkScreenSize = () => {
      setShowZoomPanel(window.innerWidth >= 1536);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setMousePosition({ x: clampedX, y: clampedY });
  };

  const lensSize = 200; // Size of the magnifying glass lens

  return (
    <div className="relative">
      {/* Main Image Container */}
      <div
        ref={containerRef}
        className={cn(
          "relative aspect-square overflow-hidden bg-muted rounded-lg cursor-crosshair",
          className
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover select-none"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={priority}
          draggable={false}
        />

        {/* Magnifying Glass Lens Overlay */}
        {isHovering && (
          <>
            <div
              ref={lensRef}
              className="absolute pointer-events-none rounded-full border-2 border-white/80 shadow-2xl z-10 overflow-hidden ring-4 ring-black/20"
              style={{
                width: `${lensSize}px`,
                height: `${lensSize}px`,
                left: `${mousePosition.x}%`,
                top: `${mousePosition.y}%`,
                transform: "translate(-50%, -50%)",
                backgroundImage: `url(${src})`,
                backgroundSize: `${zoomLevel * 100}%`,
                backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                backgroundRepeat: "no-repeat",
              }}
            />
            {/* Dark overlay outside lens */}
            <div
              className="absolute inset-0 bg-black/20 pointer-events-none z-[5]"
              style={{
                clipPath: `circle(${lensSize / 2}px at ${mousePosition.x}% ${mousePosition.y}%)`,
                WebkitClipPath: `circle(${lensSize / 2}px at ${mousePosition.x}% ${mousePosition.y}%)`,
              }}
            />
          </>
        )}
      </div>

      {/* Zoomed View Panel (Optional - shows on very large screens) */}
      {isHovering && showZoomPanel && (
        <div
          ref={zoomRef}
          className="absolute left-full ml-6 top-0 w-full h-full aspect-square border-2 border-border rounded-lg overflow-hidden bg-background shadow-2xl z-50 pointer-events-none"
        >
          <Image
            src={src}
            alt={`${alt} - Zoomed View`}
            fill
            className="object-cover select-none"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
            }}
            sizes="50vw"
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}

