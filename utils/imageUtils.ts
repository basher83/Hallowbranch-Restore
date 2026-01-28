const THUMBNAIL_SIZE = 150;

export const generateThumbnail = (
  imageUrl: string,
  maxSize: number = THUMBNAIL_SIZE,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate scaled dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      // Use lower quality JPEG for thumbnails to save even more space
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail generation'));
    };

    img.src = imageUrl;
  });
};
