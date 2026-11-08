import { Check, ExternalLink } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function ReferenceCard({ item }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[26px] border-[3px] border-[#1B120C] bg-[#FFFDF7] shadow-[0_7px_0_#1B120C]">
      <div className="relative">
        <Image
          src={item.image}
          alt={`Estudo de direção visual: ${item.label}`}
          className="block aspect-[16/9] w-full border-b-[3px] border-[#1B120C] object-cover"
        />
        {item.adopted && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border-[3px] border-[#1B120C] bg-[#3DBE4F] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_3px_0_#1B120C]">
            <Check className="h-3.5 w-3.5" />
            Direção adotada
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-extrabold leading-tight text-[#1B120C]">{item.label}</h3>
        <p className="mt-1 text-[13px] font-semibold text-[#8A7452]">{item.subtitle}</p>

        <ul className="mt-4 space-y-2">
          {item.notes.map((note) => (
            <li key={note} className="flex gap-2 text-[13px] font-semibold leading-snug text-[#4A4033]">
              <span className="mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full border-2 border-[#1B120C] bg-[#FFD23F]" />
              {note}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-5">
          <a
            href={item.reference.url}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center justify-between gap-2 rounded-2xl border-[3px] border-[#1B120C] bg-[#E8F6FF] px-3 py-2 text-[12px] font-extrabold text-[#1B120C] shadow-[0_3px_0_#1B120C] transition active:translate-y-[2px] active:shadow-none"
          >
            <span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-[#5B7A8B]">
                Referência
              </span>
              {item.reference.game}
            </span>
            <ExternalLink className="h-4 w-4 shrink-0" />
          </a>
          <p className="mt-2 text-[11px] font-semibold text-[#8A7C63]">{item.reference.studio}</p>
        </div>
      </div>
    </article>
  );
}