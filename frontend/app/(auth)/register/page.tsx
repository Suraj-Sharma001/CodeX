'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Mail, Lock, User } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, isAuthenticated, isHydrating } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (!isHydrating && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isHydrating, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: any = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await register(formData);
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Registration failed');
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
                Create your account
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Start mastering coding problems today
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  name="firstName"
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                />

                <Input
                  type="text"
                  name="lastName"
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                />
              </div>

              <Input
                type="text"
                name="username"
                label="Username"
                placeholder="codemaster"
                icon={<User className="w-4 h-4" />}
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
              />

              <Input
                type="email"
                name="email"
                label="Email address"
                placeholder="your@email.com"
                icon={<Mail className="w-4 h-4" />}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="Create a strong password"
                icon={<Lock className="w-4 h-4" />}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
