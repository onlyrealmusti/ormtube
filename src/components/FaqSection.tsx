import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ShieldCheck, Zap, Smartphone, Music } from 'lucide-react';
import { Language } from '../types';
import { getT } from '../utils/translations';

interface FaqSectionProps {
  lang: Language;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ lang }) => {
  const t = getT(lang);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    { q: t.faq1Q, a: t.faq1A, icon: Zap },
    { q: t.faq2Q, a: t.faq2A, icon: Music },
    { q: t.faq3Q, a: t.faq3A, icon: ShieldCheck },
    { q: t.faq4Q, a: t.faq4A, icon: Smartphone },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mt-14 mb-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center justify-center gap-2.5">
          <HelpCircle className="w-6 h-6 text-zinc-300" />
          <span>{t.faqTitle}</span>
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1.5">
          {lang === 'de' ? 'Häufig gestellte Fragen zu ORMTube Audio-Qualität, Formaten und Bitraten' : 'Frequently asked questions about ORMTube audio quality, formats and bitrates'}
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          const Icon = faq.icon;

          return (
            <div
              key={idx}
              className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-850 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white border border-zinc-800 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-white tracking-tight">{faq.q}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-white shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 font-mono whitespace-pre-line border-t border-zinc-800 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
