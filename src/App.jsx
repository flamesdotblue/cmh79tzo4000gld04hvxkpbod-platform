import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import HeroSplineCover from './components/HeroSplineCover';
import Dashboard from './components/Dashboard';
import PdfViewerModal from './components/PdfViewerModal';

function App() {
  const [pdfs, setPdfs] = useState([]);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') || 'light';
  });
  const [primary, setPrimary] = useState(() => {
    if (typeof window === 'undefined') return '#ef4444';
    return localStorage.getItem('primary') || '#ef4444';
  });
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activePdfId, setActivePdfId] = useState(null);

  // Load persisted PDFs (as data URLs) and settings
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pdfs');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setPdfs(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('pdfs', JSON.stringify(pdfs));
  }, [pdfs]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('primary', primary);
    document.documentElement.style.setProperty('--color-primary', primary);
  }, [primary]);

  // Open viewer if share link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('pdfId');
    if (q) {
      const exists = pdfs.find((p) => p.id === q);
      if (exists) {
        setActivePdfId(q);
        setViewerOpen(true);
      }
    }
  }, [pdfs]);

  const activePdf = useMemo(() => pdfs.find((p) => p.id === activePdfId) || null, [pdfs, activePdfId]);

  const upsertPdf = (next) => {
    setPdfs((prev) => {
      const idx = prev.findIndex((p) => p.id === next.id);
      if (idx === -1) return [next, ...prev];
      const clone = [...prev];
      clone[idx] = next;
      return clone;
    });
  };

  const removePdf = (id) => setPdfs((prev) => prev.filter((p) => p.id !== id));

  const openViewer = (id) => {
    setActivePdfId(id);
    setViewerOpen(true);
    setPdfs((prev) => prev.map((p) => (p.id === id ? { ...p, views: (p.views || 0) + 1, lastViewedAt: Date.now() } : p)));
    const url = new URL(window.location.href);
    url.searchParams.set('pdfId', id);
    window.history.replaceState({}, '', url);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('pdfId');
    window.history.replaceState({}, '', url);
  };

  const updateAnnotations = (id, annotations) => {
    setPdfs((prev) => prev.map((p) => (p.id === id ? { ...p, annotations } : p)));
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors">
      <Navbar theme={theme} setTheme={setTheme} primary={primary} setPrimary={setPrimary} />
      <HeroSplineCover />
      <main className="relative z-10">{/* keep above spline scene visually */}
        <Dashboard
          pdfs={pdfs}
          setPdfs={setPdfs}
          upsertPdf={upsertPdf}
          removePdf={removePdf}
          openViewer={openViewer}
        />
      </main>
      <PdfViewerModal
        open={viewerOpen}
        onClose={closeViewer}
        pdf={activePdf}
        onUpdateAnnotations={(ann) => activePdf && updateAnnotations(activePdf.id, ann)}
      />
    </div>
  );
}

export default App;
