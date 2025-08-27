import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../shared/axiosClient';

export default function GoogleButton({ next = '/account', className = '' }) {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return; // no client id configured
    // Load the Google Identity Services script once
    const id = 'google-identity-services';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id;
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = () => setReady(true);
      document.head.appendChild(s);
    } else {
      setReady(true);
    }
  }, [clientId]);

  useEffect(() => {
    if (!ready || !clientId || !ref.current || !window.google?.accounts?.id) return;
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const res = await api.post('/api/users/google', { credential: response.credential });
            localStorage.setItem('user_token', res.data?.token);
            if (typeof window !== 'undefined' && typeof window.__notify === 'function') window.__notify('Signed in with Google', 'success');
            navigate(next);
          } catch (e) {
            if (typeof window !== 'undefined' && typeof window.__notify === 'function') window.__notify('Google sign-in failed', 'error', e?.response?.data || e?.toJSON?.());
          }
        },
        ux_mode: 'popup',
      });
      // Render the official Google button to our container
      window.google.accounts.id.renderButton(ref.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        width: '100%'
      });
    } catch {}
  }, [ready, clientId, next, navigate]);

  if (!clientId) {
    return (
      <button type="button" className={`w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-slate-400 cursor-not-allowed ${className}`} disabled>
        Google not configured
      </button>
    );
  }

  return <div ref={ref} className={className} />;
}
