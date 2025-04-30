
'use client';

import type * as React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface PoemDisplayProps {
  imageDataUri: string | null;
  poemTitle: string | null;
  poemText: string | null;
  isLoading?: boolean;
  className?: string;
}

export function PoemDisplay({
  imageDataUri,
  poemTitle,
  poemText,
  isLoading = false,
  className,
}: PoemDisplayProps) {
  const poemLines = poemText?.split('\n') ?? [];

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
             ) : poemTitle ? (
               <CardTitle>{poemTitle}</CardTitle>
             ) : (
               <CardTitle className="text-muted-foreground">Poem will appear here</CardTitle>
             )}
          </CardHeader>
            {isLoading ? (
                 <div className="space-y-2 flex-1">
                    <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-4/6 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                 </div>
             ) : poemText ? (
             <ScrollArea className="flex-1 pr-4">
                {poemLines.map((line, index) => (
                  <p key={index} className="mb-2 last:mb-0 text-foreground">
                    {line || <>&nbsp;</>} {/* Render non-breaking space for empty lines */}
                  </p>
                ))}
             </ScrollArea>
             ) : !isLoading && (
                <p className="text-muted-foreground">Upload an image to generate a poem.</p>
             )}

        </div>
      </CardContent>
    </Card>
  );
}

// Add simple fade-in animation
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
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = style;
  document.head.appendChild(styleSheet);
}
