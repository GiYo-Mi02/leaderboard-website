import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global scroll-reveal: adds a subtle fade+translateY animation when elements enter the viewport.
 *
 * How it works:
 * - We observe any element with the class `reveal`.
 * - Additionally, on route changes we auto-tag common layout blocks with `reveal` unless they opt-out via `data-no-reveal`.
 * - When an observed element intersects, we add `is-visible` (CSS handles the transition), then unobserve.
 */
export default function ScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.add('is-visible');
            io.unobserve(el);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );

    function attach(el) {
      if (!el || el.dataset.noReveal === 'true') return;
      if (!el.classList.contains('reveal') && !el.classList.contains('is-visible')) {
        el.classList.add('reveal');
      }
      io.observe(el);
    }

    // Auto-tag sensible, non-intrusive blocks. Keep selectors conservative.
    function scan(root = document) {
    const candidates = root.querySelectorAll(
        [
          'section',
          '.rounded-2xl',
          '.card',
      '.grid > *',
      'table',
          'h1',
          'h2',
          'h3',
          'p',
          'li'
        ].join(',')
      );
      candidates.forEach((el) => attach(el));
    }

    // Initial scan after a tick (to ensure page is rendered)
    const t = setTimeout(() => scan(), 0);

    // Also watch DOM mutations to tag newly inserted nodes (e.g., modals).
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1) {
            scan(n);
          }
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(t);
      mo.disconnect();
      io.disconnect();
    };
  }, [location.pathname]);

  return null;
}
