import multer from 'multer';
import { s3Client, s3Available } from '../config/s3.js';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

export const uploadToS3 = async (file, userId, type = 'general') => {
  try {
    if (!s3Available || !s3Client) {
      console.warn('AWS S3 not available - skipping upload');
      return null; // caller should handle null (no image)
    }

    let key;
    if (type === 'profile') {
      key = `profiles/${userId}/profile.jpg`;
    } else if (type === 'expense') {
      key = `expenses/${userId}/${Date.now()}-${file.originalname}`;
    } else {
      key = `receipts/${userId}/${Date.now()}-${file.originalname}`;
    }

    console.log('Uploading to AWS S3:', key);
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    await s3Client.upload(params).promise();

    console.log('Upload successful:', key);
    
    // Return the S3 object key
    return key;
  } catch (error) {
    console.error('AWS S3 upload error:', error);
    throw error;
  }
};

export default upload;
