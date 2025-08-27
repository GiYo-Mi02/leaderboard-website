import { useEffect, useState } from 'react';
import api from '../../shared/axiosClient';
import AdminLayout from './AdminLayout';

export default function ContestantManager() {
  const [list, setList] = useState([]);
  const token = localStorage.getItem('token');

  async function fetchAll() {
    const res = await api.get('/api/contestants', { headers: { Authorization: `Bearer ${token}` } });
    setList(res.data);
  }

  useEffect(() => { fetchAll().catch(() => {}); }, []);

  async function updateScore(id, score) {
    await api.patch(`/api/contestants/${id}/score`, { score }, { headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
    if (typeof window !== 'undefined' && typeof window.__notify === 'function') window.__notify('Score updated', 'success');
  }

  async function remove(id) {
    const ok = window.confirm('Delete this contestant? This cannot be undone.');
    if (!ok) return;
    await api.delete(`/api/contestants/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setList((prev) => prev.filter(x => x._id !== id));
    if (typeof window !== 'undefined' && typeof window.__notify === 'function') window.__notify('Contestant deleted', 'success');
  }

  return (
    <AdminLayout title="Manage Contestants">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-white/10 divide-y divide-white/10 text-slate-200">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Name</th>
              <th className="px-3 py-2 text-left font-semibold">Email</th>
              <th className="px-3 py-2 text-left font-semibold">Title</th>
              <th className="px-3 py-2 text-left font-semibold">Score</th>
              <th className="px-3 py-2 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id} className="odd:bg-white/0 even:bg-white/[0.03]">
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2">{c.email}</td>
                <td className="px-3 py-2">{c.title}</td>
                <td className="px-3 py-2">
                  <input type="number" defaultValue={c.score} className="w-24 border border-white/10 bg-white/5 text-slate-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-rose-600"
                    onBlur={(e) => updateScore(c._id, Number(e.target.value))} />
                </td>
                <td className="px-3 py-2">
                  <a href={c.projectLink} target="_blank" rel="noreferrer" className="text-sky-300 hover:text-sky-200">View</a>
                  <button className="ml-3 text-red-400/90 hover:text-red-300" onClick={() => remove(c._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
