
'use client';

import type * as React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const shayariLines = shayariText?.split('\n') ?? [];

  const handleCopy = async () => {
    if (!shayariText) return;
    try {
      await navigator.clipboard.writeText(shayariText);
      toast({
        title: 'Copied!',
        description: 'Shayari copied to clipboard.',
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy shayari.',
      });
    }
  };

  // Restore layout with Image and Shayari side-by-side on medium screens and up
  return (
    <Card className={cn('w-full overflow-hidden shadow-lg', className)}>
      <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
        {/* Image Column */}
        <div className="relative w-full aspect-square rounded-md overflow-hidden border">
          {imageDataUri ? (
            <Image
              src={imageDataUri}
              alt="Uploaded image for shayari generation"
              layout="fill"
              objectFit="contain" // Changed to contain to prevent cropping
              className="rounded-md"
            />
          ) : (
             <Skeleton className="h-full w-full" /> // Placeholder if somehow image is missing
          )}
        </div>

        {/* Shayari Column */}
        <div className="flex flex-col h-full">
          <CardHeader className="flex flex-row justify-between items-start p-0 pb-2">
             {isLoading ? (
                 <Skeleton className="h-7 w-3/4 rounded" /> // Skeleton for title
             ) : shayariTitle ? (
                <CardTitle className="text-xl md:text-2xl">{shayariTitle}</CardTitle>
             ) : (
                <CardTitle className="text-xl md:text-2xl text-muted-foreground italic">Shayari</CardTitle> // Placeholder title
             )}
             {/* Copy Button */}
             {!isLoading && shayariText && (
                <Button variant="ghost" size="icon" onClick={handleCopy} className="ml-auto flex-shrink-0 -mt-1 -mr-1">
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy Shayari</span>
                </Button>
             )}
          </CardHeader>

          {/* Shayari Text Area */}
          {/* Use a div instead of CardContent here as CardContent adds padding */}
          <div className="flex-grow min-h-[150px] md:min-h-[200px] relative">
            {isLoading ? (
                 <div className="space-y-2 pt-2">
                    {/* Simulate up to 6 lines for loading state */}
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-5/6 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-4/6 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-3/6 rounded" />
                 </div>
             ) : shayariText ? (
                // Use default font (Inter)
                 <ScrollArea className="h-full pr-4 text-lg">
                     {shayariLines.map((line, index) => (
                         <p key={index} className="mb-2 last:mb-0 text-foreground">
                             {line || <>&nbsp;</>} {/* Render non-breaking space for empty lines */}
                         </p>
                     ))}
                 </ScrollArea>
             ) : (
                <p className="text-muted-foreground pt-2 text-center absolute inset-0 flex items-center justify-center">
                  {shayariTitle === null && !isLoading ? "Click 'Generate Shayari' to see the result." : "Shayari will appear here..."}
                </p>
             )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple fade-in animation (can be kept or removed if handled globally)
const style = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
`;
if (typeof window !== 'undefined') {
  const styleId = 'shayari-display-style';
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement("style");
    styleSheet.id = styleId;
    styleSheet.innerText = style;
    document.head.appendChild(styleSheet);
  }
}
