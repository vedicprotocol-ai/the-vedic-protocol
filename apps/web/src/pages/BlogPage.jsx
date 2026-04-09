import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams, useSearchParams, useLocation } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import pb from '@/lib/pocketbaseClient.js';

/* ─────────────────────────────────────────────────────────────
   STATIC POST DATA
   Replace with PocketBase fetch when CMS is ready.
   All copy follows the Vedic Protocol voice guidelines.
───────────────────────────────────────────────────────────── */
const POSTS = [
  {
    slug: 'what-is-ashwagandha',
    type: 'journal',
    title: 'What is Ashwagandha — and why does it belong in your skincare?',
    excerpt:
      'The adaptogen your grandmother knew. The clinical evidence that explains why she was right.',
    readTime: 5,
    date: 'March 2026',
    image:
      'https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/dc36f7bdd881025ed358489b7e56e95f.png',
    body: `
Ashwagandha (Withania somnifera) has been documented in the Charaka Samhita as a Rasayana — a class of botanicals that promote longevity, vitality, and cellular renewal. The text prescribes it for conditions we would today describe as oxidative stress and hormonal imbalance.

Modern phytochemistry has identified withanolides as the primary active compounds. Peer-reviewed studies published in the Journal of Ethnopharmacology confirm their anti-inflammatory action via NF-κB pathway inhibition — the same pathway implicated in acne, rosacea, and barrier compromise.

**What this means for your skin**

Cortisol is skin's primary antagonist. Chronically elevated cortisol degrades collagen, impairs barrier function, and triggers sebaceous gland overactivity. Withanolides have demonstrated measurable cortisol-modulating effects at doses of 240–600mg daily in randomised controlled trials.

Topically, ashwagandha root extract at concentrations of 0.5–2% has shown statistically significant improvements in skin elasticity and reduction in transepidermal water loss (TEWL) in a 2021 double-blind study of 60 participants over eight weeks.

**What the Charaka Samhita actually says**

The text classifies ashwagandha under Balya (strength-promoting) and Rasayana (rejuvenating) categories. It specifies its use in conditions of tissue depletion — which maps cleanly to the modern concept of skin barrier compromise and reduced dermal collagen density.

This is not coincidence. It is 3,000 years of careful clinical observation, finally meeting the tools to understand why it works.
    `.trim(),
    relatedCategory: 'skincare',
  },
  {
    slug: 'charaka-samhita-modern-skin',
    type: 'research',
    title: 'The Charaka Samhita on skin health — a clinical reading',
    excerpt:
      'A PhD-level breakdown of what ancient Ayurvedic texts actually say about the skin barrier, and how it maps to modern dermatology.',
    readTime: 12,
    date: 'February 2026',
    image:
      'https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/dc36f7bdd881025ed358489b7e56e95f.png',
    body: `
The Charaka Samhita, compiled circa 600 BCE and systematised over subsequent centuries, dedicates an entire adhyaya (chapter) to the physiology of skin — the Tvak Adhyaya. What is remarkable, from a clinical pharmacology standpoint, is the anatomical precision of its seven-layer model (sapta tvak) relative to what we now understand about epidermal and dermal architecture.

**The seven layers: ancient and modern**

Charaka describes the outermost layer, Avabhashini, as the seat of colour and lustre — corresponding to the stratum corneum and its role in light reflection and hydration. The second layer, Lohita, is described as the site of conditions we now classify as pigmentation disorders. The third, Shweta, governs the appearance of the complexion.

Working inward, Tamra and Vedini correspond anatomically to the viable epidermis and papillary dermis respectively — the text correctly identifying these as the zones involved in sensation and immune response. Rohini, the sixth layer, is described as the site of "binding" — a remarkably accurate description of the reticular dermis and its collagen network function. The deepest layer, Mamsadhara, is characterised as the foundation of muscular attachment — mapping to the hypodermis.

**Tridosha and skin pathology**

The Charaka framework attributes skin disease (kushtha) to the simultaneous vitiation of all three doshas — Vata, Pitta, and Kapha — alongside the involvement of four body tissues (twak, rakta, mamsa, ambu). This multifactorial model anticipates the modern understanding that chronic skin conditions rarely have single-pathway aetiology.

Pitta vitiation maps to inflammatory conditions (rosacea, contact dermatitis, acneiform eruptions). Vata vitiation to barrier dysfunction, dryness, and conditions with a neuroimmune component. Kapha vitiation to conditions of excess — cystic acne, seborrhoeic presentations, oedematous swelling.

**Clinical implications for formulation**

This is not metaphor. Understanding the dosha model as a systems framework — rather than a spiritual one — allows for formulation logic that addresses multiple pathways simultaneously. Our approach to every formulation begins with this mapping before we select actives, because it tells us which mechanisms need to be addressed together.

The Charaka Samhita was a clinical document written by clinicians for clinicians. Reading it that way changes everything.
    `.trim(),
    relatedCategory: 'skincare',
  },
  {
    slug: 'scalp-microbiome-ayurveda',
    type: 'journal',
    title: 'Your scalp microbiome: what Ayurveda got right 3,000 years ago',
    excerpt:
      "Modern science is catching up to what Sushruta described as Shleshma in hair health. Here is how they connect.",
    readTime: 7,
    date: 'January 2026',
    image:
      'https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/dc36f7bdd881025ed358489b7e56e95f.png',
    body: `
Sushruta described the scalp as governed primarily by Shleshma (kapha dosha) — a thick, unctuous substance responsible for anchoring hair follicles, maintaining moisture, and protecting the scalp surface. He prescribed disruption of Shleshma balance as the root cause of premature hair loss, dandruff-like conditions (darunaka), and follicular inflammation.

Today, we understand the scalp microbiome — the community of bacteria, fungi, and archaea that inhabit the scalp surface — as the biological substrate of everything Sushruta described.

**Malassezia and kapha vitiation**

The most studied scalp microorganism is Malassezia globosa, a lipophilic yeast that metabolises sebum (the modern equivalent of Shleshma) into oleic acid. In susceptible individuals, this metabolite penetrates the stratum corneum and triggers an inflammatory cascade — the mechanism behind seborrhoeic dermatitis and dandruff.

The Sushruta Samhita's treatment for darunaka focused on oil-based applications (taila) with specific antimicrobial botanicals — neem (Azadirachta indica), tulsi (Ocimum sanctum), and brahmi (Bacopa monnieri). Modern antifungal research has confirmed clinically significant activity for all three against Malassezia species.

**What this means for our haircare formulations**

Our scalp serums are designed with this dual framework: addressing the microbiome directly with clinically validated botanical actives, while simultaneously supporting the scalp barrier to reduce the susceptibility that allows dysbiosis in the first place.

The oils prescribed by Sushruta were not intuitive guesses. They were the result of generations of careful observation. Our job is to understand the mechanism, maintain the intention, and ensure the dose is right.
    `.trim(),
    relatedCategory: 'haircare',
  },
  {
    slug: 'turmeric-curcumin-skin',
    type: 'research',
    title: 'Turmeric vs curcumin — why the distinction matters for your formulation',
    excerpt:
      'Every brand puts turmeric in their product. Almost none of them understand why it might not be doing anything.',
    readTime: 9,
    date: 'December 2025',
    image:
      'https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/dc36f7bdd881025ed358489b7e56e95f.png',
    body: `
Turmeric (Curcuma longa) is perhaps the most misused botanical in the cosmetic industry. Its inclusion on an INCI list as "Curcuma Longa Root Powder" or "Turmeric Extract" tells you almost nothing about whether the formulation will deliver any therapeutic effect — because the critical variable is curcumin concentration and bioavailability, neither of which is disclosed.

**The curcumin problem**

Curcumin is the primary bioactive compound in turmeric, comprising approximately 3–5% of dry turmeric weight. It is responsible for the anti-inflammatory, antioxidant, and wound-healing effects documented in peer-reviewed literature. Raw turmeric powder in a formulation delivers a fraction of that already-small percentage.

More critically: curcumin has extremely poor aqueous solubility (log P ≈ 3.3) and rapid degradation at physiological pH. Applied topically in a conventional formulation, it will not penetrate the stratum corneum at therapeutically relevant concentrations. This is not a minor caveat — it means the majority of turmeric-containing skincare products are delivering little beyond marketing.

**How we approach it**

Our formulations use curcumin isolated via supercritical CO₂ extraction — the method that preserves the full curcuminoid complex (curcumin, bisdemethoxycurcumin, demethoxycurcumin) without solvent degradation. We then employ liposomal encapsulation to address the penetration problem: curcumin encapsulated in phospholipid vesicles achieves dramatically improved stratum corneum penetration and sustained release.

The Charaka Samhita prescribed haridra (turmeric) in combination with fats — specifically ghee — for topical application. This was not arbitrary. Fat-based carriers improve curcumin bioavailability significantly. The ancient text was solving the same solubility problem we solve today, with the tools available.

The difference is we can now quantify exactly what we're delivering, and why.
    `.trim(),
    relatedCategory: 'skincare',
  },
  {
    slug: 'amla-vitamin-c-comparison',
    type: 'journal',
    title: 'Amla vs synthetic Vitamin C — is the ancient source actually better?',
    excerpt:
      'Amla contains Vitamin C, yes. But the real story is more interesting than that.',
    readTime: 6,
    date: 'November 2025',
    image:
      'https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/dc36f7bdd881025ed358489b7e56e95f.png',
    body: `
Amla (Phyllanthus emblica, also known as Indian Gooseberry) is among the most revered botanicals in the Charaka Samhita — listed as the single most important Rasayana ingredient in classical Ayurveda. Its Vitamin C content is frequently cited as the reason: amla contains 20 times more Vitamin C by weight than orange.

This comparison, while true, misses what actually makes amla exceptional.

**Why stability matters more than quantity**

L-ascorbic acid — the biologically active form of Vitamin C — is notoriously unstable. It oxidises rapidly on exposure to light, air, and elevated temperatures, converting to dehydroascorbic acid and then to diketogulonic acid, which has no skin benefit. This is why synthetic Vitamin C serums must be formulated at pH 2.5–3.5, stored in opaque packaging, and typically have a short active window once opened.

Amla's Vitamin C behaves differently. The ascorbic acid in amla is complexed with tannins — primarily emblicanin A and B, punigluconin, and pedunculagin — that act as natural stabilisers. Studies have demonstrated that amla-derived Vitamin C is significantly more stable across a range of pH and temperature conditions than isolated L-ascorbic acid.

**The synergy the Charaka Samhita described**

Classical texts never prescribe amla for its Vitamin C content — they describe its action as a complete Rasayana, working through multiple tissue layers simultaneously. Modern research is beginning to understand why: the tannin-polyphenol complex in amla has demonstrated independent antioxidant, collagen-stimulating, and elastase-inhibiting activity beyond the ascorbic acid contribution.

This is the principle of Samyoga — the Ayurvedic understanding that the whole is more effective than the sum of its parts. We do not disagree. We formulate accordingly.
    `.trim(),
    relatedCategory: 'skincare',
  },
  {
    slug: 'bhringraj-hair-loss',
    type: 'journal',
    title: 'Bhringraj and hair loss — separating the evidence from the folklore',
    excerpt:
      'Used for hair health for millennia. Here is what the clinical evidence actually shows.',
    readTime: 6,
    date: 'October 2025',
    image:
      'https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/dc36f7bdd881025ed358489b7e56e95f.png',
    body: `
Bhringraj (Eclipta alba, also Eclipta prostrata) is classified in the Sushruta Samhita as Keshya — meaning it specifically promotes hair growth and prevents hair loss. It has been used in Ayurvedic hair oils for at least 2,500 years, typically as bhringraj taila (bhringraj oil).

The contemporary evidence base is modest but genuine.

**What the studies show**

A 2008 study published in the Archives of Dermatological Research compared ethanolic extract of Eclipta alba to minoxidil (2%) in a mouse model of alopecia. The bhringraj extract group demonstrated a statistically significant increase in hair follicle count and a shift from telogen (resting) to anagen (active growth) phase, comparable to the minoxidil group.

The proposed mechanism involves wedelolactone — the primary coumarin compound in bhringraj — and its activity on 5-alpha reductase, the enzyme that converts testosterone to dihydrotestosterone (DHT). DHT-mediated follicular miniaturisation is the primary driver of androgenetic alopecia. Wedelolactone has demonstrated 5-alpha reductase inhibitory activity in vitro, which would explain the Ayurvedic observation of hair loss prevention.

**The honest limitations**

The evidence base consists primarily of animal studies and in vitro work. Well-designed randomised controlled trials in human subjects are lacking. We are transparent about this: bhringraj is a clinically informed inclusion, not a proven equivalent to finasteride or minoxidil.

What we do know is that 2,500 years of careful observation is not nothing. Our formulations include bhringraj at concentrations where observed effects are most likely, combined with actives whose mechanisms are more completely understood. The goal is always the same: everything in the formulation has a reason. Nothing is there for the label.
    `.trim(),
    relatedCategory: 'haircare',
  },
];

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
   BLOG CARD
