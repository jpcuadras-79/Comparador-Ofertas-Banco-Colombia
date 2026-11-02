import React from 'react';
import { AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-6 border-t border-slate-200 bg-slate-50 text-slate-600 text-center text-xs">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="font-medium text-slate-700">
          Borrador generado con IA. Debe ser validado por un asesor contra las condiciones reales de la póliza. No suba datos reales de clientes.
        </p>
      </div>
      <p className="text-[11px] text-slate-400 mt-2">
        Banco de Colombia · Herramienta interna de asistencia al asesor
      </p>
    </footer>
  );
};
