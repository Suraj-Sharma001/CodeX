'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated, isHydrating } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (!isHydrating && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isHydrating, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email || !password) {
      setErrors({
        email: !email ? 'Email is required' : '',
        password: !password ? 'Password is required' : '',
      });
      return;
    }

    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
          CodeX
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="email"
                label="Email address"
                placeholder="Enter your email"
                icon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                icon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
