import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BookOpen, RotateCcw, BarChart3, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            CodeX
          </div>
          <div className="flex gap-2 sm:gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="sm:size-base">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" className="sm:size-base">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Master Your Coding Journey
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Track problems, practice efficiently with spaced repetition, and prepare for technical interviews with confidence.
          </p>
          <Link href="/register">
            <Button size="lg" variant="primary">Get Started Free</Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
          {[
            {
              icon: BookOpen,
              title: 'Problem Tracking',
              description: 'Organize and track coding problems from any platform',
            },
            {
              icon: RotateCcw,
              title: 'Spaced Repetition',
              description: 'Revise efficiently with intelligent scheduling',
            },
            {
              icon: BarChart3,
              title: 'Analytics',
              description: 'Track your progress with detailed statistics',
            },
            {
              icon: Zap,
              title: 'AI-Powered',
              description: 'Get insights and suggestions powered by AI',
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} hoverable>
                <div className="p-4 sm:p-6">
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Ready to level up your coding skills?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            Join hundreds of developers preparing for their dream tech interviews.
          </p>
          <Link href="/register">
            <Button size="lg" variant="primary">Start Now</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
