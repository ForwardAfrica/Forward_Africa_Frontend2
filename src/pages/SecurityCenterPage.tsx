import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/router';
import { ArrowLeft, Shield, Lock, Eye, AlertTriangle, CheckCircle, Users, Activity, Settings, RefreshCw, Download, Upload, Key, Database, Network, Server } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import Layout from '../components/layout/Layout';

const SecurityCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { userRole, hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'logs' | 'threats' | 'compliance' | 'settings'>('overview');

  // Security data state
  const [securityData, setSecurityData] = useState({
    activeSessions: 1247,
    failedLogins: 23,
    blockedIPs: 5,
    securityScore: 92,
    lastScan: '2 hours ago',
    threatsBlocked: 156,
    complianceStatus: 'Compliant'
  });

  // Check if user is super admin
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'Super Admin';

  // Redirect if not super admin
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/admin');
    }
  }, [isSuperAdmin, navigate]);

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSecurityScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4" />;
    if (score >= 70) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <Layout>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Security Center</h1>
              <p className="text-gray-400">Monitor and manage platform security</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-green-400">
              <Shield className="h-4 w-4 mr-2" />
              <span className="text-sm">Super Admin Access</span>
            </div>
            <Button
              variant="primary"
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Security Scan
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Shield },
              { id: 'sessions', label: 'Active Sessions', icon: Users },
              { id: 'logs', label: 'Security Logs', icon: Activity },
              { id: 'threats', label: 'Threats', icon: AlertTriangle },
              { id: 'compliance', label: 'Compliance', icon: CheckCircle },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`pb-4 relative flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
                {activeTab === id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Security Score */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Security Score</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Last updated:</span>
                    <span className="text-sm text-gray-300">{securityData.lastScan}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`text-4xl font-bold ${getSecurityScoreColor(securityData.securityScore)}`}>
                      {securityData.securityScore}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getSecurityScoreIcon(securityData.securityScore)}
                      <span className={`text-sm ${getSecurityScoreColor(securityData.securityScore)}`}>
                        {securityData.securityScore >= 90 ? 'Excellent' : securityData.securityScore >= 70 ? 'Good' : 'Needs Attention'}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update Score
                  </Button>
                </div>
              </div>

              {/* Security Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Sessions</p>
                      <p className="text-2xl font-bold text-white">{securityData.activeSessions.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-600/20 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Failed Logins</p>
                      <p className="text-2xl font-bold text-red-400">{securityData.failedLogins}</p>
                    </div>
                    <div className="bg-red-600/20 p-3 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Blocked IPs</p>
                      <p className="text-2xl font-bold text-yellow-400">{securityData.blockedIPs}</p>
                    </div>
                    <div className="bg-yellow-600/20 p-3 rounded-lg">
                      <Lock className="h-6 w-6 text-yellow-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Threats Blocked</p>
                      <p className="text-2xl font-bold text-green-400">{securityData.threatsBlocked}</p>
                    </div>
                    <div className="bg-green-600/20 p-3 rounded-lg">
                      <Shield className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">System Security Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                        <span className="text-gray-300">Firewall Protection</span>
                      </div>
                      <span className="text-green-400 text-sm">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                        <span className="text-gray-300">SSL/TLS Encryption</span>
                      </div>
                      <span className="text-green-400 text-sm">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                        <span className="text-gray-300">Rate Limiting</span>
                      </div>
                      <span className="text-green-400 text-sm">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" />
                        <span className="text-gray-300">Database Backup</span>
                      </div>
                      <span className="text-yellow-400 text-sm">Pending</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Security Events</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-400" />
                        <span className="text-gray-300">Failed login attempt</span>
                      </div>
                      <span className="text-gray-400 text-xs">2 min ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                        <span className="text-gray-300">Security scan completed</span>
                      </div>
                      <span className="text-gray-400 text-xs">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-blue-400" />
                        <span className="text-gray-300">IP address blocked</span>
                      </div>
                      <span className="text-gray-400 text-xs">1 day ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                        <span className="text-gray-300">Backup completed</span>
                      </div>
                      <span className="text-gray-400 text-xs">2 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Active Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Active User Sessions</h3>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">IP Address</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Location</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Device</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Activity</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4 text-gray-300">john.doe@example.com</td>
                      <td className="py-3 px-4 text-gray-300">192.168.1.100</td>
                      <td className="py-3 px-4 text-gray-300">Lagos, Nigeria</td>
                      <td className="py-3 px-4 text-gray-300">Chrome on Windows</td>
                      <td className="py-3 px-4 text-gray-300">2 minutes ago</td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">Terminate</Button>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4 text-gray-300">jane.smith@example.com</td>
                      <td className="py-3 px-4 text-gray-300">10.0.0.50</td>
                      <td className="py-3 px-4 text-gray-300">Nairobi, Kenya</td>
                      <td className="py-3 px-4 text-gray-300">Safari on Mac</td>
                      <td className="py-3 px-4 text-gray-300">15 minutes ago</td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">Terminate</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Security Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Security Logs</h3>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                  <Button variant="outline" className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <div>
                        <p className="text-white font-medium">Failed login attempt</p>
                        <p className="text-gray-400 text-sm">IP: 192.168.1.100 | User: admin@example.com</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">2 minutes ago</span>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Successful login</p>
                        <p className="text-gray-400 text-sm">IP: 10.0.0.50 | User: jane.smith@example.com</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">15 minutes ago</span>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">IP address blocked</p>
                        <p className="text-gray-400 text-sm">IP: 203.0.113.0 | Reason: Multiple failed attempts</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Threats Tab */}
          {activeTab === 'threats' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Security Threats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-300 font-medium mb-4">Threat Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Total Threats Blocked</span>
                      <span className="text-green-400 font-medium">{securityData.threatsBlocked}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Malware Attempts</span>
                      <span className="text-red-400 font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">DDoS Attacks</span>
                      <span className="text-yellow-400 font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">SQL Injection</span>
                      <span className="text-red-400 font-medium">8</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-300 font-medium mb-4">Recent Threats</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-gray-600 rounded">
                      <span className="text-gray-300 text-sm">SQL Injection attempt</span>
                      <span className="text-red-400 text-xs">Blocked</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-600 rounded">
                      <span className="text-gray-300 text-sm">Suspicious file upload</span>
                      <span className="text-red-400 text-xs">Blocked</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-600 rounded">
                      <span className="text-gray-300 text-sm">Brute force attack</span>
                      <span className="text-red-400 text-xs">Blocked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Compliance Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-300 font-medium mb-4">GDPR Compliance</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Data Encryption</span>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">User Consent</span>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Data Portability</span>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Right to Deletion</span>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-300 font-medium mb-4">Security Standards</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">SSL/TLS 1.3</span>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Password Policy</span>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Two-Factor Auth</span>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Regular Backups</span>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Security Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    defaultValue="30"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Failed Login Attempts
                  </label>
                  <input
                    type="number"
                    defaultValue="5"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Enable two-factor authentication
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Enable IP blocking
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Enable security logging
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Enable automatic security scans
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SecurityCenterPage;
