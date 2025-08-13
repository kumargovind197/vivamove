
import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import AppFooter from '@/components/app-footer';


export const metadata: Metadata = {
  title: 'ViVa move',
  description: 'A motivational step tracking app.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen relative">
            <div className="animated-background">
               <div className="powder powder-1"></div>
               <div className="powder powder-2"></div>
               <div className="powder powder-3"></div>
               <div className="powder powder-4"></div>
               <div className="powder powder-5"></div>
               <div className="powder powder-6"></div>
            </div>
            <div className="flex-grow flex flex-col z-10">
              <main className="flex-grow">
                {children}
              </main>
              <AppFooter />
            </div>
            <Toaster />
      </body>
    </html>
  );
}
