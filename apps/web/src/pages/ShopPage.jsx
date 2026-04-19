import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import supabase, { getImageUrl } from '@/lib/supabaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useCart } from '@/contexts/CartContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

/* ─── Resolve image URL from DB only — no fallbacks ───────── */
const getImage = (product) => {
  if (product.image_url) return getImageUrl(product.image_url);
  return null;
};

/* ─── Filter config ────────────────────────────────────────── */
const FILTERS = [
  { key: 'all',       label: 'All Formulations' },
  { key: 'skincare',  label: 'Skincare' },
  { key: 'haircare',  label: 'Haircare' },
];

/* ─── Close on Escape / outside click ─────────────────────── */
const useCloseOnEscape = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);
};

/* ═══════════════════════════════════════════════════
   QUICK VIEW MODAL
═══════════════════════════════════════════════════ */
const QuickView = ({ product, onClose, onAddToCart }) => {
  const overlayRef = useRef(null);
  useCloseOnEscape(true, onClose);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const imgSrc = getImage(product);
  const categoryLabel =
    product.category === 'haircare' ? 'Haircare' :
    product.category === 'skincare' ? 'Skincare' :
    product.category || 'Formulation';

  return (
    <div
      className="qv-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
    >
      <div className="qv-panel">
        {/* Close button */}
        <button className="qv-close" onClick={onClose} aria-label="Close quick view">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Image */}
        <div className="qv-img-wrap">
          {imgSrc
            ? <img src={imgSrc} alt={product.name} className="qv-img" />
            : <div className="qv-img-placeholder" />
          }
        </div>

        {/* Details */}
        <div className="qv-body">
          <p className="section-label">{categoryLabel}</p>
          <h2 className="qv-title">{product.name}</h2>
          <p className="qv-price">₹{product.price?.toFixed(0)}</p>
          <p className="qv-desc">
            {product.description || 'A clinical botanical formulation drawn from ancient Ayurvedic pharmacology and validated by modern dermatological science.'}
          </p>

          {/* Key ingredients strip */}
          {product.ingredients && (
            <div className="qv-ingredients">
              <p className="qv-ingredients__label">Key Actives</p>
              <p className="qv-ingredients__list">{product.ingredients}</p>
            </div>
          )}

          {/* Badges */}
          <div className="qv-badges">
            {['100% Botanical', 'Zero Synthetics', 'PhD Formulated'].map((b) => (
              <span key={b} className="qv-badge">{b}</span>
            ))}
          </div>

          {/* Actions */}
          <div className="qv-actions">
            <button
              className="btn btn-dark btn-full"
              onClick={() => { onAddToCart(product); onClose(); }}
            >
              Add to Ritual
            </button>
            <Link to={`/product/${product.id}`} className="btn btn-light btn-full qv-view-btn">
              Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   PRODUCT CARD — compact square tile
═══════════════════════════════════════════════════ */
const ProductCardItem = ({ product, onQuickView }) => {
  const imgSrc = getImage(product);
  const categoryLabel =
    product.category === 'haircare' ? 'Haircare' :
    product.category === 'skincare' ? 'Skincare' :
    product.category || 'Formulation';

  return (
    <article className="product-card" aria-label={product.name}>
      <div className="product-card__img-wrap">
        <Link to={`/product/${product.id}`} tabIndex={-1} aria-hidden="true">
          {imgSrc
            ? <img src={imgSrc} alt={product.name} loading="lazy" className="product-card__img" />
            : <div className="product-card__no-img" />
          }
        </Link>

        {/* Category badge */}
        <span className="product-card__cat-badge">{categoryLabel}</span>

        {/* Name + price overlay */}
        <div className="product-card__overlay">
          <Link to={`/product/${product.id}`}>
            <h2 className="product-card__name">{product.name}</h2>
          </Link>
          <span className="product-card__price">₹{product.price?.toFixed(0)}</span>
        </div>

        {/* Add to Ritual on hover */}
        <button
          className="product-card__quick"
          onClick={() => onQuickView(product)}
          aria-label={`Add ${product.name} to ritual`}
        >
          Add to Ritual
        </button>
      </div>
    </article>
  );
};

/* ─── Skeleton card ─────────────────────────────── */
const SkeletonCard = () => (
  <div className="product-card product-card--skeleton" aria-hidden="true">
    <div className="product-card__img-wrap">
      <div className="skeleton-block" style={{ width: '100%', height: '100%' }} />
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   SHOP PAGE
═══════════════════════════════════════════════════ */
export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();

  // Detect new-user welcome flag (?welcome=1) and clear it from the URL
  // immediately so a page refresh doesn't re-show the banner.
  const isWelcome = searchParams.get('welcome') === '1';
  useEffect(() => {
    if (isWelcome) {
      setSearchParams((prev) => {
        prev.delete('welcome');
        return prev;
      }, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Always land on "all" — user navigates to a category via the filter pills
  const [filter, setFilter]         = useState('all');
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [quickView, setQuickView]   = useState(null); // product object
  const [addedToast, setAddedToast] = useState(null);

  // Ref to the product grid — used for the local reveal fallback below.
  const gridRef = useRef(null);

  // Keep a ref to the current filter so async callbacks (realtime, focus)
  // always use the latest value without creating stale closures.
  const filterRef = useRef(filter);
  useEffect(() => { filterRef.current = filter; }, [filter]);

  const fetchProducts = useCallback(async (cat) => {
    setLoading(true);
    setFetchError(null);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created', { ascending: false })
        .limit(60);
      if (cat !== 'all') query = query.eq('category', cat);
      const { data, error } = await query;
      if (error) throw error;
      setProducts(data ?? []);
    } catch (e) {
      console.error('Shop fetch error:', e);
      setFetchError(e.message || 'Failed to load products.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and whenever the active filter changes.
  useEffect(() => { fetchProducts(filter); }, [filter, fetchProducts]);

  // ── Local reveal fallback ─────────────────────────────────────────────────
  // The global MutationObserver in useScrollReveal is the primary mechanism
  // for adding .visible to .reveal-stagger elements. However, when the user
  // switches filter tabs, setSearchParams changes location.search at the same
  // instant as the filter state update, causing useScrollReveal to tear down
  // and rebuild its observers. In that narrow window the new product grid can
  // mount before the new MutationObserver is observing — leaving it at
  // opacity: 0 (the "blank screen" after a filter switch).
  //
  // This effect runs whenever loading transitions false and products exist,
  // i.e. exactly once per successful fetch. It gives the global IO ~80 ms to
  // fire naturally; if it hasn't, we add .visible directly.
  useEffect(() => {
    if (loading || products.length === 0) return;
    const el = gridRef.current;
    if (!el) return;
    if (el.classList.contains('visible')) return; // already handled by global IO

    const t = setTimeout(() => {
      if (el && !el.classList.contains('visible')) {
        el.classList.add('visible');
      }
    }, 80);

    return () => clearTimeout(t);
  }, [loading, products]);

  // ── Live sync ────────────────────────────────────────────────────────────
  // 1. Supabase Realtime: immediately reflect any INSERT / UPDATE / DELETE on
  //    the products table — covers products added from the admin panel while
  //    the shop page is open.
  // 2. window "focus": re-fetch when the user returns to this browser window
  //    or tab after working in the admin panel.
  // 3. document "visibilitychange": re-fetch when the tab becomes visible
  //    again (covers browser-tab switching).
  // filterRef ensures the callbacks always use the current filter without
  // needing to recreate the listeners on every filter change.
  useEffect(() => {
    const refetch = () => fetchProducts(filterRef.current);

    // Supabase Realtime subscription
    const channel = supabase
      .channel('shop-products-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        refetch,
      )
      .subscribe();

    // Re-fetch on window focus (switching from another app or browser window)
    window.addEventListener('focus', refetch);

    // Re-fetch when this tab becomes visible again
    const handleVisibility = () => { if (!document.hidden) refetch(); };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', refetch);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchProducts]); // fetchProducts is stable (useCallback with [])

  const handleFilter = (key) => {
    // Guard: clicking the already-active tab is a no-op. Without this, the
    // setLoading(true) below would fire but filter wouldn't change, so the
    // [filter] effect would never re-run and loading would stay true forever
    // (permanent skeleton). Applies to All Formulations, Skincare, and Haircare.
    if (key === filter) return;

    // Pre-set loading=true so React 18 batches it with setFilter in the same
    // click-event flush. This prevents the one-render window where
    // loading=false and products=[] would briefly show "No formulations found"
    // before the [filter] effect fires and fetchProducts sets loading=true.
    // This fix is identical for all three filter values (all / skincare / haircare).
    setFilter(key);
    setLoading(true);
    setSearchParams(key === 'all' ? {} : { category: key });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product) => {
    if (addToCart) addToCart(product, 1);
    setAddedToast(product.name);
    setTimeout(() => setAddedToast(null), 2500);
  };

  return (
    <>
      <Helmet>
        <title>Formulations | The Vedic Protocol</title>
        <meta
          name="description"
          content="Shop The Vedic Protocol's clinical Ayurvedic skincare and haircare formulations. PhD-formulated, 100% botanical, zero synthetics."
        />
        <link rel="canonical" href="https://www.thevedicprotocol.com/shop" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Formulations — The Vedic Protocol',
          description: 'Clinical Ayurvedic skincare and haircare formulations. PhD-formulated, 100% botanical.',
          url: 'https://www.thevedicprotocol.com/shop',
        })}</script>
      </Helmet>

      <Header />

      <main id="main">

        {/* ── Page hero ── */}
        <div className="shop-hero reveal">
          <div className="shop-hero__text">
            {isWelcome ? (
              <>
                <p className="page-hero-label">Welcome to The Vedic Protocol</p>
                <h1 className="shop-hero__h1">
                  {currentUser?.name
                    ? <>{currentUser.name.split(' ')[0]},<br /><em>begin your protocol.</em></>
                    : <>Begin your<br /><em>protocol.</em></>
                  }
                </h1>
                <p className="shop-hero__sub">
                  Your account is ready. Explore our PhD-formulated, 100% botanical
                  formulations and find the ritual that's right for you.
                </p>
              </>
            ) : (
              <>
                <p className="page-hero-label">The Collection</p>
                <h1 className="shop-hero__h1">
                  Clinical<br /><em>formulations.</em>
                </h1>
                <p className="shop-hero__sub">
                  Every formulation exists for a reason. PhD-formulated,
                  100% botanical, zero synthetics.
                </p>
              </>
            )}
          </div>

          {/* Pill filter row */}
          <div className="shop-filters" role="tablist" aria-label="Filter by category">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                role="tab"
                aria-selected={filter === f.key}
                className={`shop-filter-pill${filter === f.key ? ' shop-filter-pill--active' : ''}`}
                onClick={() => handleFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Product grid ── */}
        <div className="shop-grid-wrap">
          {loading ? (
            <div className="shop-grid">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : fetchError ? (
            <div className="shop-empty reveal">
              <p className="shop-empty__title">Could not load formulations.</p>
              <p className="shop-empty__sub">{fetchError}</p>
              <button className="btn btn-light" onClick={() => fetchProducts(filter)}>
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="shop-empty reveal">
              <p className="shop-empty__title">No formulations found.</p>
              <p className="shop-empty__sub">Try a different filter or check back soon.</p>
              <button className="btn btn-light" onClick={() => handleFilter('all')}>
                View All Formulations
              </button>
            </div>
          ) : (
            <div className="shop-grid reveal-stagger" ref={gridRef}>
              {products.map((p) => (
                <ProductCardItem
                  key={p.id}
                  product={p}
                  onQuickView={(prod) => setQuickView(prod)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Philosophy strip ── */}
        <div className="shop-footer-strip reveal">
          <div className="shop-footer-strip__inner">
            {[
              ['100%', 'Botanical'],
              ['PhD', 'Formulated'],
              ['Zero', 'Synthetics'],
              ['Clinical', 'Testing'],
            ].map(([n, l]) => (
              <div key={l} className="shop-footer-strip__stat">
                <span className="shop-footer-strip__n">{n}</span>
                <span className="shop-footer-strip__l">{l}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />

      {/* ── Quick View modal ── */}
      {quickView && (
        <QuickView
          product={quickView}
          onClose={() => setQuickView(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* ── Add to cart toast ── */}
      {addedToast && (
        <div className="cart-toast" role="status" aria-live="polite">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {addedToast} added to your ritual.
        </div>
      )}
    </>
  );
};

export default ShopPage;