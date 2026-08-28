'use client';

import { motion } from 'framer-motion';
import { Users, X } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';

export default function RoomHeader() {
  const { 
    roomTitle, 
    participants, 
    isSidebarCollapsed, 
    setIsSidebarCollapsed 
  } = useRoomStore();

  return (
    <div className="p-8 flex items-center justify-between border-b border-white/5 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">
          {roomTitle}
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {participants.slice(0, 3).map((p) => (
              <div key={p.id} className="w-5 h-5 rounded-full border-2 border-zinc-950 bg-blue-500/20 flex items-center justify-center text-[8px] font-bold text-blue-400">
                {p.name[0]}
              </div>
            ))}
          </div>
          <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">
            {participants.length}명이 참여중
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5">
          <Users className="w-5 h-5 text-white/60" aria-hidden="true" />
        </div>
        {/* Mobile Close Button */}
        {!isSidebarCollapsed && (
          <button 
            onClick={() => setIsSidebarCollapsed(true)}
            className="md:hidden w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        )}
      </div>
    </div>
  );
}
