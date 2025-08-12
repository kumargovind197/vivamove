
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from "./ui/card";
import { X } from 'lucide-react';
import Link from 'next/link';
import { ensureAbsoluteUrl } from '@/lib/url-helper';

interface AdContent {
  description: string;
  imageUrl: string;
  targetUrl: string;
}

interface AdBannerProps {
  isPopupVisible: boolean;
  adContent: AdContent | null;
}

export default function AdBanner({ isPopupVisible, adContent }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(isPopupVisible);

  useEffect(() => {
    setIsVisible(isPopupVisible);
  }, [isPopupVisible]);

  if (!isVisible || !adContent) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-full max-w-xs shadow-2xl overflow-hidden relative">
         <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute top-2 right-2 z-10 rounded-full bg-background/50 p-1 text-foreground/80 hover:bg-background/80"
            aria-label="Close ad"
          >
            <X className="h-4 w-4" />
          </button>
        <CardContent className="p-0">
          <Link href={ensureAbsoluteUrl(adContent.targetUrl)} passHref legacyBehavior>
             <a target="_blank" rel="noopener noreferrer" aria-label={adContent.description}>
                <Image 
                    data-ai-hint="running shoes"
                    src={adContent.imageUrl} 
                    alt={adContent.description} 
                    width={400} 
                    height={300}
                    className="rounded-lg object-cover aspect-[4/3] cursor-pointer"
                />
             </a>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
