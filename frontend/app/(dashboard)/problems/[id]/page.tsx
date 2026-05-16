'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useProblemsStore } from '@/store/problems';
import { Button } from '@/components/ui/Button';
import { CodeBlock } from '@/components/CodeBlock';
import { aiService } from '@/services/ai';

export default function ProblemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const {
    currentProblem,
    getProblemById,
    deleteProblem,
    toggleFavorite,
    markForRevision,
    isLoading,
  } = useProblemsStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confidence, setConfidence] = useState(3);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState('');

  useEffect(() => {
    if (id) {
      getProblemById(id);
    }
  }, [id, getProblemById]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this problem?')) return;
    
    try {
      setIsDeleting(true);
      await deleteProblem(id);
      toast.success('Problem deleted successfully!');
      router.push('/problems');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete problem');
    } finally {
      setIsDeleting(false);
    }
  };

  const runAi = async (key: string, fn: () => Promise<string>) => {
    setAiBusy(key);
    setAiOutput('');
    try {
      const text = await fn();
      setAiOutput(text);
      toast.success('Ready');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'AI unavailable — add OPENAI_API_KEY on the server.'
      );
    } finally {
      setAiBusy(null);
    }
  };

  const handleMarkRevision = async () => {
    try {
      await markForRevision(id, confidence);
      toast.success('Scheduled for revision');
      await getProblemById(id);
      router.push('/revisions');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Could not update revision');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(id);
      toast.success(currentProblem?.isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (error: any) {
      toast.error('Failed to toggle favorite');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-gradient-to-r from-gray-200 dark:from-gray-700 to-gray-100 dark:to-gray-800 rounded-lg w-3/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gradient-to-br from-gray-100 dark:from-gray-700 to-gray-50 dark:to-gray-800 rounded-lg p-4 h-24"></div>
          ))}
        </div>
        <div className="bg-gradient-to-br from-gray-100 dark:from-gray-700 to-gray-50 dark:to-gray-800 rounded-lg p-6 h-64"></div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-6xl mb-4">❌</div>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">Problem not found</p>
        <Link href="/problems">
          <Button variant="primary">Back to Problems</Button>
        </Link>
      </div>
    );
  }

  const difficultyColors: any = {
    Easy: 'bg-green-100 dark:bg-green-900 dark:bg-opacity-40 text-green-800 dark:text-green-300',
    Medium: 'bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-40 text-yellow-800 dark:text-yellow-300',
    Hard: 'bg-red-100 dark:bg-red-900 dark:bg-opacity-40 text-red-800 dark:text-red-300',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{currentProblem.title}</h1>
          <div className="flex gap-2 items-center flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 ${difficultyColors[currentProblem.difficulty]}`}>
              {currentProblem.difficulty}
            </span>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{currentProblem.platform}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-col sm:flex-row">
          <Button
            variant="ghost"
            onClick={handleToggleFavorite}
            className={currentProblem.isFavorited ? 'text-yellow-500' : ''}
            size="sm"
          >
            {currentProblem.isFavorited ? '⭐' : '☆'} Favorite
          </Button>
          <Link href={`/problems/${id}/edit`}>
            <Button variant="primary" size="sm">Edit</Button>
          </Link>
          <Button
            variant="ghost"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="text-red-600"
            size="sm"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Problem Link */}
      {currentProblem.problemLink && (
        <div className="mb-6">
          <a
            href={currentProblem.problemLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200"
          >
            View on {currentProblem.platform} →
          </a>
        </div>
      )}

      {/* Topics */}
      <div className="mb-8">
        <h2 className="text-base sm:text-lg font-semibold mb-3">Topics</h2>
        <div className="flex flex-wrap gap-2">
          {currentProblem.topics.map(topic => (
            <span key={topic} className="bg-blue-100 dark:bg-blue-900 dark:bg-opacity-40 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-xs sm:text-sm transition-colors duration-200">
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Key Intuition */}
      {currentProblem.keyIntuition && (
        <div className="mb-8 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-4 sm:p-6 border border-blue-100 dark:border-blue-800 transition-colors duration-200">
          <h2 className="text-base sm:text-lg font-semibold mb-3">Key Intuition</h2>
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{currentProblem.keyIntuition}</p>
        </div>
      )}

      {/* Approaches */}
      {currentProblem.approaches && (
        <div className="mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-3">Approaches</h2>
          <div className="space-y-4">
            {currentProblem.approaches.bruteForceSolution && (
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 sm:p-4 bg-white dark:bg-gray-900 transition-colors duration-200">
                <h3 className="font-semibold text-xs sm:text-sm text-red-600 dark:text-red-400 mb-2">Brute Force</h3>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2 break-words">{currentProblem.approaches.bruteForceSolution.description}</p>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <p>Time: {currentProblem.approaches.bruteForceSolution.timeComplexity}</p>
                  <p>Space: {currentProblem.approaches.bruteForceSolution.spaceComplexity}</p>
                </div>
              </div>
            )}
            
            {currentProblem.approaches.optimizedSolution && (
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 sm:p-4 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 transition-colors duration-200">
                <h3 className="font-semibold text-xs sm:text-sm text-green-600 dark:text-green-400 mb-2">Optimized Solution</h3>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2 break-words">{currentProblem.approaches.optimizedSolution.description}</p>
                {currentProblem.approaches.optimizedSolution.keyInsight && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Key Insight:</strong> {currentProblem.approaches.optimizedSolution.keyInsight}
                  </p>
                )}
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <p>Time: {currentProblem.approaches.optimizedSolution.timeComplexity}</p>
                  <p>Space: {currentProblem.approaches.optimizedSolution.spaceComplexity}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mistakes Made */}
      {currentProblem.mistakesMade && currentProblem.mistakesMade.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-3">Mistakes Made</h2>
          <div className="space-y-2">
            {currentProblem.mistakesMade.map((mistake, idx) => (
              <div key={idx} className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg p-3 border border-red-100 dark:border-red-800 transition-colors duration-200">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">• {mistake}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edge Cases */}
      {currentProblem.edgeCases && currentProblem.edgeCases.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-3">Edge Cases</h2>
          <div className="space-y-2">
            {currentProblem.edgeCases.map((edgeCase, idx) => (
              <div key={idx} className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-lg p-3 border border-purple-100 dark:border-purple-800 transition-colors duration-200">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">• {edgeCase}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code snippets */}
      {currentProblem.codeSnippets && currentProblem.codeSnippets.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-3">Code</h2>
          <div className="space-y-6">
            {currentProblem.codeSnippets.map((snip, idx) => (
              <div key={idx} className="overflow-x-auto">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {snip.language}
                </p>
                <CodeBlock code={snip.code} language={snip.language} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problem Info */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 sm:p-6 mb-8 border border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Problem Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Date Solved</p>
            <p className="font-semibold text-sm sm:text-base dark:text-white">{new Date(currentProblem.dateSolved).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Status</p>
            <p className="font-semibold text-sm sm:text-base dark:text-white">{currentProblem.status}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Revisions</p>
            <p className="font-semibold text-sm sm:text-base dark:text-white">{currentProblem.revisionCount}</p>
          </div>
          {currentProblem.revision?.nextRevisionDate && (
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Next revision</p>
              <p className="font-semibold text-sm sm:text-base dark:text-white">
                {new Date(currentProblem.revision.nextRevisionDate).toLocaleDateString()}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Can solve again?</p>
            <p className="font-semibold text-sm sm:text-base dark:text-white">
              {currentProblem.revision?.canSolveAgain !== false ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </div>

      {/* Revision scheduling */}
      <div className="mb-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3">Revision queue</h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
          Confidence in recall (1 = weak, 5 = strong). Schedules the next review using spaced repetition.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Confidence</label>
          <input
            type="range"
            min={1}
            max={5}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="flex-1 accent-blue-600"
          />
          <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">{confidence}</span>
          <Button variant="secondary" type="button" onClick={handleMarkRevision} size="sm">
            Mark for revision
          </Button>
        </div>

        <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/30 p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Timeline</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3">
              <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Next review</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1 break-words">
                {currentProblem.revision?.nextRevisionDate
                  ? new Date(currentProblem.revision.nextRevisionDate).toLocaleDateString()
                  : 'Not scheduled'}
              </p>
            </div>
            <div className="rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3">
              <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Review count</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1 break-words">
                {currentProblem.revisionCount}
              </p>
            </div>
            <div className="rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3">
              <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Last reviewed</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1 break-words">
                {currentProblem.lastReviewedAt ? new Date(currentProblem.lastReviewedAt).toLocaleDateString() : 'Not reviewed yet'}
              </p>
            </div>
          </div>
          {currentProblem.revision?.revisedAt && currentProblem.revision.revisedAt.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Revision history</p>
              <div className="space-y-2">
                {currentProblem.revision.revisedAt.map((entry, index) => (
                  <div key={`${entry}-${index}`} className="rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    Revision {index + 1}: {new Date(entry).toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI assistant */}
      <div className="mb-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-2">AI assistant</h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
          Requires <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">OPENAI_API_KEY</code> on the API server.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant="secondary"
            type="button"
            isLoading={aiBusy === 'sum'}
            onClick={() =>
              runAi('sum', () => aiService.summarize(currentProblem._id))
            }
            size="sm"
          >
            Summary
          </Button>
          <Button
            variant="secondary"
            type="button"
            isLoading={aiBusy === 'code'}
            onClick={() =>
              runAi('code', () => aiService.approachToCode(currentProblem._id, 'typescript'))
            }
            size="sm"
          >
            Approach → code
          </Button>
          <Button
            variant="secondary"
            type="button"
            isLoading={aiBusy === 'imp'}
            onClick={() =>
              runAi('imp', () => aiService.improvements(currentProblem._id))
            }
            size="sm"
          >
            Improvements
          </Button>
          <Button
            variant="secondary"
            type="button"
            isLoading={aiBusy === 'int'}
            onClick={() =>
              runAi('int', () => aiService.interviewExplain(currentProblem._id))
            }
            size="sm"
          >
            Interview style
          </Button>
          <Button
            variant="secondary"
            type="button"
            isLoading={aiBusy === 'edge'}
            onClick={() =>
              runAi('edge', () => aiService.missingEdges(currentProblem._id))
            }
            size="sm"
          >
            Missing edges
          </Button>
        </div>
        {aiOutput && (
          <div className="text-xs sm:text-sm whitespace-pre-wrap rounded-lg bg-gray-50 dark:bg-gray-950 p-4 border border-gray-100 dark:border-gray-800 max-h-96 overflow-y-auto break-words">
            {aiOutput}
          </div>
        )}
      </div>

      {/* Notes */}
      {currentProblem.notes && (
        <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 sm:p-6 border border-yellow-100 dark:border-yellow-800">
          <h2 className="text-base sm:text-lg font-semibold mb-3 text-yellow-900 dark:text-yellow-100">Notes</h2>
          <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 whitespace-pre-wrap break-words">{currentProblem.notes}</p>
        </div>
      )}

      {/* Back Button */}
      <Link href="/problems">
        <Button variant="secondary">Back to Problems</Button>
      </Link>
    </div>
  );
}
