import { motion } from 'framer-motion';

const TONES = {
  life: 'bg-[#FB2C33] text-white [text-shadow:0_2px_0_rgba(120,10,16,0.45)]',
  boll: 'bg-[#FEECC2] text-[#3A2A0E]',
  fact: 'bg-[#FAD278] text-[#3A2A0E]',
  key: 'bg-[#E8E26F] text-[#3A2A0E]',
  power: 'bg-gradient-to-b from-[#FFE98F] to-[#FFC63C] text-[#3A2A0E]',
  score: 'bg-[#FED67E] text-[#3A2A0E]',
};

export default function StatChip({ tone = 'boll', icon, value, title, pulse = false }) {
  return (
    <span
      title={title}
      className={`flex h-8 items-center gap-1.5 rounded-full border-2 border-[#E9C98A] py-0.5 pl-0.5 pr-3 font-display text-[13px] font-extrabold tabular-nums shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)] sm:h-9 sm:pr-3.5 sm:text-[15px] ${TONES[tone]}`}
    >
      <motion.span
        className="-my-1 -ml-1 flex h-9 w-9 shrink-0 items-center justify-center sm:h-11 sm:w-11"
        animate={pulse ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={pulse ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
      >
        {icon}
      </motion.span>
      <motion.span
        key={String(value)}
        initial={{ scale: 1.4, opacity: 0.3 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 460, damping: 20 }}
        className="min-w-[1.5ch] text-center leading-none"
      >
        {value}
      </motion.span>
    </span>
  );
}