import { useState } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function App() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [msg, setMsg] = useState('');
  async function auth(path: string) {
    const res = await fetch(`${API}/api/auth/${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setMsg(res.ok ? `OK token=${String(data.token).slice(0, 16)}…` : data.error || 'error');
    if (data.token) localStorage.setItem('token', data.token);
  }
  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 420, margin: '4rem auto' }}>
      <h1>{{PROJECT_NAME}}</h1>
      <p>React + {{BACKEND}} starter</p>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" style={{ width: '100%', marginBottom: 8 }} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" style={{ width: '100%', marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => auth('login')}>Login</button>
        <button onClick={() => auth('signup')}>Signup</button>
      </div>
      <pre>{msg}</pre>
    </div>
  );
}
