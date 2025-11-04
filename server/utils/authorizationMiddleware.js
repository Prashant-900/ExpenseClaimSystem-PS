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
    // Check if Clerk auth is present
    const { userId } = req.auth;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find or create user in our database
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      const email = req.auth.user?.primaryEmailAddress?.emailAddress;
      
      // Validate email domain
      const isValidDomain = VALID_DOMAINS.some(domain => email?.endsWith(domain));
      if (!isValidDomain) {
        return res.status(403).json({ 
          message: 'Access denied. Please use an IIT Mandi email address (@students.iitmandi.ac.in, @faculty.iitmandi.ac.in, @audit.iitmandi.ac.in, @finance.iitmandi.ac.in, or @admin.iitmandi.ac.in)' 
        });
      }

      const name = req.auth.user?.firstName ? `${req.auth.user?.firstName} ${req.auth.user?.lastName || ''}`.trim() : email;

      // Determine role based on email domain
      let role = 'Employee';
      if (email?.endsWith('@faculty.iitmandi.ac.in')) role = 'Faculty';
      else if (email?.endsWith('@audit.iitmandi.ac.in')) role = 'Audit';
      else if (email?.endsWith('@finance.iitmandi.ac.in')) role = 'Finance';
      else if (email?.endsWith('@admin.iitmandi.ac.in')) role = 'Admin';
      else if (email?.endsWith('@students.iitmandi.ac.in')) role = 'Student';

      user = await User.create({
        clerkId: userId,
        name,
        email,
        role,
        department: '',
        studentId: ''
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