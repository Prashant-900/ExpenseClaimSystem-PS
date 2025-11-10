import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignIn, useClerk } from '@clerk/clerk-react';
import OTPVerification from './OTPVerification';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState('');
  const navigate = useNavigate();
  const { signIn } = useSignIn();
  const { setActive } = useClerk();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login for:', formData.email);
      
      // Allow all emails - no domain validation required
      
      // Attempt sign-in with password
      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      console.log('Sign in result status:', result.status);

      // If password authentication was successful but needs verification
      if (result.status === 'needs_first_factor') {
        console.log('Needs first factor verification');
        // Prepare email verification
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
        });
        setVerifyingEmail(formData.email);
        setShowOTP(true);
      } else if (result.status === 'complete') {
        console.log('Sign in complete');
        // Sign in complete without OTP - set session and navigate
        await setActive({ session: result.createdSessionId });
        
        // Wait for session to propagate
        await new Promise(resolve => setTimeout(resolve, 500));
        
        navigate('/dashboard');
      } else {
        console.log('Unexpected status:', result.status);
        setError('Unexpected authentication status. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error details:', err?.errors);
      
      // Provide more helpful error messages
      const errorMessage = err?.errors?.[0]?.message || err?.message || 'Invalid email or password';
      
      if (errorMessage.includes('not found') || errorMessage.includes("Couldn't find")) {
        setError('Account not found. Please register first or check your email address.');
      } else if (errorMessage.includes('password')) {
        setError('Invalid password. Please check your password and try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSuccess = () => {
    navigate('/dashboard');
  };

  if (showOTP) {
    return <OTPVerification email={verifyingEmail} onSuccess={handleOTPSuccess} type="signin" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <input
              type="email"
              required
              className="form-input"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          
          <div>
            <input
              type="password"
              required
              className="form-input"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/register" className="text-gray-600 hover:text-gray-800">
              Don't have an account? Sign up
            </Link>
          </div>
          
          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Note: Please use the account you registered with.</p>
            <p>If you can't login, try registering again.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;