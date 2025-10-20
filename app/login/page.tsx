import { LoginForm, ErrorBoundary } from '@/components';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🔧 FixBuddy
              </h1>
            </Link>
            <p className="text-gray-600">
              The home appliance repair community
            </p>
          </div>

          {/* Login Form */}
          <LoginForm redirectTo="/" />

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
