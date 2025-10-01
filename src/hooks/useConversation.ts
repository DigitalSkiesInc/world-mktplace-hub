import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorldApp } from '@/contexts/WorldAppContext';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
}

export interface ConversationDetail {
  id: string;
  product: {
    id: string;
    title: string;
    images: string[];
    price: number;
    currency: string;
  };
  participant: {
    id: string;
    username: string;
    profilePictureUrl?: string;
    isVerified: boolean;
  };
  messages: Message[];
}

export const useConversation = (conversationId: string) => {
  const { user } = useWorldApp();

  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get conversation details
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          product_id,
          buyer_id,
          seller_id,
          products (id, title, images, price, currency),
          buyer:user_profiles!conversations_buyer_id_fkey (id, username, profile_picture_url, is_verified),
          seller:user_profiles!conversations_seller_id_fkey (id, username, profile_picture_url, is_verified)
        `)
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;

      // Get messages
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      const isUserBuyer = conversation.buyer_id === user.id;
      const participant = isUserBuyer ? conversation.seller : conversation.buyer;

      return {
        id: conversation.id,
        product: {
          id: conversation.products.id,
          title: conversation.products.title,
          images: conversation.products.images,
          price: conversation.products.price,
          currency: conversation.products.currency,
        },
        participant: {
          id: participant.id,
          username: participant.username,
          profilePictureUrl: participant.profile_picture_url,
          isVerified: participant.is_verified,
        },
        messages: messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.sender_id,
          createdAt: msg.created_at,
          isRead: msg.is_read,
        })),
      } as ConversationDetail;
    },
    enabled: !!user?.id && !!conversationId,
  });
};
