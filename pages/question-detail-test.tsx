import { useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
  reputation: number;
}

interface Answer {
  _id: string;
  content: string;
  author: {
    username: string;
    reputation: number;
  };
  votes: number;
  isAccepted: boolean;
  createdAt: string;
}

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
  answers?: Answer[];
}

export default function QuestionDetailTest() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Answer form
  const [answerContent, setAnswerContent] = useState('');

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.success) {
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Error loading user');
      }
    };
    loadUser();
  }, []);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/api/questions?limit=50');
        const data = await response.json();
        if (data.success) {
          setQuestions(data.questions);
          // Auto-select first question
          if (data.questions.length > 0 && !selectedQuestion) {
            selectQuestion(data.questions[0]._id);
          }
        }
      } catch (error) {
        console.error('Error loading questions');
      }
    };
    loadQuestions();
  }, []);

  // Select a question and load its answers
  const selectQuestion = async (questionId: string) => {
    setLoading(true);
    try {
      // Get question details
      const qResponse = await fetch(`/api/questions/${questionId}`);
      const qData = await qResponse.json();
      
      if (qData.success) {
        setSelectedQuestion(qData.question);
        
        // Get answers
        const aResponse = await fetch(`/api/questions/${questionId}/answers`);
        const aData = await aResponse.json();
        
        if (aData.success) {
          setAnswers(aData.answers);
          setMessage(`✅ Loaded question with ${aData.answers.length} answers`);
        }
      }
    } catch (error) {
      setMessage('❌ Error loading question');
    }
    setLoading(false);
  };

  // Submit an answer
  const submitAnswer = async () => {
    if (!selectedQuestion) {
      setMessage('❌ No question selected');
      return;
    }
    
    if (!answerContent.trim()) {
      setMessage('❌ Answer content cannot be empty');
      return;
    }

    if (!currentUser) {
      setMessage('❌ You must be logged in to answer. Go to /auth-test first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/questions/${selectedQuestion._id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: answerContent })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Answer posted successfully!`);
        setAnswerContent(''); // Clear form
        // Reload answers
        selectQuestion(selectedQuestion._id);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error posting answer');
    }
    setLoading(false);
  };

  // Vote on question
  const voteQuestion = async (voteType: 'upvote' | 'downvote') => {
    if (!selectedQuestion) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/questions/${selectedQuestion._id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Vote recorded! New votes: ${data.question.votes}`);
        selectQuestion(selectedQuestion._id);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error voting');
    }
    setLoading(false);
  };

  // Vote on answer
  const voteAnswer = async (answerId: string, voteType: 'upvote' | 'downvote') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/answers/${answerId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Vote recorded!`);
        // Reload answers
        if (selectedQuestion) selectQuestion(selectedQuestion._id);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error voting');
    }
    setLoading(false);
  };

  // Accept answer
  const acceptAnswer = async (answerId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/answers/${answerId}/accept`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Answer accepted!`);
        if (selectedQuestion) selectQuestion(selectedQuestion._id);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error accepting answer');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Sidebar - Questions List */}
      <div style={{
        width: '350px',
        backgroundColor: 'white',
        borderRight: '2px solid #dee2e6',
        overflowY: 'auto',
        padding: '20px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          📋 Questions ({questions.length})
        </h2>
        
        {currentUser ? (
          <div style={{
            padding: '12px',
            backgroundColor: '#d4edda',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '13px'
          }}>
            ✅ Logged in as: <strong>{currentUser.username}</strong>
          </div>
        ) : (
          <div style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '13px'
          }}>
            ⚠️ Not logged in. <a href="/auth-test" style={{ color: '#0066cc' }}>Login here</a>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questions.map((q) => (
            <div
              key={q._id}
              onClick={() => selectQuestion(q._id)}
              style={{
                padding: '12px',
                border: selectedQuestion?._id === q._id ? '2px solid #007bff' : '1px solid #dee2e6',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedQuestion?._id === q._id ? '#e7f3ff' : 'white',
                transition: 'all 0.2s'
              }}
            >
              <h4 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '6px',
                color: selectedQuestion?._id === q._id ? '#0056b3' : '#333'
              }}>
                {q.title}
              </h4>
              <div style={{ fontSize: '12px', color: '#6c757d', display: 'flex', gap: '12px' }}>
                <span>💬 {q.answerCount || 0}</span>
                <span>⬆️ {q.votes}</span>
                <span>👁️ {q.views}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Question Detail & Answers */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
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

        {selectedQuestion ? (
          <>
            {/* Question Section */}
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              marginBottom: '30px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#212529'
              }}>
                {selectedQuestion.title}
              </h1>

              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '20px',
                fontSize: '14px',
                color: '#6c757d'
              }}>
                <span>👤 {selectedQuestion.author?.username || 'Unknown'}</span>
                <span>⬆️ {selectedQuestion.votes} votes</span>
                <span>👁️ {selectedQuestion.views} views</span>
                <span>💬 {answers.length} answers</span>
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: selectedQuestion.status === 'solved' ? '#28a745' : '#ffc107',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {selectedQuestion.status}
                </span>
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px'
              }}>
                {selectedQuestion.tags?.map((tag) => (
                  <span key={tag.slug} style={{
                    padding: '6px 12px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '16px',
                    fontSize: '13px',
                    color: '#495057'
                  }}>
                    {tag.name}
                  </span>
                ))}
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '15px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedQuestion.content}
              </div>

              {/* Vote buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => voteQuestion('upvote')}
                  disabled={loading || !currentUser}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading || !currentUser ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  ⬆️ Upvote
                </button>

                <button
                  onClick={() => voteQuestion('downvote')}
                  disabled={loading || !currentUser}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading || !currentUser ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  ⬇️ Downvote
                </button>
              </div>
            </div>

            {/* Answers Section */}
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              marginBottom: '30px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '24px'
              }}>
                {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
              </h2>

              {answers.length === 0 ? (
                <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                  No answers yet. Be the first to answer!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {answers.map((answer) => (
                    <div
                      key={answer._id}
                      style={{
                        padding: '20px',
                        backgroundColor: answer.isAccepted ? '#d4edda' : '#f8f9fa',
                        border: answer.isAccepted ? '2px solid #28a745' : '1px solid #dee2e6',
                        borderRadius: '8px'
                      }}
                    >
                      {answer.isAccepted && (
                        <div style={{
                          marginBottom: '12px',
                          color: '#155724',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          ✅ Accepted Answer
                        </div>
                      )}

                      <div style={{
                        fontSize: '15px',
                        lineHeight: '1.6',
                        marginBottom: '16px',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {answer.content}
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ fontSize: '13px', color: '#6c757d' }}>
                          By <strong>{answer.author.username}</strong> ({answer.author.reputation} rep)
                          <span style={{ marginLeft: '12px' }}>⬆️ {answer.votes} votes</span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => voteAnswer(answer._id, 'upvote')}
                            disabled={loading || !currentUser}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: loading || !currentUser ? 'not-allowed' : 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ⬆️
                          </button>

                          <button
                            onClick={() => voteAnswer(answer._id, 'downvote')}
                            disabled={loading || !currentUser}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: loading || !currentUser ? 'not-allowed' : 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ⬇️
                          </button>

                          {!answer.isAccepted && currentUser && (
                            <button
                              onClick={() => acceptAnswer(answer._id)}
                              disabled={loading}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              ✓ Accept
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Answer Form */}
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '16px'
              }}>
                Your Answer
              </h3>

              {!currentUser ? (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f8d7da',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ marginBottom: '12px', color: '#721c24' }}>
                    You must be logged in to post an answer
                  </p>
                  <a
                    href="/auth-test"
                    style={{
                      display: 'inline-block',
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontWeight: '500'
                    }}
                  >
                    Go to Login Page
                  </a>
                </div>
              ) : (
                <>
                  <textarea
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    placeholder="Write your answer here... Be specific and helpful!"
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      padding: '16px',
                      border: '1px solid #ced4da',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      marginBottom: '16px',
                      resize: 'vertical'
                    }}
                  />

                  <button
                    onClick={submitAnswer}
                    disabled={loading || !answerContent.trim()}
                    style={{
                      padding: '12px 32px',
                      backgroundColor: loading || !answerContent.trim() ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loading || !answerContent.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}
                  >
                    {loading ? 'Posting...' : 'Post Your Answer'}
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#6c757d'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>
              Select a question from the sidebar
            </h2>
            <p>Click on any question to view details and post answers</p>
          </div>
        )}
      </div>
    </div>
  );
}
