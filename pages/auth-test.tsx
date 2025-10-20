import { useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  reputation: number;
}

export default function AuthTest() {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword] = useState('password123');

  // Test Registration
  const testRegister = async () => {
    setLoading(true);
    try {
      const newEmail = `test${Date.now()}@example.com`;
      setTestEmail(newEmail); // Save for later login
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `testuser${Date.now()}`,
          email: newEmail,
          password: testPassword
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Registration successful! User: ${data.user.username}`);
        setUser(data.user);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error during registration');
    }
    setLoading(false);
  };

  // Test Login
  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Login successful! Welcome ${data.user.username}`);
        setUser(data.user);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error during login');
    }
    setLoading(false);
  };

  // Test Get Current User
  const testGetMe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ User found: ${data.user.username}`);
        setUser(data.user);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error fetching user');
    }
    setLoading(false);
  };

  // Test Logout
  const testLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Logout successful!');
        setUser(null);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Error during logout');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
        🔐 Authentication System Test
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

      {user && (
        <div style={{
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '8px'
        }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Current User:</h3>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Reputation:</strong> {user.reputation}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={testRegister}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Test Register
        </button>

        <button
          onClick={testLogin}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Test Login
        </button>

        <button
          onClick={testGetMe}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Get Current User
        </button>

        <button
          onClick={testLogout}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Test Logout
        </button>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Instructions:</h3>
        <ol style={{ paddingLeft: '20px' }}>
          <li><strong>Click "Test Register"</strong> first to create a new user (auto-login)</li>
          <li>Click "Get Current User" to verify you're authenticated</li>
          <li>Click "Test Logout" to clear the session</li>
          <li>Click "Test Login" to login again with the same credentials</li>
        </ol>
        <p style={{ marginTop: '16px', fontSize: '14px', color: '#6c757d' }}>
          <strong>Current test email:</strong> {testEmail}
        </p>
        <p style={{ fontSize: '14px', color: '#6c757d' }}>
          Note: Make sure MongoDB is running on localhost:27017
        </p>
      </div>
    </div>
  );
}
