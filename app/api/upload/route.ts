import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/rbac';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Additional validation
    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.' 
      }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size exceeds 10MB limit. Please upload a smaller image.' 
      }, { status: 400 });
    }

    const url = await uploadToCloudinary(file);

    if (!url) {
      return NextResponse.json({ error: 'Upload failed - no URL returned' }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Upload error:', error);
    const errorMessage = error.message || 'Upload failed. Please try again.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

