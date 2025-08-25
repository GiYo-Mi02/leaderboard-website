import { useEffect, useMemo, useState } from 'react';
import api from '../shared/axiosClient';
import { Trophy } from 'lucide-react';

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, entry: null });

  useEffect(() => {
    let mounted = true;
  api.get('/api/leaderboard').then(res => {
      if (mounted) setRows(res.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  const topThree = useMemo(() => rows.slice(0, 3), [rows]);

  const displayName = (r) => r?.name || r?.teamName || '—';

  function showTip(entry, e) {
    if (!e) return;
    const x = e.clientX + 16;
    const y = e.clientY + 16;
    setTooltip({ show: true, x, y, entry });
  }
  function moveTip(e) {
    if (!tooltip.show) return;
    const x = e.clientX + 16;
    const y = e.clientY + 16;
    setTooltip((t) => ({ ...t, x, y }));
  }
  function hideTip() {
    setTooltip({ show: false, x: 0, y: 0, entry: null });
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
      {loading ? (
        <p className="mt-6 text-slate-300">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-slate-300">No entries yet.</p>
      ) : (
        <>
          {/* Podium */}
      <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-300" /> Podium
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              {/* Second */}
              <PodiumCard
                place={2}
                entry={topThree[1]}
                heightClass="h-48 sm:h-56"
                accent="from-slate-600 to-slate-800"
        onEnter={(e) => showTip(topThree[1], e)}
        onMove={moveTip}
        onLeave={hideTip}
              />
              {/* First */}
              <PodiumCard
                place={1}
                entry={topThree[0]}
                heightClass="h-64 sm:h-72"
                accent="from-amber-500 to-yellow-700"
                crown
        onEnter={(e) => showTip(topThree[0], e)}
        onMove={moveTip}
        onLeave={hideTip}
              />
              {/* Third */}
              <PodiumCard
                place={3}
                entry={topThree[2]}
                heightClass="h-40 sm:h-48"
                accent="from-amber-800 to-amber-950"
        onEnter={(e) => showTip(topThree[2], e)}
        onMove={moveTip}
        onLeave={hideTip}
              />
            </div>
          </div>

          {/* Full table */}
          <div className="mt-10 overflow-x-auto">
            <table className="min-w-full border border-white/10 divide-y divide-white/10 text-slate-200">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Rank</th>
                  <th className="px-4 py-2 text-left font-semibold">Contestant</th>
                  <th className="px-4 py-2 text-left font-semibold">Score</th>
                  <th className="px-4 py-2 text-left font-semibold">Project</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr
                    key={r._id || idx}
                    className={
                      (idx % 2 === 0 ? 'bg-white/0' : 'bg-white/[0.03]') +
                      ' ' +
                      (idx === 0
                        ? 'bg-yellow-900/30'
                        : idx === 1
                        ? 'bg-slate-800/30'
                        : idx === 2
                        ? 'bg-amber-900/30'
                        : '')
                    }
                    onMouseEnter={(e) => showTip(r, e)}
                    onMouseMove={moveTip}
                    onMouseLeave={hideTip}
                  >
                    <td className="px-4 py-2 font-semibold text-slate-100">
                      {idx + 1} {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}
                    </td>
                    <td className="px-4 py-2">
                      {displayName(r)}
                    </td>
                    <td className="px-4 py-2">{r.score ?? '—'}</td>
                    <td className="px-4 py-2">
                      {r.projectLink ? (
                        <a
                          className="text-sky-300 hover:text-sky-200 underline"
                          href={r.projectLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hover tooltip */}
          {tooltip.show && tooltip.entry && (
            <div
              className="fixed z-50 max-w-xs p-3 rounded-lg border border-white/10 bg-black/80 text-slate-100 shadow-xl backdrop-blur-sm pointer-events-none"
              style={{ left: tooltip.x, top: tooltip.y }}
              role="tooltip"
            >
              <div className="text-sm font-semibold truncate">{displayName(tooltip.entry)}</div>
              <div className="mt-1 text-xs text-slate-300">
                <div><span className="text-slate-400">Title:</span> {tooltip.entry.title || '—'}</div>
                <div><span className="text-slate-400">Score:</span> {tooltip.entry.score ?? '—'}</div>
                {tooltip.entry.teamName ? (
                  <div><span className="text-slate-400">Team:</span> {tooltip.entry.teamName}</div>
                ) : null}
                {tooltip.entry.createdAt ? (
                  <div><span className="text-slate-400">Submitted:</span> {new Date(tooltip.entry.createdAt).toLocaleString()}</div>
                ) : null}
                {tooltip.entry.projectLink ? (
                  <div className="mt-1">
                    <a className="text-sky-300 hover:text-sky-200 underline" href={tooltip.entry.projectLink} target="_blank" rel="noreferrer">Open project ↗</a>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PodiumCard({ place, entry, heightClass, accent, crown, onEnter, onMove, onLeave }) {
  if (!entry) {
    // Placeholder to keep layout stable when <3 entries
    return (
      <div className={`rounded-xl border border-white/10 bg-white/[0.03] ${heightClass} p-4 flex items-end justify-center`}>
        <div className="text-slate-500 text-sm">TBD</div>
      </div>
    );
  }
  const name = entry.name || entry.teamName || '—';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const medal = place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉';

  return (
    <div
      className={`relative rounded-xl border border-white/10 bg-gradient-to-b ${accent} ${heightClass} p-4 flex flex-col justify-end overflow-hidden`}
      onMouseEnter={(e) => onEnter && onEnter(e)}
      onMouseMove={(e) => onMove && onMove(e)}
      onMouseLeave={() => onLeave && onLeave()}
    >
      {crown && (
        <div className="absolute -top-2 right-3 text-amber-300/80 rotate-12">👑</div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-black/30 backdrop-blur-sm" />
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-black/30 border border-white/10 grid place-items-center text-slate-200">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-slate-100 font-semibold truncate">{name}</div>
          <div className="text-slate-300 text-sm">Score: {entry.score ?? '—'}</div>
          {entry.projectLink ? (
            <a
              href={entry.projectLink}
              target="_blank"
              rel="noreferrer"
              className="text-sky-300 hover:text-sky-200 text-xs underline"
            >
              View project
            </a>
          ) : null}
        </div>
        <div className="ml-auto text-2xl" title={`#${place}`} aria-label={`#${place}`}>
          {medal}
        </div>
      </div>
    </div>
  );
}
