
'use client';

import type * as React from 'react';
import { useState, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (dataUri: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUploader({ onImageUpload, disabled = false, className }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        if (dataUri) {
          onImageUpload(dataUri);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(event.target.files?.[0] ?? null);
  }, [handleFileChange]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    handleFileChange(event.dataTransfer.files?.[0] ?? null);
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
            accept="image/*"
            className="sr-only"
            onChange={handleInputChange}
            disabled={disabled}
          />
        </Label>
      </CardContent>
    </Card>
  );
}
