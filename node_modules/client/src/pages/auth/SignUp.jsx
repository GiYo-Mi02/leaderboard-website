import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../shared/axiosClient';
import GoogleButton from '../../components/GoogleButton';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('user_token')) {
      navigate('/account');
    }
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('Creating account...');
    try {
  await api.post('/api/users/register', { name, email, password });
  const login = await api.post('/api/users/login', { email, password });
      localStorage.setItem('user_token', login.data?.token);
      navigate('/account');
    } catch (e) {
      setStatus('Sign up failed.');
    }
  }

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/[0.03] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left: form */}
        <div className="p-8 sm:p-10">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Create your account</h1>
            <p className="mt-2 text-sm text-slate-300">
              Already have an account?{' '}
              <Link className="text-sky-300 hover:text-sky-200" to="/signin">Sign in</Link>
            </p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200">Name</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">E-mail</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Password</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="w-full rounded-lg bg-rose-600 text-white px-6 py-2.5 hover:bg-rose-500">Sign up</button>
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
              <div className="text-slate-100 font-semibold">Fast onboarding</div>
              <p className="mt-1 text-sm text-slate-300">Create an account and start submitting in minutes. Manage everything in one place.</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600/20 text-emerald-200 px-3 py-1 text-xs">Bonus <span className="font-semibold">+100 pts</span></div>
            </div>
            <div className="mt-10">
              <h2 className="text-xl font-bold text-white">Introducing new features</h2>
              <p className="mt-2 text-sm text-slate-300">We’re refining the onboarding flow so you can get in, submit, and compete faster.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
