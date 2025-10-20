import { Navbar, QuestionForm } from '@/components';
import Link from 'next/link';

export default function AskQuestionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          {' '}/{' '}
          <span className="text-gray-900 font-medium">Ask a Question</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ask a Public Question
          </h1>
          <p className="text-gray-600">
            Get help from our community of appliance repair experts
          </p>
        </div>

        {/* Question Form */}
        <QuestionForm mode="create" />
      </div>
    </div>
  );
}
