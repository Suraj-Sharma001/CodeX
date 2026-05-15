'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { analyticsService } from '@/services/analytics';
import { DashboardStats } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, RotateCcw, Zap, Crown, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await analyticsService.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (error: any) {
      console.error('Failed to fetch stats', error);
      setError(error?.message || 'Failed to load dashboard statistics');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStats();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 sm:h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="inline-block bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 sm:p-8">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-base sm:text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mb-4 max-w-sm">
            {error}
          </p>
          <Button variant="primary" onClick={fetchStats} size="sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Track your coding progress</p>
        </div>
        <Link href="/problems/new" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">Add Problem</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Problems"
          value={stats.totalProblems}
          icon={<BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Revisions"
          value={stats.totalRevisions}
          icon={<RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="purple"
        />
        <StatCard
          title="Current Streak"
          value={stats.currentStreak}
          icon={<Zap className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="amber"
        />
        <StatCard
          title="Longest Streak"
          value={stats.longestStreak}
          icon={<Crown className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="emerald"
        />
      </div>

      {/* Difficulty Breakdown */}
      <Card>
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Difficulty Breakdown
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <DifficultyCard
              difficulty="Easy"
              count={stats.difficultyBreakdown.Easy}
              variant="success"
            />
            <DifficultyCard
              difficulty="Medium"
              count={stats.difficultyBreakdown.Medium}
              variant="warning"
            />
            <DifficultyCard
              difficulty="Hard"
              count={stats.difficultyBreakdown.Hard}
              variant="danger"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Pending Revisions */}
        <Card>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Due for Revision
              </h3>
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {stats.revisionsPending}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">problems need revision</p>
          </div>
        </Card>

        {/* Platform Stats */}
        <Card>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Platform
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.topicDistribution || {})
                .slice(0, 3)
                .map(([topic, count]) => (
                  <div key={topic} className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">{topic}</span>
                    <Badge variant="info" size="sm">
                      {count as number}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </Card>

        {/* Progress Card */}
        <Card>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Completion Rate
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Overall</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {stats.totalProblems > 0
                      ? Math.round((stats.totalRevisions / stats.totalProblems) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${stats.totalProblems > 0
                        ? (stats.totalRevisions / stats.totalProblems) * 100
                        : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Weak Areas */}
      {stats.weakAreas.length > 0 && (
        <Card>
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Weak Areas
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {stats.weakAreas.map((area) => (
                <Badge key={area} variant="warning">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'amber' | 'emerald';
}) {
  const colorConfigs = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <Card>
      <div className={`p-4 sm:p-6 ${colorConfigs[color]}`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          {Icon}
        </div>
        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {title}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </Card>
  );
}

function DifficultyCard({
  difficulty,
  count,
  variant,
}: {
  difficulty: string;
  count: number;
  variant: 'success' | 'warning' | 'danger';
}) {
  const configs = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  };

  return (
    <Card className={configs[variant]}>
      <div className="p-4 sm:p-6 text-center">
        <p className="text-xs sm:text-sm font-semibold mb-2">{difficulty}</p>
        <p className="text-2xl sm:text-3xl font-bold">{count}</p>
      </div>
    </Card>
  );
}
