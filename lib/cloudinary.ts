import { v2 as cloudinary } from 'cloudinary';

// Validate Cloudinary configuration
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Check for placeholder values
const placeholderValues = ['your-api-key', 'your-cloud-name', 'your-api-secret', 'your-secret-key-here'];
const hasPlaceholder = 
  placeholderValues.includes(cloudName || '') ||
  placeholderValues.includes(apiKey || '') ||
  placeholderValues.includes(apiSecret || '');

if (hasPlaceholder) {
  console.error('Cloudinary configuration contains placeholder values. Please set actual credentials in .env.local');
}

if (!cloudName || !apiKey || !apiSecret || hasPlaceholder) {
  console.warn('Cloudinary configuration is incomplete or contains placeholders. Photo uploads will fail.');
}

cloudinary.config({
  cloud_name: cloudName || '',
  api_key: apiKey || '',
  api_secret: apiSecret || '',
});

export async function uploadToCloudinary(file: File | Blob): Promise<string> {
  // Validate configuration
  const placeholderValues = ['your-api-key', 'your-cloud-name', 'your-api-secret', 'your-secret-key-here'];
  const hasPlaceholder = 
    placeholderValues.includes(cloudName || '') ||
    placeholderValues.includes(apiKey || '') ||
    placeholderValues.includes(apiSecret || '');

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary is not configured. Please set CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your .env.local file.'
    );
  }

  if (hasPlaceholder) {
    throw new Error(
      'Cloudinary configuration contains placeholder values. Please replace "your-api-key", "your-cloud-name", and "your-api-secret" with your actual Cloudinary credentials in .env.local. Get your credentials from https://cloudinary.com/console'
    );
  }

  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }

  // Check file type
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder: 'careconnect',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' },
            ],
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              
              // Provide more helpful error messages for common issues
              let errorMessage = error.message || 'Failed to upload image to Cloudinary';
              
              if (error.message?.includes('Invalid api_key') || error.message?.includes('api_key')) {
                errorMessage = 'Invalid Cloudinary API key. Please check your CLOUDINARY_API_KEY in .env.local. Get your credentials from https://cloudinary.com/console';
              } else if (error.message?.includes('Invalid api_secret') || error.message?.includes('api_secret')) {
                errorMessage = 'Invalid Cloudinary API secret. Please check your CLOUDINARY_API_SECRET in .env.local. Get your credentials from https://cloudinary.com/console';
              } else if (error.message?.includes('cloud_name')) {
                errorMessage = 'Invalid Cloudinary cloud name. Please check your NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local. Get your credentials from https://cloudinary.com/console';
              } else if (error.message?.includes('Unauthorized')) {
                errorMessage = 'Cloudinary authentication failed. Please verify your API key, API secret, and cloud name in .env.local';
              }
              
              reject(new Error(errorMessage));
            } else if (result?.secure_url) {
              resolve(result.secure_url);
            } else {
              reject(new Error('Upload succeeded but no URL returned from Cloudinary'));
            }
          }
        )
        .end(buffer);
    });
  } catch (error: any) {
    console.error('File processing error:', error);
    throw new Error(error.message || 'Failed to process file');
  }
}

export default cloudinary;

