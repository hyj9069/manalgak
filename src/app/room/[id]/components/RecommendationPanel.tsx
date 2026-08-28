'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, ChevronUp, ChevronDown, MessageCircleMore, Check, X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

import { useRoomStore } from '@/store/useRoomStore';
import { Recommendation } from '@/app/room/[id]/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';

interface RecommendationPanelProps {
  onAiRecommend: (query: string) => Promise<void>;
  isAiLoading: boolean;
  aiError: string | null;
  aiQuery: string;
  setAiQuery: (query: string) => void;
  showRecommendations: boolean;
  setShowRecommendations: (show: boolean) => void;
}

export default function RecommendationPanel({
  onAiRecommend,
  isAiLoading,
  aiError,
  aiQuery,
  setAiQuery,
  showRecommendations,
  setShowRecommendations
}: RecommendationPanelProps) {
  const { 
    nearestStation, 
    recommendations, 
    aiRecommendations, 
    recoCategory, 
    setRecoCategory,
    selectedRecoId,
    setSelectedRecoId 
  } = useRoomStore();

  const getStableData = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
    }
    const rating = (4.0 + (Math.abs(hash % 10) / 10)).toFixed(1);
    const reviews = (Math.abs(hash % 500) + 50);
    return { rating, reviews };
  };

  const currentRecos = recoCategory === 'AI' ? aiRecommendations : recommendations;

  return (
    <motion.div 
      initial={false}
      animate={{ y: showRecommendations ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? 'calc(100% - 130px)' : 'calc(100% - 140px)') }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-3xl border-t border-zinc-200 dark:border-zinc-800 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] rounded-t-[48px] px-6 pb-20 pt-6 md:px-12 md:pb-12"
    >
      {/* Handle / Header */}
      <div className="flex flex-col items-center mb-8 relative">
        <button 
          onClick={() => setShowRecommendations(!showRecommendations)}
          className="w-16 h-1 w-1 bg-zinc-300 dark:bg-zinc-800 rounded-full mb-6 cursor-pointer"
        />
        <div className="flex items-center justify-between w-full">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-2xl font-black tracking-tight">{nearestStation?.name || '중간지점'} 근처 추천</h3>
                <p className="text-[14px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  실시간 핫플레이스 {currentRecos.length}곳
                </p>
              </div>
           </div>
           
           <div className="flex items-center gap-2">
             {(['FD6', 'CE7', '술집', 'AI'] as const).map((cat) => (
               <button
                 key={cat}
                 onClick={() => {
                   setRecoCategory(cat);
                   setShowRecommendations(true);
                 }}
                 className={`
                    px-5 py-3 rounded-2xl text-[14px] font-black transition-all border
                    ${recoCategory === cat 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20 scale-105' 
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800'}
                 `}
               >
                 {cat === 'FD6' ? '음식점' : cat === 'CE7' ? '카페' : cat === '술집' ? '술집' : 'AI'}
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* AI Search Section (Conditional) */}
      <AnimatePresence>
        {recoCategory === 'AI' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="flex items-center gap-3 p-2 bg-zinc-100 dark:bg-zinc-900/50 rounded-[28px] border border-zinc-200 dark:border-zinc-800">
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                  <Zap className="w-6 h-6 text-white" />
               </div>
               <Input 
                  placeholder="예: 조용하고 분위기 좋은 와인 바 알려줘" 
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onAiRecommend(aiQuery)}
                  className="bg-transparent border-none focus:ring-0 text-lg font-bold placeholder:text-zinc-400 placeholder:font-bold"
               />
               <Button 
                  onClick={() => onAiRecommend(aiQuery)}
                  loading={isAiLoading}
                  className="rounded-2xl h-12 px-6 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black hover:scale-105 transition-transform"
               >
                  AI에게 묻기
               </Button>
            </div>
            {aiError && (
              <p className="mt-3 ml-16 text-[13px] font-bold text-red-500 flex items-center gap-2">
                 <MessageCircleMore className="w-4 h-4" />
                 {aiError}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swiper Content */}
      <div className="relative group">
        <Swiper
          modules={[FreeMode]}
          spaceBetween={16}
          slidesPerView="auto"
          freeMode={true}
          className="recommendation-swiper !overflow-visible"
        >
          {currentRecos.map((reco) => (
             <SwiperSlide key={reco.id} className="!w-[320px] md:!w-[380px]">
                <button
                  onClick={() => setSelectedRecoId(reco.id)}
                  className={`
                    w-full p-6 rounded-[32px] text-left transition-all duration-500 border-2 relative overflow-hidden group/card
                    ${selectedRecoId === reco.id 
                      ? 'bg-blue-600 border-blue-500 shadow-2xl shadow-blue-500/30 scale-[1.02]' 
                      : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-blue-500/30 hover:shadow-xl'}
                  `}
                >
                  {/* ... Card Content ... */}
                   <div className="flex flex-col gap-4 relative z-10">
                      <div className="flex justify-between items-start">
                         <div className="space-y-1 max-w-[200px]">
                            <h4 className={`text-xl font-black truncate tracking-tight transition-colors ${selectedRecoId === reco.id ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                              {reco.title}
                            </h4>
                            <p className={`text-[13px] font-bold transition-opacity ${selectedRecoId === reco.id ? 'text-white/80' : 'text-zinc-500'}`}>
                              {reco.category} • {reco.distance}m
                            </p>
                         </div>
                         <div className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${selectedRecoId === reco.id ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                            <Star className={`w-3.5 h-3.5 fill-current ${selectedRecoId === reco.id ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                            <span className={`text-[13px] font-black ${selectedRecoId === reco.id ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                              {getStableData(reco.id).rating}
                            </span>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <div className="flex items-center gap-2 text-[13px] font-bold text-zinc-400">
                            <span className="truncate">{reco.address}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <a 
                              href={reco.url} 
                              target="_blank" 
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl font-black transition-all ${selectedRecoId === reco.id ? 'bg-white text-blue-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                            >
                               상세 정보
                            </a>
                            <Button 
                              onClick={(e) => { e.stopPropagation(); setSelectedRecoId(reco.id); }}
                              className={`w-12 h-12 rounded-2xl px-0 ${selectedRecoId === reco.id ? 'bg-white/20 text-white' : 'bg-blue-600 text-white'}`}
                            >
                               {selectedRecoId === reco.id ? <Check className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                            </Button>
                         </div>
                      </div>
                   </div>
                </button>
             </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </motion.div>
  );
}
