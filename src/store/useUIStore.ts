import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  // Temporary room name state during creation
  tempMeetingName: string;
  setTempMeetingName: (name: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  tempMeetingName: '',
  setTempMeetingName: (name: string) => set({ tempMeetingName: name }),
}));
