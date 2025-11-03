import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SafetyNoticeProps {
  message?: string;
  compact?: boolean;
}

export const SafetyNotice: React.FC<SafetyNoticeProps> = ({
  message,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const fullMessage = message ?? 'Safety Notice: Only pay if you can trust the seller. If meeting, only do so in public or safe places';
  const shortMessage = 'Safety Notice:';

  return (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className={`${
        compact ? 'px-2 py-1.5' : 'p-1.5'
      } w-full bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm hover:bg-amber-100 transition-colors`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 text-left">
          <span>⚠️</span>
          <span className={isExpanded ? '' : 'truncate'}>
            {isExpanded ? fullMessage : shortMessage}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="flex-shrink-0" />
        )}
      </div>
    </button>
  );
};