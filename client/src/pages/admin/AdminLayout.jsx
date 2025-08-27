import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Users, FileText, LogOut } from 'lucide-react';

export default function AdminLayout({ title, children }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const items = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/contestants', label: 'Contestants', icon: <Users className="w-4 h-4" /> },
    { to: '/admin/content', label: 'Content', icon: <FileText className="w-4 h-4" /> },
  ];

  function signOutAdmin() {
    localStorage.removeItem('token');
    if (typeof window !== 'undefined' && window.__notify) window.__notify('Signed out', 'info');
    window.location.href = '/admin/login';
  }

  const Sidebar = (
    <div className="h-full w-full p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Admin</div>
      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const active = location.pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-rose-600 text-white' : 'text-slate-200 hover:bg-white/10'}`}
              onClick={() => setOpen(false)}
            >
              {it.icon}
              <span>{it.label}</span>
            </Link>
          );
        })}
        <button onClick={signOutAdmin} className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-white/10">
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </nav>
    </div>
  );

  return (
    <div className="relative">
      {/* Fixed desktop sidebar flush-left aligned to header */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-[260px] border-r border-white/10 bg-black/30 backdrop-blur overflow-y-auto">
        {Sidebar}
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden px-6 py-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">{title || 'Admin'}</h1>
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M3 12h18" />
            <path d="M3 18h18" />
          </svg>
        </button>
      </div>

      {/* Main content, offset for sidebar on lg */}
      <div className="lg:ml-[260px]">
        <div className="max-w-7xl px-6 pb-10 mx-auto lg:mx-0">
        {title && <h1 className="hidden lg:block text-3xl font-bold text-white">{title}</h1>}
          <div className="mt-4 lg:mt-6">{children}</div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-[260px] border-r border-white/10 bg-black/30 backdrop-blur">
            {Sidebar}
          </div>
        </div>
      )}
    </div>
  );
}
