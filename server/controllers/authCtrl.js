import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = async (req, res) => {
  try {
    const { name, email, password, facultyEmail } = req.body;
    
    // Validate email domain
    const validDomains = [
      '@students.iitmandi.ac.in',
      '@faculty.iitmandi.ac.in',
      '@audit.iitmandi.ac.in',
      '@finance.iitmandi.ac.in',
      '@admin.iitmandi.ac.in'
    ];
    
    const isValidDomain = validDomains.some(domain => email.endsWith(domain));
    if (!isValidDomain) {
      return res.status(400).json({ message: 'Invalid email domain. Use IIT Mandi email.' });
    }
    
    // Assign role based on email domain
    let role = 'Student';
    if (email.endsWith('@faculty.iitmandi.ac.in')) role = 'Faculty';
    else if (email.endsWith('@audit.iitmandi.ac.in')) role = 'Audit';
    else if (email.endsWith('@finance.iitmandi.ac.in')) role = 'Finance';
    else if (email.endsWith('@admin.iitmandi.ac.in')) role = 'Admin';
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role, facultyEmail });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email domain
    const validDomains = [
      '@students.iitmandi.ac.in',
      '@faculty.iitmandi.ac.in',
      '@audit.iitmandi.ac.in',
      '@finance.iitmandi.ac.in',
      '@admin.iitmandi.ac.in'
    ];
    
    const isValidDomain = validDomains.some(domain => email.endsWith(domain));
    if (!isValidDomain) {
      return res.status(400).json({ message: 'Invalid email domain. Use IIT Mandi email.' });
    }
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};