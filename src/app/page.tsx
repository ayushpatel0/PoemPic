
'use client';

import type * as React from 'react';
import { useState } from 'react';
import { ImageUploader } from '@/components/image-uploader';
import { ShayariDisplay } from '@/components/shayari-display'; // Updated import
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from 'lucide-react';
// Import the updated flow function and output type
import { generatePoemFromImage, type GenerateShayariFromImageOutput } from '@/ai/flows/generate-poem-from-image';

export default function Home() {
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  // Renamed state variable and updated type
  const [shayariResult, setShayariResult] = useState<GenerateShayariFromImageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (dataUri: string) => {
    setImageDataUri(dataUri);
    setShayariResult(null); // Reset shayari when new image is uploaded
    setError(null); // Reset error
  };

  const handleGenerateShayari = async () => { // Renamed handler function
    if (!imageDataUri) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setShayariResult(null); // Clear previous shayari immediately

    try {
      // Call the flow function (keeping original name for now)
      const result = await generatePoemFromImage({ photoDataUri: imageDataUri });
      setShayariResult(result);
    } catch (err) {
      console.error("Error generating shayari:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while generating the shayari.";
      // Check for specific API error message
       if (errorMessage.includes('application/octet-stream')) {
            setError("The uploaded image format might not be fully supported. Please try a standard format like JPG or PNG.");
       } else {
           setError(errorMessage);
       }
      setShayariResult(null); // Ensure shayari is cleared on error
      setImageDataUri(null); // Reset image data URI on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-2">PoemPic</h1>
        {/* Updated description */}
        <p className="text-lg text-muted-foreground">Generate beautiful Hindi shayari inspired by your photos.</p>
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
            onClick={handleGenerateShayari} // Updated onClick handler
            disabled={isLoading || !imageDataUri}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Shayari...
              </>
            ) : (
              'Generate Shayari' // Updated button text
            )}
          </Button>
        )}

        {/* Use the ShayariDisplay component and pass relevant props */}
        <ShayariDisplay
          imageDataUri={imageDataUri}
          shayariTitle={shayariResult?.title ?? null}
          shayariText={shayariResult?.shayari ?? null} // Pass shayari text
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
