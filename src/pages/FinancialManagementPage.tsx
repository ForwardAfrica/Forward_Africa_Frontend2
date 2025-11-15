import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/router';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet, BarChart3, PieChart, Download, Upload, Filter, Search, Calendar, Clock, AlertTriangle, CheckCircle, X, Plus, Edit, Trash2, Eye, EyeOff, Activity, Target, Zap, Settings, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import Layout from '../components/layout/Layout';

const FinancialManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { userRole, hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'revenue' | 'refunds' | 'reports' | 'settings'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Financial data state
  const [financialData, setFinancialData] = useState({
    totalRevenue: 125000,
    monthlyRevenue: 15000,
    totalTransactions: 1247,
    pendingRefunds: 3,
    activeSubscriptions: 892,
    averageOrderValue: 125.50,
    conversionRate: 3.2,
    refundRate: 0.8
  });

  // Check if user is super admin
  const isSuperAdmin = userRole === 'super_admin';

  // Redirect if not super admin
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/admin');
    }
  }, [isSuperAdmin, navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
              <h1 className="text-3xl font-bold text-white">Financial Management</h1>
              <p className="text-gray-400">Monitor revenue, transactions, and financial performance</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-green-400">
              <DollarSign className="h-4 w-4 mr-2" />
              <span className="text-sm">Super Admin Access</span>
            </div>
            <Button
              variant="primary"
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'transactions', label: 'Transactions', icon: CreditCard },
              { id: 'revenue', label: 'Revenue', icon: DollarSign },
              { id: 'refunds', label: 'Refunds', icon: TrendingDown },
              { id: 'reports', label: 'Reports', icon: Download },
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

        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Time Range:</span>
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  timeRange === range
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(financialData.totalRevenue)}</p>
                    </div>
                    <div className="bg-green-600/20 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-green-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12.5% from last month
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(financialData.monthlyRevenue)}</p>
                    </div>
                    <div className="bg-blue-600/20 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-blue-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +8.3% from last month
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Transactions</p>
                      <p className="text-2xl font-bold text-white">{financialData.totalTransactions.toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-600/20 p-3 rounded-lg">
                      <CreditCard className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-purple-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +15.2% from last month
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Subscriptions</p>
                      <p className="text-2xl font-bold text-white">{financialData.activeSubscriptions.toLocaleString()}</p>
                    </div>
                    <div className="bg-yellow-600/20 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-yellow-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-yellow-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +5.7% from last month
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Revenue Performance</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Average Order Value</span>
                      <span className="text-white font-medium">{formatCurrency(financialData.averageOrderValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Conversion Rate</span>
                      <span className="text-green-400 font-medium">{formatPercentage(financialData.conversionRate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Refund Rate</span>
                      <span className="text-red-400 font-medium">{formatPercentage(financialData.refundRate)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-green-400" />
                        <span className="text-gray-300">New subscription</span>
                      </div>
                      <span className="text-green-400 text-sm">+$99.99</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <Wallet className="h-4 w-4 mr-2 text-blue-400" />
                        <span className="text-gray-300">Course purchase</span>
                      </div>
                      <span className="text-blue-400 text-sm">+$149.99</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <TrendingDown className="h-4 w-4 mr-2 text-red-400" />
                        <span className="text-gray-300">Refund processed</span>
                      </div>
                      <span className="text-red-400 text-sm">-$79.99</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Transaction History</h3>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Transaction ID</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4 text-gray-300">TXN-001</td>
                      <td className="py-3 px-4 text-gray-300">john.doe@example.com</td>
                      <td className="py-3 px-4">
                        <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">Subscription</span>
                      </td>
                      <td className="py-3 px-4 text-green-400">+$99.99</td>
                      <td className="py-3 px-4">
                        <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">Completed</span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">2024-01-15</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4 text-gray-300">TXN-002</td>
                      <td className="py-3 px-4 text-gray-300">jane.smith@example.com</td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">Course</span>
                      </td>
                      <td className="py-3 px-4 text-blue-400">+$149.99</td>
                      <td className="py-3 px-4">
                        <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">Completed</span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">2024-01-14</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4 text-gray-300">TXN-003</td>
                      <td className="py-3 px-4 text-gray-300">mike.johnson@example.com</td>
                      <td className="py-3 px-4">
                        <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-xs">Refund</span>
                      </td>
                      <td className="py-3 px-4 text-red-400">-$79.99</td>
                      <td className="py-3 px-4">
                        <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs">Pending</span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">2024-01-13</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Revenue Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-400 text-sm mb-2">Revenue by Source</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Course Sales</span>
                      <span className="text-white font-medium">65%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Subscriptions</span>
                      <span className="text-white font-medium">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Certifications</span>
                      <span className="text-white font-medium">10%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-400 text-sm mb-2">Top Performing Categories</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Business</span>
                      <span className="text-white font-medium">$45,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Technology</span>
                      <span className="text-white font-medium">$38,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Finance</span>
                      <span className="text-white font-medium">$32,100</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-400 text-sm mb-2">Geographic Revenue</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Nigeria</span>
                      <span className="text-white font-medium">40%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">Kenya</span>
                      <span className="text-white font-medium">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm">South Africa</span>
                      <span className="text-white font-medium">20%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Refunds Tab */}
          {activeTab === 'refunds' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Refund Management</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">Pending Refunds: {financialData.pendingRefunds}</span>
                  <Button variant="outline" className="flex items-center">
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Process All
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Refund ID</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Original Transaction</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Reason</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4 text-gray-300">REF-001</td>
                      <td className="py-3 px-4 text-gray-300">john.doe@example.com</td>
                      <td className="py-3 px-4 text-gray-300">TXN-001</td>
                      <td className="py-3 px-4 text-red-400">-$99.99</td>
                      <td className="py-3 px-4 text-gray-300">Technical issues</td>
                      <td className="py-3 px-4">
                        <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs">Pending</span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">Approve</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Financial Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-gray-300 font-medium">Revenue Reports</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Monthly Revenue Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Quarterly Revenue Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Annual Revenue Report
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-gray-300 font-medium">Transaction Reports</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Transaction History
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Refund Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Subscription Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Financial Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Currency
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="NGN">NGN - Nigerian Naira</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    defaultValue="7.5"
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
                    Enable automatic refunds
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Send payment confirmations
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

export default FinancialManagementPage;
