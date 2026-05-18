"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Share2, Unlock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TARGET_SHARES = 5;
const STORAGE_KEY = "teer_vip_unlocked_date";
const FAKE_VIP_NUMBER = "47, 82"; // We can randomize this later or fetch it, but hardcoded creates a standard "Sure Number" feel

export function ShareToUnlock() {
  const [shares, setShares] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const lastUnlockDate = localStorage.getItem(STORAGE_KEY);
    const todayDate = new Date().toISOString().split("T")[0];

    if (lastUnlockDate === todayDate) {
      setIsUnlocked(true);
      setShares(TARGET_SHARES);
    }
  }, []);

  const handleShare = () => {
    if (isUnlocked) return;

    // The viral WhatsApp message
    const message = encodeURIComponent(
      "🔥 Check out today's 100% Sure VIP Target Number for Shillong Teer! 🎯 Bookies don't want you to see this. Click here before it's deleted: https://teer.club"
    );
    
    // Open WhatsApp intent
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");

    // Increment share count after a slight delay to simulate "checking"
    setTimeout(() => {
      setShares((prev) => {
        const newShares = prev + 1;
        if (newShares >= TARGET_SHARES) {
          setIsUnlocked(true);
          const todayDate = new Date().toISOString().split("T")[0];
          localStorage.setItem(STORAGE_KEY, todayDate);
        }
        return newShares;
      });
    }, 1500);
  };

  if (!isClient) return null;

  return (
    <div className="w-full max-w-md mx-auto my-6 overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 animate-pulse text-yellow-300" />
            VIP Target Number
          </h3>
          <span className="bg-red-900/50 text-red-100 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-500/30">
            Today Only
          </span>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="w-32 h-16 bg-gray-100 rounded-lg flex items-center justify-center filter blur-md select-none border border-gray-300">
                  <span className="text-4xl font-black text-gray-800">88, 99</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-600 rounded-full p-3 shadow-lg text-white">
                    <Lock className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <h4 className="text-xl font-bold text-gray-900 mb-2">Number is Locked</h4>
              <p className="text-sm text-gray-600 mb-6">
                Share this page to <strong className="text-gray-900">5 WhatsApp groups</strong> or friends to unlock today's guaranteed VIP target number.
              </p>

              {/* Progress Bar */}
              <div className="w-full mb-6">
                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                  <span>Progress</span>
                  <span className="text-red-600">{shares} / {TARGET_SHARES} Shares</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(shares / TARGET_SHARES) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              <button
                onClick={handleShare}
                className="w-full bg-[#25D366] hover:bg-[#1ebd5a] active:scale-[0.98] transition-all text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
              >
                <Share2 className="w-5 h-5" />
                Share on WhatsApp
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="unlocked"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-4"
            >
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Unlock className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-gray-600 mb-2 uppercase tracking-widest text-xs">Today's VIP Target</h4>
              
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-5xl font-black py-4 px-8 rounded-2xl shadow-inner border border-yellow-300">
                  {FAKE_VIP_NUMBER}
                </div>
              </div>
              
              <p className="text-sm text-green-700 font-medium bg-green-50 px-4 py-2 rounded-lg">
                Unlocked successfully! Play these numbers in the next round.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
