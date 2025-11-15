import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/router';
import { ArrowLeft, Database, Server, HardDrive, Download, Upload, RefreshCw, Settings, Activity, CheckCircle, AlertTriangle, Clock, BarChart3, Trash2, Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import Layout from '../components/layout/Layout';

const DatabaseManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { userRole, hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'overview' | 'backups' | 'performance' | 'logs' | 'maintenance' | 'settings'>('overview');

  // Database data state
  const [databaseData, setDatabaseData] = useState({
    totalSize: '2.4 GB',
    usedSpace: '1.8 GB',
    freeSpace: '600 MB',
    connectionCount: 45,
    queryCount: 1247,
    slowQueries: 12,
    lastBackup: '2 hours ago',
    backupSize: '1.2 GB',
    uptime: '99.9%'
  });

  // Check if user is super admin
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'Super Admin';

  // Redirect if not super admin
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/admin');
    }
  }, [isSuperAdmin, navigate]);

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
              <h1 className="text-3xl font-bold text-white">Database Management</h1>
              <p className="text-gray-400">Monitor and manage database operations</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-green-400">
              <Database className="h-4 w-4 mr-2" />
              <span className="text-sm">Super Admin Access</span>
            </div>
            <Button
              variant="primary"
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'backups', label: 'Backups', icon: HardDrive },
              { id: 'performance', label: 'Performance', icon: Activity },
              { id: 'logs', label: 'Logs', icon: Activity },
              { id: 'maintenance', label: 'Maintenance', icon: Settings },
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
              {/* Database Status */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Database Status</h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-400 text-sm">Connected</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-gray-300 font-medium mb-2">Storage Usage</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Total Size</span>
                        <span className="text-white font-medium">{databaseData.totalSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Used Space</span>
                        <span className="text-blue-400 font-medium">{databaseData.usedSpace}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Free Space</span>
                        <span className="text-green-400 font-medium">{databaseData.freeSpace}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-gray-300 font-medium mb-2">Performance</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Active Connections</span>
                        <span className="text-white font-medium">{databaseData.connectionCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Queries Today</span>
                        <span className="text-blue-400 font-medium">{databaseData.queryCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Slow Queries</span>
                        <span className="text-yellow-400 font-medium">{databaseData.slowQueries}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-gray-300 font-medium mb-2">System Info</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Uptime</span>
                        <span className="text-green-400 font-medium">{databaseData.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Last Backup</span>
                        <span className="text-white font-medium">{databaseData.lastBackup}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Backup Size</span>
                        <span className="text-blue-400 font-medium">{databaseData.backupSize}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="flex items-center justify-center">
                    <Download className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Restore Backup
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Optimize Tables
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Performance Check
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Backups Tab */}
          {activeTab === 'backups' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Database Backups</h3>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download Latest
                  </Button>
                  <Button variant="primary" className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Backup Name</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Size</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4 text-gray-300">backup_2024_01_15_14_30</td>
                      <td className="py-3 px-4 text-gray-300">1.2 GB</td>
                      <td className="py-3 px-4 text-gray-300">Full</td>
                      <td className="py-3 px-4">
                        <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">Completed</span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">2 hours ago</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">Download</Button>
                          <Button variant="outline" size="sm">Restore</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4 text-gray-300">backup_2024_01_14_14_30</td>
                      <td className="py-3 px-4 text-gray-300">1.1 GB</td>
                      <td className="py-3 px-4 text-gray-300">Full</td>
                      <td className="py-3 px-4">
                        <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">Completed</span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">1 day ago</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">Download</Button>
                          <Button variant="outline" size="sm">Restore</Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Database Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-300 font-medium mb-4">Query Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Average Query Time</span>
                      <span className="text-green-400 font-medium">45ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Slow Queries (&gt;1s)</span>
                      <span className="text-yellow-400 font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Failed Queries</span>
                      <span className="text-red-400 font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Cache Hit Rate</span>
                      <span className="text-blue-400 font-medium">87%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-300 font-medium mb-4">Connection Pool</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Active Connections</span>
                      <span className="text-white font-medium">45/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Idle Connections</span>
                      <span className="text-blue-400 font-medium">15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Max Connections</span>
                      <span className="text-gray-300 font-medium">100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Connection Timeout</span>
                      <span className="text-gray-300 font-medium">30s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Database Logs</h3>
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
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Backup completed successfully</p>
                        <p className="text-gray-400 text-sm">Size: 1.2 GB | Duration: 5m 23s</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">2 hours ago</span>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <div>
                        <p className="text-white font-medium">Slow query detected</p>
                        <p className="text-gray-400 text-sm">Query: SELECT * FROM users WHERE email LIKE '%@%'</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">1 hour ago</span>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Database optimization completed</p>
                        <p className="text-gray-400 text-sm">Tables optimized: 15 | Time saved: 2.3s</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">3 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Database Maintenance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-gray-300 font-medium">Scheduled Tasks</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Daily Backup</p>
                          <p className="text-gray-400 text-sm">Runs at 2:00 AM UTC</p>
                        </div>
                        <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">Active</span>
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Weekly Optimization</p>
                          <p className="text-gray-400 text-sm">Runs every Sunday at 3:00 AM UTC</p>
                        </div>
                        <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">Active</span>
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Log Cleanup</p>
                          <p className="text-gray-400 text-sm">Runs daily at 4:00 AM UTC</p>
                        </div>
                        <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-gray-300 font-medium">Manual Actions</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Optimize All Tables
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clean Old Logs
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="h-4 w-4 mr-2" />
                      Analyze Table Statistics
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Repair Tables
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Database Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Connections
                  </label>
                  <input
                    type="number"
                    defaultValue="100"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Connection Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    defaultValue="30"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Query Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    defaultValue="60"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Backup Retention (days)
                  </label>
                  <input
                    type="number"
                    defaultValue="30"
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
                    Enable query logging
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Enable slow query logging
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Enable automatic backups
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Enable connection pooling
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

export default DatabaseManagementPage;
