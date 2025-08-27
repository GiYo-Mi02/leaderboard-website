import { useEffect, useMemo, useState } from 'react';
import api from '../shared/axiosClient';
import { Trophy, X } from 'lucide-react';
import usePolling from '../shared/usePolling';

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, entry: null });
  const [sortBy, setSortBy] = useState('score');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
  api.get('/api/leaderboard').then(res => {
      if (mounted) setRows(res.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  // Live updates via polling
  usePolling(async () => {
    try {
      const res = await api.get('/api/leaderboard');
      setRows(res.data || []);
    } catch {}
  }, 15000, []);

  const processed = useMemo(() => {
    let r = [...rows];
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((x) => (x.name || '').toLowerCase().includes(q) || (x.teamName || '').toLowerCase().includes(q) || (x.title || '').toLowerCase().includes(q));
    }
    if (sortBy === 'name') r.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    else if (sortBy === 'title') r.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    else r.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return r;
  }, [rows, sortBy, query]);

  const topThree = useMemo(() => processed.slice(0, 3), [processed]);

  // Fastest submission (earliest createdAt) among current dataset
  const fastestId = useMemo(() => {
    const withDates = processed.filter((x) => !!x.createdAt);
    if (!withDates.length) return null;
    const min = withDates.reduce((acc, cur) => (new Date(cur.createdAt) < new Date(acc.createdAt) ? cur : acc));
    return min?._id || min?.id || null;
  }, [processed]);

  const displayName = (r) => r?.name || r?.teamName || '—';
  const Avatar = ({ entry, size = 40 }) => {
    const name = displayName(entry);
    const initials = name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const src = entry?.profile?.avatarUrl;
    const dim = `${size}px`;
    return (
      <div
        className="rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center text-slate-200"
        style={{ width: dim, height: dim }}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm">{initials}</span>
        )}
      </div>
    );
  };

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
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        <div className="flex items-center gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, team, or title" className="w-56 rounded-lg border border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border border-white/10 bg-transparent text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-600">
            <option value="score">Sort by: Score</option>
            <option value="name">Sort by: Name</option>
            <option value="title">Sort by: Title</option>
          </select>
        </div>
      </div>
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
                {processed.map((r, idx) => (
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
                      <div className="flex items-center gap-3">
                        <Avatar entry={r} size={36} />
                        <div className="min-w-0">
                          <button className="text-sky-300 hover:text-sky-200 underline" onClick={() => setSelected(r)}>
                            {displayName(r)}
                          </button>
                          <div className="text-xs text-slate-400 truncate">{r.teamName || r.profile?.place || ''}</div>
                        </div>
                      </div>
                      {fastestId && (r._id === fastestId || r.id === fastestId) && (
                        <span className="ml-2 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-emerald-600/30 text-emerald-200 border border-emerald-500/40" title="Fastest Submission">⚡ Fastest</span>
                      )}
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
              <div className="text-sm font-semibold truncate flex items-center gap-2">
                <Avatar entry={tooltip.entry} size={24} />
                <span className="truncate">{displayName(tooltip.entry)}</span>
              </div>
              <div className="mt-1 text-xs text-slate-300">
                <div><span className="text-slate-400">Title:</span> {tooltip.entry.title || '—'}</div>
                <div><span className="text-slate-400">Score:</span> {tooltip.entry.score ?? '—'}</div>
                {tooltip.entry.teamName ? (
                  <div><span className="text-slate-400">Team:</span> {tooltip.entry.teamName}</div>
                ) : null}
                {tooltip.entry.profile?.place ? (
                  <div><span className="text-slate-400">Place:</span> {tooltip.entry.profile.place}</div>
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

          {/* Profile modal */}
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/70" onClick={() => setSelected(null)} />
              <div className="relative z-10 w-full max-w-xl mx-4 rounded-2xl border border-white/10 bg-black/70 backdrop-blur shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h3 className="text-white font-semibold">{displayName(selected)}</h3>
                  <button aria-label="Close" onClick={() => setSelected(null)} className="text-slate-300 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-4 text-slate-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar entry={selected} size={48} />
                    <div>
                      <div className="text-white font-semibold">{displayName(selected)}</div>
                      <div className="text-slate-400 text-sm">{selected.teamName || selected.profile?.place || ''}</div>
                    </div>
                  </div>
                  {selected.screenshotUrl ? (
                    <img src={selected.screenshotUrl} alt="Project preview" className="w-full h-48 object-cover rounded-lg border border-white/10" />
                  ) : null}
                  <div><span className="text-slate-400">Title:</span> {selected.title || '—'}</div>
                  <div><span className="text-slate-400">Score:</span> {selected.score ?? '—'}</div>
                  <div className="truncate"><span className="text-slate-400">Link:</span> {selected.projectLink ? (<a className="text-sky-300 hover:text-sky-200 underline" href={selected.projectLink} target="_blank" rel="noreferrer">Open project ↗</a>) : '—'}</div>
                  {selected.profile?.bio ? (
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{selected.profile.bio}</p>
                  ) : null}
                  {selected.description ? (
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{selected.description}</p>
                  ) : null}
                </div>
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
        <PodiumAvatar entry={entry} />
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

function PodiumAvatar({ entry }) {
  const name = entry?.name || entry?.teamName || '';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const src = entry?.profile?.avatarUrl;
  return (
    <div className="w-12 h-12 rounded-full overflow-hidden bg-black/30 border border-white/10 grid place-items-center text-slate-200">
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
}
