import User from '../models/User.js';

const getProfileImageUrl = (userId) => {
  // Return direct public S3 URL (bucket is public)
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/profiles/${userId}/profile.jpg`;
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
