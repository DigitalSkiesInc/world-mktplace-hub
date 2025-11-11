import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

const commonEmojis = [
  '📱', '💻', '⌚', '📷', '🎮', '🎧', '📺', '🖥️',
  '👕', '👔', '👗', '👠', '👟', '🧥', '👜', '🎒',
  '🏠', '🛋️', '🛏️', '🪑', '🚪', '🪟', '💡', '🕯️',
  '⚽', '🏀', '🎾', '🏈', '🎱', '🏐', '🎯', '⛳',
  '📚', '📖', '✏️', '📝', '📌', '📎', '🖊️', '🖍️',
  '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎼', '🎹',
  '🍕', '🍔', '🍟', '🌭', '🥗', '🍰', '🍪', '☕',
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑',
];

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [customEmoji, setCustomEmoji] = useState('');

  const handleEmojiClick = (emoji: string) => {
    onChange(emoji);
  };

  const handleCustomSubmit = () => {
    if (customEmoji) {
      onChange(customEmoji);
      setCustomEmoji('');
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="text-2xl h-12 w-12 p-0">
          {value || '😀'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Common Emojis</p>
            <div className="grid grid-cols-8 gap-2">
              {commonEmojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="text-xl h-10 w-10 p-0"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Custom Emoji</p>
            <div className="flex gap-2">
              <Input
                placeholder="Paste emoji..."
                value={customEmoji}
                onChange={(e) => setCustomEmoji(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleCustomSubmit} size="sm">
                Add
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
