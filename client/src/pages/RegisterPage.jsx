import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../shared/axiosClient';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', teamName: '', title: '', projectLink: '', description: '' });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;

  useEffect(() => {
    if (!token) {
      navigate('/signin?next=/register');
      return;
    }
    // Pre-fill from current user for better UX
    (async () => {
      try {
        const res = await api.get('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
        setForm((f) => ({ ...f, name: res.data?.name || f.name, email: res.data?.email || f.email }));
      } catch {}
    })();
  }, [token, navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  function validate(values) {
    const errs = {};
    if (!values.name?.trim()) errs.name = 'Name is required';
    if (!values.email?.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errs.email = 'Enter a valid email';
    if (!values.title?.trim()) errs.title = 'Project title is required';
    if (!values.projectLink?.trim()) errs.projectLink = 'Project link is required';
    else {
      try { new URL(values.projectLink); } catch { errs.projectLink = 'Enter a valid URL'; }
    }
    if (file && file.size > 5 * 1024 * 1024) errs.file = 'Max file size is 5MB';
    return errs;
  }

  const progress = useMemo(() => {
    const required = ['name','email','title','projectLink'];
    const filled = required.filter(k => !!form[k]?.trim()).length;
    return Math.round((filled / required.length) * 100);
  }, [form]);

  async function onSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      if (window.__notify) window.__notify('Please fix highlighted fields', 'error');
      return;
    }
    setLoading(true);
    setStatus('Submitting...');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (file) data.append('file', file);
  const res = await api.post('/api/contestants/register', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
  const wasUpdated = !!res?.data?.updated && !res?.data?.created;
  setStatus(wasUpdated ? 'Updated your existing submission.' : 'Registered successfully!');
      if (typeof window !== 'undefined' && typeof window.__notify === 'function') {
        window.__notify('Registration submitted', 'success');
      }
      setForm({ name: '', email: '', teamName: '', title: '', projectLink: '', description: '' });
      setFile(null);
      setFilePreview('');
    } catch (e) {
      const msg = e?.response?.data?.error || 'Registration failed.';
      // If duplicate email (409), surface inline beside the email field and avoid generic banner
      if (e?.response?.status === 409) {
        setErrors((prev) => ({ ...prev, email: msg || 'This email has already registered.' }));
        setStatus('');
        // Optionally focus the email field
        try { document.querySelector('input[name="email"]').focus(); } catch {}
      } else {
        setStatus(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
    setErrors((er) => ({ ...er, file: undefined }));
  }

  function onFilePick(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setFilePreview(f ? URL.createObjectURL(f) : '');
    setErrors((er) => ({ ...er, file: undefined }));
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Register your project</h1>
        <div className="hidden md:flex items-center gap-3 text-sm text-slate-300">
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-rose-600" style={{ width: `${progress}%` }} /></div>
          <span>{progress}% complete</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-8 grid lg:grid-cols-3 gap-8">
        {/* Left: Form fields */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-white font-semibold">Your details</h2>
            <p className="text-sm text-slate-400">We’ll pre-fill from your account; you can adjust as needed.</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <Field label="Name" name="name" value={form.name} onChange={onChange} error={errors.name} required placeholder="Jane Doe" />
              <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} required placeholder="jane@example.com" readOnly />
              <Field label="Team name (optional)" name="teamName" value={form.teamName} onChange={onChange} placeholder="Team Rocket" />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-white font-semibold">Project info</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <Field label="Project title" name="title" value={form.title} onChange={onChange} error={errors.title} required placeholder="Amazing Website" />
              <Field label="Project link" name="projectLink" type="url" value={form.projectLink} onChange={onChange} error={errors.projectLink} required placeholder="https://..." />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-200">Short description</label>
              <textarea
                className={`mt-1 w-full rounded-lg border ${errors.description ? 'border-rose-500 ring-rose-600' : 'border-white/10'} bg-white/5 text-slate-100 placeholder:text-slate-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600`}
                name="description" rows={4} value={form.description} onChange={onChange} placeholder="What makes your project special?" />
              {errors.description && <p className="mt-1 text-xs text-rose-400">{errors.description}</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-white font-semibold">Screenshot / Logo (optional)</h2>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className={`mt-4 flex items-center justify-center rounded-xl border-2 border-dashed ${errors.file ? 'border-rose-500' : 'border-white/15'} bg-black/20 min-h-[140px]`}
            >
              {filePreview ? (
                <div className="w-full flex items-center gap-4">
                  <img src={filePreview} alt="preview" className="w-24 h-24 rounded-lg object-cover border border-white/10" />
                  <div className="text-slate-300 text-sm">
                    <p>{file?.name}</p>
                    <p className="text-slate-400">{Math.round((file?.size || 0)/1024)} KB</p>
                    <button type="button" className="mt-2 text-xs text-slate-300 hover:text-white" onClick={() => { setFile(null); setFilePreview(''); }}>Remove</button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 text-slate-300">
                  <p>Drag & drop an image here, or</p>
                  <label className="inline-flex mt-2 cursor-pointer rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5">Choose file
                    <input type="file" accept="image/*" className="hidden" onChange={onFilePick} />
                  </label>
                  <p className="mt-2 text-xs text-slate-400">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
            {errors.file && <p className="mt-2 text-xs text-rose-400">{errors.file}</p>}
          </section>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">By submitting you agree to the contest rules and code of conduct.</p>
            <button disabled={loading} className={`rounded-lg px-6 py-2 text-white ${loading ? 'bg-rose-900 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500'} flex items-center gap-2`}>
              {loading && <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-r-transparent animate-spin" />}
              Submit
            </button>
          </div>
          {status && <p className="text-sm text-slate-300">{status}</p>}
        </div>

        {/* Right: Tips / Summary */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold text-white">Tips</h3>
            <ul className="mt-2 list-disc list-inside text-sm text-slate-300 space-y-1">
              <li>Ensure your project link is publicly accessible.</li>
              <li>Keep the description concise and clear.</li>
              <li>A good screenshot/logo helps judges remember your entry.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold text-white">Summary</h3>
            <dl className="mt-2 text-sm text-slate-300 space-y-1">
              <div className="flex justify-between"><dt>Name</dt><dd className="truncate max-w-[10rem] text-slate-200">{form.name || '—'}</dd></div>
              <div className="flex justify-between"><dt>Email</dt><dd className="truncate max-w-[10rem] text-slate-200">{form.email || '—'}</dd></div>
              <div className="flex justify-between"><dt>Title</dt><dd className="truncate max-w-[10rem] text-slate-200">{form.title || '—'}</dd></div>
              <div className="flex justify-between"><dt>Link</dt><dd className="truncate max-w-[10rem] text-slate-200">{form.projectLink || '—'}</dd></div>
            </dl>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, error, required, type = 'text', placeholder, readOnly }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-200">{label}{required && <span className="text-rose-400"> *</span>}</label>
      <input
        className={`mt-1 w-full rounded-lg border ${error ? 'border-rose-500 ring-rose-600' : 'border-white/10'} bg-white/5 text-slate-100 placeholder:text-slate-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={!!readOnly}
        aria-invalid={!!error}
        placeholder={placeholder}
      />
      {name === 'email' && (
        <p className="mt-1 text-xs text-slate-400">Uses your account email.</p>
      )}
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
