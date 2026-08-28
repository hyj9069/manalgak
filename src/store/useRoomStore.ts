import { create } from 'zustand';
import { Participant, Recommendation } from '@/app/room/[id]/types';

interface RoomState {
  participants: Participant[];
  onlineParticipants: string[];
  roomTitle: string;
  myParticipantId: string | null;
  nearestStation: { name: string; lat: number; lng: number } | null;
  recommendations: Recommendation[];
  aiRecommendations: Recommendation[];
  recoCategory: 'FD6' | 'CE7' | '술집' | 'AI';
  selectedRecoId: string | null;
  isSidebarCollapsed: boolean;
  isAdding: boolean;
  
  // Actions
  setParticipants: (p: Participant[]) => void;
  setOnlineParticipants: (ids: string[]) => void;
  setRoomTitle: (title: string) => void;
  setMyParticipantId: (id: string | null) => void;
  setNearestStation: (station: { name: string; lat: number; lng: number } | null) => void;
  setRecommendations: (recos: Recommendation[]) => void;
  setAiRecommendations: (recos: Recommendation[]) => void;
  setRecoCategory: (cat: 'FD6' | 'CE7' | '술집' | 'AI') => void;
  setSelectedRecoId: (id: string | null) => void;
  setIsSidebarCollapsed: (is: boolean) => void;
  setIsAdding: (is: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  participants: [],
  onlineParticipants: [],
  roomTitle: '모임',
  myParticipantId: null,
  nearestStation: null,
  recommendations: [],
  aiRecommendations: [],
  recoCategory: 'FD6',
  selectedRecoId: null,
  isSidebarCollapsed: true,
  isAdding: false,

  setParticipants: (participants) => set({ participants }),
  setOnlineParticipants: (onlineParticipants) => set({ onlineParticipants }),
  setRoomTitle: (roomTitle) => set({ roomTitle }),
  setMyParticipantId: (myParticipantId) => set({ myParticipantId }),
  setNearestStation: (nearestStation) => set({ nearestStation }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setAiRecommendations: (aiRecommendations) => set({ aiRecommendations }),
  setRecoCategory: (recoCategory) => set({ recoCategory }),
  setSelectedRecoId: (selectedRecoId) => set({ selectedRecoId }),
  setIsSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
  setIsAdding: (isAdding) => set({ isAdding }),
}));
