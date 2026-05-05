'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useProblemsStore } from '@/store/problems';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ProblemApproachesSection,
  ApproachesForm,
} from '@/components/problems/ProblemApproachesSection';

const PLATFORMS = ['LeetCode', 'Codeforces', 'HackerRank', 'CodeChef', 'AtCoder', 'Other'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TOPICS = ['Array', 'String', 'Hash Table', 'Linked List', 'Tree', 'Graph', 'DP', 'Greedy', 'Math', 'Binary Search', 'Stack', 'Queue', 'Heap', 'Trie', 'Backtracking'];

export default function EditProblemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { currentProblem, getProblemById, updateProblem, isLoading } = useProblemsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    platform: 'LeetCode',
    difficulty: 'Medium',
    topics: [] as string[],
    problemLink: '',
    dateSolved: '',
    timeTaken: 0,
    keyIntuition: '',
    notes: '',
    mistakesMade: [] as string[],
    edgeCases: [] as string[],
    approaches: {
      bruteForceSolution: {
        description: '',
        timeComplexity: '',
        spaceComplexity: '',
      },
      optimizedSolution: {
        description: '',
        timeComplexity: '',
        spaceComplexity: '',
        keyInsight: '',
      },
    } as ApproachesForm,
    codeSnippets: [] as { language: string; code: string }[],
  });

  const [mistakeInput, setMistakeInput] = useState('');
  const [edgeCaseInput, setEdgeCaseInput] = useState('');

  useEffect(() => {
    if (id) {
      getProblemById(id);
    }
  }, [id, getProblemById]);

  useEffect(() => {
    if (currentProblem) {
      setFormData({
        title: currentProblem.title,
        platform: currentProblem.platform,
        difficulty: currentProblem.difficulty,
        topics: currentProblem.topics,
        problemLink: currentProblem.problemLink || '',
        dateSolved: currentProblem.dateSolved.split('T')[0],
        timeTaken: currentProblem.timeTaken,
        keyIntuition: currentProblem.keyIntuition || '',
        notes: currentProblem.notes || '',
        mistakesMade: currentProblem.mistakesMade || [],
        edgeCases: currentProblem.edgeCases || [],
        approaches: {
          bruteForceSolution: {
            description: currentProblem.approaches?.bruteForceSolution?.description || '',
            timeComplexity: currentProblem.approaches?.bruteForceSolution?.timeComplexity || '',
            spaceComplexity: currentProblem.approaches?.bruteForceSolution?.spaceComplexity || '',
          },
          optimizedSolution: {
            description: currentProblem.approaches?.optimizedSolution?.description || '',
            timeComplexity: currentProblem.approaches?.optimizedSolution?.timeComplexity || '',
            spaceComplexity: currentProblem.approaches?.optimizedSolution?.spaceComplexity || '',
            keyInsight: currentProblem.approaches?.optimizedSolution?.keyInsight || '',
          },
        },
        codeSnippets:
          currentProblem.codeSnippets?.map((s) => ({
            language: s.language,
            code: s.code,
          })) || [],
      });
    }
  }, [currentProblem]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'timeTaken' ? parseInt(value) || 0 : value,
    }));
  };

  const toggleTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic],
    }));
  };

  const addMistake = () => {
    if (mistakeInput.trim()) {
      setFormData(prev => ({
        ...prev,
        mistakesMade: [...prev.mistakesMade, mistakeInput],
      }));
      setMistakeInput('');
    }
  };

  const removeMistake = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mistakesMade: prev.mistakesMade.filter((_, i) => i !== index),
    }));
  };

  const addEdgeCase = () => {
    if (edgeCaseInput.trim()) {
      setFormData(prev => ({
        ...prev,
        edgeCases: [...prev.edgeCases, edgeCaseInput],
      }));
      setEdgeCaseInput('');
    }
  };

  const removeEdgeCase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      edgeCases: prev.edgeCases.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (formData.topics.length === 0) {
      toast.error('Select at least one topic');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateProblem(id, {
        ...formData,
        approaches: formData.approaches,
        codeSnippets: formData.codeSnippets.filter((s) => s.code.trim()),
      });
      toast.success('Problem updated successfully!');
      router.push(`/problems/${id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update problem');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Edit Problem</h1>
        <p className="text-gray-600">Update your problem details</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
        {/* Basic Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="text"
              name="title"
              label="Problem Title"
              placeholder="e.g., Two Sum"
              value={formData.title}
              onChange={handleChange}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DIFFICULTIES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <Input
              type="date"
              name="dateSolved"
              label="Date Solved"
              value={formData.dateSolved}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Topics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Topics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {TOPICS.map(topic => (
              <label key={topic} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.topics.includes(topic)}
                  onChange={() => toggleTopic(topic)}
                  className="mr-2 w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-gray-700">{topic}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Problem Details */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Problem Details</h2>
          <div className="space-y-6">
            <Input
              type="url"
              name="problemLink"
              label="Problem Link (Optional)"
              placeholder="https://leetcode.com/problems/..."
              value={formData.problemLink}
              onChange={handleChange}
            />

            <Input
              type="number"
              name="timeTaken"
              label="Time Taken (minutes)"
              value={formData.timeTaken}
              onChange={handleChange}
              min="0"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key Intuition</label>
              <textarea
                name="keyIntuition"
                placeholder="What was the key insight for this problem?"
                value={formData.keyIntuition}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                placeholder="Any additional notes about the problem..."
                value={formData.notes}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        </div>

        <ProblemApproachesSection
          approaches={formData.approaches}
          onApproachesChange={(approaches) =>
            setFormData((prev) => ({ ...prev, approaches }))
          }
          codeSnippets={formData.codeSnippets}
          onSnippetsChange={(codeSnippets) =>
            setFormData((prev) => ({ ...prev, codeSnippets }))
          }
        />

        {/* Mistakes Made */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Mistakes Made</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={mistakeInput}
              onChange={(e) => setMistakeInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addMistake()}
              placeholder="Enter a mistake you made..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button variant="secondary" onClick={addMistake} type="button">
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {formData.mistakesMade.map((mistake, idx) => (
              <div key={idx} className="flex justify-between items-center bg-red-50 p-3 rounded-lg">
                <span className="text-sm text-gray-700">{mistake}</span>
                <button
                  onClick={() => removeMistake(idx)}
                  type="button"
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Edge Cases */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Edge Cases</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={edgeCaseInput}
              onChange={(e) => setEdgeCaseInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addEdgeCase()}
              placeholder="Enter an edge case..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button variant="secondary" onClick={addEdgeCase} type="button">
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {formData.edgeCases.map((edgeCase, idx) => (
              <div key={idx} className="flex justify-between items-center bg-purple-50 p-3 rounded-lg">
                <span className="text-sm text-gray-700">{edgeCase}</span>
                <button
                  onClick={() => removeEdgeCase(idx)}
                  type="button"
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="flex-1"
          >
            Update Problem
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
