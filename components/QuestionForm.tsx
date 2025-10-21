'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Tag {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  usageCount: number;
}

interface QuestionFormProps {
  mode?: 'create' | 'edit';
  initialData?: {
    id?: string;
    title: string;
    content: string;
    tags: string[];
  };
  onSuccess?: (questionId: string) => void;
}

export default function QuestionForm({
  mode = 'create',
  initialData,
  onSuccess
}: QuestionFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Load all tags on mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await fetch('/api/tags?limit=100');
        const data = await response.json();
        if (data.success) {
          setAvailableTags(data.tags);
        }
      } catch (error) {
        console.error('Error loading tags');
      }
    };
    loadTags();
  }, []);

  // Filter tags based on input
  useEffect(() => {
    if (tagInput.trim()) {
      const filtered = availableTags.filter(tag =>
        tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
        !selectedTags.includes(tag.name)
      );
      setSuggestedTags(filtered.slice(0, 5));
      setShowTagSuggestions(true);
    } else {
      setSuggestedTags([]);
      setShowTagSuggestions(false);
    }
  }, [tagInput, availableTags, selectedTags]);

  // Add tag
  const handleAddTag = (tagName: string) => {
    if (selectedTags.length >= 5) {
      setError('Maximum 5 tags allowed');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
    tagInputRef.current?.focus();
  };

  // Remove tag
  const handleRemoveTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tagName));
  };

  // Handle tag input key press
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        // Check if tag exists
        const existingTag = availableTags.find(
          t => t.name.toLowerCase() === tagInput.trim().toLowerCase()
        );
        if (existingTag) {
          handleAddTag(existingTag.name);
        } else {
          // Add as new tag
          handleAddTag(tagInput.trim().toLowerCase());
        }
      }
    } else if (e.key === 'Backspace' && !tagInput && selectedTags.length > 0) {
      // Remove last tag on backspace
      setSelectedTags(selectedTags.slice(0, -1));
    }
  };

  // Validate form
  const validate = () => {
    if (title.trim().length < 15) {
      setError('Title must be at least 15 characters');
      return false;
    }

    if (content.trim().length < 30) {
      setError('Content must be at least 30 characters');
      return false;
    }

    if (selectedTags.length === 0) {
      setError('Please add at least one tag');
      return false;
    }

    return true;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const url = mode === 'create' 
        ? '/api/questions'
        : `/api/questions/${initialData?.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags: selectedTags
        })
      });

      const data = await response.json();

      if (data.success) {
        if (onSuccess) {
          onSuccess(data.question._id);
        } else {
          router.push(`/questions/${data.question._id}`);
        }
      } else {
        setError(data.message || 'Failed to submit question');
      }
    } catch (error) {
      setError('You must be logged in to post a question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Title Input */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Question Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., How to fix my refrigerator not cooling properly?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          disabled={loading}
          maxLength={200}
        />
        <p className="mt-2 text-sm text-gray-500">
          Be specific and imagine you're asking a question to another person
          <span className="float-right">{title.length}/200</span>
        </p>
      </div>

      {/* Content Textarea */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Describe Your Problem *
        </label>
        
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-300 rounded-t-lg border-b-0">
          <button
            type="button"
            onClick={() => {
              const textarea = document.getElementById('content') as HTMLTextAreaElement;
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const selectedText = content.substring(start, end);
              const newContent = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
              setContent(newContent);
            }}
            className="p-2 hover:bg-gray-200 rounded transition text-gray-900 font-bold"
            title="Bold"
          >
            <strong className="text-base">B</strong>
          </button>
          <button
            type="button"
            onClick={() => {
              const textarea = document.getElementById('content') as HTMLTextAreaElement;
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const selectedText = content.substring(start, end);
              const newContent = content.substring(0, start) + `*${selectedText}*` + content.substring(end);
              setContent(newContent);
            }}
            className="p-2 hover:bg-gray-200 rounded transition text-gray-900 font-semibold"
            title="Italic"
          >
            <em className="text-base">I</em>
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={() => {
              const textarea = document.getElementById('content') as HTMLTextAreaElement;
              const start = textarea.selectionStart;
              const newContent = content.substring(0, start) + '\n- ' + content.substring(start);
              setContent(newContent);
            }}
            className="p-2 hover:bg-gray-200 rounded transition text-sm font-medium text-gray-900"
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => {
              const textarea = document.getElementById('content') as HTMLTextAreaElement;
              const start = textarea.selectionStart;
              const newContent = content.substring(0, start) + '\n1. ' + content.substring(start);
              setContent(newContent);
            }}
            className="p-2 hover:bg-gray-200 rounded transition text-sm font-medium text-gray-900"
            title="Numbered List"
          >
            1. List
          </button>
          <button
            type="button"
            onClick={() => {
              const textarea = document.getElementById('content') as HTMLTextAreaElement;
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const selectedText = content.substring(start, end);
              const newContent = content.substring(0, start) + `\`${selectedText}\`` + content.substring(end);
              setContent(newContent);
            }}
            className="p-2 hover:bg-gray-200 rounded transition text-sm font-mono font-semibold text-gray-900"
            title="Code"
          >
            {'</>'}
          </button>
        </div>

        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe your problem in detail. Include what you've already tried, error messages, appliance model, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-gray-900 placeholder:text-gray-400"
          rows={12}
          disabled={loading}
          maxLength={5000}
        />
        <p className="mt-2 text-sm text-gray-500">
          The more details you provide, the better answers you'll receive
          <span className="float-right">{content.length}/5000</span>
        </p>
      </div>

      {/* Tags Input */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Tags * (up to 5)
        </label>
        
        {/* Selected Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800"
                disabled={loading}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Tag Input */}
        <div className="relative">
          <input
            ref={tagInputRef}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyPress}
            onFocus={() => tagInput && setShowTagSuggestions(true)}
            onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
            placeholder="Type to search or add tags (press Enter or comma to add)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            disabled={loading || selectedTags.length >= 5}
          />

          {/* Tag Suggestions Dropdown */}
          {showTagSuggestions && suggestedTags.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {suggestedTags.map((tag) => (
                <button
                  key={tag._id}
                  type="button"
                  onClick={() => handleAddTag(tag.name)}
                  className="w-full flex items-center px-4 py-2 hover:bg-gray-100 transition text-left"
                >
                  {tag.icon && <span className="mr-2 text-gray-900">{tag.icon}</span>}
                  <span className="font-medium text-gray-900">{tag.name}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {tag.usageCount} questions
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <p className="mt-2 text-sm text-gray-500">
          Add tags to describe what your question is about. Type and press Enter or comma to add. You can add existing tags or create new ones.
        </p>
      </div>

      {/* Writing Tips */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Writing Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be specific with your question title</li>
          <li>• Include appliance model and what you've already tried</li>
          <li>• Add relevant tags for better visibility</li>
          <li>• Use proper formatting for better readability</li>
        </ul>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {mode === 'create' ? 'Posting...' : 'Updating...'}
            </span>
          ) : (
            mode === 'create' ? 'Post Your Question' : 'Update Question'
          )}
        </button>

        {mode === 'edit' && (
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
