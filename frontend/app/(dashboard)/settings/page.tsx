'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { problemsService } from '@/services/problems';

function buildMarkdownExport(problems: Awaited<ReturnType<typeof problemsService.getProblems>>) {
  const lines: string[] = [
    '# CodeTrack AI export',
    '',
    `Total: ${problems.data.length}`,
    '',
  ];
  for (const p of problems.data) {
    lines.push(`## ${p.title}`);
    lines.push(`- **Platform:** ${p.platform} · **Difficulty:** ${p.difficulty}`);
    lines.push(`- **Topics:** ${p.topics.join(', ')}`);
    if (p.keyIntuition) lines.push(`- **Intuition:** ${p.keyIntuition}`);
    if (p.approaches?.bruteForceSolution?.description) {
      lines.push(`- **Brute:** ${p.approaches.bruteForceSolution.description}`);
    }
    if (p.approaches?.optimizedSolution?.description) {
      lines.push(`- **Optimal:** ${p.approaches.optimizedSolution.description}`);
    }
    if (p.mistakesMade?.length) {
      lines.push(`- **Mistakes:** ${p.mistakesMade.join('; ')}`);
    }
    if (p.edgeCases?.length) {
      lines.push(`- **Edges:** ${p.edgeCases.join('; ')}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [preferences, setPreferences] = useState({
    darkMode: false,
    emailNotifications: true,
    revisionReminders: true,
    timezone: 'UTC',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('theme');
    const dark =
      stored === 'dark' ||
      (!stored && document.documentElement.classList.contains('dark'));
    setPreferences((prev) => ({ ...prev, darkMode: dark }));
  }, []);

  const handlePreferenceChange = (key: string, value: unknown) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (key === 'darkMode' && typeof value === 'boolean') {
      document.documentElement.classList.toggle('dark', value);
      localStorage.setItem('theme', value ? 'dark' : 'light');
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsUpdating(true);
      toast.success('Display preferences stored locally (sync API can be added later).');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportMarkdown = async () => {
    try {
      setExporting(true);
      const all = await problemsService.getProblems({ page: 1, limit: 500 });
      const md = buildMarkdownExport(all);
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codetrack-export-${new Date().toISOString().slice(0, 10)}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Settings</h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      {/* User Profile */}
      <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">First Name</label>
              <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">{user?.firstName}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Last Name</label>
              <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">{user?.lastName}</p>
            </div>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Email</label>
            <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">{user?.email}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Username</label>
            <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Dark Mode</label>
            <input
              type="checkbox"
              checked={preferences.darkMode}
              onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Email Notifications</label>
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Revision Reminders</label>
            <input
              type="checkbox"
              checked={preferences.revisionReminders}
              onChange={(e) => handlePreferenceChange('revisionReminders', e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
            <select
              value={preferences.timezone}
              onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-900 dark:text-gray-100"
            >
              <option value="UTC">UTC</option>
              <option value="EST">EST</option>
              <option value="CST">CST</option>
              <option value="MST">MST</option>
              <option value="PST">PST</option>
              <option value="IST">IST</option>
            </select>
          </div>

          <Button
            variant="primary"
            onClick={handleSavePreferences}
            isLoading={isUpdating}
            className="w-full"
          >
            Save Preferences
          </Button>
        </div>
      </div>

      {/* Stats */}
      {user?.stats && (
        <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Problems</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{user.stats.totalProblems}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Revisions</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{user.stats.totalRevisions}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">{user.stats.currentStreak}🔥</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Longest Streak</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-600">{user.stats.longestStreak}⭐</p>
            </div>
          </div>
        </div>
      )}

      {/* Export */}
      <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Export</h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
          Download all problems as a Markdown file for your notes repo or backup.
        </p>
        <Button variant="secondary" onClick={handleExportMarkdown} isLoading={exporting} className="w-full">
          Export Markdown
        </Button>
      </div>

      {/* Account Actions */}
      <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Account</h2>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
