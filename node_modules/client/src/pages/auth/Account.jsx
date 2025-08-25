import { useEffect, useState } from 'react';
import api from '../../shared/axiosClient';

export default function Account() {
  const [profile, setProfile] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [status, setStatus] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;

  useEffect(() => {
    if (!token) {
      window.location.href = '/signin?next=/account';
      return;
    }
    (async () => {
      try {
  const res = await api.get('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
        setProfile({
          name: res.data?.name || '',
          place: res.data?.place || '',
          bio: res.data?.bio || '',
          experiences: res.data?.experiences || [],
          avatarUrl: res.data?.avatarUrl || '',
          createdAt: res.data?.createdAt || ''
        });
      } catch (e) {
        localStorage.removeItem('user_token');
        window.location.href = '/signin?next=/account';
      }
    })();
  }, [token]);

  function addExperience() {
    setProfile(p => ({ ...p, experiences: [...(p.experiences || []), { title: '', description: '', link: '', date: '' }] }));
  }

  function removeExperience(idx) {
    setProfile(p => ({ ...p, experiences: p.experiences.filter((_, i) => i !== idx) }));
  }

  async function save(e) {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const form = new FormData();
      form.append('name', profile.name);
      form.append('place', profile.place);
      form.append('bio', profile.bio);
      if (Array.isArray(profile.experiences)) form.append('experiences', JSON.stringify(profile.experiences));
      if (avatar) form.append('avatar', avatar);
      const res = await api.put('/api/users/me', form, { headers: { Authorization: `Bearer ${token}` } });
      setProfile({ ...profile, ...res.data });
      setStatus('Saved');
      if (typeof window !== 'undefined' && typeof window.__notify === 'function') {
        window.__notify('Profile updated', 'success');
      }
    } catch (e) {
      setStatus('Save failed');
    }
  }

  function signOut() {
    localStorage.removeItem('user_token');
    window.location.href = '/';
  }

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Your account</h1>
          {profile.createdAt && (
            <p className="text-sm text-slate-400 mt-1">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
          )}
        </div>
        <button onClick={signOut} className="text-sm text-slate-300 hover:text-white">Sign out</button>
      </div>
      <form onSubmit={save} className="mt-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 overflow-hidden grid place-items-center">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-400 text-sm">No avatar</span>
            )}
          </div>
          <input type="file" accept="image/*" className="mt-3 block text-sm text-slate-200" onChange={e => setAvatar(e.target.files?.[0])} />
        </div>
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200">Name</label>
            <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Place</label>
            <input value={profile.place} onChange={e => setProfile({ ...profile, place: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Description</label>
            <textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} rows={4} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600" />
          </div>
        </div>
      </form>
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Past experiences</h2>
          <button onClick={addExperience} className="text-sm text-sky-300 hover:text-sky-200">Add</button>
        </div>
        <div className="mt-3 space-y-3">
          {(profile.experiences || []).map((exp, idx) => (
            <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="grid md:grid-cols-2 gap-3">
                <input value={exp.title} onChange={e => setProfile(p => { const list = [...p.experiences]; list[idx] = { ...list[idx], title: e.target.value }; return { ...p, experiences: list }; })} placeholder="Title" className="rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2" />
                <input value={exp.link || ''} onChange={e => setProfile(p => { const list = [...p.experiences]; list[idx] = { ...list[idx], link: e.target.value }; return { ...p, experiences: list }; })} placeholder="Link (optional)" className="rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2" />
                <input type="date" value={exp.date ? String(exp.date).slice(0,10) : ''} onChange={e => setProfile(p => { const list = [...p.experiences]; list[idx] = { ...list[idx], date: e.target.value }; return { ...p, experiences: list }; })} className="rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2" />
                <input value={exp.description} onChange={e => setProfile(p => { const list = [...p.experiences]; list[idx] = { ...list[idx], description: e.target.value }; return { ...p, experiences: list }; })} placeholder="Short description" className="rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2" />
              </div>
              <div className="mt-2 text-right"><button onClick={() => removeExperience(idx)} className="text-xs text-slate-300 hover:text-white">Remove</button></div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <button onClick={save} className="rounded-lg bg-rose-600 text-white px-6 py-2 hover:bg-rose-500">Save changes</button>
        {status && <span className="ml-3 text-sm text-slate-300">{status}</span>}
      </div>
    </div>
  );
}
