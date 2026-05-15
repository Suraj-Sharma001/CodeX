'use client';

import { Button } from '@/components/ui/Button';

export type ApproachesForm = {
  bruteForceSolution: {
    description: string;
    timeComplexity: string;
    spaceComplexity: string;
  };
  optimizedSolution: {
    description: string;
    timeComplexity: string;
    spaceComplexity: string;
    keyInsight: string;
  };
};

type Snippet = { language: string; code: string };

type Props = {
  approaches: ApproachesForm;
  onApproachesChange: (next: ApproachesForm) => void;
  codeSnippets: Snippet[];
  onSnippetsChange: (next: Snippet[]) => void;
};

export function ProblemApproachesSection({
  approaches,
  onApproachesChange,
  codeSnippets,
  onSnippetsChange,
}: Props) {
  const updateBf = (field: keyof ApproachesForm['bruteForceSolution'], value: string) => {
    onApproachesChange({
      ...approaches,
      bruteForceSolution: { ...approaches.bruteForceSolution, [field]: value },
    });
  };

  const updateOpt = (field: keyof ApproachesForm['optimizedSolution'], value: string) => {
    onApproachesChange({
      ...approaches,
      optimizedSolution: { ...approaches.optimizedSolution, [field]: value },
    });
  };

  return (
    <div className="mb-8 space-y-8">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Brute force approach</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={approaches.bruteForceSolution.description}
              onChange={(e) => updateBf('description', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              rows={4}
              placeholder="Naive idea, nested loops, extra space, etc."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time</label>
              <input
                value={approaches.bruteForceSolution.timeComplexity}
                onChange={(e) => updateBf('timeComplexity', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                placeholder="O(n²)"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Space</label>
              <input
                value={approaches.bruteForceSolution.spaceComplexity}
                onChange={(e) => updateBf('spaceComplexity', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                placeholder="O(1)"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Optimized approach</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={approaches.optimizedSolution.description}
              onChange={(e) => updateOpt('description', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key insight</label>
            <input
              value={approaches.optimizedSolution.keyInsight}
              onChange={(e) => updateOpt('keyInsight', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              placeholder="Why it works"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time</label>
              <input
                value={approaches.optimizedSolution.timeComplexity}
                onChange={(e) => updateOpt('timeComplexity', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Space</label>
              <input
                value={approaches.optimizedSolution.spaceComplexity}
                onChange={(e) => updateOpt('spaceComplexity', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Code snippets</h2>
        <div className="space-y-4">
          {codeSnippets.map((snip, idx) => (
            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <input
                  value={snip.language}
                  onChange={(e) => {
                    const next = [...codeSnippets];
                    next[idx] = { ...next[idx], language: e.target.value };
                    onSnippetsChange(next);
                  }}
                  className="border rounded px-2 sm:px-3 py-1 text-xs sm:text-sm w-full sm:w-40 dark:bg-gray-900 dark:border-gray-600"
                  placeholder="language"
                />
                <button
                  type="button"
                  className="text-xs sm:text-sm text-red-600 font-medium"
                  onClick={() => onSnippetsChange(codeSnippets.filter((_, i) => i !== idx))}
                >
                  Remove
                </button>
              </div>
              <textarea
                value={snip.code}
                onChange={(e) => {
                  const next = [...codeSnippets];
                  next[idx] = { ...next[idx], code: e.target.value };
                  onSnippetsChange(next);
                }}
                className="w-full font-mono text-xs sm:text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-2 sm:px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                placeholder="Paste solution..."
              />
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              onSnippetsChange([...codeSnippets, { language: 'typescript', code: '' }])
            }
            size="sm"
          >
            Add snippet
          </Button>
        </div>
      </div>
    </div>
  );
}