───────────────────────────────────────────────────────────── */
const BlogCard = ({ post }) => (
  <Link to={`/blog/${post.slug}`} state={{ post }} className="blog-card">
    <div
      className="blog-card__img"
      style={{ backgroundImage: `url(${post.image})` }}
      role="img"
      aria-label={post.title}
    >
      <span className={`badge badge-${post.type}`}>
        {post.type === 'research' ? 'Research' : 'Journal'}
      </span>
    </div>
    <div className="blog-card__body">
      <h3 className="blog-card__title">{post.title}</h3>
      <p className="blog-card__excerpt">{post.excerpt}</p>
      <div className="blog-card__meta">
        <span>{post.readTime} min read</span>
        <span>Dr. Sonam</span>
      </div>
    </div>
  </Link>
);

/* ─────────────────────────────────────────────────────────────
   BLOG LIST VIEW — fetches live from PocketBase, falls back
   to static POSTS if the collection doesn't exist yet.
───────────────────────────────────────────────────────────── */
const BlogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'research' ? 'research' : 'journal';
  const [allPosts, setAllPosts] = useState(null); // null = still loading

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await pb.collection('blog_posts').getList(1, 100, {
          filter: 'published = true',
          sort: '-created',
          $autoCancel: false,
        });
        if (!cancelled) {
          setAllPosts(res.items.length > 0
            ? res.items.map((p) => ({
              slug: p.slug,
              type: p.type || 'journal',
              title: p.title || '',
              excerpt: p.excerpt || '',
              body: p.body || '',
              readTime: p.read_time || 5,
              date: new Date(p.created).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
              image: p.image_url || POSTS[0].image,
              relatedCategory: p.related_category || 'skincare',
            }))
            : POSTS);
        }
      } catch {
        if (!cancelled) setAllPosts(POSTS);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = (allPosts ?? POSTS).filter((p) => p.type === activeTab);

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
        <p className="section-label">Knowledge & Science</p>
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

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="blog-empty reveal">
          <p>More {activeTab} articles coming soon.</p>
        </div>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────────────────────
   BLOG POST VIEW
───────────────────────────────────────────────────────────── */

/* Render markdown body — supports ## h2, ### h3, **bold**, *italic*, > quote, - list */
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
        // Legacy format: standalone **heading** treated as h3
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

const BlogPost = ({ slug }) => {
  const { state } = useLocation();
  const initial = state?.post || POSTS.find((p) => p.slug === slug) || null;
  const [post, setPost] = useState(initial);
  const [related, setRelated] = useState(POSTS.filter((p) => p.slug !== slug).slice(0, 3));
  const [loading, setLoading] = useState(!initial);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (post) return; // already have post from nav state or static array
    let cancelled = false;
    (async () => {
      try {
        const res = await pb.collection('blog_posts').getList(1, 1, {
          filter: `slug = "${slug}" && published = true`,
          $autoCancel: false,
        });
        if (cancelled) return;
        if (res.items.length === 0) { setNotFound(true); return; }
        const p = res.items[0];
        const mapped = {
          slug: p.slug,
          type: p.type,
          title: p.title,
          excerpt: p.excerpt,
          body: p.body || '',
          readTime: p.read_time || 5,
          date: new Date(p.created).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
          image: p.image_url || POSTS[0].image,
          relatedCategory: p.related_category || 'skincare',
        };
        setPost(mapped);
        setRelated(POSTS.filter((r) => r.slug !== slug).slice(0, 3));
      } catch {
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
      <div className="post-hero reveal">
        <img
          src={post.image}
          alt={post.title}
          className="post-hero__img"
        />
        <div className="post-hero__overlay" aria-hidden="true" />
        <div className="post-hero__meta">
          <span className={`badge badge-${post.type}`}>
            {post.type === 'research' ? 'Research' : 'Journal'}
          </span>
          <span className="post-hero__time">{post.readTime} min read</span>
        </div>
      </div>

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