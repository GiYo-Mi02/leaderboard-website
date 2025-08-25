import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Trophy, Users, CalendarDays, Info, Star } from 'lucide-react';
import judge1 from '../assets/judgepic1.webp';
import judge2 from '../assets/jusdgepic2.webp';
import judge3 from '../assets/judgepic3.webp';
import Countdown from '../shared/Countdown';

export default function LandingPage() {
  const [selectedPrize, setSelectedPrize] = useState(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setSelectedPrize(null);
    }
    if (selectedPrize) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedPrize]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Decorative glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full bg-rose-700/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-[520px] h-[520px] rounded-full bg-sky-600/15 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-white"
          >
            Build. Impress. Win.
          </motion.h1>
          <p className="mt-4 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            A modern website-making contest focused on real-world UX, accessibility, and performance.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center rounded-xl bg-rose-600 text-white font-semibold px-6 py-3 shadow-lg shadow-rose-900/40 hover:bg-rose-500 transition-all transform hover:-translate-y-0.5 hover:shadow-rose-500/40"
            >
              Register Now
            </a>
            <a
              href="#about"
              className="inline-flex items-center rounded-xl border border-white/15 px-6 py-3 text-slate-200 transition-all transform hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/25"
            >
              Learn More
            </a>
          </div>
          <div className="mt-10">
            <Countdown deadline={new Date(Date.now() + 1000 * 60 * 60 * 24 * 10)} />
          </div>
        </div>
      </section>

      {/* Info */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-6">
        {[{
          icon: <CalendarDays className="w-6 h-6" />, title: 'Timeline', content: 'Submission deadline in 10 days. Results announced a week later.'
        }, {
          icon: <Info className="w-6 h-6" />, title: 'Rules', content: 'Original work only, no plagiarism, team up to 3, and follow code of conduct.'
        }, {
          icon: <Users className="w-6 h-6" />, title: 'Guidelines', content: 'Responsive design, accessibility, performance, and clear documentation.'
        }].map((card, i) => (
          <div
            key={i}
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm text-slate-200 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-lg hover:shadow-rose-900/20"
          >
            <div className="flex items-center gap-3 text-sky-300 transition-colors group-hover:text-sky-200">{card.icon}<h3 className="font-semibold">{card.title}</h3></div>
            <p className="mt-2 text-slate-300">{card.content}</p>
          </div>
        ))}
      </section>

      {/* Prizes */}
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white">Prizes</h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                key: 'first',
                place: '1st Place',
                ring: 'ring-yellow-400/60',
                headline: 'Grand Champion',
                rewards: ['$1,000 Cash', 'Exclusive Swag Kit', 'Certificate of Excellence', 'Feature on Homepage'],
                details: 'Awarded to the top-scoring submission across design, UX, and performance.',
                tips: ['Lead with clarity: a focused hero and clear CTA.', 'Audit with Lighthouse and fix CWV issues.', 'Showcase accessibility: keyboard nav, color contrast.', 'Document your decisions concisely.'],
              },
              {
                key: 'second',
                place: '2nd Place',
                ring: 'ring-slate-300/50',
                headline: 'Runner-up',
                rewards: ['$500 Cash', 'Swag Kit', 'Certificate', 'Blog Feature'],
                details: 'Recognizes an outstanding build with strong execution and polish.',
                tips: ['Keep the layout responsive from the start.', 'Compress and lazy-load images.', 'Use semantic HTML for better SEO and a11y.'],
              },
              {
                key: 'third',
                place: '3rd Place',
                ring: 'ring-amber-300/60',
                headline: 'People’s Choice',
                rewards: ['$250 Cash', 'Swag', 'Certificate'],
                details: 'Community favorite voted by participants and viewers.',
                tips: ['Add delightful micro-interactions.', 'Tell a story in your copy.', 'Polish visuals: consistent spacing and typography.'],
              },
            ].map((p, i) => (
              <button
                type="button"
                key={p.key}
                onClick={() => setSelectedPrize(p)}
                className={`text-left group rounded-2xl p-6 border border-white/10 bg-white/5 shadow-sm ring-1 ${p.ring} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-offset-2 hover:ring-offset-rose-900/20`}
              >
                <div className="h-24 rounded-xl bg-gradient-to-r from-rose-700 to-rose-500 grid place-items-center text-white font-bold text-xl transition-colors group-hover:from-rose-600 group-hover:to-rose-400">
                  <div className="flex items-center gap-2"><Trophy /> {p.place}</div>
                </div>
                <ul className="mt-4 text-slate-300 list-disc list-inside space-y-1">
                  {p.rewards.slice(0,3).map((r, idx) => (<li key={idx}>{r}</li>))}
                  <li className="text-sky-300 group-hover:text-sky-200">View details →</li>
                </ul>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Modal */}
      {selectedPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedPrize(null)} />
          <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-xl mx-4 rounded-2xl border border-white/10 bg-black/70 backdrop-blur shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{selectedPrize.place} · {selectedPrize.headline}</h3>
                <button className="text-slate-300 hover:text-white" onClick={() => setSelectedPrize(null)}>Close</button>
              </div>
              <p className="mt-2 text-slate-300">{selectedPrize.details}</p>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h4 className="font-semibold text-white">Rewards</h4>
                  <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
                    {selectedPrize.rewards.map((r, idx) => (<li key={idx}>{r}</li>))}
                  </ul>
                </div>
                {selectedPrize.tips && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <h4 className="font-semibold text-white">Tips & Tricks</h4>
                    <ul className="mt-2 list-disc list-inside text-slate-300 space-y-1">
                      {selectedPrize.tips.map((t, idx) => (<li key={idx}>{t}</li>))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Judges */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold text-white">Judges & Organizers</h2>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { img: judge1, name: 'Alex Kim', role: 'Staff Engineer · Frontend' },
            { img: judge2, name: 'Priya Sharma', role: 'Design Lead · UX' },
            { img: judge3, name: 'Diego Martinez', role: 'Performance Eng · Core Web Vitals' },
          ].map((j, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, rotate: -0.4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm transition-colors hover:border-white/20"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10">
                <img src={j.img} alt={j.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="mt-4 font-semibold text-white">{j.name}</h3>
              <p className="text-sm text-slate-300">{j.role}</p>
              <div className="mt-2 flex gap-1 text-amber-400"><Star /><Star /><Star /><Star /><Star /></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tips & Tricks */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold text-white">Tips & Tricks</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {[{
            title: 'Performance first',
            content: 'Optimize images, use preconnect, and ship less JS. Aim for green CWV.'
          }, {
            title: 'Accessible by design',
            content: 'Use semantic elements, ARIA only when needed, and ensure keyboard support.'
          }, {
            title: 'Polish the details',
            content: 'Consistent spacing, readable typography, and subtle motion go a long way.'
          }].map((t, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
              <h3 className="font-semibold text-white">{t.title}</h3>
              <p className="mt-2 text-slate-300">{t.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
