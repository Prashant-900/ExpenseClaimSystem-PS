import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

let s3Client = null;
let s3Available = false;

try {
  s3Client = new AWS.S3({
    region: process.env.AWS_REGION || 'ap-south-1'
  });

  // Verify S3 credentials by listing buckets
  const initializeS3 = async () => {
    try {
      await s3Client.listBuckets().promise();
      s3Available = true;
      console.log('✓ AWS S3 connection successful');
    } catch (error) {
      console.warn('AWS S3 not available, continuing without cloud storage:', error.message || error);
      s3Available = false;
    }
  };

  initializeS3();
} catch (e) {
  console.warn('Failed to initialize AWS S3 client - continuing without S3:', e.message || e);
  s3Client = null;
  s3Available = false;
}

export { s3Client, s3Available };
