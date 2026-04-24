'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'JOBSEEKER' | 'RECRUITER'>('JOBSEEKER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        router.push('/login?registered=true');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-notion-bg-secondary p-6">
      <div className="w-full max-w-[400px] bg-notion-bg border border-notion-border rounded-xl p-10 shadow-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-9 h-9 bg-notion-blue rounded-lg flex items-center justify-center text-white">
            <Briefcase size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-notion-text">HireFlow</h1>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-2 tracking-tight text-notion-text">Create an account</h2>
        <p className="text-notion-text-secondary text-center mb-8 text-sm">Start your journey today</p>

        {/* Role Toggle */}
        <div className="flex gap-1 mb-6 bg-notion-bg-tertiary rounded-md p-[3px]">
          <button
            type="button"
            onClick={() => setRole('JOBSEEKER')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium text-center transition-all ${
              role === 'JOBSEEKER'
                ? 'bg-notion-bg text-notion-text shadow-sm'
                : 'text-notion-text-secondary hover:text-notion-text'
            }`}
          >
            🧑‍💻 Job Seeker
          </button>
          <button
            type="button"
            onClick={() => setRole('RECRUITER')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium text-center transition-all ${
              role === 'RECRUITER'
                ? 'bg-notion-bg text-notion-text shadow-sm'
                : 'text-notion-text-secondary hover:text-notion-text'
            }`}
          >
            🏢 Recruiter
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-notion-red-bg border border-notion-red/20 text-notion-red text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-notion-text mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="notion-input"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-notion-text mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="notion-input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-notion-text mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="notion-input pr-10"
                placeholder="Min. 6 characters"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-notion-text-tertiary hover:text-notion-text"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Creating account...' : `Sign Up as ${role === 'JOBSEEKER' ? 'Job Seeker' : 'Recruiter'}`}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-notion-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-notion-blue hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
