import { useEffect, useState } from 'react';
import api from '../../shared/axiosClient';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [canSeed, setCanSeed] = useState(false);
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/auth/status');
        if (!mounted) return;
        setCanSeed(Boolean(res.data?.allowSeed));
        setAdminExists(Boolean(res.data?.exists));
        if (res.data?.exists) {
          setStatus('Admin account found. You can log in.');
        } else if (res.data?.allowSeed) {
          setStatus('No admin yet. You can seed a default admin.');
        } else {
          setStatus('No admin found and seeding is disabled.');
        }
      } catch (_e) {
        // status will be handled by toast interceptor
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('Logging in...');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data?.token);
      if (typeof window !== 'undefined' && typeof window.__notify === 'function') window.__notify('Admin signed in', 'success');
      window.location.href = '/admin';
    } catch (e) {
      setStatus('Login failed.');
    }
  }

  async function seedDefault() {
    setStatus('Seeding default admin...');
    try {
      await api.post('/api/auth/seed', {
        email: 'admin@example.com',
        password: 'admin12345',
      });
      setEmail('admin@example.com');
      setPassword('admin12345');
      setStatus('Seeded. You can now log in with the default credentials.');
      if (typeof window !== 'undefined' && typeof window.__notify === 'function') window.__notify('Default admin created', 'success');
      // refresh status
      try {
        const res = await api.get('/api/auth/status');
        setCanSeed(Boolean(res.data?.allowSeed));
        setAdminExists(Boolean(res.data?.exists));
      } catch {}
    } catch (e) {
      setStatus('Seeding failed or already exists.');
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-white">Admin Login</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-200">Email</label>
          <input className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200">Password</label>
          <input className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="rounded-lg bg-rose-600 text-white px-6 py-2 hover:bg-rose-500">Login</button>
        {status && <p className="text-sm text-slate-300">{status}</p>}
      </form>
      <div className="mt-6 border-t border-white/10 pt-4">
        <p className="text-xs text-slate-400 mb-2">Dev helper</p>
        <button
          onClick={seedDefault}
          disabled={!canSeed || adminExists}
          className={`text-sm rounded-lg border border-white/10 px-3 py-1.5 ${(!canSeed || adminExists) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 text-slate-200'}`}
        >
          Seed default admin
        </button>
        <p className="mt-2 text-xs text-slate-400">Email: <span className="text-slate-200">admin@example.com</span> · Password: <span className="text-slate-200">admin12345</span></p>
        {!canSeed && (
          <p className="mt-1 text-xs text-amber-400">Seeding is disabled by server (ALLOW_SEED != 1).</p>
        )}
        {adminExists && (
          <p className="mt-1 text-xs text-emerald-400">An admin already exists.</p>
        )}
      </div>
    </div>
  );
}
