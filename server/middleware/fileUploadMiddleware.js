import multer from 'multer';
import minioClient from '../config/minio.js';

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

export const uploadToMinio = async (file, userId, type = 'general') => {
  try {
    let fileName;
    
    if (type === 'profile') {
      fileName = `profiles/${userId}/profile.jpg`;
    } else if (type === 'expense') {
      fileName = `expenses/${userId}/${Date.now()}-${file.originalname}`;
    } else {
      fileName = `users/${userId}/${Date.now()}-${file.originalname}`;
    }
    
    console.log('Uploading to MinIO:', fileName);
    
    await minioClient.putObject(
      process.env.MINIO_BUCKET,
      fileName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype }
    );
    
    console.log('Upload successful:', fileName);
    return fileName;
  } catch (error) {
    console.error('MinIO upload error:', error);
    throw error;
  }
};

export default upload;