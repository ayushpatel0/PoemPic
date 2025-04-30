
'use client';

import type * as React from 'react';
import { useState } from 'react';
import { ImageUploader } from '@/components/image-uploader';
import { PoemDisplay } from '@/components/poem-display';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from 'lucide-react';
import { generatePoemFromImage, type GeneratePoemFromImageOutput } from '@/ai/flows/generate-poem-from-image';

export default function Home() {
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [poemResult, setPoemResult] = useState<GeneratePoemFromImageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (dataUri: string) => {
    setImageDataUri(dataUri);
    setPoemResult(null); // Reset poem when new image is uploaded
    setError(null); // Reset error
  };

  const handleGeneratePoem = async () => {
    if (!imageDataUri) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPoemResult(null); // Clear previous poem immediately

    try {
      const result = await generatePoemFromImage({ photoDataUri: imageDataUri });
      setPoemResult(result);
    } catch (err) {
      console.error("Error generating poem:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred while generating the poem.");
      setPoemResult(null); // Ensure poem is cleared on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-2">PoemPic</h1>
        <p className="text-lg text-muted-foreground">Generate beautiful poems inspired by your photos.</p>
      </header>

      <div className="w-full max-w-4xl flex flex-col items-center space-y-8">
        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <ImageUploader
          onImageUpload={handleImageUpload}
          disabled={isLoading}
          className="w-full md:w-3/4 lg:w-1/2"
        />

        {imageDataUri && (
          <Button
            onClick={handleGeneratePoem}
            disabled={isLoading || !imageDataUri}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Poem...
              </>
            ) : (
              'Generate Poem'
            )}
          </Button>
        )}

        <PoemDisplay
          imageDataUri={imageDataUri}
          poemTitle={poemResult?.title ?? null}
          poemText={poemResult?.poem ?? null}
          isLoading={isLoading}
          className="w-full"
        />
      </div>

       <footer className="mt-auto pt-8 text-center text-sm text-muted-foreground">
           Powered by AI
        </footer>
    </main>
  );
}
