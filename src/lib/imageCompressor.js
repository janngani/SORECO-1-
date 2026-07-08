/**
 * Client-side utility to downscale and compress images to prevent "Failed to fetch" errors
 * caused by extremely large base64 payload strings.
 */
export function compressImage(file, maxDimension = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    
    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      // Not an image, fallback to standard FileReader
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions keeping aspect ratio
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(event.target.result); // Fallback to raw if canvas context unavailable
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG format with specified quality
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        } catch (error) {
          console.warn("Canvas compression failed, falling back to original:", error);
          resolve(event.target.result); // Fallback to original
        }
      };
      img.onerror = (err) => {
        console.warn("Image loading failed, falling back to FileReader result:", err);
        resolve(event.target.result);
      };
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
