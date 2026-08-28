'use client';

import { use } from 'react';
import { useRoomLogic } from './hooks/useRoomLogic';
import { useRoomStore } from '@/store/useRoomStore';

// Components
import ParticipantSidebar from './components/ParticipantSidebar';
import MapContainer from './components/MapContainer';
import RecommendationPanel from './components/RecommendationPanel';
import ParticipantModal from './components/ParticipantModal';

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;
  
  // Custom Hook for all Room Logic
  const {
    isLoading,
    editingParticipant, setEditingParticipant,
    aiQuery, setAiQuery,
    isAiLoading,
    aiError,
    newName, setNewName,
    newLocation, setNewLocation,
    newCoords,
    isSearching,
    isCopied,
    isSubmitting,
    showRecommendations, setShowRecommendations,
    rawMidpoint,
    finalMidpoint,
    handleShare,
    handleModalSubmit,
    removeParticipant,
    searchAddress,
    getCurrentLocation,
    handleAiRecommend
  } = useRoomLogic(roomId);

  const { setIsAdding } = useRoomStore();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-zinc-50 dark:bg-black overflow-hidden md:flex-row relative overscroll-none">
      
      {/* 1. 참여자 사이드바 (헤더 포함) */}
      <ParticipantSidebar 
        onRemove={removeParticipant}
        onEdit={(p) => {
          setEditingParticipant(p);
          setNewName(p.name);
          setNewLocation(p.location);
          // Set coords using store or local logic
          setIsAdding(true);
        }}
        onAdd={() => setIsAdding(true)}
      />

      {/* 2. 메인 지도 컨테이너 */}
      <MapContainer 
        rawMidpoint={rawMidpoint}
        finalMidpoint={finalMidpoint}
        onShare={handleShare}
        onAdd={() => setIsAdding(true)}
        isCopied={isCopied}
      />

      {/* 3. 맛집/장소 추천 패널 */}
      <RecommendationPanel 
        onAiRecommend={handleAiRecommend}
        isAiLoading={isAiLoading}
        aiError={aiError}
        aiQuery={aiQuery}
        setAiQuery={setAiQuery}
        showRecommendations={showRecommendations}
        setShowRecommendations={setShowRecommendations}
      />

      {/* 4. 참여자 추가/수정 모달 */}
      <ParticipantModal 
        newName={newName}
        setNewName={setNewName}
        newLocation={newLocation}
        setNewLocation={setNewLocation}
        newCoords={newCoords}
        isSearching={isSearching}
        isSubmitting={isSubmitting}
        editingParticipant={editingParticipant}
        onSearch={searchAddress}
        onGetCurrentLocation={getCurrentLocation}
        onSubmit={handleModalSubmit}
        onClose={() => {
          setIsAdding(false);
          setEditingParticipant(null);
        }}
      />
    </div>
  );
}
