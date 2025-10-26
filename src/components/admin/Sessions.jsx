const Sessions = () => {
  return (
    <div className="space-y-8" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Page Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Manage Sessions</h1>
            <p className="text-slate-600 mt-2 font-medium">Monitor and manage user sessions, login activities, and security.</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold">
            Terminate All
          </button>
        </div>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Active Sessions</p>
              <p className="text-2xl font-bold text-slate-800">23</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Today's Logins</p>
              <p className="text-2xl font-bold text-slate-800">45</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Failed Attempts</p>
              <p className="text-2xl font-bold text-slate-800">7</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Unique Devices</p>
              <p className="text-2xl font-bold text-slate-800">18</p>
            </div>
          </div>
        </div>
      </div>

      {/* Session Management Placeholder */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Session Management</h3>
              <p className="text-slate-600 text-sm font-medium mt-1">Monitor user sessions and security activities</p>
            </div>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">23 Active</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">7 Failed</span>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Session Management System</h3>
          <p className="text-slate-600 mb-6">This section will contain comprehensive session monitoring and security features.</p>
          <div className="bg-slate-50 rounded-xl p-6 max-w-2xl mx-auto">
            <h4 className="font-semibold text-slate-800 mb-3">Planned Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Active user sessions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Login history tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Security monitoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <span>Session termination</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Failed login attempts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span>Device management</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sessions;
