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
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('john@fixbuddy.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  
  // Register form state
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('password123');

  // Test Registration
  const testRegister = async () => {
    if (!registerUsername || !registerEmail || !registerPassword) {
      setMessage('❌ Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerUsername,
          email: registerEmail,
          password: registerPassword
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Registration successful! User: ${data.user.username}`);
        setUser(data.user);
        // Clear form
        setRegisterUsername('');
        setRegisterEmail('');
        setRegisterPassword('password123');
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
    if (!loginEmail || !loginPassword) {
      setMessage('❌ Please enter email and password');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Login Form */}
        <div style={{
          padding: '24px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '20px' }}>
            🔑 Login
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Email:
            </label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="john@fixbuddy.com"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Password:
            </label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="password123"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <button
            onClick={testLogin}
            disabled={loading}
            style={{
              width: '100%',
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
            Login
          </button>
          
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#6c757d' }}>
            Try: john@fixbuddy.com / password123
          </p>
        </div>

        {/* Register Form */}
        <div style={{
          padding: '24px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '20px' }}>
            📝 Register
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Username:
            </label>
            <input
              type="text"
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
              placeholder="johndoe"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Email:
            </label>
            <input
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              placeholder="john@example.com"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Password:
            </label>
            <input
              type="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              placeholder="password123"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <button
            onClick={testRegister}
            disabled={loading}
            style={{
              width: '100%',
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
            Register
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
          Logout
        </button>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Seeded Users:</h3>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li>john@fixbuddy.com (850 reputation)</li>
          <li>sarah@fixbuddy.com (620 reputation)</li>
          <li>mike@fixbuddy.com (450 reputation)</li>
          <li>lisa@fixbuddy.com (280 reputation)</li>
          <li>david@fixbuddy.com (50 reputation)</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#6c757d' }}>
          All seeded users have password: <strong>password123</strong>
        </p>
      </div>
    </div>
  );
}
