import User from '../models/User.js';

const getProfileImageUrl = async (userId) => {
  try {
    const { Client } = await import('minio');
    const minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    });
    const objectPath = `profiles/${userId}/profile.jpg`;
    try {
      await minioClient.statObject(process.env.MINIO_BUCKET, objectPath);
      return `http://localhost:5000/api/images/${objectPath}`;
    } catch (error) {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export const getUsersByRole = async (req, res) => {
  try {
    const role = req.query.role;
    if (!role) return res.status(400).json({ message: 'Role query param is required' });

    const users = await User.find({ role }).select('-password');
    for (const user of users) {
      user.profileImage = await getProfileImageUrl(user._id);
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
