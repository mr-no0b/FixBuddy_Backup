'use client';

import { useRef, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your content here...',
  minHeight = '200px',
  disabled = false
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Helper function to wrap selected text with markdown syntax
  const wrapText = (before: string, after: string = before) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newValue =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);
    
    onChange(newValue);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        end + before.length
      );
    }, 0);
  };

  // Insert text at cursor position
  const insertText = (text: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const newValue = value.substring(0, start) + text + value.substring(start);
    
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  // Format handlers
  const handleBold = () => wrapText('**');
  const handleItalic = () => wrapText('*');
  const handleCode = () => wrapText('`');
  const handleCodeBlock = () => insertText('\n```\n\n```\n');
  const handleHeading = () => insertText('\n## ');
  const handleBulletList = () => insertText('\n- ');
  const handleNumberedList = () => insertText('\n1. ');
  const handleQuote = () => insertText('\n> ');
  const handleLink = () => wrapText('[', '](url)');
  const handleImage = () => insertText('![alt text](image-url)');

  // Simple markdown to HTML converter for preview
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-3 mb-2">$1</h3>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700">$1</blockquote>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-300 flex-wrap">
        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleBold}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Bold (Ctrl+B)"
          >
            <strong className="text-sm">B</strong>
          </button>
          <button
            type="button"
            onClick={handleItalic}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Italic (Ctrl+I)"
          >
            <em className="text-sm">I</em>
          </button>
          <button
            type="button"
            onClick={handleHeading}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Heading"
          >
            H
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Lists */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleBulletList}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={handleNumberedList}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Numbered List"
          >
            1. List
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Code & Quote */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCode}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed"
            title="Inline Code"
          >
            {'</>'}
          </button>
          <button
            type="button"
            onClick={handleCodeBlock}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Code Block"
          >
            ```
          </button>
          <button
            type="button"
            onClick={handleQuote}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Quote"
          >
            &ldquo;
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Links & Images */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleLink}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Link"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={handleImage}
            disabled={disabled}
            className="p-2 hover:bg-gray-200 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Image"
          >
            🖼️
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Preview Toggle */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          disabled={disabled}
          className={`px-3 py-1 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
            showPreview
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="Toggle Preview"
        >
          {showPreview ? '📝 Edit' : '👁️ Preview'}
        </button>
      </div>

      {/* Editor/Preview Area */}
      <div className="relative">
        {showPreview ? (
          <div
            className="p-4 prose prose-sm max-w-none"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full p-4 resize-y focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed font-mono text-sm"
            style={{ minHeight }}
            onKeyDown={(e) => {
              // Keyboard shortcuts
              if (e.ctrlKey || e.metaKey) {
                if (e.key === 'b') {
                  e.preventDefault();
                  handleBold();
                } else if (e.key === 'i') {
                  e.preventDefault();
                  handleItalic();
                }
              }
            }}
          />
        )}
      </div>

      {/* Footer with Tips */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-300 text-xs text-gray-600">
        <span className="font-medium">Markdown supported:</span> **bold**, *italic*, `code`, ```code block```, ## heading, - list, [link](url)
      </div>
    </div>
  );
}
