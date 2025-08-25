import { useEffect, useState } from 'react';

export default function Countdown({ deadline }) {
  const [left, setLeft] = useState(deadline - new Date());
  useEffect(() => {
    const id = setInterval(() => setLeft(deadline - new Date()), 1000);
    return () => clearInterval(id);
  }, [deadline]);
  if (left < 0) return <p className="text-sm">Submissions closed</p>;
  const s = Math.floor(left / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return (
    <div className="inline-flex items-center gap-3 bg-white/10 text-white rounded-xl px-4 py-2">
      <span className="font-semibold">Deadline in:</span>
      <span>{d}d</span><span>{h}h</span><span>{m}m</span><span>{sec}s</span>
    </div>
  );
}
