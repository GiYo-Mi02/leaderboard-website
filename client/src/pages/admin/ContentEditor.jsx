import { useEffect, useState } from 'react';
import api from '../../shared/axiosClient';

export default function ContentEditor() {
  const [form, setForm] = useState({ rules: '', prizes: '', timeline: '' });
  const token = localStorage.getItem('token');

  useEffect(() => {
    api.get('/api/content').then(res => setForm({
      rules: res.data?.rules || '', prizes: res.data?.prizes || '', timeline: res.data?.timeline || ''
    }));
  }, []);

  async function save() {
    await api.put('/api/content', form, { headers: { Authorization: `Bearer ${token}` } });
    if (typeof window !== 'undefined' && typeof window.__notify === 'function') window.__notify('Content saved', 'success');
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-white">Content Management</h1>
      {['rules','prizes','timeline'].map((k) => (
        <div key={k} className="mt-6">
          <label className="block text-sm font-medium capitalize text-slate-200">{k}</label>
          <textarea className="mt-1 w-full border border-white/10 bg-white/5 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600" rows={6} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
        </div>
      ))}
      <button className="mt-6 rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-6 py-2" onClick={save}>Save</button>
    </div>
  );
}
