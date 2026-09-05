import React from "react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { PriceTicker } from "@/components/PriceTicker";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import { NewsletterSection } from "@/components/NewsletterSection";
import { AppFooter } from "@/components/AppFooter";

export const AppLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen text-[#1E293B] font-sans antialiased selection:bg-[#004236] selection:text-white flex flex-col bg-[#F9FAF8]">
      {/* Top Header & Market Ticker */}
      <AppHeader />
      <PriceTicker />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 pt-6 pb-20">
        {children}
        <NewsletterSection />
      </main>

      {/* Misty Tropical Forest Footer */}
      <AppFooter />

      {/* Interactive Floaters */}
      <FloatingChatWidget />
      <BottomNav />
    </div>
  );
};
