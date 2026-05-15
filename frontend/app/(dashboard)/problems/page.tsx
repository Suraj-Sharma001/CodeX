'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useProblemsStore } from '@/store/problems';
import { Problem, ProblemsQuery } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Calendar, RotateCw, Star, Search, Filter } from 'lucide-react';

export default function ProblemsPage() {
  const { problems, isLoading, getProblems } = useProblemsStore();
  const [filters, setFilters] = useState<ProblemsQuery>({
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    getProblems(filters);
  }, [filters, getProblems]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Problems</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {problems.length} problems tracked
          </p>
        </div>
        <Link href="/problems/new" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">Add Problem</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Filter & Search</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Input
              type="text"
              placeholder="Search problems..."
              icon={<Search className="w-4 h-4" />}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  search: e.target.value,
                  page: 1,
                })
              }
            />
            <Select
              value={filters.difficulty || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  difficulty: e.target.value || undefined,
                  page: 1,
                })
              }
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </Select>

            <Select
              value={filters.platform || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  platform: e.target.value || undefined,
                  page: 1,
                })
              }
            >
              <option value="">All Platforms</option>
              <option value="LeetCode">LeetCode</option>
              <option value="Codeforces">Codeforces</option>
              <option value="HackerRank">HackerRank</option>
            </Select>

            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  page: 1,
                  limit: 20,
                })
              }
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Problems List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : problems.length === 0 ? (
          <Card>
            <div className="p-8 sm:p-12 text-center">
              <BookOpen className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 mb-4 font-medium">
                No problems yet. Start by adding one!
              </p>
              <Link href="/problems/new" className="inline-block">
                <Button variant="primary">Add Your First Problem</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {problems.map((problem) => (
              <ProblemItem key={problem._id} problem={problem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { BookOpen } from 'lucide-react';

function ProblemItem({ problem }: { problem: Problem }) {
  const difficultyConfig = {
    Easy: {
      badge: 'success',
      color: 'text-green-700 dark:text-green-300',
    },
    Medium: {
      badge: 'warning',
      color: 'text-amber-700 dark:text-amber-300',
    },
    Hard: {
      badge: 'danger',
      color: 'text-red-700 dark:text-red-300',
    },
  };

  const config = difficultyConfig[problem.difficulty as keyof typeof difficultyConfig];

  return (
    <Link href={`/problems/${problem._id}`}>
      <Card hoverable>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-words">
                {problem.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {problem.platform}
              </p>
            </div>
            <Badge variant={config.badge as any}>{problem.difficulty}</Badge>
          </div>

          {/* Topics */}
          {problem.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
              {problem.topics.slice(0, 3).map((topic) => (
                <Badge key={topic} variant="info" size="sm">
                  {topic}
                </Badge>
              ))}
              {problem.topics.length > 3 && (
                <Badge variant="info" size="sm">
                  +{problem.topics.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{new Date(problem.dateSolved).toLocaleDateString()}</span>
              </span>
              <span className="flex items-center gap-1">
                <RotateCw className="w-4 h-4 flex-shrink-0" />
                <span>{problem.revisionCount} revisions</span>
              </span>
            </div>
            {problem.isFavorited && (
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
