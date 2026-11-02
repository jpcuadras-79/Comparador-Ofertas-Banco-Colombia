import React, { useEffect, useState } from 'react';
import { Loader2, FileSearch, ShieldCheck, Cpu, CheckCircle } from 'lucide-react';

const STEPS = [
  { icon: FileSearch, text: 'Leyendo documentos PDF originales...' },
  { icon: Cpu, text: 'Extrayendo coberturas, deducibles y exclusiones...' },
  { icon: ShieldCheck, text: 'Validando cumplimiento obligatorio y presupuesto...' },
  { icon: CheckCircle, text: 'Elaborando recomendación técnica y mensaje WhatsApp...' },
];

export const LoadingIndicator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-blue-200 shadow-md p-8 sm:p-10 text-center max-w-xl mx-auto my-8">
      <div className="relative inline-flex items-center justify-center mb-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">
        Analizando propuestas...
      </h3>
      <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
        Gemini 3.8 Flash está examinando minuciosamente cada póliza para contrastar condiciones y calcular el semáforo de idoneidad.
      </p>

      {/* Progress Steps */}
      <div className="space-y-3 text-left max-w-sm mx-auto">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2.5 rounded-lg text-xs transition-all ${
                isCurrent
                  ? 'bg-blue-50 border border-blue-200 text-blue-900 font-semibold shadow-xs'
                  : isDone
                  ? 'text-slate-600 font-medium'
                  : 'text-slate-400 opacity-60'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  isDone
                    ? 'bg-emerald-100 text-emerald-700'
                    : isCurrent
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <span className="flex-1">{step.text}</span>
              {isCurrent && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
