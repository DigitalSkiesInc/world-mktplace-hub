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

      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          id,
          product_id,
          buyer_id,
          seller_id,
          last_message_at,
          products (id, title, images),
          buyer:user_profiles!conversations_buyer_id_fkey (id, username, profile_picture_url, is_verified),
          seller:user_profiles!conversations_seller_id_fkey (id, username, profile_picture_url, is_verified)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get last message and unread count for each conversation
      const conversationsWithDetails = await Promise.all(
        (conversations || []).map(async (conv: any) => {
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
          const isUserBuyer = conv.buyer_id === user.id;
          const participant = isUserBuyer ? conv.seller : conv.buyer;

          return {
            id: conv.id,
            product: {
              id: conv.products.id,
              title: conv.products.title,
              images: conv.products.images,
            },
            participant: {
              id: participant.id,
              username: participant.username,
              profilePictureUrl: participant.profile_picture_url,
              isVerified: participant.is_verified,
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
