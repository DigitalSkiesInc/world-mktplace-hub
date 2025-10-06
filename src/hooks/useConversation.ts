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
      const { data: conversation, error: convError } = await supabase.rpc('get_conversations_with_participant', {
        conversation_id: conversationId,
        current_user_id: user.id
      }).single();

      if (convError || !conversation) throw convError ?? new Error('Conversation not found');


      // Get messages
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;


      return {
        id: conversation.id,
        product: {
          id: conversation.product_id,
          title: conversation.product_title,
          images: conversation.product_images,
          price: conversation.product_price,
          currency: conversation.product_currency,
        },
        participant: {
          id: conversation.participant_id,
          username: conversation.participant_username,
          profilePictureUrl: conversation.participant_profile_picture_url,
          isVerified: conversation.participant_is_verified,
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
