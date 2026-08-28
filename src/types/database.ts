export interface Room {
  id: string;
  created_at: string;
  title: string;
  // Add other fields as they are discovered in the schema
}

export type CreateRoomInput = Pick<Room, 'title'>;
