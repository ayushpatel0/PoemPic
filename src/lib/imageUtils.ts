
'use client'; // Needed for browser APIs like Canvas, Image

/**
 * Overlays text onto an image using the Canvas API.
 * @param imageDataUri The data URI of the base image.
 * @param text The text to overlay.
 * @param options Optional configuration for text styling and positioning.
 * @returns A Promise resolving to the data URI of the combined image (PNG format).
 */
export function overlayTextOnImage(
  imageDataUri: string,
  text: string,
  options?: {
    font?: string;
    fillStyle?: string;
    strokeStyle?: string;
    lineWidth?: number;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
    padding?: number; // Padding from bottom/edges
    lineSpacing?: number; // Additional spacing between lines
    backgroundOpacity?: number; // Opacity for text background rectangle (0 to 1)
    backgroundColor?: string; // Color for text background rectangle
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      // --- Configuration ---
      const padding = options?.padding ?? 30; // Padding from bottom
      const sidePadding = padding * 1.5; // More padding from sides
      const fontBaseSize = Math.max(20, Math.min(img.width / 25, img.height / 20)); // Dynamic font size
      // Use a standard sans-serif font stack as the default now
      const font = options?.font ?? `bold ${fontBaseSize}px Arial, sans-serif`;
      const fillStyle = options?.fillStyle ?? 'white';
      const strokeStyle = options?.strokeStyle ?? 'black';
      // Reduced lineWidth significantly to minimize the shadow/outline effect
      const lineWidth = options?.lineWidth ?? Math.max(0.5, fontBaseSize / 30);
      const textAlign = options?.textAlign ?? 'center';
      const textBaseline = options?.textBaseline ?? 'bottom';
      const lineSpacing = options?.lineSpacing ?? fontBaseSize * 0.3; // Spacing between lines
      // Set background opacity to 0 to remove the background rectangle
      const backgroundOpacity = options?.backgroundOpacity ?? 0;
      const backgroundColor = options?.backgroundColor ?? 'rgba(0, 0, 0)'; // Black background (won't show if opacity is 0)

      // --- Canvas Setup ---
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // --- Text Preparation ---
      ctx.font = font;
      ctx.fillStyle = fillStyle;
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.textAlign = textAlign;
      ctx.textBaseline = textBaseline;

      const lines = text.split('\n');
      const maxWidth = canvas.width - 2 * sidePadding;
      const wrappedLines: string[] = [];

      // Wrap text if lines are too long
       lines.forEach(line => {
            let currentLine = '';
            const words = line.split(' ');
            for (let i = 0; i < words.length; i++) {
                const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && i > 0) {
                    wrappedLines.push(currentLine);
                    currentLine = words[i];
                } else {
                    currentLine = testLine;
                }
            }
            wrappedLines.push(currentLine);
       });

      // --- Calculate Text Block Dimensions ---
      const totalTextHeight = wrappedLines.length * (fontBaseSize + lineSpacing) - lineSpacing;

      // --- Draw Background Rectangle (Will not draw if backgroundOpacity is 0) ---
      if (backgroundOpacity > 0) {
        ctx.globalAlpha = backgroundOpacity;
        ctx.fillStyle = backgroundColor;
        // Calculate background position and size
        const bgPadding = padding * 0.5; // Padding inside the background rectangle
        const bgX = sidePadding - bgPadding;
        const bgY = canvas.height - totalTextHeight - padding - bgPadding;
        const bgWidth = canvas.width - 2 * (sidePadding - bgPadding);
        const bgHeight = totalTextHeight + 2 * bgPadding;
        ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
        ctx.globalAlpha = 1.0; // Reset global alpha
      }

      // --- Draw Text Lines ---
       ctx.fillStyle = fillStyle; // Ensure text fill style is set
       // Only apply stroke if lineWidth is greater than 0
       const drawStroke = lineWidth > 0;
       let currentY = canvas.height - padding - totalTextHeight + fontBaseSize; // Start drawing from bottom up

      wrappedLines.forEach(line => {
        const x = canvas.width / 2; // Center alignment

        // Draw stroke (outline) first if needed
        if (drawStroke) {
            ctx.strokeText(line, x, currentY);
        }
        // Draw filled text on top
        ctx.fillText(line, x, currentY);

        currentY += fontBaseSize + lineSpacing;
      });

      // --- Output ---
      try {
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
      } catch(e) {
          console.error("Error generating data URL:", e);
          reject(new Error("Failed to generate image data URL."));
      }

    };

    img.onerror = (error) => {
      console.error("Image loading error:", error);
      reject(new Error('Failed to load the image for processing'));
    };

    // Validate input data URI basic format
    if (!imageDataUri || !imageDataUri.startsWith('data:image/')) {
       return reject(new Error('Invalid image data URI format provided.'));
    }

    img.src = imageDataUri;
  });
}
