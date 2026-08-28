export interface Participant {
  id: string;
  name: string;
  location: string;
  coords: { lat: number; lng: number };
}

export interface Recommendation {
  id: string;
  name: string;
  title: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  url: string;
  distance: string;
}

export interface DbParticipant {
  id: string;
  room_id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  created_at?: string;
}

export interface PresenceState {
  participant_id: string;
  online_at: string;
}
