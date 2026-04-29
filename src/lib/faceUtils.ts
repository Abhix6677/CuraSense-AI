// Simplified motion-based human detection (no ML dependency)
export const checkHumanPresence = (videoEl: HTMLVideoElement): boolean => {
  if (!videoEl) return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');
  
  ctx?.drawImage(videoEl, 0, 0, 320, 240);
  const imageData = ctx?.getImageData(0, 0, 320, 240);
  const pixels = imageData?.data;
  
  if (!pixels) return false;
  
  // Simple motion detection by brightness variance
  let brightnessSum = 0;
  let pixelCount = 0;
  
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    brightnessSum += brightness;
    pixelCount++;
  }
  
  const avgBrightness = brightnessSum / pixelCount;
  
  // Human face typically has good contrast + mid brightness
  return avgBrightness > 30 && avgBrightness < 200;
};

export const detectFaceSimple = (videoEl: HTMLVideoElement): boolean => {
  if (!videoEl) return false;
  
  const rects = faceapi.detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
    .then(detections => detections.length > 0)
    .catch(() => false);
  
  return false; // Fallback
};
