import React from 'react';
import { User, Car, DollarSign, CheckSquare, AlignLeft, CreditCard, RotateCcw } from 'lucide-react';
import { ClientProfile } from '../types';

interface Props {
  profile: ClientProfile;
  onChange: (updated: ClientProfile) => void;
  onFillPreset: () => void;
}

const MANDATORY_OPTIONS = [
  { id: 'colisión', label: 'Colisión y vuelco' },
  { id: 'robo', label: 'Robo total y parcial' },
  { id: 'asistencia vial 24/7', label: 'Asistencia vial 24/7' },
  { id: 'fenómenos naturales', label: 'Fenómenos naturales (inundación, etc.)' },
  { id: 'vehículo sustituto', label: 'Vehículo sustituto' },
];

const PAYMENT_OPTIONS = [
  'Anual de contado',
  'Mensual en cuotas',
  'Semestral (2 cuotas)',
  'Cualquiera / Indiferente',
];

export const ClientProfileForm: React.FC<Props> = ({ profile, onChange, onFillPreset }) => {
  const handleTextChange = (field: keyof ClientProfile, value: string | number) => {
    onChange({
      ...profile,
      [field]: value,
    });
  };

  const toggleCoverage = (id: string) => {
    const current = profile.mandatoryCoverages || [];
    const updated = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    onChange({
      ...profile,
      mandatoryCoverages: updated,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center">
              2
            </span>
            Perfil del cliente
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ingresa las necesidades del asegurado para validar presupuesto y coberturas obligatorias.
          </p>
        </div>

        <button
          type="button"
          onClick={onFillPreset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer self-start sm:self-auto"
          title="Autocompletar datos del cliente con el caso de prueba Laura Solís"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Llenar datos de Laura Solís</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Nombre del cliente */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            Nombre del cliente
          </label>
          <input
            type="text"
            value={profile.clientName}
            onChange={(e) => handleTextChange('clientName', e.target.value)}
            placeholder="Ej. Laura Solís Vargas"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder:text-slate-400"
          />
        </div>

        {/* Vehículo y uso */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-blue-600" />
            Vehículo y uso
          </label>
          <input
            type="text"
            value={profile.vehicle}
            onChange={(e) => handleTextChange('vehicle', e.target.value)}
            placeholder="Ej. Toyota Corolla XEi 2022, uso particular"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder:text-slate-400"
          />
        </div>

        {/* Presupuesto máximo anual */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              Presupuesto máximo anual (₡)
            </span>
            {profile.maxBudget !== '' && (
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                ₡ {Number(profile.maxBudget).toLocaleString('es-CR')}
              </span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold">₡</span>
            <input
              type="number"
              min="0"
              step="5000"
              value={profile.maxBudget}
              onChange={(e) =>
                handleTextChange('maxBudget', e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="400000"
              className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Coberturas obligatorias */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
          <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
          Coberturas obligatorias (para semáforo de cumplimiento)
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Selecciona las coberturas indispensables para el cliente. Si una propuesta no las incluye en la prima base (o cobra recargo), marcará incumplimiento (rojo).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {MANDATORY_OPTIONS.map((cov) => {
            const isChecked = profile.mandatoryCoverages.includes(cov.id);
            return (
              <label
                key={cov.id}
                className={`flex items-start gap-2.5 p-3 rounded-lg border transition-all cursor-pointer select-none text-xs ${
                  isChecked
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-semibold shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCoverage(cov.id)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="leading-snug">{cov.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Prioridades y Forma de pago */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 pt-4 border-t border-slate-100">
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-blue-600" />
            Prioridades del cliente
          </label>
          <textarea
            rows={2}
            value={profile.priorities}
            onChange={(e) => handleTextChange('priorities', e.target.value)}
            placeholder="Ej. Busca la mejor relación costo-beneficio, pero valora que la asistencia vial sea 24/7 y que cubra inundaciones por época lluviosa."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder:text-slate-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            Forma de pago preferida
          </label>
          <select
            value={profile.paymentMethod}
            onChange={(e) => handleTextChange('paymentMethod', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          >
            {PAYMENT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">Modalidad en que el asegurado planea liquidar</p>
        </div>
      </div>
    </div>
  );
};
