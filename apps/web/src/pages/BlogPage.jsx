import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams, useSearchParams, useLocation } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import BlogCard from '@/components/BlogCard.jsx';
import supabase from '@/lib/supabaseClient.js';

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const mapPost = (p) => {
  const rawDate = p.created_at || p.created;
  let date = '';
  try {
    date = rawDate
      ? new Date(rawDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      : '';
  } catch {
    date = '';
  }
  return {
    slug: p.slug,
    type: p.type || 'journal',
    title: p.title || '',
    excerpt: p.excerpt || '',
    body: p.content || '',
    readTime: p.read_time || 5,
    date,
    image: p.image_url || '',
    relatedCategory: p.related_category || 'skincare',
  };
};

/* ─────────────────────────────────────────────────────────────
   READING PROGRESS BAR
───────────────────────────────────────────────────────────── */
const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="reading-progress" aria-hidden="true">
      <div className="reading-progress__bar" style={{ width: `${progress}%` }} />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   BLOG LIST VIEW
───────────────────────────────────────────────────────────── */
const BlogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'research' ? 'research' : 'journal';
  const [allPosts, setAllPosts] = useState(null); // null = loading
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: items, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('created', { ascending: false })
          .limit(100);

        if (cancelled) return;
        if (error) throw error;
        setAllPosts(items ? items.map(mapPost) : []);
      } catch (err) {
        console.error('[BlogList] Failed to fetch blog posts:', err);
        if (!cancelled) {
          setFetchError(err?.message || 'Failed to load articles.');
          setAllPosts([]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = (allPosts ?? []).filter((p) => p.type === activeTab);

  const setTab = (tab) => {
    setSearchParams(tab === 'journal' ? {} : { tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>
          {activeTab === 'research' ? 'Research Journal' : 'The Journal'} | The Vedic Protocol
        </title>
        <meta
          name="description"
          content="Ayurvedic wisdom, clinical research, and formulation science — explained clearly by Dr. Sonam, PhD."
        />
        <link rel="canonical" href="https://www.thevedicprotocol.com/blog" />
      </Helmet>

      {/* Page hero */}
      <div className="blog-hero reveal">
        <p className="section-label">Knowledge &amp; Science</p>
        <h1 className="blog-hero__h1">
          The Journal.<br />
          <em>Ancient wisdom, explained.</em>
        </h1>
        <p className="blog-hero__sub">
          Clinical breakdowns, formulation notes, and Ayurvedic philosophy — written
          by Dr. Sonam for anyone who wants to understand, not just believe.
        </p>

        {/* Tab toggle */}
        <div className="blog-tabs" role="tablist" aria-label="Content type">
          <button
            role="tab"
            aria-selected={activeTab === 'journal'}
            className={`blog-tab${activeTab === 'journal' ? ' blog-tab--active' : ''}`}
            onClick={() => setTab('journal')}
          >
            Journal
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'research'}
            className={`blog-tab${activeTab === 'research' ? ' blog-tab--active' : ''}`}
            onClick={() => setTab('research')}
          >
            Research
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="blog-grid reveal-stagger">
        {allPosts === null
          ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="blog-card blog-card--skeleton" aria-hidden="true">
              <div className="blog-card__img" style={{ background: 'var(--stone)' }} />
              <div className="blog-card__body">
                <div className="skeleton-line skeleton-line--title" />
                <div className="skeleton-line skeleton-line--sub" />
                <div className="skeleton-line skeleton-line--sub skeleton-line--short" />
              </div>
            </div>
          ))
          : filtered.map((post) => <BlogCard key={post.slug} post={post} />)
        }
      </div>

      {/* Error state */}
      {fetchError && (
        <div className="blog-empty reveal">
          <p style={{ color: 'var(--error, #c0392b)' }}>
            Could not load articles — {fetchError}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!fetchError && allPosts !== null && filtered.length === 0 && (
        <div className="blog-empty reveal">
          <p>More {activeTab} articles coming soon.</p>
        </div>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────────────────────
   POST BODY — supports ## h2, ### h3, **bold**, *italic*,
   > quote, - list
───────────────────────────────────────────────────────────── */
const PostBody = ({ text }) => {
  if (!text) return null;
  const paragraphs = text.split('\n\n').filter(Boolean);

  return (
    <div className="post-body">
      {paragraphs.map((para, i) => {
        const t = para.trim();
        if (t.startsWith('### ')) return <h3 key={i} className="post-h3">{t.slice(4)}</h3>;
        if (t.startsWith('## '))  return <h2 key={i} className="post-h2">{t.slice(3)}</h2>;
        if (t.startsWith('# '))   return <h2 key={i} className="post-h2">{t.slice(2)}</h2>;
        if (t.startsWith('> '))   return <blockquote key={i} className="post-quote">{t.slice(2)}</blockquote>;
        if (t.startsWith('- ') || t.startsWith('* ')) {
          const items = t.split('\n').filter(l => l.match(/^[-*] /)).map(l => l.slice(2));
          return <ul key={i} className="post-list">{items.map((item, j) => <li key={j}>{item}</li>)}</ul>;
        }
        // Standalone **heading** treated as h3
        if (t.startsWith('**') && t.endsWith('**') && !t.slice(2, -2).includes('**')) {
          return <h3 key={i} className="post-h3">{t.slice(2, -2)}</h3>;
        }
        // Inline bold/italic
        const parts = t.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g);
        return (
          <p key={i} className="post-para">
            {parts.map((part, j) => {
              if (part.startsWith('***')) return <strong key={j}><em>{part.slice(3, -3)}</em></strong>;
              if (part.startsWith('**'))  return <strong key={j}>{part.slice(2, -2)}</strong>;
              if (part.startsWith('*'))   return <em key={j}>{part.slice(1, -1)}</em>;
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   BLOG POST VIEW
───────────────────────────────────────────────────────────── */
const BlogPost = ({ slug }) => {
  const { state } = useLocation();
  // Use nav state only as a quick-render hint; always validate/reload from DB
  const [post, setPost] = useState(state?.post || null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch the post itself
        const { data: items, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .limit(1);

        if (cancelled) return;
        if (error) throw error;
        if (!items || items.length === 0) { setNotFound(true); setLoading(false); return; }

        const mapped = mapPost(items[0]);
        setPost(mapped);

        // Fetch related posts (same type, excluding current)
        const { data: relatedItems } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .eq('type', mapped.type)
          .neq('slug', slug)
          .order('created', { ascending: false })
          .limit(3);

        if (!cancelled) {
          setRelated(relatedItems ? relatedItems.map(mapPost) : []);
        }
      } catch (err) {
        console.error('[BlogPost] Failed to fetch post:', err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="blog-not-found reveal" style={{ textAlign: 'center' }}>
        <p className="section-label">Loading…</p>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="blog-not-found reveal">
        <p className="section-label">Not Found</p>
        <h1 className="section-h2">This article doesn't exist.</h1>
        <Link to="/blog" className="btn btn-dark" style={{ marginTop: '24px', display: 'inline-flex' }}>
          Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | The Vedic Protocol</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://www.thevedicprotocol.com/blog/${post.slug}`} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt,
          author: { '@type': 'Person', name: 'Dr. Sonam', jobTitle: 'Founder & Chief Formulator' },
          publisher: { '@type': 'Organization', name: 'The Vedic Protocol' },
          datePublished: post.date,
          image: post.image,
        })}</script>
      </Helmet>

      <ReadingProgress />

      {/* Hero image */}
      {post.image && (
        <div className="post-hero reveal">
          <img src={post.image} alt={post.title} className="post-hero__img" />
          <div className="post-hero__overlay" aria-hidden="true" />
          <div className="post-hero__meta">
            <span className={`badge badge-${post.type}`}>
              {post.type === 'research' ? 'Research' : 'Journal'}
            </span>
            <span className="post-hero__time">{post.readTime} min read</span>
          </div>
        </div>
      )}

      {/* Article */}
      <article className="post-article reveal">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <p className="post-excerpt">{post.excerpt}</p>

          {/* Author block */}
          <div className="post-author">
            <div className="post-author__monogram" aria-hidden="true">
              <span>S</span>
            </div>
            <div className="post-author__info">
              <strong className="post-author__name">Dr. Sonam</strong>
              <span className="post-author__role">
                PhD · Ayurvedic Kayachikitsa · Founder
              </span>
            </div>
            <span className="post-author__date">{post.date}</span>
          </div>
        </header>

        <PostBody text={post.body} />

        {/* Back link */}
        <div className="post-back">
          <Link to="/blog" className="post-back__link">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Journal
          </Link>
        </div>
      </article>

      {/* Related formulations teaser */}
      <section className="post-related reveal" aria-labelledby="related-h2">
        <div className="post-related__inner">
          <p className="section-label">From the Collection</p>
          <h2 className="section-h2" id="related-h2">
            Formulations rooted<br /><em>in this science.</em>
          </h2>
          <p className="post-related__sub">
            Every active we write about is in our formulations — at the dose that does something real.
          </p>
          <Link to={`/shop?category=${post.relatedCategory}`} className="btn btn-dark">
            Explore {post.relatedCategory === 'haircare' ? 'Haircare' : 'Skincare'} Formulations
          </Link>
        </div>
      </section>

      {/* More articles */}
      {related.length > 0 && (
        <section className="post-more" aria-labelledby="more-h2">
          <div className="post-more__head reveal">
            <p className="section-label">Continue Reading</p>
            <h2 className="section-h2" id="more-h2">
              More from<br /><em>the Journal.</em>
            </h2>
          </div>
          <div className="blog-grid reveal-stagger">
            {related.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN EXPORT — routes /blog and /blog/:slug
───────────────────────────────────────────────────────────── */
const BlogPage = () => {
  const { slug } = useParams();

  return (
    <>
      <Header />
      <main id="main" className="blog-main">
        {slug ? <BlogPost slug={slug} /> : <BlogList />}
      </main>
      <Footer />
    </>
  );
};

export default BlogPage;
