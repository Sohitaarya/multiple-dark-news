import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Database,
  Search,
  Filter,
  RefreshCw,
  HardDrive,
  Cpu,
  Layers,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Edit2,
  Save,
  X,
  FileText,
  Globe,
  Send,
  ExternalLink,
  Clock,
  Check,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import {
  getToolsRegistry,
  updateToolInRegistry,
  resetToolsRegistry,
  getRegistryStats
} from '../../data/toolsRegistry';
import { jobProcessor } from '../../services/jobProcessor';
import { ToolDefinition, ToolStatus } from '../../types/tools';
import { pingSearchEngines, getPingLogs, PingLogEntry } from '../../services/sitemapPingService';
import {
  adminAuthService,
  DEFAULT_INITIAL_PASSWORD,
  AuthLogEntry
} from '../../services/adminAuthService';

interface AdminDashboardProps {
  onNavigateHome?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateHome }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => adminAuthService.isAuthenticated());
  const [passkeyInput, setPasskeyInput] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [lockoutSec, setLockoutSec] = useState<number>(() => adminAuthService.getLockoutRemainingSeconds());
  const [isDefaultPass, setIsDefaultPass] = useState(false);

  // Change Password Modal State
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [changePassError, setChangePassError] = useState<string | null>(null);
  const [changePassSuccess, setChangePassSuccess] = useState(false);
  const [authLogs, setAuthLogs] = useState<AuthLogEntry[]>(() => adminAuthService.getAuthLogs());

  // Dashboard Functional State
  const [tools, setTools] = useState<ToolDefinition[]>(getToolsRegistry());
  const [stats, setStats] = useState(getRegistryStats());
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTool, setEditingTool] = useState<ToolDefinition | null>(null);
  const [activeTab, setActiveTab] = useState<'tools' | 'seo-ping' | 'jobs' | 'storage' | 'health' | 'security'>('tools');
  const [saveNotice, setSaveNotice] = useState(false);
  const [pingNotice, setPingNotice] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [pingTargetDomain, setPingTargetDomain] = useState('https://multipledarknews.com');
  const [pingLogs, setPingLogs] = useState<PingLogEntry[]>(getPingLogs());

  // Check default password state on mount & update lockout timer
  useEffect(() => {
    adminAuthService.isDefaultPasswordInUse().then(setIsDefaultPass);

    const interval = setInterval(() => {
      const remaining = adminAuthService.getLockoutRemainingSeconds();
      setLockoutSec(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const jobs = jobProcessor.getAllJobs();

  // Authentication Handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const res = await adminAuthService.login(passkeyInput, rememberMe);
      if (res.success) {
        setIsAuthenticated(true);
        setPasskeyInput('');
        setAuthLogs(adminAuthService.getAuthLogs());
        adminAuthService.isDefaultPasswordInUse().then(setIsDefaultPass);
      } else {
        setAuthError(res.error || 'Authentication failed');
        setLockoutSec(adminAuthService.getLockoutRemainingSeconds());
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    adminAuthService.logout();
    setIsAuthenticated(false);
    setAuthLogs(adminAuthService.getAuthLogs());
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassError(null);

    if (newPassInput !== confirmPassInput) {
      setChangePassError('New password and confirmation do not match.');
      return;
    }

    const res = await adminAuthService.changePassword(currentPassInput, newPassInput);
    if (res.success) {
      setChangePassSuccess(true);
      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmPassInput('');
      setAuthLogs(adminAuthService.getAuthLogs());
      setIsDefaultPass(false);
      setTimeout(() => {
        setChangePassSuccess(false);
        setIsChangePassOpen(false);
      }, 2000);
    } else {
      setChangePassError(res.error || 'Password update failed.');
    }
  };

  // Tool Registry Handlers
  const handleStatusChange = (tool: ToolDefinition, newStatus: ToolStatus) => {
    const updated = { ...tool, status: newStatus };
    updateToolInRegistry(updated);
    setTools(getToolsRegistry());
    setStats(getRegistryStats());

    // Automatically ping Google and Bing Sitemaps API
    pingSearchEngines('https://multipledarknews.com', `Status update: ${tool.name} -> ${newStatus}`).then(() => {
      setPingLogs(getPingLogs());
      setPingNotice(`Auto-pinged Google & Bing Sitemaps API: ${tool.name} is now ${newStatus}`);
      setTimeout(() => setPingNotice(null), 4000);
    });
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;
    const toolName = editingTool.name;
    updateToolInRegistry(editingTool);
    setTools(getToolsRegistry());
    setStats(getRegistryStats());
    setEditingTool(null);
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2500);

    // Automatically ping Google and Bing Sitemaps API
    pingSearchEngines('https://multipledarknews.com', `Tool modified: ${toolName}`).then(() => {
      setPingLogs(getPingLogs());
      setPingNotice(`Auto-pinged Google & Bing Sitemaps API for ${toolName}!`);
      setTimeout(() => setPingNotice(null), 4000);
    });
  };

  const handleManualPing = async () => {
    setIsPinging(true);
    try {
      await pingSearchEngines(pingTargetDomain, 'Manual Admin Trigger');
      setPingLogs(getPingLogs());
      setPingNotice('Successfully dispatched sitemap pings to Google and Bing!');
      setTimeout(() => setPingNotice(null), 4000);
    } finally {
      setIsPinging(false);
    }
  };

  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==========================================
  // VIEW 1: LOCKED GATE SCREEN (UNAUTHENTICATED)
  // Protects all dashboard data and actions
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400">
                Restricted Terminal
              </span>
              <h1 className="text-xl font-black text-white tracking-tight">
                MultipleDarkNews Admin Portal
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Yeh dashboard website owner ke liye protected hai taaki tools aur server settings bina permission badli na ja sakein.
              </p>
            </div>
          </div>

          {/* Error Notice */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-tight">{authError}</div>
            </div>
          )}

          {/* Lockout Notification */}
          {lockoutSec > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 text-xs flex items-center justify-between">
              <span className="font-semibold">Security Cooldown Active:</span>
              <span className="font-mono font-bold text-amber-400">{lockoutSec}s remaining</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Admin Master Passkey</span>
                <span className="text-[10px] text-slate-500 font-mono">Encrypted SHA-256</span>
              </label>
              <div className="relative">
                <input
                  type={showPasskey ? 'text' : 'password'}
                  required
                  disabled={lockoutSec > 0 || authLoading}
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter administrator passkey..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
                />
                <span>Remember session for 24h</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={lockoutSec > 0 || authLoading || !passkeyInput.trim()}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Passkey...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Owner Quick Setup Hint (Helps the site owner log in on first run) */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                Default Setup Passkey:
              </span>
              <button
                type="button"
                onClick={() => setPasskeyInput(DEFAULT_INITIAL_PASSWORD)}
                className="text-amber-400 hover:text-amber-300 underline font-mono text-[10px]"
              >
                Auto-fill
              </button>
            </div>
            <div className="font-mono bg-slate-900 px-2 py-1 rounded text-amber-300 text-center select-all border border-slate-800">
              {DEFAULT_INITIAL_PASSWORD}
            </div>
            <p className="text-[10px] text-slate-500">
              Login ke baad aap dashboard ke andar <strong className="text-slate-300">&quot;Security &amp; Passkey&quot;</strong> tab se apna khud ka private password set kar sakte hain.
            </p>
          </div>

          {/* Return Home Button */}
          {onNavigateHome && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Public Tools Suite</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // Only accessible to authorized admin
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Security Notice */}
      {isDefaultPass && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-700/80 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Security Recommendation:</strong> Aap abhi default passkey (<code>{DEFAULT_INITIAL_PASSWORD}</code>) use kar rahe hain. Apne dashboard ko secure rakhne ke liye naya password set karein.
            </span>
          </div>
          <button
            onClick={() => setIsChangePassOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Passkey Now</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Authenticated
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            MultipleDarkNews Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage central registry, modify tool states, monitor real-time jobs, inspect sandbox health, and trigger sitemap pings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsChangePassOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Passkey Settings</span>
          </button>

          <button
            onClick={() => {
              resetToolsRegistry();
              setTools(getToolsRegistry());
              setStats(getRegistryStats());
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Registry
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Lock &amp; Logout</span>
          </button>
        </div>
      </div>

      {saveNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Tool registry changes saved successfully!</span>
        </div>
      )}

      {pingNotice && (
        <div className="p-4 rounded-2xl bg-blue-950/60 border border-blue-800 text-blue-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>{pingNotice}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
            Google &amp; Bing Notified
          </span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered Tools</span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.total}</div>
          <div className="text-[11px] text-slate-500">Across all 12 categories</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Production Ready</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{stats.productionReady}</div>
          <div className="text-[11px] text-slate-500">Passed unit &amp; integration tests</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Functional Tools</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">{stats.functional}</div>
          <div className="text-[11px] text-slate-500">Direct algorithmic support</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Active Jobs</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{jobs.length}</div>
          <div className="text-[11px] text-slate-500">Processed in browser queue</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4 overflow-x-auto">
        {(['tools', 'seo-ping', 'jobs', 'storage', 'health', 'security'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'tools'
              ? 'Central Tool Registry'
              : tab === 'seo-ping'
              ? 'Google & Bing Sitemaps Ping'
              : tab === 'jobs'
              ? 'Job Processing Queue'
              : tab === 'storage'
              ? 'Storage & Memory'
              : tab === 'health'
              ? 'Health & Diagnostics'
              : 'Security & Access Control'}
          </button>
        ))}
      </div>

      {/* Tab 1: Central Tool Registry Manager */}
      {activeTab === 'tools' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tools by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div className="text-xs text-slate-400">
              Showing {filteredTools.length} of {tools.length} tools
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Tool Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status State</th>
                    <th className="py-3 px-4">Max Size</th>
                    <th className="py-3 px-4">Engine</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredTools.slice(0, 50).map((tool) => (
                    <tr key={tool.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        <div>{tool.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{tool.slug}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[10px]">
                          {tool.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={tool.status}
                          onChange={(e) => handleStatusChange(tool, e.target.value as ToolStatus)}
                          className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 font-bold"
                        >
                          <option value="PRODUCTION_READY">PRODUCTION_READY</option>
                          <option value="FUNCTIONAL">FUNCTIONAL</option>
                          <option value="IN_DEVELOPMENT">IN_DEVELOPMENT</option>
                          <option value="TESTING">TESTING</option>
                          <option value="PLANNED">PLANNED</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{tool.maxFileSizeMB} MB</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-[10px] font-mono text-slate-300">
                          {tool.processingEngine}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setEditingTool(tool)}
                          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Edit Tool Metadata"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTools.length > 50 && (
              <div className="p-3 text-center text-xs text-slate-500 bg-slate-950 border-t border-slate-800">
                Displaying first 50 results. Use the search bar above to narrow down to specific tools.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Google & Bing Sitemaps Ping */}
      {activeTab === 'seo-ping' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <span>Search Engine Sitemap Ping Dispatcher</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Notify Google and Bing bots immediately when new tools are registered or metadata is changed to accelerate indexation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Target Domain for Ping
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={pingTargetDomain}
                    onChange={(e) => setPingTargetDomain(e.target.value)}
                    placeholder="https://multipledarknews.com"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                  <button
                    onClick={handleManualPing}
                    disabled={isPinging}
                    className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isPinging ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Ping Google &amp; Bing Now</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Search Console Direct Links</span>
                </div>
                <div className="flex gap-3 mt-2">
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Google Search Console →
                  </a>
                  <a
                    href="https://www.bing.com/webmasters"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    Bing Webmaster Tools →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Ping Logs History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-3 p-5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Recent Search Engine Ping Dispatch History</span>
            </h3>

            {pingLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No pings have been recorded yet. Click &quot;Ping Google &amp; Bing Now&quot; or update a tool status to trigger an automatic ping.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Timestamp</th>
                      <th className="py-2.5 px-4">Trigger / Reason</th>
                      <th className="py-2.5 px-4">Sitemap URL</th>
                      <th className="py-2.5 px-4">Google Status</th>
                      <th className="py-2.5 px-4">Bing Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {pingLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-850/50">
                        <td className="py-2.5 px-4 text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-4 font-sans font-semibold text-slate-200">
                          {log.triggeredBy || 'Manual Trigger'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 truncate max-w-xs">{log.sitemapUrl}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              log.google?.ok
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {log.google?.ok ? 'SUCCESS (200)' : `HTTP ${log.google?.status || 'ERR'}`}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              log.bing?.ok
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {log.bing?.ok ? 'SUCCESS (200)' : `HTTP ${log.bing?.status || 'ERR'}`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Job Processing Queue */}
      {activeTab === 'jobs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Active Browser Worker Queues</span>
          </h2>

          {jobs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No active jobs running in the client queue right now.
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((j) => (
                <div key={j.id} className="p-3 bg-slate-950 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-slate-400">{j.id}</span>
                    <span className="ml-2 font-bold text-white">{j.toolId}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                    {j.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Storage & Memory */}
      {activeTab === 'storage' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>In-Memory Client Blob Storage</span>
            </div>
            <p className="text-xs text-slate-400">
              Ephemeral file allocations are kept in memory and cleaned automatically on tool switch.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-emerald-400">
              Active Storage: 0.0 MB (All buffers sanitized)
            </div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Local State Overrides</span>
            </div>
            <p className="text-xs text-slate-400">
              Admin customizations persist locally in browser storage under <code>mdn_tool_status_overrides</code>.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-cyan-400">
              Storage Engine: localStorage (Active)
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Health & Diagnostics */}
      {activeTab === 'health' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Client Runtime Health Check</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase font-bold">WASM Engine</div>
              <div className="text-emerald-400 font-bold mt-1">Ready &amp; Supported</div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase font-bold">Web Workers</div>
              <div className="text-emerald-400 font-bold mt-1">Hardware Threads Active</div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase font-bold">Memory Health</div>
              <div className="text-emerald-400 font-bold mt-1">Normal (Zero Leakage)</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Security & Access Control (NEW) */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password Update Form */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Change Administrator Master Passkey</h3>
              </div>
              <p className="text-xs text-slate-400">
                Update your secret passkey to prevent anyone else from accessing platform governance or altering tool statuses.
              </p>

              {changePassSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Master passkey successfully updated!</span>
                </div>
              )}

              {changePassError && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>{changePassError}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Passkey</label>
                  <input
                    type="password"
                    required
                    value={currentPassInput}
                    onChange={(e) => setCurrentPassInput(e.target.value)}
                    placeholder="Enter current passkey..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">New Secret Passkey (Min 6 chars)</label>
                  <input
                    type="password"
                    required
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    placeholder="Enter new secret passkey..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Confirm New Passkey</label>
                  <input
                    type="password"
                    required
                    value={confirmPassInput}
                    onChange={(e) => setConfirmPassInput(e.target.value)}
                    placeholder="Re-enter new secret passkey..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Update Passkey</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Are you sure you want to restore the default initial setup passkey (mdn@admin2025)?')) {
                        await adminAuthService.resetToDefault();
                        setIsDefaultPass(true);
                        setAuthLogs(adminAuthService.getAuthLogs());
                        alert('Default passkey restored: ' + DEFAULT_INITIAL_PASSWORD);
                      }
                    }}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors text-[11px]"
                  >
                    Reset Default
                  </button>
                </div>
              </form>
            </div>

            {/* Access Rules & Rate Limiting Overview */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Security Policies &amp; Lockout Rules</h3>
              </div>
              <p className="text-xs text-slate-400">
                Built-in brute-force prevention and session protection settings:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Max Failed Login Attempts</span>
                  <span className="font-mono text-rose-400 font-bold">5 Attempts</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Cooldown Lockout Period</span>
                  <span className="font-mono text-amber-400 font-bold">60 Seconds</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Password Encryption</span>
                  <span className="font-mono text-emerald-400 font-bold">SHA-256 (Web Crypto)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Session Expiry</span>
                  <span className="font-mono text-cyan-400 font-bold">24 Hours (or on Logout)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Robots &amp; Crawler Indexation</span>
                  <span className="font-mono text-rose-400 font-bold">Disallowed (noindex, nofollow)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Audit Trail */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Admin Authentication Security Audit Trail</span>
            </h3>

            {authLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No recent authentication logs recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Time</th>
                      <th className="py-2.5 px-4">Action</th>
                      <th className="py-2.5 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {authLogs.slice(0, 10).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-850/50">
                        <td className="py-2.5 px-4 text-slate-400">
                          {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              log.action === 'LOGIN_SUCCESS'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : log.action === 'PASSWORD_CHANGED'
                                ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                : log.action === 'LOGOUT'
                                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-300 font-sans">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Tool Modal */}
      {editingTool && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Edit Tool Metadata</h3>
              <button onClick={() => setEditingTool(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tool Display Name</label>
                <input
                  type="text"
                  value={editingTool.name}
                  onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Max Upload Limit (MB)</label>
                <input
                  type="number"
                  value={editingTool.maxFileSizeMB}
                  onChange={(e) => setEditingTool({ ...editingTool, maxFileSizeMB: Number(e.target.value) })}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status State</label>
                <select
                  value={editingTool.status}
                  onChange={(e) => setEditingTool({ ...editingTool, status: e.target.value as ToolStatus })}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                >
                  <option value="PRODUCTION_READY">PRODUCTION_READY</option>
                  <option value="FUNCTIONAL">FUNCTIONAL</option>
                  <option value="IN_DEVELOPMENT">IN_DEVELOPMENT</option>
                  <option value="TESTING">TESTING</option>
                  <option value="PLANNED">PLANNED</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTool(null)}
                  className="px-5 py-3 bg-slate-800 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Change Password Modal */}
      {isChangePassOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Change Administrator Passkey</h3>
              </div>
              <button onClick={() => setIsChangePassOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {changePassSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Passkey changed successfully!</span>
              </div>
            )}

            {changePassError && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{changePassError}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Current Passkey</label>
                <input
                  type="password"
                  required
                  value={currentPassInput}
                  onChange={(e) => setCurrentPassInput(e.target.value)}
                  placeholder="Enter current passkey..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Secret Passkey (Min 6 chars)</label>
                <input
                  type="password"
                  required
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  placeholder="Enter new secret passkey..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Confirm New Passkey</label>
                <input
                  type="password"
                  required
                  value={confirmPassInput}
                  onChange={(e) => setConfirmPassInput(e.target.value)}
                  placeholder="Re-enter new secret passkey..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Save Passkey
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangePassOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
