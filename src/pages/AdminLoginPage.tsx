import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/router';
import { Lock, Shield, AlertTriangle, UserPlus, Crown } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn({ email, password });
      // On successful login, navigate to admin dashboard
      window.scrollTo({ top: 0, behavior: 'instant' });
      navigate('/admin');
    } catch (error: any) {
      setError('Invalid credentials. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Super Admin': return <Crown className="h-5 w-5 text-purple-500 mr-2" />;
      case 'Instructor': return <UserPlus className="h-5 w-5 text-green-500 mr-2" />;
      case 'Content Manager': return <Shield className="h-5 w-5 text-blue-500 mr-2" />;
      case 'Community Manager': return <UserPlus className="h-5 w-5 text-green-500 mr-2" />;
      case 'User Support': return <Shield className="h-5 w-5 text-yellow-500 mr-2" />;
      default: return <Shield className="h-5 w-5 text-gray-400 mr-2" />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-red-500/10 p-4 rounded-full">
              <Shield className="h-10 w-10 text-red-500" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
            <p className="text-gray-400">Sign in to access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-md text-sm flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter admin email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter password"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Access Admin Dashboard
                </>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-700/50 rounded-lg">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Demo Credentials
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                {getRoleIcon('Super Admin')}
                <div className="flex-1">
                  <div className="text-white font-medium">Super Admin</div>
                  <div className="text-gray-400">admin@forwardafrica.com</div>
                  <div className="text-gray-500">admin123</div>
                </div>
              </div>
              <div className="flex items-center">
                {getRoleIcon('Instructor')}
                <div className="flex-1">
                  <div className="text-white font-medium">Instructor</div>
                  <div className="text-gray-400">jane.smith@example.com</div>
                  <div className="text-gray-500">password123</div>
                </div>
              </div>
              <div className="flex items-center">
                {getRoleIcon('Content Manager')}
                <div className="flex-1">
                  <div className="text-white font-medium">Content Manager</div>
                  <div className="text-gray-400">mike.johnson@example.com</div>
                  <div className="text-gray-500">password123</div>
                </div>
              </div>
            </div>
          </div>

          {/* Regular User Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Regular user?{' '}
            <button
                onClick={() => navigate('/login')}
                className="text-red-500 hover:text-red-400 font-medium"
            >
                Sign in here
            </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLoginPage;
