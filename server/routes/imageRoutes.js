import express from 'express';
import { s3Client } from '../config/s3.js';

const router = express.Router();

router.get('/*', async (req, res) => {
  try {
    const fileName = req.params[0];
    console.log('Fetching image:', fileName);
    
    if (!s3Client) {
      return res.status(503).json({ message: 'Image service unavailable' });
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName
    };

    console.log('S3 Params:', params);

    // Get object from S3
    const data = await s3Client.getObject(params).promise();

    // Set appropriate headers
    res.setHeader('Content-Type', data.ContentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Send the image body
    res.send(data.Body);
  } catch (error) {
    console.error('Image serving error:', error.message, error.code);
    res.status(404).json({ message: 'Image not found', error: error.message });
  }
});

export default router;