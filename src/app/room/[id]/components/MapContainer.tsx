'use client';

import { useMemo } from 'react';
import { MapPin, Plus, Share2 } from 'lucide-react';
import KakaoMap from '@/components/KakaoMap';
import { useRoomStore } from '@/store/useRoomStore';
import { Button } from '@/components/ui/Button';

interface MapContainerProps {
  rawMidpoint: { lat: number; lng: number } | null;
  finalMidpoint: { lat: number; lng: number } | null;
  onShare: () => void;
  onAdd: () => void;
  isCopied: boolean;
}

export default function MapContainer({ 
  rawMidpoint, 
  finalMidpoint, 
  onShare, 
  onAdd,
  isCopied 
}: MapContainerProps) {
  const { 
    participants, 
    recoCategory, 
    recommendations, 
    aiRecommendations, 
    selectedRecoId,
    setSelectedRecoId,
    setIsAdding 
  } = useRoomStore();

  const mapMarkers = useMemo(() => participants.map(p => ({
    lat: p.coords.lat,
    lng: p.coords.lng,
    title: p.name
  })), [participants]);

  const mapRecommendations = useMemo(() => (
    recoCategory === 'AI' ? aiRecommendations : recommendations
  ), [recoCategory, aiRecommendations, recommendations]);

  return (
    <div className="flex-1 relative h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 transition-colors duration-500 overflow-hidden">
      <KakaoMap 
        center={rawMidpoint || { lat: 37.5665, lng: 126.9780 }} 
        level={7}
        markers={mapMarkers}
        midpoint={finalMidpoint}
        recommendations={mapRecommendations}
        selectedRecommendationId={selectedRecoId}
        onRecommendationClick={(id) => setSelectedRecoId(id)}
        onMapClick={() => setSelectedRecoId(null)}
      />

      {/* Floating Action Buttons */}
      <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
        <Button 
          variant="outline" 
          className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl h-12 px-5 font-bold flex items-center gap-2 group"
          onClick={onShare}
        >
          <Share2 className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          <span className="text-zinc-900 dark:text-zinc-100">{isCopied ? '복사됨!' : '방 공유하기'}</span>
        </Button>
      </div>

      {!finalMidpoint && participants.length > 0 && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-zinc-950/20 backdrop-blur-[2px]">
          <div className="bg-white/95 dark:bg-zinc-950/95 p-8 rounded-[40px] shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center max-w-sm">
             <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-blue-500" />
             </div>
             <h2 className="text-xl font-black mb-3">중간 지점을 찾으시나요?</h2>
             <p className="text-[14px] text-zinc-500 dark:text-zinc-400 font-medium mb-8 leading-relaxed">
                2명 이상의 참여자가 있어야<br/>정확한 중간 지점 계산이 가능합니다.
             </p>
             <Button 
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/20 text-lg group"
                onClick={onAdd}
             >
                내 위치 추가하기
                <Plus className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
             </Button>
          </div>
        </div>
      )}
    </div>
  );
}
