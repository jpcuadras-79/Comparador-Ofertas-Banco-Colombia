import React, { useState } from 'react';
import { KeyRound, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { UserSession } from '../types';

interface Props {
  user: UserSession;
  onPasswordChanged: (updatedUser: UserSession) => void;
}

export const ChangePasswordModal: React.FC<Props> = ({ user, onPasswordChanged }) => {
  const [nuevaClave, setNuevaClave] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasMinLength = nuevaClave.length >= 8;
  const hasNumber = /\d/.test(nuevaClave);
  const passwordsMatch = nuevaClave.length > 0 && nuevaClave === confirmarClave;
  const isValid = hasMinLength && hasNumber && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!hasMinLength || !hasNumber) {
      setErrorMsg('La contraseña debe tener mínimo 8 caracteres y al menos un número.');
      return;
    }

    if (nuevaClave !== confirmarClave) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/cambiar-clave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claveNueva: nuevaClave }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al actualizar la contraseña.');
      }

      onPasswordChanged(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            Cambio de contraseña requerido
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hola <strong>{user.nombreCompleto}</strong>. Por política de seguridad institucional, debes establecer una contraseña personal antes de continuar.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nueva contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={nuevaClave}
                onChange={(e) => setNuevaClave(e.target.value)}
                placeholder="Mínimo 8 caracteres y 1 número"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={confirmarClave}
                onChange={(e) => setConfirmarClave(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Validation Checklist */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  hasMinLength ? 'text-emerald-600' : 'text-slate-300'
                }`}
              />
              <span className={hasMinLength ? 'text-emerald-700 font-medium' : ''}>
                Mínimo 8 caracteres
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  hasNumber ? 'text-emerald-600' : 'text-slate-300'
                }`}
              />
              <span className={hasNumber ? 'text-emerald-700 font-medium' : ''}>
                Al menos un número (0-9)
              </span>
            </div>
            {confirmarClave.length > 0 && (
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${
                    passwordsMatch ? 'text-emerald-600' : 'text-slate-300'
                  }`}
                />
                <span className={passwordsMatch ? 'text-emerald-700 font-medium' : ''}>
                  Las contraseñas coinciden
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Actualizando...</span>
              </>
            ) : (
              <span>Guardar contraseña y continuar</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
