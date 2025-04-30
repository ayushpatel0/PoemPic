
'use client';

import type * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { ImageUploader } from '@/components/image-uploader';
import { ShayariDisplay } from '@/components/shayari-display';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Loader2, AlertCircle, Download, Combine } from 'lucide-react';
import { generatePoemFromImage, type GenerateShayariFromImageOutput } from '@/ai/flows/generate-poem-from-image';
import { overlayTextOnImage } from '@/lib/imageUtils';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';


// Define Shayari Types
const shayariTypes = [
  { id: 'romantic', label: 'Romantic' },
  { id: 'sad', label: 'Sad' },
  { id: 'motivational', label: 'Motivational' },
  { id: 'funny', label: 'Funny' },
  { id: 'philosophical', label: 'Philosophical' },
  { id: 'general', label: 'General Mood' }, // Default/fallback
] as const; // Use 'as const' for stricter typing

type ShayariTypeId = typeof shayariTypes[number]['id'];


export default function Home() {
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [shayariResult, setShayariResult] = useState<GenerateShayariFromImageOutput | null>(null);
  const [combinedImageDataUri, setCombinedImageDataUri] = useState<string | null>(null); // State for the combined image
  const [isLoading, setIsLoading] = useState(false);
  const [isCombining, setIsCombining] = useState(false); // State for combining process
  const [error, setError] = useState<string | null>(null);
  const [selectedShayariType, setSelectedShayariType] = useState<ShayariTypeId>('general'); // Default type
  const combinedImageRef = useRef<HTMLAnchorElement>(null); // Ref for download link
  const { toast } = useToast();

  const handleImageUpload = useCallback((dataUri: string) => {
    setImageDataUri(dataUri);
    setShayariResult(null); // Reset shayari when new image is uploaded
    setCombinedImageDataUri(null); // Reset combined image
    setError(null); // Reset error
    setSelectedShayariType('general'); // Reset type selector
  }, []);

  const handleGenerateShayari = async () => {
    if (!imageDataUri) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setShayariResult(null); // Clear previous shayari
    setCombinedImageDataUri(null); // Clear previous combined image

    try {
      const result = await generatePoemFromImage({
          photoDataUri: imageDataUri,
          shayariType: selectedShayariType // Pass the selected type
        });
      setShayariResult(result);
    } catch (err) {
      console.error("Error generating shayari:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while generating the shayari.";
       if (errorMessage.includes('application/octet-stream')) {
            setError("The uploaded image format might not be fully supported. Please try a standard format like JPG or PNG.");
       } else if (errorMessage.includes('400 Bad Request') || errorMessage.includes('model reference/gemini')) {
             setError("Could not generate shayari. The AI model might be unavailable or the image content could not be processed. Please try again later or with a different image.");
       } else if (errorMessage.includes('503 Service Unavailable')) {
           setError("The AI service is currently overloaded. Please wait a moment and try again.");
       }
        else {
           setError(`An unexpected error occurred: ${errorMessage}`);
       }
      setShayariResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddShayariToImage = async () => {
     if (!imageDataUri || !shayariResult?.shayari) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Cannot add shayari to image. Ensure image is uploaded and shayari is generated.",
        });
        return;
    }
    setIsCombining(true);
    setError(null); // Clear previous errors
    try {
        const combinedImage = await overlayTextOnImage(imageDataUri, shayariResult.shayari);
        setCombinedImageDataUri(combinedImage);
        toast({
            title: "Success!",
            description: "Shayari added to the image. You can now download it.",
        });
    } catch (err) {
        console.error("Error combining image and text:", err);
        setError("Failed to add shayari to the image. Please try again.");
         toast({
            variant: "destructive",
            title: "Combining Error",
            description: "Could not overlay the shayari onto the image.",
        });
    } finally {
        setIsCombining(false);
    }
  };

  const handleDownload = () => {
      if (combinedImageRef.current && combinedImageDataUri) {
          combinedImageRef.current.href = combinedImageDataUri;
          // Suggest a filename (e.g., based on shayari title or timestamp)
          const safeTitle = shayariResult?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'poem_pic';
          combinedImageRef.current.download = `${safeTitle}_${Date.now()}.png`;
          combinedImageRef.current.click();
      } else {
           toast({
                variant: "destructive",
                title: "Download Error",
                description: "Could not prepare the image for download.",
            });
      }
  };

 const handleReset = useCallback(() => {
      setImageDataUri(null);
      setShayariResult(null);
      setCombinedImageDataUri(null);
      setError(null);
      setIsLoading(false);
      setIsCombining(false);
      setSelectedShayariType('general');
       // Optionally clear file input if needed
      const inputElement = document.getElementById('image-upload') as HTMLInputElement;
      if (inputElement) {
          inputElement.value = '';
      }
  }, []);


  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-2">PoemPic</h1>
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

        {/* Uploader */}
        {!imageDataUri && !combinedImageDataUri && (
             <ImageUploader
               onImageUpload={handleImageUpload}
               disabled={isLoading || isCombining}
               className="w-full md:w-3/4 lg:w-1/2"
             />
         )}

         {/* Image Uploaded State */}
         {imageDataUri && !shayariResult && !combinedImageDataUri && (
             <div className="w-full flex flex-col items-center space-y-6 animate-fade-in">
                 {/* Display Uploaded Image */}
                 <Card className="w-full max-w-md overflow-hidden shadow-md">
                    <CardContent className="p-0">
                        <div className="relative w-full aspect-square">
                             <Image
                                src={imageDataUri}
                                alt="Uploaded image"
                                layout="fill"
                                objectFit="contain"
                                className="rounded-md"
                            />
                        </div>
                    </CardContent>
                 </Card>

                  {/* Shayari Type Selection */}
                  <Card className="w-full max-w-md">
                     <CardContent className="p-4 space-y-3">
                        <Label className="text-base font-medium">Choose Shayari Type:</Label>
                         <RadioGroup
                             value={selectedShayariType}
                             onValueChange={(value: string) => setSelectedShayariType(value as ShayariTypeId)}
                             className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                             disabled={isLoading}
                         >
                            {shayariTypes.map((type) => (
                                <div key={type.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={type.id} id={`type-${type.id}`} />
                                <Label htmlFor={`type-${type.id}`} className="cursor-pointer hover:text-primary">
                                    {type.label}
                                </Label>
                                </div>
                            ))}
                        </RadioGroup>
                     </CardContent>
                  </Card>

                  {/* Generate Button */}
                 <Button
                     onClick={handleGenerateShayari}
                     disabled={isLoading || isCombining || !imageDataUri}
                     size="lg"
                 >
                     {isLoading ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                     </>
                     ) : (
                     'Generate Shayari'
                     )}
                 </Button>
             </div>
         )}


         {/* Display Area: Shows generated shayari next to the image */}
         {imageDataUri && shayariResult && !combinedImageDataUri && (
            <div className="w-full animate-fade-in">
                 <ShayariDisplay
                    imageDataUri={imageDataUri}
                    shayariTitle={shayariResult?.title ?? null}
                    shayariText={shayariResult?.shayari ?? null}
                    isLoading={isLoading} // Pass loading state if needed for skeleton inside display
                    className="w-full mb-6"
                />

                 {/* Action Buttons Below Display */}
                 <div className="flex flex-wrap justify-center gap-4 mt-4 w-full">
                     {/* Combine Button */}
                    <Button
                        onClick={handleAddShayariToImage}
                        disabled={isCombining || isLoading || !shayariResult?.shayari}
                        variant="secondary"
                        className="flex-grow md:flex-grow-0"
                    >
                        {isCombining ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Combining...
                        </>
                        ) : (
                         <>
                            <Combine className="mr-2 h-4 w-4" />
                            Add Shayari to Image
                         </>
                        )}
                    </Button>
                 </div>
            </div>
         )}


        {/* Combined Image Display and Download */}
        {combinedImageDataUri && (
          <Card className="w-full mt-8 animate-fade-in">
            <CardContent className="p-6 flex flex-col items-center space-y-4">
              <h2 className="text-2xl font-semibold text-center">Your PoemPic is Ready!</h2>
              <div className="relative w-full max-w-md aspect-square border rounded-md overflow-hidden shadow-md">
                 <Image
                    src={combinedImageDataUri}
                    alt="Image with overlayed shayari"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-md"
                 />
              </div>
              <Button onClick={handleDownload} disabled={isCombining} className="w-full md:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Download Image
              </Button>
              {/* Hidden link for triggering download */}
              <a ref={combinedImageRef} style={{ display: 'none' }} download></a>
            </CardContent>
          </Card>
        )}

         {/* Button to upload a new image if one is already processed */}
         {(imageDataUri || combinedImageDataUri) && (
             <Button
                 variant="outline"
                 onClick={handleReset}
                 disabled={isLoading || isCombining}
                 className="mt-6" // Add margin top
             >
                 Upload New Image
             </Button>
         )}

      </div>

       <footer className="mt-auto pt-8 text-center text-sm text-muted-foreground">
           Powered by AI
        </footer>
    </main>
  );
}

// Keep fade-in animation styles (assuming they are injected globally or needed here)
const style = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}
`;
// Inject styles if needed (consider moving to globals.css or layout if used widely)
if (typeof window !== 'undefined') {
  const styleId = 'page-fade-in-style';
  if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement("style");
      styleSheet.id = styleId;
      styleSheet.innerText = style;
      document.head.appendChild(styleSheet);
  }
}
