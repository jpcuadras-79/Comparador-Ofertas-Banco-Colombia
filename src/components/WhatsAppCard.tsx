import React, { useState } from 'react';
import { MessageSquare, Copy, Check, ExternalLink, Share2 } from 'lucide-react';

interface Props {
  message: string;
  clientName?: string;
}

export const WhatsAppCard: React.FC<Props> = ({ message, clientName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 transition-all relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Mensaje sugerido para el cliente (WhatsApp)
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {clientName ? `Para: ${clientName} · Tono cordial sin tecnicismos` : 'Tono cordial sin tecnicismos'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Mensaje copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar mensaje</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
            title="Compartir vía WhatsApp Web o App"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        </div>
      </div>

      {/* WhatsApp bubble mockup */}
      <div className="bg-[#EFEAE2] p-4 rounded-xl border border-slate-200/80 shadow-inner">
        <div className="max-w-xl bg-white rounded-lg rounded-tl-none p-3.5 shadow-sm text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line border border-slate-100 font-sans">
          {message}
          <div className="text-[10px] text-slate-400 text-right mt-1.5 select-none flex items-center justify-end gap-1">
            <span>Hoy</span>
            <span>✓✓</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Diseñado en máximo 8 líneas con recomendación, 2 razones y próximo paso</span>
        {copied && (
          <span className="text-emerald-600 font-medium animate-pulse">
            Copiado al portapapeles listo para enviar
          </span>
        )}
      </div>
    </div>
  );
};
