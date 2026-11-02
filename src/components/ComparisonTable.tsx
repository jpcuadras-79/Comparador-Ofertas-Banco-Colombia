import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Shield, Check, X } from 'lucide-react';
import { InsurerAnalysis } from '../types';

interface Props {
  insurers: InsurerAnalysis[];
  maxBudget: number | '';
}

export const ComparisonTable: React.FC<Props> = ({ insurers, maxBudget }) => {
  if (!insurers || insurers.length === 0) return null;

  const renderSemaforo = (color: string) => {
    const c = color.toLowerCase();
    if (c === 'verde') {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>VERDE · Apta</span>
        </div>
      );
    }
    if (c === 'amarillo') {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>AMARILLO · Excede</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
        <span>ROJO · No cumple</span>
      </div>
    );
  };

  const renderBooleanBadge = (val: boolean, text?: string) => {
    if (val) {
      return (
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>{text || 'Sí'}</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <X className="w-3.5 h-3.5 text-rose-600" />
        <span>{text || 'No'}</span>
      </div>
    );
  };

  // The 14 exact rows required by the prompt:
  const rows: { label: string; key: keyof InsurerAnalysis; isCustom?: boolean }[] = [
    { label: 'Prima anual', key: 'primaAnual' },
    { label: 'Cabe en presupuesto', key: 'cabeEnPresupuesto', isCustom: true },
    { label: 'Deducible colisión', key: 'deducibleColision' },
    { label: 'Deducible robo', key: 'deducibleRobo' },
    { label: 'RC daños a terceros', key: 'rcDanosTerceros' },
    { label: 'RC lesiones', key: 'rcLesiones' },
    { label: 'Asistencia vial 24/7', key: 'asistenciaVial247' },
    { label: 'Grúa', key: 'grua' },
    { label: 'Vehículo sustituto', key: 'vehiculoSustituto' },
    { label: 'Fenómenos naturales', key: 'fenomenosNaturales' },
    { label: 'Rotura de cristales', key: 'roturaCristales' },
    { label: 'Exclusiones destacadas', key: 'exclusionesDestacadas' },
    { label: 'Cumple obligatorias', key: 'cumpleObligatorias', isCustom: true },
    { label: 'Semáforo', key: 'semaforo', isCustom: true },
  ];

  return (
    <div className="overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-slate-900 text-white divide-x divide-slate-800">
              <th className="py-4 px-4 sm:px-6 w-1/4 text-xs font-bold uppercase tracking-wider text-slate-300">
                Concepto / Cobertura
              </th>
              {insurers.map((item, idx) => (
                <th
                  key={idx}
                  className="py-4 px-4 sm:px-6 text-sm font-bold tracking-tight text-white"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="font-extrabold text-white text-base">
                        {item.aseguradora}
                      </div>
                      {item.plan && (
                        <div className="text-xs text-blue-300 font-medium">
                          {item.plan}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400 font-normal mt-0.5 truncate max-w-[200px]">
                        {item.nombreArchivo}
                      </div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, rIdx) => {
              const isEven = rIdx % 2 === 0;
              const isSemaforoRow = row.key === 'semaforo';
              const isPrimaRow = row.key === 'primaAnual';

              return (
                <tr
                  key={row.key}
                  className={`transition-colors ${
                    isSemaforoRow
                      ? 'bg-blue-50/60 font-semibold'
                      : isEven
                      ? 'bg-white'
                      : 'bg-slate-50/70'
                  } hover:bg-blue-50/30`}
                >
                  {/* Row Header */}
                  <td className="py-3 px-4 sm:px-6 font-semibold text-slate-800 text-xs sm:text-sm border-r border-slate-200 w-1/4">
                    {row.label}
                  </td>

                  {/* Insurer columns */}
                  {insurers.map((ins, iIdx) => {
                    if (row.key === 'semaforo') {
                      return (
                        <td key={iIdx} className="py-3.5 px-4 sm:px-6 border-r border-slate-200 last:border-r-0">
                          {renderSemaforo(ins.semaforo)}
                        </td>
                      );
                    }

                    if (row.key === 'cabeEnPresupuesto') {
                      return (
                        <td key={iIdx} className="py-3 px-4 sm:px-6 text-xs sm:text-sm border-r border-slate-200 last:border-r-0">
                          <div className="space-y-1">
                            {renderBooleanBadge(
                              ins.cabeEnPresupuesto,
                              ins.cabeEnPresupuesto ? 'Sí, cabe' : 'No cabe'
                            )}
                            {ins.cabeEnPresupuestoTexto && (
                              <p className="text-[11px] text-slate-500">
                                {ins.cabeEnPresupuestoTexto}
                              </p>
                            )}
                          </div>
                        </td>
                      );
                    }

                    if (row.key === 'cumpleObligatorias') {
                      return (
                        <td key={iIdx} className="py-3 px-4 sm:px-6 text-xs sm:text-sm border-r border-slate-200 last:border-r-0">
                          <div className="space-y-1">
                            {renderBooleanBadge(
                              ins.cumpleObligatorias,
                              ins.cumpleObligatorias ? 'Cumple todas' : 'No cumple'
                            )}
                            {ins.cumpleObligatoriasTexto && (
                              <p className="text-[11px] text-slate-500">
                                {ins.cumpleObligatoriasTexto}
                              </p>
                            )}
                          </div>
                        </td>
                      );
                    }

                    const rawVal = ins[row.key];
                    const displayVal =
                      rawVal === undefined || rawVal === null || rawVal === ''
                        ? 'no indicado'
                        : String(rawVal);

                    return (
                      <td
                        key={iIdx}
                        className={`py-3 px-4 sm:px-6 text-xs sm:text-sm border-r border-slate-200 last:border-r-0 text-slate-700 leading-relaxed ${
                          isPrimaRow ? 'font-bold text-slate-900 text-sm sm:text-base text-blue-900' : ''
                        }`}
                      >
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
        <span className="font-semibold text-slate-700">Criterio del Semáforo Banco de Colombia:</span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <strong>Verde:</strong> Cabe en presupuesto y cumple obligatorias
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <strong>Amarillo:</strong> Cumple obligatorias pero excede presupuesto
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <strong>Rojo:</strong> No cumple coberturas obligatorias
          </span>
        </div>
      </div>
    </div>
  );
};
