import User from '../models/User.js';

// Valid email domains for IIT Mandi
const VALID_DOMAINS = [
  '@students.iitmandi.ac.in',
  '@faculty.iitmandi.ac.in',
  '@audit.iitmandi.ac.in',
  '@finance.iitmandi.ac.in',
  '@admin.iitmandi.ac.in'
];

// Custom middleware wrapper to handle Clerk auth + user lookup
export const authenticate = async (req, res, next) => {
  try {
    // Get auth from Clerk - handle both old and new patterns
    const auth = req.auth;
    if (!auth) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = auth.userId || auth.sub;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required - invalid token' });
    }

    // Find or create user in our database
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      // Get email from auth object - handle different Clerk versions
      const email = auth.sessionClaims?.email ||
                    auth.user?.primaryEmailAddress?.emailAddress || 
                    auth.email ||
                    auth.emailAddress ||
                    req.headers['x-clerk-email'];
      
      if (!email) {
        console.error('❌ Unable to extract email from Clerk auth object');
        return res.status(401).json({ message: 'Unable to retrieve user email from authentication' });
      }
      
      console.log('🔍 User not found in MongoDB, creating new user for email:', email);
      
      // Allow all emails - no domain validation required
      // Determine role based on email domain (IIT emails get specific roles, others default to Faculty)
      
      const name = auth.sessionClaims?.firstName ? 
                   `${auth.sessionClaims.firstName} ${auth.sessionClaims.lastName || ''}`.trim() :
                   auth.user?.firstName ? 
                   `${auth.user.firstName} ${auth.user.lastName || ''}`.trim() : 
                   email;

      // Determine role based on email domain
      let role = 'Faculty'; // Default for all non-IIT emails
      if (email?.endsWith('@faculty.iitmandi.ac.in')) role = 'Faculty';
      else if (email?.endsWith('@audit.iitmandi.ac.in')) role = 'Audit';
      else if (email?.endsWith('@finance.iitmandi.ac.in')) role = 'Finance';
      else if (email?.endsWith('@admin.iitmandi.ac.in')) role = 'Admin';
      else if (email?.endsWith('@students.iitmandi.ac.in')) role = 'Student';

      const userData = {
        clerkId: userId,
        name,
        email,
        role,
        department: ''
      };

      // Only add studentId for Student role
      if (role === 'Student') {
        userData.studentId = email.split('@')[0];
      }

      user = await User.create(userData);
      
      console.log('✅ Auto-created user in MongoDB:', {
        _id: user._id,
        email: user.email,
        clerkId: user.clerkId,
        role: user.role
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};