import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { UserSession } from '../types';

interface Props {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = usuario.trim().toLowerCase();
    if (!cleanUser || !contrasena) {
      setErrorMessage('Por favor ingrese su usuario y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: cleanUser, contrasena }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Enforce exact clear messages required
        if (data.error && data.error.includes('suspendido')) {
          setErrorMessage('usuario suspendido, contacte al administrador');
        } else {
          setErrorMessage('usuario o contraseña incorrectos');
        }
        return;
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage('Error de conexión con el servidor. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-950 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <span className="block text-xs font-bold uppercase tracking-widest text-blue-400">
            Banco de Colombia
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Comparador de Propuestas · Banco de Colombia
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Ingreso al sistema interno para asesores y administradores
          </p>
        </div>

        {/* Card */}
        <div className="bg-white text-slate-900 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-200">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="capitalize-first">{errorMessage}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="usuario"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  autoComplete="username"
                  required
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="admin o nombre de asesor"
                  className="block w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Nombre corto de usuario asignado por el administrador
              </p>
            </div>

            <div>
              <label
                htmlFor="contrasena"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="contrasena"
                  name="contrasena"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Entrar</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick initial credentials helper for users testing the system */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Credenciales iniciales del sistema:
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
              <span>Usuario: <strong className="text-blue-900">admin</strong></span>
              <span>•</span>
              <span>Clave: <strong className="text-blue-900">Fundepos2026*</strong></span>
            </div>
          </div>
        </div>

        {/* Footer notice */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Acceso restringido para personal autorizado de Banco de Colombia.
        </p>
      </div>
    </div>
  );
};
