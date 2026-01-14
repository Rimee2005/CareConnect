'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { featureFlags } from '@/lib/feature-flags';

interface AIBadgeProps {
  explanation: string;
  reasons: string[];
  score?: number;
}

export function AIBadge({ explanation, reasons, score }: AIBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!featureFlags.AI_MATCHING) {
    return null;
  }

  return (
    <div className="relative">
      <Badge
        variant="outline"
        className="flex items-center gap-1 border-primary/30 text-primary cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="AI-recommended Guardian"
      >
        <Sparkles className="h-3 w-3" />
        <span className="text-xs">AI-recommended</span>
      </Badge>

      {showTooltip && (
        <Card className="absolute bottom-full left-0 mb-2 w-64 z-50 shadow-medium">
          <CardContent className="p-3">
            <p className="text-xs font-semibold mb-1">Why this Guardian?</p>
            <p className="text-xs text-text-muted mb-2">{explanation}</p>
            {reasons.length > 0 && (
              <ul className="text-xs text-text-muted space-y-1">
                {reasons.slice(0, 3).map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-primary">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-text-muted mt-2 italic">
              Based on availability, experience, and patient feedback.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

