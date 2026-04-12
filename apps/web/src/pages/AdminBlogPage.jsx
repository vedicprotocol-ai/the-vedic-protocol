
import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import supabase from '@/lib/supabaseClient';

// ── Markdown ↔ HTML ──────────────────────────────────────────────────────────
function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => '<ul>' + m + '</ul>')
    .split(/\n\n+/)
    .map(b => {
      b = b.trim();
      if (!b) return '';
      if (/^<(h[1-6]|ul|blockquote)/.test(b)) return b;
      return '<p>' + b.replace(/\n/g, '<br/>') + '</p>';
    })
    .join('\n');
}

function htmlToMd(html) {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<strong><em>(.*?)<\/em><\/strong>/gi, '***$1***')
    .replace(/<em><strong>(.*?)<\/strong><\/em>/gi, '***$1***')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<ul[^>]*>|<\/ul>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── Wrap selection in a tag ──────────────────────────────────────────────────
function wrapSelection(tag) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (range.collapsed) return;
  const wrapper = document.createElement(tag);
  try {
    range.surroundContents(wrapper);
  } catch {
    const frag = range.extractContents();
    wrapper.appendChild(frag);
    range.insertNode(wrapper);
  }
  sel.removeAllRanges();
}

// ── Insert a block-level element replacing current line ──────────────────────
function insertBlock(tag) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  const text = range.toString() || '\u200B';
  const el = document.createElement(tag);
  el.textContent = text;
  range.deleteContents();
  range.insertNode(el);
  // Move cursor inside new element
  const newRange = document.createRange();
  newRange.setStart(el, 0);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);
}

// ── RichEditor component ─────────────────────────────────────────────────────
function RichEditor({ value, onChange, editorKey }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = mdToHtml(value || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorKey]);

  const sync = () => {
    if (ref.current) onChange(htmlToMd(ref.current.innerHTML));
  };

  const handleFormat = (type) => {
    ref.current?.focus();
    switch (type) {
      case 'bold':      wrapSelection('strong'); break;
      case 'italic':    wrapSelection('em'); break;
      case 'h2':        insertBlock('h2', ref.current); break;
      case 'h3':        insertBlock('h3', ref.current); break;
      case 'quote':     insertBlock('blockquote', ref.current); break;
      case 'ul': {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const li = document.createElement('li');
          li.textContent = range.toString() || '\u200B';
          const ul = document.createElement('ul');
          ul.appendChild(li);
          range.deleteContents();
          range.insertNode(ul);
        }
        break;
      }
      case 'clear': {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const text = document.createTextNode(range.toString());
          range.deleteContents();
          range.insertNode(text);
        }
        break;
      }
    }
    sync();
  };

  return (
    <div className="rich-editor">
      <div className="rich-editor__toolbar">
        <button type="button" onMouseDown={e => { e.preventDefault(); handleFormat('bold'); }}><strong>B</strong></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); handleFormat('italic'); }}><em>I</em></button>
        <span className="rich-editor__divider" />
        <button type="button" onMouseDown={e => { e.preventDefault(); handleFormat('h2'); }}>H2</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); handleFormat('h3'); }}>H3</button>
        <span className="rich-editor__divider" />
        <button type="button" onMouseDown={e => { e.preventDefault(); handleFormat('ul'); }}>• List</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); handleFormat('quote'); }}>" Quote</button>
        <span className="rich-editor__divider" />
        <button type="button" onMouseDown={e => { e.preventDefault(); handleFormat('clear'); }}>Clear</button>
      </div>
      <div
        ref={ref}
        className="rich-editor__body"
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
      />
    </div>
  );
}

// ── Slug ─────────────────────────────────────────────────────────────────────
const toSlug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);

