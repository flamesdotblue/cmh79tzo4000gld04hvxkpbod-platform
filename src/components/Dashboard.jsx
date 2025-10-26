import { useEffect, useMemo, useState } from 'react';
import { Reorder, motion } from 'framer-motion';
import { Upload, Trash2, Star, FolderOpen, Download, Search, Share2, Sparkles } from 'lucide-react';

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Dashboard({ pdfs, setPdfs, upsertPdf, removePdf, openViewer }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [layout, setLayout] = useState('grid');

  const categories = useMemo(() => {
    const cats = new Set(['education', 'projects', 'notes', 'work', 'misc']);
    pdfs.forEach((p) => p.category && cats.add(p.category));
    return Array.from(cats);
  }, [pdfs]);

  const filtered = useMemo(() => {
    return pdfs.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
      const matchesCat = category === 'all' ? true : p.category === category;
      return matchesQuery && matchesCat;
    });
  }, [pdfs, query, category]);

  const recent = useMemo(() => [...pdfs].sort((a, b) => (b.lastViewedAt || 0) - (a.lastViewedAt || 0)).slice(0, 6), [pdfs]);
  const favorites = useMemo(() => pdfs.filter((p) => p.favorite), [pdfs]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', getComputedStyle(document.documentElement).getPropertyValue('--color-primary') || '#ef4444');
  }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      if (f.type !== 'application/pdf') continue;
      const dataUrl = await fileToDataUrl(f);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const pdf = {
        id,
        name: f.name.replace(/\.pdf$/i, ''),
        filename: f.name,
        size: f.size,
        uploadedAt: Date.now(),
        dataUrl,
        category: 'misc',
        favorite: false,
        annotations: [],
        views: 0,
      };
      upsertPdf(pdf);
    }
    e.target.value = '';
  };

  const toggleFavorite = (id) => setPdfs((prev) => prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)));
  const setCategoryFor = (id, cat) => setPdfs((prev) => prev.map((p) => (p.id === id ? { ...p, category: cat } : p)));

  const onReorder = (items) => setPdfs(items);

  const sharePdf = (id) => {
    const url = new URL(window.location.href);
    url.searchParams.set('pdfId', id);
    navigator.clipboard.writeText(url.toString());
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 space-y-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[--color-primary]/10 text-[--color-primary] grid place-items-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Your Dashboard</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Upload, categorize, reorder, and share your PDFs.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="relative hidden sm:flex items-center gap-2 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 focus-within:ring-2 ring-[--color-primary]">
            <Search size={16} className="text-zinc-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search PDFs" className="bg-transparent outline-none text-sm" />
          </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm">
            <option value="all">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="flex rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700">
            <button onClick={() => setLayout('grid')} className={`px-3 py-2 text-sm ${layout === 'grid' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}>Grid</button>
            <button onClick={() => setLayout('list')} className={`px-3 py-2 text-sm ${layout === 'list' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}>List</button>
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[--color-primary] text-white cursor-pointer shadow hover:shadow-md">
            <Upload size={16} />
            <span className="text-sm">Upload</span>
            <input type="file" multiple accept="application/pdf" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      </div>

      {favorites.length > 0 && (
        <div id="favorites" className="space-y-3">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-yellow-500" />
            <h3 className="font-semibold">Favorites</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favorites.slice(0, 6).map((p) => (
              <PdfCard key={`fav-${p.id}`} p={p} onOpen={() => openViewer(p.id)} onToggleFavorite={() => toggleFavorite(p.id)} onShare={() => sharePdf(p.id)} />
            ))}
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FolderOpen size={18} className="text-[--color-primary]" />
            <h3 className="font-semibold">Recently viewed</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recent.map((p) => (
              <PdfCard key={`rec-${p.id}`} p={p} onOpen={() => openViewer(p.id)} onToggleFavorite={() => toggleFavorite(p.id)} onShare={() => sharePdf(p.id)} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">All PDFs</h3>
        </div>
        <Reorder.Group axis="y" values={filtered} onReorder={onReorder} className="space-y-3">
          {filtered.map((p) => (
            <Reorder.Item key={p.id} value={p} className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {layout === 'grid' ? (
                <GridRow p={p} onOpen={() => openViewer(p.id)} onToggleFavorite={() => toggleFavorite(p.id)} onDelete={() => removePdf(p.id)} onShare={() => sharePdf(p.id)} onSetCategory={(c) => setCategoryFor(p.id, c)} categories={categories} />
              ) : (
                <ListRow p={p} onOpen={() => openViewer(p.id)} onToggleFavorite={() => toggleFavorite(p.id)} onDelete={() => removePdf(p.id)} onShare={() => sharePdf(p.id)} onSetCategory={(c) => setCategoryFor(p.id, c)} categories={categories} />
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      <div id="settings" className="mt-8 grid md:grid-cols-3 gap-4">
        <IntegrationCard title="Import from Google Drive" href="https://drive.google.com" />
        <IntegrationCard title="Import from Dropbox" href="https://www.dropbox.com/home" />
        <TipsCard />
      </div>
    </section>
  );
}

function PdfCard({ p, onOpen, onToggleFavorite, onShare }) {
  return (
    <motion.button whileHover={{ y: -2 }} className="group relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 text-left" onClick={onOpen}>
      <div className="aspect-[4/3] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 grid place-items-center">
        <div className="text-xs text-zinc-500">{p.filename}</div>
      </div>
      <div className="p-3">
        <div className="font-medium truncate">{p.name}</div>
        <div className="text-xs text-zinc-500 flex items-center gap-2">
          <span className="capitalize">{p.category}</span>
          <span>•</span>
          <span>{formatBytes(p.size)}</span>
        </div>
      </div>
      <div className="absolute top-2 right-2 flex gap-1">
        <button type="button" onClick={(e) => { e.stopPropagation(); onShare(); }} className="h-8 w-8 grid place-items-center rounded-md bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 transition-colors">
          <Share2 size={14} />
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} className={`h-8 w-8 grid place-items-center rounded-md ${p.favorite ? 'bg-yellow-500 text-white' : 'bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800'} transition-colors`}>
          <Star size={14} fill={p.favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
    </motion.button>
  );
}

function GridRow({ p, onOpen, onToggleFavorite, onDelete, onShare, onSetCategory, categories }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
      <button onClick={onOpen} className="md:col-span-2 aspect-video md:aspect-[4/3] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800" />
      <div className="md:col-span-10 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate max-w-[50vw]">{p.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[--color-primary]/10 text-[--color-primary] capitalize">{p.category}</span>
          </div>
          <div className="text-xs text-zinc-500">{p.filename} • {formatBytes(p.size)} • {p.views || 0} views</div>
        </div>
        <div className="flex items-center gap-2">
          <select value={p.category} onChange={(e) => onSetCategory(e.target.value)} className="px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={onOpen} className="px-3 py-2 rounded-md bg-[--color-primary] text-white text-sm">Preview</button>
          <a href={p.dataUrl} download={p.filename} className="px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 text-sm inline-flex items-center gap-2"><Download size={14} />Download</a>
          <button onClick={onShare} className="px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 text-sm inline-flex items-center gap-2"><Share2 size={14} />Share</button>
          <button onClick={onToggleFavorite} className={`px-3 py-2 rounded-md text-sm inline-flex items-center gap-2 ${p.favorite ? 'bg-yellow-500 text-white' : 'border border-zinc-200 dark:border-zinc-700'}`}>
            <Star size={14} fill={p.favorite ? 'currentColor' : 'none'} />
            Favorite
          </button>
          <button onClick={onDelete} className="px-3 py-2 rounded-md border border-red-200 text-red-600 dark:border-red-900/50 text-sm inline-flex items-center gap-2"><Trash2 size={14} />Delete</button>
        </div>
      </div>
    </div>
  );
}

function ListRow({ p, onOpen, onToggleFavorite, onDelete, onShare, onSetCategory, categories }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onOpen} className="h-10 w-14 rounded bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800" />
        <div className="min-w-0">
          <div className="font-medium truncate">{p.name}</div>
          <div className="text-xs text-zinc-500 truncate">{p.filename} • {formatBytes(p.size)}</div>
        </div>
        <select value={p.category} onChange={(e) => onSetCategory(e.target.value)} className="px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent text-xs">
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <a href={p.dataUrl} download={p.filename} className="px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-xs inline-flex items-center gap-1"><Download size={12} />Download</a>
        <button onClick={onShare} className="px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-xs inline-flex items-center gap-1"><Share2 size={12} />Share</button>
        <button onClick={onToggleFavorite} className={`px-2 py-1 rounded-md text-xs inline-flex items-center gap-1 ${p.favorite ? 'bg-yellow-500 text-white' : 'border border-zinc-200 dark:border-zinc-700'}`}>
          <Star size={12} fill={p.favorite ? 'currentColor' : 'none'} />
        </button>
        <button onClick={onDelete} className="px-2 py-1 rounded-md border border-red-200 text-red-600 dark:border-red-900/50 text-xs inline-flex items-center gap-1"><Trash2 size={12} />Delete</button>
      </div>
    </div>
  );
}

function IntegrationCard({ title, href }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
      <div className="font-medium">{title}</div>
      <div className="text-xs text-zinc-500 mt-1">Opens provider website to select and import your PDFs.</div>
    </a>
  );
}

function TipsCard() {
  return (
    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="font-medium">Tips</div>
      <ul className="mt-2 text-sm list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
        <li>Drag to reorder your PDFs.</li>
        <li>Click Share to copy a unique link with animations.</li>
        <li>Use in-viewer search to find text within PDFs.</li>
      </ul>
    </div>
  );
}
