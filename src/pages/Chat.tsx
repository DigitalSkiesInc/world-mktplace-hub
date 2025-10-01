import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { useConversations } from '@/hooks/useConversations';

const Chat: React.FC = () => {
  const { user } = useWorldApp();
  const [searchQuery, setSearchQuery] = React.useState('');
  const { data: conversations = [], isLoading } = useConversations();

  const filteredConversations = conversations.filter(conv =>
    conv.participant.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pb-20">
        <div className="text-center max-w-sm">
          <MessageCircle size={64} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Connect to Chat
          </h2>
          <p className="text-muted-foreground mb-6">
            Verify with World ID to start chatting with buyers and sellers
          </p>
          <Link to="/profile">
            <Button className="bg-gradient-primary">
              Get Verified
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="px-4 py-3">
          <h1 className="text-xl font-semibold text-foreground mb-3">Messages</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Conversations */}
      <div className="px-4 py-2">
        {isLoading ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <Link
                key={conversation.id}
                to={`/chat/${conversation.id}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-muted transition-colors"
              >
                {/* Product Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={conversation.product.images[0]}
                    alt={conversation.product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  {/* User & Product Info */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground truncate">
                      {conversation.participant.username}
                    </span>
                    {conversation.participant.isVerified && (
                      <Shield size={14} className="text-primary flex-shrink-0" />
                    )}
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {conversation.product.title}
                    </span>
                  </div>

                  {/* Last Message */}
                  {conversation.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage.senderId === user?.id && 'You: '}
                      {conversation.lastMessage.content}
                    </p>
                  )}
                </div>

                {/* Timestamp & Unread */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    {formatTime(conversation.lastMessageAt)}
                  </div>
                  
                  {conversation.unreadCount > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-xs min-w-5 h-5 flex items-center justify-center rounded-full">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Start buying or selling to begin conversations'
              }
            </p>
            
            {!searchQuery && (
              <Link to="/">
                <Button variant="outline">
                  Browse Products
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default Chat;