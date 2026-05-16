'use client';

import { useEffect, useState } from 'react';
import { analyticsService } from '@/services/analytics';
import { DashboardStats } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, RotateCcw, AlertTriangle } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await analyticsService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3 animate-pulse"></div>
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

  if (!stats) {
    return (
      <div className="text-center py-8 sm:py-10 text-sm sm:text-base text-gray-600 dark:text-gray-400">
        Failed to load analytics
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Track your coding progress and improvements
        </p>
      </div>

      {/* Overview Stats */}
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
          title="Pending Revisions"
          value={stats.revisionsPending}
          icon={<RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="amber"
        />
        <StatCard
          title="Weak Areas"
          value={stats.weakAreas.length}
          icon={<AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />}
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
            <DifficultyBreakdown
              difficulty="Easy"
              count={stats.difficultyBreakdown.Easy}
              variant="success"
            />
            <DifficultyBreakdown
              difficulty="Medium"
              count={stats.difficultyBreakdown.Medium}
              variant="warning"
            />
            <DifficultyBreakdown
              difficulty="Hard"
              count={stats.difficultyBreakdown.Hard}
              variant="danger"
            />
          </div>
        </div>
      </Card>

      {/* Topics Distribution */}
      {Object.keys(stats.topicDistribution).length > 0 && (
        <Card>
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Topic Distribution
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(stats.topicDistribution)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([topic, count]) => {
                  const maxCount = Math.max(
                    ...Object.values(stats.topicDistribution)
                  ) as number;
                  const percentage = ((count as number) / maxCount) * 100;

                  return (
                    <div key={topic} className="space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {topic}
                        </span>
                        <Badge variant="info" size="sm">
                          {count as number}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weak Areas */}
        {stats.weakAreas.length > 0 && (
          <Card>
            <div className="p-4 sm:p-6 border-b border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold text-orange-900 dark:text-orange-100">
                  Areas to Improve
                </h2>
              </div>
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

        {/* Pending Revisions */}
        <Card>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Due for Revision
            </h3>
            <div className="flex items-baseline gap-2 sm:gap-3">
              <div className="text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400">
                {stats.revisionsPending}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                problems need revision
              </p>
            </div>
          </div>
        </Card>
      </div>
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
      <div className={`p-6 ${colorConfigs[color]}`}>
        <div className="flex items-center justify-between mb-4">
          {Icon}
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {title}
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </Card>
  );
}

function DifficultyBreakdown({
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
      <div className="p-6 text-center">
        <p className="font-semibold mb-2">{difficulty}</p>
        <p className="text-3xl font-bold">{count}</p>
      </div>
    </Card>
  );
}
