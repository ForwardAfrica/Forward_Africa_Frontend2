import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/router';
import { ArrowLeft, Settings, Database, Server, Shield, Globe, Zap, Save, AlertTriangle, CheckCircle, RefreshCw, Power, Monitor, HardDrive, Network, Cpu, Download, Image } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuthEnhanced } from '../hooks/useAuthEnhanced';
import { usePermissions } from '../contexts/PermissionContext';
import PermissionGuard from '../components/ui/PermissionGuard';
import { apiClient } from '../lib/authInterceptor';
import { tokenDebugger } from '../utils/tokenDebugger';
import Layout from '../components/layout/Layout';
import BannerManagement from '../components/ui/BannerManagement';

// Helper function to safely access auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('forward_africa_token');
  }
  return null;
};

const SystemConfigurationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isSuperAdmin } = useAuthEnhanced();
  const { userRole, hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'general' | 'database' | 'security' | 'performance' | 'backup' | 'monitoring' | 'banner'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [isClient, setIsClient] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Track if we're in the middle of saving

  // Prevent redirects during save operations
  useEffect(() => {
    if (isSaving && typeof window !== 'undefined') {
      // Set a flag to prevent auth redirects
      (window as any).__preventAuthRedirect = true;
      console.log('🔒 Preventing auth redirects during save operation');
    } else {
      // Small delay before re-enabling redirects to ensure save completes
      const timeout = setTimeout(() => {
        if (typeof window !== 'undefined') {
          (window as any).__preventAuthRedirect = false;
          console.log('🔓 Re-enabling auth redirects after save operation');
        }
      }, 2000); // 2 second delay to ensure save completes
      return () => clearTimeout(timeout);
    }
  }, [isSaving]);

  // System configuration state
  const [systemConfig, setSystemConfig] = useState({
    siteName: 'Forward Africa',
    siteDescription: 'Empowering African professionals through expert-led courses',
    maintenanceMode: false,
    debugMode: false,
    maxUploadSize: 50,
    sessionTimeout: 30,
    emailNotifications: true,
    autoBackup: true,
    backupFrequency: 'daily',
    securityLevel: 'high',
    rateLimiting: true,
    maxRequestsPerMinute: 100,
    databaseConnectionPool: 10,
    cacheEnabled: true,
    cacheTTL: 3600,
    cdnEnabled: false,
    sslEnabled: true,
    corsEnabled: true,
    allowedOrigins: ['https://forwardafrica.com', 'https://www.forwardafrica.com']
  });

  // Check if user is super admin (using enhanced auth)
  const isSuperAdminUser = isSuperAdmin;

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Wait for authentication to complete before proceeding
  const isReady = isClient && !authLoading;

  // Add debugging for authentication state
  useEffect(() => {
    console.log('🔍 SystemConfigurationPage: Authentication Debug', {
      isClient,
      authLoading,
      isReady,
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      userRole,
      isSuperAdmin,
      isSuperAdminUser,
      isAuthenticated: !!user
    });
  }, [isClient, authLoading, isReady, user, userRole, isSuperAdmin, isSuperAdminUser]);

    // Load system configuration and status from API
  useEffect(() => {
    console.log('🔄 SystemConfigurationPage: useEffect triggered', { isReady, isSuperAdminUser, userRole });

    if (!isReady || !isSuperAdminUser) {
      console.log('⏸️ SystemConfigurationPage: Skipping data load', { isReady, isSuperAdminUser });
      return;
    }

    const loadData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          console.error('No auth token available');
          setDataLoaded(true);
          return;
        }

        // Check if backend server is running
        try {
          const healthResponse = await fetch('http://localhost:3002/api/health');
          if (!healthResponse.ok) {
            console.warn('Backend server may not be running');
            setDataLoaded(true);
            return;
          }
        } catch (error) {
          console.warn('Backend server is not accessible:', error);
          setDataLoaded(true);
          return;
        }

                // Load configuration
        try {
          const response = await fetch('/api/system/config');
          if (response.ok) {
            const config = await response.json();
            setSystemConfig(config);
          } else {
            console.warn('Failed to load system config, using defaults');
          }
        } catch (error) {
          console.warn('Failed to load system config, using defaults:', error);
        } finally {
          setDataLoaded(true);
        }

                // Load system status
        try {
          const response = await apiClient.get('/system/status');
          setSystemStatus(response.data);
        } catch (error) {
          console.warn('Failed to load system status, using defaults:', error);
          // Set default status data
          setSystemStatus({
            database: { status: 'operational', size: 'Unknown', connectionPool: 'Unknown' },
            systemResources: {
              cpuUsage: 0,
              memoryUsage: 0,
              diskUsage: 0,
              responseTime: 0,
              uptime: 100,
              activeUsers: 0,
              errorRate: 0
            },
            lastBackup: new Date().toISOString(),
            backupSize: 'Unknown'
          });
        }
       } catch (error) {
         console.error('Error loading data:', error);
             } finally {
        console.log('✅ SystemConfigurationPage: Data loading completed');
        setDataLoaded(true);
      }
    };

    console.log('🚀 SystemConfigurationPage: Starting data load');
    loadData();
  }, [isReady, isSuperAdminUser]);



  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple simultaneous saves
    
    setIsLoading(true);
    setIsSaving(true);
    setSaveStatus('saving');

    try {
      console.log('💾 Saving configuration...');
      
      // Use Next.js API route instead of backend to avoid auth issues
      const response = await fetch('/api/system/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(systemConfig)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Save failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Configuration saved successfully:', result);
      setSaveStatus('success');
      
      // Verify user is still authenticated after save
      const token = getAuthToken();
      if (!token) {
        console.warn('⚠️ Token missing after save, but not redirecting');
      }
      
      // Keep user authenticated - don't let any auth checks interfere
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      // Just show error, don't cause logout
      console.error('❌ Error saving configuration:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setSystemConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCreateBackup = async () => {
    setBackupStatus('creating');
    try {
      console.log('🔐 Checking authentication for backup...');
      const token = getAuthToken();
      console.log('🔑 Token available for backup:', !!token);

      if (!token) {
        console.error('❌ No auth token available for backup');
        throw new Error('No auth token available. Please log in again.');
      }

            console.log('💾 Creating backup...');
      const response = await apiClient.post('http://localhost:3002/api/system/backup');
      console.log('✅ Backup created successfully:', response.data);
      setBackupStatus('success');
      setTimeout(() => setBackupStatus('idle'), 3000);
    } catch (error) {
      console.error('❌ Error creating backup:', error);
      setBackupStatus('error');
      setTimeout(() => setBackupStatus('idle'), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  // Show loading state while data is being fetched
  if (!dataLoaded) {
    return <div className="min-h-screen bg-gray-900 text-white pt-20 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading system configuration...</p>
      </div>
    </div>;
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
              <h1 className="text-3xl font-bold text-white">System Configuration</h1>
              <p className="text-gray-400">Manage system-wide settings and configurations</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-green-400">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">Super Admin Access</span>
            </div>
            {/* Hide save button on banner tab since BannerManagement has its own save button */}
            {activeTab !== 'banner' && (
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>

        {/* Save Status */}
        {saveStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-300">Configuration saved successfully!</span>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-lg flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-300">Error saving configuration. Please try again.</span>
          </div>
        )}

        {backupStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-300">Backup created successfully!</span>
          </div>
        )}

        {backupStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-lg flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-300">Error creating backup. Please try again.</span>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'general', label: 'General', icon: Settings },
              { id: 'database', label: 'Database', icon: Database },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'performance', label: 'Performance', icon: Zap },
              { id: 'backup', label: 'Backup', icon: HardDrive },
              { id: 'monitoring', label: 'Monitoring', icon: Monitor },
              { id: 'banner', label: 'Banner', icon: Image }
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
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                General System Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={systemConfig.siteName}
                    onChange={(e) => handleConfigChange('siteName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Site Description
                  </label>
                  <input
                    type="text"
                    value={systemConfig.siteDescription}
                    onChange={(e) => handleConfigChange('siteDescription', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maximum Upload Size (MB)
                  </label>
                  <input
                    type="number"
                    value={systemConfig.maxUploadSize}
                    onChange={(e) => handleConfigChange('maxUploadSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={systemConfig.sessionTimeout}
                    onChange={(e) => handleConfigChange('sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemConfig.maintenanceMode}
                    onChange={(e) => handleConfigChange('maintenanceMode', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Maintenance Mode
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemConfig.debugMode}
                    onChange={(e) => handleConfigChange('debugMode', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Debug Mode
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Database Settings */}
          {activeTab === 'database' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Database Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Connection Pool Size
                  </label>
                  <input
                    type="number"
                    value={systemConfig.databaseConnectionPool}
                    onChange={(e) => handleConfigChange('databaseConnectionPool', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Database Status
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      systemStatus?.database?.status === 'operational' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`${
                      systemStatus?.database?.status === 'operational' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {systemStatus ? (systemStatus.database?.status === 'operational' ? 'Connected' : 'Error') : 'Loading...'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Database Size
                  </label>
                  <span className="text-gray-300">
                    {systemStatus ? systemStatus.database?.size : 'Loading...'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Connection Pool
                  </label>
                  <span className="text-gray-300">
                    {systemStatus ? systemStatus.database?.connectionPool : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Security Level
                  </label>
                  <select
                    value={systemConfig.securityLevel}
                    onChange={(e) => handleConfigChange('securityLevel', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="maximum">Maximum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rate Limiting
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={systemConfig.rateLimiting}
                      onChange={(e) => handleConfigChange('rateLimiting', e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <input
                      type="number"
                      value={systemConfig.maxRequestsPerMinute}
                      onChange={(e) => handleConfigChange('maxRequestsPerMinute', parseInt(e.target.value))}
                      className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      disabled={!systemConfig.rateLimiting}
                    />
                    <span className="text-gray-400 text-sm">requests/minute</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemConfig.sslEnabled}
                    onChange={(e) => handleConfigChange('sslEnabled', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    SSL/TLS Enabled
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemConfig.corsEnabled}
                    onChange={(e) => handleConfigChange('corsEnabled', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    CORS Enabled
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Performance Settings */}
          {activeTab === 'performance' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Performance Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemConfig.cacheEnabled}
                    onChange={(e) => handleConfigChange('cacheEnabled', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Enable Caching
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cache TTL (seconds)
                  </label>
                  <input
                    type="number"
                    value={systemConfig.cacheTTL}
                    onChange={(e) => handleConfigChange('cacheTTL', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={!systemConfig.cacheEnabled}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemConfig.cdnEnabled}
                    onChange={(e) => handleConfigChange('cdnEnabled', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    CDN Enabled
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    System Resources
                  </label>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">CPU Usage</span>
                      <span className={`text-sm ${
                        systemStatus?.systemResources?.cpuUsage > 80 ? 'text-red-400' :
                        systemStatus?.systemResources?.cpuUsage > 60 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {systemStatus ? `${systemStatus.systemResources?.cpuUsage}%` : 'Loading...'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Memory Usage</span>
                      <span className={`text-sm ${
                        systemStatus?.systemResources?.memoryUsage > 80 ? 'text-red-400' :
                        systemStatus?.systemResources?.memoryUsage > 60 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {systemStatus ? `${systemStatus.systemResources?.memoryUsage}%` : 'Loading...'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Disk Usage</span>
                      <span className={`text-sm ${
                        systemStatus?.systemResources?.diskUsage > 80 ? 'text-red-400' :
                        systemStatus?.systemResources?.diskUsage > 60 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {systemStatus ? `${systemStatus.systemResources?.diskUsage}%` : 'Loading...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup Settings */}
          {activeTab === 'backup' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <HardDrive className="h-5 w-5 mr-2" />
                Backup Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemConfig.autoBackup}
                    onChange={(e) => handleConfigChange('autoBackup', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Automatic Backup
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={systemConfig.backupFrequency}
                    onChange={(e) => handleConfigChange('backupFrequency', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={!systemConfig.autoBackup}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Backup
                  </label>
                  <span className="text-gray-300">
                    {systemStatus ? new Date(systemStatus.lastBackup).toLocaleString() : 'Loading...'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Backup Size
                  </label>
                  <span className="text-gray-300">
                    {systemStatus ? systemStatus.backupSize : 'Loading...'}
                  </span>
                </div>
                <div>
                  <Button
                    variant="outline"
                    onClick={handleCreateBackup}
                    disabled={backupStatus === 'creating'}
                    className="flex items-center"
                  >
                    {backupStatus === 'creating' ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <HardDrive className="h-4 w-4 mr-2" />
                    )}
                    {backupStatus === 'creating' ? 'Creating Backup...' : 'Create Manual Backup'}
                  </Button>
                </div>
                <div>
                  <Button
                    variant="outline"
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Latest Backup
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Monitoring Settings */}
          {activeTab === 'monitoring' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Monitor className="h-5 w-5 mr-2" />
                System Monitoring
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    System Status
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <Server className="h-4 w-4 mr-2 text-green-400" />
                        <span className="text-gray-300">Web Server</span>
                      </div>
                      <div className="flex items-center text-green-400">
                        {getStatusIcon('operational')}
                        <span className="ml-1 text-sm">Operational</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <Database className="h-4 w-4 mr-2 text-green-400" />
                        <span className="text-gray-300">Database</span>
                      </div>
                      <div className="flex items-center text-green-400">
                        {getStatusIcon('operational')}
                        <span className="ml-1 text-sm">Operational</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <Network className="h-4 w-4 mr-2 text-yellow-400" />
                        <span className="text-gray-300">Network</span>
                      </div>
                      <div className="flex items-center text-yellow-400">
                        {getStatusIcon('warning')}
                        <span className="ml-1 text-sm">High Latency</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Performance Metrics
                  </label>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Response Time</span>
                      <span className="text-green-400 text-sm">
                        {systemStatus ? `${systemStatus.systemResources?.responseTime}ms` : 'Loading...'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Uptime</span>
                      <span className="text-green-400 text-sm">
                        {systemStatus ? `${systemStatus.systemResources?.uptime}%` : 'Loading...'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Active Users</span>
                      <span className="text-blue-400 text-sm">
                        {systemStatus ? systemStatus.systemResources?.activeUsers?.toLocaleString() : 'Loading...'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Error Rate</span>
                      <span className="text-green-400 text-sm">
                        {systemStatus ? `${systemStatus.systemResources?.errorRate}%` : 'Loading...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Banner Management */}
          {activeTab === 'banner' && (
            <BannerManagement />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SystemConfigurationPage;