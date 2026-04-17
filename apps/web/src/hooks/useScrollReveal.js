import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useScrollReveal
 * Attaches an IntersectionObserver to every element with class "reveal"
 * or "reveal-stagger". Adds "visible" when the element enters the viewport.
 *
 * Usage: call once in your top-level App component.
 *   import useScrollReveal from '@/hooks/useScrollReveal';
 *   const App = () => { useScrollReveal(); return <RouterOutlet />; }
 */
const useScrollReveal = () => {
  const location = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    // Small delay so new page content has rendered before we query
    const timer = setTimeout(() => {
      document
        .querySelectorAll('.reveal, .reveal-stagger')
        .forEach((el) => observer.observe(el));
    }, 50);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname, location.search]); // Re-run on page change or filter/query-param change
};

export default useScrollReveal;