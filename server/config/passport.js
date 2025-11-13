import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    
    // Validate IIT Mandi email domain
    const validDomains = [
      '@students.iitmandi.ac.in',
      '@faculty.iitmandi.ac.in',
      '@audit.iitmandi.ac.in',
      '@finance.iitmandi.ac.in',
      '@admin.iitmandi.ac.in'
    ];
    
    const isValidDomain = validDomains.some(domain => email.endsWith(domain));
    if (!isValidDomain) {
      return done(new Error('Please use your IIT Mandi email address'), null);
    }
    
    // Determine role based on email domain
    let role = 'Student';
    let studentId = null;
    if (email.endsWith('@faculty.iitmandi.ac.in')) role = 'Faculty';
    else if (email.endsWith('@audit.iitmandi.ac.in')) role = 'Audit';
    else if (email.endsWith('@finance.iitmandi.ac.in')) role = 'Finance';
    else if (email.endsWith('@admin.iitmandi.ac.in')) role = 'Admin';
    else if (email.endsWith('@students.iitmandi.ac.in')) {
      studentId = email.split('@')[0]; // Extract roll number
    }
    
    let user = await User.findOne({ email });
    
    if (user) {
      // Mark email as verified for Google OAuth users
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
      return done(null, user);
    }
    
    // Create new user with verified email
    const userData = {
      name: profile.displayName,
      email,
      password: process.env.DEFAULT_OAUTH_PASSWORD || require('crypto').randomBytes(32).toString('hex'),
      role,
      emailVerified: true // Auto-verify Google OAuth users
    };
    
    if (studentId) {
      userData.studentId = studentId;
    }
    
    user = await User.create(userData);
    
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;