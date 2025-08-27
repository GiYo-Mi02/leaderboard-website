import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from './shared/axiosClient';
import LandingPage from './pages/LandingPage';
import Leaderboard from './pages/Leaderboard';
import RegisterPage from './pages/RegisterPage';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ContestantManager from './pages/admin/ContestantManager';
import ContentEditor from './pages/admin/ContentEditor';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Account from './pages/auth/Account';
import './index.css';
import ScrollReveal from './shared/ScrollReveal';
import { Github, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const userToken = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
  const isAuthed = !!userToken && !!currentUser;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!userToken) {
        setCurrentUser(null);
        return;
      }
      try {
        const res = await api.get('/api/users/me', { headers: { Authorization: `Bearer ${userToken}` } });
        if (!cancelled) setCurrentUser(res.data);
      } catch {
        if (!cancelled) setCurrentUser(null);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userToken, location.pathname]);
  function handleRegisterClick(e) {
    if (!isAuthed) {
      e.preventDefault();
      navigate('/signin?next=/register');
    }
    setOpen(false);
  }

  const linkBase = "px-3 py-2 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-colors";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-extrabold tracking-tight text-lg text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-sky-300">Create & Code 2025</Link>
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/leaderboard" className={linkBase}>Leaderboard</Link>
            <Link to="/register" onClick={handleRegisterClick} className={linkBase}>Register</Link>
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {isAuthed ? (
            <UserMenu user={currentUser} onSignOut={() => { localStorage.removeItem('user_token'); setCurrentUser(null); navigate('/'); if (window.__notify) window.__notify('Signed out', 'info'); }} />
          ) : (
            <>
              <Link to="/signin" className={linkBase}>Sign in</Link>
              <Link to="/signup" className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition-colors">Sign up</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-black/70 backdrop-blur">
          <div className="px-4 py-3 flex flex-col gap-1">
            <Link to="/leaderboard" onClick={() => setOpen(false)} className={linkBase}>Leaderboard</Link>
            <Link to="/register" onClick={handleRegisterClick} className={linkBase}>Register</Link>
            {isAuthed ? (
              <div className="flex items-center justify-between gap-2">
                <Link to="/account" onClick={() => setOpen(false)} className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex-1">Account</Link>
                <button onClick={() => { localStorage.removeItem('user_token'); setCurrentUser(null); setOpen(false); navigate('/'); if (window.__notify) window.__notify('Signed out', 'info'); }} className="px-3 py-2 rounded-full text-slate-200 hover:bg-white/10">Sign out</button>
              </div>
            ) : (
              <>
                <Link to="/signin" onClick={() => setOpen(false)} className={linkBase}>Sign in</Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition-colors">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function UserMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false);
  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-3 px-2 py-1.5 rounded-full hover:bg-white/10">
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 overflow-hidden grid place-items-center">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-slate-200">{initials}</span>
          )}
        </div>
        <span className="text-slate-100 max-w-[10rem] truncate">{user?.name || 'Account'}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-lg border border-white/10 bg-black/70 backdrop-blur shadow-lg p-1">
          <Link to="/account" className="block px-3 py-2 rounded-md text-slate-200 hover:bg-white/10">Account</Link>
          <button onClick={onSignOut} className="w-full text-left px-3 py-2 rounded-md text-slate-200 hover:bg-white/10">Sign out</button>
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <div aria-hidden className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-sky-500 grid place-items-center border border-white/10 shadow">
                <span className="text-sm font-bold text-white">CC</span>
              </div>
              <span className="text-white font-extrabold tracking-tight">Create &amp; Code 2025</span>
            </Link>
            <p className="mt-3 text-sm text-slate-400 max-w-sm">
              A modern website-making contest celebrating thoughtful design, real-world UX, and blazing performance.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="text-slate-300 hover:text-white" to="/leaderboard">Leaderboard</Link></li>
              <li><Link className="text-slate-300 hover:text-white" to="/register">Register</Link></li>
              <li><a className="text-slate-300 hover:text-white" href="/#event">About the Event</a></li>
              <li><a className="text-slate-300 hover:text-white" href="/#intro">Introduction</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold">Connect</h4>
            <div className="mt-3 flex items-center gap-3">
              <a
                aria-label="GitHub"
                className="inline-flex w-10 h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                href="https://github.com/GiYo-Mi02/leaderboard-website"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                aria-label="Twitter"
                className="inline-flex w-10 h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                href="#"
                target="_blank"
                rel="noreferrer"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                aria-label="Instagram"
                className="inline-flex w-10 h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                href="#"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                aria-label="LinkedIn"
                className="inline-flex w-10 h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                href="#"
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                aria-label="Email"
                className="inline-flex w-10 h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                href="mailto:contact@example.com"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-3 text-sm text-slate-400">contact@example.com</div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <p>© 2025 Website-Making Contest — All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-200">Privacy</a>
            <a href="#" className="hover:text-slate-200">Terms</a>
            <a href="/leaderboard" className="text-sky-300 hover:text-sky-200">View Leaderboard</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
  <ScrollReveal />
      <Nav />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/register" element={<RegisterPage />} />
  <Route path="/signin" element={<SignIn />} />
  <Route path="/signup" element={<SignUp />} />
  <Route path="/account" element={<Account />} />
  {/* keep admin routes but not linked in nav */}
  <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/admin/contestants" element={<ContestantManager />} />
  <Route path="/admin/content" element={<ContentEditor />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
