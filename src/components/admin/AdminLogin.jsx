import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedEarth from '../AnimatedEarth';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use real authentication API
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginField: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success && data.data && data.data.user) {
        const user = data.data.user;
        
        // Check if user is admin
        if (user.role === 'admin') {
          // Store the real token and user data
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Redirect to admin dashboard
          navigate('/admin/dashboard');
        } else {
          setError('Access denied. Admin privileges required.');
        }
      } else {
        setError(data.message || 'Invalid admin credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Earth Background */}
      <AnimatedEarth />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full mb-6 shadow-2xl shadow-red-500/50">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Poppins', 'Inter', sans-serif", letterSpacing: '0.02em' }}>
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Admin Panel</span>
          </h1>
          <p className="text-gray-700 text-base" style={{ fontFamily: "'Inter', sans-serif" }}>Ghumakkars Administration Portal 🔐</p>
        </div>

        {/* Auth Card - Enhanced Glassmorphism */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 p-8 animate-fade-in-up-delayed" style={{ backdropFilter: 'blur(40px)', boxShadow: '0 8px 32px 0 rgba(239, 68, 68, 0.15)' }}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Admin Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 border backdrop-blur-sm rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 border-red-200"
                placeholder="Enter admin email"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 border backdrop-blur-sm rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 border-red-200"
                placeholder="Enter admin password"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-6 bg-gradient-to-r from-red-600 to-orange-600 text-white text-base font-semibold rounded-xl hover:shadow-2xl hover:shadow-red-500/50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Access Admin Panel'
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium mb-2">Demo Credentials:</p>
            <p className="text-xs text-yellow-700">Email: admin@ghumakkars.in</p>
            <p className="text-xs text-yellow-700">Password: admin123</p>
          </div>

          {/* Back to Main Site */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              ← Back to Main Site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
