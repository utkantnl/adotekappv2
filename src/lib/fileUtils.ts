export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function resizeImage(
  base64: string,
  maxWidth = 1200,
  maxHeight = 1200
): Promise<string> {
  return new Promise((resolve) => {
    if (base64.includes('image/svg')) {
      resolve(base64);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      if (width <= maxWidth && height <= maxHeight) {
        resolve(base64);
        return;
      }

      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      try {
        resolve(canvas.toDataURL('image/png', 0.9));
      } catch {
        resolve(base64);
      }
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}
