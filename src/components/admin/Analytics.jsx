import { useState, useEffect } from 'react';
import sessionsService from '../../services/sessionsService';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  
  const [overview, setOverview] = useState({
    reach: 0,
    audience: 0,
    views: 0,
    clicks: 0,
    actions: 0,
    registrations: 0
  });
  
  const [registrationStats, setRegistrationStats] = useState({
    registrationPageViews: 0,
    registrations: 0,
    conversionRate: 0
  });
  
  const [pagePerformance, setPagePerformance] = useState([]);
  const [ipStats, setIpStats] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch overview
      const overviewResponse = await sessionsService.getAnalyticsOverview(dateRange);
      if (overviewResponse.success) {
        setOverview(overviewResponse.data.overview);
        setRegistrationStats(overviewResponse.data.registrationStats);
      }
      
      // Fetch page performance
      const pageResponse = await sessionsService.getPagePerformance(dateRange);
      if (pageResponse.success) {
        setPagePerformance(pageResponse.data.pages || []);
      }
      
      // Fetch IP stats
      const ipResponse = await sessionsService.getIPStats(dateRange);
      if (ipResponse.success) {
        setIpStats(ipResponse.data.ipStats || []);
      }
      
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getDateRangeLabel = (range) => {
    const labels = {
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days',
      '1y': 'Last Year'
    };
    return labels[range] || 'Last 30 Days';
  };

  return (
    <div className="space-y-8" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Page Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Analytics Dashboard</h1>
            <p className="text-slate-600 mt-2 font-medium">Track reach, audience, views, clicks, actions, and page performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button 
              onClick={fetchAnalytics}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Reach */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.196-2.121M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-blue-100 text-sm font-medium">{getDateRangeLabel(dateRange)}</span>
          </div>
          <h3 className="text-sm font-medium text-blue-100 mb-1">Reach</h3>
          <p className="text-4xl font-bold">{loading ? '...' : formatNumber(overview.reach)}</p>
          <p className="text-blue-100 text-sm mt-2">Unique IP addresses</p>
        </div>

        {/* Audience */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-purple-100 text-sm font-medium">{getDateRangeLabel(dateRange)}</span>
          </div>
          <h3 className="text-sm font-medium text-purple-100 mb-1">Audience</h3>
          <p className="text-4xl font-bold">{loading ? '...' : formatNumber(overview.audience)}</p>
          <p className="text-purple-100 text-sm mt-2">Registered users</p>
        </div>

        {/* Views */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-green-100 text-sm font-medium">{getDateRangeLabel(dateRange)}</span>
          </div>
          <h3 className="text-sm font-medium text-green-100 mb-1">Views</h3>
          <p className="text-4xl font-bold">{loading ? '...' : formatNumber(overview.views)}</p>
          <p className="text-green-100 text-sm mt-2">Page views</p>
        </div>

        {/* Clicks */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <span className="text-amber-100 text-sm font-medium">{getDateRangeLabel(dateRange)}</span>
          </div>
          <h3 className="text-sm font-medium text-amber-100 mb-1">Clicks</h3>
          <p className="text-4xl font-bold">{loading ? '...' : formatNumber(overview.clicks)}</p>
          <p className="text-amber-100 text-sm mt-2">Total clicks</p>
        </div>

        {/* Actions */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-teal-100 text-sm font-medium">{getDateRangeLabel(dateRange)}</span>
          </div>
          <h3 className="text-sm font-medium text-teal-100 mb-1">Actions</h3>
          <p className="text-4xl font-bold">{loading ? '...' : formatNumber(overview.actions)}</p>
          <p className="text-teal-100 text-sm mt-2">User actions</p>
        </div>

        {/* Registrations */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <span className="text-pink-100 text-sm font-medium">{getDateRangeLabel(dateRange)}</span>
          </div>
          <h3 className="text-sm font-medium text-pink-100 mb-1">Registrations</h3>
          <p className="text-4xl font-bold">{loading ? '...' : formatNumber(overview.registrations)}</p>
          <p className="text-pink-100 text-sm mt-2">New sign-ups</p>
        </div>
      </div>

      {/* Registration Conversion Card */}
      {registrationStats.registrationPageViews > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">Registration Conversion</h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {registrationStats.conversionRate}% Rate
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">Registration Page Views</p>
              <p className="text-3xl font-bold text-slate-800">{formatNumber(registrationStats.registrationPageViews)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Actual Registrations</p>
              <p className="text-3xl font-bold text-green-600">{formatNumber(registrationStats.registrations)}</p>
            </div>
            <div className="flex items-center">
              <div className="w-full">
                <p className="text-sm text-slate-600 mb-2">Conversion Rate</p>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-teal-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${Math.min(registrationStats.conversionRate, 100)}%` }}
                  >
                    {registrationStats.conversionRate > 10 && (
                      <span className="text-xs text-white font-semibold">{registrationStats.conversionRate}%</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">{formatNumber(registrationStats.registrationPageViews)}</span> viewed registration pages,{' '}
              <span className="font-semibold">{formatNumber(registrationStats.registrations)}</span> registered
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50">
        <div className="border-b border-slate-200/50">
          <div className="flex space-x-1 p-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Page Performance
            </button>
            <button
              onClick={() => setActiveTab('ip')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'ip'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              IP Statistics
            </button>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading analytics...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-4">
              {pagePerformance.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600">No page performance data available</p>
                </div>
              ) : (
                pagePerformance.map((page, index) => {
                  const totalEngagement = page.views + page.clicks + page.actions;
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-6 border border-slate-200/50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-800">{page.page || 'Unknown Page'}</h4>
                            <p className="text-sm text-slate-500">{page.route || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-800">{formatNumber(totalEngagement)}</div>
                          <div className="text-sm text-slate-600">Total Engagement</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Views</p>
                          <p className="text-xl font-bold text-slate-800">{formatNumber(page.views)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Clicks</p>
                          <p className="text-xl font-bold text-blue-600">{formatNumber(page.clicks)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Actions</p>
                          <p className="text-xl font-bold text-green-600">{formatNumber(page.actions)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Registrations</p>
                          <p className="text-xl font-bold text-pink-600">{formatNumber(page.registrations)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                          <span>Engagement Breakdown</span>
                          <span>{page.uniqueIPs} IPs · {page.uniqueUsers} Users</span>
                        </div>
                        <div className="flex h-2 rounded-full overflow-hidden">
                          {page.views > 0 && (
                            <div
                              className="bg-blue-500"
                              style={{ width: `${(page.views / totalEngagement) * 100}%` }}
                            ></div>
                          )}
                          {page.clicks > 0 && (
                            <div
                              className="bg-amber-500"
                              style={{ width: `${(page.clicks / totalEngagement) * 100}%` }}
                            ></div>
                          )}
                          {page.actions > 0 && (
                            <div
                              className="bg-green-500"
                              style={{ width: `${(page.actions / totalEngagement) * 100}%` }}
                            ></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {ipStats.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600">No IP statistics available</p>
                </div>
              ) : (
                ipStats.slice(0, 20).map((stat, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-6 border border-slate-200/50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-800 font-mono">{stat.ipAddress}</h4>
                          {stat.location && (stat.location.city || stat.location.country) && (
                            <p className="text-sm text-slate-500">
                              {stat.location.city ? `${stat.location.city}, ` : ''}
                              {stat.location.country || ''}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-800">{formatNumber(stat.totalEvents)}</div>
                        <div className="text-sm text-slate-600">Total Events</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Views</p>
                        <p className="text-lg font-bold text-green-600">{formatNumber(stat.views)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Clicks</p>
                        <p className="text-lg font-bold text-blue-600">{formatNumber(stat.clicks)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Actions</p>
                        <p className="text-lg font-bold text-purple-600">{formatNumber(stat.actions)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

