import { useEffect, useState } from 'react';

interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    username: string;
    reputation: number;
  } | null;
  tags: Array<{ name: string; slug: string }>;
  views: number;
  votes: number;
  answerCount?: number;
  status: string;
  createdAt: string;
}

export default function QuestionsTest() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalQuestions: 0,
    limit: 20
  });
  const [currentSort, setCurrentSort] = useState('newest');

  // Test: Get all questions
  const testGetQuestions = async (page = 1, sort = currentSort) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/questions?sort=${sort}&limit=20&page=${page}`);
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Found ${data.pagination.totalQuestions} questions (Page ${page} of ${data.pagination.totalPages})`);
        setQuestions(data.questions);
        setPagination(data.pagination);
        setCurrentSort(sort);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error fetching questions');
    }
    setLoading(false);
  };

  // Load questions on mount
  useEffect(() => {
    testGetQuestions();
  }, []);

  // Test: Create question
  const testCreateQuestion = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `How to fix my refrigerator - Test ${Date.now()}`,
          content: 'My refrigerator is not cooling properly. The freezer works fine but the fridge compartment is warm. I checked the temperature settings and they are correct. What could be causing this issue?',
          tags: ['refrigerator', 'cooling', 'repair']
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Question created! ID: ${data.question._id}`);
        setSelectedQuestion(data.question);
        testGetQuestions(); // Refresh list
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error creating question');
    }
    setLoading(false);
  };

  // Test: Get question by ID
  const testGetQuestionById = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/questions/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Question loaded: ${data.question.title}`);
        setSelectedQuestion(data.question);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error fetching question');
    }
    setLoading(false);
  };

  // Test: Vote on question
  const testVote = async (id: string, voteType: 'upvote' | 'downvote') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/questions/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Vote recorded! New votes: ${data.question.votes}`);
        testGetQuestionById(id); // Refresh question
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error voting');
    }
    setLoading(false);
  };

  // Test: Delete question
  const testDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Question deleted successfully');
        setSelectedQuestion(null);
        testGetQuestions(); // Refresh list
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error deleting question');
    }
    setLoading(false);
  };

  // Test: Search questions
  const testSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/questions?search=refrigerator&sort=popular');
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Search found ${data.questions.length} results`);
        setQuestions(data.questions);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error searching');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
        ❓ Question API Test
      </h1>

      {message && (
        <div style={{
          padding: '16px',
          marginBottom: '20px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '8px',
          color: message.includes('✅') ? '#155724' : '#721c24'
        }}>
          {message}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <button
          onClick={() => testGetQuestions(1, 'newest')}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: currentSort === 'newest' ? '#0056b3' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          Newest
        </button>

        <button
          onClick={() => testGetQuestions(1, 'popular')}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: currentSort === 'popular' ? '#0056b3' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          Popular
        </button>

        <button
          onClick={() => testGetQuestions(1, 'unanswered')}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: currentSort === 'unanswered' ? '#0056b3' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          Unanswered
        </button>

        <button
          onClick={testCreateQuestion}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          Create Question
        </button>

        <button
          onClick={testSearch}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          Search "refrigerator"
        </button>
      </div>

      {/* Selected Question Details */}
      {selectedQuestion && (
        <div style={{
          padding: '20px',
          marginBottom: '30px',
          backgroundColor: '#e7f3ff',
          border: '2px solid #b3d9ff',
          borderRadius: '8px'
        }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '20px' }}>
            {selectedQuestion.title}
          </h3>
          <p style={{ marginBottom: '10px', color: '#555' }}>{selectedQuestion.content}</p>
          
          {selectedQuestion.author && (
            <p style={{ marginBottom: '10px', fontSize: '14px', color: '#6c757d' }}>
              By: <strong>{selectedQuestion.author.username}</strong> ({selectedQuestion.author.reputation} rep)
            </p>
          )}
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            {selectedQuestion.tags?.map((tag: any) => (
              <span key={tag._id} style={{
                padding: '4px 12px',
                backgroundColor: '#ffc107',
                borderRadius: '12px',
                fontSize: '14px'
              }}>
                {tag.name}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '15px', fontSize: '14px' }}>
            <span>👁️ Views: {selectedQuestion.views}</span>
            <span>⬆️ Votes: {selectedQuestion.votes}</span>
            <span>💬 Answers: {selectedQuestion.answers?.length || 0}</span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => testVote(selectedQuestion._id, 'upvote')}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              ⬆️ Upvote
            </button>

            <button
              onClick={() => testVote(selectedQuestion._id, 'downvote')}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              ⬇️ Downvote
            </button>

            <button
              onClick={() => testDeleteQuestion(selectedQuestion._id)}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <h3 style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '24px' }}>
        Questions List ({pagination.totalQuestions} total)
      </h3>

      {questions.length === 0 ? (
        <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
          No questions found. Click "Create Question" to add one or run: npm run seed
        </p>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '16px' }}>
            {questions.map((q) => (
              <div
                key={q._id}
                onClick={() => testGetQuestionById(q._id)}
                style={{
                  padding: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = '#007bff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#ddd';
                }}
              >
                <h4 style={{ fontWeight: 'bold', marginBottom: '8px' }}>{q.title}</h4>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {q.tags?.slice(0, 3).map((tag) => (
                    <span key={tag.slug} style={{
                      padding: '2px 8px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}>
                      {tag.name}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6c757d' }}>
                  <span>👁️ {q.views}</span>
                  <span>⬆️ {q.votes}</span>
                  <span>💬 {q.answerCount || 0}</span>
                  <span>👤 {q.author ? `${q.author.username} (${q.author.reputation} rep)` : 'Unknown user'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              marginTop: '30px',
              padding: '20px'
            }}>
              <button
                onClick={() => testGetQuestions(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1 || loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: pagination.currentPage === 1 ? '#e9ecef' : '#007bff',
                  color: pagination.currentPage === 1 ? '#6c757d' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                ← Previous
              </button>

              <span style={{ fontSize: '16px', color: '#6c757d' }}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => testGetQuestions(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages || loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: pagination.currentPage === pagination.totalPages ? '#e9ecef' : '#007bff',
                  color: pagination.currentPage === pagination.totalPages ? '#6c757d' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Instructions */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Instructions:</h3>
        <ol style={{ paddingLeft: '20px' }}>
          <li>First, make sure you're logged in (use /auth-test)</li>
          <li>Click "Create Question" to add a test question</li>
          <li>Click on any question card to view details</li>
          <li>Use upvote/downvote buttons to test voting</li>
          <li>Click "Search refrigerator" to test search functionality</li>
          <li>Delete button only works if you're the author</li>
        </ol>
      </div>
    </div>
  );
}
