"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, BellRing } from "lucide-react";

// Fake data pools for social proof
const NAMES = ["Rahul", "Amit", "Priya", "Sunil", "Vikram", "Anjali", "Ramesh", "Deepak", "Sanjay", "Neha"];
const LOCATIONS = ["Guwahati", "Shillong", "Tura", "Silchar", "Tezpur", "Jowai", "Nagaon", "Dimapur"];
const ACTIONS = [
  "just unlocked the VIP Target Number! 🎯",
  "joined the Telegram Channel. 📱",
  "is viewing Shillong Teer predictions. 👀",
  "just won using yesterday's common number! 💰",
  "shared the site with 5 friends. 🔥"
];

interface ToastData {
  id: number;
  name: string;
  location: string;
  action: string;
}

export function LiveActivityToasts() {
  const [currentToast, setCurrentToast] = useState<ToastData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    let timeoutId: NodeJS.Timeout;

    const showRandomToast = () => {
      // Pick random data
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];

      setCurrentToast({
        id: Date.now(),
        name,
        location,
        action,
      });

      // Hide the toast after 4 seconds
      setTimeout(() => {
        setCurrentToast(null);
      }, 4000);

      // Schedule next toast between 8s and 25s
      const nextDelay = Math.floor(Math.random() * (25000 - 8000 + 1)) + 8000;
      timeoutId = setTimeout(showRandomToast, nextDelay);
    };

    // Initial delay before first toast (5s)
    timeoutId = setTimeout(showRandomToast, 5000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  if (!isClient) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] pointer-events-none sm:bottom-6 sm:left-6 max-w-[calc(100vw-32px)]">
      <AnimatePresence>
        {currentToast && (
          <motion.div
            key={currentToast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl rounded-2xl p-4 flex items-start gap-3 w-full max-w-sm"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center border border-blue-200">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentToast.name} <span className="text-gray-500 font-normal text-xs">from {currentToast.location}</span>
              </p>
              <p className="text-sm text-gray-600 mt-0.5 line-clamp-2 leading-tight">
                {currentToast.action}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
