import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

export default function HeroSplineCover() {
  return (
    <section id="home" className="relative h-[70vh] min-h-[520px] w-full">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/zhZFnwyOYLgqlLWk/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/90 dark:from-zinc-950/40 dark:via-zinc-950/20 dark:to-zinc-950/90 pointer-events-none" />
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col items-start justify-center gap-6">
        <motion.h1 initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 16 }} className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Manage PDFs beautifully
        </motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.05, type: 'spring', stiffness: 120, damping: 16 }} className="text-base md:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl">
          Upload, organize, annotate, and share your documents with live customization, fluid animations, and a modern responsive design.
        </motion.p>
        <div className="flex items-center gap-3">
          <button className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[--color-primary] text-white shadow hover:shadow-md transition-shadow">
            Get Started
          </button>
          <button className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
