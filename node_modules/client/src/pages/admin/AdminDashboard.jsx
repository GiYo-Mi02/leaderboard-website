import { useEffect, useState } from 'react';
import api from '../../shared/axiosClient';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    api.get('/api/contestants/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6"><h3 className="font-semibold text-slate-200">Registrations</h3><p className="text-2xl text-white">{stats?.registrations ?? '—'}</p></div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6"><h3 className="font-semibold text-slate-200">Top Score</h3><p className="text-2xl text-white">{stats?.topScore ?? '—'}</p></div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6"><h3 className="font-semibold text-slate-200">Active Users</h3><p className="text-2xl text-white">—</p></div>
      </div>

      <div className="mt-10 flex gap-4">
        <a href="/admin/contestants" className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-4 py-2">Manage Contestants</a>
        <a href="/admin/content" className="rounded-lg border border-white/10 hover:bg-white/5 px-4 py-2 text-slate-200">Edit Content</a>
      </div>
    </div>
  );
}
