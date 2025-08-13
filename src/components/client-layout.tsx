
"use client";

import AppFooter from '@/components/app-footer';
import { Toaster } from './ui/toaster';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
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
    </>
  );
}
