
'use client';

import type * as React from 'react';
import { useState, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface ImageUploaderProps {
  onImageUpload: (dataUri: string) => void;
  disabled?: boolean;
  className?: string;
}

// Define supported MIME types
const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ImageUploader({ onImageUpload, disabled = false, className }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast(); // Get toast function

  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      // Validate MIME type
      if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
        toast({
          variant: 'destructive',
          title: 'Unsupported File Type',
          description: `Please upload a supported image type: ${SUPPORTED_MIME_TYPES.map(t => t.split('/')[1]).join(', ')}.`,
        });
        // Clear the input value if selected via click
        const inputElement = document.getElementById('image-upload') as HTMLInputElement;
        if (inputElement) {
            inputElement.value = '';
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        if (dataUri) {
          // Ensure the data URI starts with a supported type (redundant check, but safe)
          if (SUPPORTED_MIME_TYPES.some(type => dataUri.startsWith(`data:${type};base64,`))) {
            onImageUpload(dataUri);
          } else {
             // This case should theoretically not happen due to the initial check, but handles edge cases
             console.error("Generated Data URI has unexpected format or type:", dataUri.substring(0, 50) + "...");
             toast({
                 variant: 'destructive',
                 title: 'Processing Error',
                 description: 'Could not process the image format correctly.',
             });
             // Clear the input value
            const inputElement = document.getElementById('image-upload') as HTMLInputElement;
            if (inputElement) {
                inputElement.value = '';
            }
          }
        }
      };
       reader.onerror = (error) => {
            console.error("Error reading file:", error);
            toast({
                variant: 'destructive',
                title: 'File Read Error',
                description: 'Could not read the selected file.',
            });
             // Clear the input value
            const inputElement = document.getElementById('image-upload') as HTMLInputElement;
            if (inputElement) {
                inputElement.value = '';
            }
       }
      reader.readAsDataURL(file);
    }
  }, [onImageUpload, toast]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(event.target.files?.[0] ?? null);
  }, [handleFileChange]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    handleFileChange(event.dataTransfer.files?.[0] ?? null);
     // Clear the input value in case drop happens over the input area
    const inputElement = document.getElementById('image-upload') as HTMLInputElement;
    if (inputElement) {
        inputElement.value = '';
    }
  }, [handleFileChange, disabled]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <Card className={cn('border-2 border-dashed', isDragging ? 'border-primary' : 'border-border', className)}>
      <CardContent className="p-6">
        <Label
          htmlFor="image-upload"
          className={cn(
            'flex flex-col items-center justify-center space-y-4 cursor-pointer',
            disabled ? 'cursor-not-allowed opacity-50' : ''
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <UploadCloud className="h-12 w-12 text-muted-foreground" />
          <span className="text-center text-muted-foreground">
            Drag & drop an image here, or click to select a file
          </span>
          <Input
            id="image-upload"
            type="file"
            // Update accept attribute to reflect supported types
            accept={SUPPORTED_MIME_TYPES.join(',')}
            className="sr-only"
            onChange={handleInputChange}
            disabled={disabled}
          />
        </Label>
      </CardContent>
    </Card>
  );
}
