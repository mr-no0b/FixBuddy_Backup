'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar, QuestionForm, LoadingSpinner, ErrorBoundary } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  tags: Array<{ _id: string; name: string; slug: string }>;
}

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const questionId = params?.id as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch question details
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/questions/${questionId}`);
        const data = await response.json();

        if (data.success) {
          setQuestion(data.question);
          
          // Check if user is the author
          if (user && data.question.author._id !== user._id) {
            setError('You are not authorized to edit this question');
          }
        } else {
          setError(data.message || 'Failed to load question');
        }
      } catch (err) {
        setError('Failed to load question');
        console.error('Error fetching question:', err);
      } finally {
        setLoading(false);
      }
    };

    if (questionId && user) {
      fetchQuestion();
    } else if (!user) {
      router.push('/login');
    }
  }, [questionId, user, router]);

  const handleSuccess = (updatedQuestionId: string) => {
    router.push(`/questions/${updatedQuestionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading question..." />
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              {error ? 'Error' : 'Question Not Found'}
            </h2>
            <p className="text-red-600 mb-4">
              {error || 'The question you are trying to edit does not exist.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-5xl mx-auto p-6">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            {' '}/{' '}
            <Link href={`/questions/${questionId}`} className="hover:text-blue-600">
              Question
            </Link>
            {' '}/{' '}
            <span className="text-gray-900 font-medium">Edit</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Your Question
            </h1>
            <p className="text-gray-600">
              Update your question to make it clearer or add more details
            </p>
          </div>

          {/* Question Form */}
          <QuestionForm
            mode="edit"
            initialData={{
              id: question._id,
              title: question.title,
              content: question.content,
              tags: question.tags.map((tag) => tag.name)
            }}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
