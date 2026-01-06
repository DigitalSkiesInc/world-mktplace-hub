import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConversation } from '@/hooks/useConversation';
import { useProductForChat } from '@/hooks/useProductForChat';
import { useCreateConversation } from '@/hooks/useCreateConversation';
import { useSendMessage } from '@/hooks/useSendMessage';
import { useWorldApp } from '@/contexts/WorldAppContext';

const ChatConversation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useWorldApp();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isNewConversation = id === 'new';
  const productId = searchParams.get('productId');
  const sellerId = searchParams.get('sellerId');

  // Track the created conversation ID for new conversations
  const [createdConversationId, setCreatedConversationId] = useState<string | null>(null);

  // For existing conversations
  const { data: conversation, isLoading: convLoading } = useConversation(
    isNewConversation ? '' : id!
  );

  // For new conversations - fetch product/seller directly
  const { data: newChatData, isLoading: newChatLoading } = useProductForChat(
    isNewConversation ? productId : null,
    isNewConversation ? sellerId : null
  );

  const createConversation = useCreateConversation();
  const sendMessageMutation = useSendMessage();

  // Determine which data to use
  const displayData = isNewConversation ? newChatData : conversation;
  const messages = isNewConversation ? [] : (conversation?.messages || []);
  const isLoading = isNewConversation ? newChatLoading : convLoading;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    let targetConversationId = createdConversationId || id;

    // If new conversation, create it first
    if (isNewConversation && !createdConversationId) {
      if (!productId || !sellerId) return;

      const newConv = await createConversation.mutateAsync({
        productId: productId,
        sellerId: sellerId,
      });

      if (!newConv) return;

      targetConversationId = newConv.id;
      setCreatedConversationId(newConv.id);

      // Update URL without adding to history
      navigate(`/chat/${newConv.id}`, { replace: true });
    }

    if (!targetConversationId || targetConversationId === 'new') return;

    // Send the message
    await sendMessageMutation.mutateAsync({
      conversationId: targetConversationId,
      content: message.trim(),
    });

    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-muted-foreground mb-4">Please log in to view conversations</p>
        <Button onClick={() => navigate('/login')}>Log In</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-muted-foreground mb-4">Conversation not found</p>
        <Button onClick={() => navigate('/chat')}>Back to Messages</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/chat')}
              className="flex-shrink-0"
            >
              <ArrowLeft size={20} />
            </Button>

            <Link to={`/product/${displayData.product.id}`} className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={displayData.product.images[0]}
                  alt={displayData.product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground truncate">
                    {displayData.participant.username}
                  </span>
                  {displayData.participant.isVerified && (
                    <Shield size={14} className="text-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {displayData.product.title}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Product Info Banner */}
        <Link
          to={`/product/${displayData.product.id}`}
          className="flex items-center gap-3 px-4 py-2 bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-background">
            <img
              src={displayData.product.images[0]}
              alt={displayData.product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{displayData.product.title}</p>
            <p className="text-sm text-primary font-semibold">
              {displayData.product.price} {displayData.product.currency}
            </p>
          </div>
        </Link>

        {/* Safety Precaution Banner */}
        <div className="mx-4 mt-3 px-3 py-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Be cautious when making purchases.{' '}
              <Link to="/safety-guidelines" className="underline font-medium hover:text-amber-900 dark:hover:text-amber-100">
                Learn more
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-center">No messages yet. Start the conversation!</p>
        ) : (messages.map((msg) => {
          const isOwnMessage = msg.senderId === user.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${isOwnMessage
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                  }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="sticky bottom-16 bg-background border-t border-border px-4 py-3">
        <div className="flex items-end gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sendMessageMutation.isPending || createConversation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending || createConversation.isPending}
            size="icon"
            className="flex-shrink-0"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatConversation;
