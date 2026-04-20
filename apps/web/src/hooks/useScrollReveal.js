import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useScrollReveal
 * Attaches an IntersectionObserver to every element with class "reveal"
 * or "reveal-stagger". Adds "visible" when the element enters the viewport.
 *
 * Also watches the DOM via MutationObserver so elements that mount *after*
 * the initial paint (e.g. the shop grid once products load from Supabase)
 * are automatically observed the moment they appear.
 *
 * Belt-and-suspenders: if an element is already fully inside the viewport
 * when it mounts and the IntersectionObserver hasn't fired within 400 ms,
 * we force .visible directly (handles very fast initial paints and cases
 * where IO callbacks are delayed by the browser's task queue).
 *
 * Usage: call once in your top-level App component.
 *   import useScrollReveal from '@/hooks/useScrollReveal';
 *   const App = () => { useScrollReveal(); return <RouterOutlet />; }
 */

const REVEAL_SELECTOR = '.reveal, .reveal-stagger';
const IO_THRESHOLD    = 0.12;
const FALLBACK_MS     = 400;

const useScrollReveal = () => {
  const location = useLocation();

  useEffect(() => {
    // Per-effect collections — cleaned up on unmount / location change.
    const observed  = new WeakSet();
    const timers    = [];

    /* ── IntersectionObserver ──────────────────────────────────── */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: IO_THRESHOLD },
    );

    /* ── Start observing a single element ─────────────────────── */
    const observeEl = (el) => {
      // Skip if already processed or already visible.
      if (observed.has(el) || el.classList.contains('visible')) return;
      observed.add(el);
      io.observe(el);

      // Belt-and-suspenders fallback: if the element is in the viewport
      // but IO hasn't fired within FALLBACK_MS, add .visible manually.
      const t = setTimeout(() => {
        if (el.classList.contains('visible')) return; // IO already handled it
        const r = el.getBoundingClientRect();
        const inViewport =
          r.top  < window.innerHeight && r.bottom > 0 &&
          r.left < window.innerWidth  && r.right  > 0;
        if (inViewport) {
          el.classList.add('visible');
          io.unobserve(el);
        }
      }, FALLBACK_MS);

      timers.push(t);
    };

    /* ── Initial DOM scan (small delay for React to flush) ─────── */
    const initialTimer = setTimeout(() => {
      document.querySelectorAll(REVEAL_SELECTOR).forEach(observeEl);
    }, 50);

    /* ── MutationObserver — catches late-mounting elements ─────── *
     * This is the key fix for the shop grid:                       *
     * The .shop-grid.reveal-stagger node only exists in the DOM    *
     * after the Supabase fetch resolves and React re-renders.      *
     * MutationObserver sees the insertion and calls observeEl      *
     * immediately, so the IO is wired up synchronously on mount.   */
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;

          // The added node itself may be a reveal element.
          if (node.matches(REVEAL_SELECTOR)) {
            observeEl(node);
          }

          // Or it may contain reveal elements as descendants.
          node.querySelectorAll(REVEAL_SELECTOR).forEach(observeEl);
        }
      }
    });

    mo.observe(document.body, { childList: true, subtree: true });

    /* ── Cleanup ───────────────────────────────────────────────── */
    return () => {
      clearTimeout(initialTimer);
      timers.forEach(clearTimeout);
      io.disconnect();
      mo.disconnect();
    };
  }, [location.pathname, location.search]); // Re-run on page change or filter/query-param change
};

export default useScrollReveal;