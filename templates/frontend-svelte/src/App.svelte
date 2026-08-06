<script lang="ts">
  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  let email = 'demo@example.com';
  let password = 'password123';
  let msg = '';
  async function auth(path: string) {
    const res = await fetch(`${API}/api/auth/${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    msg = res.ok ? `OK ${String(data.token).slice(0, 16)}…` : data.error || 'error';
  }
</script>
<div style="font-family: system-ui; max-width: 420px; margin: 4rem auto">
  <h1>{{PROJECT_NAME}}</h1>
  <p>Svelte + {{BACKEND}} starter</p>
  <input bind:value={email} placeholder="email" style="width:100%;margin-bottom:8px" />
  <input bind:value={password} type="password" placeholder="password" style="width:100%;margin-bottom:8px" />
  <div style="display:flex;gap:8px">
    <button on:click={() => auth('login')}>Login</button>
    <button on:click={() => auth('signup')}>Signup</button>
  </div>
  <pre>{msg}</pre>
</div>
