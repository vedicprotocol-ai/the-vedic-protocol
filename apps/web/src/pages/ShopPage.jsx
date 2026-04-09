import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useCart } from '@/contexts/CartContext.jsx';

/* ─── Fallback images by category ─────────────────────────── */
const FALLBACK = {
  cleanser:    'https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/bb1bbc42d8f802318cafc4cce523af40.jpg',
  even:        'https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/364e063677ed92860e4ca29d681e1311.jpg',
  odd:         'https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/bec1a032047b5db45bf2f3caadb360bc.jpg',
};

const getImage = (product, index) => {
  if (product.image) return pb.files.getUrl(product, product.image);
  const name = product.name?.toLowerCase() || '';
  if (name.includes('cleanser') || name.includes('face wash')) return FALLBACK.cleanser;
  return index % 2 === 0 ? FALLBACK.even : FALLBACK.odd;
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
const QuickView = ({ product, index, onClose, onAddToCart }) => {
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

  const imgSrc = getImage(product, index);
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
          <img src={imgSrc} alt={product.name} className="qv-img" />
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
   PRODUCT CARD
═══════════════════════════════════════════════════ */
const ProductCardItem = ({ product, index, onQuickView }) => {
  const imgSrc = getImage(product, index);
  const categoryLabel =
    product.category === 'haircare' ? 'Haircare' :
    product.category === 'skincare' ? 'Skincare' :
    product.category || 'Formulation';

  return (
    <article className="product-card" aria-label={product.name}>
      {/* Image */}
      <div className="product-card__img-wrap">
        <Link to={`/product/${product.id}`} tabIndex={-1} aria-hidden="true">
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            className="product-card__img"
          />
        </Link>

        {/* Category badge on image */}
        <span className="product-card__cat-badge">{categoryLabel}</span>

        {/* Quick view trigger */}
        <button
          className="product-card__quick"
          onClick={() => onQuickView(product, index)}
          aria-label={`Quick view ${product.name}`}
        >
          Quick View
        </button>
      </div>

      {/* Body */}
      <div className="product-card__body">
        <p className="section-label">{categoryLabel}</p>
        <Link to={`/product/${product.id}`}>
          <h2 className="product-card__name">{product.name}</h2>
        </Link>
        <p className="product-card__hint">
          {product.tagline || product.description?.slice(0, 80) || 'Clinical botanical formulation.'}
        </p>
        <div className="product-card__footer">
          <span className="product-card__price">₹{product.price?.toFixed(0)}</span>
          <button
            className="btn btn-dark btn-sm"
            onClick={() => onQuickView(product, index)}
          >
            Add to Ritual
          </button>
        </div>
      </div>
    </article>
  );
};

/* ─── Skeleton card ─────────────────────────────── */
const SkeletonCard = () => (
  <div className="product-card product-card--skeleton" aria-hidden="true">
    <div className="product-card__img-wrap">
      <div className="skeleton-block" style={{ aspectRatio: '3/4', width: '100%' }} />
    </div>
    <div className="product-card__body">
      <div className="skeleton-line skeleton-line--sub" style={{ width: '40%', marginBottom: '10px' }} />
      <div className="skeleton-line skeleton-line--title" style={{ marginBottom: '10px' }} />
      <div className="skeleton-line skeleton-line--sub" />
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   SHOP PAGE
═══════════════════════════════════════════════════ */
export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  /* Initialise filter from URL (?category=skincare from homepage cards) */
  const initFilter = () => {
    const cat = searchParams.get('category');
    if (cat === 'skincare' || cat === 'haircare') return cat;
    return 'all';
  };

  const [filter, setFilter]         = useState(initFilter);
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [quickView, setQuickView]   = useState(null); // { product, index }
  const [addedToast, setAddedToast] = useState(null);

  const fetchProducts = useCallback(async (cat) => {
    setLoading(true);
    try {
      const filterStr = cat !== 'all' ? `category = "${cat}"` : '';
      const res = await pb.collection('products').getList(1, 60, {
        filter: filterStr,
        sort: '-created',
        $autoCancel: false,
      });
      setProducts(res.items);
    } catch (e) {
      console.error('Shop fetch error:', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(filter); }, [filter]);

  const handleFilter = (key) => {
    setFilter(key);
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
            <p className="page-hero-label">The Collection</p>
            <h1 className="shop-hero__h1">
              Clinical<br /><em>formulations.</em>
            </h1>
            <p className="shop-hero__sub">
              Every formulation exists for a reason. PhD-formulated,
              100% botanical, zero synthetics.
            </p>
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
                {filter === f.key && products.length > 0 && !loading && (
                  <span className="shop-filter-pill__count">{products.length}</span>
                )}
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
          ) : products.length === 0 ? (
            <div className="shop-empty reveal">
              <p className="shop-empty__title">No formulations found.</p>
              <p className="shop-empty__sub">Try a different filter or check back soon.</p>
              <button className="btn btn-light" onClick={() => handleFilter('all')}>
                View All Formulations
              </button>
            </div>
          ) : (
            <div className="shop-grid reveal-stagger">
              {products.map((p, i) => (
                <ProductCardItem
                  key={p.id}
                  product={p}
                  index={i}
                  onQuickView={(prod, idx) => setQuickView({ product: prod, index: idx })}
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
          product={quickView.product}
          index={quickView.index}
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