import { useEffect, useState } from 'react';
import api from '../../shared/axiosClient';
import AdminLayout from './AdminLayout';
import { Users2, Star, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    api.get('/api/contestants/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<Users2 className="w-4 h-4" />} label="Registrations" value={stats?.registrations} />
        <StatCard icon={<Star className="w-4 h-4" />} label="Top Score" value={stats?.topScore} />
        <StatCard icon={<Activity className="w-4 h-4" />} label="Active Users" value={stats?.activeUsers} placeholder="—" />
      </div>
      <div className="mt-8 flex gap-4">
        <a href="/admin/contestants" className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-4 py-2">Manage Contestants</a>
        <a href="/admin/content" className="rounded-lg border border-white/10 hover:bg-white/5 px-4 py-2 text-slate-200">Edit Content</a>
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon, label, value, placeholder = '—' }) {
  const loading = value === undefined || value === null;
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-2 text-slate-300">
        {icon}
        <h3 className="font-semibold">{label}</h3>
      </div>
      <p className="mt-2 text-2xl text-white">
        {loading ? (
          <span className="inline-block w-10 h-6 rounded bg-white/10 animate-pulse" aria-hidden />
        ) : (
          value ?? placeholder
        )}
      </p>
    </div>
  );
}
