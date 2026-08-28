'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Search, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Participant } from '@/app/room/[id]/types';
import { useRoomStore } from '@/store/useRoomStore';

interface ParticipantModalProps {
  newName: string;
  setNewName: (name: string) => void;
  newLocation: string;
  setNewLocation: (loc: string) => void;
  newCoords: { lat: number; lng: number } | null;
  isSearching: boolean;
  isSubmitting: boolean;
  editingParticipant: Participant | null;
  onSearch: () => void;
  onGetCurrentLocation: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function ParticipantModal({
  newName,
  setNewName,
  newLocation,
  setNewLocation,
  newCoords,
  isSearching,
  isSubmitting,
  editingParticipant,
  onSearch,
  onGetCurrentLocation,
  onSubmit,
  onClose
}: ParticipantModalProps) {
  const { isAdding } = useRoomStore();
  
  if (!isAdding) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="p-8 pb-0 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                 <Users className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-0.5">
                 <h2 className="text-2xl font-black tracking-tight">
                    {editingParticipant ? '참여자 정보 수정' : '모임 참여하기'}
                 </h2>
                 <p className="text-[13px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">
                    정확한 중간지점 계산을 위해 필요한 정보입니다
                 </p>
              </div>
           </div>
           <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
           >
              <X className="w-6 h-6 text-zinc-500" />
           </button>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[13px] font-black text-zinc-400 uppercase tracking-widest ml-1">이름</label>
            <Input 
              placeholder="이름을 입력하세요" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 border-none px-6 font-bold text-lg"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black text-zinc-400 uppercase tracking-widest ml-1">출발 위치</label>
            <div className="flex gap-2">
              <Input 
                placeholder="지하철역 또는 주소 입력" 
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onSearch())}
                className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 border-none px-6 font-bold text-lg"
              />
              <Button 
                type="button"
                onClick={onSearch}
                loading={isSearching}
                className="h-14 w-14 rounded-2xl px-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
              >
                <Search className="w-6 h-6" />
              </Button>
            </div>
          </div>

          <div className="p-6 rounded-[32px] bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${newCoords ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {newCoords ? <Check className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                   </div>
                   <p className={`text-[14px] font-black transition-colors ${newCoords ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      {newCoords ? '위치가 확인되었습니다' : '위치를 검색해 주세요'}
                   </p>
                </div>
                <Button 
                   type="button"
                   onClick={onGetCurrentLocation}
                   variant="ghost"
                   className="text-[12px] font-black text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                >
                   내 현재 위치 사용
                </Button>
             </div>
             {newCoords && (
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                   <p className="text-[13px] font-bold text-zinc-500 truncate">{newLocation}</p>
                </div>
             )}
          </div>

          <div className="flex gap-4 pt-2">
            <Button 
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-16 rounded-[24px] font-black text-lg border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              취소
            </Button>
            <Button 
              type="submit"
              loading={isSubmitting}
              disabled={!newName.trim() || !newCoords}
              className="flex-2 h-16 rounded-[24px] font-black text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 disabled:opacity-50"
            >
              중간 지점 찾기
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
