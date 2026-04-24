'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type: string) => {
    if (type === 'admin') { setEmail('admin@jobportal.com'); setPassword('admin123'); }
    else if (type === 'recruiter') { setEmail('sarah@techcorp.com'); setPassword('recruiter123'); }
    else { setEmail('alex@gmail.com'); setPassword('seeker123'); }
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

        <h2 className="text-2xl font-semibold text-center mb-2 tracking-tight text-notion-text">Welcome back</h2>
        <p className="text-notion-text-secondary text-center mb-8 text-sm">Sign in to your account to continue</p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-notion-red-bg border border-notion-red/20 text-notion-red text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-notion-text-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-notion-blue hover:underline font-medium">
            Sign up
          </Link>
        </div>

        {/* Demo accounts */}
        <div className="mt-8 pt-6 border-t border-notion-border">
          <p className="text-xs text-notion-text-tertiary text-center mb-3">Quick Demo Access</p>
          <div className="flex gap-2">
            <button onClick={() => fillDemo('seeker')} className="btn-ghost text-xs flex-1 py-2 border border-notion-border rounded-md">
              🧑‍💻 Jobseeker
            </button>
            <button onClick={() => fillDemo('recruiter')} className="btn-ghost text-xs flex-1 py-2 border border-notion-border rounded-md">
              🏢 Recruiter
            </button>
            <button onClick={() => fillDemo('admin')} className="btn-ghost text-xs flex-1 py-2 border border-notion-border rounded-md">
              🛡️ Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
