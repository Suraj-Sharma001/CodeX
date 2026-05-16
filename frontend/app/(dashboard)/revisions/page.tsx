'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Problem } from '@/types';
import { Button } from '@/components/ui/Button';
import { revisionsService } from '@/services/revisions';
import toast from 'react-hot-toast';

function formatDate(value?: string | Date) {
  if (!value) return 'Not scheduled';
  return new Date(value).toLocaleDateString();
}

function getRevisionTimeline(problem: Problem) {
  const nextRevision = problem.revision?.nextRevisionDate
    ? new Date(problem.revision.nextRevisionDate)
    : null;

  return [
    {
      label: 'Scheduled',
      value: nextRevision ? nextRevision.toLocaleDateString() : 'Not scheduled',
    },
    {
      label: 'Review count',
      value: String(problem.revision?.revisionCount ?? 0),
    },
    {
      label: 'Last reviewed',
      value: formatDate(problem.lastReviewedAt),
    },
  ];
}

export default function RevisionsPage() {
  const [pending, setPending] = useState<Problem[]>([]);
  const [stats, setStats] = useState<Awaited<
    ReturnType<typeof revisionsService.getStats>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completeFor, setCompleteFor] = useState<Problem | null>(null);
  const [rating, setRating] = useState(4);
  const [canSolve, setCanSolve] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [list, s] = await Promise.all([
        revisionsService.getPending(50),
        revisionsService.getStats(),
      ]);
      setPending(list);
      setStats(s);
    } catch {
      toast.error('Could not load revisions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitComplete = async () => {
    if (!completeFor) return;
    try {
      setSubmitting(true);
      await revisionsService.complete(completeFor._id, {
        performanceRating: rating,
        canSolveAgain: canSolve,
      });
      toast.success('Revision logged — next date scheduled');
      setCompleteFor(null);
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to complete');
    } finally {
      setSubmitting(false);
    }
  };

  const difficultyColors: Record<string, string> = {
    Easy: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
    Hard: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Revision queue</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Marked problems stay in the queue until they are reviewed. Each card includes the revision timeline.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {[
            ['Due now', stats.dueNow],
            ['Overdue', stats.overdue],
            ['Next 7 days', stats.upcomingWeek],
            ['Marked total', stats.markedTotal],
          ].map(([label, val]) => (
            <div
              key={label}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-3 sm:p-4"
            >
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{label}</p>
              <p className="text-xl sm:text-2xl font-bold">{val}</p>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 sm:py-10">
          <p className="text-sm sm:text-base text-gray-600">Loading...</p>
        </div>
      ) : pending.length === 0 ? (
        <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow border border-gray-100 dark:border-gray-800 p-6 text-center">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
            No marked revision items yet. Open a problem and use Mark for revision to add it here.
          </p>
          <Link href="/problems" className="inline-block">
            <Button variant="primary">All problems</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {pending.map((problem) => {
            const due = problem.revision?.nextRevisionDate
              ? new Date(problem.revision.nextRevisionDate)
              : null;
            const overdue =
              due && due.getTime() < Date.now() - 86400000 / 2;

            return (
              <div
                key={problem._id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-4 sm:p-6 flex flex-col gap-4"
              >
                <div className="flex-1">
                  <Link
                    href={`/problems/${problem._id}`}
                    className="text-base sm:text-lg font-semibold hover:text-blue-600 dark:hover:text-blue-400 break-words"
                  >
                    {problem.title}
                  </Link>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {problem.platform}
                    {due && (
                      <>
                        {' · '}
                        <span className={overdue ? 'text-red-600 font-medium' : ''}>
                          Due {due.toLocaleDateString()}
                          {overdue ? ' (overdue)' : ''}
                        </span>
                      </>
                    )}
                    {!due && problem.revision?.nextRevisionDate && (
                      <>
                        {' · '}
                        <span className="text-emerald-600 font-medium">
                          Scheduled {new Date(problem.revision.nextRevisionDate).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                    {problem.topics.slice(0, 5).map((topic) => (
                      <span
                        key={topic}
                        className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-center ${difficultyColors[problem.difficulty]}`}
                  >
                    {problem.difficulty}
                  </span>
                  <Button
                    variant="primary"
                    onClick={() => setCompleteFor(problem)}
                    className="w-full sm:w-auto"
                    disabled={!problem.revision?.nextRevisionDate || Date.now() < new Date(problem.revision.nextRevisionDate).getTime()}
                  >
                    Complete review
                  </Button>
                </div>

                <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/30 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Timeline
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {problem.revision?.markedForRevision ? 'Tracked in revision queue' : 'Not tracked'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {getRevisionTimeline(problem).map((item) => (
                      <div key={item.label} className="rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {item.label}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1 break-words">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {completeFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Complete review</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
              {completeFor.title} — how well did you recall the approach?
            </p>
            <div className="mb-4">
              <label className="text-xs sm:text-sm font-medium block mb-2">
                Performance (1–5)
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <p className="text-center font-semibold text-sm">{rating}</p>
            </div>
            <label className="flex items-center gap-2 mb-6 text-xs sm:text-sm">
              <input
                type="checkbox"
                checked={canSolve}
                onChange={(e) => setCanSolve(e.target.checked)}
                className="rounded accent-blue-600"
              />
              Can I solve this again cold?
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="primary"
                className="flex-1"
                isLoading={submitting}
                onClick={submitComplete}
              >
                Save & schedule next
              </Button>
              <Button variant="ghost" onClick={() => setCompleteFor(null)} className="flex-1 sm:flex-none">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
