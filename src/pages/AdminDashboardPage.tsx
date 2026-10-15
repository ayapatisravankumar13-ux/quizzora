import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Users, CheckCircle2, Clock, Award, Download, Search,
  RefreshCw, Settings, FileText, Trash2, KeyRound, Check, Eye,
  ArrowUpDown, Filter, Smartphone, Laptop, UserPlus, X, HelpCircle, XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QuizAttempt, AuditLogEntry, QuizSettings, AdminMember, QuestionAttemptDetail } from '../types/quiz';

interface AdminDashboardPageProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user, isAdmin, adminEmail, adminName, loading, signOutAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'submissions' | 'team' | 'settings' | 'audit'>('submissions');
  const [stats, setStats] = useState({
    totalRegisteredStudents: 0,
    totalAttempts: 0,
    submittedCount: 0,
    inProgressCount: 0,
    averageScore: 0,
    highestScore: 0,
    quizStatus: 'Open',
    accessCode: 'QUIZ2025',
    durationMinutes: 30,
    totalAdminMembers: 10
  });

  const [submissions, setSubmissions] = useState<(QuizAttempt & { rank?: number | null })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score_desc');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Settings State
  const [settingsForm, setSettingsForm] = useState<Partial<QuizSettings>>({
    quizTitle: 'Quizzora Python & Technology Quiz',
    accessCode: 'QUIZ2025',
    adminPasskey: 'ADMIN2025',
    isOpen: true,
    durationMinutes: 30,
    allowReviewAfterClose: false
  });
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [passkeyCopied, setPasskeyCopied] = useState(false);

  // 10 Admin Members State
  const [adminMembers, setAdminMembers] = useState<AdminMember[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'super_admin'>('admin');
  const [memberActionError, setMemberActionError] = useState<string | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Detailed Question-by-Question Breakdown Modal
  const [detailedAttempt, setDetailedAttempt] = useState<{
    attempt: QuizAttempt;
    breakdown: QuestionAttemptDetail[];
  } | null>(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  // Reset Attempt Modal
  const [resetRollNumber, setResetRollNumber] = useState<string | null>(null);
  const [resetReason, setResetReason] = useState('');

  const currentEmail = adminEmail || user?.email || 'ayapatisravankumar13@gmail.com';

  const fetchOverviewAndSubmissions = async () => {
    setIsRefreshing(true);
    try {
      const headers = { 'x-admin-email': currentEmail };

      const [resOverview, resSubmissions, resSettings, resMembers, resAudit] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch(`/api/admin/submissions?search=${encodeURIComponent(searchQuery)}&status=${statusFilter}&sortBy=${sortBy}`, { headers }),
        fetch('/api/admin/settings', { headers }),
        fetch('/api/admin/members', { headers }),
        fetch('/api/admin/audit-logs', { headers })
      ]);

      if (resOverview.ok) {
        const data = await resOverview.json();
        setStats(data);
      }
      if (resSubmissions.ok) {
        const data = await resSubmissions.json();
        setSubmissions(data.submissions || []);
      }
      if (resSettings.ok) {
        const data = await resSettings.json();
        setSettingsForm(data);
      }
      if (resMembers.ok) {
        const data = await resMembers.json();
        setAdminMembers(data.members || []);
      }
      if (resAudit.ok) {
        const data = await resAudit.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOverviewAndSubmissions();
    }
  }, [isAdmin, currentEmail, searchQuery, statusFilter, sortBy]);

  const viewAttemptDetails = async (attemptId: string) => {
    setLoadingBreakdown(true);
    try {
      const res = await fetch(`/api/admin/attempt-details/${attemptId}`, {
        headers: { 'x-admin-email': currentEmail }
      });
      if (res.ok) {
        const data = await res.json();
        setDetailedAttempt(data);
      }
    } catch (err) {
      console.error('Failed to fetch attempt details', err);
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': currentEmail
        },
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
        fetchOverviewAndSubmissions();
      }
    } catch {
      // ignore
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberActionError(null);
    try {
      const res = await fetch('/api/admin/members/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': currentEmail
        },
        body: JSON.stringify({
          email: newMemberEmail,
          name: newMemberName,
          role: newMemberRole
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddMemberModal(false);
        setNewMemberEmail('');
        setNewMemberName('');
        fetchOverviewAndSubmissions();
      } else {
        setMemberActionError(data.error || 'Failed to add member');
      }
    } catch (err) {
      setMemberActionError('Network error while adding member');
    }
  };

  const handleRemoveMember = async (email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from the admin team?`)) return;
    try {
      const res = await fetch('/api/admin/members/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': currentEmail
        },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        fetchOverviewAndSubmissions();
      }
    } catch {
      // ignore
    }
  };

  const handleResetAttempt = async () => {
    if (!resetRollNumber) return;
    try {
      const res = await fetch('/api/admin/reset-attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': currentEmail
        },
        body: JSON.stringify({
          rollNumber: resetRollNumber,
          reason: resetReason || 'Manual admin reset'
        })
      });
      if (res.ok) {
        setResetRollNumber(null);
        setResetReason('');
        fetchOverviewAndSubmissions();
      }
    } catch {
      // ignore
    }
  };

  const handleExportCSV = () => {
    const url = `/api/admin/export-csv`;
    fetch(url, { headers: { 'x-admin-email': currentEmail } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `Quizzora_All_Participants_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  };

  const copyPasskey = () => {
    if (settingsForm.adminPasskey) {
      navigator.clipboard.writeText(settingsForm.adminPasskey);
      setPasskeyCopied(true);
      setTimeout(() => setPasskeyCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Verifying administrator permissions...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    onNavigate('access-denied');
    return null;
  }

  return (
    <div className="flex-1 bg-slate-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-700 text-white flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  Quizzora Organizer Dashboard
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  10 Committee Members Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Logged in as <span className="font-semibold text-slate-800">{adminName || currentEmail}</span> ({currentEmail})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={fetchOverviewAndSubmissions}
              disabled={isRefreshing}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Analytics Highlights Grid (Responsive on Mobile and PC) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Submissions</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.submittedCount}</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Graded & Recorded
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.inProgressCount}</p>
            <p className="text-[10px] text-indigo-600 font-semibold mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Live timers
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Score</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {stats.averageScore} <span className="text-xs font-bold text-slate-400">/ 30</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {stats.submittedCount ? Math.round((stats.averageScore / 30) * 100) : 0}% mean score
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Score</p>
            <p className="text-2xl font-black text-indigo-700 mt-1">
              {stats.highestScore} <span className="text-xs font-bold text-slate-400">/ 30</span>
            </p>
            <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Leader mark</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Access Code</p>
            <p className="text-lg font-mono font-black text-purple-700 mt-1 truncate">
              {stats.accessCode}
            </p>
            <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Candidate key</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Admin Passkey</p>
            <p className="text-lg font-mono font-black text-slate-800 mt-1 truncate">
              {settingsForm.adminPasskey || 'ADMIN2025'}
            </p>
            <button
              onClick={copyPasskey}
              className="text-[10px] text-indigo-600 font-semibold hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
            >
              {passkeyCopied ? 'Copied to clipboard!' : 'Copy mobile passkey'}
            </button>
          </div>
        </div>

        {/* Tab Controls (Horizontally Scrollable on Mobile) */}
        <div className="flex border-b border-slate-200 overflow-x-auto gap-2 sm:gap-6 pb-px scrollbar-none">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'submissions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Participant Results ({submissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'team'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Team ({adminMembers.length}/10 Members)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Quiz Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>

        {/* TAB 1: ALL PARTICIPANT RESULTS (DUAL DESKTOP & MOBILE RESPONSIVE) */}
        {activeTab === 'submissions' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Search, Filter, and Sort Toolbar */}
            <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Roll No, Candidate Name, or Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-base sm:text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="submitted">Submitted Only</option>
                    <option value="in_progress">In Progress</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="score_desc">Rank (High Score First)</option>
                    <option value="score_asc">Lowest Score First</option>
                    <option value="roll">Roll Number (A-Z)</option>
                    <option value="time">Fastest Completion</option>
                    <option value="latest">Latest Activity</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {submissions.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">No Participant Records Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {searchQuery
                    ? `No students matching "${searchQuery}". Try clearing your search.`
                    : 'As soon as students enter their details and take the quiz, their progress and scores will appear here in real-time.'}
                </p>
              </div>
            ) : (
              <>
                {/* MOBILE VIEW: APP-LIKE CARDS (Visible on phones & small tablets) */}
                <div className="block sm:hidden divide-y divide-slate-100">
                  {submissions.map((sub) => {
                    const isSubmitted = sub.status === 'submitted';
                    const score = sub.score ?? 0;
                    const percentage = sub.percentage ?? 0;

                    return (
                      <div key={sub.attemptId} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {sub.rank && (
                              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center">
                                #{sub.rank}
                              </span>
                            )}
                            <div>
                              <p className="font-extrabold text-slate-900 text-sm leading-tight">
                                {sub.studentName}
                              </p>
                              <p className="font-mono text-xs font-bold text-blue-700">
                                {sub.studentRoll}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-lg font-black text-indigo-900">
                              {isSubmitted ? `${score}/30` : '—'}
                            </span>
                            {isSubmitted && (
                              <span className="block text-[11px] font-bold text-indigo-600">
                                {percentage}%
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSubmitted ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isSubmitted ? 'bg-emerald-600' : 'bg-indigo-600'}`} />
                              {isSubmitted ? 'Submitted' : 'In Progress'}
                            </span>
                            <span>{sub.timeTakenSeconds ? `${Math.floor(sub.timeTakenSeconds / 60)}m ${sub.timeTakenSeconds % 60}s` : 'Active'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSubmitted && (
                              <button
                                onClick={() => viewAttemptDetails(sub.attemptId)}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>30 Qs</span>
                              </button>
                            )}
                            <button
                              onClick={() => setResetRollNumber(sub.studentRoll)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="Reset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DESKTOP VIEW: FULL TABLE (Visible on laptops & desktops) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-100/80 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-center">Rank</th>
                        <th className="px-4 py-3">Roll Number</th>
                        <th className="px-4 py-3">Student Candidate</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Score (/30)</th>
                        <th className="px-4 py-3">Percentage</th>
                        <th className="px-4 py-3">Time Taken</th>
                        <th className="px-4 py-3">Submission Receipt</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {submissions.map((sub) => {
                        const isSubmitted = sub.status === 'submitted';
                        return (
                          <tr key={sub.attemptId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5 text-center">
                              {sub.rank ? (
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                                  sub.rank === 1
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : sub.rank === 2
                                    ? 'bg-slate-200 text-slate-800'
                                    : sub.rank === 3
                                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  #{sub.rank}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 font-mono font-bold text-blue-700">
                              {sub.studentRoll}
                            </td>
                            <td className="px-4 py-3.5 font-medium text-slate-900">
                              <div>{sub.studentName}</div>
                              <div className="text-[11px] text-slate-400">{sub.studentEmail}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                isSubmitted ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isSubmitted ? 'bg-emerald-600' : 'bg-indigo-600'}`} />
                                {isSubmitted ? 'Submitted' : 'In Progress'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-black text-slate-900 text-base">
                              {sub.score !== undefined ? sub.score : '—'}
                            </td>
                            <td className="px-4 py-3.5 font-bold text-indigo-700">
                              {sub.percentage !== undefined ? `${sub.percentage}%` : '—'}
                            </td>
                            <td className="px-4 py-3.5 text-slate-600">
                              {sub.timeTakenSeconds ? `${Math.floor(sub.timeTakenSeconds / 60)}m ${sub.timeTakenSeconds % 60}s` : 'Active'}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs text-slate-500">
                              {sub.submissionReceipt || '—'}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isSubmitted && (
                                  <button
                                    onClick={() => viewAttemptDetails(sub.attemptId)}
                                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Review</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => setResetRollNumber(sub.studentRoll)}
                                  title="Reset Attempt"
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: 10 ADMIN COMMITTEE MEMBERS ROSTER */}
        {activeTab === 'team' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">
                    Competition Committee (10 Admin Members)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                    {adminMembers.length} / 10 Allocated
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  All 10 members can log in on both mobile phones and laptops using Google or the Committee Passkey.
                </p>
              </div>

              {adminMembers.length < 10 && (
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Admin Member</span>
                </button>
              )}
            </div>

            {/* Members Grid / List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {adminMembers.map((member, idx) => {
                const isPrimary = member.email === 'ayapatisravankumar13@gmail.com';
                return (
                  <div
                    key={member.id || idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                          {isPrimary && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                              Lead
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-purple-800">{member.email}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Role: <span className="capitalize text-slate-600 font-medium">{member.role.replace('_', ' ')}</span>
                        </p>
                      </div>
                    </div>

                    {!isPrimary && (
                      <button
                        onClick={() => handleRemoveMember(member.email)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sharing Instructions */}
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-purple-950 flex items-center gap-1.5 mb-0.5">
                  <KeyRound className="w-4 h-4 text-purple-700" />
                  Common Committee Passkey for Mobile Login
                </p>
                <span>
                  Committee members can sign in on their phones at <code className="bg-purple-100 px-1.5 py-0.5 rounded font-mono">/admin/login</code> with their registered email and passkey: <strong className="font-mono text-purple-900">{settingsForm.adminPasskey || 'ADMIN2025'}</strong>
                </span>
              </div>
              <button
                onClick={copyPasskey}
                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs shrink-0 cursor-pointer hover:bg-purple-700"
              >
                {passkeyCopied ? 'Copied!' : 'Copy Passkey'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: QUIZ SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-8">
            <h2 className="text-lg font-black text-slate-900 mb-1">Competition Settings</h2>
            <p className="text-xs text-slate-500 mb-6">
              Configure student access codes, committee passkeys, quiz availability, and timer parameters.
            </p>

            {settingsSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Settings updated successfully. Live across all candidate devices.
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={settingsForm.quizTitle || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, quizTitle: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Student Access Code
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.accessCode || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, accessCode: e.target.value })}
                    className="w-full px-4 py-2.5 font-mono text-sm uppercase bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Given to students for entrance</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Admin Security Passkey
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.adminPasskey || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, adminPasskey: e.target.value })}
                    className="w-full px-4 py-2.5 font-mono text-sm uppercase bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Used by 10 committee members</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quiz Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settingsForm.durationMinutes || 30}
                  onChange={(e) => setSettingsForm({ ...settingsForm, durationMinutes: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 space-y-3">
                <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={settingsForm.isOpen ?? true}
                    onChange={(e) => setSettingsForm({ ...settingsForm, isOpen: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      Quiz Open for Student Submissions
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Uncheck to immediately close candidate entrances.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={settingsForm.allowReviewAfterClose ?? false}
                    onChange={(e) => setSettingsForm({ ...settingsForm, allowReviewAfterClose: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      Enable Answer Key Review After Quiz Closes
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Allows candidates to see full question explanations after completion.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-black text-slate-900 mb-1">Administrative Audit Logs</h2>
            <p className="text-xs text-slate-500 mb-4">
              Immutable trail of configuration modifications, submissions, and attempt resets.
            </p>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div>
                    <span className="font-mono font-bold text-indigo-700 uppercase px-1.5 py-0.5 rounded bg-indigo-50 mr-2">
                      {log.action}
                    </span>
                    <span className="text-slate-800">{log.details}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    By: <span className="text-slate-600 font-medium">{log.performedBy}</span> • {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DETAILED QUESTION-BY-QUESTION REVIEW MODAL */}
      {detailedAttempt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  Participant Exam Review (All 30 Questions)
                </h3>
                <p className="text-xs text-slate-500">
                  {detailedAttempt.attempt.studentName} ({detailedAttempt.attempt.studentRoll}) • Score: <strong className="text-indigo-700">{detailedAttempt.attempt.score}/30 ({detailedAttempt.attempt.percentage}%)</strong>
                </p>
              </div>
              <button
                onClick={() => setDetailedAttempt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions List */}
            <div className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
              {detailedAttempt.breakdown.map((q) => (
                <div
                  key={q.id}
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm ${
                    q.isCorrect
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : q.selectedAnswer
                      ? 'border-rose-200 bg-rose-50/40'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-bold text-slate-900">
                      Q{q.id}. {q.question}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                      q.isCorrect
                        ? 'bg-emerald-600 text-white'
                        : q.selectedAnswer
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {q.isCorrect ? '+1 CORRECT' : q.selectedAnswer ? '0 INCORRECT' : '0 UNANSWERED'}
                    </span>
                  </div>

                  {q.codeSnippet && (
                    <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto my-2">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div>
                      <span className="text-slate-500">Candidate Chose: </span>
                      <strong className={`font-mono ${q.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {q.selectedAnswer ? `Option ${q.selectedAnswer}` : 'None (Unanswered)'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Correct Answer: </span>
                      <strong className="font-mono text-emerald-800">Option {q.correctAnswer}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setDetailedAttempt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ADMIN MEMBER MODAL */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-2">
              Add Committee Admin Member
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Add a faculty or coordinator email. The member can then log in using Google or the committee passkey.
            </p>

            {memberActionError && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl mb-3">
                {memberActionError}
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Member Email:
                </label>
                <input
                  type="email"
                  required
                  placeholder="faculty@college.edu"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Member Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Prof. John Smith"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role:
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  <option value="admin">Administrator / Evaluator</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-xs"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET ATTEMPT CONFIRMATION MODAL */}
      {resetRollNumber && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-2">
              Reset Attempt for {resetRollNumber}?
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              This will remove the current attempt for this candidate and allow them to take the quiz again.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Reset:
              </label>
              <input
                type="text"
                placeholder="e.g. Device failure reported to proctor"
                value={resetReason}
                onChange={(e) => setResetReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setResetRollNumber(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAttempt}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
