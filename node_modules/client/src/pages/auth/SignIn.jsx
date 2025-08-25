import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../shared/axiosClient';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('user_token')) {
      navigate('/account');
    }
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('Signing in...');
    try {
  const res = await api.post('/api/users/login', { email, password });
      localStorage.setItem('user_token', res.data?.token);
      const next = params.get('next') || '/account';
      navigate(next);
    } catch (e) {
      setStatus('Sign in failed.');
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-white">Sign in</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-200">Email</label>
          <input className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200">Password</label>
          <input className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="rounded-lg bg-rose-600 text-white px-6 py-2 hover:bg-rose-500">Sign in</button>
        {status && <p className="text-sm text-slate-300">{status}</p>}
      </form>
      <p className="mt-4 text-sm text-slate-300">Don't have an account? <Link className="text-sky-300 hover:text-sky-200" to="/signup">Sign up</Link></p>
    </div>
  );
}
