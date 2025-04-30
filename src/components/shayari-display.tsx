
'use client';

import type * as React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ShayariDisplayProps {
  imageDataUri: string | null;
  shayariTitle: string | null;
  shayariText: string | null;
  isLoading?: boolean;
  className?: string;
}

export function ShayariDisplay({
  imageDataUri,
  shayariTitle,
  shayariText,
  isLoading = false,
  className,
}: ShayariDisplayProps) {
  const shayariLines = shayariText?.split('\n') ?? [];

  return (
    <Card className={cn('w-full overflow-hidden', className)}>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="relative aspect-square w-full max-w-md mx-auto animate-fade-in">
          {imageDataUri ? (
            <Image
              src={imageDataUri}
              alt="Uploaded image"
              layout="fill"
              objectFit="contain"
              className="rounded-md"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted rounded-md">
              <span className="text-muted-foreground">Image will appear here</span>
            </div>
          )}
        </div>

        <div className="flex flex-col animate-fade-in animation-delay-200">
          <CardHeader className="p-0 pb-4">
            {isLoading ? (
               <CardTitle className="h-8 w-3/4 bg-muted rounded animate-pulse"></CardTitle>
             ) : shayariTitle ? (
               <CardTitle>{shayariTitle}</CardTitle>
             ) : (
               <CardTitle className="text-muted-foreground">Shayari will appear here</CardTitle>
             )}
          </CardHeader>
            {isLoading ? (
                 <div className="space-y-2 flex-1">
                    {/* Simulate up to 6 lines for loading state */}
                    <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-4/6 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-3/6 bg-muted rounded animate-pulse"></div>
                 </div>
             ) : shayariText ? (
             <ScrollArea className="flex-1 pr-4">
                {shayariLines.map((line, index) => (
                  <p key={index} className="mb-2 last:mb-0 text-foreground font-serif"> {/* Added font-serif for potentially better Hindi rendering */}
                    {line || <>&nbsp;</>} {/* Render non-breaking space for empty lines */}
                  </p>
                ))}
             </ScrollArea>
             ) : !isLoading && (
                <p className="text-muted-foreground">Upload an image to generate a shayari.</p>
             )}

        </div>
      </CardContent>
    </Card>
  );
}

// Add simple fade-in animation (keep existing style injection)
const style = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
.animation-delay-200 {
  animation-delay: 0.2s;
}
`;

// Inject styles into the head
if (typeof window !== 'undefined') {
  // Ensure style is injected only once or manage updates if needed
  const existingStyleSheet = document.getElementById("shayari-display-style");
  if (!existingStyleSheet) {
      const styleSheet = document.createElement("style");
      styleSheet.id = "shayari-display-style";
      styleSheet.type = "text/css";
      styleSheet.innerText = style;
      document.head.appendChild(styleSheet);
  }
}
