
import Image from 'next/image';
import Link from 'next/link';
import { ensureAbsoluteUrl } from '@/lib/url-helper';

interface AdContent {
  description: string;
  imageUrl: string;
  targetUrl: string;
}

interface FooterAdBannerProps {
  isVisible: boolean;
  adContent: AdContent | null;
}

export default function FooterAdBanner({ isVisible, adContent }: FooterAdBannerProps) {
  if (!isVisible || !adContent) {
    return null;
  }

  return (
    <footer className="sticky bottom-0 z-40 w-full border-t bg-background/95 backdrop-blur-sm py-2">
      <div className="container mx-auto flex items-center justify-center">
         <Link href={ensureAbsoluteUrl(adContent.targetUrl)} passHref legacyBehavior>
            <a target="_blank" rel="noopener noreferrer" className="block relative w-[728px] h-[90px] overflow-hidden rounded-md shadow-lg">
                <Image 
                    data-ai-hint="ad banner"
                    src={adContent.imageUrl}
                    alt={adContent.description}
                    fill
                    className="object-cover cursor-pointer"
                />
            </a>
        </Link>
      </div>
    </footer>
  );
}
