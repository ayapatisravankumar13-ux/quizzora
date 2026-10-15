import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Users, CheckCircle2, Clock, Award, Download, Search,
  RefreshCw, Settings, FileText, AlertCircle, Trash2, KeyRound, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QuizAttempt, AuditLogEntry, QuizSettings } from '../types/quiz';

interface AdminDashboardPageProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user, isAdmin, loading, signOutAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'submissions' | 'settings' | 'audit'>('submissions');
  const [stats, setStats] = useState({
    totalRegisteredStudents: 0,
    totalAttempts: 0,
    submittedCount: 0,
    inProgressCount: 0,
    averageScore: 0,
    highestScore: 0,
    quizStatus: 'Open',
    accessCode: 'QUIZ2025',
    durationMinutes: 30
  });

  const [submissions, setSubmissions] = useState<QuizAttempt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Settings State
  const [settingsForm, setSettingsForm] = useState<Partial<QuizSettings>>({
    quizTitle: 'Quizzora Python & Technology Quiz',
    accessCode: 'QUIZ2025',
    isOpen: true,
    durationMinutes: 30,
    allowReviewAfterClose: false
  });
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Selected Student Detail Modal
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);

  // Reset Attempt Modal
  const [resetRollNumber, setResetRollNumber] = useState<string | null>(null);
  const [resetReason, setResetReason] = useState('');

  const adminEmail = user?.email || 'ayapatisravankumar13@gmail.com';

  const fetchOverviewAndSubmissions = async () => {
    setIsRefreshing(true);
    try {
      const headers = { 'x-admin-email': adminEmail };

      const [resOverview, resSubmissions, resSettings, resAudit] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch(`/api/admin/submissions?search=${encodeURIComponent(searchQuery)}&status=${statusFilter}`, { headers }),
        fetch('/api/admin/settings', { headers }),
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
    if (isAdmin && user) {
      fetchOverviewAndSubmissions();
    }
  }, [isAdmin, user, searchQuery, statusFilter]);

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

  if (!user || !isAdmin) {
    onNavigate('access-denied');
    return null;
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail
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

  const handleResetAttempt = async () => {
    if (!resetRollNumber) return;
    try {
      const res = await fetch('/api/admin/reset-attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail
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
    fetch(url, { headers: { 'x-admin-email': adminEmail } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `Quizzora_Marks_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  };

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Title Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Quizzora Organizer Dashboard
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  Faculty Control
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Logged in as <span className="font-semibold text-slate-700">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={fetchOverviewAndSubmissions}
              disabled={isRefreshing}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Analytics Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submissions</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.submittedCount}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Evaluated
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.inProgressCount}</p>
            <p className="text-[11px] text-indigo-600 font-semibold mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Active timers
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Score</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.averageScore} <span className="text-xs font-bold text-slate-400">/ 30</span></p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats.submittedCount ? Math.round((stats.averageScore / 30) * 100) : 0}% mean
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Score</p>
            <p className="text-2xl font-black text-indigo-700 mt-1">{stats.highestScore} <span className="text-xs font-bold text-slate-400">/ 30</span></p>
            <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">Leader record</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quiz Status</p>
            <p className="text-xl font-black text-slate-900 mt-1.5 flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${stats.quizStatus === 'Open' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {stats.quizStatus}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Submissions active</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Access Code</p>
            <p className="text-xl font-mono font-black text-purple-700 mt-1.5 truncate">
              {stats.accessCode}
            </p>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">Common event key</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'submissions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Submissions & Marks ({submissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Competition Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>

        {/* Tab 1: Submissions & Marks Table */}
        {activeTab === 'submissions' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Search and Filters Bar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Roll No, Name, or Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted Only</option>
                  <option value="in_progress">In Progress Only</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Roll Number</th>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Score (/30)</th>
                    <th className="px-5 py-3">Percentage</th>
                    <th className="px-5 py-3">Time Taken</th>
                    <th className="px-5 py-3">Submitted At</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">
                        No student attempts match your criteria. As students take the quiz, records will appear here automatically.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => {
                      const submittedDate = sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                      return (
                        <tr key={sub.attemptId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-bold text-blue-700">
                            {sub.studentRoll}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-900">
                            <div>{sub.studentName}</div>
                            <div className="text-[11px] text-slate-400">{sub.studentEmail}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              sub.status === 'submitted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'submitted' ? 'bg-emerald-600' : 'bg-indigo-600'}`} />
                              {sub.status === 'submitted' ? 'Submitted' : 'In Progress'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-black text-slate-900 text-base">
                            {sub.score !== undefined ? sub.score : '—'}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-indigo-700">
                            {sub.percentage !== undefined ? `${sub.percentage}%` : '—'}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {sub.timeTakenSeconds ? `${Math.floor(sub.timeTakenSeconds / 60)}m ${sub.timeTakenSeconds % 60}s` : 'Active'}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs">
                            {submittedDate}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {sub.status === 'submitted' && (
                                <button
                                  onClick={() => setSelectedAttempt(sub)}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                >
                                  Details
                                </button>
                              )}
                              <button
                                onClick={() => setResetRollNumber(sub.studentRoll)}
                                title="Reset Attempt (Authorized Action)"
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Settings Configuration */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-black text-slate-900 mb-1">Competition Settings</h2>
            <p className="text-xs text-slate-500 mb-6">
              Configure the active access code, quiz status, and attempt rules for all candidates.
            </p>

            {settingsSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Settings updated successfully. Changes are live across the portal.
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Common Quiz Access Code
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.accessCode || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, accessCode: e.target.value })}
                  className="w-full px-4 py-2.5 font-mono text-sm uppercase bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Students must enter this exact code to proceed to the exam instructions.
                </p>
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
                      Quiz Open for Submissions
                    </span>
                    <p className="text-[11px] text-slate-500">
                      When unchecked, students cannot enter the access code or begin new attempts.
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
                      Allow Answer Key Review After Quiz Closes
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Students can only see full question explanations once the organizer enables this setting.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-98"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Audit Trail */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
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

      {/* Student Attempt Details Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Student Score Breakdown</h3>
                <p className="text-xs text-slate-500">Roll: {selectedAttempt.studentRoll}</p>
              </div>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <p className="text-slate-500 text-xs">Final Score</p>
                  <p className="text-2xl font-black text-indigo-900">{selectedAttempt.score} / 30</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <p className="text-slate-500 text-xs">Percentage</p>
                  <p className="text-2xl font-black text-purple-900">{selectedAttempt.percentage}%</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 text-slate-700">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Full Name:</span>
                  <span className="font-semibold text-slate-900">{selectedAttempt.studentName}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span>{selectedAttempt.studentEmail}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Correct Answers:</span>
                  <span className="font-bold text-emerald-600">{selectedAttempt.correctCount}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Incorrect Answers:</span>
                  <span className="font-bold text-rose-600">{selectedAttempt.incorrectCount}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Unanswered:</span>
                  <span>{selectedAttempt.unansweredCount}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Time Taken:</span>
                  <span>{selectedAttempt.timeTakenSeconds}s</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Submission Receipt:</span>
                  <span className="font-mono text-xs font-bold text-indigo-700">{selectedAttempt.submissionReceipt}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAttempt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Attempt Confirmation Modal */}
      {resetRollNumber && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-2">
              Reset Attempt for {resetRollNumber}?
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              This will remove any existing submitted or in-progress attempt for this student and permit them to start a fresh attempt. This action is permanently recorded in the audit log.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Reset:
              </label>
              <input
                type="text"
                placeholder="e.g. Device power failure reported to proctor"
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
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
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
