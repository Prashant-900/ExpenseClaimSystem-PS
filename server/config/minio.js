import { Client } from 'minio';
import dotenv from 'dotenv';

dotenv.config();

let minioClient = null;
let minioAvailable = false;

try {
  minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
  });

  // Create bucket if it doesn't exist (do not throw on failure)
  const initializeBucket = async () => {
    try {
      const exists = await minioClient.bucketExists(process.env.MINIO_BUCKET);
      if (!exists) {
        await minioClient.makeBucket(process.env.MINIO_BUCKET);
        console.log(`Bucket ${process.env.MINIO_BUCKET} created successfully`);
      }
      minioAvailable = true;
    } catch (error) {
      console.warn('MinIO not available, continuing without object storage:', error.message || error);
      minioAvailable = false;
    }
  };

  initializeBucket();
} catch (e) {
  console.warn('Failed to initialize MinIO client - continuing without MinIO:', e.message || e);
  minioClient = null;
  minioAvailable = false;
}

export { minioClient, minioAvailable };