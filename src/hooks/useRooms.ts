import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CreateRoomInput, Room } from '@/types/database';

export const useRooms = () => {
  const queryClient = useQueryClient();

  // Mutation for creating a new room
  const createRoomMutation = useMutation({
    mutationFn: async (newRoom: CreateRoomInput) => {
      const { data, error } = await supabase
        .from('rooms')
        .insert([newRoom])
        .select()
        .single();

      if (error) throw error;
      return data as Room;
    },
    onSuccess: () => {
      // Invalidate the 'rooms' list query to refetch if we had such a query
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  // Example: Query for fetching a specific room by id
  const useRoomDetail = (id: string) => {
    return useQuery({
      queryKey: ['rooms', id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data as Room;
      },
      enabled: !!id,
    });
  };

  return {
    createRoomMutation,
    useRoomDetail,
  };
};