const EMPTY = {
  title: '', slug: '', type: 'journal', excerpt: '', content: '',
  read_time: 4, image_url: '', related_category: 'haircare', published: false,
};

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AdminBlogPage() {
  const [posts, setPosts]         = useState([]);
  const [form, setForm]           = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [view, setView]           = useState('list');
  const [status, setStatus]       = useState('');
  const [slugError, setSlugError] = useState('');
  const [loading, setLoading]     = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const load = async () => {
    try {
      const { data: records } = await supabase.from('blog_posts').select('*').order('created', { ascending: false });
      setPosts(records ?? []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => {
    if (k === 'slug') setSlugError('');
    setForm(f => ({ ...f, [k]: v, ...(k === 'title' && !editingId ? { slug: toSlug(v) } : {}) }));
  };

  const save = async () => {
    if (!form.title || !form.body) { setStatus('Title and body are required.'); return; }
    if (!form.slug) { setStatus('Slug is required.'); return; }
    setStatus('Saving…');
    setSlugError('');
    setLoading(true);
    try {
      const { error } = editingId
        ? await supabase.from('blog_posts').update(form).eq('id', editingId)
        : await supabase.from('blog_posts').insert(form);
      if (error) throw error;
      setStatus('Saved ✓');
      setForm(EMPTY);
      setEditingId(null);
      setView('list');
      load();
    } catch (e) {
      if (e?.code === '23505') {
        setSlugError('A post with this slug already exists. Please edit the slug to make it unique.');
        setStatus('Validation error.');
      } else {
        setStatus('Error: ' + (e?.message || 'unknown'));
      }
    } finally {
      setLoading(false);
    }
  };

  const edit = (post) => {
    setForm({ ...post });
    setEditingId(post.id);
    setEditorKey(k => k + 1);
    setStatus('');
    setSlugError('');
    setView('edit');
  };

  const del = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    load();
  };

  const newPost = () => {
    setForm(EMPTY);
    setEditingId(null);
    setEditorKey(k => k + 1);
    setStatus('');
    setSlugError('');
    setView('edit');
  };

  // Auth guard — ProtectedAdminRoute wraps this page, so this is belt-and-suspenders
  // (ProtectedAdminRoute already reads role from AuthContext)

  return (
    <>
      <Helmet><title>Admin — Journal | The Vedic Protocol</title></Helmet>
      <Header />
      <main className="admin-page">
        <div className="admin-inner">

          {view === 'list' && (
            <>
              <div className="admin-header-row">
                <div>
                  <p className="section-label">Admin</p>
                  <h1 className="admin-page-title">Journal Posts</h1>
                </div>
                <button className="btn btn-dark" onClick={newPost}>+ New Post</button>
              </div>
              <div className="admin-post-list">
                {posts.length === 0 && <p className="admin-empty">No posts yet.</p>}
                {posts.map(p => (
                  <div key={p.id} className="admin-post-row">
                    <div className="admin-post-row__info">
                      <span className={`admin-badge ${p.published ? 'admin-badge--live' : ''}`}>
                        {p.published ? 'Live' : 'Draft'}
                      </span>
                      <span className="admin-post-row__title">{p.title}</span>
                      <span className="admin-post-row__meta">{p.type} · {p.related_category}</span>
                    </div>
                    <div className="admin-post-row__actions">
                      <button className="admin-btn-sm" onClick={() => edit(p)}>Edit</button>
                      <button className="admin-btn-sm admin-btn-sm--danger" onClick={() => del(p.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {view === 'edit' && (
            <>
              <div className="admin-header-row">
                <div>
                  <p className="section-label">Admin</p>
                  <h1 className="admin-page-title">{editingId ? 'Edit Post' : 'New Post'}</h1>
                </div>
                <button className="admin-btn-sm" onClick={() => { setView('list'); setStatus(''); setSlugError(''); }}>← Back</button>
              </div>
              <div className="admin-form">
                <div className="admin-field">
                  <label>Title</label>
                  <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Post title" />
                </div>
                <div className="admin-field">
                  <label style={slugError ? { color: 'var(--destructive, #ef4444)' } : {}}>Slug</label>
                  <input 
                    value={form.slug} 
                    onChange={e => set('slug', e.target.value)} 
                    placeholder="url-friendly-slug" 
                    style={slugError ? { borderColor: 'var(--destructive, #ef4444)' } : {}}
                  />
                  {slugError && <span style={{ color: 'var(--destructive, #ef4444)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>{slugError}</span>}
                </div>
                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Type</label>
                    <select value={form.type} onChange={e => set('type', e.target.value)}>
                      <option value="journal">Journal</option>
                      <option value="research">Research</option>
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Category</label>
                    <select value={form.related_category} onChange={e => set('related_category', e.target.value)}>
                      <option value="haircare">Haircare</option>
                      <option value="skincare">Skincare</option>
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Read time (min)</label>
                    <input type="number" value={form.read_time} onChange={e => set('read_time', parseInt(e.target.value) || 1)} />
                  </div>
                </div>
                <div className="admin-field">
                  <label>Excerpt</label>
                  <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={2} placeholder="One-line summary shown on the blog index" />
                </div>
                <div className="admin-field">
                  <label>Body</label>
                  <RichEditor editorKey={editorKey} value={form.content} onChange={v => set('content', v)} />
                </div>
                <div className="admin-field">
                  <label>Image URL (optional)</label>
                  <input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." />
                </div>
                <div className="admin-field admin-field--checkbox">
                  <input type="checkbox" id="pub" checked={form.published} onChange={e => set('published', e.target.checked)} />
                  <label htmlFor="pub">Publish (visible on site)</label>
                </div>
                <div className="admin-actions">
                  <button className="btn btn-dark" onClick={save} disabled={loading}>
                    {loading ? 'Saving…' : editingId ? 'Save Changes' : 'Publish Post'}
                  </button>
                  {status && <span className="admin-status">{status}</span>}
                </div>
              </div>
            </>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
