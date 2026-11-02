import React from 'react';
import { Shield, Building2, LogOut, UserCircle2 } from 'lucide-react';
import { UserSession } from '../types';

interface HeaderProps {
  user?: UserSession | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-blue-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Banco de Colombia
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Comparador de Propuestas · Banco de Colombia
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl pt-1">
              Compara propuestas de seguro de automóvil en minutos. La IA prepara, el asesor decide.
            </p>
          </div>

          {user && (
            <div className="flex items-center gap-3 bg-slate-800/80 p-2 sm:px-3.5 sm:py-2 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                  <UserCircle2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{user.nombreCompleto}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                        user.rol === 'administrador'
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
                      }`}
                    >
                      {user.rol}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">@{user.usuario}</div>
                </div>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 transition-colors cursor-pointer"
                  title="Cerrar sesión del sistema"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar sesión</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
