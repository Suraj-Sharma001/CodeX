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
        <h2 className="text-xl font-semibold mb-4">Brute force approach</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={approaches.bruteForceSolution.description}
              onChange={(e) => updateBf('description', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Naive idea, nested loops, extra space, etc."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                value={approaches.bruteForceSolution.timeComplexity}
                onChange={(e) => updateBf('timeComplexity', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-900"
                placeholder="O(n²)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Space</label>
              <input
                value={approaches.bruteForceSolution.spaceComplexity}
                onChange={(e) => updateBf('spaceComplexity', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-900"
                placeholder="O(1)"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Optimized approach</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={approaches.optimizedSolution.description}
              onChange={(e) => updateOpt('description', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key insight</label>
            <input
              value={approaches.optimizedSolution.keyInsight}
              onChange={(e) => updateOpt('keyInsight', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-900"
              placeholder="Why it works"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                value={approaches.optimizedSolution.timeComplexity}
                onChange={(e) => updateOpt('timeComplexity', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Space</label>
              <input
                value={approaches.optimizedSolution.spaceComplexity}
                onChange={(e) => updateOpt('spaceComplexity', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Code snippets</h2>
        <div className="space-y-4">
          {codeSnippets.map((snip, idx) => (
            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <input
                  value={snip.language}
                  onChange={(e) => {
                    const next = [...codeSnippets];
                    next[idx] = { ...next[idx], language: e.target.value };
                    onSnippetsChange(next);
                  }}
                  className="border rounded px-2 py-1 text-sm w-40 dark:bg-gray-900 dark:border-gray-600"
                  placeholder="language"
                />
                <button
                  type="button"
                  className="text-red-600 text-sm"
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
                className="w-full font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-950 min-h-[120px]"
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
          >
            Add snippet
          </Button>
        </div>
      </div>
    </div>
  );
}
