import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X, Filter, Download, Trash2, RefreshCw, Search, Zap, ChevronDown, ChevronUp, Copy, CopyCheck } from 'lucide-react';
import io from 'socket.io-client';

const Terminal = () => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [copiedLogs, setCopiedLogs] = useState(new Set());
  const [showAllMeta, setShowAllMeta] = useState(false);
  const socketRef = useRef(null);
  const logsEndRef = useRef(null);
  const logsContainerRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Terminal connected to server');
      setIsConnected(true);
      socket.emit('join-admin-terminal');
    });

    socket.on('disconnect', () => {
      console.log('❌ Terminal disconnected');
      setIsConnected(false);
    });

    socket.on('log', (log) => {
      setLogs(prev => [log, ...prev].slice(0, 1000)); // Keep last 1000 logs
    });

    socket.on('clear', () => {
      setLogs([]);
    });

    // Fetch initial logs
    fetchLogs();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/terminal/logs?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLogs(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const clearLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      await fetch(`${API_URL}/api/terminal/clear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setLogs([]);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const downloadLogs = () => {
    const logsText = filteredLogs.map(log => 
      `[${new Date(log.timestamp).toISOString()}] [${log.level.toUpperCase()}] ${log.message}${log.meta ? ' ' + JSON.stringify(log.meta, null, 2) : ''}`
    ).join('\n\n');

    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpanded = (logId) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const copyLog = (log) => {
    const logText = `[${new Date(log.timestamp).toISOString()}] [${log.level.toUpperCase()}] ${log.message}${log.meta ? '\n' + JSON.stringify(log.meta, null, 2) : ''}`;
    copyToClipboard(logText);
    
    const newCopied = new Set(copiedLogs);
    newCopied.add(log.id);
    setCopiedLogs(newCopied);
    
    setTimeout(() => {
      const updatedCopied = new Set(copiedLogs);
      updatedCopied.delete(log.id);
      setCopiedLogs(updatedCopied);
    }, 2000);
  };

  const formatMeta = (meta) => {
    if (!meta) return null;
    
    // Handle arrays
    if (Array.isArray(meta)) {
      if (meta.length === 0) return null;
      try {
        return JSON.stringify(meta, null, 2);
      } catch (e) {
        return meta.join(', ');
      }
    }
    
    // Handle objects
    if (typeof meta === 'object') {
      const keys = Object.keys(meta);
      if (keys.length === 0) return null;
      try {
        return JSON.stringify(meta, null, 2);
      } catch (e) {
        return String(meta);
      }
    }
    
    // Handle primitives
    return String(meta);
  };

  const toggleAllMeta = () => {
    if (showAllMeta) {
      // Collapse all
      setExpandedLogs(new Set());
      setShowAllMeta(false);
    } else {
      // Expand all logs with meta
      const allIds = filteredLogs
        .filter(log => {
          if (!log.meta) return false;
          if (Array.isArray(log.meta)) return log.meta.length > 0;
          if (typeof log.meta === 'object') return Object.keys(log.meta).length > 0;
          return true;
        })
        .map(log => log.id);
      setExpandedLogs(new Set(allIds));
      setShowAllMeta(true);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !JSON.stringify(log.meta).toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const levelConfig = {
    info: { 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-900/20', 
      border: 'border-cyan-500/30',
      icon: '🔵'
    },
    success: { 
      color: 'text-green-400', 
      bg: 'bg-green-900/20', 
      border: 'border-green-500/30',
      icon: '✅'
    },
    warning: { 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-900/20', 
      border: 'border-yellow-500/30',
      icon: '⚠️'
    },
    error: { 
      color: 'text-red-400', 
      bg: 'bg-red-900/20', 
      border: 'border-red-500/30',
      icon: '❌'
    }
  };

  const stats = {
    total: logs.length,
    info: logs.filter(l => l.level === 'info').length,
    success: logs.filter(l => l.level === 'success').length,
    warning: logs.filter(l => l.level === 'warning').length,
    error: logs.filter(l => l.level === 'error').length,
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Live Terminal</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">Real-time server logs and monitoring</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs md:text-sm font-semibold">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200">
          <div className="text-2xl font-black text-slate-700">{stats.total}</div>
          <div className="text-xs text-slate-600 font-medium">Total Logs</div>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl border border-cyan-200">
          <div className="text-2xl font-black text-cyan-700">{stats.info}</div>
          <div className="text-xs text-cyan-600 font-medium">Info</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="text-2xl font-black text-green-700">{stats.success}</div>
          <div className="text-xs text-green-600 font-medium">Success</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
          <div className="text-2xl font-black text-yellow-700">{stats.warning}</div>
          <div className="text-xs text-yellow-600 font-medium">Warnings</div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
          <div className="text-2xl font-black text-red-700">{stats.error}</div>
          <div className="text-xs text-red-600 font-medium">Errors</div>
        </div>
      </div>

      {/* Terminal Window */}
      <div className="bg-slate-900 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="bg-slate-800 px-3 md:px-4 py-3 border-b border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center space-x-2">
              <TerminalIcon className="w-4 h-4 text-green-400" />
              <span className="text-white font-mono text-xs md:text-sm truncate">admin@ghumakkars:~/logs</span>
            </div>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2 flex-wrap md:flex-nowrap">
            {/* Search */}
            <div className="relative w-full md:w-48">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="bg-slate-700 text-white pl-9 pr-3 py-1.5 rounded-lg text-sm border border-slate-600 focus:border-blue-500 focus:outline-none w-full"
              />
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>

            {/* Auto-scroll */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`p-2 rounded-lg transition-colors ${
                autoScroll 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              title="Auto-scroll"
            >
              <Zap className="w-4 h-4" />
            </button>

            {/* Refresh */}
            <button
              onClick={fetchLogs}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Expand/Collapse All Meta */}
            <button
              onClick={toggleAllMeta}
              className={`p-2 rounded-lg transition-colors ${
                showAllMeta
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              title={showAllMeta ? "Collapse all meta" : "Expand all meta"}
            >
              {showAllMeta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Download */}
            <button
              onClick={downloadLogs}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Download logs"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Clear */}
            <button
              onClick={clearLogs}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Logs Container */}
        <div 
          ref={logsContainerRef}
          className="h-[400px] md:h-[500px] lg:h-[600px] overflow-y-auto p-4 space-y-1 font-mono text-sm custom-scrollbar"
        >
          <AnimatePresence>
            {filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <TerminalIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-semibold">No logs to display</p>
                  <p className="text-sm mt-2">Waiting for server activity...</p>
                </div>
              </div>
            ) : (
              filteredLogs.map((log, index) => {
                const config = levelConfig[log.level] || levelConfig.info;
                const isExpanded = expandedLogs.has(log.id);
                const isCopied = copiedLogs.has(log.id);
                const hasMeta = log.meta && (
                  (typeof log.meta === 'object' && Object.keys(log.meta).length > 0) ||
                  (Array.isArray(log.meta) && log.meta.length > 0)
                );
                const metaFormatted = hasMeta ? formatMeta(log.meta) : null;
                
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-lg border ${config.bg} ${config.border} hover:bg-slate-800/50 transition-colors overflow-hidden`}
                  >
                    <div className="flex flex-col md:flex-row md:space-x-2 items-start p-2 gap-2 md:gap-0">
                      <div className="flex space-x-2 w-full md:w-auto">
                        <span className="text-slate-500 text-xs whitespace-nowrap min-w-[60px] md:min-w-[80px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`${config.color} font-bold uppercase text-xs whitespace-nowrap flex items-center space-x-1 md:min-w-[90px]`}>
                          <span>{config.icon}</span>
                          <span>[{log.level}]</span>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-slate-300 break-words block">{log.message}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {hasMeta && (
                          <button
                            onClick={() => toggleExpanded(log.id)}
                            className="p-1 hover:bg-slate-700 rounded transition-colors"
                            title={isExpanded ? "Collapse" : "Expand meta"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => copyLog(log)}
                          className="p-1 hover:bg-slate-700 rounded transition-colors"
                          title={isCopied ? "Copied!" : "Copy log"}
                        >
                          {isCopied ? (
                            <CopyCheck className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {isExpanded && hasMeta && metaFormatted && (
                      <div className="px-2 pb-2">
                        <div className="bg-slate-800 rounded p-3 border border-slate-600">
                          <div className="text-xs text-slate-400 mb-1 font-semibold uppercase">Meta Data:</div>
                          <pre className="text-slate-300 text-xs whitespace-pre-wrap break-words font-mono overflow-x-auto">
                            {metaFormatted}
                          </pre>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <TerminalIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Live Terminal Information</h3>
            <p className="text-sm text-blue-700">
              This terminal shows real-time server logs. Connection is maintained automatically. 
              Logs are streamed via WebSocket and will never disconnect. Filter by level or search for specific events.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
};

export default Terminal;

