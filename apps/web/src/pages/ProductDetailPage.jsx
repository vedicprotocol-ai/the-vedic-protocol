import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import supabase, { getImageUrl } from '@/lib/supabaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useCart } from '@/contexts/CartContext.jsx';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [openAcc, setOpenAcc] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) throw error;
        setProduct(data);
        if (data.category) {
          const { data: rel } = await supabase.from('products').select('*')
            .eq('category', data.category).neq('id', id).limit(3);
          setRelated(rel ?? []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const getImage = (p) => getImageUrl(p.image_url);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <>
      <Header />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" role="status" aria-label="Loading product"></div>
      </div>
      <Footer />
    </>
  );

  if (!product) return (
    <>
      <Header />
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '32px', color: 'var(--ink)' }}>Formulation not found.</h1>
        <Link to="/shop" className="btn btn-light">Return to Shop</Link>
      </div>
      <Footer />
    </>
  );

  const accordions = [
    ['Clinical Intent', product.benefits || 'Formulated to optimise barrier function and restore cellular homeostasis through targeted botanical actives.'],
    ['Active Ingredients', product.ingredients || 'Proprietary botanical complex. Full ingredient list available on packaging.'],
    ['Protocol Instructions', product.how_to_use || 'Apply 2–3 drops to cleansed skin morning and evening. Pat gently until absorbed.'],
  ];

  return (
    <>
      <Helmet>
        <title>{`${product.name} | The Vedic Protocol`}</title>
        <meta name="description" content={product.description || `${product.name} — clinical Ayurvedic formulation by The Vedic Protocol. PhD-formulated, 100% botanical.`} />
        <link rel="canonical" href={`https://www.thevedicprotocol.com/product/${product.id}`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context":"https://schema.org","@type":"Product",
          "name": product.name,
          "description": product.description,
          "brand": { "@type": "Brand", "name": "The Vedic Protocol" },
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock",
            "seller": { "@type": "Organization", "name": "The Vedic Protocol" }
          }
        })}</script>
      </Helmet>
      <Header />
      <main id="main">

        {/* Breadcrumb */}
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '20px 40px', borderBottom: '1px solid var(--line)' }}>
          <nav aria-label="Breadcrumb">
            <ol style={{ display: 'flex', gap: '8px', listStyle: 'none', fontSize: '11px', color: 'var(--ink-4)' }}>
              <li><Link to="/" style={{ color: 'var(--ink-4)' }}>Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link to="/shop" style={{ color: 'var(--ink-4)' }}>Shop</Link></li>
              <li aria-hidden="true">/</li>
              <li style={{ color: 'var(--ink)' }} aria-current="page">{product.name}</li>
            </ol>
          </nav>
        </div>

        {/* Main product section */}
        <div className="pdp-layout">

          {/* Image */}
          <div className="pdp-img-wrap">
            {getImage(product)
              ? <img src={getImage(product)} alt={product.name} className="pdp-img" loading="eager" fetchPriority="high" />
              : <div className="pdp-img-placeholder" />
            }
          </div>

          {/* Details */}
          <div>
            {product.category && <span className="badge badge-outline" style={{ marginBottom: '20px', display: 'inline-block' }}>{product.category}</span>}
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.1, marginBottom: '16px' }}>{product.name}</h1>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--ink)', marginBottom: '24px' }}>₹{product.price?.toFixed(0)}</p>
            <p style={{ fontSize: '14px', color: 'var(--ink-3)', lineHeight: 1.9, marginBottom: '36px' }}>{product.description}</p>

            {/* Qty + Add */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '36px', paddingBottom: '36px', borderBottom: '1px solid var(--line)' }}>
              <div className="qty-ctrl" role="group" aria-label="Quantity">
                <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">
                  <svg width="12" height="2" viewBox="0 0 12 2" fill="none"><path d="M1 1h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
                <span className="qty-val" aria-live="polite">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(qty + 1)} aria-label="Increase quantity">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
              <button className="btn btn-dark" style={{ flex: 1 }} onClick={handleAdd} aria-label={`Add ${qty} ${product.name} to cart`}>
                {added ? 'Added ✓' : 'Add to Protocol'}
              </button>
            </div>

            {/* Accordions */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {accordions.map(([t,d], i) => (
                <div key={t} style={{ borderTop: '1px solid var(--line)', borderBottom: i === accordions.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <button
                    onClick={() => setOpenAcc(openAcc === i ? null : i)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '16px' }}
                    aria-expanded={openAcc === i}
                  >
                    <span style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--ink)' }}>{t}</span>
                    <span style={{ fontSize: '18px', color: 'var(--gold)', transform: openAcc === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.25s', flexShrink: 0 }}>+</span>
                  </button>
                  {openAcc === i && (
                    <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.85, paddingBottom: '20px' }}>{d}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '32px' }}>
              {['PhD Formulated','100% Botanical','Cruelty Free','Vegan'].map(b => (
                <span key={b} className="badge badge-outline" style={{ fontSize: '9px' }}>{b}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ borderTop: '1px solid var(--line)', padding: '80px 40px', maxWidth: 'var(--max)', margin: '0 auto' }}>
            <p className="section-label">You May Also Need</p>
            <h2 className="section-h2" style={{ marginBottom: '48px' }}>Complementary<br /><em>formulations.</em></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '32px' }}>
              {related.map(r => (
                <article key={r.id}>
                  <Link to={`/product/${r.id}`} className="pdp-related-img-wrap">
                    {getImage(r)
                      ? <img src={getImage(r)} alt={r.name} className="pdp-related-img" loading="lazy" />
                      : <div className="pdp-img-placeholder" />
                    }
                  </Link>
                  <Link to={`/product/${r.id}`}>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: '17px', fontWeight: 400, color: 'var(--ink)', marginBottom: '6px' }}>{r.name}</h3>
                  </Link>
                  <span style={{ fontSize: '14px', color: 'var(--ink)' }}>₹{r.price?.toFixed(0)}</span>
                </article>
              ))}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </>
  );
};

export default ProductDetailPage;