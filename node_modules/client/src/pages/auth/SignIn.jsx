import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../shared/axiosClient';
import GoogleButton from '../../components/GoogleButton';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [remember, setRemember] = useState(false);

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
    <div className="min-h-[80vh] w-full flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/[0.03] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left: form */}
        <div className="p-8 sm:p-10">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Sign in</h1>
            <p className="mt-2 text-sm text-slate-300">
              Don't have an account?{' '}
              <Link className="text-sky-300 hover:text-sky-200" to="/signup">Create now</Link>
            </p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200">E-mail</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Password</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" className="rounded border-white/20 bg-white/5" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Remember me
              </label>
              <a className="text-xs text-sky-300 hover:text-sky-200" href="#">Forgot Password?</a>
            </div>
            <button className="w-full rounded-lg bg-rose-600 text-white px-6 py-2.5 hover:bg-rose-500">Sign in</button>
            {status && <p className="text-sm text-slate-300">{status}</p>}

            {/* Divider */}
            <div className="relative my-4">
              <div className="h-px bg-white/10" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black/60 px-3 text-xs text-slate-400">OR</div>
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-1 gap-3">
              <GoogleButton />
            </div>
          </form>
        </div>

        {/* Right: marketing panel */}
  <aside className="hidden md:block relative p-8 sm:p-10 bg-gradient-to-br from-rose-900/40 via-rose-800/20 to-transparent">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_20%,rgba(244,63,94,0.18),transparent_40%)]" />
          <div className="relative">
            <div className="flex items-center justify-between text-slate-200/80">
              <div className="font-semibold">Support</div>
            </div>
            <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-slate-100 font-semibold">Reach goals faster</div>
              <p className="mt-1 text-sm text-slate-300">Use your account to participate easily. No hidden steps. Submit, track, and win.</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600/20 text-emerald-200 px-3 py-1 text-xs">Earnings <span className="font-semibold">$350.40</span></div>
            </div>
            <div className="mt-10">
              <h2 className="text-xl font-bold text-white">Introducing new features</h2>
              <p className="mt-2 text-sm text-slate-300">Stay ahead with improvements that make signing in and managing your submissions smoother than ever.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
