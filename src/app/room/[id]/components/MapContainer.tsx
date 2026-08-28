'use client';

import { useMemo, useCallback } from 'react';
import { Share2, ChevronLeft, ChevronRight } from 'lucide-react';
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
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useRoomStore();

  const mapMarkers = useMemo(() => participants.map(p => ({
    lat: p.coords.lat,
    lng: p.coords.lng,
    title: p.name
  })), [participants]);

  const mapRecommendations = useMemo(() => (
    recoCategory === 'AI' ? aiRecommendations : recommendations
  ), [recoCategory, aiRecommendations, recommendations]);

  const mapCenter = useMemo(() => rawMidpoint || { lat: 37.5665, lng: 126.9780 }, [rawMidpoint]);
  const handleRecoClick = useCallback((id: string) => setSelectedRecoId(id), [setSelectedRecoId]);
  const handleMapClick = useCallback(() => setSelectedRecoId(null), [setSelectedRecoId]);
  const handleSidebarToggle = useCallback(() => setIsSidebarCollapsed(!isSidebarCollapsed), [isSidebarCollapsed, setIsSidebarCollapsed]);

  return (
    <div className="flex-1 relative h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 transition-colors duration-500 overflow-hidden">
      <KakaoMap
        center={mapCenter}
        level={7}
        markers={mapMarkers}
        midpoint={finalMidpoint}
        recommendations={mapRecommendations}
        selectedRecommendationId={selectedRecoId}
        onRecommendationClick={handleRecoClick}
        onMapClick={handleMapClick}
      />

      {/* Sidebar Toggle Button */}
      <button
        onClick={handleSidebarToggle}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-7 h-14 bg-white dark:bg-zinc-900 border border-l-0 border-zinc-200 dark:border-zinc-700 rounded-r-2xl shadow-md flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        aria-label={isSidebarCollapsed ? '참여자 목록 열기' : '참여자 목록 닫기'}
      >
        {isSidebarCollapsed
          ? <ChevronRight className="w-4 h-4 text-zinc-500" />
          : <ChevronLeft className="w-4 h-4 text-zinc-500" />
        }
      </button>

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
    </div>
  );
}
