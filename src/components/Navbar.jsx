import { useEffect, useState } from 'react';
import { Home, Star, Settings, User, Moon, Sun, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar({ theme, setTheme, primary, setPrimary }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur bg-white/60 dark:bg-zinc-900/50 border-b border-zinc-200/60 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div initial={{ rotate: -10, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            className="h-9 w-9 rounded-md bg-[--color-primary] shadow ring-1 ring-black/5 flex items-center justify-center text-white">
            <Share2 size={18} />
          </motion.div>
          <div className="font-semibold tracking-tight">Pulsar PDFs</div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a className="group inline-flex items-center gap-2 hover:text-[--color-primary] transition-colors" href="#home"><Home size={16} /><span>Home</span><span className="block h-[2px] rounded bg-[--color-primary] w-0 group-hover:w-full transition-all" /></a>
          <a className="group inline-flex items-center gap-2 hover:text-[--color-primary] transition-colors" href="#favorites"><Star size={16} /><span>Favorites</span><span className="block h-[2px] rounded bg-[--color-primary] w-0 group-hover:w-full transition-all" /></a>
          <a className="group inline-flex items-center gap-2 hover:text-[--color-primary] transition-colors" href="#settings"><Settings size={16} /><span>Settings</span><span className="block h-[2px] rounded bg-[--color-primary] w-0 group-hover:w-full transition-all" /></a>
        </nav>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-9 w-9 grid place-items-center rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {mounted && theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <input
              aria-label="Primary color"
              title="Primary color"
              type="color"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="h-9 w-9 p-1 rounded-md border border-zinc-200 dark:border-zinc-700 cursor-pointer"
            />
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[--color-primary]/90 to-pink-500/90 ring-1 ring-black/5 text-white grid place-items-center">
            <User size={16} />
          </div>
        </div>
      </div>
    </header>
  );
}
