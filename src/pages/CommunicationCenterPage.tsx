import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/router';
import { ArrowLeft, MessageSquare, Mail, Bell, Send, Users, Filter, Search, Calendar, Clock, CheckCircle, AlertTriangle, Edit, Trash2, Plus, Eye, BarChart3, Settings } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import Layout from '../components/layout/Layout';
import { communicationService, Announcement, EmailCampaign, PushNotification, EmailTemplate, CommunicationSettings, CommunicationAnalytics } from '../lib/communicationService';

const CommunicationCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { userRole, hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'announcements' | 'emails' | 'notifications' | 'templates' | 'analytics' | 'settings'>('announcements');
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'users' | 'instructors' | 'admins'>('all');

  // Communication data state
  const [communications, setCommunications] = useState<CommunicationAnalytics>({
    total_announcements: 0,
    total_emails: 0,
    total_notifications: 0,
    delivery_rate: '0',
    open_rate: '0',
    click_rate: '0'
  });

  // Data states
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [settings, setSettings] = useState<CommunicationSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user is super admin
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'Super Admin';

  // Load data when component mounts
  useEffect(() => {
    if (isSuperAdmin) {
      loadData();
    }
  }, [isSuperAdmin]);

  // Redirect if not super admin
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/admin');
    }
  }, [isSuperAdmin, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load analytics
      const analyticsResponse = await communicationService.getAnalytics();
      setCommunications(analyticsResponse.analytics);

      // Load announcements
      const announcementsResponse = await communicationService.getAnnouncements({ limit: 10 });
      setAnnouncements(announcementsResponse.announcements);

      // Load email campaigns
      const campaignsResponse = await communicationService.getEmailCampaigns({ limit: 10 });
      setEmailCampaigns(campaignsResponse.campaigns);

      // Load push notifications
      const notificationsResponse = await communicationService.getPushNotifications({ limit: 10 });
      setPushNotifications(notificationsResponse.notifications);

      // Load email templates
      const templatesResponse = await communicationService.getEmailTemplates();
      setEmailTemplates(templatesResponse.templates);

      // Load settings
      const settingsResponse = await communicationService.getSettings();
      setSettings(settingsResponse.settings);
    } catch (error) {
      console.error('Error loading communication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
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
              <h1 className="text-3xl font-bold text-white">Communication Center</h1>
              <p className="text-gray-400">Manage announcements, emails, and notifications</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-green-400">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="text-sm">Super Admin Access</span>
            </div>
            <Button
              variant="primary"
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'announcements', label: 'Announcements', icon: Bell },
              { id: 'emails', label: 'Emails', icon: Mail },
              { id: 'notifications', label: 'Notifications', icon: MessageSquare },
              { id: 'templates', label: 'Templates', icon: Edit },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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
          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Announcements</p>
                      <p className="text-2xl font-bold text-white">{communications.total_announcements}</p>
                    </div>
                    <div className="bg-blue-600/20 p-3 rounded-lg">
                      <Bell className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Open Rate</p>
                      <p className="text-2xl font-bold text-white">{communications.open_rate}%</p>
                    </div>
                    <div className="bg-green-600/20 p-3 rounded-lg">
                      <Eye className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Delivery Rate</p>
                      <p className="text-2xl font-bold text-white">{communications.delivery_rate}%</p>
                    </div>
                    <div className="bg-purple-600/20 p-3 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcements List */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Recent Announcements</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search announcements..."
                        className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <Button variant="outline" className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="primary" className="flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      New Announcement
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                      <p className="text-gray-400 mt-2">Loading announcements...</p>
                    </div>
                  ) : announcements.length > 0 ? (
                    announcements.map((announcement) => (
                      <div key={announcement.id} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-2">{announcement.title}</h4>
                            <p className="text-gray-400 text-sm mb-2">{announcement.content}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(announcement.created_at).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {announcement.audience === 'all' ? 'All Users' : announcement.audience}
                              </span>
                              <span className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {announcement.views_count} views
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                announcement.status === 'published' ? 'bg-green-600/20 text-green-400' :
                                announcement.status === 'draft' ? 'bg-yellow-600/20 text-yellow-400' :
                                'bg-gray-600/20 text-gray-400'
                              }`}>
                                {announcement.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No announcements found</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Emails Tab */}
          {activeTab === 'emails' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Email Campaigns</h3>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="primary" className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    New Campaign
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading email campaigns...</p>
                  </div>
                ) : emailCampaigns.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Campaign Name</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Audience</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Sent</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Opened</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Clicked</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailCampaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b border-gray-700">
                          <td className="py-3 px-4 text-gray-300">{campaign.name}</td>
                          <td className="py-3 px-4 text-gray-300">
                            {campaign.audience === 'all' ? 'All Users' : campaign.audience}
                          </td>
                          <td className="py-3 px-4 text-gray-300">{campaign.total_recipients}</td>
                          <td className="py-3 px-4 text-green-400">
                            {campaign.opened_count} ({campaign.total_recipients > 0 ? ((campaign.opened_count / campaign.total_recipients) * 100).toFixed(1) : 0}%)
                          </td>
                          <td className="py-3 px-4 text-blue-400">
                            {campaign.clicked_count} ({campaign.opened_count > 0 ? ((campaign.clicked_count / campaign.opened_count) * 100).toFixed(1) : 0}%)
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              campaign.status === 'sent' ? 'bg-green-600/20 text-green-400' :
                              campaign.status === 'sending' ? 'bg-blue-600/20 text-blue-400' :
                              campaign.status === 'draft' ? 'bg-yellow-600/20 text-yellow-400' :
                              campaign.status === 'cancelled' ? 'bg-red-600/20 text-red-400' :
                              'bg-gray-600/20 text-gray-400'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No email campaigns found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Push Notifications</h3>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="primary" className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    New Notification
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading notifications...</p>
                  </div>
                ) : pushNotifications.length > 0 ? (
                  pushNotifications.map((notification) => (
                    <div key={notification.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-2">{notification.title}</h4>
                          <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {notification.audience === 'all' ? 'All Users' : notification.audience}
                            </span>
                            <span className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {notification.delivered_count} delivered
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              notification.status === 'sent' ? 'bg-green-600/20 text-green-400' :
                              notification.status === 'draft' ? 'bg-yellow-600/20 text-yellow-400' :
                              notification.status === 'cancelled' ? 'bg-red-600/20 text-red-400' :
                              'bg-gray-600/20 text-gray-400'
                            }`}>
                              {notification.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No push notifications found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Message Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading templates...</p>
                  </div>
                ) : emailTemplates.length > 0 ? (
                  emailTemplates.map((template) => (
                    <div key={template.id} className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">{template.name}</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        {template.subject}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Use</Button>
                        {template.is_default && (
                          <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-400">No email templates found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Communication Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-300 font-medium mb-4">Delivery Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Emails Sent</span>
                      <span className="text-white font-medium">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Delivered</span>
                      <span className="text-green-400 font-medium">1,220 (99.2%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Opened</span>
                      <span className="text-blue-400 font-medium">987 (80.5%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Clicked</span>
                      <span className="text-purple-400 font-medium">123 (12.3%)</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-300 font-medium mb-4">Audience Engagement</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Active Users</span>
                      <span className="text-white font-medium">892</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Notification Opt-ins</span>
                      <span className="text-green-400 font-medium">756 (84.8%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Email Subscribers</span>
                      <span className="text-blue-400 font-medium">1,089 (92.1%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Unsubscribed</span>
                      <span className="text-red-400 font-medium">23 (2.1%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Communication Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  <div className="col-span-full text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading settings...</p>
                  </div>
                ) : settings ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Default Sender Email
                      </label>
                      <input
                        type="email"
                        defaultValue={settings.default_sender_email}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Default Sender Name
                      </label>
                      <input
                        type="text"
                        defaultValue={settings.default_sender_name}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={settings.enable_email_notifications === 'true'}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-300">
                        Enable email notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={settings.enable_push_notifications === 'true'}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-300">
                        Enable push notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={settings.require_email_confirmation === 'true'}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-300">
                        Require email confirmation
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={settings.enable_sms_notifications === 'true'}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-300">
                        Enable SMS notifications
                      </label>
                    </div>
                  </>
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-400">No settings found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CommunicationCenterPage;
