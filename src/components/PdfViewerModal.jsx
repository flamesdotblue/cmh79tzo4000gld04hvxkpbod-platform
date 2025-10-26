import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Highlighter, MousePointer, Search, Download } from 'lucide-react';

export default function PdfViewerModal({ open, onClose, pdf, onUpdateAnnotations }) {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [tool, setTool] = useState('pointer'); // pointer | highlight
  const [zoom, setZoom] = useState(1);
  const [drawing, setDrawing] = useState(null);
  const [ann, setAnn] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (pdf?.annotations) setAnn(pdf.annotations);
  }, [pdf]);

  useEffect(() => {
    if (!open) {
      setTool('pointer');
      setZoom(1);
      setDrawing(null);
      setSearchQuery('');
    }
  }, [open]);

  const startDraw = (e) => {
    if (tool !== 'highlight' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setDrawing({ x, y, w: 0, h: 0, color: '#fbbf24', id: crypto.randomUUID(), note: '' });
  };

  const onMove = (e) => {
    if (!drawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = (e.clientX - rect.left) / rect.width - drawing.x;
    const h = (e.clientY - rect.top) / rect.height - drawing.y;
    setDrawing({ ...drawing, w, h });
  };

  const endDraw = () => {
    if (!drawing) return;
    const normalized = { ...drawing, w: Math.abs(drawing.w), h: Math.abs(drawing.h), x: Math.min(drawing.x, drawing.x + drawing.w), y: Math.min(drawing.y, drawing.y + drawing.h) };
    const minSize = 0.01;
    if (normalized.w > minSize && normalized.h > minSize) {
      const next = [...ann, normalized];
      setAnn(next);
      onUpdateAnnotations?.(next);
    }
    setDrawing(null);
  };

  const removeAnn = (id) => {
    const next = ann.filter((a) => a.id !== id);
    setAnn(next);
    onUpdateAnnotations?.(next);
  };

  const handleFind = (e) => {
    e.preventDefault();
    if (!iframeRef.current?.contentWindow || !searchQuery) return;
    try {
      // Use built-in browser find within PDF viewer (same-origin blob/data URLs)
      iframeRef.current.contentWindow.find(searchQuery);
    } catch {}
  };

  const iframeStyle = useMemo(() => ({ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100 / zoom}%`, height: `${100 / zoom}%` }), [zoom]);

  return (
    <AnimatePresence>
      {open && pdf && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 18 }} className="relative w-full max-w-6xl h-[80vh] bg-white dark:bg-zinc-950 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="h-9 px-3 rounded-md bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 inline-flex items-center gap-2"><X size={16} />Close</button>
                <a href={pdf.dataUrl} download={pdf.filename} className="h-9 px-3 rounded-md bg-[--color-primary] text-white inline-flex items-center gap-2"><Download size={16} />Download</a>
              </div>
              <div className="flex items-center gap-2">
                <form onSubmit={handleFind} className="hidden md:flex items-center gap-2 px-3 h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80">
                  <Search size={14} className="text-zinc-500" />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Find in PDF" className="bg-transparent text-sm outline-none" />
                </form>
                <div className="flex rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <button onClick={() => setTool('pointer')} className={`px-3 h-9 inline-flex items-center gap-2 ${tool === 'pointer' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}><MousePointer size={14} />Pointer</button>
                  <button onClick={() => setTool('highlight')} className={`px-3 h-9 inline-flex items-center gap-2 ${tool === 'highlight' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}><Highlighter size={14} />Highlight</button>
                </div>
                <div className="flex rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <button onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))} className="px-3 h-9 inline-flex items-center gap-2"><ZoomOut size={14} />{Math.round(zoom * 100)}%</button>
                  <button onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))} className="px-3 h-9 inline-flex items-center gap-2"><ZoomIn size={14} /></button>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 top-12">
              <div ref={containerRef} onMouseDown={startDraw} onMouseMove={onMove} onMouseUp={endDraw} className="relative w-full h-full overflow-auto bg-zinc-50 dark:bg-zinc-900">
                <div className="relative w-full h-full">
                  <iframe ref={iframeRef} title={pdf.name} src={pdf.dataUrl} className="absolute top-0 left-0 w-full h-full" style={iframeStyle} />
                  {/* annotation overlay */}
                  <div className="absolute inset-0 pointer-events-none" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100 / zoom}%`, height: `${100 / zoom}%` }}>
                    {ann.map((a) => (
                      <div key={a.id} className="absolute rounded pointer-events-auto group" style={{ left: `${a.x * 100}%`, top: `${a.y * 100}%`, width: `${a.w * 100}%`, height: `${a.h * 100}%`, background: `${a.color}55`, boxShadow: '0 0 0 1px rgba(0,0,0,.08) inset' }}>
                        <button onClick={() => removeAnn(a.id)} className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs">×</button>
                      </div>
                    ))}
                    {drawing && (
                      <div className="absolute rounded" style={{ left: `${Math.min(drawing.x, drawing.x + drawing.w) * 100}%`, top: `${Math.min(drawing.y, drawing.y + drawing.h) * 100}%`, width: `${Math.abs(drawing.w) * 100}%`, height: `${Math.abs(drawing.h) * 100}%`, background: '#fbbf2455', boxShadow: '0 0 0 1px rgba(0,0,0,.08) inset' }} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
