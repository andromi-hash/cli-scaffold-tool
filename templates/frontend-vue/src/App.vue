<script setup lang="ts">
import { ref } from 'vue';
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const email = ref('demo@example.com');
const password = ref('password123');
const msg = ref('');
async function auth(path: string) {
  const res = await fetch(`${API}/api/auth/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.value, password: password.value }),
  });
  const data = await res.json();
  msg.value = res.ok ? `OK ${String(data.token).slice(0, 16)}…` : data.error || 'error';
}
</script>
<template>
  <div style="font-family: system-ui; max-width: 420px; margin: 4rem auto">
    <h1>{{PROJECT_NAME}}</h1>
    <p>Vue + {{BACKEND}} starter</p>
    <input v-model="email" placeholder="email" style="width:100%;margin-bottom:8px" />
    <input v-model="password" type="password" placeholder="password" style="width:100%;margin-bottom:8px" />
    <div style="display:flex;gap:8px">
      <button @click="auth('login')">Login</button>
      <button @click="auth('signup')">Signup</button>
    </div>
    <pre>{{ msg }}</pre>
  </div>
</template>
