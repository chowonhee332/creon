// @ts-ignore
import ImageTracer from 'imagetracerjs';
import { removeBackground } from '@imgly/background-removal';

export const convertImageToSVG = async (imageDataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // options: 'default', 'posterized1', 'posterized2', 'curvy', 'sharp', 'detailed', 'smoothed', 'grayscale', 'fixedpalette', 'randompalette', 'bw'
      ImageTracer.imageToSVG(
        imageDataUrl,
        (svgString: string) => {
          resolve(svgString);
        },
        'default' // 'default' provides the most standard and balanced tracing result
      );
    } catch (error) {
      reject(error);
    }
  });
};

export const removeBackgroundFromBlob = async (blob: Blob): Promise<Blob> => {
  try {
    const resultBlob = await removeBackground(blob);
    return resultBlob;
  } catch (error) {
    console.error('imgly background removal error:', error);
    throw error;
  }
};

export const blobToBase64DataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  return response.blob();
};

export const normalizeHex = (value: string): string | null => {
  const raw = (value || '').trim().replace(/^#/, '').toUpperCase();
  if (/^[0-9A-F]{3}$/.test(raw)) return `#${raw}`;
  if (/^[0-9A-F]{6}$/.test(raw)) return `#${raw}`;
  return null;
};

