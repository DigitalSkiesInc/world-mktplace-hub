import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorldApp } from '@/contexts/WorldAppContext';

export interface Conversation {
  id: string;
  product: {
    id: string;
    title: string;
    images: string[];
  };
  participant: {
    id: string;
    username: string;
    profilePictureUrl?: string;
    isVerified: boolean;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
  lastMessageAt: string;
}

export const useConversations = () => {
  const { user } = useWorldApp();

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: conversations, error } = await supabase.rpc(
        'get_conversations_with_participant',
        { current_user_id: user.id }
      );

      if (error) throw error;

      // Get last message and unread count for each conversation
      const conversationsWithDetails = await Promise.all(
        (conversations || [] ).map(async (conv) => {
          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          // Determine who the other participant is
          // const isUserBuyer = conv.buyer_id === user.id;
          // const participant = isUserBuyer ? conv.seller : conv.buyer;

          return {
            id: conv.id,
            product: {
              id: conv.product_id,
              title: conv.product_title,
              images: conv.product_images,
            },
            participant: {
              id: conv.participant_id,
              username: conv.participant_username,
              profilePictureUrl: conv.participant_profile_picture_url,
              isVerified: conv.participant_is_verified,
            },
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              createdAt: lastMessage.created_at,
              senderId: lastMessage.sender_id,
            } : undefined,
            unreadCount: unreadCount || 0,
            lastMessageAt: conv.last_message_at,
          } as Conversation;
        })
      );

      return conversationsWithDetails;
    },
    enabled: !!user?.id,
  });
};
