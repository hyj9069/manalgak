'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import { Participant } from '@/app/room/[id]/types';
import RoomHeader from './RoomHeader';

interface ParticipantSidebarProps {
  onRemove: (id: string) => void;
  onEdit: (p: Participant) => void;
  onAdd: () => void;
}

export default function ParticipantSidebar({ onRemove, onEdit, onAdd }: ParticipantSidebarProps) {
  const { 
    participants, 
    onlineParticipants, 
    myParticipantId, 
    isSidebarCollapsed,
    setIsAdding
  } = useRoomStore();

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <motion.aside 
      id="participant-sidebar"
      aria-label="참여자 목록"
      initial={false}
      animate={{ 
        x: isSidebarCollapsed ? (isMobile ? '-100%' : -384) : 0,
        marginRight: isSidebarCollapsed ? (isMobile ? 0 : -384) : 0,
        opacity: isSidebarCollapsed ? 0 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`
        flex flex-col bg-zinc-950 text-white
        transition-colors duration-500 h-full overflow-hidden z-[90] fixed md:relative top-0 left-0
        ${isSidebarCollapsed ? 'pointer-events-none' : 'pointer-events-auto'}
        w-full md:w-[384px]
        flex-shrink-0
      `}
    >
      <RoomHeader />

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 premium-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {participants.map((p) => (
              <motion.div 
                layout
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative"
              >
                <div 
                  className={`
                    p-5 rounded-[28px] border transition-all duration-300
                    ${p.id === myParticipantId 
                      ? 'bg-blue-900/20 border-blue-800/50' 
                      : 'bg-zinc-900/40 border-white/5 hover:border-white/10'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 flex-shrink-0 rounded-2xl bg-zinc-900 shadow-sm border border-white/5 flex items-center justify-center font-black text-blue-400 overflow-hidden relative group-hover:scale-105 transition-transform">
                      {p.name[0]}
                      {onlineParticipants.includes(p.id) && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-500 border-2 border-zinc-900" />
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-3 pr-[70px]">
                        <p className="font-black text-[15px] tracking-tight truncate text-white">{p.name}</p>
                        {p.id === myParticipantId && (
                          <span className="text-[9px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">나</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Edit/Delete) */}
                  <div className="flex items-center gap-2 mt-4">
                    {p.id === myParticipantId && (
                      <button 
                        onClick={() => onEdit(p)}
                        className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 transition-colors text-[12px] font-bold"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        수정
                      </button>
                    )}
                    <button 
                      onClick={() => onRemove(p.id)}
                      className={`
                        ${p.id === myParticipantId ? 'w-10' : 'flex-1'} 
                        h-10 rounded-xl bg-red-950/20 hover:bg-red-900/40 border border-red-900/20 transition-colors flex items-center justify-center text-red-500
                      `}
                    >
                      <Trash2 className="w-4 h-4" />
                      {p.id !== myParticipantId && <span className="ml-2 text-[12px] font-bold">삭제</span>}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Empty State / Add Participant Button */}
            {!participants.some(p => p.id === myParticipantId) && (
              <button 
                onClick={onAdd}
                className="w-full p-6 rounded-[28px] border-2 border-dashed border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-center">
                  <p className="font-black text-[15px]">내 출발 위치 추가하기</p>
                  <p className="text-[11px] text-white/40 font-bold mt-1">지도의 중간 지점이 정확해집니다</p>
                </div>
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
