import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
}

export function FloatingActionButton({ onClick, label = 'Nova Tarefa' }: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.4 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fab fixed bottom-28 right-5 z-50"
      style={{ boxShadow: '0 0 40px rgba(52, 211, 153, 0.3)' }}
    >
      <Plus className="w-6 h-6 text-obsidian-950" strokeWidth={2.5} />

      <motion.div
        className="absolute inset-0 rounded-2xl border border-mint-400/30"
        animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl border border-mint-400/20"
        animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 0, x: -10 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-surface-elevated px-3 py-1.5 rounded-xl border border-white/10 whitespace-nowrap pointer-events-none"
      >
        <span className="text-xs font-medium text-white">{label}</span>
      </motion.div>
    </motion.button>
  );
}
