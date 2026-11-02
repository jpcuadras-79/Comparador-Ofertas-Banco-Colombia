import React from 'react';
import { Award, FileSignature } from 'lucide-react';

interface Props {
  recommendation: string;
}

export const RecommendationCard: React.FC<Props> = ({ recommendation }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 transition-all relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800" />
      
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Recomendación preliminar (borrador)
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Análisis técnico para el Asesor de Seguros
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <FileSignature className="w-3.5 h-3.5" />
          Borrador IA
        </span>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
        {recommendation}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Evaluada según prioridades, montos y límites de póliza</span>
        <span className="italic">Máximo 5 líneas</span>
      </div>
    </div>
  );
};
