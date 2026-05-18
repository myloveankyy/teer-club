"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, CheckCircle2, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const STREAK_KEY = "teer_login_streak";
const LAST_VISIT_KEY = "teer_last_visit";
const TARGET_STREAK = 3;

export function SunkCostStreak() {
  const [streak, setStreak] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const lastVisitStr = localStorage.getItem(LAST_VISIT_KEY);
    let currentStreak = parseInt(localStorage.getItem(STREAK_KEY) || "0", 10);

    if (lastVisitStr) {
      const lastVisit = new Date(lastVisitStr);
      const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Logged in consecutive day
        if (currentStreak < TARGET_STREAK) {
          currentStreak += 1;
        }
      } else if (diffDays > 1) {
        // Streak broken
        currentStreak = 1;
      }
      // if diffDays === 0, already logged in today, do nothing
    } else {
      // First visit ever or after clearing cache
      currentStreak = 1;
    }

    localStorage.setItem(LAST_VISIT_KEY, todayStr);
    localStorage.setItem(STREAK_KEY, currentStreak.toString());
    setStreak(currentStreak);
  }, []);

  if (!isClient) return null;

  return (
    <div className="w-full max-w-md mx-auto my-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-1 shadow-lg">
      <div className="bg-white rounded-xl p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Flame className={cn("w-5 h-5", streak > 0 ? "text-orange-500 fill-orange-500" : "text-gray-400")} />
              Daily Streak
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Return 3 days in a row to unlock a Sunday Direct Number!
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-orange-600">{streak}</span>
            <span className="text-sm font-bold text-gray-400">/{TARGET_STREAK}</span>
          </div>
        </div>

        <div className="flex justify-between items-center px-4 relative">
          {/* Progress Line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-10 rounded-full" />
          
          {[1, 2, 3].map((day) => {
            const isCompleted = streak >= day;
            const isToday = streak === day;
            
            return (
              <div key={day} className="flex flex-col items-center gap-2 bg-white px-2">
                <motion.div
                  initial={isToday ? { scale: 0.8, opacity: 0 } : false}
                  animate={isToday ? { scale: 1, opacity: 1 } : false}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                    isCompleted 
                      ? "border-orange-500 bg-orange-50 text-orange-600" 
                      : "border-gray-200 bg-gray-50 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : day === TARGET_STREAK ? (
                    <Gift className="w-5 h-5" />
                  ) : (
                    <span className="font-bold">{day}</span>
                  )}
                </motion.div>
                <span className={cn(
                  "text-xs font-semibold",
                  isCompleted ? "text-orange-600" : "text-gray-400"
                )}>
                  Day {day}
                </span>
              </div>
            );
          })}
        </div>

        {streak >= TARGET_STREAK && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 p-3 bg-green-50 rounded-lg border border-green-200 flex flex-col items-center text-center"
          >
            <span className="text-green-800 font-bold text-sm mb-1">🎉 Sunday Direct Number Unlocked! 🎉</span>
            <span className="text-3xl font-black text-green-600 tracking-widest bg-white px-4 py-1 rounded-md border border-green-300 shadow-sm mt-2">
              92
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
