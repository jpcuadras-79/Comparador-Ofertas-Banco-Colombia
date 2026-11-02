import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ProposalUploader } from './components/ProposalUploader';
import { ClientProfileForm } from './components/ClientProfileForm';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ComparisonTable } from './components/ComparisonTable';
import { RecommendationCard } from './components/RecommendationCard';
import { WhatsAppCard } from './components/WhatsAppCard';
import { LoginScreen } from './components/LoginScreen';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { Footer } from './components/Footer';
import { ProposalFile, ClientProfile, ComparisonResponse, UserSession } from './types';
import { Sparkles, ArrowRight, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

const LAURA_PRESET: ClientProfile = {
  clientName: 'Laura Solís Vargas',
  vehicle: 'Toyota Corolla XEi 2022, uso particular',
  maxBudget: 400000,
  mandatoryCoverages: ['colisión', 'robo', 'asistencia vial 24/7', 'fenómenos naturales'],
  priorities: 'Requiere protección ante lluvias e inundaciones en su zona y asistencia vial 24/7 garantizada. Presupuesto límite de ₡ 400.000 anual, evaluando si el valor justifica un excedente.',
  paymentMethod: 'Anual de contado',
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [proposals, setProposals] = useState<ProposalFile[]>([]);
  const [profile, setProfile] = useState<ClientProfile>(LAURA_PRESET);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Check existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/yo');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (err) {
        console.error('Error verificando sesión:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setCurrentUser(null);
      setResult(null);
      setProposals([]);
    }
  };

  const handleAddProposal = (file: ProposalFile) => {
    setProposals((prev) => [...prev, file]);
    setError(null);
  };

  const handleRemoveProposal = (id: string) => {
    setProposals((prev) => prev.filter((p) => p.id !== id));
  };

  const handleLoadSamples = async () => {
    setIsLoadingSamples(true);
    setError(null);
    try {
      const res = await fetch('/api/sample-proposals');
      if (res.status === 401) {
        setCurrentUser(null);
        return;
      }
      if (!res.ok) {
        throw new Error('No se pudieron obtener las propuestas de ejemplo.');
      }
      const data = await res.json();
      if (data.samples && Array.isArray(data.samples)) {
        const sampleProposals: ProposalFile[] = data.samples.map((s: any) => ({
          id: s.id,
          name: s.filename,
          displayName: s.displayName,
          size: s.size,
          dataBase64: s.dataBase64,
          mimeType: s.mimeType,
          isSample: true,
        }));
        setProposals(sampleProposals);
        setProfile(LAURA_PRESET);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error cargando las cotizaciones de ejemplo.');
    } finally {
      setIsLoadingSamples(false);
    }
  };

  const handleCompare = async () => {
    setError(null);

    if (proposals.length === 0) {
      setError('Por favor carga al menos 1 propuesta en formato PDF (máximo 3).');
      return;
    }

    if (!profile.clientName.trim()) {
      setError('Por favor ingresa el nombre del cliente.');
      return;
    }

    if (profile.maxBudget === '' || Number(profile.maxBudget) <= 0) {
      setError('Por favor ingresa un presupuesto máximo anual en colones.');
      return;
    }

    setIsComparing(true);
    setResult(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposals: proposals.map((p) => ({
            name: p.name,
            dataBase64: p.dataBase64,
            mimeType: p.mimeType,
          })),
          profile: {
            ...profile,
            maxBudget: Number(profile.maxBudget),
          },
        }),
      });

      if (response.status === 401) {
        setCurrentUser(null);
        return;
      }

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Error al procesar la comparación.');
      }

      setResult(json.data);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error inesperado al analizar las propuestas con Gemini.');
    } finally {
      setIsComparing(false);
    }
  };

  const handleNewComparison = () => {
    setResult(null);
    setError(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900 relative">
      {currentUser.debeCambiarClave && (
        <ChangePasswordModal
          user={currentUser}
          onPasswordChanged={(updated) => setCurrentUser(updated)}
        />
      )}

      <Header user={currentUser} onLogout={handleLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" ref={formRef}>
        {/* Banner with prompt guidelines summary */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-blue-900/50">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold">
              Flujo de Trabajo del Asesor
            </span>
            <p className="text-sm text-slate-200">
              1. Carga las cotizaciones PDF &rarr; 2. Define el perfil &rarr; 3. La IA analiza primas, deducibles, asistencias y semáforo.
            </p>
          </div>
          {proposals.length === 0 && (
            <button
              type="button"
              onClick={handleLoadSamples}
              disabled={isLoadingSamples}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Probar con caso Laura Solís</span>
            </button>
          )}
        </div>

        {/* Section 1: Proposals */}
        <ProposalUploader
          proposals={proposals}
          onAddProposal={handleAddProposal}
          onRemoveProposal={handleRemoveProposal}
          onLoadSamples={handleLoadSamples}
          isLoadingSamples={isLoadingSamples}
        />

        {/* Section 2: Client Profile */}
        <ClientProfileForm
          profile={profile}
          onChange={setProfile}
          onFillPreset={() => setProfile(LAURA_PRESET)}
        />

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Revisa los datos antes de continuar:</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Compare Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={handleCompare}
            disabled={isComparing || proposals.length === 0}
            className={`w-full sm:w-auto min-w-[320px] py-4 px-8 rounded-xl text-base font-extrabold text-white transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer ${
              isComparing || proposals.length === 0
                ? 'bg-slate-400 cursor-not-allowed opacity-80'
                : 'bg-blue-900 hover:bg-blue-800 active:scale-[0.99] shadow-blue-950/20 hover:shadow-xl hover:shadow-blue-900/30'
            }`}
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Comparar propuestas</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Loading Indicator */}
        {isComparing && <LoadingIndicator />}

        {/* Section 3: Results */}
        {result && (
          <div ref={resultsRef} className="space-y-8 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-300">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-md bg-blue-100 text-blue-800 text-base font-bold flex items-center justify-center">
                    3
                  </span>
                  Resultado de la Comparación
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Análisis consolidado para <strong>{profile.clientName}</strong> · Presupuesto anual: ₡ {Number(profile.maxBudget).toLocaleString('es-CR')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleNewComparison}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Nueva comparación</span>
                </button>
              </div>
            </div>

            {/* Comparison Table */}
            <ComparisonTable insurers={result.aseguradoras} maxBudget={profile.maxBudget} />

            {/* Boxes below table: Recommendation and WhatsApp message */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <RecommendationCard recommendation={result.recomendacionPreliminar} />
              <WhatsAppCard message={result.mensajeWhatsApp} clientName={profile.clientName} />
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pb-6">
              <button
                type="button"
                onClick={handleNewComparison}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Nueva comparación</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
