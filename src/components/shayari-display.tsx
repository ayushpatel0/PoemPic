
'use client';

import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ShayariDisplayProps {
  imageDataUri: string | null; // Keep for potential future use or context, but not displayed here
  shayariTitle: string | null;
  shayariText: string | null;
  isLoading?: boolean;
  className?: string;
}

export function ShayariDisplay({
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

  // Updated structure: Card focuses only on Shayari text now
  return (
    <Card className={cn('w-full overflow-hidden', className)}>
       <CardHeader className="flex flex-row justify-between items-start p-6 pb-2">
         {isLoading ? (
           <CardTitle className="h-8 w-3/4 bg-muted rounded animate-pulse"></CardTitle>
         ) : shayariTitle ? (
           <CardTitle>{shayariTitle}</CardTitle>
         ) : (
           <CardTitle className="text-muted-foreground">Shayari</CardTitle> // Placeholder title
         )}
         {/* Copy Button */}
         {!isLoading && shayariText && (
            <Button variant="ghost" size="icon" onClick={handleCopy} className="ml-auto flex-shrink-0">
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy Shayari</span>
            </Button>
        )}
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex flex-col h-48"> {/* Set a fixed height or min-height */}
            {isLoading ? (
                 <div className="space-y-2 flex-1 pt-2">
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
                  <p key={index} className="mb-2 last:mb-0 text-foreground font-serif">
                    {line || <>&nbsp;</>} {/* Render non-breaking space for empty lines */}
                  </p>
                ))}
             </ScrollArea>
             ) : (
                <p className="text-muted-foreground pt-2">
                  {shayariTitle === null && !isLoading ? "Generate shayari to see the result here." : "Shayari text will appear here."}
                </p>
             )}
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
